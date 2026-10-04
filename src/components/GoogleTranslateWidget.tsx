import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, ChevronDown, X } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', short: 'FR', flag: '🇫🇷' },
  { code: 'en', name: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', short: 'DE', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', short: 'IT', flag: '🇮🇹' },
  { code: 'zh-CN', name: '中文 (Chinois)', short: 'ZH', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский (Russe)', short: 'RU', flag: '🇷🇺' },
  { code: 'ja', name: '日本語 (Japonais)', short: 'JA', flag: '🇯🇵' },
  { code: 'es', name: 'Español', short: 'ES', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', short: 'PT', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', short: 'NL', flag: '🇳🇱' },
  { code: 'ar', name: 'العربية', short: 'AR', flag: '🇸🇦' },
  { code: 'uk', name: 'Українська', short: 'UK', flag: '🇺🇦' }
];

export interface GoogleTranslateWidgetProps {
  compact?: boolean;
  variant?: 'default' | 'pill' | 'mobile-action';
  dropdownAlign?: 'left' | 'right' | 'center';
  className?: string;
}

export const GoogleTranslateWidget: React.FC<GoogleTranslateWidgetProps> = ({ 
  compact = false,
  variant = 'default',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; isMobile: boolean }>({
    top: 64,
    right: 12,
    isMobile: false
  });

  const clearTranslateCookies = () => {
    const host = window.location.hostname;
    const domains = ['', `domain=${host};`, `domain=.${host};`];
    domains.forEach(d => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d}`;
      document.cookie = `googtrans=/fr/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d}`;
      document.cookie = `googtrans=/auto/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d}`;
    });
  };

  useEffect(() => {
    const suppressGoogleBanner = () => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.setProperty('top', '0px', 'important');
      }
      if (document.body.style.marginTop && document.body.style.marginTop !== '0px') {
        document.body.style.setProperty('margin-top', '0px', 'important');
      }
      if (document.documentElement.style.marginTop && document.documentElement.style.marginTop !== '0px') {
        document.documentElement.style.setProperty('margin-top', '0px', 'important');
      }
      if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
        document.documentElement.style.setProperty('top', '0px', 'important');
      }

      const banners = document.querySelectorAll<HTMLElement>(
        '.goog-te-banner-frame, iframe.skiptranslate, body > .skiptranslate, .VIpgJd-ZVi9od-ORHb-OEVmcd, .VIpgJd-ZVi9od-ORHb, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, #goog-gt-tt'
      );
      banners.forEach((el) => {
        if (el.id === 'google_translate_element' || el.id === 'google-translate-custom-control') return;
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0px', 'important');
        el.style.setProperty('width', '0px', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('position', 'fixed', 'important');
        el.style.setProperty('top', '-9999px', 'important');
      });
    };

    const observer = new MutationObserver(() => {
      suppressGoogleBanner();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: false,
      attributeFilter: ['style', 'class']
    });
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: false,
      attributeFilter: ['style', 'class']
    });
    suppressGoogleBanner();

    // Le français est toujours la langue principale et de départ du site
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('hl') || params.get('lang');
      const validUrlLang = urlLang && SUPPORTED_LANGUAGES.some(l => l.code === urlLang) ? urlLang : null;

      if (validUrlLang && validUrlLang !== 'fr') {
        setCurrentLang(validUrlLang);
        document.documentElement.lang = validUrlLang;
        initGoogleTranslate(validUrlLang);
      } else {
        // Démarrage systématique en français par défaut
        clearTranslateCookies();
        try {
          localStorage.setItem('app_user_lang', 'fr');
        } catch {
          // ignore
        }
        setCurrentLang('fr');
        document.documentElement.lang = 'fr';
      }
    } catch {
      // ignore
    }

    return () => observer.disconnect();
  }, []);

  const handleToggleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const top = Math.min(window.innerHeight - 320, Math.max(56, Math.round(rect.bottom + 8)));
      const right = Math.max(8, Math.round(window.innerWidth - rect.right));
      setMenuPos({ top, right, isMobile });
    }
    setIsOpen((prev) => !prev);
  };

  const initGoogleTranslate = (targetLang?: string) => {
    try {
      if (!document.getElementById('google-translate-script')) {
        window.googleTranslateElementInit = () => {
          try {
            let container = document.getElementById('google_translate_element');
            if (!container) {
              container = document.createElement('div');
              container.id = 'google_translate_element';
              container.style.display = 'none';
              document.body.appendChild(container);
            }
            if (window.google && window.google.translate && window.google.translate.TranslateElement) {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: 'fr',
                  includedLanguages: 'fr,en,es,de,it,pt,nl,ar,zh-CN,ja,ru,uk,pl,tr',
                  autoDisplay: false
                },
                'google_translate_element'
              );

              if (targetLang && targetLang !== 'fr') {
                setTimeout(() => {
                  applyComboLanguage(targetLang);
                }, 300);
              }
            }
          } catch (err) {
            console.warn('Google Translate initialization handled:', err);
          }
        };

        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.onerror = () => {
          console.warn('Google translate script could not be loaded.');
        };
        document.body.appendChild(script);
      } else if (targetLang && targetLang !== 'fr') {
        applyComboLanguage(targetLang);
      }
    } catch (e) {
      console.warn('Error setting up translation widget:', e);
    }
  };

  const applyComboLanguage = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const changeLanguage = (langCode: string) => {
    try {
      setCurrentLang(langCode);
      setIsOpen(false);
      try {
        localStorage.setItem('app_user_lang', langCode);
      } catch {
        // ignore
      }

      clearTranslateCookies();

      if (langCode === 'fr') {
        document.documentElement.lang = 'fr';
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          select.value = 'fr';
          select.dispatchEvent(new Event('change', { bubbles: true }));
          setTimeout(() => {
            select.value = '';
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }, 100);
        } else {
          window.location.reload();
        }
        return;
      }

      document.documentElement.lang = langCode;
      const domains = ['', `domain=${window.location.hostname};`, `domain=.${window.location.hostname};`];
      domains.forEach(d => {
        document.cookie = `googtrans=/fr/${langCode}; path=/; ${d}`;
        document.cookie = `googtrans=/auto/${langCode}; path=/; ${d}`;
      });

      initGoogleTranslate(langCode);

      applyComboLanguage(langCode);
      setTimeout(() => applyComboLanguage(langCode), 250);
      setTimeout(() => applyComboLanguage(langCode), 650);
    } catch (err) {
      console.warn('Language switch caught:', err);
    }
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative inline-block text-left notranslate ${className}`} id="google-translate-custom-control">
      <div id="google_translate_element" className="hidden" />

      {variant === 'mobile-action' ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggleOpen}
          title="Changer de langue"
          aria-label="Changer de langue"
          aria-expanded={isOpen}
          className="flex flex-col items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-[#0c1424] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white shadow-sm relative">
            <span className="text-lg leading-none">{selectedLangObj.flag}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-300 flex items-center gap-0.5">
            <span>{selectedLangObj.code === 'fr' ? 'Langue' : selectedLangObj.short}</span>
            <ChevronDown className={`h-2.5 w-2.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
      ) : variant === 'pill' ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggleOpen}
          title="Changer de langue"
          aria-label="Changer de langue"
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#0c1424] border border-slate-800 text-xs text-slate-200 font-medium active:scale-95 transition shadow-sm hover:border-slate-700 cursor-pointer"
        >
          <span className="text-base leading-none">{selectedLangObj.flag}</span>
          <span>{selectedLangObj.code === 'fr' ? 'Français' : selectedLangObj.name.split(' ')[0]}</span>
          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggleOpen}
          title="Traduire le site"
          aria-label="Traduire le site"
          aria-expanded={isOpen}
          className={`flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 text-white font-bold transition hover:border-blue-400 hover:bg-slate-800 active:scale-95 cursor-pointer shadow shrink-0 whitespace-nowrap ${
            compact ? 'px-2 py-1.5 text-[11px] leading-tight' : 'px-3 py-2 text-xs sm:text-sm'
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
              className="fixed z-[10000] w-[min(90vw,250px)] rounded-2xl border border-slate-700 bg-[#0f172a] p-2.5 text-slate-100 shadow-2xl"
            >
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-black uppercase tracking-wider text-sky-400 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  <span>Langue du site</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto mt-1.5 space-y-1 pr-0.5">
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
