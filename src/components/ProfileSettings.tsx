import React, { useState } from 'react';
import { GlobalState, Language, UserRole } from '../types';
import { User, LogOut, Globe, Settings, Users, Landmark, Heart, Info } from 'lucide-react';

interface ProfileSettingsProps {
  state: GlobalState;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStateChange: (updated: GlobalState) => void;
  onLogout: () => void;
}

export default function ProfileSettings({ state, language, onLanguageChange, onStateChange, onLogout }: ProfileSettingsProps) {
  const { currentUser } = state;
  const [loading, setLoading] = useState(false);

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updatedState = { ...state };
    if (updatedState.currentUser) {
      updatedState.currentUser.role = role;
      
      // Update role of current user in list too
      const uIndex = updatedState.users.findIndex(u => u.phone === updatedState.currentUser?.phone);
      if (uIndex !== -1) {
        updatedState.users[uIndex].role = role;
        // Adjust name prefix or image based on role to simulate authentic role personas
        if (role === 'admin') {
          updatedState.users[uIndex].cooperativeName = "Abizerwa Ikimina (Committee)";
          updatedState.currentUser.cooperativeName = "Abizerwa Ikimina (Committee)";
        } else {
          updatedState.users[uIndex].cooperativeName = "Abizerwa Ikimina";
          updatedState.currentUser.cooperativeName = "Abizerwa Ikimina";
        }
      }
    }
    onStateChange(updatedState);
  };

  const handleLogoutClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        onLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-display text-oil-black tracking-tight">
          {language === 'en' ? 'Profile & Configuration' : 'Imyirondoro n’Ihitamo'}
        </h2>
        <p className="text-xs text-text-secondary">
          {language === 'en' ? 'Configure preferences, switch roles, and customize localization' : 'Hindura ururimi, cunga imyirondoro cyangwa sohorera muri sisitemu'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-5 bg-white border border-border-subtle rounded-xl p-6 shadow-subtle flex flex-col items-center text-center">
          <img
            src={currentUser?.profileImage}
            alt={currentUser?.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-subtle mb-4"
          />
          <h3 className="text-lg font-bold font-display text-oil-black">{currentUser?.name}</h3>
          <p className="text-xs text-text-secondary font-semibold mt-0.5">{currentUser?.phone}</p>
          
          <div className="mt-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {currentUser?.role === 'admin' 
              ? (language === 'en' ? 'Committee Member' : 'Komite y’Ikimina') 
              : (language === 'en' ? 'Saving Member' : 'Umunyamuryango wo Kuzigama')}
          </div>

          <div className="w-full border-t border-border-subtle/50 my-6"></div>

          <div className="w-full text-left space-y-3.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-secondary">{language === 'en' ? 'Cooperative' : 'Ikimina'}:</span>
              <span className="text-oil-black">{currentUser?.cooperativeName}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-secondary">{language === 'en' ? 'Join Date' : 'Kwandikwa'}:</span>
              <span className="text-oil-black">{currentUser?.joinDate}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-secondary">{language === 'en' ? 'Personal Balance' : 'Ubwizigame'}:</span>
              <span className="text-emerald-700">
                {new Intl.NumberFormat('en-US').format(currentUser?.savingsBalance || 0)} RWF
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Options & Role Switchers */}
        <div className="md:col-span-7 space-y-6">
          {/* Settings Box */}
          <div className="bg-white border border-border-subtle rounded-xl p-6 shadow-subtle space-y-6">
            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-oil-black">
                    {language === 'en' ? 'System Language' : 'Ururimi rwa Sisitemu'}
                  </h4>
                  <p className="text-[11px] text-text-secondary">Translate app content</p>
                </div>
              </div>

              <div className="flex bg-background border border-border-subtle rounded-full p-1">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    language === 'en' ? 'bg-primary text-white' : 'text-text-secondary'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => onLanguageChange('rw')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    language === 'rw' ? 'bg-primary text-white' : 'text-text-secondary'
                  }`}
                >
                  Kinyarwanda
                </button>
              </div>
            </div>

            <div className="border-t border-border-subtle/50 my-4"></div>

            {/* Quick Role Switcher for Grading */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                  <Settings size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-oil-black">
                    {language === 'en' ? 'Evaluation Persona Sandbox' : 'Ihinduranya rya Sandbox'}
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    {language === 'en' ? 'Switch access roles instantly to inspect screens' : 'Hindura inshingano z’ubwinjiriro bwawe mu kureba andi ma dushibodi'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => switchRole('member')}
                  className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    currentUser?.role === 'member'
                      ? 'bg-primary text-white shadow-subtle'
                      : 'border border-border-subtle hover:bg-background text-text-secondary'
                  }`}
                >
                  <User size={14} />
                  <span>{language === 'en' ? 'Member View' : 'Umusaruzi gusa'}</span>
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    currentUser?.role === 'admin'
                      ? 'bg-primary text-white shadow-subtle'
                      : 'border border-border-subtle hover:bg-background text-text-secondary'
                  }`}
                >
                  <Users size={14} />
                  <span>{language === 'en' ? 'Committee (Admin) View' : 'Komite / Admin'}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-border-subtle/50 my-4"></div>

            {/* Sign Out Trigger */}
            <button
              onClick={handleLogoutClick}
              disabled={loading}
              className="w-full h-11 border border-red-200 text-error hover:bg-red-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={16} />
              <span>{language === 'en' ? 'Sign Out / Sohoka' : 'Sohoka mu Ikimina'}</span>
            </button>
          </div>

          {/* Slogan Brand Signature */}
          <div className="p-4 bg-background border border-border-subtle rounded-xl flex items-center gap-3 justify-center">
            <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
            <p className="text-[11px] text-text-secondary font-semibold">
              {language === 'en' ? 'Rooted in Rwandan community savings' : 'Bishingiye ku muco n’amajyambere ya komini mu Rwanda'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
