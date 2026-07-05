export type Language = 'en' | 'rw';
export type UserRole = 'member' | 'admin';

export interface User {
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  cooperativeName: string;
  savingsBalance: number;
  profileImage: string;
  status: 'active' | 'pending';
  joinDate: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'saved' | 'withdrew' | 'repaid_loan';
  amount: number;
  runningBalance: number;
  memberName: string;
  status: 'success' | 'pending';
}

export interface LoanRequest {
  id: string;
  memberName: string;
  memberImage: string;
  date: string;
  requestedAmount: number;
  reasonEn: string;
  reasonRw: string;
  status: 'pending' | 'approved' | 'declined';
}

export interface Opportunity {
  id: string;
  titleEn: string;
  titleRw: string;
  source: string;
  returnRate: string;
  summaryEn: string;
  summaryRw: string;
  aiAnalysisEn?: string;
  aiAnalysisRw?: string;
  isFlagged: boolean;
  foundAgo: string;
  category: string;
  image?: string;
}

export interface FinancialTip {
  id: string;
  titleEn: string;
  titleRw: string;
  contentEn: string;
  contentRw: string;
  whyEn: string;
  whyRw: string;
  category: 'streak' | 'goal' | 'dip';
}

export interface GlobalState {
  users: User[];
  currentUser: User | null;
  transactions: Transaction[];
  loanRequests: LoanRequest[];
  opportunities: Opportunity[];
  currentTip: FinancialTip;
  groupSavings: number;
  activeLoansCount: number;
  activeLoansAmount: number;
  language: Language;
}
