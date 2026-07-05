import React, { useState } from 'react';
import { GlobalState, Language, Opportunity } from '../types';
import { apiPost } from '../lib/api';
import EmptyState from './EmptyState';
import { Sparkles, Flag, RefreshCw, Layers, Search } from 'lucide-react';

interface OpportunityFeedProps {
  state: GlobalState;
  language: Language;
  onStateChange: (updated: GlobalState) => void;
}

export default function OpportunityFeed({ state, language, onStateChange }: OpportunityFeedProps) {
  const { opportunities } = state;
  const [refreshing, setRefreshing] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefreshFeed = async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const { ok, data } = await apiPost<GlobalState & { error?: string; code?: string }>('/api/refresh-opportunities');
      if (ok) {
        onStateChange(data);
      } else {
        setRefreshError(data.error || (language === 'en'
          ? 'Could not refresh opportunities. Try again later.'
          : 'Ntibyashoboye kuvugurura amahirwe. Ongera ugerageze.'));
      }
    } catch (err) {
      console.error(err);
      setRefreshError(
        language === 'en' ? 'Connection error while refreshing.' : 'Hari ikibazo cy’itumanaho mu kuvugurura.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleFlagForVote = async (id: string) => {
    try {
      const { ok, data } = await apiPost<GlobalState>('/api/flag-opportunity', { id });
      if (ok) {
        onStateChange(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAiToAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      const { ok, data } = await apiPost<GlobalState>('/api/analyze-opportunity', { id });
      if (ok) {
        onStateChange(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with scrape stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-oil-black tracking-tight flex items-center gap-2">
            <Layers className="text-primary stroke-[1.5]" size={22} />
            {language === 'en' ? 'Smart Opportunity Feed' : 'Ishoramari n’Amahirwe ya AI'}
          </h2>
          <p className="text-xs text-text-secondary">
            {language === 'en'
              ? 'Live data from Rwanda finance sources, curated by Gemini AI for your cooperative'
              : 'Amakuru ava mu masoko y’imari mu Rwanda, yatoranyijwe na Gemini AI ku bw’itsinda ryawe'}
          </p>
        </div>

        <button
          onClick={handleRefreshFeed}
          disabled={refreshing}
          className="h-11 bg-primary hover:bg-primary-hover disabled:bg-primary/75 text-white text-xs font-semibold px-5 rounded-xl shadow-subtle flex items-center justify-center gap-2 active:scale-[0.98] transition-all self-start sm:self-center"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing
            ? language === 'en'
              ? 'Fetching live data from Rwanda finance sources…'
              : 'Turakura amakuru mu masoko y’imari mu Rwanda…'
            : language === 'en'
              ? 'Scan Rwanda Sources'
              : 'Suzuma Amasoko mu Rwanda'}
        </button>
      </div>

      {refreshError && (
        <div className="p-3 bg-red-50 border border-red-200 text-error text-xs rounded-xl font-medium">
          {refreshError}
        </div>
      )}

      {/* Main Grid display of cards */}
      {opportunities.length === 0 ? (
        <EmptyState
          language={language}
          icon={<Search size={28} />}
          titleEn="Looking for new opportunities..."
          titleRw="Turashaka amahirwe mashya..."
          descriptionEn="Your opportunity feed is empty. Refresh to discover savings and investment options curated for your cooperative."
          descriptionRw="Nta mahirwe ahari ubu. Kanda Refresh urebe amahirwe yo kuzigama n’ishoramari yujuje ibikenewe n’itsinda ryawe."
          action={{
            labelEn: 'Refresh Opportunities',
            labelRw: 'Vugurura Amahirwe',
            onClick: handleRefreshFeed,
          }}
        />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {opportunities.map((opp) => (
          <div 
            key={opp.id} 
            className="bg-white border border-border-subtle rounded-xl shadow-subtle flex flex-col justify-between overflow-hidden relative"
          >
            {/* Top Rate Header Tag */}
            <div className="bg-primary/5 border-b border-border-subtle/50 px-5 py-4 flex justify-between items-center">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full">
                {opp.category}
              </span>
              <div className="text-right">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  {language === 'en' ? 'Target Return' : 'Inyungu ifatika'}
                </span>
                <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                  {opp.returnRate}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold font-display text-oil-black">
                    {language === 'en' ? opp.titleEn : opp.titleRw}
                  </h3>
                  <span className="text-[10px] text-text-secondary font-medium">
                    {opp.foundAgo}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-4">
                  <span>{language === 'en' ? 'Source' : 'Ikomokanyoboro'}:</span>
                  {opp.sourceUrl ? (
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {opp.source}
                    </a>
                  ) : (
                    <span className="text-primary">{opp.source}</span>
                  )}
                </div>

                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {language === 'en' ? opp.summaryEn : opp.summaryRw}
                </p>

                {/* AI Deep Risk Analysis panel */}
                {opp.aiAnalysisEn ? (
                  <div className="bg-emerald-50/55 border border-emerald-100 rounded-xl p-4 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                      <Sparkles size={13} className="fill-emerald-500 stroke-[1.5]" />
                      <span>{language === 'en' ? 'Gemini AI Suitability Analysis' : 'Gemini AI Isuzumabuguzi'}</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                      {language === 'en' ? opp.aiAnalysisEn : opp.aiAnalysisRw}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAskAiToAnalyze(opp.id)}
                    disabled={analyzingId === opp.id}
                    className="w-full py-2.5 px-4 mb-4 border border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary-hover font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={12} className={analyzingId === opp.id ? 'animate-spin' : ''} />
                    {analyzingId === opp.id 
                      ? (language === 'en' ? 'Analyzing risk...' : 'AI iri gukora...') 
                      : (language === 'en' ? 'Ask Gemini AI to Analyze Risk' : 'Saba AI gusesengura ibyago')}
                  </button>
                )}
              </div>

              {/* Lower Section Card Actions */}
              <div className="border-t border-border-subtle/50 pt-4 flex gap-2">
                <button
                  onClick={() => handleFlagForVote(opp.id)}
                  className={`flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    opp.isFlagged 
                      ? 'bg-accent/15 text-accent border border-accent/30' 
                      : 'border border-border-subtle hover:bg-background text-text-secondary hover:text-oil-black'
                  }`}
                >
                  <Flag size={14} className={opp.isFlagged ? 'fill-accent' : ''} />
                  <span>
                    {opp.isFlagged 
                      ? (language === 'en' ? 'Flagged for Vote' : 'Hatorewe itsinda') 
                      : (language === 'en' ? 'Flag for Vote' : 'Saba Gutora')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
