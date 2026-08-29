import React, { useEffect, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

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

export const GoogleTranslateWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');

  useEffect(() => {
    // Body Mutation Observer to ensure no Google top-banner displaces the UI
    const observer = new MutationObserver(() => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      if (document.body.style.position && document.body.style.position !== 'static') {
        document.body.style.position = 'static';
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

    try {
      const savedLang = localStorage.getItem('app_user_lang');
      if (!savedLang || savedLang === 'fr') {
        clearTranslateCookies();
        setCurrentLang('fr');
      } else {
        setCurrentLang(savedLang);
        initGoogleTranslate(savedLang);
      }
    } catch {
      // ignore
    }

    return () => observer.disconnect();
  }, []);

  const clearTranslateCookies = () => {
    const domains = ['', `domain=${window.location.hostname};`, `domain=.${window.location.hostname};`];
    domains.forEach(d => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d}`;
      document.cookie = `googtrans=/fr/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d}`;
      document.cookie = `googtrans=/auto/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d}`;
    });
  };

  const initGoogleTranslate = (targetLang?: string) => {
    try {
      if (!document.getElementById('google-translate-script')) {
        window.googleTranslateElementInit = () => {
          try {
            const container = document.getElementById('google_translate_element');
            if (container && window.google && window.google.translate && window.google.translate.TranslateElement) {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: 'fr',
                  includedLanguages: 'en,es,de,it,pt,nl,ar,zh-CN,ja,ru,uk,pl,tr',
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
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

      // Clear previous translation cookies first to allow direct switching between ANY languages
      clearTranslateCookies();

      if (langCode === 'fr') {
        // Reset to original French
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          select.value = '';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          window.location.reload();
        }
        return;
      }

      // Set cookie for Google translate format /auto/{langCode} and /fr/{langCode}
      const domains = ['', `domain=${window.location.hostname};`, `domain=.${window.location.hostname};`];
      domains.forEach(d => {
        document.cookie = `googtrans=/fr/${langCode}; path=/; ${d}`;
        document.cookie = `googtrans=/auto/${langCode}; path=/; ${d}`;
      });

      initGoogleTranslate(langCode);

      // Trigger selection change on the Google combo immediately and with a short timeout
      applyComboLanguage(langCode);
      setTimeout(() => applyComboLanguage(langCode), 200);
      setTimeout(() => applyComboLanguage(langCode), 600);
    } catch (err) {
      console.warn('Language switch caught:', err);
    }
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-block text-left notranslate" id="google-translate-custom-control">
      {/* Hidden container where google translate mounts */}
      <div id="google_translate_element" className="hidden" />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Traduire le site (Google Translate)"
        className={`flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-900/90 text-white font-bold transition hover:border-blue-400 hover:bg-slate-800 active:scale-95 cursor-pointer shadow ${
          compact ? 'px-2.5 py-2 text-xs' : 'px-3 py-2 text-xs sm:text-sm'
        }`}
      >
        <span className="text-sm">{selectedLangObj.flag}</span>
        <Globe className="h-3.5 w-3.5 text-blue-400" />
        <span className="hidden sm:inline">{selectedLangObj.name}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/20" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 z-50 w-48 rounded-2xl border border-slate-700 bg-slate-900/98 p-1.5 shadow-2xl backdrop-blur-xl">
            <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400 border-b border-slate-800">
              Langue de Traduction
            </div>
            <div className="max-h-56 overflow-y-auto mt-1 space-y-0.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
