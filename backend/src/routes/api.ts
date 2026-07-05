import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  Cooperative,
  User,
  Transaction,
  LoanRequest,
  Opportunity,
} from '../models/index.js';
import {
  optionalAuth,
  requireAuth,
  requireAdmin,
  signToken,
  type AuthRequest,
} from '../middleware/auth.js';
import { buildGlobalState, getDefaultCooperative } from '../utils/stateBuilder.js';
import {
  generateFinancialTip,
  refreshOpportunities,
  analyzeOpportunity,
  probeGeminiConnection,
} from '../services/gemini.js';
import { scrapeRwandaFinanceSources } from '../services/firecrawl.js';
import type { Language } from '../types/index.js';
import { getDefaultAvatarUrl } from '../utils/avatar.js';

function isBootstrapAdminPhone(phone: string): boolean {
  const adminPhone = process.env.ADMIN_PHONE?.trim();
  return !!adminPhone && phone === adminPhone;
}

async function issueAuthResponse(userId: string, res: import('express').Response) {
  const token = signToken(userId);
  const state = await buildGlobalState(userId);
  res.json({ success: true, token, state });
}

const router = Router();

router.get('/state', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('GET /api/state error:', error);
    res.status(500).json({ error: 'Failed to load application state' });
  }
});

router.post('/language', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { language } = req.body as { language?: Language };
    const lang: Language = language === 'rw' ? 'rw' : 'en';

    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, { language: lang });
    } else {
      const coop = await getDefaultCooperative();
      coop.defaultLanguage = lang;
      await coop.save();
    }

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/language error:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

router.get('/ai/status', async (_req, res) => {
  try {
    const firecrawlKey = process.env.FIRECRAWL_API_KEY?.trim();
    const gemini = await probeGeminiConnection();

    res.json({
      gemini,
      firecrawl: {
        configured: !!firecrawlKey && firecrawlKey !== 'your-firecrawl-api-key',
        ok: !!firecrawlKey && firecrawlKey !== 'your-firecrawl-api-key',
        message:
          firecrawlKey && firecrawlKey !== 'your-firecrawl-api-key'
            ? 'FIRECRAWL_API_KEY is set'
            : 'FIRECRAWL_API_KEY is not set in backend/.env',
      },
    });
  } catch (error) {
    console.error('GET /api/ai/status error:', error);
    res.status(500).json({ error: 'Failed to check AI service status' });
  }
});

router.get('/auth/status', async (_req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    res.json({ hasAdmin: adminCount > 0 });
  } catch (error) {
    console.error('GET /api/auth/status error:', error);
    res.status(500).json({ error: 'Failed to check auth status' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, pin, name, mode } = req.body as {
      phone?: string;
      pin?: string;
      name?: string;
      mode?: 'login' | 'register';
    };

    if (!phone || !pin) {
      res.status(400).json({ error: 'Phone and PIN are required' });
      return;
    }

    const authMode = mode === 'register' ? 'register' : 'login';
    const coop = await getDefaultCooperative();
    const existing = await User.findOne({ phone });

    if (authMode === 'login') {
      if (!existing) {
        res.status(404).json({
          error: 'Account not found — register first or ask your committee / Konti ntabwo ibonetse — iyandikishe cyangwa ubaze komite',
        });
        return;
      }

      const valid = await bcrypt.compare(pin, existing.pinHash);
      if (!valid) {
        res.status(401).json({ error: "Incorrect PIN / Nomero y'ibanga si yo" });
        return;
      }

      await issueAuthResponse(existing._id.toString(), res);
      return;
    }

    if (existing) {
      res.status(409).json({
        error: 'Already registered — sign in instead / Wasanzwe wiyandikishije — injira',
      });
      return;
    }

    if (!name?.trim()) {
      res.status(400).json({ error: 'Name is required for registration / Izina rirakenewe' });
      return;
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    const role =
      adminCount === 0 && isBootstrapAdminPhone(phone.trim()) ? 'admin' : 'member';
    const memberName = name.trim();
    const pinHash = await bcrypt.hash(pin, 10);

    const user = await User.create({
      name: memberName,
      phone: phone.trim(),
      pinHash,
      role,
      cooperativeId: coop._id,
      cooperativeName: role === 'admin' ? `${coop.name} (Committee)` : coop.name,
      savingsBalance: 0,
      profileImage: getDefaultAvatarUrl(memberName),
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    });

    await issueAuthResponse(user._id.toString(), res);
  } catch (error) {
    console.error('POST /api/login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/login/admin', async (req, res) => {
  try {
    const { phone, pin } = req.body as { phone?: string; pin?: string };

    if (!phone || !pin) {
      res.status(400).json({ error: 'Phone and PIN are required' });
      return;
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      res.status(404).json({
        error: 'Committee account not found / Konti ya komite ntabwo ibonetse',
      });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({
        error: 'Not a committee account / Si konti ya komite',
      });
      return;
    }

    const valid = await bcrypt.compare(pin, user.pinHash);
    if (!valid) {
      res.status(401).json({ error: "Incorrect PIN / Nomero y'ibanga si yo" });
      return;
    }

    await issueAuthResponse(user._id.toString(), res);
  } catch (error) {
    console.error('POST /api/login/admin error:', error);
    res.status(500).json({ error: 'Committee login failed' });
  }
});

router.post('/add-member', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, phone, pin, role } = req.body as {
      name?: string;
      phone?: string;
      pin?: string;
      role?: 'member' | 'admin';
    };
    if (!name?.trim() || !phone?.trim() || !pin) {
      res.status(400).json({ error: 'Name, phone, and PIN are required' });
      return;
    }

    const memberRole = role === 'admin' ? 'admin' : 'member';

    const existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      res.status(409).json({ error: 'Phone number already registered / Telefone isanzwe ifite konti' });
      return;
    }

    const admin = await User.findById(req.userId);
    if (!admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const coop = await getDefaultCooperative();
    const pinHash = await bcrypt.hash(pin, 10);
    const memberName = name.trim();

    await User.create({
      name: memberName,
      phone: phone.trim(),
      pinHash,
      role: memberRole,
      cooperativeId: coop._id,
      cooperativeName: memberRole === 'admin' ? `${coop.name} (Committee)` : coop.name,
      savingsBalance: 0,
      profileImage: getDefaultAvatarUrl(memberName),
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    });

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/add-member error:', error);
    res.status(500).json({ error: 'Failed to register member' });
  }
});

router.post('/update-profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    user.name = name.trim();
    await user.save();

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/update-profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/logout', requireAuth, async (req: AuthRequest, res) => {
  const state = await buildGlobalState();
  state.currentUser = null;
  res.json({ success: true, state });
});

router.post('/save', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body as { amount?: number | string };
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      res.status(400).json({ error: 'Invalid amount / Umubare si wo' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    user.savingsBalance += val;
    await user.save();

    const coop = await Cooperative.findById(user.cooperativeId);
    if (coop) {
      coop.groupSavings += val;
      await coop.save();
    }

    await Transaction.create({
      externalId: `tx-${Date.now()}`,
      userId: user._id,
      cooperativeId: user.cooperativeId,
      date: new Date().toISOString().split('T')[0],
      type: 'saved',
      amount: val,
      runningBalance: user.savingsBalance,
      memberName: user.name,
      status: 'success',
    });

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/save error:', error);
    res.status(500).json({ error: 'Failed to save contribution' });
  }
});

router.post('/request-loan', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, reasonEn, reasonRw } = req.body as {
      amount?: number | string;
      reasonEn?: string;
      reasonRw?: string;
    };
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      res.status(400).json({ error: 'Invalid amount / Umubare si wo' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await LoanRequest.create({
      externalId: `loan-${Date.now()}`,
      userId: user._id,
      cooperativeId: user.cooperativeId,
      memberName: user.name,
      memberImage: user.profileImage,
      date: new Date().toISOString().split('T')[0],
      requestedAmount: val,
      reasonEn: reasonEn || 'Cooperative support',
      reasonRw: reasonRw || 'Gushyigikira umuryango',
      status: 'pending',
    });

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/request-loan error:', error);
    res.status(500).json({ error: 'Failed to submit loan request' });
  }
});

router.post('/approve-loan', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body as { id?: string };
    const loan = await LoanRequest.findOne({ externalId: id });
    if (!loan) {
      res.status(404).json({ error: 'Loan request not found' });
      return;
    }

    loan.status = 'approved';
    const reqDate = new Date(loan.date);
    reqDate.setDate(reqDate.getDate() + 30);
    loan.repaymentDueDate = reqDate.toISOString().split('T')[0];
    loan.repaid = false;
    await loan.save();

    const coop = await Cooperative.findById(loan.cooperativeId);
    if (coop) {
      coop.groupSavings -= loan.requestedAmount;
      coop.activeLoansCount += 1;
      coop.activeLoansAmount += loan.requestedAmount;
      await coop.save();
    }

    await Transaction.create({
      externalId: `tx-payout-${Date.now()}`,
      userId: loan.userId,
      cooperativeId: loan.cooperativeId,
      date: new Date().toISOString().split('T')[0],
      type: 'withdrew',
      amount: loan.requestedAmount,
      runningBalance: 0,
      memberName: loan.memberName,
      status: 'success',
    });

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/approve-loan error:', error);
    res.status(500).json({ error: 'Failed to approve loan' });
  }
});

router.post('/decline-loan', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body as { id?: string };
    const loan = await LoanRequest.findOne({ externalId: id });
    if (!loan) {
      res.status(404).json({ error: 'Loan request not found' });
      return;
    }

    loan.status = 'declined';
    await loan.save();

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/decline-loan error:', error);
    res.status(500).json({ error: 'Failed to decline loan' });
  }
});

router.post('/repay-loan', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body as { id?: string };
    const loan = await LoanRequest.findOne({ externalId: id });
    if (!loan) {
      res.status(404).json({ error: 'Loan request not found' });
      return;
    }

    loan.repaid = true;
    loan.repaidAmount = loan.requestedAmount;
    await loan.save();

    const coop = await Cooperative.findById(loan.cooperativeId);
    if (coop) {
      coop.groupSavings += loan.requestedAmount;
      coop.activeLoansCount = Math.max(0, coop.activeLoansCount - 1);
      coop.activeLoansAmount = Math.max(0, coop.activeLoansAmount - loan.requestedAmount);
      await coop.save();
    }

    const user = await User.findById(req.userId);

    await Transaction.create({
      externalId: `tx-repay-${Date.now()}`,
      userId: loan.userId,
      cooperativeId: loan.cooperativeId,
      date: new Date().toISOString().split('T')[0],
      type: 'repaid_loan',
      amount: loan.requestedAmount,
      runningBalance: user?.savingsBalance ?? 0,
      memberName: loan.memberName,
      status: 'success',
    });

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/repay-loan error:', error);
    res.status(500).json({ error: 'Failed to repay loan' });
  }
});

router.post('/update-profile-image', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { profileImage } = req.body as { profileImage?: string };
    if (!profileImage) {
      res.status(400).json({ error: 'Profile image is required' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    user.profileImage = profileImage;
    await user.save();

    await LoanRequest.updateMany(
      { userId: user._id },
      { memberImage: profileImage }
    );

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/update-profile-image error:', error);
    res.status(500).json({ error: 'Failed to update profile image' });
  }
});

router.post('/flag-opportunity', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body as { id?: string };
    const opp = await Opportunity.findOne({ externalId: id });
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    opp.isFlagged = !opp.isFlagged;
    await opp.save();

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/flag-opportunity error:', error);
    res.status(500).json({ error: 'Failed to flag opportunity' });
  }
});

router.post('/generate-tip', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const txs = await Transaction.find({ userId: user._id }).sort({ date: -1 });
    const txSummary = txs.map((t) => `${t.date}: ${t.type} ${t.amount} RWF`).join('\n');

    const tip = await generateFinancialTip(user.name, user.savingsBalance, txSummary);

    const coop = await Cooperative.findById(user.cooperativeId);
    if (coop) {
      coop.currentTip = tip;
      await coop.save();
    }

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/generate-tip error:', error);
    res.status(500).json({ error: 'Failed to generate tip' });
  }
});

router.post('/refresh-opportunities', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const coop = await getDefaultCooperative();
    const scrapeResult = await scrapeRwandaFinanceSources();
    const refreshResult = await refreshOpportunities(scrapeResult.context, coop.groupSavings);

    if (!refreshResult.ok) {
      const detail =
        scrapeResult.configured && scrapeResult.sourceCount > 0
          ? ` Firecrawl fetched ${scrapeResult.sourceCount} source(s), but Gemini could not curate them.`
          : scrapeResult.configured
            ? ' Firecrawl is configured but returned no usable content.'
            : ' Firecrawl key is missing, so only Gemini curation was attempted.';

      res.status(refreshResult.status).json({
        error: `${refreshResult.error}${detail}`,
        code: refreshResult.code,
      });
      return;
    }

    const list = refreshResult.opportunities;

    await Opportunity.deleteMany({ cooperativeId: user.cooperativeId });

    for (const item of list) {
      await Opportunity.create({
        externalId: item.id || `opp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        cooperativeId: user.cooperativeId,
        titleEn: item.titleEn,
        titleRw: item.titleRw,
        source: item.source,
        sourceUrl: item.sourceUrl || undefined,
        returnRate: item.returnRate,
        summaryEn: item.summaryEn,
        summaryRw: item.summaryRw,
        isFlagged: false,
        foundAgo: item.foundAgo,
        category: item.category,
        image: item.image,
      });
    }

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/refresh-opportunities error:', error);
    res.status(500).json({ error: 'Failed to refresh opportunities' });
  }
});

router.post('/analyze-opportunity', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body as { id?: string };
    const opp = await Opportunity.findOne({ externalId: id });
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    const coop = await getDefaultCooperative();
    const analysis = await analyzeOpportunity(
      {
        id: opp.externalId,
        titleEn: opp.titleEn,
        titleRw: opp.titleRw,
        source: opp.source,
        returnRate: opp.returnRate,
        summaryEn: opp.summaryEn,
        summaryRw: opp.summaryRw,
        isFlagged: opp.isFlagged,
        foundAgo: opp.foundAgo,
        category: opp.category,
      },
      coop.groupSavings
    );

    opp.aiAnalysisEn = analysis.aiAnalysisEn;
    opp.aiAnalysisRw = analysis.aiAnalysisRw;
    await opp.save();

    const state = await buildGlobalState(req.userId);
    res.json(state);
  } catch (error) {
    console.error('POST /api/analyze-opportunity error:', error);
    res.status(500).json({ error: 'Failed to analyze opportunity' });
  }
});

export default router;
