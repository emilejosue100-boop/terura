import React, { useState } from 'react';
import { GlobalState, Language } from '../types';
import { ArrowDownRight, ArrowUpRight, Lightbulb, Wallet, Plus, ChevronRight, RefreshCw, X, Sparkles, Check } from 'lucide-react';

interface DashboardProps {
  state: GlobalState;
  language: Language;
  onStateChange: (updated: GlobalState) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ state, language, onStateChange, onNavigateToTab }: DashboardProps) {
  const { currentUser, currentTip, transactions } = state;
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [saveAmount, setSaveAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanReasonEn, setLoanReasonEn] = useState('School Fees');
  const [loanReasonRw, setLoanReasonRw] = useState('Amafaranga y’ishuri');
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loanLoading, setLoanLoading] = useState(false);
  const [repayLoading, setRepayLoading] = useState(false);

  // Filter approved loans for current user that are not yet repaid
  const userApprovedLoans = state.loanRequests.filter(
    l => l.memberName === currentUser?.name && l.status === 'approved' && !l.repaid
  );

  const getDaysRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleRepayLoanSubmit = async (loanId: string) => {
    setRepayLoading(true);
    try {
      const res = await fetch('/api/repay-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loanId })
      });
      if (res.ok) {
        const updated = await res.json();
        onStateChange(updated);
      }
    } catch (err) {
      console.error("Error repaying loan:", err);
    } finally {
      setRepayLoading(false);
    }
  };

  // Filter transactions belonging to this user
  const userTransactions = transactions.filter(t => t.memberName === currentUser?.name);

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveAmount || isNaN(Number(saveAmount)) || Number(saveAmount) <= 0) return;

    setSaveLoading(true);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(saveAmount) })
      });
      if (res.ok) {
        const updated = await res.json();
        onStateChange(updated);
        setShowSaveModal(false);
        setSaveAmount('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanAmount || isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) return;

    setLoanLoading(true);
    try {
      const res = await fetch('/api/request-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(loanAmount),
          reasonEn: loanReasonEn,
          reasonRw: loanReasonRw
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onStateChange(updated);
        setShowLoanModal(false);
        setLoanAmount('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoanLoading(false);
    }
  };

  const refreshTipWithAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/generate-tip', { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        onStateChange(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Format currency helper
  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' RWF';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-oil-black font-display tracking-tight">
            {language === 'en' ? `Hello, ${currentUser?.name.split(' ')[0]}` : `Muraho, ${currentUser?.name.split(' ')[0]}`}
          </h2>
          <p className="text-sm text-text-secondary font-medium">
            {currentUser?.cooperativeName || 'Abizerwa Terura'}
          </p>
        </div>
        <img
          src={currentUser?.profileImage}
          alt={currentUser?.name}
          className="w-10 h-10 rounded-full object-cover border border-border-subtle shadow-subtle"
        />
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Savings Balance & Actions */}
        <div className="lg:col-span-8 bg-primary text-white rounded-xl p-6 shadow-subtle relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          {/* Subtle Organic Background Blob */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-700/30 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-2 opacity-90 text-sm font-semibold tracking-wide uppercase">
              <Wallet size={18} className="flex-shrink-0" />
              <span>{language === 'en' ? 'Total Savings / Balance' : 'Ubwizigame bwose'}</span>
            </div>
            <div className="text-4xl md:text-5xl font-bold font-display mt-4 tracking-tight">
              {formatRwf(currentUser?.savingsBalance || 0)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 h-14 md:h-12 bg-white text-primary hover:bg-neutral-50 active:scale-[0.98] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-pressed cursor-pointer"
            >
              <Plus size={18} className="flex-shrink-0" />
              <span>{language === 'en' ? 'Save / Kizigama' : 'Kuzigama'}</span>
            </button>
            <button
              onClick={() => setShowLoanModal(true)}
              className="flex-1 h-14 md:h-12 bg-primary-hover border border-white/20 hover:bg-primary-hover/80 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowDownRight size={18} className="flex-shrink-0" />
              <span>{language === 'en' ? 'Request Loan' : 'Saba Inguzanyo'}</span>
            </button>
          </div>
        </div>

        {/* Right Card: AI Tip of the Day */}
        <div className="lg:col-span-4 bg-surface border border-border-subtle rounded-xl p-6 shadow-subtle flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full pointer-events-none"></div>
          
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-accent/15 text-accent rounded-xl flex items-center justify-center shadow-pressed">
                <Lightbulb size={20} className="fill-accent stroke-[1.5] flex-shrink-0" />
              </div>
              <button
                onClick={refreshTipWithAi}
                disabled={aiLoading}
                className="p-1.5 hover:bg-background rounded-full transition-all text-text-secondary hover:text-primary flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                title={language === 'en' ? 'Regenerate advice using Gemini AI' : 'Koresha Gemini AI'}
              >
                <RefreshCw size={12} className={`flex-shrink-0 ${aiLoading ? 'animate-spin text-primary' : ''}`} />
                <span>{aiLoading ? 'AI...' : 'Gemini AI'}</span>
              </button>
            </div>

            <h3 className="text-base font-bold font-display text-oil-black">
              {language === 'en' ? currentTip.titleEn : currentTip.titleRw}
            </h3>
            <p className="text-sm text-oil-black italic mt-2 leading-relaxed">
              "{language === 'en' ? currentTip.contentEn : currentTip.contentRw}"
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle/60">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Why am I seeing this?' : 'Kuki mbona ibi?'}
            </span>
            <p className="text-[11px] text-text-secondary leading-normal">
              {language === 'en' ? currentTip.whyEn : currentTip.whyRw}
            </p>
          </div>
        </div>
      </div>

      {/* Active Repayments & Due Flag Tracker */}
      {userApprovedLoans.length > 0 && (
        <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-subtle space-y-4">
          <div>
            <h3 className="text-base font-bold font-display text-oil-black">
              {language === 'en' ? 'Active Loans & Repayment Status' : 'Inguzanyo Gukora n’Uburyo bwo Kwishyura'}
            </h3>
            <p className="text-xs text-text-secondary">
              {language === 'en' ? 'Track your upcoming repayment deadlines and timeline' : 'Kurikirana itariki n’ibihe bigera byo kwishyura inguzanyo'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userApprovedLoans.map((loan) => {
              const dueDate = loan.repaymentDueDate || (() => {
                const d = new Date(loan.date);
                d.setDate(d.getDate() + 30);
                return d.toISOString().split('T')[0];
              })();
              const daysLeft = getDaysRemaining(dueDate);
              
              let flagColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900';
              let flagText = language === 'en' ? 'On Schedule' : 'Kuri gahunda';

              if (daysLeft <= 0) {
                flagColor = 'bg-red-50 text-error border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';
                flagText = language === 'en' ? 'Overdue!' : 'Warengeje igihe!';
              } else if (daysLeft <= 7) {
                flagColor = 'bg-red-50 text-error border-red-200 animate-pulse dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';
                flagText = language === 'en' ? '🚨 Urgent Repayment' : '🚨 Nshyuza vuba';
              } else if (daysLeft <= 14) {
                flagColor = 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-950/30 dark:text-warning dark:border-amber-900';
                flagText = language === 'en' ? '⚠️ Approaching' : '⚠️ Birasabwa vuba';
              }

              // Calculate percentage of 30 days passed
              const daysPassed = Math.max(0, 30 - Math.max(0, daysLeft));
              const progressPercent = Math.min(100, Math.round((daysPassed / 30) * 100));

              return (
                <div key={loan.id} className="border border-border-subtle rounded-xl p-4 flex flex-col justify-between space-y-4 bg-background">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                        {language === 'en' ? 'Loan Balance' : 'Isigara ku Nguzanyo'}
                      </span>
                      <span className="text-lg font-bold text-oil-black">{formatRwf(loan.requestedAmount)}</span>
                    </div>

                    <div className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${flagColor}`}>
                      {flagText}
                    </div>
                  </div>

                  {/* Timeline & Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-text-secondary">
                      <span>{language === 'en' ? `Disbursed: ${loan.date}` : `Yatanzwe: ${loan.date}`}</span>
                      <span>{language === 'en' ? `Due: ${dueDate}` : `Uwishyura: ${dueDate}`}</span>
                    </div>

                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          daysLeft <= 7 ? 'bg-error' : (daysLeft <= 14 ? 'bg-warning' : 'bg-primary')
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                      <span>{language === 'en' ? `${progressPercent}% timeline elapsed` : `${progressPercent}% y’igihe gushize`}</span>
                      <span className={daysLeft <= 7 ? 'text-error animate-pulse' : ''}>
                        {daysLeft <= 0 
                          ? (language === 'en' ? 'Overdue' : 'Igihe cyarenze') 
                          : (language === 'en' ? `${daysLeft} days remaining` : `Hasigaye iminsi ${daysLeft}`)}
                      </span>
                    </div>
                  </div>

                  {/* Repay Button */}
                  <button
                    onClick={() => handleRepayLoanSubmit(loan.id)}
                    disabled={repayLoading}
                    className="w-full h-14 md:h-11 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-subtle"
                  >
                    <Check size={14} className="flex-shrink-0" />
                    <span>{repayLoading ? '...' : (language === 'en' ? 'Repay Loan / Clear Balance' : 'Kwishyura inguzanyo yose')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-subtle">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold font-display text-oil-black">
              {language === 'en' ? 'Recent Activity' : 'Ibikorwa biheruka'}
            </h3>
            <p className="text-xs text-text-secondary">
              {language === 'en' ? 'Your personal savings timeline' : 'Urutonde rw’ibikorwa byawe'}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('savings')}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'en' ? 'View All' : 'Reba Byose'}</span>
            <ChevronRight size={14} className="flex-shrink-0" />
          </button>
        </div>

        {userTransactions.length === 0 ? (
          <div className="text-center py-6 text-text-secondary text-sm">
            {language === 'en' ? 'No savings yet.' : 'Nta bikorwa birandikwa.'}
          </div>
        ) : (
          <div className="divide-y divide-border-subtle/50">
            {userTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {tx.type === 'saved' ? <ArrowUpRight size={16} className="flex-shrink-0" /> : <ArrowDownRight size={16} className="flex-shrink-0" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-oil-black">
                      {tx.type === 'saved' 
                        ? (language === 'en' ? 'Cooperative Saving' : 'Kuzigama mu itsinda')
                        : (tx.type === 'repaid_loan' ? (language === 'en' ? 'Loan Repayment' : 'Kwishyura Inguzanyo') : (language === 'en' ? 'Withdrawal' : 'Kuvana mu kigega'))}
                    </p>
                    <p className="text-[11px] text-text-secondary">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    tx.type === 'saved' ? 'text-emerald-700' : 'text-oil-black'
                  }`}>
                    {tx.type === 'saved' ? '+' : '-'} {formatRwf(tx.amount)}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-medium">
                    {language === 'en' ? 'Success' : 'Byagenze neza'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface rounded-xl max-w-sm w-full p-6 shadow-subtle border border-border-subtle relative">
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-oil-black cursor-pointer"
            >
              <X size={18} className="flex-shrink-0" />
            </button>
            <h3 className="text-lg font-bold font-display text-oil-black mb-1">
              {language === 'en' ? 'Deposit Contribution' : 'Kuzigama mu itsinda'}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              {language === 'en' 
                ? 'Add funds to your shared cooperative account.' 
                : 'Ongeramo amafaranga mu kigega rusange rya terura.'}
            </p>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-oil-black mb-1">
                  {language === 'en' ? 'Amount (RWF)' : 'Umubare w’amafaranga (RWF)'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  required
                  value={saveAmount}
                  onChange={(e) => setSaveAmount(e.target.value)}
                  className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 h-14 md:h-11 border border-border-subtle text-oil-black font-semibold rounded-xl text-xs hover:bg-background transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Hagarika'}
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 h-14 md:h-11 bg-primary text-white font-semibold rounded-xl text-xs hover:bg-primary-hover transition-all flex items-center justify-center cursor-pointer"
                >
                  {saveLoading ? '...' : (language === 'en' ? 'Confirm' : 'Emeza')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-sm w-full p-6 shadow-subtle border border-border-subtle relative">
            <button
              onClick={() => setShowLoanModal(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-oil-black cursor-pointer"
            >
              <X size={18} className="flex-shrink-0" />
            </button>
            <h3 className="text-lg font-bold font-display text-oil-black mb-1">
              {language === 'en' ? 'Apply for a Micro-Loan' : 'Saba inguzanyo iciriritse'}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              {language === 'en' 
                ? 'Loans are subject to approval by the cooperative committee.' 
                : 'Inguzanyo zihabwa uburenganzira na komite ya terura.'}
            </p>

            <form onSubmit={handleLoanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-oil-black mb-1">
                  {language === 'en' ? 'Amount Requested (RWF)' : 'Amafaranga usaba (RWF)'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-oil-black mb-1">
                  {language === 'en' ? 'Reason for Loan' : 'Impamvu usaba inguzanyo'}
                </label>
                <select
                  value={loanReasonEn}
                  onChange={(e) => {
                    setLoanReasonEn(e.target.value);
                    if (e.target.value === 'School Fees') setLoanReasonRw('Amafaranga y’ishuri');
                    else if (e.target.value === 'Business Inventory') setLoanReasonRw('Kubaka cyangwa kongera igishoro');
                    else if (e.target.value === 'Medical Bill') setLoanReasonRw('Kwishyura fagitire y’ubuvuzi');
                    else setLoanReasonRw('Ibindi bibazo by’ingoboka');
                  }}
                  className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary"
                >
                  <option value="School Fees">School Fees / Ishuri ry’umwana</option>
                  <option value="Business Inventory">Business Inventory / Idurika & Kiosk</option>
                  <option value="Medical Bill">Medical Bill / Fagitire y’Ubuvuzi</option>
                  <option value="Emergency Care">Emergency Care / Ingoboka rusange</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="flex-1 h-14 md:h-11 border border-border-subtle text-oil-black font-semibold rounded-xl text-xs hover:bg-background transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Hagarika'}
                </button>
                <button
                  type="submit"
                  disabled={loanLoading}
                  className="flex-1 h-14 md:h-11 bg-primary text-white font-semibold rounded-xl text-xs hover:bg-primary-hover transition-all flex items-center justify-center cursor-pointer"
                >
                  {loanLoading ? '...' : (language === 'en' ? 'Submit' : 'Ohereza')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
