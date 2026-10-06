import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

export interface BrowserDeviceProfile {
  browserName: 'Chrome' | 'Firefox' | 'Edge' | 'Safari' | 'Brave' | 'Opera' | 'Samsung Internet' | 'Navigateur';
  osName: 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Appareil';
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isFirefox: boolean;
}

export function detectBrowserAndDevice(): BrowserDeviceProfile {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      browserName: 'Navigateur',
      osName: 'Appareil',
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isFirefox: false,
    };
  }

  const ua = navigator.userAgent || '';
  const lower = ua.toLowerCase();

  const isIOS = /iphone|ipad|ipod/.test(lower) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(lower);
  const isMobile = isIOS || isAndroid || /mobile|tablet/.test(lower);

  let osName: BrowserDeviceProfile['osName'] = 'Appareil';
  if (isIOS) osName = 'iOS';
  else if (isAndroid) osName = 'Android';
  else if (lower.includes('win')) osName = 'Windows';
  else if (lower.includes('mac')) osName = 'macOS';
  else if (lower.includes('linux')) osName = 'Linux';

  let browserName: BrowserDeviceProfile['browserName'] = 'Navigateur';
  if (lower.includes('firefox') || lower.includes('fxios')) {
    browserName = 'Firefox';
  } else if (lower.includes('edg/')) {
    browserName = 'Edge';
  } else if (lower.includes('opr/') || lower.includes('opera')) {
    browserName = 'Opera';
  } else if (lower.includes('samsungbrowser')) {
    browserName = 'Samsung Internet';
  } else if ((navigator as any).brave) {
    browserName = 'Brave';
  } else if (lower.includes('chrome') || lower.includes('crios')) {
    browserName = 'Chrome';
  } else if (lower.includes('safari')) {
    browserName = 'Safari';
  }

  return {
    browserName,
    osName,
    isMobile,
    isIOS,
    isAndroid,
    isFirefox: browserName === 'Firefox',
  };
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPwaPrompt) {
      return window.__deferredPwaPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceProfile] = useState<BrowserDeviceProfile>(() => detectBrowserAndDevice());

  useEffect(() => {
    // Detect standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleCustomPwaReady = (e: Event) => {
      const customEvt = e as CustomEvent<BeforeInstallPromptEvent>;
      if (customEvt.detail) {
        setDeferredPrompt(customEvt.detail);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__deferredPwaPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('instant_meteo_pwa_ready', handleCustomPwaReady as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('instant_meteo_pwa_ready', handleCustomPwaReady as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null);
    if (!promptToUse) return false;
    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        window.__deferredPwaPrompt = null;
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt warning:', err);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: deviceProfile.isIOS,
    deviceProfile,
    install,
  };
}
