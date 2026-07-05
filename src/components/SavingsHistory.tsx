import React from 'react';
import { GlobalState, Language } from '../types';
import { PiggyBank, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface SavingsHistoryProps {
  state: GlobalState;
  language: Language;
}

export default function SavingsHistory({ state, language }: SavingsHistoryProps) {
  const { currentUser, transactions } = state;

  // Filter transactions belonging to this user
  const userTransactions = transactions.filter(t => t.memberName === currentUser?.name);

  // Formatter helper
  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' RWF';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-display text-oil-black tracking-tight">
          {language === 'en' ? 'Savings History' : 'Amateka yo Kwizigama'}
        </h2>
        <p className="text-xs text-text-secondary">
          {language === 'en' ? 'Track your contributions and withdrawals' : 'Nshingurano n’ibikorwa byawe mu kigega'}
        </p>
      </div>

      {/* SVG Growth Trend Card */}
      <div className="bg-white border border-border-subtle rounded-xl p-6 shadow-subtle">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <TrendingUp size={16} className="text-primary" />
          {language === 'en' ? '6-Month Savings Trajectory' : 'Emezo ry’ubwiyongere mu mezi 6'}
        </h3>

        {/* CSS Grid SVG Line Plot */}
        <div className="h-40 w-full relative pt-2">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-t border-dashed border-oil-black"></div>
            <div className="border-t border-dashed border-oil-black"></div>
            <div className="border-t border-dashed border-oil-black"></div>
          </div>

          {/* SVG Line representation of trend */}
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F5C3F" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1F5C3F" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Filled Area */}
            <path
              d="M 0 160 Q 150 130 300 110 T 600 50 L 600 160 Z"
              fill="url(#growthGrad)"
              className="w-full"
            />
            {/* Actual Line */}
            <path
              d="M 0 160 Q 150 130 300 110 T 600 50"
              fill="none"
              stroke="#1F5C3F"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Interactive Nodes */}
            <circle cx="0" cy="160" r="5" fill="#C9A227" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="150" cy="130" r="5" fill="#1F5C3F" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="300" cy="110" r="5" fill="#1F5C3F" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="600" cy="50" r="6" fill="#1F5C3F" stroke="#FFFFFF" strokeWidth="2.5" />
          </svg>
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between items-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider mt-4">
          <span>Feb 2026</span>
          <span>Mar 2026</span>
          <span>Apr 2026</span>
          <span>May 2026</span>
          <span>Jun 2026</span>
          <span className="text-primary font-bold">Jul 2026 (Now)</span>
        </div>
      </div>

      {/* Main transactions list */}
      <div className="bg-white border border-border-subtle rounded-xl p-6 shadow-subtle">
        <h3 className="text-sm font-bold font-display text-oil-black mb-4">
          {language === 'en' ? 'Transaction Ledger' : 'Ibitabo by’imari byawe'}
        </h3>

        {userTransactions.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            {language === 'en' ? 'No transactions found.' : 'Nta bikorwa birandikwa.'}
          </div>
        ) : (
          <div className="divide-y divide-border-subtle/50">
            {userTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    tx.type === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {tx.type === 'saved' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-oil-black">
                      {tx.type === 'saved' 
                        ? (language === 'en' ? 'Savings Contribution' : 'Umusanzu wo Kwizigama')
                        : (tx.type === 'repaid_loan' ? (language === 'en' ? 'Loan Repayment' : 'Kwishyura Inguzanyo') : (language === 'en' ? 'Withdrawal' : 'Kuvana mu kigega'))}
                    </p>
                    <p className="text-[11px] text-text-secondary font-medium">
                      {language === 'en' ? 'Reference' : 'Inomero'}: {tx.id.toUpperCase()} • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold block ${
                    tx.type === 'saved' ? 'text-emerald-700' : 'text-oil-black'
                  }`}>
                    {tx.type === 'saved' ? '+' : '-'} {formatRwf(tx.amount)}
                  </span>
                  <span className="inline-block text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold uppercase tracking-wider">
                    {language === 'en' ? 'Success' : 'Byemejwe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
