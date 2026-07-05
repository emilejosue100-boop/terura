import mongoose, { Schema, Document, Types } from 'mongoose';
import type { Language, FinancialTip } from '../types/index.js';

export interface ICooperative extends Document {
  name: string;
  groupSavings: number;
  activeLoansCount: number;
  activeLoansAmount: number;
  defaultLanguage: Language;
  currentTip: FinancialTip;
}

const cooperativeSchema = new Schema<ICooperative>(
  {
    name: { type: String, required: true, unique: true },
    groupSavings: { type: Number, default: 0 },
    activeLoansCount: { type: Number, default: 0 },
    activeLoansAmount: { type: Number, default: 0 },
    defaultLanguage: { type: String, enum: ['en', 'rw'], default: 'en' },
    currentTip: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Cooperative = mongoose.model<ICooperative>('Cooperative', cooperativeSchema);

export interface IUser extends Document {
  name: string;
  phone: string;
  pinHash: string;
  role: 'member' | 'admin';
  cooperativeId: Types.ObjectId;
  cooperativeName: string;
  savingsBalance: number;
  profileImage: string;
  status: 'active' | 'pending';
  joinDate: string;
  language?: Language;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    pinHash: { type: String, required: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    cooperativeId: { type: Schema.Types.ObjectId, ref: 'Cooperative', required: true },
    cooperativeName: { type: String, required: true },
    savingsBalance: { type: Number, default: 0 },
    profileImage: { type: String, required: true },
    status: { type: String, enum: ['active', 'pending'], default: 'active' },
    joinDate: { type: String, required: true },
    language: { type: String, enum: ['en', 'rw'] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

export interface ITransaction extends Document {
  externalId: string;
  userId: Types.ObjectId;
  cooperativeId: Types.ObjectId;
  date: string;
  type: 'saved' | 'withdrew' | 'repaid_loan';
  amount: number;
  runningBalance: number;
  memberName: string;
  status: 'success' | 'pending';
}

const transactionSchema = new Schema<ITransaction>(
  {
    externalId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cooperativeId: { type: Schema.Types.ObjectId, ref: 'Cooperative', required: true },
    date: { type: String, required: true },
    type: { type: String, enum: ['saved', 'withdrew', 'repaid_loan'], required: true },
    amount: { type: Number, required: true },
    runningBalance: { type: Number, required: true },
    memberName: { type: String, required: true },
    status: { type: String, enum: ['success', 'pending'], default: 'success' },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export interface ILoanRequest extends Document {
  externalId: string;
  userId: Types.ObjectId;
  cooperativeId: Types.ObjectId;
  memberName: string;
  memberImage: string;
  date: string;
  requestedAmount: number;
  reasonEn: string;
  reasonRw: string;
  status: 'pending' | 'approved' | 'declined';
  repaymentDueDate?: string;
  repaid?: boolean;
  repaidAmount?: number;
}

const loanRequestSchema = new Schema<ILoanRequest>(
  {
    externalId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cooperativeId: { type: Schema.Types.ObjectId, ref: 'Cooperative', required: true },
    memberName: { type: String, required: true },
    memberImage: { type: String, required: true },
    date: { type: String, required: true },
    requestedAmount: { type: Number, required: true },
    reasonEn: { type: String, required: true },
    reasonRw: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    repaymentDueDate: { type: String },
    repaid: { type: Boolean, default: false },
    repaidAmount: { type: Number },
  },
  { timestamps: true }
);

export const LoanRequest = mongoose.model<ILoanRequest>('LoanRequest', loanRequestSchema);

export interface IOpportunity extends Document {
  externalId: string;
  cooperativeId: Types.ObjectId;
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
  sourceUrl?: string;
  image?: string;
}

const opportunitySchema = new Schema<IOpportunity>(
  {
    externalId: { type: String, required: true, unique: true },
    cooperativeId: { type: Schema.Types.ObjectId, ref: 'Cooperative', required: true },
    titleEn: { type: String, required: true },
    titleRw: { type: String, required: true },
    source: { type: String, required: true },
    returnRate: { type: String, required: true },
    summaryEn: { type: String, required: true },
    summaryRw: { type: String, required: true },
    aiAnalysisEn: { type: String },
    aiAnalysisRw: { type: String },
    isFlagged: { type: Boolean, default: false },
    foundAgo: { type: String, required: true },
    category: { type: String, required: true },
    sourceUrl: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);
