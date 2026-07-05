import React, { useState } from 'react';
import { Language, GlobalState } from '../types';
import { Shield, Smartphone, Globe, Landmark } from 'lucide-react';

interface LoginProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (updatedState: GlobalState) => void;
}

export default function Login({ language, onLanguageChange, onLoginSuccess }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !pin) {
      setError(language === 'en' ? 'Please fill in all fields' : 'Uzuza ibyasabwe byose');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.state);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(language === 'en' ? 'Connection error' : 'Hari ikibazo cy’itumanaho');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (p: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, pin: code }),
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.state);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4">
      {/* Top Header Logo */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-subtle mb-3">
          <Landmark size={32} className="stroke-[1.5]" />
        </div>
        <h1 className="text-3xl font-bold text-oil-black font-display tracking-tight flex items-center gap-1">
          Ikimina<span className="text-accent">+</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-xs px-2">
          {language === 'en' 
            ? 'Your savings cooperative, digitized with trust.' 
            : 'Ikimina cyanyu mu buryo bw’ikoranabuhanga n’icyizere.'}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-border-subtle rounded-xl p-6 md:p-8 shadow-subtle">
        {/* Language selector in login card */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-subtle">
          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
            <Globe size={14} />
            {language === 'en' ? 'Select Language' : 'Hitamo Ururimi'}
          </span>
          <div className="flex bg-background rounded-full p-1 border border-border-subtle">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                language === 'en' 
                  ? 'bg-primary text-white' 
                  : 'text-text-secondary hover:text-oil-black'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('rw')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                language === 'rw' 
                  ? 'bg-primary text-white' 
                  : 'text-text-secondary hover:text-oil-black'
              }`}
            >
              RW
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-error text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-oil-black mb-1.5 uppercase tracking-wider">
              {language === 'en' ? 'Phone Number' : 'Nomero ya Telefone'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                <Smartphone size={18} />
              </span>
              <input
                type="text"
                placeholder="e.g. 0788123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-background border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-oil-black mb-1.5 uppercase tracking-wider">
              {language === 'en' ? 'Security PIN (4 digits)' : 'Umubare w’ibanga (Imibare 4)'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                <Shield size={18} />
              </span>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 pl-10 pr-4 bg-background border border-border-subtle rounded-xl text-sm tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-semibold rounded-xl shadow-subtle hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center text-sm"
          >
            {loading ? (
              <span className="inline-block border-2 border-white border-t-transparent w-5 h-5 rounded-full animate-spin"></span>
            ) : (
              language === 'en' ? 'Sign In / Register' : 'Yinjire / Kwiyandikisha'
            )}
          </button>
        </form>

        {/* Demo Fast Logins Section */}
        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-center text-[11px] font-semibold text-text-secondary uppercase tracking-widest mb-3">
            {language === 'en' ? 'Evaluation Quick-Logins' : 'Kwinjira byihuse'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => quickLogin('0788123456', '1234')}
              disabled={loading}
              className="flex flex-col items-center p-2.5 bg-background border border-border-subtle hover:border-primary rounded-xl transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80"
                className="w-8 h-8 rounded-full object-cover mb-1 border border-border-subtle"
                alt="Jean"
              />
              <span className="text-[11px] font-bold text-oil-black">Jean (Member)</span>
              <span className="text-[9px] text-text-secondary font-medium">PIN: 1234</span>
            </button>
            <button
              onClick={() => quickLogin('0788654321', '4321')}
              disabled={loading}
              className="flex flex-col items-center p-2.5 bg-background border border-border-subtle hover:border-primary rounded-xl transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80"
                className="w-8 h-8 rounded-full object-cover mb-1 border border-border-subtle"
                alt="Alice"
              />
              <span className="text-[11px] font-bold text-oil-black">Alice (Admin)</span>
              <span className="text-[9px] text-text-secondary font-medium">PIN: 4321</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
