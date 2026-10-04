import React, { useEffect, useState } from 'react';
import { BookOpen, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Globe } from 'lucide-react';
import { getSeoDataForPath, getPathForTabId, SEO_PAGES_MAP } from '../seo/pagesSeoData';
import {
  getActiveSiteLocale,
  getNativeSiteLanguage,
  NativeSiteLang,
  SEO_PAGES_MAP_EN,
  SupportedLocaleCode,
} from '../i18n/siteTranslations';

interface SeoPageGuideCardProps {
  activeTab: string;
  currentPath?: string;
  isLightMode?: boolean;
  onNavigateRoute?: (path: string, tabId: string) => void;
}

const FOOTER_LANG_LINKS = [
  { code: 'fr', param: '', label: 'Français (FR)' },
  { code: 'en', param: '?hl=en', label: 'English (EN)' },
  { code: 'de', param: '?hl=de', label: 'Deutsch (DE)' },
  { code: 'es', param: '?hl=es', label: 'Español (ES)' },
  { code: 'it', param: '?hl=it', label: 'Italiano (IT)' },
  { code: 'pt', param: '?hl=pt', label: 'Português (PT)' },
  { code: 'nl', param: '?hl=nl', label: 'Nederlands (NL)' },
  { code: 'ar', param: '?hl=ar', label: 'العربية (AR)' },
  { code: 'zh-CN', param: '?hl=zh-CN', label: '中文 (ZH)' },
  { code: 'ja', param: '?hl=ja', label: '日本語 (JA)' },
  { code: 'ru', param: '?hl=ru', label: 'Русский (RU)' },
  { code: 'uk', param: '?hl=uk', label: 'Українська (UK)' },
];

export const SeoPageGuideCard: React.FC<SeoPageGuideCardProps> = ({
  activeTab,
  currentPath,
  onNavigateRoute,
}) => {
  // Déplié par défaut afin que Googlebot (Mobile-First Indexing) indexe 100 % du texte unique et de la FAQ
  const [isExpanded, setIsExpanded] = useState(true);
  const [nativeLang, setNativeLang] = useState<NativeSiteLang>(() => getNativeSiteLanguage());
  const [activeLocale, setActiveLocale] = useState<SupportedLocaleCode>(() => getActiveSiteLocale());

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ lang: NativeSiteLang; locale?: SupportedLocaleCode }>;
      setNativeLang(custom.detail?.lang || getNativeSiteLanguage());
      setActiveLocale(custom.detail?.locale || getActiveSiteLocale());
    };
    window.addEventListener('instant_meteo_native_lang_change', handler);
    return () => window.removeEventListener('instant_meteo_native_lang_change', handler);
  }, []);

  const resolvedPath = getPathForTabId(activeTab, currentPath);
  const seoData = getSeoDataForPath(resolvedPath, activeLocale);
  const allPages = Object.values(nativeLang === 'en' ? SEO_PAGES_MAP_EN : SEO_PAGES_MAP);

  return (
    <section
      aria-labelledby="seo-page-guide-heading"
      className="sr-only"
    >
      {/* En-tête éditorial propre à la page */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-2 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-400">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{nativeLang === 'en' ? 'Practical Guide' : 'Guide pratique'} &bull; {seoData.breadcrumbName}</span>
          </div>

          <h2
            id="seo-page-guide-heading"
            className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug"
          >
            {seoData.sectionTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {seoData.introParagraph}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-2 self-start shrink-0 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
        >
          <BookOpen className="h-4 w-4" />
          <span>
            {isExpanded
              ? nativeLang === 'en'
                ? 'Collapse guide'
                : 'Réduire le guide'
              : nativeLang === 'en'
                ? 'Show guide & FAQ'
                : 'Afficher le guide & FAQ'}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Sections explicatives uniques et FAQ de la page */}
      {isExpanded && (
        <div className="mt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {seoData.sections.map((sec, idx) => (
              <article
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2"
              >
                <h3 className="text-sm font-bold text-white leading-snug">
                  {sec.heading}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {sec.body}
                </p>
              </article>
            ))}
          </div>

          {/* Questions Fréquentes (FAQ) */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400 mb-3">
              <HelpCircle className="h-4 w-4" />
              <span>
                {nativeLang === 'en' ? 'Frequently Asked Questions — ' : 'Questions fréquentes — '}
                {seoData.breadcrumbName}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seoData.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border-l-4 border-sky-500 bg-slate-950/60 p-4 space-y-1.5"
                >
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {item.question}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Maillage interne vers les 18 pages thématiques et versions linguistiques */}
      <nav
        aria-label={nativeLang === 'en' ? 'Thematic weather sections' : 'Rubriques météo thématiques'}
        className="mt-6 pt-4 border-t border-slate-800/70 space-y-3"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">
            {nativeLang === 'en' ? 'Direct access to sections:' : 'Accès direct aux rubriques :'}
          </span>
          {allPages.map((page) => {
            const isCurrent = page.path === seoData.path;
            return (
              <a
                key={page.path}
                href={`${page.path}${nativeLang === 'en' ? '?hl=en' : ''}`}
                onClick={(e) => {
                  if (onNavigateRoute) {
                    e.preventDefault();
                    onNavigateRoute(page.path, page.tabId);
                  }
                }}
                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'bg-slate-950/50 text-slate-400 hover:text-sky-300 hover:bg-slate-800/60 border border-slate-800/60'
                }`}
              >
                {page.breadcrumbName}
              </a>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <Globe className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span>{nativeLang === 'en' ? 'Available language versions:' : 'Versions linguistiques disponibles :'}</span>
          {FOOTER_LANG_LINKS.map((l, idx) => (
            <React.Fragment key={l.code}>
              {idx > 0 && <span>&bull;</span>}
              <a
                href={`${seoData.path}${l.param}`}
                hrefLang={l.code}
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('instant_meteo_select_lang', { detail: { code: l.code } }));
                }}
                className="text-sky-400 hover:text-sky-300 hover:underline font-medium"
              >
                {l.label}
              </a>
            </React.Fragment>
          ))}
        </div>
      </nav>
    </section>
  );
};
