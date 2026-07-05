import React, { useState } from 'react';
import { GlobalState, Language, User } from '../types';
import { PiggyBank, Landmark, Users, Clock, Plus, FileSpreadsheet, ChevronRight, Check } from 'lucide-react';

interface AdminDashboardProps {
  state: GlobalState;
  language: Language;
  onStateChange: (updated: GlobalState) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function AdminDashboard({ state, language, onStateChange, onNavigateToTab }: AdminDashboardProps) {
  const { groupSavings, activeLoansCount, activeLoansAmount, users, loanRequests } = state;
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPin, setNewMemberPin] = useState('1234');
  const [successMsg, setSuccessMsg] = useState('');

  const pendingRequests = loanRequests.filter(l => l.status === 'pending');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) return;

    const newUser: User = {
      name: newMemberName,
      phone: newMemberPhone,
      pin: newMemberPin,
      role: 'member',
      cooperativeName: "Abizerwa Terura",
      savingsBalance: 0,
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };

    // State update local simulation
    const updatedState = { ...state };
    updatedState.users.push(newUser);
    onStateChange(updatedState);

    setSuccessMsg(language === 'en' ? 'New member registered!' : 'Umuryango mushya winjiye!');
    setNewMemberName('');
    setNewMemberPhone('');
    setTimeout(() => {
      setSuccessMsg('');
      setShowAddMemberModal(false);
    }, 1500);
  };

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val) + ' RWF';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-display text-oil-black tracking-tight">
          {language === 'en' ? 'Admin Dashboard' : 'Dashibodi ya Komite'}
        </h2>
        <p className="text-xs text-text-secondary">
          {language === 'en' ? 'Oversee cooperative growth and process pending approvals' : 'Cunga neza ikigega cya terura n’ubusabe bwose bw’abanyamuryango'}
        </p>
      </div>

      {/* Stats Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Group Savings */}
        <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {language === 'en' ? 'Total Group Fund' : 'Ikigega Rusange'}
            </span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-oil-black">{formatRwf(groupSavings)}</h3>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
              ↑ +12% {language === 'en' ? 'this month' : 'uku kwezi'}
            </span>
          </div>
        </div>

        {/* Card 2: Active Loans */}
        <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {language === 'en' ? 'Active Loans' : 'Inguzanyo zirasohotse'}
            </span>
            <div className="w-8 h-8 bg-amber-50 text-warning rounded-lg flex items-center justify-center">
              <Landmark size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-oil-black">{formatRwf(activeLoansAmount)}</h3>
            <span className="text-[10px] text-text-secondary font-semibold block mt-1">
              🔄 {activeLoansCount} {language === 'en' ? 'currently active' : 'inguzanyo ziracyakora'}
            </span>
          </div>
        </div>

        {/* Card 3: Member Count */}
        <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {language === 'en' ? 'Total Members' : 'Abanyamuryango'}
            </span>
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-oil-black">{users.length} {language === 'en' ? 'Savers' : 'Abazirizwa'}</h3>
            {/* Avatar Stack */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex -space-x-2">
                {users.slice(0, 3).map((u, i) => (
                  <img
                    key={i}
                    src={u.profileImage}
                    alt={u.name}
                    className="w-5 h-5 rounded-full object-cover border border-white"
                  />
                ))}
              </div>
              <span className="text-[10px] text-text-secondary font-bold">
                + {users.length > 3 ? users.length - 3 : 0} {language === 'en' ? 'more' : 'abandi'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className={`border rounded-xl p-5 shadow-subtle flex flex-col justify-between transition-all ${
          pendingRequests.length > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-border-subtle'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {language === 'en' ? 'Pending Approvals' : 'Ubusabe buhari'}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pendingRequests.length > 0 ? 'bg-red-100 text-error animate-pulse' : 'bg-neutral-100 text-neutral-500'
            }`}>
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-oil-black">
              {pendingRequests.length} {language === 'en' ? 'Requests' : 'Ubusabe'}
            </h3>
            {pendingRequests.length > 0 ? (
              <button
                onClick={() => onNavigateToTab('approvals')}
                className="text-[10px] text-error font-bold flex items-center gap-1 mt-1 hover:underline"
              >
                {language === 'en' ? 'Review Now' : 'Suzuma None'}
                <ChevronRight size={10} />
              </button>
            ) : (
              <span className="text-[10px] text-text-secondary font-medium block mt-1">
                {language === 'en' ? 'All caught up' : 'Byose byakemutse'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle row: Quick Actions & Staging Announcement */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: SVG Group Savings Curve */}
        <div className="md:col-span-8 bg-white border border-border-subtle rounded-xl p-6 shadow-subtle">
          <div className="flex justify-between items-end mb-4 border-b border-border-subtle/50 pb-3">
            <div>
              <h3 className="text-sm font-bold font-display text-oil-black">
                {language === 'en' ? 'Group Savings Over Time' : 'Imikurire y’ikigega rusange'}
              </h3>
              <p className="text-[11px] text-text-secondary">6-Month Cooperative Compound Index</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {formatRwf(groupSavings)}
            </span>
          </div>

          <div className="h-44 relative pt-2">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F5C3F" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1F5C3F" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 140 Q 150 110 300 100 T 600 40 L 600 170 Z"
                fill="url(#grpGrad)"
              />
              <path
                d="M 0 140 Q 150 110 300 100 T 600 40"
                fill="none"
                stroke="#1F5C3F"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="600" cy="40" r="6" fill="#1F5C3F" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Right Side: Quick Action Panel */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-subtle">
            <h3 className="text-xs font-bold text-oil-black uppercase tracking-widest mb-3">
              {language === 'en' ? 'Quick Actions' : 'Ibikorwa byihuse'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-subtle"
              >
                <Plus size={16} />
                {language === 'en' ? 'Register New Member' : 'Andika Umuryango Mushya'}
              </button>
              <button
                onClick={() => onNavigateToTab('members')}
                className="w-full h-11 border border-border-subtle hover:bg-background active:scale-[0.98] text-oil-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <FileSpreadsheet size={16} className="text-primary" />
                {language === 'en' ? 'Browse Member Ledger' : 'Reba ibitabo by’Abanyamuryango'}
              </button>
            </div>
          </div>

          <div className="bg-background border border-border-subtle rounded-xl p-4 flex gap-3">
            <div className="w-8 h-8 bg-accent/20 text-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="stroke-[2]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-oil-black uppercase tracking-wide">
                {language === 'en' ? 'Next Group Assembly' : 'Inama Itaha ya Terura'}
              </p>
              <p className="text-[11px] text-text-secondary leading-normal mt-0.5">
                {language === 'en' 
                  ? 'Friday, 15th at 4:00 PM at the community hall.' 
                  : 'Kuwa Gatanu, ku isaha ya saa kumi z’umugoroba mu nzu mberabyombi.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-subtle border border-border-subtle relative">
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-oil-black"
            >
              <Plus size={18} className="rotate-45" />
            </button>
            <h3 className="text-lg font-bold font-display text-oil-black mb-1">
              {language === 'en' ? 'Register Cooperative Member' : 'Andika Umuryango Mushya'}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              {language === 'en' 
                ? 'Create a login profile for a new cooperative member.' 
                : 'Cyangwa andika imyirondoro n’uburenganzira bw’umunyamuryango mushya.'}
            </p>

            {successMsg ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-200">
                  <Check size={20} />
                </div>
                <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-oil-black mb-1">
                    {language === 'en' ? 'Full Name' : 'Izina Ryose'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marie Chantal"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-oil-black mb-1">
                    {language === 'en' ? 'Phone Number' : 'Nomero ya Telefone'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0788999888"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-oil-black mb-1">
                    {language === 'en' ? 'Temporary Login PIN (4 digits)' : 'Umubare w’ibanga w’agateganyo'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newMemberPin}
                    onChange={(e) => setNewMemberPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 px-3 bg-background border border-border-subtle rounded-xl text-sm tracking-widest focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 h-11 border border-border-subtle text-oil-black font-semibold rounded-xl text-xs hover:bg-background"
                  >
                    {language === 'en' ? 'Cancel' : 'Hagarika'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-primary text-white font-semibold rounded-xl text-xs hover:bg-primary-hover"
                  >
                    {language === 'en' ? 'Register' : 'Andika'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
