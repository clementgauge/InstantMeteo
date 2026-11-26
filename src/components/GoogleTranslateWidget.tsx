import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, ChevronDown, X } from 'lucide-react';
import {
  applyNativeSiteLanguage,
  getActiveSiteLocale,
  SupportedLocaleCode,
} from '../i18n/siteTranslations';
import { buildLocalizedPath } from '../seo/pagesSeoData';
import { updateDocumentSeo } from '../utils/seoVerification';

const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLocaleCode;
  name: string;
  short: string;
  flag: string;
}> = [
  { code: 'fr', name: 'Français', short: 'FR', flag: '🇫🇷' },
  { code: 'en', name: 'English', short: 'EN', flag: '🇬🇧' },
];

export interface GoogleTranslateWidgetProps {
  compact?: boolean;
  variant?: 'default' | 'pill' | 'mobile-action';
  dropdownAlign?: 'left' | 'right' | 'center';
  className?: string;
  borderless?: boolean;
}

export const GoogleTranslateWidget: React.FC<GoogleTranslateWidgetProps> = ({
  compact = false,
  variant = 'default',
  className = '',
  borderless = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLocaleCode>(() => getActiveSiteLocale());
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; isMobile: boolean }>({
    top: 64,
    right: 12,
    isMobile: false,
  });

  const clearLegacyTranslateCookies = () => {
    try {
      const host = window.location.hostname;
      const domains = ['', `domain=${host};`, `domain=.${host};`];
      domains.forEach((d) => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d}`;
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    clearLegacyTranslateCookies();
    const detectedLocale = getActiveSiteLocale();
    setCurrentLang(detectedLocale);
    applyNativeSiteLanguage(detectedLocale, detectedLocale);

    const handleNativeLangChange = (e: Event) => {
      const custom = e as CustomEvent<{ locale?: SupportedLocaleCode }>;
      if (custom.detail?.locale) {
        setCurrentLang(custom.detail.locale);
      } else {
        setCurrentLang(getActiveSiteLocale());
      }
    };

    const handleExternalLangSelect = (e: Event) => {
      const custom = e as CustomEvent<{ code: string }>;
      if (custom.detail?.code) {
        changeLanguage(custom.detail.code === 'en' ? 'en' : 'fr');
      }
    };

    window.addEventListener('instant_meteo_native_lang_change', handleNativeLangChange);
    window.addEventListener('instant_meteo_select_lang', handleExternalLangSelect);

    return () => {
      window.removeEventListener('instant_meteo_native_lang_change', handleNativeLangChange);
      window.removeEventListener('instant_meteo_select_lang', handleExternalLangSelect);
    };
  }, []);

  const handleToggleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const top = Math.min(window.innerHeight - 240, Math.max(56, Math.round(rect.bottom + 8)));
      const right = Math.max(8, Math.round(window.innerWidth - rect.right));
      setMenuPos({ top, right, isMobile });
    }
    setIsOpen((prev) => !prev);
  };

  const changeLanguage = (langCode: SupportedLocaleCode) => {
    try {
      const targetLocale: SupportedLocaleCode = langCode === 'en' ? 'en' : 'fr';
      setCurrentLang(targetLocale);
      setIsOpen(false);
      clearLegacyTranslateCookies();

      const nextPath = buildLocalizedPath(window.location.pathname || '/', targetLocale);
      const url = new URL(window.location.href);
      url.searchParams.delete('hl');
      url.searchParams.delete('lang');
      const nextUrl = `${nextPath}${url.search}${url.hash}`;

      if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
        window.history.pushState(window.history.state, '', nextUrl);
      }

      applyNativeSiteLanguage(targetLocale, targetLocale);
      updateDocumentSeo(nextPath, false);
      window.dispatchEvent(
        new CustomEvent('instant_meteo_path_change', {
          detail: { path: nextPath, locale: targetLocale },
        })
      );
    } catch (err) {
      console.warn('Language switch caught:', err);
    }
  };

  const selectedLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative inline-block text-left notranslate ${className}`} id="google-translate-custom-control">
      {variant === 'mobile-action' ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggleOpen}
          title={currentLang === 'en' ? 'Change language' : 'Changer de langue'}
          aria-label={currentLang === 'en' ? 'Change language' : 'Changer de langue'}
          aria-expanded={isOpen}
          className="flex flex-col items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-[#0c1424] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white shadow-sm relative">
            <span className="text-lg leading-none">{selectedLangObj.flag}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-300 flex items-center gap-0.5">
            <span>{selectedLangObj.short}</span>
            <ChevronDown className={`h-2.5 w-2.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
      ) : variant === 'pill' ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggleOpen}
          title={currentLang === 'en' ? 'Change language' : 'Changer de langue'}
          aria-label={currentLang === 'en' ? 'Change language' : 'Changer de langue'}
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#0c1424] border border-slate-800 text-xs text-slate-200 font-medium active:scale-95 transition shadow-sm hover:border-slate-700 cursor-pointer"
        >
          <span className="text-base leading-none">{selectedLangObj.flag}</span>
          <span>{selectedLangObj.name}</span>
          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggleOpen}
          title={currentLang === 'en' ? 'Change language' : 'Changer de langue'}
          aria-label={currentLang === 'en' ? 'Change language' : 'Changer de langue'}
          aria-expanded={isOpen}
          className={`flex items-center gap-1 rounded-xl ${
            borderless
              ? 'border-0 bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700/90 shadow-sm'
              : 'border border-slate-700 bg-slate-900/90 text-white hover:border-blue-400 hover:bg-slate-800 shadow'
          } font-bold transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
            compact ? 'px-2.5 py-1.5 text-[11px] leading-tight' : 'px-3 py-2 text-xs sm:text-sm'
          }`}
        >
          <span className="text-xs leading-none">{selectedLangObj.flag}</span>
          {compact ? (
            <span className="text-[11px] font-bold">{selectedLangObj.short}</span>
          ) : (
            <>
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">{selectedLangObj.name}</span>
            </>
          )}
          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] notranslate" onClick={() => setIsOpen(false)}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={
                menuPos.isMobile
                  ? { top: '76px', left: '50%', transform: 'translateX(-50%)' }
                  : { top: `${menuPos.top}px`, right: `${menuPos.right}px` }
              }
              className="fixed z-[10000] w-[min(90vw,230px)] rounded-2xl border border-slate-700 bg-[#0f172a] p-2.5 text-slate-100 shadow-2xl"
            >
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-black uppercase tracking-wider text-sky-400 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  <span>{currentLang === 'en' ? 'Language' : 'Langue du site'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  aria-label={currentLang === 'en' ? 'Close' : 'Fermer'}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1.5 space-y-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
