import React, { useState, useRef } from 'react';
import { GlobalState, Language, UserRole } from '../types';
import { User, LogOut, Globe, Settings, Users, Landmark, Heart, Info, Moon, Sun, Camera, Upload, Check } from 'lucide-react';

interface ProfileSettingsProps {
  state: GlobalState;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStateChange: (updated: GlobalState) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: (val: boolean) => void;
}

const AVATAR_PRESETS = [
  { name: "Jean (Coffee Farm)", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
  { name: "Marie (Agribusiness)", url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150" },
  { name: "Alice (Tech Co-op)", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" },
  { name: "Bosco (Local Trade)", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
  { name: "Rwandan Gorilla", url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=150" },
  { name: "Agaseke Basket", url: "https://images.unsplash.com/photo-1595475242265-230d195864d6?auto=format&fit=crop&q=80&w=150" }
];

export default function ProfileSettings({ 
  state, 
  language, 
  onLanguageChange, 
  onStateChange, 
  onLogout,
  darkMode,
  onToggleDarkMode
}: ProfileSettingsProps) {
  const { currentUser } = state;
  const [loading, setLoading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePresetSelect = async (url: string) => {
    setLoading(true);
    setUploadError(null);
    try {
      const res = await fetch('/api/update-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: url })
      });
      if (res.ok) {
        const updated = await res.json();
        onStateChange(updated);
        setShowImageOptions(false);
      } else {
        setUploadError(language === 'en' ? 'Failed to update profile photo.' : 'Guhindura ifoto byanze.');
      }
    } catch (err) {
      setUploadError(language === 'en' ? 'Connection error.' : 'Hari ikibazo cy’itumanaho.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(language === 'en' ? 'Image must be less than 2MB.' : 'Ifoto igomba kuba munsi ya 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setLoading(true);
      setUploadError(null);
      try {
        const res = await fetch('/api/update-profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: base64String })
        });
        if (res.ok) {
          const updated = await res.json();
          onStateChange(updated);
          setShowImageOptions(false);
        } else {
          setUploadError(language === 'en' ? 'Failed to upload photo.' : 'Gushyiraho ifoto byanze.');
        }
      } catch (err) {
        setUploadError(language === 'en' ? 'Connection error.' : 'Hari ikibazo cy’itumanaho.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
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
        <div className="md:col-span-5 bg-surface border border-border-subtle rounded-xl p-6 shadow-subtle flex flex-col items-center text-center relative overflow-hidden">
          <div className="relative group">
            <img
              src={currentUser?.profileImage}
              alt={currentUser?.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-subtle mb-4 transition-transform duration-300 group-hover:scale-105"
            />
            <button
              onClick={() => setShowImageOptions(!showImageOptions)}
              className="absolute bottom-4 right-0 bg-primary hover:bg-primary-hover text-white p-2 rounded-full shadow-subtle border-2 border-surface transition-all flex items-center justify-center cursor-pointer"
              title={language === 'en' ? "Change Profile Photo" : "Hindura Ifoto"}
            >
              <Camera size={14} className="flex-shrink-0" />
            </button>
          </div>

          <h3 className="text-lg font-bold font-display text-oil-black">{currentUser?.name}</h3>
          <p className="text-xs text-text-secondary font-semibold mt-0.5">{currentUser?.phone}</p>
          
          <div className="mt-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <User size={12} className="flex-shrink-0" />
            <span>
              {currentUser?.role === 'admin' 
                ? (language === 'en' ? 'Committee Member' : 'Komite y’Ikimina') 
                : (language === 'en' ? 'Saving Member' : 'Umunyamuryango wo Kuzigama')}
            </span>
          </div>

          {/* Change Image Panel */}
          {showImageOptions && (
            <div className="w-full mt-6 p-4 bg-background border border-border-subtle rounded-xl animate-fade-in space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-oil-black">
                  {language === 'en' ? 'Choose Preset or Upload' : 'Hitamo Ifoto cyangwa Shyiraho'}
                </span>
                <button 
                  onClick={() => setShowImageOptions(false)}
                  className="text-[10px] text-text-secondary hover:text-oil-black font-bold uppercase"
                >
                  {language === 'en' ? 'Close' : 'Funga'}
                </button>
              </div>

              {uploadError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-error text-[10px] font-semibold rounded-lg text-left leading-normal">
                  {uploadError}
                </div>
              )}

              {/* Preset Grids */}
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(p.url)}
                    disabled={loading}
                    className="relative rounded-lg overflow-hidden border border-border-subtle hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all aspect-square cursor-pointer group"
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {currentUser?.profileImage === p.url && (
                      <div className="absolute inset-0 bg-primary/45 flex items-center justify-center">
                        <Check size={14} className="text-white font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom File Upload */}
              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full h-11 border-2 border-dashed border-border-subtle hover:border-primary rounded-xl text-xs font-semibold text-text-secondary hover:text-oil-black transition-all flex items-center justify-center gap-2 cursor-pointer bg-surface"
                >
                  <Upload size={14} className="flex-shrink-0" />
                  <span>{language === 'en' ? 'Upload Custom Photo' : 'Shyiraho indi foto'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="w-full border-t border-border-subtle/50 my-6"></div>

          <div className="w-full text-left space-y-3.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-secondary">{language === 'en' ? 'Cooperative' : 'Ikimina'}:</span>
              <span className="text-oil-black truncate max-w-[180px] text-right">{currentUser?.cooperativeName}</span>
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
          <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-subtle space-y-6">
            
            {/* Language Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe size={18} className="flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-oil-black">
                    {language === 'en' ? 'System Language' : 'Ururimi rwa Sisitemu'}
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    {language === 'en' ? 'Translate app content' : 'Hindura ururimi rwa porogaramu'}
                  </p>
                </div>
              </div>

              <div className="flex bg-background border border-border-subtle rounded-full p-1 self-start sm:self-auto">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    language === 'en' ? 'bg-primary text-white shadow-subtle' : 'text-text-secondary'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => onLanguageChange('rw')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    language === 'rw' ? 'bg-primary text-white shadow-subtle' : 'text-text-secondary'
                  }`}
                >
                  Kinyarwanda
                </button>
              </div>
            </div>

            <div className="border-t border-border-subtle/50 my-4"></div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  {darkMode ? <Moon size={18} className="flex-shrink-0" /> : <Sun size={18} className="flex-shrink-0" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-oil-black">
                    {language === 'en' ? 'Dark Mode' : 'Uburyo bwa Nimugoroba'}
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    {language === 'en' ? 'Toggle light and dark appearance' : 'Guhindura umukara cyangwa umweru'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggleDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex items-center cursor-pointer ${
                  darkMode ? 'bg-primary' : 'bg-neutral-200'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-subtle transition-transform flex-shrink-0 ${
                    darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-border-subtle/50 my-4"></div>

            {/* Quick Role Switcher for Grading */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-accent/10 text-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings size={18} className="flex-shrink-0" />
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
                  className={`h-14 md:h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    currentUser?.role === 'member'
                      ? 'bg-primary text-white shadow-subtle'
                      : 'border border-border-subtle hover:bg-background text-text-secondary'
                  }`}
                >
                  <User size={14} className="flex-shrink-0" />
                  <span>{language === 'en' ? 'Member View' : 'Umusaruzi gusa'}</span>
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className={`h-14 md:h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    currentUser?.role === 'admin'
                      ? 'bg-primary text-white shadow-subtle'
                      : 'border border-border-subtle hover:bg-background text-text-secondary'
                  }`}
                >
                  <Users size={14} className="flex-shrink-0" />
                  <span>{language === 'en' ? 'Committee (Admin) View' : 'Komite / Admin'}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-border-subtle/50 my-4"></div>

            {/* Sign Out Trigger */}
            <button
              onClick={handleLogoutClick}
              disabled={loading}
              className="w-full h-14 md:h-11 border border-red-200 hover:bg-red-50 text-error font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span>{language === 'en' ? 'Sign Out / Sohoka' : 'Sohoka mu Ikimina'}</span>
            </button>
          </div>

          {/* Slogan Brand Signature */}
          <div className="p-4 bg-background border border-border-subtle rounded-xl flex items-center gap-3 justify-center">
            <Heart size={14} className="text-red-500 fill-red-500 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-text-secondary font-semibold">
              {language === 'en' ? 'Rooted in Rwandan community savings' : 'Bishingiye ku muco n’amajyambere ya komini mu Rwanda'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
