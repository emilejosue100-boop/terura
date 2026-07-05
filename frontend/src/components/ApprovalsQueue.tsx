import React, { useState } from 'react';
import { GlobalState, Language } from '../types';
import { apiPost } from '../lib/api';
import EmptyState from './EmptyState';
import UserNotice from './UserNotice';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Hourglass } from 'lucide-react';

interface ApprovalsQueueProps {
  state: GlobalState;
  language: Language;
  onStateChange: (updated: GlobalState) => void;
}

export default function ApprovalsQueue({ state, language, onStateChange }: ApprovalsQueueProps) {
  const { loanRequests } = state;
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleAction = async (id: string, approve: boolean) => {
    setActionLoading(id);
    setActionError(null);
    try {
      const endpoint = approve ? '/api/approve-loan' : '/api/decline-loan';
      const { ok, data, error } = await apiPost<GlobalState>(endpoint, { id }, true, language, 'approve');

      if (ok) {
        onStateChange(data);
      } else {
        setActionError(error || null);
      }
    } catch {
      setActionError(null);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingList = loanRequests.filter(l => l.status === 'pending');
  const pastList = loanRequests.filter(l => l.status !== 'pending');

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' RWF';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-display text-oil-black tracking-tight">
          {language === 'en' ? 'Loan Approvals Queue' : 'Ubusabe bw’Inguzanyo buhari'}
        </h2>
        <p className="text-xs text-text-secondary">
          {language === 'en' ? 'Review, approve, or deny outstanding cooperative borrowing requests' : 'Soma ubusabe bw’abanyamuryango ubyemeze cyangwa ubyange ushingiye ku miterere yabo'}
        </p>
      </div>

      {/* Warning Rule Guard Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-xs font-bold text-oil-black uppercase tracking-wider">
            {language === 'en' ? 'Committee Mandate Rules' : 'Amategeko Agenga Isuzuma'}
          </h4>
          <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
            {language === 'en'
              ? 'Requests require verification of the borrower’s regular contributions. Ensure total collective outstanding credit does not exceed 35% of total cooperative fund reserves.'
              : 'Gusuzuma inguzanyo bisaba kubanza kureba niba uwasabye asanzwe atanga umusanzu we neza. Inguzanyo zose ntizigomba kurenga 35% by’ikigega cyose rya terura.'}
          </p>
        </div>
      </div>

      {actionError && <UserNotice message={actionError} />}

      {/* Pending Queue Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
          <Clock size={15} />
          {language === 'en' ? `Pending Requests (${pendingList.length})` : `Ubusabe butegereje isuzuma (${pendingList.length})`}
        </h3>

        {pendingList.length === 0 ? (
          <EmptyState
            compact
            language={language}
            icon={<Hourglass size={24} />}
            titleEn="No pending loan requests"
            titleRw="Nta busabe bw’inguzanyo butegereje"
            descriptionEn="When members apply for loans, they will appear here for committee review."
            descriptionRw="Abanyamuryango basaba inguzanyo, bizagaragara hano kugira ngo komite ibisuzume."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((loan) => (
              <div 
                key={loan.id} 
                className="bg-white border border-border-subtle rounded-xl p-5 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 pb-3 border-b border-border-subtle/50 mb-3">
                    <img
                      src={loan.memberImage}
                      alt={loan.memberName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-oil-black">{loan.memberName}</h4>
                      <span className="text-[10px] text-text-secondary block font-semibold">{loan.date}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">
                      {language === 'en' ? 'Requested Amount' : 'Amafaranga asabwa'}
                    </span>
                    <span className="text-xl font-bold text-oil-black block mt-0.5">
                      {formatRwf(loan.requestedAmount)}
                    </span>
                  </div>

                  <div className="bg-background border border-border-subtle/50 rounded-xl p-3 mb-5">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-0.5">
                      {language === 'en' ? 'Stated Purpose' : 'Impamvu’'}
                    </span>
                    <p className="text-xs text-oil-black leading-relaxed">
                      {language === 'en' ? loan.reasonEn : loan.reasonRw}
                    </p>
                  </div>
                </div>

                {/* Quick Action Decision buttons */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleAction(loan.id, false)}
                    disabled={actionLoading === loan.id}
                    className="flex-1 h-10 border border-red-200 text-error hover:bg-red-50 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <XCircle size={15} />
                    {language === 'en' ? 'Decline' : 'Ahari'}
                  </button>
                  <button
                    onClick={() => handleAction(loan.id, true)}
                    disabled={actionLoading === loan.id}
                    className="flex-1 h-10 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-subtle"
                  >
                    <CheckCircle2 size={15} />
                    {language === 'en' ? 'Approve' : 'Emeza'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Decisions Log Section */}
      <div className="bg-white border border-border-subtle rounded-xl p-6 shadow-subtle">
        <h3 className="text-sm font-bold font-display text-oil-black mb-4">
          {language === 'en' ? 'Recent Decisions Log' : 'Amateka y’Inguzanyo zafatiwe ibyemezo'}
        </h3>

        {pastList.length === 0 ? (
          <EmptyState
            compact
            language={language}
            icon={<CheckCircle2 size={24} />}
            titleEn="No decisions recorded yet"
            titleRw="Nta byemezo byanditswe"
            descriptionEn="Approved and declined loans will be logged here for the committee's records."
            descriptionRw="Inguzanyo zemewe cyangwa zanzwe bizandikwa hano nk’inyandiko ya komite."
          />
        ) : (
          <div className="divide-y divide-border-subtle/50">
            {pastList.map((loan) => (
              <div key={loan.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img
                    src={loan.memberImage}
                    alt={loan.memberName}
                    className="w-8 h-8 rounded-full object-cover border border-border-subtle"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-oil-black">{loan.memberName}</h4>
                    <span className="text-[10px] text-text-secondary block font-semibold">{loan.date}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-oil-black block">{formatRwf(loan.requestedAmount)}</span>
                    <p className="text-[10px] text-text-secondary font-medium truncate max-w-[120px]">
                      {language === 'en' ? loan.reasonEn : loan.reasonRw}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    loan.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                      : 'bg-red-50 text-error border border-red-100'
                  }`}>
                    {loan.status === 'approved' 
                      ? (language === 'en' ? 'Approved' : 'Byemejwe') 
                      : (language === 'en' ? 'Declined' : 'Byanzwe')}
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
