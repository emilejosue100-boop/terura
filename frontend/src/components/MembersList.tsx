import React from 'react';
import { GlobalState, Language } from '../types';
import EmptyState from './EmptyState';
import { UserCheck, Calendar, Wallet, Users } from 'lucide-react';

interface MembersListProps {
  state: GlobalState;
  language: Language;
}

export default function MembersList({ state, language }: MembersListProps) {
  const { users } = state;

  const totalMembers = users.length;
  const avgSavings = totalMembers > 0 
    ? Math.round(users.reduce((acc, curr) => acc + curr.savingsBalance, 0) / totalMembers)
    : 0;

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' RWF';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-display text-oil-black tracking-tight">
          {language === 'en' ? 'Cooperative Membership Ledger' : 'Ibitabo by’Abanyamuryango'}
        </h2>
        <p className="text-xs text-text-secondary">
          {language === 'en' ? 'Manage, audit, and inspect active savers within the group' : 'Andika cyangwa ukurikirane abanyamuryango bose n’ubwizigame bwabo'}
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-subtle flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              {language === 'en' ? 'Active Membership Size' : 'Abanyamuryango bose'}
            </span>
            <span className="text-lg font-bold text-oil-black font-display block">
              {totalMembers} {language === 'en' ? 'Registered Savers' : 'Abaranditswe'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-subtle flex items-center gap-4">
          <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Wallet size={20} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              {language === 'en' ? 'Average Savings per Saver' : 'Impuzandengo y’Ubwizigame'}
            </span>
            <span className="text-lg font-bold text-oil-black font-display block">
              {formatRwf(avgSavings)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Directory Table */}
      <div className="bg-white border border-border-subtle rounded-xl shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-sm font-bold font-display text-oil-black">
            {language === 'en' ? 'Active Members Directory' : 'Lisiti y’Abanyamuryango Bakora'}
          </h3>
        </div>

        {/* Directory List Container */}
        <div className="divide-y divide-border-subtle/50">
          {users.length === 0 ? (
            <div className="p-6">
              <EmptyState
                compact
                language={language}
                icon={<Users size={24} />}
                titleEn="No members registered yet"
                titleRw="Nta banyamuryango banditswe"
                descriptionEn="Register cooperative members from the Admin Dashboard. They can then sign in with their phone and PIN."
                descriptionRw="Andika abanyamuryango biva ku Dashibodi ya Komite. Bazashobora kwinjira bafite telefone n’umubare w’ibanga."
              />
            </div>
          ) : (
          users.map((member, index) => (
            <div 
              key={index} 
              className="px-6 py-4 hover:bg-background/40 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-border-subtle"
                />
                <div>
                  <h4 className="text-sm font-bold text-oil-black leading-snug">
                    {member.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                    <span className="font-semibold text-primary">{member.phone}</span>
                    <span>•</span>
                    <span className="capitalize">{member.role === 'admin' ? (language === 'en' ? 'Admin / Committee' : 'Komite') : (language === 'en' ? 'Saver' : 'Umunyamuryango')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border-subtle/30 pt-3 sm:pt-0">
                <div>
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block sm:text-right">
                    {language === 'en' ? 'Join Date' : 'Umunsi yandikiwe'}
                  </span>
                  <span className="text-xs font-semibold text-oil-black flex items-center gap-1 mt-0.5 sm:justify-end">
                    <Calendar size={12} className="text-text-secondary" />
                    {member.joinDate}
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">
                    {language === 'en' ? 'Personal savings' : 'Ubwizigame bwite'}
                  </span>
                  <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                    {formatRwf(member.savingsBalance)}
                  </span>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}
