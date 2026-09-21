import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { getSeoDataForPath, getPathForTabId } from '../seo/pagesSeoData';

interface SeoPageGuideCardProps {
  activeTab: string;
  isLightMode?: boolean;
}

export const SeoPageGuideCard: React.FC<SeoPageGuideCardProps> = ({ activeTab, isLightMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const targetPath = getPathForTabId(activeTab);
  const pageSeo = getSeoDataForPath(targetPath);

  if (!pageSeo) return null;

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => prev === idx ? null : idx);
  };

  return (
    <section 
      aria-label="Guide et questions fréquentes"
      className={`mt-10 mb-8 rounded-2xl border transition-all duration-300 overflow-hidden ${
        isLightMode 
          ? 'bg-white border-slate-200 shadow-sm text-slate-800' 
          : 'bg-slate-900/80 border-slate-800 text-slate-200'
      }`}
    >
      <div 
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none transition-colors ${
          isLightMode 
            ? 'hover:bg-slate-50' 
            : 'hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isLightMode ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/20 text-sky-400'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>Guide &amp; FAQ : {pageSeo.h1.split(' - ')[0]}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isLightMode ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
              }`}>
                Données Publiques
              </span>
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Comprendre les modèles scientifiques, les capteurs et les seuils de référence
            </p>
          </div>
        </div>

        <button 
          type="button"
          aria-expanded={isOpen}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
            isLightMode 
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>{isOpen ? 'Masquer' : 'Consulter'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className={`p-4 sm:p-6 border-t ${isLightMode ? 'border-slate-100' : 'border-slate-800/80'} space-y-6`}>
          {/* Introduction & Méthodologie */}
          <div className={`p-4 rounded-xl text-sm leading-relaxed ${
            isLightMode ? 'bg-slate-50 text-slate-700' : 'bg-slate-800/40 text-slate-300'
          }`}>
            <p>{pageSeo.intro}</p>
          </div>

          {/* Sections explicatives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pageSeo.sections.map((sec, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border ${
                  isLightMode 
                    ? 'bg-white border-slate-200' 
                    : 'bg-slate-800/30 border-slate-800'
                }`}
              >
                <h3 className="text-sm font-bold text-sky-500 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{sec.title}</span>
                </h3>
                <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  {sec.content}
                </p>
              </div>
            ))}
          </div>

          {/* FAQ interactive */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Questions Fréquentes sur cette Observatoire</span>
            </h3>

            <div className="space-y-2.5">
              {pageSeo.faq.map((item, idx) => {
                const isFaqOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx}
                    className={`rounded-xl border transition-all ${
                      isLightMode 
                        ? 'border-slate-200 bg-white' 
                        : 'border-slate-800 bg-slate-800/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs sm:text-sm font-semibold"
                    >
                      <span className={isLightMode ? 'text-slate-800' : 'text-slate-200'}>
                        {item.question}
                      </span>
                      {isFaqOpen ? (
                        <ChevronUp className="w-4 h-4 text-sky-400 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      )}
                    </button>

                    {isFaqOpen && (
                      <div className={`px-3.5 pb-3.5 text-xs sm:text-sm leading-relaxed border-t pt-2.5 ${
                        isLightMode 
                          ? 'border-slate-100 text-slate-600' 
                          : 'border-slate-800 text-slate-300'
                      }`}>
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
