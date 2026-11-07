import React, { useState, useEffect } from 'react';
import { Radio, Compass, CloudSun, ChevronRight, Sparkles, Check } from 'lucide-react';

interface PWASplashScreenProps {
  forceShow?: boolean;
  onFinished?: () => void;
}

export const PWASplashScreen: React.FC<PWASplashScreenProps> = ({
  forceShow = false,
  onFinished
}) => {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (forceShow) return true;
    
    // Check if launched as installed PWA (standalone) or first browser visit
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    const alreadyShown = sessionStorage.getItem('instant_meteo_splash_seen');
    if (!alreadyShown) {
      return true;
    }
    // In standalone PWA mode, show if opened freshly
    return isStandalone && !alreadyShown;
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const steps = [
    { title: 'Initialisation des capteurs radar', detail: 'Calibrage Doppler national 24/24' },
    { title: 'Synchronisation des modèles météo', detail: 'AROME 1.3km, ECMWF IFS & ICON' },
    { title: 'Télémétrie des 34 965 communes', detail: 'Stations SYNOP & réseau d\'altitude' },
    { title: 'Système opérationnel', detail: 'Données en direct certifiées' }
  ];

  // Listener for manual replay (e.g. from settings or PWA info)
  useEffect(() => {
    const handleTrigger = () => {
      setVisible(true);
      setIsFadingOut(false);
      setStepIndex(0);
      setProgress(15);
    };
    window.addEventListener('instant_meteo_trigger_splash', handleTrigger);
    return () => window.removeEventListener('instant_meteo_trigger_splash', handleTrigger);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Mark as seen in session storage
    try {
      sessionStorage.setItem('instant_meteo_splash_seen', 'true');
    } catch (_) {}

    // Animate progress and steps
    const timer1 = setTimeout(() => {
      setStepIndex(1);
      setProgress(45);
    }, 450);

    const timer2 = setTimeout(() => {
      setStepIndex(2);
      setProgress(75);
    }, 950);

    const timer3 = setTimeout(() => {
      setStepIndex(3);
      setProgress(100);
    }, 1450);

    const timerFinish = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 550);
      return () => clearTimeout(exitTimer);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerFinish);
    };
  }, [visible, onFinished]);

  if (!visible) return null;

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onFinished) onFinished();
    }, 200);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #0e1e38 0%, #080f1d 55%, #040810 100%)',
        color: '#f8fafc'
      }}
    >
      {/* Background Isobars & Coordinate Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="splashGlow" cx="50%" cy="35%" r="45%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#splashGlow)" />
          {/* Subtle isobar contour lines */}
          <path d="M-100,200 Q200,100 500,240 T1100,180" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
          <path d="M-50,380 Q300,280 600,420 T1200,340" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 7" opacity="0.4" />
          <path d="M0,580 Q400,450 800,620 T1400,520" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 8" opacity="0.3" />
        </svg>
      </div>

      {/* Top Bar: Telemetry Header + Skip Button */}
      <div className="relative z-10 w-full max-w-lg px-6 pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-500/30 text-sky-300 text-[11px] font-semibold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PWA • Télémétrie Direct</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 transition active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span>Passer</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Centerpiece: High-Tech Meteorological Radar Pulse with Concentric Range Rings */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-auto px-4 max-w-sm">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Range rings (50km, 100km, 250km) */}
          <div className="absolute inset-0 rounded-full border border-sky-500/20" />
          <div className="absolute inset-6 rounded-full border border-sky-400/25" />
          <div className="absolute inset-14 rounded-full border border-sky-400/35 border-dashed" />
          <div className="absolute inset-22 rounded-full border border-sky-300/40" />

          {/* Crosshair coordinate lines */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-sky-500/20" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-sky-500/20" />

          {/* Range ring labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-sky-400/60">250 km</span>
          <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-mono text-sky-400/60">100 km</span>
          <span className="absolute top-16 left-1/2 -translate-x-1/2 text-[9px] font-mono text-sky-400/60">50 km</span>

          {/* Rotating radar sweep beam (360° animation) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none animate-spin"
            style={{
              animationDuration: '3.2s',
              animationTimingFunction: 'linear',
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(56, 189, 248, 0.08) 320deg, rgba(56, 189, 248, 0.35) 360deg)'
            }}
          />

          {/* Radar Echo Blips */}
          <div className="absolute top-12 right-14 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" style={{ animationDuration: '2.5s' }} />
          <div className="absolute bottom-16 left-12 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
          <div className="absolute top-24 left-16 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />

          {/* Central Weather Emblem / Logo Badge */}
          <div className="relative z-20 w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800 p-0.5 shadow-2xl shadow-sky-500/40 border border-sky-300/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#0c182e] flex flex-col items-center justify-center overflow-hidden relative">
              {/* Sun & Cloud Vector Illustration */}
              <svg viewBox="0 0 100 100" className="w-14 h-14" fill="none">
                <circle cx="68" cy="36" r="20" fill="#f59e0b" />
                <path d="M24 66h48c9 0 16-7 16-16 0-8-6-14.5-14-15.8-1-11.5-10.5-20.2-22-20.2-9.5 0-18 6-21 15.2-1.5-.6-3.4-.6-5-.6-9.5 0-17.5 8-17.5 17.5 0 9.5 8 19.9 15.5 19.9z" fill="#ffffff" />
                <polygon points="49,52 40,68 49,68 41,84 62,64 51,64" fill="#ea580c" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Title & Typography */}
        <div className="text-center mt-6 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-black tracking-tight text-white">
            <span>INSTANT</span>
            <span className="text-sky-400">MÉTÉO</span>
          </div>
          <p className="text-xs text-sky-200/80 font-medium tracking-wide">
            Radar Haute Résolution &amp; Modèles AROME
          </p>
        </div>
      </div>

      {/* Bottom Step Indicator & Atmospheric Progress */}
      <div className="relative z-10 w-full max-w-md px-6 pb-10 space-y-4">
        {/* Active Step Ticker */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            {stepIndex >= 3 ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Radio className="w-5 h-5 animate-pulse text-sky-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {steps[stepIndex]?.title || 'Chargement...'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {steps[stepIndex]?.detail || 'Initialisation...'}
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-sky-400">
            {progress}%
          </span>
        </div>

        {/* Glowing Progress Track */}
        <div className="w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-slate-800 p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_12px_#38bdf8]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>FRANCE &amp; INTERNATIONAL</span>
          <span>SANS PUBLICITÉ • 100% GRATUIT</span>
        </div>
      </div>
    </div>
  );
};
