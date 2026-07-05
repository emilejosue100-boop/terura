import React, { useState } from 'react';
import { Language } from '../types';
import { Landmark, Sparkles, TrendingUp, Users } from 'lucide-react';

interface WelcomeOnboardingProps {
  language: Language;
  onComplete: () => void;
}

export default function WelcomeOnboarding({ language, onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Users size={48} className="text-primary stroke-[1.5]" />,
      titleEn: "Grow Wealth Together",
      titleRw: "Gukurana Ubudahuga",
      descEn: "Turn your cooperative paper ledger into a simple, secure digital fund. Save weekly alongside trusted members of your community.",
      descRw: "Hindura ikaye ya terura yanyu mu buryo bw’ikoranabuhanga ryizewe. Zigama buri cyumweru ufatanije n’abo wizera mu muryango wawe."
    },
    {
      icon: <Landmark size={48} className="text-accent stroke-[1.5]" />,
      titleEn: "Affordable Micro-Loans",
      titleRw: "Inguzanyo ziciriritse zoroshye",
      descEn: "Request emergency funds, agricultural pre-orders, or small business kiosk investment directly within your group with friendly community review.",
      descRw: "Saba inguzanyo z’ingoboka, iz’ubuhinzi cyangwa izo kwagura ubucuruzi bwawe binyuze mu buryo bworoshye n’isuzuma ry’abagize terura."
    },
    {
      icon: <Sparkles size={48} className="text-primary stroke-[1.5]" />,
      titleEn: "Smart Group Opportunities",
      titleRw: "Amahirwe y’ishoramari y’itsinda",
      descEn: "Our server-side AI analyzes active government bonds, high-yield SACCO deposits, and agricultural cooperative exports to grow your collective fund safely.",
      descRw: "Ikoranabuhanga rya AI risuzuma impapuro z’agaciro za Leta, imigabane mu mabanki, n’ubuhinzi kugira ngo ikigega cyanyu kirusheho kwaguka neza."
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const current = steps[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-oil-black">
      <div className="w-full max-w-md bg-white border border-border-subtle rounded-xl p-8 shadow-subtle flex flex-col justify-between min-h-[480px]">
        {/* Top bar with progress indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-primary' : 'w-2.5 bg-border-subtle'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={onComplete}
            className="text-xs font-semibold text-text-secondary hover:text-oil-black"
          >
            {language === 'en' ? 'Skip' : 'Simbuka'}
          </button>
        </div>

        {/* Dynamic Center Illustration & Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <div className="w-24 h-24 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-subtle mb-6 animate-pulse">
            {current.icon}
          </div>
          <h2 className="text-2xl font-bold font-display text-oil-black tracking-tight mb-3">
            {language === 'en' ? current.titleEn : current.titleRw}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
            {language === 'en' ? current.descEn : current.descRw}
          </p>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 h-12 border border-border-subtle text-oil-black font-semibold rounded-xl hover:bg-background active:scale-[0.98] transition-all text-sm"
            >
              {language === 'en' ? 'Back' : 'Inyuma'}
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl shadow-subtle hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm"
          >
            {step === steps.length - 1 ? (
              <>
                <span>{language === 'en' ? 'Get Started' : 'Tangira None'}</span>
                <TrendingUp size={16} />
              </>
            ) : (
              <span>{language === 'en' ? 'Continue' : 'Komeza'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
