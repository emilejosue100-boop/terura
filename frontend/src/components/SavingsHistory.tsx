import React from 'react';
import { GlobalState, Language } from '../types';
import EmptyState from './EmptyState';
import { ArrowUpRight, ArrowDownRight, TrendingUp, PiggyBank } from 'lucide-react';
import { buildSavingsTrend, chartPath } from '../lib/chartData';

interface SavingsHistoryProps {
  state: GlobalState;
  language: Language;
}

export default function SavingsHistory({ state, language }: SavingsHistoryProps) {
  const { currentUser, transactions } = state;

  const userTransactions = transactions.filter((t) => t.memberName === currentUser?.name);
  const trend = buildSavingsTrend(userTransactions);
  const trendPath = chartPath(trend);
  const trendAreaPath = trendPath ? `${trendPath} L 600 160 L 0 160 Z` : '';

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

      <div className="bg-white border border-border-subtle rounded-xl p-6 shadow-subtle">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <TrendingUp size={16} className="text-primary" />
          {language === 'en' ? 'Savings Trajectory' : 'Emezo ry’ubwiyongere'}
        </h3>

        <div className="h-40 w-full relative pt-2">
          {trend.length === 0 ? (
            <EmptyState
              compact
              language={language}
              icon={<TrendingUp size={24} />}
              titleEn="Your savings trend will appear here"
              titleRw="Imiterere y’ubwizigame bwawe izagaragara hano"
              descriptionEn="Once you start contributing, Terura will chart your progress over time."
              descriptionRw="Utangiye kuzigama, Terura izerekana iterambere ryawe mu gihe."
            />
          ) : (
            <>
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F5C3F" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1F5C3F" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={trendAreaPath} fill="url(#growthGrad)" />
                <path d={trendPath} fill="none" stroke="#1F5C3F" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <div className="flex justify-between text-[10px] font-semibold text-text-secondary uppercase tracking-wider mt-4">
                {trend.map((point) => (
                  <span key={point.label}>{point.label}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-border-subtle rounded-xl p-6 shadow-subtle">
        <h3 className="text-sm font-bold font-display text-oil-black mb-4">
          {language === 'en' ? 'Transaction Ledger' : 'Ibitabo by’imari byawe'}
        </h3>

        {userTransactions.length === 0 ? (
          <EmptyState
            compact
            language={language}
            icon={<PiggyBank size={24} />}
            titleEn="No transactions yet"
            titleRw="Nta bikorwa biranditswe"
            descriptionEn="Your savings contributions and loan repayments will be listed here."
            descriptionRw="Imisanzu yawe n’kwishyura inguzanyo bizandikwa hano."
          />
        ) : (
          <div className="divide-y divide-border-subtle/50">
            {userTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      tx.type === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {tx.type === 'saved' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-oil-black">
                      {tx.type === 'saved'
                        ? language === 'en'
                          ? 'Savings Contribution'
                          : 'Umusanzu wo Kwizigama'
                        : tx.type === 'repaid_loan'
                          ? language === 'en'
                            ? 'Loan Repayment'
                            : 'Kwishyura Inguzanyo'
                          : language === 'en'
                            ? 'Withdrawal'
                            : 'Kuvana mu kigega'}
                    </p>
                    <p className="text-[11px] text-text-secondary font-medium">
                      {language === 'en' ? 'Reference' : 'Inomero'}: {tx.id.toUpperCase()} • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold block ${
                      tx.type === 'saved' ? 'text-emerald-700' : 'text-oil-black'
                    }`}
                  >
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
