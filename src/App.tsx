import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Map, 
  FileText, 
  CloudRain, 
  Calendar, 
  Globe, 
  Clock, 
  Split, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Layers, 
  Gauge,
  BellRing,
  Sparkles,
  BarChart3,
  Navigation,
  Trophy,
  MessageSquare,
  Send,
  Hash
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly } from './types/weather';
import { FRENCH_STATIONS } from './data/frenchStations';
import { fetchWeatherData } from './services/openMeteoService';
import { Header } from './components/Header';
import { DossierExportModal } from './components/DossierExportModal';
import { LocalitySearchModal } from './components/LocalitySearchModal';
import { MultiStationComparatorModal } from './components/MultiStationComparatorModal';
import { RealtimeView } from './views/RealtimeView';
import { GigaRadarView } from './views/GigaRadarView';
import { FourteenDayDetailedTrendsCard } from './components/FourteenDayDetailedTrendsCard';
import { GigaBulletinView } from './views/GigaBulletinView';
import { ThirtyDayDailyForecastCard } from './components/ThirtyDayDailyForecastCard';
import { SeasonalEightMonthTrendsCard } from './components/SeasonalEightMonthTrendsCard';
import { ShortTermMultiModelEnsembleCard } from './components/ShortTermMultiModelEnsembleCard';
import { MultiDayVigilanceMatrixCard } from './components/MultiDayVigilanceMatrixCard';
import { InstallAppModal } from './components/InstallAppModal';
import { AtmosphereBackground } from './components/AtmosphereBackground';
import { AtmosphereSelectorModal } from './components/AtmosphereSelectorModal';
import { BottomNavigationDock, NavTabId } from './components/BottomNavigationDock';
import { PageSectionSidebar, SidebarSectionItem } from './components/PageSectionSidebar';
import { TimeOfDay, Season, AtmosphereMode } from './types/atmosphere';
import { calculateTimeOfDay, calculateSeason, getAtmosphereTheme, isChristmasEventActive, setChristmasEventOverride } from './utils/atmosphereTheme';
import { FranceMapView } from './views/FranceMapView';
import { UserWeatherReportModal } from './components/UserWeatherReportModal';
import { WeatherNotificationCenterModal } from './components/WeatherNotificationCenterModal';
import { evaluateLiveThreatAndAlerts } from './services/notificationService';
import { RecalibrationState, getActiveRecalibration, clearActiveRecalibration } from './services/userObservationService';
import { WinterSnowObservatoryCard } from './components/WinterSnowObservatoryCard';
import { FrostAndColdObservatoryCard } from './components/FrostAndColdObservatoryCard';
import { CloudNephologyObservatoryCard } from './components/CloudNephologyObservatoryCard';
import { Mountain, ThermometerSnowflake, Cloud, History, Compass, TrendingUp, Radio } from 'lucide-react';
import { HomePage } from './views/HomePage';
import { DirectAlertBanner } from './components/DirectAlertBanner';
import { HistoricalTrendsAndRealtimeView } from './views/HistoricalTrendsAndRealtimeView';
import { SportsAndRouteView } from './views/SportsAndRouteView';
import { WorldDisastersView } from './views/WorldDisastersView';
import { WeatherHistoryArchiveView } from './views/WeatherHistoryArchiveView';
import { CompetitiveGamingView } from './views/CompetitiveGamingView';
import { DiscussionGroupView } from './views/DiscussionGroupView';
import { PseudoModal } from './components/PseudoModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { PageBlockCustomizerModal } from './components/PageBlockCustomizerModal';
import { verifyAdminCode, adminToggleAdminStatus, loadPlayerProfile, initPlayerProfile } from './services/competitiveGameService';
import { syncPlayerProfileToD1 } from './services/cloudflareD1Service';
import { isPageVisible } from './services/displayPreferencesService';
import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';
import { UpdateNotificationPrompt } from './components/UpdateNotificationPrompt';
import { DynamicWeatherAffiliateBanner } from './components/DynamicWeatherAffiliateBanner';
import { AffiliateStoreFooter } from './components/AffiliateStoreFooter';
import { CommunityWeatherMap } from './components/CommunityWeatherMap';

function WeatherApp() {
  const [currentStation, setCurrentStation] = useState<LocationPoint>(() => {
    try {
      const saved = localStorage.getItem('instant_meteo_last_station') || localStorage.getItem('climafrance_last_selected_locality');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.latitude && parsed.longitude) {
          return parsed;
        }
      }
      const recents = localStorage.getItem('climafrance_recent_localities');
      if (recents) {
        const parsedList = JSON.parse(recents);
        if (Array.isArray(parsedList) && parsedList.length > 0 && parsedList[0]?.name) {
          return parsedList[0];
        }
      }
    } catch (e) {
      console.warn("Failed to load persisted station:", e);
    }
    return FRENCH_STATIONS[0];
  });
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [anomaly, setAnomaly] = useState<ClimateAnomaly | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTabId>('realtime');
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [simplifiedMode, setSimplifiedMode] = useState<boolean>(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isComparatorModalOpen, setIsComparatorModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isAtmosphereModalOpen, setIsAtmosphereModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isPseudoModalOpen, setIsPseudoModalOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isPageBlockCustomizerOpen, setIsPageBlockCustomizerOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const p = loadPlayerProfile();
      return !!(p && p.isAdmin);
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleScoreUpdated = () => {
      const p = loadPlayerProfile();
      setIsAdmin(!!(p && p.isAdmin));
    };
    window.addEventListener('instant_meteo_score_updated', handleScoreUpdated);

    // Auto-synchronisation du profil joueur actif vers la base de données centralisée
    const existing = loadPlayerProfile();
    if (existing && existing.pseudo) {
      syncPlayerProfileToD1(existing).catch(() => {});
    }

    return () => window.removeEventListener('instant_meteo_score_updated', handleScoreUpdated);
  }, []);

  const [activeRecalibration, setActiveRecalibration] = useState<RecalibrationState | null>(() => getActiveRecalibration());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live Threat Evaluation & Selective Alert Engine
  const liveThreat = evaluateLiveThreatAndAlerts(currentStation, weather, hourly, daily);
  const activeAlertCount = liveThreat.activeAlerts.length;

  // Atmosphere dynamic background state
  const [atmosphereMode, setAtmosphereMode] = useState<AtmosphereMode>('AUTO');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('DAY');
  const [selectedSeason, setSelectedSeason] = useState<Season>('SUMMER');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [atmosphereEventTrigger, setAtmosphereEventTrigger] = useState<number>(0);

  // Compute live auto time of day and season based on station position & real clock
  const autoTimeOfDay = calculateTimeOfDay(new Date(), currentStation.latitude);
  const autoSeason = calculateSeason(new Date(), currentStation.latitude);

  const effectiveTimeOfDay = atmosphereMode === 'AUTO' ? autoTimeOfDay : selectedTimeOfDay;
  const effectiveSeason = atmosphereMode === 'AUTO' ? autoSeason : selectedSeason;
  // theme computation is reactive to atmosphereEventTrigger and live weather conditions
  const currentTheme = getAtmosphereTheme(
    effectiveTimeOfDay, 
    effectiveSeason, 
    false, 
    atmosphereMode === 'AUTO' && weather ? {
      weatherCode: weather.weatherCode,
      precipitation: weather.precipitation,
      temperature: weather.temperature,
      thunderstormRisk: weather.thunderstormAnalysis?.globalStormRiskScore,
      cloudCover: weather.synopticConditions?.cloudCoverTotalPct,
      isDay: weather.isDay
    } : undefined
  );
  const isChristmasActive = isChristmasEventActive();

  const handleTriggerSecretCode = (code: string): boolean => {
    const cleanCode = code.trim().toLowerCase();
    // Secret admin code (meteoversailles78)
    if (verifyAdminCode(cleanCode)) {
      let p = loadPlayerProfile();
      if (!p) {
        p = initPlayerProfile('Admin Météo');
      }
      adminToggleAdminStatus(p, true);
      syncPlayerProfileToD1(p).catch(() => {});
      setIsAdmin(true);
      setIsAdminPanelOpen(true);
      return true;
    }
    if (cleanCode === 'noel' || cleanCode === 'christmas') {
      setChristmasEventOverride('noel');
      setAtmosphereEventTrigger((prev) => prev + 1);
      return true;
    }
    if (
      cleanCode === 'clear' ||
      cleanCode === 'reset' ||
      cleanCode === 'off' ||
      cleanCode === 'stop' ||
      cleanCode === 'desactiver' ||
      cleanCode === 'désactiver' ||
      cleanCode === 'effacer'
    ) {
      setChristmasEventOverride('clear');
      setAtmosphereEventTrigger((prev) => prev + 1);
      return true;
    }
    return false;
  };

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.log('Fullscreen error:', err);
        });
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Auto-refresh 3-Tier Multi-Cadence Engine:
  // 1. < 24h Prévisions & Live Obs : Continu (60s loop)
  // 2. Vigilances & 24h à 14 jours : 5 min (300s loop)
  // 3. Toutes les autres (> 14j, 30j, Climat AR6, ENSO) : 30 min (1800s loop)
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(300); // 5 min (300s) default cadence
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState<number>(300);
  const [vigilanceRefreshSeconds, setVigilanceRefreshSeconds] = useState<number>(300); // 5 min (300s)
  const [macroRefreshSeconds, setMacroRefreshSeconds] = useState<number>(1800); // 30 min (1800s)

  // Automatic and Manual GPS Geolocation
  const handleLocateGps = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          // Find closest station in FRENCH_STATIONS
          let closest = FRENCH_STATIONS[0];
          let minDistance = Number.MAX_VALUE;

          FRENCH_STATIONS.forEach((st) => {
            const dLat = st.latitude - userLat;
            const dLon = st.longitude - userLon;
            const dist = Math.sqrt(dLat * dLat + dLon * dLon);
            if (dist < minDistance) {
              minDistance = dist;
              closest = st;
            }
          });

          if (minDistance < 0.2) {
            setCurrentStation(closest);
          } else {
            const gpsStation: LocationPoint = {
              id: 'gps-local-user',
              name: `Ma Position GPS (${closest.region || closest.name})`,
              department: closest.department,
              region: closest.region,
              latitude: Number(userLat.toFixed(4)),
              longitude: Number(userLon.toFixed(4)),
              altitude: closest.altitude || 150,
              climateZone: closest.climateZone || 'Tempéré',
              allTimeRecordMax: closest.allTimeRecordMax || 40.5,
              allTimeRecordMin: closest.allTimeRecordMin || -15.0,
              allTimeRecordRain24h: closest.allTimeRecordRain24h || 75.0,
              isMountain: closest.altitude ? closest.altitude >= 800 : false
            };
            setCurrentStation(gpsStation);
          }
        },
        (err) => {
          console.log("GPS geolocation fallback to default station:", err.message);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Load weather when current station changes & persist station selection
  const loadStationData = async (station: LocationPoint, showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await fetchWeatherData(station);

      setWeather(data.current);
      setHourly(data.hourly);
      setDaily(data.daily);
      setAnomaly(data.anomaly);

      const now = new Date();
      setLastUpdatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setNextRefreshSeconds(autoRefreshInterval);
    } catch (err) {
      console.error("Failed to load weather:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('instant_meteo_last_station', JSON.stringify(currentStation));
      localStorage.setItem('climafrance_last_selected_locality', JSON.stringify(currentStation));
      
      const recentsStr = localStorage.getItem('climafrance_recent_localities');
      let recentsList: LocationPoint[] = [];
      if (recentsStr) {
        try {
          recentsList = JSON.parse(recentsStr);
        } catch (e) {
          recentsList = [];
        }
      }
      recentsList = [currentStation, ...recentsList.filter(s => s.name !== currentStation.name && s.id !== currentStation.id)].slice(0, 10);
      localStorage.setItem('climafrance_recent_localities', JSON.stringify(recentsList));
    } catch (e) {
      console.warn("Failed to persist currentStation:", e);
    }
    loadStationData(currentStation, true);
  }, [currentStation]);

  // Periodic Auto-refresh 3-Tier Multi-Cadence Timer
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      // 1. Cadence < 24h & Temps Réel : En Continu (toutes les 60s)
      setNextRefreshSeconds((prev) => {
        if (prev <= 1) {
          loadStationData(currentStation, false);
          return autoRefreshInterval;
        }
        return prev - 1;
      });

      // 2. Cadence Vigilance & Prévisions 24h à 14 jours : 5 minutes (300s)
      setVigilanceRefreshSeconds((prev) => {
        if (prev <= 1) {
          loadStationData(currentStation, false);
          return 300; // Reset 5 min
        }
        return prev - 1;
      });

      // 3. Cadence Macro > 14 jours, 30 jours : 30 minutes (1800s)
      setMacroRefreshSeconds((prev) => {
        if (prev <= 1) {
          loadStationData(currentStation, false);
          return 1800; // Reset 30 min
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, autoRefreshInterval, currentStation, weather, anomaly]);

  const handleRefresh = () => {
    loadStationData(currentStation, true);
    setNextRefreshSeconds(autoRefreshInterval);
    setVigilanceRefreshSeconds(300);
    setMacroRefreshSeconds(1800);
  };

  const handleClearRecalibration = () => {
    clearActiveRecalibration();
    setActiveRecalibration(null);
    loadStationData(currentStation, false);
  };

  const handleResetToDefaultStation = () => {
    const defaultStation = FRENCH_STATIONS[0]; // Paris-Montsouris
    clearActiveRecalibration();
    setActiveRecalibration(null);
    setCurrentStation(defaultStation);
    loadStationData(defaultStation, true);
  };

  const categories = [
    { id: 'ALL', label: 'Toutes les prévisions (16)' },
    { id: 'DIRECT', label: '⚡ Direct, Nuages, Alertes, Neige & Gel (6)' },
    { id: 'MEDIUM', label: '⏱️ 0 à 14 Jours (3)' },
    { id: 'LONG', label: '📅 30 Jours, 8 Mois & Évolution 2000 (3)' },
    { id: 'MAPS', label: '🗺️ Radar, Carte, Évasion & Monde (4)' },
  ];

  const navItems = [
    { id: 'realtime', category: 'DIRECT', label: '1. ⚡ Temps Réel & Observatoire Direct', icon: Sun },
    { id: 'cloudNephology', category: 'DIRECT', label: '2. ☁️ Observatoire Néphologique & Nuages 48h', icon: Cloud, highlight: true },
    { id: 'vigilance', category: 'DIRECT', label: '3. ⚠️ Vigilances & Alertes Multi-Jours', icon: ShieldAlert, highlight: true },
    { id: 'scenarios14d', category: 'MEDIUM', label: '4. 📊 Tendances & Scénarios 14 Jours', icon: Split, highlight: true },
    { id: 'radar', category: 'MAPS', label: '5. 📡 Radar Précipitations, Feux NASA & Vents', icon: CloudRain, highlight: true },
    { id: 'eightMonths', category: 'LONG', label: '6. 📈 Tendances 8 Mois (Dép / Région / Pays)', icon: Globe, highlight: true },
    { id: 'historicalTrends', category: 'LONG', label: '7. 📈 Évolution depuis 2000 & Temps Réel (1 min)', icon: History, highlight: true },
    { id: 'sportsActivities', category: 'MAPS', label: '8. 🏃‍♂️ Météo Sportive & Calculateur Trajet', icon: TrendingUp },
    { id: 'worldDisasters', category: 'MAPS', label: '9. 🌍 Météo Monde, Tornades & Tsunamis', icon: Radio },
    { id: 'weatherArchive', category: 'LONG', label: '10. 📅 Archives Journalières & Historique Météo', icon: Calendar, highlight: true },
    { id: 'bulletin', category: 'MEDIUM', label: '11. 🇫🇷 Bulletins Prévisions (J+7 & 4 Semaines)', icon: FileText, highlight: true },
    { id: 'competitive', category: 'DIRECT', label: '12. 🏆 Mode Compétitif & Classement', icon: Trophy, highlight: true },
    { id: 'discussionGroup', category: 'DIRECT', label: '13. 💬 Groupe de Discussion & Salon Météo', icon: MessageSquare, highlight: true },
  ].filter((item) => isPageVisible(item.id));

  const genericPageSection = (label: string, icon: any): SidebarSectionItem[] => [
    { id: `page-${activeTab}`, label, icon },
  ];

  const pageSidebarTitle = navItems.find((item) => item.id === activeTab)?.label.replace(/^\d+\.\s*/, '') || 'Météo';

  const pageSections: SidebarSectionItem[] = activeTab === 'realtime'
    ? [
        { id: 'realtime-radiography', label: 'Radiographie météo & Station', icon: Sun },
        { id: 'realtime-forecast-week', label: 'Prévisions jour & semaine', icon: Calendar },
        { id: 'realtime-indicators', label: 'Indicateurs & Précision Météorologique', icon: Gauge },
        { id: 'realtime-precipitation', label: 'Précipitations & Radar Direct', icon: CloudRain },
        { id: 'realtime-certified-precision', label: 'Observatoire certifié (Expert)', icon: Sliders },
        { id: 'realtime-deep-conditions', label: 'Conditions météorologiques approfondies', icon: Layers },
        { id: 'realtime-more-forecast', label: 'Accès autres prévisions', icon: Split },
        { id: 'realtime-download', label: "Télécharger l'application", icon: FileText },
      ]
    : activeTab === 'cloudNephology'
      ? genericPageSection('Observatoire des nuages 48h', Cloud)
      : activeTab === 'vigilance'
        ? genericPageSection('Vigilances & alertes', ShieldAlert)
        : activeTab === 'scenarios14d'
          ? genericPageSection('Scénarios à 14 jours', Split)
          : activeTab === 'bulletin'
            ? genericPageSection('Bulletins de prévisions', FileText)
            : activeTab === 'eightMonths'
              ? genericPageSection('Tendances 8 mois', Globe)
              : activeTab === 'radar'
                ? genericPageSection('Radar Précipitations, Feux NASA & Vents', CloudRain)
                : activeTab === 'historicalTrends'
                  ? genericPageSection('Évolution 2000 & Temps Réel 1min', History)
                  : activeTab === 'sportsActivities'
                    ? [
                        { id: 'sports-score-section', label: 'Index de Sortie & Tenue', icon: ShieldAlert },
                        { id: 'sports-disciplines-section', label: 'Disciplines & Créneaux', icon: TrendingUp },
                        { id: 'route-weather-calculator-section', label: "Météo d'Itinéraire & Trajets", icon: Compass },
                      ]
                    : activeTab === 'worldDisasters'
                      ? genericPageSection('Monde & Catastrophes 24h', Radio)
                      : activeTab === 'weatherArchive'
                        ? genericPageSection('Archives Journalières Météo', Calendar)
                        : activeTab === 'competitive'
                          ? [
                              { id: 'competitive-header-hero', label: 'Profil, Points & Flammes', icon: Sparkles },
                              { id: 'competitive-geo-section', label: 'Géolocalisation Physique Lieux', icon: Navigation },
                              { id: 'competitive-trophies-section', label: 'Trophées Météo Débloqués', icon: Trophy },
                              { id: 'competitive-leaderboard-section', label: 'Classement Général Chasseurs', icon: BarChart3 },
                            ]
                          : activeTab === 'discussionGroup'
                            ? [
                                { id: 'discussion-header-hero', label: 'Observatoire Citoyen & Salon', icon: MessageSquare },
                                { id: 'discussion-channels-bar', label: 'Salons Thématiques', icon: Hash },
                                { id: 'discussion-messages-feed', label: 'Fil de Discussion en Direct', icon: MessageSquare },
                                { id: 'discussion-composer-section', label: 'Poster une Observation', icon: Send },
                              ]
                            : genericPageSection('Stations & Sommets de France', Map);

  // Quick navigation helper
  const currentNavIndex = navItems.findIndex(item => item.id === activeTab);
  const handlePrevTab = () => {
    if (currentNavIndex > 0) {
      setActiveTab(navItems[currentNavIndex - 1].id as any);
    } else {
      setActiveTab(navItems[navItems.length - 1].id as any);
    }
  };
  const handleNextTab = () => {
    if (currentNavIndex < navItems.length - 1) {
      setActiveTab(navItems[currentNavIndex + 1].id as any);
    } else {
      setActiveTab(navItems[0].id as any);
    }
  };

  // Keyboard Shortcuts for Desktop / Computer Users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        handleNextTab();
      } else if (e.key === 'ArrowLeft') {
        handlePrevTab();
      } else if (e.key === 's' || e.key === 'S') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          setIsSearchModalOpen(true);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          handleToggleFullscreen();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          setActiveTab('realtime');
        }
      } else if (e.key === 'a' || e.key === 'A') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          setIsAtmosphereModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNavIndex]);

  return (
    <div 
      className={`min-h-screen relative text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden ${seniorMode ? 'senior-mode' : ''}`}
    >
      {/* Dynamic Seasonal & Time-of-Day Atmospheric Background */}
      <AtmosphereBackground 
        theme={currentTheme} 
        seniorMode={seniorMode} 
      />

      {/* Header */}
      <div className="relative z-30 w-full max-w-full">
        <Header
          currentStation={currentStation}
          onSelectStation={(st) => setCurrentStation(st)}
          seniorMode={seniorMode}
          onToggleSeniorMode={() => setSeniorMode(!seniorMode)}
          simplifiedMode={simplifiedMode}
          onToggleSimplifiedMode={() => setSimplifiedMode(prev => !prev)}
          onOpenAndroidModal={() => setIsInstallModalOpen(true)}
          onOpenDossierModal={() => setIsDossierModalOpen(true)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onOpenComparatorModal={() => setIsComparatorModalOpen(true)}
          onOpenAtmosphereModal={() => setIsAtmosphereModalOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          activeRecalibration={activeRecalibration}
          currentTheme={currentTheme}
          onRefresh={handleRefresh}
          onLocateGps={handleLocateGps}
          isGpsActive={currentStation.id.startsWith('gps')}
          isLoading={isLoading}
          tempUnit={tempUnit}
          onToggleUnit={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
          lastUpdatedTime={lastUpdatedTime}
          nextRefreshSeconds={nextRefreshSeconds}
          vigilanceRefreshSeconds={vigilanceRefreshSeconds}
          macroRefreshSeconds={macroRefreshSeconds}
          autoRefreshEnabled={autoRefreshEnabled}
          onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          autoRefreshInterval={autoRefreshInterval}
          onChangeRefreshInterval={(sec) => {
            setAutoRefreshInterval(sec);
            setNextRefreshSeconds(sec);
          }}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenVigilanceTab={() => setActiveTab('vigilance')}
          onOpenNotificationsModal={() => setIsNotificationModalOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          activeAlertCount={activeAlertCount}
          onOpenPageBlockCustomizer={() => setIsPageBlockCustomizerOpen(true)}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          isAdmin={isAdmin}
        />
      </div>

      {/* Main Container - Optimized for expansive wide screen comfort with left rail spacing */}
      <main className="relative z-20 flex-1 mx-auto w-full max-w-[1720px] px-3 sm:px-6 lg:px-8 xl:px-10 lg:pl-[84px] py-4 pb-36 overflow-x-hidden">
        {/* Full-Page Collapsible Left Sidebar Rail & Mobile Drawer */}
        <PageSectionSidebar
          title={pageSidebarTitle}
          sections={pageSections}
          currentStation={currentStation}
          isChristmasActive={isChristmasActive}
          onTriggerSecretCode={handleTriggerSecretCode}
          onLocateGps={handleLocateGps}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenAtmosphere={() => setIsAtmosphereModalOpen(true)}
          activeAlertCount={activeAlertCount}
        />

        {/* Atmosphere Context & Hub Filter Bar */}
        <div className="mb-3 rounded-3xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-xl p-3 sm:p-4">
          {/* Quick shortcuts — centered. Search is already available in the global header. */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              title="Ouvrir le Centre d'Alertes et Notifications Météo en Temps Réel"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition active:scale-95 shrink-0 ${
                activeAlertCount > 0
                  ? 'border-amber-500/60 bg-amber-950/70 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-900/80 animate-pulse'
                  : 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60'
              }`}
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Alertes &amp; Push</span>
              {activeAlertCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-slate-950">
                  {activeAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vigilance')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'vigilance'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                  : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Vigilance 5j</span>
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'radar'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400'
                  : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
              }`}
            >
              <CloudRain className="h-3.5 w-3.5" />
              <span>Radar HD</span>
            </button>
          </div>
        </div>

        <section className="min-w-0 w-full">
        {/* Tab Content */}
        {isLoading || !weather || !anomaly ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 font-bold text-slate-300">
              Chargement des données météo et radar pour {currentStation.name} ({currentStation.altitude} m)...
            </p>
          </div>
        ) : (
          <div id={`page-${activeTab}`} className="scroll-mt-28 space-y-5">
            {/* Direct on-screen weather alert notification banner */}
            <DirectAlertBanner
              station={currentStation}
              weather={weather}
              onOpenAlerts={() => setActiveTab('vigilance')}
              seniorMode={seniorMode}
            />

            {activeTab === 'realtime' && (
              <RealtimeView
                station={currentStation}
                weather={weather}
                hourly={hourly}
                daily={daily}
                anomaly={anomaly}
                seniorMode={seniorMode}
                simplifiedMode={simplifiedMode}
                tempUnit={tempUnit}
                onOpenSearchModal={() => setIsSearchModalOpen(true)}
                onOpenGigaRadar={() => setActiveTab('radar')}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
                onLocateGps={handleLocateGps}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
                onToggleFullscreen={handleToggleFullscreen}
                isFullscreen={isFullscreen}
              />
            )}

            {activeTab === 'cloudNephology' && (
              <div className="space-y-6">
                <CloudNephologyObservatoryCard
                  station={currentStation}
                  weather={weather}
                  hourlyForecasts={hourly}
                  seniorMode={seniorMode}
                  tempUnit={tempUnit}
                  simplifiedMode={simplifiedMode}
                />
              </div>
            )}

            {activeTab === 'vigilance' && (
              <div className="space-y-6">
                <MultiDayVigilanceMatrixCard
                  station={currentStation}
                  currentWeather={weather}
                  hourlyForecasts={hourly}
                  dailyForecasts={daily}
                  seniorMode={seniorMode}
                  simplifiedMode={simplifiedMode}
                />
              </div>
            )}

            {activeTab === 'scenarios14d' && (
              <FourteenDayDetailedTrendsCard
                station={currentStation}
                currentTemp={weather.temperature}
                currentAnomaly={anomaly.tempAnomaly}
                dailyForecasts={daily}
                currentWeather={weather}
                seniorMode={seniorMode}
                tempUnit={tempUnit}
                simplifiedMode={simplifiedMode}
              />
            )}

            {activeTab === 'bulletin' && (
              <GigaBulletinView
                currentStation={currentStation}
                dailyForecasts={daily}
                seniorMode={seniorMode}
                tempUnit={tempUnit}
              />
            )}

            {activeTab === 'eightMonths' && (
              <SeasonalEightMonthTrendsCard
                station={currentStation}
                currentTemp={weather.temperature}
                currentAnomaly={anomaly.tempAnomaly}
                seniorMode={seniorMode}
                tempUnit={tempUnit}
              />
            )}

            {activeTab === 'radar' && (
              <GigaRadarView
                currentStation={currentStation}
                onSelectStation={(st) => setCurrentStation(st)}
                weather={weather}
                hourly={hourly}
                daily={daily}
                seniorMode={seniorMode}
                simplifiedMode={simplifiedMode}
                onOpenSearchModal={() => setIsSearchModalOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'historicalTrends' && (
              <HistoricalTrendsAndRealtimeView
                station={currentStation}
                weather={weather}
                seniorMode={seniorMode}
                tempUnit={tempUnit}
              />
            )}

            {activeTab === 'sportsActivities' && (
              <SportsAndRouteView
                station={currentStation}
                weather={weather}
                hourly={hourly}
                daily={daily}
                seniorMode={seniorMode}
                simplifiedMode={simplifiedMode}
                tempUnit={tempUnit}
              />
            )}

            {activeTab === 'worldDisasters' && (
              <WorldDisastersView
                seniorMode={seniorMode}
                simplifiedMode={simplifiedMode}
              />
            )}

            {activeTab === 'weatherArchive' && (
              <WeatherHistoryArchiveView
                station={currentStation}
                weather={weather}
                seniorMode={seniorMode}
                tempUnit={tempUnit}
                onOpenSearchModal={() => setIsSearchModalOpen(true)}
                onBackToMain={() => setActiveTab('realtime')}
              />
            )}

            {activeTab === 'competitive' && (
              <CompetitiveGamingView
                currentStation={currentStation}
                weather={weather}
                seniorMode={seniorMode}
                onOpenSearchModal={() => setIsSearchModalOpen(true)}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
                onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
              />
            )}

            {activeTab === 'discussionGroup' && (
              <DiscussionGroupView
                station={currentStation}
                seniorMode={seniorMode}
                onOpenPseudoModal={() => setIsPseudoModalOpen(true)}
              />
            )}

            {activeTab === 'communityReports' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('competitive')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4 text-amber-400" />
                    <span>Retour à l'Arène Compétitive</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('radar')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-bold transition border border-blue-500/40 cursor-pointer"
                    >
                      <Radio className="h-3.5 w-3.5 text-blue-400" />
                      <span>Ouvrir Radar & Pluie</span>
                    </button>
                  </div>
                </div>

                <CommunityWeatherMap
                  currentStation={currentStation}
                  seniorMode={seniorMode}
                />
              </div>
            )}
          </div>
        )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/70 py-6 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <p>
              © 2026 <strong>Instant Météo</strong> — Prévisions directes, 30 jours, 8 mois par département &amp; Vigilances Météo-France.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveTab('vigilance')}
                className="text-rose-400 hover:underline font-semibold"
              >
                ⚠️ Vigilances Multi-Jours
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('scenarios14d')}
                className="text-blue-400 hover:underline font-semibold"
              >
                📊 Scénarios 14 Jours
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('eightMonths')}
                className="text-indigo-400 hover:underline font-semibold"
              >
                📈 Tendances 8 Mois (Département / Région / Pays)
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('radar')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                📡 Radar Pluie HD
              </button>
              <span>•</span>
              <button
                onClick={() => setIsComparatorModalOpen(true)}
                className="text-amber-400 hover:underline font-semibold"
              >
                ⚖️ Comparateur Multi-Villes
              </button>
              <span>•</span>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="text-slate-300 hover:underline font-semibold"
              >
                🔍 Recherche 35 000 communes
              </button>
              <span>•</span>
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="text-cyan-300 hover:underline font-bold"
              >
                📱 Installer l'App
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Navigation Dock & Full Hub Drawer */}
      <BottomNavigationDock
        activeTab={activeTab as NavTabId}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAtmosphereModal={() => setIsAtmosphereModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationModalOpen(true)}
        currentTheme={currentTheme}
        seniorMode={seniorMode}
      />

      {/* Real-time Weather Push Notification Center Modal */}
      <WeatherNotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        station={currentStation}
        currentWeather={weather}
        hourlyForecasts={hourly}
        dailyForecasts={daily}
        seniorMode={seniorMode}
      />

      {/* Atmosphere Selector & Day/Season Customizer Modal */}
      <AtmosphereSelectorModal
        isOpen={isAtmosphereModalOpen}
        onClose={() => setIsAtmosphereModalOpen(false)}
        currentStation={currentStation}
        atmosphereMode={atmosphereMode}
        onSetAtmosphereMode={setAtmosphereMode}
        selectedTimeOfDay={selectedTimeOfDay}
        onSelectTimeOfDay={setSelectedTimeOfDay}
        selectedSeason={selectedSeason}
        onSelectSeason={setSelectedSeason}
        currentTheme={currentTheme}
        autoTimeOfDay={autoTimeOfDay}
        autoSeason={autoSeason}
        isChristmasActive={isChristmasActive}
        onTriggerCode={handleTriggerSecretCode}
      />

      {/* Mobile PWA & Fullscreen Install Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Universal Locality Search Modal */}
      <LocalitySearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        currentStation={currentStation}
        onSelectStation={(st) => setCurrentStation(st)}
        seniorMode={seniorMode}
      />

      {/* Multi-Station Comparator Modal */}
      <MultiStationComparatorModal
        isOpen={isComparatorModalOpen}
        onClose={() => setIsComparatorModalOpen(false)}
        baseStation={currentStation}
        seniorMode={seniorMode}
      />

      {/* User Weather Observation & Error Reporting Modal */}
      <UserWeatherReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentStation={currentStation}
        currentWeather={weather}
        activeRecalibration={activeRecalibration}
        onRecalibrationUpdated={(recal) => {
          setActiveRecalibration(recal);
          loadStationData(currentStation, false);
        }}
      />

      {/* Dossier Export Modal */}
      {weather && anomaly && (
        <DossierExportModal
          isOpen={isDossierModalOpen}
          onClose={() => setIsDossierModalOpen(false)}
          station={currentStation}
          weather={weather}
          anomaly={anomaly}
          seniorMode={seniorMode}
        />
      )}

      {/* Interactive Step-by-Step Tutorial Modal */}
      <InteractiveTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as NavTabId)}
      />

      {/* Direct Page Push Notification Permission Prompt */}
      <UpdateNotificationPrompt
        isDirectPage={activeTab === 'realtime'}
        onEnableNotifications={() => setIsNotificationModalOpen(true)}
        onOpenPseudoModal={() => setIsPseudoModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Pseudo Creation & Secret Admin Code Modal */}
      <PseudoModal
        isOpen={isPseudoModalOpen}
        onClose={() => setIsPseudoModalOpen(false)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Admin Panel Modal (Restricted to Admins) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {/* Page & Block Customizer Modal */}
      <PageBlockCustomizerModal
        isOpen={isPageBlockCustomizerOpen}
        onClose={() => setIsPageBlockCustomizerOpen(false)}
      />
    </div>
  );
}


export function App() {
  const [showWeatherApp, setShowWeatherApp] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.location.hash !== '#presentation' && window.location.hash !== '#accueil';
  });

  useEffect(() => {
    const syncRoute = () => {
      setShowWeatherApp(window.location.hash !== '#presentation' && window.location.hash !== '#accueil');
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  if (!showWeatherApp) {
    return (
      <HomePage
        onEnterApp={() => {
          window.location.hash = '';
          setShowWeatherApp(true);
        }}
      />
    );
  }

  return <WeatherApp />;
}
