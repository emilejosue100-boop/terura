import React, { useState } from 'react';
import { GlobalState, Language } from '../types';
import { FileText, Send, HelpCircle, Info } from 'lucide-react';

interface LoanRequestProps {
  state: GlobalState;
  language: Language;
  onStateChange: (updated: GlobalState) => void;
}

export default function LoanRequest({ state, language, onStateChange }: LoanRequestProps) {
  const { currentUser, loanRequests } = state;
  const [amount, setAmount] = useState('');
  const [reasonEn, setReasonEn] = useState('School Fees');
  const [reasonRw, setReasonRw] = useState('Amafaranga y’ishuri');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter loan requests belonging to this user
  const userLoans = loanRequests.filter(l => l.memberName === currentUser?.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError(language === 'en' ? 'Please enter a valid amount.' : 'Ongeramo umubare w’amafaranga yawo.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/request-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          reasonEn,
          reasonRw
        })
      });

      if (res.ok) {
        const updated = await res.json();
        onStateChange(updated);
        setSuccess(language === 'en' ? 'Loan request submitted successfully!' : 'Ibisabwa by’inguzanyo byoherejwe neza!');
        setAmount('');
      } else {
        const data = await res.json();
        setError(data.error || 'Submission failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' RWF';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-display text-oil-black tracking-tight">
          {language === 'en' ? 'Borrowing & Loans' : 'Inguzanyo mu itsinda'}
        </h2>
        <p className="text-xs text-text-secondary">
          {language === 'en' ? 'Apply for friendly micro-loans or track past requests' : 'Saba inguzanyo oroshye cyangwa ukurikirane izasabwe'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Submission Form */}
        <div className="md:col-span-5 bg-surface border border-border-subtle rounded-xl p-6 shadow-subtle h-fit">
          <h3 className="text-sm font-bold font-display text-oil-black mb-4 flex items-center gap-1.5">
            <Send size={16} className="text-primary flex-shrink-0" />
            <span>{language === 'en' ? 'New Request Form' : 'Ohereza ubusabe bushya'}</span>
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-error text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-oil-black mb-1">
                {language === 'en' ? 'Requested Amount (RWF)' : 'Amafaranga wifuza (RWF)'}
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-oil-black mb-1">
                {language === 'en' ? 'Purpose of Loan' : 'Icyo uzakoresha inguzanyo'}
              </label>
              <select
                value={reasonEn}
                onChange={(e) => {
                  setReasonEn(e.target.value);
                  if (e.target.value === 'School Fees') setReasonRw('Amafaranga y’ishuri ry’umwana');
                  else if (e.target.value === 'Business Inventory') setReasonRw('Kwirundamo ibicuruzwa / kongera igishoro');
                  else if (e.target.value === 'Medical Bill') setReasonRw('Kwishyura fagitire y’ubuvuzi');
                  else setReasonRw('Ibindi bibazo by’ingoboka');
                }}
                className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary font-sans"
              >
                <option value="School Fees">School Fees / Ishuri ry’umwana</option>
                <option value="Business Inventory">Business Inventory / Ubucuruzi & Igishoro</option>
                <option value="Medical Bill">Medical Bill / Kwivuza & Ubuvuzi</option>
                <option value="Emergency Care">Emergency Care / Ikibazo cy’ingoboka</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 md:h-11 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-subtle cursor-pointer"
            >
              <span>{loading ? '...' : (language === 'en' ? 'Submit Application' : 'Ohereza Ubusabe')}</span>
            </button>
          </form>

          {/* Microfinance Disclosure Note */}
          <div className="mt-5 p-3.5 bg-background border border-border-subtle rounded-xl flex gap-2.5">
            <Info size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {language === 'en'
                ? 'Cooperative loans have a friendly flat 2% interest rate. Repayment parameters are voted collectively during monthly group assemblies.'
                : 'Inguzanyo z’ikimina zungukirwa ku gipimo cya 2% gusa. Ibihe n’uburyo bwo kwishyura bikemurwa n’inteko rusange y’abanyamuryango.'}
            </p>
          </div>
        </div>

        {/* Right Side: Requests History Queue */}
        <div className="md:col-span-7 bg-surface border border-border-subtle rounded-xl p-6 shadow-subtle">
          <h3 className="text-sm font-bold font-display text-oil-black mb-4">
            {language === 'en' ? 'Your Applications' : 'Ubusabe bwawe bwose'}
          </h3>

          {userLoans.length === 0 ? (
            <div className="text-center py-12 text-text-secondary text-sm">
              {language === 'en' ? 'No loan requests submitted yet.' : 'Nta busabe bw’inguzanyo burakorwa.'}
            </div>
          ) : (
            <div className="space-y-4">
              {userLoans.map((loan) => {
                const dueDate = loan.repaymentDueDate || (() => {
                  const d = new Date(loan.date);
                  d.setDate(d.getDate() + 30);
                  return d.toISOString().split('T')[0];
                })();

                return (
                  <div key={loan.id} className="border border-border-subtle rounded-xl p-4 hover:bg-background/45 transition-all bg-background">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-text-secondary block font-medium">{loan.date}</span>
                        <span className="text-base font-bold text-oil-black">{formatRwf(loan.requestedAmount)}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                          loan.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : (loan.status === 'declined' 
                              ? 'bg-red-50 text-error border-red-200' 
                              : 'bg-amber-50 text-warning border-amber-200')
                        }`}>
                          {loan.status === 'approved' 
                            ? (language === 'en' ? 'Approved' : 'Byemejwe') 
                            : (loan.status === 'declined' 
                              ? (language === 'en' ? 'Declined' : 'Byanze') 
                              : (language === 'en' ? 'Pending' : 'Irasuzumwa'))}
                        </span>

                        {loan.status === 'approved' && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            loan.repaid 
                              ? 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-750'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {loan.repaid 
                              ? (language === 'en' ? 'Fully Repaid' : 'Yishyuwe yose')
                              : (language === 'en' ? `Due: ${dueDate}` : `Kwishyura: ${dueDate}`)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-surface border border-border-subtle/50 rounded-xl p-3 mt-3">
                      <span className="text-[10px] font-bold text-text-secondary uppercase block mb-0.5">
                        {language === 'en' ? 'Stated Purpose' : 'Impamvu yanditswe'}
                      </span>
                      <p className="text-xs text-oil-black leading-relaxed">
                        {language === 'en' ? loan.reasonEn : loan.reasonRw}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
