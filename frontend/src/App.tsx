import React, { useEffect, useState } from 'react';
import { GlobalState, Language } from './types';
import { apiGet, apiPost, clearToken } from './lib/api';
import Login from './components/Login';
import WelcomeOnboarding from './components/WelcomeOnboarding';
import Dashboard from './components/Dashboard';
import SavingsHistory from './components/SavingsHistory';
import LoanRequest from './components/LoanRequest';
import AdminDashboard from './components/AdminDashboard';
import MembersList from './components/MembersList';
import ApprovalsQueue from './components/ApprovalsQueue';
import OpportunityFeed from './components/OpportunityFeed';
import ProfileSettings from './components/ProfileSettings';

import { 
  Landmark, 
  Wallet, 
  ArrowDownRight, 
  Users, 
  Layers, 
  Settings, 
  LogOut, 
  Globe, 
  Menu, 
  X, 
  Hourglass
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<GlobalState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('terura_onboarding_done') === 'true';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('terura_theme') === 'dark';
  });
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  // Fetch state on mount and sync dark mode
  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchState = async () => {
    try {
      const { ok, data, error } = await apiGet<GlobalState>('/api/state', true, 'en', 'general');
      if (ok) {
        setState(data);
        setBootstrapError(null);
      } else {
        setBootstrapError(error ?? null);
      }
    } catch {
      setBootstrapError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = async (lang: Language) => {
    const loggedOut = !state?.currentUser;

    setState((prev) => (prev ? { ...prev, language: lang } : prev));

    try {
      const { ok, data } = await apiPost<GlobalState>(
        '/api/language',
        { language: lang },
        !loggedOut
      );
      if (ok) {
        setState(loggedOut ? { ...data, currentUser: null } : data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (updatedState: GlobalState) => {
    setState(updatedState);
    setActiveTab('home');
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    localStorage.setItem('terura_onboarding_done', 'true');
  };

  const handleLogout = () => {
    clearToken();
    setState(prev => prev ? { ...prev, currentUser: null } : null);
    setOnboardingCompleted(false);
    localStorage.removeItem('terura_onboarding_done');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-text-secondary mt-4 uppercase tracking-wider">
          Terura loading...
        </p>
      </div>
    );
  }

  // 1. Logged out state
  if (!state || !state.currentUser) {
    return (
      <Login 
        language={state?.language || 'en'} 
        onLanguageChange={handleLanguageToggle}
        onLoginSuccess={handleLoginSuccess}
        bootstrapNotice={bootstrapError}
      />
    );
  }

  const { currentUser, language } = state;

  // 2. Welcome Onboarding state
  if (!onboardingCompleted) {
    return (
      <WelcomeOnboarding 
        language={language} 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // 3. Authenticated State: Router Tab Rendering
  const renderTabContent = () => {
    if (currentUser.role === 'admin') {
      switch (activeTab) {
        case 'home':
          return (
            <AdminDashboard 
              state={state} 
              language={language} 
              onStateChange={setState}
              onNavigateToTab={setActiveTab}
            />
          );
        case 'savings':
          return <SavingsHistory state={state} language={language} />;
        case 'members':
          return <MembersList state={state} language={language} />;
        case 'approvals':
          return (
            <ApprovalsQueue 
              state={state} 
              language={language} 
              onStateChange={setState}
            />
          );
        case 'opportunities':
          return (
            <OpportunityFeed 
              state={state} 
              language={language} 
              onStateChange={setState}
            />
          );
        case 'profile':
          return (
            <ProfileSettings 
              state={state} 
              language={language} 
              onLanguageChange={handleLanguageToggle}
              onStateChange={setState}
              onLogout={handleLogout}
              darkMode={darkMode}
              onToggleDarkMode={(val) => {
                setDarkMode(val);
                localStorage.setItem('terura_theme', val ? 'dark' : 'light');
              }}
            />
          );
        default:
          return <AdminDashboard state={state} language={language} onStateChange={setState} onNavigateToTab={setActiveTab} />;
      }
    } else {
      // Ordinary Member View
      switch (activeTab) {
        case 'home':
          return (
            <Dashboard 
              state={state} 
              language={language} 
              onStateChange={setState}
              onNavigateToTab={setActiveTab}
            />
          );
        case 'savings':
          return <SavingsHistory state={state} language={language} />;
        case 'loans':
          return (
            <LoanRequest 
              state={state} 
              language={language} 
              onStateChange={setState}
            />
          );
        case 'profile':
          return (
            <ProfileSettings 
              state={state} 
              language={language} 
              onLanguageChange={handleLanguageToggle}
              onStateChange={setState}
              onLogout={handleLogout}
              darkMode={darkMode}
              onToggleDarkMode={(val) => {
                setDarkMode(val);
                localStorage.setItem('terura_theme', val ? 'dark' : 'light');
              }}
            />
          );
        default:
          return <Dashboard state={state} language={language} onStateChange={setState} onNavigateToTab={setActiveTab} />;
      }
    }
  };

  // Navigation configurations
  const memberNavItems = [
    { id: 'home', labelEn: 'Home', labelRw: 'Ahabanza', icon: <Landmark size={20} /> },
    { id: 'savings', labelEn: 'Savings', labelRw: 'Ubwizigame', icon: <Wallet size={20} /> },
    { id: 'loans', labelEn: 'Loans', labelRw: 'Inguzanyo', icon: <ArrowDownRight size={20} /> },
    { id: 'profile', labelEn: 'Profile', labelRw: 'Imyirondoro', icon: <Settings size={20} /> },
  ];

  const adminNavItems = [
    { id: 'home', labelEn: 'Admin Dashboard', labelRw: 'Komite', icon: <Landmark size={20} /> },
    { id: 'savings', labelEn: 'Group Savings', labelRw: 'Ikigega cyose', icon: <Wallet size={20} /> },
    { id: 'members', labelEn: 'Members', labelRw: 'Abanyamuryango', icon: <Users size={20} /> },
    { id: 'approvals', labelEn: 'Approvals', labelRw: 'Ubusabe buhari', icon: <Hourglass size={20} /> },
    { id: 'opportunities', labelEn: 'Opportunities', labelRw: 'Amahirwe', icon: <Layers size={20} /> },
    { id: 'profile', labelEn: 'Settings', labelRw: 'Ihitamo', icon: <Settings size={20} /> },
  ];

  const activeNavItems = currentUser.role === 'admin' ? adminNavItems : memberNavItems;

  return (
    <div className="min-h-screen bg-background text-oil-black flex flex-col md:flex-row font-sans">
      
      {/* Desktop Left Sidebar Navigation */}
      <aside className="hidden md:flex md:w-64 bg-surface border-r border-border-subtle flex-col justify-between p-6 h-screen sticky top-0">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-subtle">
              <Landmark size={20} />
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-oil-black">Terura</span>
              <span className="block text-[10px] text-text-secondary font-semibold uppercase tracking-widest mt-0.5">Bilingual Core</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {activeNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 font-semibold text-xs transition-all ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-pressed' 
                    : 'text-text-secondary hover:bg-background hover:text-oil-black'
                }`}
              >
                {item.icon}
                <span>{language === 'en' ? item.labelEn : item.labelRw}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User detail & Logout */}
        <div className="pt-6 border-t border-border-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.profileImage}
                alt={currentUser.name}
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-full object-cover border border-border-subtle cursor-pointer hover:opacity-80 transition-all flex-shrink-0"
              />
              <div className="truncate">
                <span className="block text-xs font-bold text-oil-black truncate">{currentUser.name}</span>
                <span className="block text-[10px] text-text-secondary capitalize font-semibold">{currentUser.role} Account</span>
              </div>
            </div>

            {/* Desktop Quick Language Selector */}
            <div className="flex bg-background border border-border-subtle rounded-full p-0.5 flex-shrink-0">
              <button
                onClick={() => handleLanguageToggle('en')}
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full transition-all ${
                  language === 'en' ? 'bg-primary text-white shadow-subtle' : 'text-text-secondary hover:text-oil-black'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageToggle('rw')}
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full transition-all ${
                  language === 'rw' ? 'bg-primary text-white shadow-subtle' : 'text-text-secondary hover:text-oil-black'
                }`}
                title="Kinyarwanda"
              >
                RW
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="h-10 border border-red-100 hover:bg-red-50 text-error text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all w-full"
          >
            <LogOut size={14} />
            <span>{language === 'en' ? 'Log Out' : 'Sohoka'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-surface border-b border-border-subtle h-16 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-subtle">
            <Landmark size={16} />
          </div>
          <span className="font-bold font-display tracking-tight text-oil-black text-lg">Terura</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Language Trigger */}
          <div className="flex bg-background border border-border-subtle rounded-full p-0.5">
            <button
              onClick={() => handleLanguageToggle('en')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${language === 'en' ? 'bg-primary text-white' : 'text-text-secondary'}`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageToggle('rw')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${language === 'rw' ? 'bg-primary text-white' : 'text-text-secondary'}`}
            >
              RW
            </button>
          </div>

          {/* User profile small trigger */}
          <img
            src={currentUser.profileImage}
            alt={currentUser.name}
            onClick={() => setActiveTab('profile')}
            className="w-7 h-7 rounded-full object-cover border border-border-subtle shadow-pressed cursor-pointer"
          />
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
        {renderTabContent()}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-subtle h-16 flex items-center justify-around px-2 z-40 shadow-subtle">
        {activeNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
              activeTab === item.id ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === item.id ? 'bg-primary/10' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[9px] font-bold mt-0.5 max-w-[64px] truncate">
              {language === 'en' ? item.labelEn : item.labelRw}
            </span>
          </button>
        ))}
      </nav>

    </div>
  );
}
