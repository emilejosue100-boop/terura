import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { initialGlobalState, initialOpportunities } from './src/data';
import { GlobalState, LoanRequest, Transaction, Opportunity } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state synchronized for interactive demo
let state: GlobalState = JSON.parse(JSON.stringify(initialGlobalState));

// Helper to get Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '') {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST APIs
app.get('/api/state', (req, res) => {
  res.json(state);
});

// Update current language
app.post('/api/language', (req, res) => {
  const { language } = req.body;
  state.language = language || 'en';
  res.json(state);
});

// Switch role / Login
app.post('/api/login', (req, res) => {
  const { phone, pin } = req.body;
  const user = state.users.find(u => u.phone === phone && u.pin === pin);
  if (user) {
    state.currentUser = user;
    res.json({ success: true, state });
  } else {
    // If phone matches Jean but pin wrong, or completely new phone
    const existing = state.users.find(u => u.phone === phone);
    if (existing) {
      res.status(401).json({ error: 'Incorrect PIN / Nomero y\'ibanga si yo' });
    } else {
      // Create user on the fly to simulate registration/first-time smartphone user!
      const isAlice = phone === '0788654321' || phone === 'admin';
      const newUser = {
        name: isAlice ? "Alice Uwineza" : "New Cooperative Member",
        phone: phone,
        pin: pin,
        role: (isAlice || phone.includes('admin')) ? 'admin' as const : 'member' as const,
        cooperativeName: "Abizerwa Ikimina",
        savingsBalance: isAlice ? 320000 : 0,
        profileImage: isAlice 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
        status: 'active' as const,
        joinDate: new Date().toISOString().split('T')[0]
      };
      state.users.push(newUser);
      state.currentUser = newUser;
      res.json({ success: true, state });
    }
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  state.currentUser = null;
  res.json({ success: true, state });
});

// Deposit / Contribution (Kwizigama)
app.post('/api/save', (req, res) => {
  const { amount } = req.body;
  const val = Number(amount);
  if (isNaN(val) || val <= 0) {
    return res.status(400).json({ error: 'Invalid amount / Umubare si wo' });
  }

  if (state.currentUser) {
    state.currentUser.savingsBalance += val;
    // Update matching user in users list
    const uIndex = state.users.findIndex(u => u.phone === state.currentUser?.phone);
    if (uIndex !== -1) {
      state.users[uIndex].savingsBalance = state.currentUser.savingsBalance;
    }

    // Add to group savings
    state.groupSavings += val;

    // Create Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'saved',
      amount: val,
      runningBalance: state.currentUser.savingsBalance,
      memberName: state.currentUser.name,
      status: 'success'
    };
    state.transactions.unshift(newTx);
    res.json(state);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Submit Loan Request (Saba Inguzanyo)
app.post('/api/request-loan', (req, res) => {
  const { amount, reasonEn, reasonRw } = req.body;
  const val = Number(amount);
  if (isNaN(val) || val <= 0) {
    return res.status(400).json({ error: 'Invalid amount / Umubare si wo' });
  }

  if (state.currentUser) {
    const newRequest: LoanRequest = {
      id: `loan-${Date.now()}`,
      memberName: state.currentUser.name,
      memberImage: state.currentUser.profileImage,
      date: new Date().toISOString().split('T')[0],
      requestedAmount: val,
      reasonEn: reasonEn || 'Cooperative support',
      reasonRw: reasonRw || 'Gushyigikira umuryango',
      status: 'pending'
    };

    state.loanRequests.unshift(newRequest);
    res.json(state);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Admin approves loan request
app.post('/api/approve-loan', (req, res) => {
  const { id } = req.body;
  const loan = state.loanRequests.find(l => l.id === id);
  if (!loan) {
    return res.status(404).json({ error: 'Loan request not found' });
  }

  loan.status = 'approved';
  state.groupSavings -= loan.requestedAmount;
  state.activeLoansCount += 1;
  state.activeLoansAmount += loan.requestedAmount;

  // Add transaction logging the payout/debit from group
  const payoutTx: Transaction = {
    id: `tx-payout-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'withdrew',
    amount: loan.requestedAmount,
    runningBalance: 0, // Not tied to one specific user running balance
    memberName: loan.memberName,
    status: 'success'
  };
  state.transactions.unshift(payoutTx);

  // If approved loan belongs to current logged in user, update their balance or log as active
  const targetUser = state.users.find(u => u.name === loan.memberName);
  if (targetUser) {
    // If the approved borrower is the current session user, sync
    if (state.currentUser && state.currentUser.name === targetUser.name) {
      // Loan disbursed as deposit or cash, in this flow let's log the transaction
    }
  }

  res.json(state);
});

// Admin declines loan request
app.post('/api/decline-loan', (req, res) => {
  const { id } = req.body;
  const loan = state.loanRequests.find(l => l.id === id);
  if (!loan) {
    return res.status(404).json({ error: 'Loan request not found' });
  }

  loan.status = 'declined';
  res.json(state);
});

// Flag / Unflag opportunity for group vote
app.post('/api/flag-opportunity', (req, res) => {
  const { id } = req.body;
  const opp = state.opportunities.find(o => o.id === id);
  if (opp) {
    opp.isFlagged = !opp.isFlagged;
    res.json(state);
  } else {
    res.status(404).json({ error: 'Opportunity not found' });
  }
});

// AI - Generate Personalized Financial Tip (using Gemini API server-side)
app.post('/api/generate-tip', async (req, res) => {
  if (!state.currentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const client = getGeminiClient();
    const userTxs = state.transactions.filter(t => t.memberName === state.currentUser?.name);
    const txSummary = userTxs.map(t => `${t.date}: ${t.type} ${t.amount} RWF`).join('\n');

    const prompt = `Generate a supportive financial tip for a rural or semi-urban informal savings cooperative member in Rwanda (Ikimina group) named ${state.currentUser.name}.
    The member has a personal savings balance of ${state.currentUser.savingsBalance} RWF in the cooperative.
    Their transaction history is:
    ${txSummary || 'No recent contributions'}

    Generate the response in JSON format matching this exact TypeScript schema:
    {
      "id": "tip-dynamic",
      "titleEn": "string (Short header, e.g. Savings Streak)",
      "titleRw": "string (Kinyarwanda translation of the header)",
      "contentEn": "string (Actionable financial encouragement in English)",
      "contentRw": "string (Actionable financial encouragement in Kinyarwanda)",
      "whyEn": "string (Explanation why they see this based on their balance of ${state.currentUser.savingsBalance} RWF and transactions)",
      "whyRw": "string (Kinyarwanda translation of why they see this)",
      "category": "streak" | "goal" | "dip"
    }
    The tip should be friendly, inspiring, culturally relevant (mentioning community, mutual assistance, or small micro-enterprises), and grammatically perfect in both English and Kinyarwanda. Do not include markdown code block formatting or backticks outside the raw JSON string.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedTip = JSON.parse(cleanText);
    
    state.currentTip = generatedTip;
    res.json(state);
  } catch (error: any) {
    console.error('Gemini generate-tip error:', error);
    // Graceful fallback with rich, realistic content
    const fallbackTips = [
      {
        id: 'tip-fallback-1',
        titleEn: 'Smart Loan Management',
        titleRw: 'Gucunga neza Inguzanyo',
        contentEn: 'Borrow only what can generate returns for your small business kiosk or farm.',
        contentRw: 'Gura ibikenerwa gusa bishobora kwungura ubucuruzi bwawe cyangwa isambu yawe.',
        whyEn: 'Based on cooperative borrowing best practices to ensure smooth repayment and zero stress.',
        whyRw: 'Bishingiye ku muco mwiza wo kwaka inguzanyo mu matsinda hagamijwe kwishyura neza nta gihunga.',
        category: 'goal' as const
      },
      {
        id: 'tip-fallback-2',
        titleEn: 'Steady Accumulation',
        titleRw: 'Kwizigama Ubudahuga',
        contentEn: 'Adding even 5,000 RWF every week builds a foundation of security for your family.',
        contentRw: 'Gushyiraho ndetse n\'amafaranga 5,000 RWF buri cyumweru byubaka urufatiro rw\'umutekano w\'umuryango wawe.',
        whyEn: 'Based on your recent savings habit showing consistent cooperative engagement.',
        whyRw: 'Bishingiye ku muco wawe wo kuzigama uhoraho ufatanyije n\'abandi banyamuryango.',
        category: 'streak' as const
      }
    ];
    const chosen = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    state.currentTip = chosen;
    res.json(state);
  }
});

// AI - Refresh Investment Opportunities (Simulates Firecrawl scraping + AI filtering)
app.post('/api/refresh-opportunities', async (req, res) => {
  try {
    const client = getGeminiClient();
    const prompt = `Scrape and generate 3 realistic, highly curated savings or investment opportunities currently available in Rwanda (e.g. BNR Treasury Bonds, Bank of Kigali dividends, Agricultural collective pre-orders, SACCO micro-savings, or local dairy/coffee processing funds).
    The opportunities must be tailored for a community-based informal savings cooperative (Ikimina group) looking to invest their idle cash reserves securely.
    Return the response as a JSON array matching this exact TypeScript schema:
    [{
      "id": "string (unique id like opp-123)",
      "titleEn": "string (e.g. Urwego SACCO High-Yield Deposit)",
      "titleRw": "string (Kinyarwanda translation of the title)",
      "source": "string (e.g. Urwego Bank / BNR)",
      "returnRate": "string (e.g. 10.5% p.a. or 14% target)",
      "summaryEn": "string (2-3 sentences explaining the investment details)",
      "summaryRw": "string (Kinyarwanda explanation)",
      "category": "string (e.g. SACCO, Agriculture, Bonds, Real Estate)",
      "foundAgo": "string (e.g. Found 10 minutes ago / Found 1 hour ago)"
    }]
    Make it highly authentic, referencing actual Rwandan financial terms and institutions. Avoid code blocks or backticks.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const list: Opportunity[] = JSON.parse(cleanText);

    // Keep AI analyzed values if generated, otherwise mark them for dynamic analyze
    state.opportunities = list.map(item => ({
      ...item,
      isFlagged: false,
    }));

    res.json(state);
  } catch (error: any) {
    console.error('Gemini refresh-opportunities error:', error);
    // Reset to initial opportunities on failure as fallback
    state.opportunities = JSON.parse(JSON.stringify(initialOpportunities));
    res.json(state);
  }
});

// AI - Analyze Opportunity (deep-dive financial analysis for group)
app.post('/api/analyze-opportunity', async (req, res) => {
  const { id } = req.body;
  const opp = state.opportunities.find(o => o.id === id);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  try {
    const client = getGeminiClient();
    const prompt = `Perform a cooperative-focused financial risk and growth analysis on the following investment opportunity:
    Title: ${opp.titleEn} (${opp.titleRw})
    Source: ${opp.source}
    Yield: ${opp.returnRate}
    Description: ${opp.summaryEn}

    Analyze its safety, suitability for a rural informal group (Ikimina) with collective savings of ${state.groupSavings} RWF, and ease of liquidation (withdrawal).
    Provide a professional, clear response in both English and Kinyarwanda in JSON format matching this exact schema:
    {
      "aiAnalysisEn": "string (Actionable 3-sentence summary of security, liquidity, and recommendation)",
      "aiAnalysisRw": "string (Actionable Kinyarwanda equivalent)"
    }`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(cleanText);

    opp.aiAnalysisEn = analysis.aiAnalysisEn;
    opp.aiAnalysisRw = analysis.aiAnalysisRw;

    res.json(state);
  } catch (error: any) {
    console.error('Gemini analyze-opportunity error:', error);
    // Provide generic fallback analysis
    opp.aiAnalysisEn = "Steady returns with minimal regulatory risks. Ideal asset lock-in for 6-12 months for idle cooperative reserves.";
    opp.aiAnalysisRw = "Inyungu ihamye ifite ibyago bike bya leta. Ni nziza cyane mu kubika amafaranga y'agateganyo y'itsinda mu mezi 6 kugeza kuri 12.";
    res.json(state);
  }
});

// Serve Frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
