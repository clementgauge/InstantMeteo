import React from 'react';
import { 
  MapPin, 
  RefreshCw, 
  Smartphone, 
  Monitor,
  FileText, 
  Glasses, 
  ChevronDown, 
  Check, 
  Search, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  BellRing, 
  Settings, 
  X,
  Instagram,
  Youtube,
  SlidersHorizontal,
  HelpCircle,
  LayoutGrid,
  Crown,
  KeyRound,
  Play,
  AlertTriangle,
  Radio,
  ShieldAlert,
  CloudRain,
  Bell
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { AppLogo } from './AppLogo';
import { AtmosphereThemeConfig } from '../types/atmosphere';
import { GoogleTranslateWidget } from './GoogleTranslateWidget';

interface HeaderProps {
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  simplifiedMode?: boolean;
  onToggleSimplifiedMode?: () => void;
  onOpenAndroidModal: () => void;
  onOpenDossierModal: () => void;
  onOpenSearchModal: () => void;
  onOpenComparatorModal: () => void;
  onOpenAtmosphereModal?: () => void;
  onOpenReportModal?: () => void;
  onOpenTutorial?: () => void;
  activeRecalibration?: { isActive: boolean; stationName: string; tempOffset: number } | null;
  currentTheme?: AtmosphereThemeConfig;
  onRefresh: () => void;
  onLocateGps?: () => void;
  isGpsActive?: boolean;
  isLoading: boolean;
  tempUnit: 'C' | 'F';
  onToggleUnit: () => void;
  lastUpdatedTime?: string;
  nextRefreshSeconds?: number;
  vigilanceRefreshSeconds?: number;
  macroRefreshSeconds?: number;
  autoRefreshEnabled?: boolean;
  onToggleAutoRefresh?: () => void;
  autoRefreshInterval?: number;
  onChangeRefreshInterval?: (seconds: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenVigilanceTab?: () => void;
  onOpenRadarTab?: () => void;
  onSelectTab?: (tabId: any) => void;
  onOpenNotificationsModal?: () => void;
  activeAlertCount?: number;
  onOpenPageBlockCustomizer?: () => void;
  onOpenAdminPanel?: () => void;
  isAdmin?: boolean;
  onTriggerSecretCode?: (code: string) => boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStation,
  onSelectStation,
  seniorMode,
  onToggleSeniorMode,
  simplifiedMode = false,
  onToggleSimplifiedMode,
  onOpenAndroidModal,
  onOpenDossierModal,
  onOpenSearchModal,
  onOpenComparatorModal,
  onOpenAtmosphereModal,
  onOpenReportModal,
  onOpenTutorial,
  activeRecalibration,
  currentTheme,
  onRefresh,
  onLocateGps,
  isGpsActive,
  isLoading,
  tempUnit,
  onToggleUnit,
  lastUpdatedTime,
  nextRefreshSeconds = 60,
  vigilanceRefreshSeconds = 300,
  macroRefreshSeconds = 1800,
  autoRefreshEnabled = true,
  onToggleAutoRefresh,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenVigilanceTab,
  onOpenRadarTab,
  onSelectTab,
  onOpenNotificationsModal,
  activeAlertCount = 0,
  onOpenPageBlockCustomizer,
  onOpenAdminPanel,
  isAdmin = false,
  onTriggerSecretCode
}) => {
  const [stationDropdownOpen, setStationDropdownOpen] = React.useState(false);
  const [settingsSidebarOpen, setSettingsSidebarOpen] = React.useState(false);
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [adminCodeInput, setAdminCodeInput] = React.useState('');
  const [adminCodeFeedback, setAdminCodeFeedback] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLElement>(null);

  // État temps réel pour la barre de statut mobile (heure exacte, vraie batterie, vrai wifi)
  const [realClock, setRealClock] = React.useState<string>(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });
  const [batteryLevel, setBatteryLevel] = React.useState<number | null>(null);
  const [isCharging, setIsCharging] = React.useState<boolean>(false);
  const [isOnline, setIsOnline] = React.useState<boolean>(true);

  React.useEffect(() => {
    // 1. Horloge temps réel mise à jour chaque seconde
    const clockTimer = setInterval(() => {
      const d = new Date();
      setRealClock(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
    }, 1000);

    // 2. Statut réseau connecté / déconnecté
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // 3. API Vraie Batterie système (si supportée par l'appareil/navigateur)
    if (typeof navigator !== 'undefined' && 'getBattery' in (navigator as any)) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    return () => {
      clearInterval(clockTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAdminCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminCodeInput.trim();
    if (!clean) return;

    if (onTriggerSecretCode) {
      const ok = onTriggerSecretCode(clean);
      if (ok) {
        setAdminCodeFeedback('👑 Code secret validé avec succès !');
        setAdminCodeInput('');
        setTimeout(() => {
          setAdminCodeFeedback(null);
          setSettingsSidebarOpen(false);
          if (onOpenAdminPanel) onOpenAdminPanel();
        }, 600);
        return;
      }
    }
    setAdminCodeFeedback('❌ Code secret incorrect.');
    setTimeout(() => setAdminCodeFeedback(null), 3000);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!settingsSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsSidebarOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsSidebarOpen]);

  React.useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      setHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(header);
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const isHighAltitude = (currentStation.altitude ?? 0) >= 1500;
  const isMountain = (currentStation.altitude ?? 0) >= 800;

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-2.5 py-2 sm:px-6 sm:py-3">
      {/* ========================================================================= */}
      {/* MOBILE EXCLUSIVE HEADER - Pixel-perfect match with reference design       */}
      {/* ========================================================================= */}
      <div className="block sm:hidden w-full space-y-3 px-1 pt-0.5 pb-1">
        {/* Native Mobile Status Bar (Heure réelle, wifi réel, vraie batterie si disponible) */}
        <div className="flex items-center justify-between text-xs text-white font-semibold px-2 pt-0.5 pb-1 select-none">
          <span className="font-bold tracking-tight">{realClock}</span>
          <div className="flex items-center gap-2">
            {/* Cellular Signal Icon */}
            <svg className={`w-3.5 h-3 ${isOnline ? 'text-white' : 'text-slate-500'} fill-current`} viewBox="0 0 17 12">
              <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
              <rect x="4" y="5.5" width="2.5" height="6.5" rx="0.5" />
              <rect x="8" y="3" width="2.5" height="9" rx="0.5" />
              <rect x="12" y="0.5" width="2.5" height="11.5" rx="0.5" />
            </svg>
            {/* Wi-Fi Icon (Verte/Blanche si en ligne, rouge si hors-ligne) */}
            <svg className={`w-3.5 h-3.5 ${isOnline ? 'text-white' : 'text-rose-400'} stroke-current fill-none`} viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
            </svg>
            {/* Vraie Batterie système si disponible */}
            {batteryLevel !== null ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-medium text-slate-200">{batteryLevel}%</span>
                <div className="flex items-center">
                  <div className="w-5 h-2.5 rounded-sm border border-white p-[1px] flex items-center relative">
                    <div 
                      className={`h-full rounded-[1px] transition-all ${
                        isCharging ? 'bg-emerald-400' : batteryLevel <= 20 ? 'bg-rose-500' : 'bg-white'
                      }`} 
                      style={{ width: `${Math.max(10, Math.min(100, batteryLevel))}%` }} 
                    />
                    {isCharging && (
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-slate-900 leading-none">⚡</span>
                    )}
                  </div>
                  <div className="w-[1.5px] h-1 bg-white rounded-r-sm" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Top Header Row: App Logo, Title, HD & DIRECT Pill, Notification Bell */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5">
            {/* App squircle icon with sun and cloud */}
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-sky-500/20 border border-white/30 bg-gradient-to-br from-sky-400 via-blue-500 to-amber-300 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none">
                <circle cx="68" cy="36" r="22" fill="#f59e0b" />
                <path d="M24 66h48c9 0 16-7 16-16 0-8-6-14.5-14-15.8-1-11.5-10.5-20.2-22-20.2-9.5 0-18 6-21 15.2-1.5-.6-3.4-.6-5-.6-9.5 0-17.5 8-17.5 17.5 0 9.5 8 19.9 15.5 19.9z" fill="#ffffff" />
                <polygon points="49,52 40,68 49,68 41,84 62,64 51,64" fill="#ea580c" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-white flex items-center gap-1">
                <span>INSTANT</span>
                <span className="text-sky-400 font-black">MÉTÉO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-normal mt-0.5 leading-none">
                Radar Doppler HD &amp; Prévisions Temps Réel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* HD & DIRECT Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>HD &amp; DIRECT</span>
            </div>

            {/* Notification Bell Circle with Red Badge Dot */}
            <button
              onClick={onOpenNotificationsModal}
              title="Centre d'alertes"
              className="relative w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 hover:text-white transition active:scale-95 cursor-pointer shadow-md"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-slate-950" />
            </button>
          </div>
        </div>

        {/* Row 2: Search Bar + Station Dropdown Button */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={onOpenSearchModal}
            className="flex-1 flex items-center gap-2 bg-[#0c1424] border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-300 transition active:scale-98 text-left shadow-sm"
          >
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">Rechercher une ville...</span>
          </button>

          {/* Station Selector Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
              className="flex items-center gap-2 bg-[#0c1424] border border-slate-800 rounded-2xl px-3 py-1.5 text-left hover:border-slate-700 transition active:scale-98 shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div className="min-w-0 max-w-[125px]">
                <div className="text-xs font-bold text-white truncate">{currentStation.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentStation.department || '75 - Paris'} • {currentStation.altitude} m
                </div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${stationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Station Dropdown popup */}
            {stationDropdownOpen && (
              <div className="absolute right-0 mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50">
                <button
                  onClick={() => {
                    setStationDropdownOpen(false);
                    onOpenSearchModal();
                  }}
                  className="w-full mb-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-2 text-xs font-bold text-white shadow"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Recherche avancée</span>
                </button>
                <div className="space-y-0.5">
                  {FRENCH_STATIONS.slice(0, 12).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        onSelectStation(st);
                        setStationDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs ${
                        st.id === currentStation.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold">{st.name}</div>
                        <div className="text-[9px] text-slate-400">{st.department} • {st.altitude} m</div>
                      </div>
                      {st.id === currentStation.id && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Quick Action Circles (Radar, Vidéos, Premium, France, Paramètres) */}
        <div className="flex items-center justify-between px-1 pt-1">
          {/* 1. Radar */}
          <button
            onClick={() => {
              if (onOpenRadarTab) onOpenRadarTab();
              else if (onSelectTab) onSelectTab('radar');
            }}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400/60 shadow-lg shadow-blue-500/25 flex items-center justify-center text-cyan-300">
              <Radio className="h-5 w-5 text-cyan-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Radar</span>
          </button>

          {/* 2. Vidéos */}
          <a
            href="https://www.youtube.com/@InstantM%C3%A9t%C3%A9o"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-400/60 shadow-lg shadow-purple-500/25 flex items-center justify-center text-purple-300">
              <Play className="h-5 w-5 text-purple-300 fill-purple-300/30 ml-0.5" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Vidéos</span>
          </a>

          {/* 3. Premium */}
          <button
            onClick={onOpenAndroidModal}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/30 border border-amber-400/60 shadow-lg shadow-amber-500/25 flex items-center justify-center text-amber-300">
              <Crown className="h-5 w-5 text-amber-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Premium</span>
          </button>

          {/* 4. Pays (France) */}
          <button
            onClick={onOpenSearchModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#0c1424] border border-slate-800 text-xs text-slate-200 font-medium active:scale-95 transition shadow-sm"
          >
            <span className="text-base leading-none">🇫🇷</span>
            <span>France</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {/* 5. Paramètres */}
          <button
            onClick={() => setSettingsSidebarOpen(true)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#0c1424] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
              <Settings className="h-5 w-5 text-slate-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Paramètres</span>
          </button>
        </div>

        {/* Row 4: Three Warning / Status Cards (Alertes & Push, Vigilance 5j, Radar HD) */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Card 1: Alertes & Push (Red) */}
          <button
            onClick={onOpenNotificationsModal}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-lg shadow-rose-950/30 text-left active:scale-95 transition hover:border-rose-400 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-white truncate leading-tight">Alertes &amp; Push</div>
              <div className="text-[9px] text-slate-400 truncate">Restez informé</div>
            </div>
          </button>

          {/* Card 2: Vigilance 5j (Amber) */}
          <button
            onClick={onOpenVigilanceTab}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-lg shadow-amber-950/30 text-left active:scale-95 transition hover:border-amber-400 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-white truncate leading-tight">Vigilance 5j</div>
              <div className="text-[9px] text-slate-400 truncate">Cartes officielles</div>
            </div>
          </button>

          {/* Card 3: Radar HD (Teal) */}
          <button
            onClick={() => {
              if (onOpenRadarTab) onOpenRadarTab();
              else if (onSelectTab) onSelectTab('radar');
            }}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg shadow-emerald-950/30 text-left active:scale-95 transition hover:border-emerald-400 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Radio className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-white truncate leading-tight">Radar HD</div>
              <div className="text-[9px] text-slate-400 truncate">En temps réel</div>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP EXCLUSIVE HEADER (Unchanged, for tablet & computer viewports)     */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex mx-auto max-w-7xl flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Logo */}
        <AppLogo size="md" />

        {/* Center/Right: Actions, Search, Social Links & Settings */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Direct GPS Geolocation Button */}
          {onLocateGps && (
            <button
              id="header-gps-locate-btn"
              onClick={onLocateGps}
              title="Localiser automatiquement ma position GPS"
              className={`flex items-center gap-1.5 rounded-2xl border px-2.5 py-2 sm:px-3 sm:py-2.5 font-bold shadow transition active:scale-95 ${
                isGpsActive || currentStation.id.startsWith('gps')
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'border-blue-500/40 bg-blue-950/40 text-blue-200 hover:border-emerald-400 hover:bg-blue-900/50'
              } ${seniorMode ? 'text-base py-3 px-4' : 'text-xs sm:text-sm'}`}
            >
              <Navigation className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
              <span className="hidden sm:inline">Ma Position GPS</span>
            </button>
          )}

          {/* Universal Search Modal Launcher */}
          <button
            id="open-locality-search-btn"
            onClick={onOpenSearchModal}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-blue-500/40 bg-blue-950/40 px-2.5 sm:px-3.5 py-2 sm:py-2.5 font-bold text-blue-200 shadow transition hover:border-blue-400 hover:bg-blue-900/50 active:scale-95 ${
              seniorMode ? 'text-base py-3 px-5' : 'text-xs sm:text-sm'
            }`}
          >
            <Search className="h-4 w-4 text-blue-400" />
            <span className="hidden sm:inline">Chercher commune / sommet / monde</span>
            <span className="sm:hidden">Recherche</span>
          </button>

          {/* Quick Dropdown Picker */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="station-selector-button"
              onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-2.5 sm:px-3.5 py-2 sm:py-2.5 font-bold text-white shadow transition hover:border-slate-500 hover:bg-slate-800 ${
                seniorMode ? 'text-base py-3 px-5' : 'text-xs sm:text-sm'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isHighAltitude ? (
                  <span className="text-sm">🗻</span>
                ) : isMountain ? (
                  <span className="text-sm">🏔️</span>
                ) : (
                  <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                )}
                <div className="text-left max-w-[110px] sm:max-w-[160px] truncate">
                  <div className="text-white leading-tight font-bold truncate">{currentStation.name}</div>
                  <div className="text-[10px] font-normal text-slate-400 truncate">
                    {currentStation.department} • <strong className="text-slate-300">{currentStation.altitude}m</strong>
                  </div>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${stationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Station List Dropdown */}
            {stationDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50">
                {/* Search banner in dropdown */}
                <button
                  onClick={() => {
                    setStationDropdownOpen(false);
                    onOpenSearchModal();
                  }}
                  className="w-full mb-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Recherche avancée (35 000 communes & Monde)</span>
                </button>

                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Stations Favorites & Repères
                </div>
                <div className="mt-1 space-y-0.5">
                  {FRENCH_STATIONS.slice(0, 18).map((station) => {
                    const isSelected = station.id === currentStation.id;
                    return (
                      <button
                        key={station.id}
                        onClick={() => {
                          onSelectStation(station);
                          setStationDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{station.name}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                            {station.department} — {station.altitude} m
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Instagram Official Page Link - Just logo on all formats */}
          <a
            id="header-instagram-link"
            href="https://www.instagram.com/instantmeteo_fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-2xl border border-pink-500/40 bg-gradient-to-r from-purple-950/50 via-pink-950/40 to-slate-900 p-2 text-pink-400 hover:text-white hover:border-pink-400 hover:bg-pink-900/40 transition shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Suivez la communauté officielle Instant Météo sur Instagram : @instantmeteo_fr"
            aria-label="Page Instagram officielle Instant Météo"
          >
            <Instagram className="h-4 w-4 shrink-0" />
          </a>

          {/* YouTube Official Channel Link - Just logo on all formats */}
          <a
            id="header-youtube-link"
            href="https://www.youtube.com/@InstantM%C3%A9t%C3%A9o"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/50 via-red-900/40 to-slate-900 p-2 text-red-500 hover:text-white hover:border-red-400 hover:bg-red-900/40 transition shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Chaîne YouTube Officielle Instant Météo : @InstantMétéo"
            aria-label="Chaîne YouTube officielle Instant Météo"
          >
            <Youtube className="h-4 w-4 shrink-0" />
          </a>

          {/* Mode Simplifié Toggle (Between YouTube & Settings) */}
          {onToggleSimplifiedMode && (
            <button
              id="header-simplified-mode-btn"
              onClick={onToggleSimplifiedMode}
              title={simplifiedMode ? "Désactiver le Mode Simplifié (afficher tous les blocs experts)" : "Activer le Mode Simplifié (vue épurée essentielle)"}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-2xl border px-2.5 sm:px-3 py-2 text-xs font-black transition shadow-sm active:scale-95 cursor-pointer shrink-0 ${
                simplifiedMode
                  ? 'border-emerald-400 bg-emerald-600 text-white shadow-emerald-900/50 shadow-md'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <SlidersHorizontal className={`h-4 w-4 shrink-0 ${simplifiedMode ? 'text-white' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">{simplifiedMode ? 'Mode Simplifié Activé' : 'Mode Simplifié'}</span>
              <span className="sm:hidden">{simplifiedMode ? 'Épuré' : 'Normal'}</span>
            </button>
          )}

          {/* Interactive Tutorial Button */}
          {onOpenTutorial && (
            <button
              id="header-tuto-btn"
              onClick={onOpenTutorial}
              className="flex items-center gap-1.5 rounded-2xl border border-amber-500/40 bg-amber-950/40 px-2.5 sm:px-3 py-2 text-xs font-black text-amber-300 hover:border-amber-400 hover:bg-amber-900/50 hover:text-white transition shadow-sm active:scale-95 cursor-pointer shrink-0"
              title="Lancer le tutoriel interactif du site"
            >
              <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Tuto</span>
            </button>
          )}

          {/* Language Selector (FR default, EN, DE, IT, ZH, RU, JA) */}
          <div className="flex items-center shrink-0">
            <GoogleTranslateWidget compact={false} />
          </div>

          {/* Settings launcher - top right, always visible on mobile & pc */}
          <button
            id="open-settings-sidebar-button"
            onClick={() => setSettingsSidebarOpen(true)}
            title="Ouvrir le panneau des paramètres"
            aria-label="Ouvrir les paramètres"
            aria-expanded={settingsSidebarOpen}
            className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl border transition shadow-sm active:scale-95 ${
              settingsSidebarOpen
                ? 'border-white bg-white text-slate-950'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
          </button>
        </div>

      </div>

      {/* Settings drawer - right side */}
      {settingsSidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le panneau des paramètres"
            onClick={() => setSettingsSidebarOpen(false)}
            className="fixed bottom-0 left-0 right-0 z-[80] bg-slate-950/55 backdrop-blur-[2px]"
            style={{ top: headerHeight }}
          />

          <aside
            id="settings-right-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Paramètres rapides"
            className="fixed right-0 z-[90] flex w-[min(92vw,380px)] flex-col overflow-hidden border-l border-slate-700/80 bg-slate-950 shadow-2xl"
            style={{ top: headerHeight, height: `calc(100dvh - ${headerHeight}px)` }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-950/40">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400">Menu rapide</p>
                  <h2 className="text-lg font-black text-white">Paramètres</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettingsSidebarOpen(false)}
                title="Fermer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-white hover:text-slate-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <div className="rounded-2xl border border-white/90 bg-white p-4 text-slate-950 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-black">Paramètres</div>
                    <div className="text-xs font-medium text-slate-500">Tous les raccourcis de l'application</div>
                  </div>
                </div>
              </div>

              <section className="space-y-2">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alertes &amp; signalement</p>

                {onOpenNotificationsModal && (
                  <button
                    id="sidebar-open-notifications-btn"
                    type="button"
                    onClick={() => {
                      setSettingsSidebarOpen(false);
                      onOpenNotificationsModal();
                    }}
                    className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      activeAlertCount > 0
                        ? 'border-amber-500/60 bg-amber-950/50 text-amber-200 hover:bg-amber-900/60'
                        : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-indigo-400/70 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15">
                      <BellRing className={`h-5 w-5 ${activeAlertCount > 0 ? 'animate-pulse text-amber-400' : 'text-indigo-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-black">
                        <span>Alertes &amp; Push</span>
                        {activeAlertCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950">
                            {activeAlertCount}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Centre de notifications météo</div>
                    </div>
                  </button>
                )}

                {onOpenReportModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsSidebarOpen(false);
                      onOpenReportModal();
                    }}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left text-slate-200 transition hover:border-amber-400/70 hover:bg-white hover:text-slate-950"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-lg group-hover:bg-amber-100">🚨</div>
                    <div>
                      <div className="font-black">Signaler / Corriger météo</div>
                      <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Signaler une observation météo incorrecte</div>
                    </div>
                  </button>
                )}
              </section>

              <section className="space-y-2">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Affichage</p>

                {onOpenAtmosphereModal && currentTheme && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsSidebarOpen(false);
                      onOpenAtmosphereModal();
                    }}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left text-slate-200 transition hover:bg-white hover:text-slate-950"
                    style={{ borderColor: `${currentTheme.glowAccentColor}60` }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-100">
                      <Sparkles className="h-5 w-5" style={{ color: currentTheme.glowAccentColor }} />
                    </div>
                    <div>
                      <div className="font-black">{currentTheme.skyToneLabel}</div>
                      <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Zénith, azur, moment du jour et saison</div>
                    </div>
                  </button>
                )}

                <button
                  id="sidebar-senior-mode-toggle"
                  type="button"
                  onClick={onToggleSeniorMode}
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    seniorMode
                      ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                      : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-100">
                    <Glasses className={`h-5 w-5 ${seniorMode ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-950'}`} />
                  </div>
                  <div>
                    <div className="font-black">{seniorMode ? 'Confort Senior Activé' : 'Mode Confort'}</div>
                    <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Améliorer la lisibilité de l'interface</div>
                  </div>
                </button>

                {onOpenPageBlockCustomizer && (
                  <button
                    id="sidebar-open-page-block-customizer"
                    type="button"
                    onClick={() => {
                      setSettingsSidebarOpen(false);
                      onOpenPageBlockCustomizer();
                    }}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/40 to-indigo-950/30 p-4 text-left text-blue-200 transition hover:bg-white hover:text-slate-950 shadow-md cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 group-hover:bg-blue-100">
                      <LayoutGrid className="h-5 w-5 text-blue-400 group-hover:text-slate-950" />
                    </div>
                    <div>
                      <div className="font-black flex items-center gap-1.5">
                        <span>Choix des pages &amp; blocs</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500 text-slate-950 font-black uppercase">
                          Personnaliser
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">
                        Choisir les pages et les blocs à afficher
                      </div>
                    </div>
                  </button>
                )}

                {/* Administration & Code Secret dans les Paramètres */}
                {onOpenAdminPanel && (
                  isAdmin ? (
                    <div className="rounded-2xl border border-red-500/50 bg-gradient-to-r from-red-950/60 to-amber-950/40 p-4 shadow-lg shadow-red-950/40 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
                          <Crown className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 font-black text-red-200">
                            <span>Panneau d'Administration</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-600 text-white">
                              Actif
                            </span>
                          </div>
                          <div className="text-xs text-red-300/80">
                            Gestion des alertes flash, points &amp; modération
                          </div>
                        </div>
                      </div>
                      <button
                        id="sidebar-open-admin-panel"
                        type="button"
                        onClick={() => {
                          setSettingsSidebarOpen(false);
                          onOpenAdminPanel();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-md cursor-pointer"
                      >
                        <Crown className="h-4 w-4 text-amber-300" />
                        <span>Ouvrir la Console d'Administration</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 p-4 shadow-md space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 font-black text-amber-200 text-sm">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                            <KeyRound className="h-4 w-4" />
                          </div>
                          <div>
                            <div>Administration &amp; Code Secret</div>
                            <div className="text-[11px] font-normal text-slate-400">Accès restreint aux gestionnaires</div>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleAdminCodeSubmit} className="flex items-center gap-1.5 pt-1">
                        <input
                          type="password"
                          value={adminCodeInput}
                          onChange={(e) => setAdminCodeInput(e.target.value)}
                          placeholder="Entrer le code secret..."
                          className="flex-1 min-w-0 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 shadow-sm"
                        >
                          Valider
                        </button>
                      </form>

                      {adminCodeFeedback && (
                        <div className="text-[11px] font-bold p-2 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300">
                          {adminCodeFeedback}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSettingsSidebarOpen(false);
                          onOpenAdminPanel();
                        }}
                        className="w-full text-center text-[11px] text-slate-400 hover:text-amber-300 transition py-0.5 underline underline-offset-2 cursor-pointer"
                      >
                        Ouvrir la fenêtre d'authentification
                      </button>
                    </div>
                  )
                )}

                {onToggleFullscreen && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleFullscreen();
                      setSettingsSidebarOpen(false);
                    }}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left text-slate-200 transition hover:border-blue-400/70 hover:bg-white hover:text-slate-950"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 group-hover:bg-blue-100">
                      {isFullscreen ? (
                        <Minimize2 className="h-5 w-5 text-amber-400 group-hover:text-slate-950" />
                      ) : (
                        <Maximize2 className="h-5 w-5 text-blue-400 group-hover:text-slate-950" />
                      )}
                    </div>
                    <div>
                      <div className="font-black">{isFullscreen ? 'Quitter le grand écran' : 'Grand écran'}</div>
                      <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Afficher l'application en plein écran</div>
                    </div>
                  </button>
                )}
              </section>

              <section className="space-y-2">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Outils</p>

                <button
                  id="sidebar-open-comparator-modal-button"
                  type="button"
                  onClick={() => {
                    setSettingsSidebarOpen(false);
                    onOpenComparatorModal();
                  }}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-left text-indigo-200 transition hover:bg-white hover:text-slate-950"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-lg group-hover:bg-indigo-100">⚖️</div>
                  <div>
                    <div className="font-black">Comparateur</div>
                    <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Comparer plusieurs communes ou sommets</div>
                  </div>
                </button>

                <button
                  id="sidebar-open-dossier-modal-button"
                  type="button"
                  onClick={() => {
                    setSettingsSidebarOpen(false);
                    onOpenDossierModal();
                  }}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left text-slate-200 transition hover:bg-white hover:text-slate-950"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-slate-950" />
                  </div>
                  <div>
                    <div className="font-black">Dossier</div>
                    <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Exporter ou imprimer le dossier météo</div>
                  </div>
                </button>
              </section>

              <section className="space-y-2">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Application</p>

                <button
                  id="sidebar-open-android-modal-button"
                  type="button"
                  onClick={() => {
                    setSettingsSidebarOpen(false);
                    onOpenAndroidModal();
                  }}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4 text-left text-blue-200 transition hover:bg-white hover:text-slate-950"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 group-hover:bg-blue-100">
                    <Monitor className="h-5 w-5 text-blue-400 group-hover:text-slate-950" />
                  </div>
                  <div>
                    <div className="font-black">Télécharger l'Application</div>
                    <div className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-500">Windows (PC), Android (APK/PWA) &amp; iPhone</div>
                  </div>
                </button>
              </section>

              <section className="space-y-2">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Actualisation météo</p>

                <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-3.5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-black text-blue-200">
                        <RefreshCw className={`h-4 w-4 shrink-0 ${isLoading ? 'animate-spin text-blue-400' : 'text-blue-400'}`} />
                        <span>{autoRefreshEnabled ? `Live Continu (${nextRefreshSeconds}s)` : 'Live en pause'}</span>
                      </div>
                      {lastUpdatedTime && <div className="mt-1 text-[10px] text-slate-400">Dernière mise à jour : {lastUpdatedTime}</div>}
                    </div>
                    {onToggleAutoRefresh && (
                      <button
                        type="button"
                        onClick={onToggleAutoRefresh}
                        className={`rounded-xl px-3 py-2 text-xs font-black transition ${autoRefreshEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                      >
                        {autoRefreshEnabled ? 'Actif' : 'Pause'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="sidebar-unit-toggle-button"
                      type="button"
                      onClick={onToggleUnit}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-black text-slate-200 transition hover:bg-white hover:text-slate-950"
                    >
                      Unité °{tempUnit}
                    </button>
                    <button
                      id="sidebar-refresh-weather-button"
                      type="button"
                      onClick={onRefresh}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-black text-slate-200 transition hover:bg-white hover:text-slate-950 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Actualiser
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="rounded-lg border border-amber-800/50 bg-amber-950/40 px-2 py-2 text-amber-300">
                      Vig. {Math.floor(vigilanceRefreshSeconds / 60)}:{(vigilanceRefreshSeconds % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="rounded-lg border border-indigo-800/50 bg-indigo-950/40 px-2 py-2 text-indigo-300">
                      Macro {Math.ceil(macroRefreshSeconds / 60)} min
                    </div>
                  </div>

                  {onOpenVigilanceTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsSidebarOpen(false);
                        onOpenVigilanceTab();
                      }}
                      className="mt-3 w-full rounded-xl border border-amber-500/40 bg-amber-600/20 px-3 py-2.5 text-xs font-black text-amber-200 transition hover:bg-amber-600/40"
                    >
                      ⚠️ Ouvrir les vigilances 15 jours
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="border-t border-slate-800 p-4">
              <p className="text-center text-[11px] font-semibold text-slate-500">Clique en dehors du panneau ou sur × pour fermer</p>
            </div>
          </aside>
        </>
      )}
    </header>
  );
};
