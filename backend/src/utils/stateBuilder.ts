import type { IUser } from '../models/index.js';
import type { User, GlobalState, Transaction, LoanRequest, Opportunity } from '../types/index.js';
import {
  Cooperative,
  User as UserModel,
  Transaction as TransactionModel,
  LoanRequest as LoanRequestModel,
  Opportunity as OpportunityModel,
} from '../models/index.js';

export function toPublicUser(user: IUser): User {
  return {
    name: user.name,
    phone: user.phone,
    pin: '',
    role: user.role,
    cooperativeName: user.cooperativeName,
    savingsBalance: user.savingsBalance,
    profileImage: user.profileImage,
    status: user.status,
    joinDate: user.joinDate,
  };
}

export async function getDefaultCooperative() {
  const coop = await Cooperative.findOne();
  if (!coop) {
    throw new Error('No cooperative found. Run npm run seed first.');
  }
  return coop;
}

export async function buildGlobalState(currentUserId?: string): Promise<GlobalState> {
  const coop = await getDefaultCooperative();

  const [users, transactions, loanRequests, opportunities] = await Promise.all([
    UserModel.find({ cooperativeId: coop._id }).sort({ joinDate: 1 }),
    TransactionModel.find({ cooperativeId: coop._id }).sort({ date: -1, createdAt: -1 }),
    LoanRequestModel.find({ cooperativeId: coop._id }).sort({ date: -1, createdAt: -1 }),
    OpportunityModel.find({ cooperativeId: coop._id }).sort({ createdAt: -1 }),
  ]);

  let currentUser: User | null = null;
  if (currentUserId) {
    const userDoc = users.find((u) => u._id.toString() === currentUserId);
    if (userDoc) {
      currentUser = toPublicUser(userDoc);
    }
  }

  const language =
    (currentUserId
      ? users.find((u) => u._id.toString() === currentUserId)?.language
      : undefined) ?? coop.defaultLanguage;

  const mappedTransactions: Transaction[] = transactions.map((tx) => ({
    id: tx.externalId,
    date: tx.date,
    type: tx.type,
    amount: tx.amount,
    runningBalance: tx.runningBalance,
    memberName: tx.memberName,
    status: tx.status,
  }));

  const mappedLoans: LoanRequest[] = loanRequests.map((loan) => ({
    id: loan.externalId,
    memberName: loan.memberName,
    memberImage: loan.memberImage,
    date: loan.date,
    requestedAmount: loan.requestedAmount,
    reasonEn: loan.reasonEn,
    reasonRw: loan.reasonRw,
    status: loan.status,
    repaymentDueDate: loan.repaymentDueDate,
    repaid: loan.repaid,
    repaidAmount: loan.repaidAmount,
  }));

  const mappedOpportunities: Opportunity[] = opportunities.map((opp) => ({
    id: opp.externalId,
    titleEn: opp.titleEn,
    titleRw: opp.titleRw,
    source: opp.source,
    returnRate: opp.returnRate,
    summaryEn: opp.summaryEn,
    summaryRw: opp.summaryRw,
    aiAnalysisEn: opp.aiAnalysisEn,
    aiAnalysisRw: opp.aiAnalysisRw,
    isFlagged: opp.isFlagged,
    foundAgo: opp.foundAgo,
    category: opp.category,
    sourceUrl: opp.sourceUrl,
    image: opp.image,
  }));

  return {
    users: users.map(toPublicUser),
    currentUser,
    transactions: mappedTransactions,
    loanRequests: mappedLoans,
    opportunities: mappedOpportunities,
    currentTip: coop.currentTip,
    groupSavings: coop.groupSavings,
    activeLoansCount: coop.activeLoansCount,
    activeLoansAmount: coop.activeLoansAmount,
    language,
  };
}
