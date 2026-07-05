import { GlobalState, FinancialTip, Opportunity, LoanRequest, Transaction, User } from './types';

export const initialUsers: User[] = [
  {
    name: "Jean Nshimyumuremyi",
    phone: "0788123456",
    pin: "1234",
    role: "member",
    cooperativeName: "Abizerwa Terura",
    savingsBalance: 125500,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    status: "active",
    joinDate: "2025-01-15"
  },
  {
    name: "Alice Uwineza",
    phone: "0788654321",
    pin: "4321",
    role: "admin",
    cooperativeName: "Abizerwa Terura (Committee)",
    savingsBalance: 320000,
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    status: "active",
    joinDate: "2024-06-10"
  },
  {
    name: "Marie Claire Mukamana",
    phone: "0788111222",
    pin: "1111",
    role: "member",
    cooperativeName: "Abizerwa Terura",
    savingsBalance: 50000,
    profileImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120",
    status: "active",
    joinDate: "2025-02-20"
  },
  {
    name: "Jean Bosco Habimana",
    phone: "0788333444",
    pin: "2222",
    role: "member",
    cooperativeName: "Abizerwa Terura",
    savingsBalance: 150000,
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    status: "active",
    joinDate: "2024-11-05"
  },
  {
    name: "Alice Mutoni",
    phone: "0788555666",
    pin: "3333",
    role: "member",
    cooperativeName: "Abizerwa Terura",
    savingsBalance: 25000,
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    status: "active",
    joinDate: "2025-03-01"
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    date: "2026-07-05",
    type: "saved",
    amount: 10000,
    runningBalance: 125500,
    memberName: "Jean Nshimyumuremyi",
    status: "success"
  },
  {
    id: "tx-2",
    date: "2026-06-15",
    type: "repaid_loan",
    amount: 25000,
    runningBalance: 115500,
    memberName: "Jean Nshimyumuremyi",
    status: "success"
  },
  {
    id: "tx-3",
    date: "2026-05-20",
    type: "saved",
    amount: 10000,
    runningBalance: 90500,
    memberName: "Jean Nshimyumuremyi",
    status: "success"
  },
  {
    id: "tx-4",
    date: "2026-07-04",
    type: "saved",
    amount: 15000,
    runningBalance: 150000,
    memberName: "Jean Bosco Habimana",
    status: "success"
  },
  {
    id: "tx-5",
    date: "2026-07-01",
    type: "saved",
    amount: 5000,
    runningBalance: 25000,
    memberName: "Alice Mutoni",
    status: "success"
  }
];

export const initialLoanRequests: LoanRequest[] = [
  {
    id: "loan-1",
    memberName: "Marie Claire Mukamana",
    memberImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120",
    date: "2026-07-01",
    requestedAmount: 50000,
    reasonEn: "School Fees / Tuition for child",
    reasonRw: "Amafaranga y'ishuri ry'umwana",
    status: "pending"
  },
  {
    id: "loan-2",
    memberName: "Jean Bosco Habimana",
    memberImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    date: "2026-07-02",
    requestedAmount: 150000,
    reasonEn: "Business Inventory / Restocking kiosk",
    reasonRw: "Kongera igishoro mu iduka",
    status: "pending"
  },
  {
    id: "loan-3",
    memberName: "Alice Mutoni",
    memberImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    date: "2026-07-03",
    requestedAmount: 25000,
    reasonEn: "Medical Bill / Urgent clinical care",
    reasonRw: "Kwishyura fagitire y'ubuvuzi",
    status: "pending"
  }
];

export const initialOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    titleEn: "Rwandan Treasury Bond",
    titleRw: "Impapuro mpeshamwenda za Leta",
    source: "BNR.rw",
    returnRate: "9.5% p.a.",
    summaryEn: "Safe government-backed securities with steady, guaranteed semi-annual interest payouts. Highly recommended for conservative portfolio security.",
    summaryRw: "Ishoramari ririzira ikibazo ridufasha kubona inyungu ihoraho kandi yizewe ishyurwa kabiri mu mwaka na Leta. Ryiza ku mutekano w'ikigega cy'itsinda.",
    aiAnalysisEn: "Safe investment with steady returns, suitable for group funds. Highly recommended for conservative portfolios aiming for long-term stable growth.",
    aiAnalysisRw: "Ishoramari ririzira ikibazo ridufasha kubona inyungu ihoraho kandi yizewe. Ryiza ku mutekano w'ikigega cy'itsinda.",
    isFlagged: false,
    foundAgo: "Found 2 hours ago",
    category: "Government Bond",
    image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "opp-2",
    titleEn: "BK Group Dividend Stock",
    titleRw: "Imigabane ya BK itanga inyungu",
    source: "RSE.rw (Rwanda Stock Exchange)",
    returnRate: "12.0% est. p.a.",
    summaryEn: "Bank of Kigali Group offers high historical dividend yields and strong asset performance. Suitable for moderate risk with strong returns.",
    summaryRw: "Banki ya Kigali Group itanga inyungu ishingiye ku mateka akomeye y'inyungu ku migabane. Ryiza ku banyamuryango bashaka kwagura ikigega.",
    aiAnalysisEn: "Moderate risk. Historical data shows consistent dividend payouts. Good for diversified cooperative growth over a 12-month horizon.",
    aiAnalysisRw: "Ibyago biringaniye. Amakuru yerekana ko imigabane ya BK itanga inyungu idahagarara. Ryiza ryo kwagura ikigega mu mezi 12 ari imbere.",
    isFlagged: false,
    foundAgo: "Found 1 day ago",
    category: "Equity / Dividend"
  },
  {
    id: "opp-3",
    titleEn: "Coffee Export Co-op Fund",
    titleRw: "Ikigega cyoherereza ikawa mu mahanga",
    source: "AgriInvest.rw",
    returnRate: "15.5% target",
    summaryEn: "Support local farmers by financing washing stations and export pre-orders. High return potential with structured agricultural export cycles.",
    summaryRw: "Shyigikira abahinzi b'ikawa uha inguzanyo ibigo bitunganya ikawa n'ubucuruzi bwohereza hanze. Inyungu iri hejuru ifite imirimo yubakitse.",
    aiAnalysisEn: "Higher return potential, supports local farmers. Seasonal agricultural risk is offset by guaranteed purchase orders.",
    aiAnalysisRw: "Inyungu iri hejuru cyane, ishyigikira abahinzi b'ikawa. Ibyago by'ibihe by'isarura bigabanywa n'amasezerano yo kugura mberabyose.",
    isFlagged: false,
    foundAgo: "Found 3 days ago",
    category: "Agriculture"
  }
];

export const initialTip: FinancialTip = {
  id: "tip-1",
  titleEn: "Financial Tip of the Day",
  titleRw: "Inama y'umunsi yo Kuzigama",
  contentEn: "Saving small amounts regularly is the key to growth.",
  contentRw: "Kuzigama buhoro buhoro nibyo bituma ukura.",
  whyEn: "Based on your steady monthly contributions of 10,000 RWF, small micro-contributions compound faster than waiting for a large sum.",
  whyRw: "Bishingiye ku misanzu yawe ihoraho ya 10,000 RWF buri kwezi, kuzigama duto duto byiyongera vuba kuruta gutegereza amafaranga menshi rimwe.",
  category: "streak"
};

export const initialGlobalState: GlobalState = {
  users: initialUsers,
  currentUser: initialUsers[0], // Jean (member)
  transactions: initialTransactions,
  loanRequests: initialLoanRequests,
  opportunities: initialOpportunities,
  currentTip: initialTip,
  groupSavings: 4250000,
  activeLoansCount: 4,
  activeLoansAmount: 1200000,
  language: 'en'
};
