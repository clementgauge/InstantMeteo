import React, { useState, useEffect, useRef } from 'react';
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
  Hash,
  Film
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly } from './types/weather';
import { FRENCH_STATIONS } from './data/frenchStations';
import { fetchWeatherData, getLocalityFromCoordinates, getFallbackWeatherData } from './services/openMeteoService';
import { getRichWeatherInfo } from './utils/weatherIcons';
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
import { FloatingWeatherBubble } from './components/FloatingWeatherBubble';
import { applyCorrectionToWeather, subscribeToContradictions } from './services/liveContradictionService';
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
import { RecalibrationState, getActiveRecalibration, clearActiveRecalibration, applyDirectTemperatureOffset } from './services/userObservationService';
import { WinterSnowObservatoryCard } from './components/WinterSnowObservatoryCard';
import { FrostAndColdObservatoryCard } from './components/FrostAndColdObservatoryCard';
import { CloudNephologyObservatoryCard } from './components/CloudNephologyObservatoryCard';
import { Mountain, ThermometerSnowflake, Cloud, History, Compass, TrendingUp, Radio, Flame, Droplets, Waves } from 'lucide-react';
import { HomePage } from './views/HomePage';
import { DirectAlertBanner } from './components/DirectAlertBanner';
import { AdminAnnouncementBanner } from './components/AdminAnnouncementBanner';
import { HistoricalTrendsAndRealtimeView } from './views/HistoricalTrendsAndRealtimeView';
import { SportsAndRouteView } from './views/SportsAndRouteView';
import { WorldDisastersView } from './views/WorldDisastersView';
import { WeatherHistoryArchiveView } from './views/WeatherHistoryArchiveView';
import { CompetitiveGamingView } from './views/CompetitiveGamingView';
import { DiscussionGroupView } from './views/DiscussionGroupView';
import { MountainWeatherView } from './views/MountainWeatherView';
import { BeachWeatherView } from './views/BeachWeatherView';
import { DroughtAndFireView } from './views/DroughtAndFireView';
import { WatercoursesView } from './views/WatercoursesView';
import { PseudoModal } from './components/PseudoModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { PageBlockCustomizerModal } from './components/PageBlockCustomizerModal';
import { verifyAdminCode, adminToggleAdminStatus, loadPlayerProfile } from './services/competitiveGameService';
import { isPageVisible } from './services/displayPreferencesService';
import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';
import { UpdateNotificationPrompt } from './components/UpdateNotificationPrompt';
import { DynamicWeatherAffiliateBanner } from './components/DynamicWeatherAffiliateBanner';
import { AffiliateStoreFooter } from './components/AffiliateStoreFooter';
import { CommunityWeatherMap } from './components/CommunityWeatherMap';
import { ensurePlayerProfileRestored } from './services/competitiveGameService';
import { SeoPageGuideCard } from './components/SeoPageGuideCard';
import { SeoHead } from './components/SeoHead';
import { WeatherGameModal } from './components/WeatherGameModal';
import { updateDocumentSeo } from './utils/seoVerification';
import { getTabIdForPath, getSeoDataForPath, getPathForTabId } from './seo/pagesSeoData';

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
  const initialFallbackRef = useRef(getFallbackWeatherData(currentStation));
  const [weather, setWeather] = useState<CurrentWeather | null>(() => initialFallbackRef.current.current);
  const rawWeatherRef = useRef<CurrentWeather | null>(initialFallbackRef.current.current);
  const [hourly, setHourly] = useState<HourlyForecast[]>(() => initialFallbackRef.current.hourly);
  const [daily, setDaily] = useState<DailyForecast[]>(() => initialFallbackRef.current.daily);
  const [anomaly, setAnomaly] = useState<ClimateAnomaly | null>(() => initialFallbackRef.current.anomaly);

  // Écoute dynamique des contradictions & régénérations haute intensité
  useEffect(() => {
    const unsubscribe = subscribeToContradictions(() => {
      if (rawWeatherRef.current && currentStation) {
        const { weather: rectified } = applyCorrectionToWeather(currentStation.id, rawWeatherRef.current);
        setWeather(rectified);
      }
    });
    return unsubscribe;
  }, [currentStation]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    if (typeof window !== 'undefined') {
      const tabFromPath = getTabIdForPath(window.location.pathname) as NavTabId;
      if (tabFromPath) return tabFromPath;
    }
    return 'realtime';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  // Synchronisation SEO DOM dynamique & auto-référentielle lors des changements de page
  useEffect(() => {
    updateDocumentSeo(activeTab, true);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const p = window.location.pathname;
        setCurrentPath(p);
        const tabFromPath = getTabIdForPath(p) as NavTabId;
        if (tabFromPath) {
          setActiveTab(tabFromPath);
          updateDocumentSeo(tabFromPath, false);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  // Mode Simplifié par défaut pour les nouveaux visiteurs (vue épurée essentielle)
  // avec option de passer en Mode Complet (Expert) mémorisée localement
  const [simplifiedMode, setSimplifiedMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('instant_meteo_simplified_mode');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (_) {}
    return true; // Défaut pour nouveaux visiteurs : mode simplifié épuré
  });

  const handleToggleSimplifiedMode = () => {
    setSimplifiedMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('instant_meteo_simplified_mode', String(next));
      } catch (_) {}
      return next;
    });
  };

  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('instant_meteo_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    return 'dark';
  });

  const handleToggleThemeMode = () => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('instant_meteo_theme_mode', next);
      } catch (_) {}
      return next;
    });
  };

  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('theme-light');
      document.body.style.backgroundColor = 'transparent';
      document.body.style.color = '#0f172a';
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [themeMode]);
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
  const [isWeatherGameOpen, setIsWeatherGameOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const p = loadPlayerProfile();
      return !!(p && p.isAdmin);
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    ensurePlayerProfileRestored();
    const handleScoreUpdated = () => {
      const p = loadPlayerProfile();
      setIsAdmin(!!(p && p.isAdmin));
    };
    window.addEventListener('instant_meteo_score_updated', handleScoreUpdated);
    return () => window.removeEventListener('instant_meteo_score_updated', handleScoreUpdated);
  }, []);

  const [activeRecalibration, setActiveRecalibration] = useState<RecalibrationState | null>(() => getActiveRecalibration());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFloatingBubble, setShowFloatingBubble] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('instant_meteo_bubble_active');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const handleToggleFloatingBubble = () => {
    setShowFloatingBubble((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('instant_meteo_bubble_active', String(next));
      } catch (e) {}
      return next;
    });
  };

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
      const p = loadPlayerProfile();
      if (p) {
        adminToggleAdminStatus(p, true);
      }
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

  // Automatic and Manual High-Precision GPS Geolocation
  const handleLocateGps = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          try {
            // Obtain high-accuracy locality with exact commune name via official French reverse geocoding
            const preciseLocality = await getLocalityFromCoordinates(userLat, userLon);
            if (preciseLocality && preciseLocality.name) {
              setCurrentStation(preciseLocality);
              return;
            }
          } catch (geoErr) {
            console.warn("High-precision reverse geocoding error, falling back:", geoErr);
          }

          // Fallback if network lookup failed
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

          const fallbackStation: LocationPoint = {
            id: `gps-${userLat.toFixed(4)}-${userLon.toFixed(4)}`,
            name: `Position (${userLat.toFixed(2)}°, ${userLon.toFixed(2)}°)`,
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
          setCurrentStation(fallbackStation);
        },
        (err) => {
          console.log("GPS geolocation fallback to default station:", err.message);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }
  };

  // Load weather when current station changes & persist station selection
  const loadStationData = async (station: LocationPoint, showLoading: boolean = true) => {
    if (showLoading && !weather) setIsLoading(true);
    try {
      const data = await fetchWeatherData(station);

      rawWeatherRef.current = data.current;
      // Applique une éventuelle rectification par régénération haute intensité en cours
      const { weather: rectifiedWeather } = applyCorrectionToWeather(station.id, data.current);

      setWeather(rectifiedWeather);
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

  const handleApplyDirectOffset = (offset: number) => {
    applyDirectTemperatureOffset(currentStation.id, currentStation.name, offset);
    setActiveRecalibration(getActiveRecalibration());
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
    { id: 'mountain', category: 'MAPS', label: '14. 🏔️ Météo Montagne & Nivologie (BERA)', icon: Mountain, highlight: true },
    { id: 'beaches', category: 'MAPS', label: '15. 🏖️ Météo des Plages & Littoral (SHOM)', icon: Waves, highlight: true },
    { id: 'droughtFire', category: 'DIRECT', label: '16. 🔥 Vigi Sécheresse & Forêts (VigiEau)', icon: Flame, highlight: true },
    { id: 'watercourses', category: 'DIRECT', label: '17. 💧 Vigie Cours d\'Eau & Crues (Vigicrues)', icon: Droplets, highlight: true },
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
        { id: 'realtime-certified-precision', label: 'Observatoire de référence (Expert)', icon: Sliders },
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
                            : activeTab === 'mountain'
                              ? genericPageSection('Météo Montagne & Nivologie (BERA)', Mountain)
                              : activeTab === 'beaches'
                                ? genericPageSection('Météo des Plages & Littoral (SHOM)', Waves)
                                : activeTab === 'droughtFire'
                                  ? genericPageSection('Vigi Sécheresse & Incendie (VigiEau / Météo des Forêts)', Flame)
                                  : activeTab === 'watercourses'
                                    ? genericPageSection('Vigie Cours d\'Eau & Vigicrues', Droplets)
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

  // Mode Bulle Flottante Détachée (Extérieure à l'application / Bureau / Widget)
  const isMiniBubbleMode = typeof window !== 'undefined' && window.location.search.includes('mini_bubble=true');
  if (isMiniBubbleMode && weather) {
    const info = getRichWeatherInfo(weather.weatherCode, weather.isDay ?? true, weather.precipitation, weather.windGust);
    const tempDisp = tempUnit === 'F' ? `${Math.round(weather.temperature * 9/5 + 32)}°F` : `${weather.temperature > 0 ? '+' : ''}${Math.round(weather.temperature * 10) / 10}°C`;

    return (
      <div className="w-screen h-screen bg-[#020617] flex items-center justify-center p-2 text-white select-none overflow-hidden font-sans">
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#071533] to-[#0e2247] border-2 border-sky-400/60 p-3.5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-sky-400 truncate">
              <span>📍</span>
              <span className="truncate">{currentStation.name}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] text-emerald-300 font-black shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>EN DIRECT</span>
            </div>
          </div>
          <div className="flex items-center justify-between my-1">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">{tempDisp}</div>
              <div className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{info.shortLabel || weather.weatherDescription}</div>
            </div>
            <div className="text-4xl shrink-0">{info.emoji || '☀️'}</div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400">
            <span>💨 {weather.windSpeed} km/h • 💧 {weather.precipitation > 0 ? `${weather.precipitation} mm` : `${weather.humidity}% hum.`}</span>
            <button
              onClick={() => window.open('/', '_blank')}
              className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
            >
              Ouvrir Appli
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen relative text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden ${seniorMode ? 'senior-mode' : ''} ${themeMode === 'light' ? 'theme-light' : ''}`}
    >
      {/* Dynamic Canonical URL & Head SEO Synchronization */}
      <SeoHead activeTab={activeTab} currentPath={currentPath} />

      {/* Dynamic Seasonal & Time-of-Day Atmospheric Background */}
      <AtmosphereBackground 
        theme={currentTheme} 
        seniorMode={seniorMode}
        isLightMode={themeMode === 'light'}
      />

      {/* Header */}
      <div className="relative z-30 w-full max-w-full">
        <Header
          currentStation={currentStation}
          onSelectStation={(st) => setCurrentStation(st)}
          seniorMode={seniorMode}
          onToggleSeniorMode={() => setSeniorMode(!seniorMode)}
          simplifiedMode={simplifiedMode}
          onToggleSimplifiedMode={handleToggleSimplifiedMode}
          themeMode={themeMode}
          onToggleThemeMode={handleToggleThemeMode}
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
          onTriggerSecretCode={handleTriggerSecretCode}
          onOpenRadarTab={() => setActiveTab('radar')}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          showFloatingBubble={showFloatingBubble}
          onToggleFloatingBubble={handleToggleFloatingBubble}
          onOpenWeatherGame={() => setIsWeatherGameOpen(true)}
        />
      </div>

      {/* Full-Page Collapsible Left Sidebar Rail & Mobile Drawer — Placed at root level so it stays in the foreground above header, bottom dock, and page */}
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
        isLightMode={themeMode === 'light'}
      />

      {/* Main Container - Optimized for expansive wide screen comfort with left rail spacing */}
      <main className="relative z-20 flex-1 mx-auto w-full max-w-[1720px] px-2 sm:px-6 lg:px-8 xl:px-10 lg:pl-[84px] py-2 sm:py-4 pb-36 overflow-x-hidden">

        {/* Atmosphere Context & Hub Filter Bar (Desktop only, mobile has it directly in the top header) */}
        <div className="hidden sm:block mb-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 sm:p-3">
          {/* Quick shortcuts — centered. Search is already available in the global header. */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              title="Ouvrir le Centre d'Alertes et Notifications Météo en Temps Réel"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-semibold transition shrink-0 ${
                activeAlertCount > 0
                  ? 'border-amber-500/60 bg-amber-950/70 text-amber-300 hover:bg-amber-900/80'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Alertes &amp; Push</span>
              {activeAlertCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-slate-950">
                  {activeAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vigilance')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'vigilance'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Vigilance 15j</span>
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'radar'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40'
              }`}
            >
              <CloudRain className="h-3.5 w-3.5" />
              <span>Radar HD</span>
            </button>
          </div>
        </div>

        <section className="min-w-0 w-full">
        {/* En-tête sémantique unique H1 propre à chaque URL (conservé dans le DOM pour Google / SEO / SEA mais masqué visuellement pour l'utilisateur) */}
        {(() => {
          const activeRoutePath = getPathForTabId(activeTab, currentPath);
          const activePageSeo = getSeoDataForPath(activeRoutePath);
          return (
            <div className="sr-only">
              <div>
                <h1>
                  {activePageSeo.h1}
                </h1>
                <p>
                  {activePageSeo.description}
                </p>
              </div>
              <div>
                <span>📍 {currentStation.name} ({currentStation.altitude ?? 0} m)</span>
              </div>
            </div>
          );
        })()}

        {/* Flash Announcement Banner from Administrator */}
        <AdminAnnouncementBanner />

        {/* Tab Content */}
        {!weather || !anomaly ? (
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

            {(activeTab === 'realtime' || !['cloudNephology', 'vigilance', 'scenarios14d', 'bulletin', 'eightMonths', 'radar', 'historicalTrends', 'sportsActivities', 'worldDisasters', 'weatherArchive', 'competitive', 'discussionGroup', 'mountain', 'beaches', 'droughtFire', 'watercourses', 'communityReports'].includes(activeTab)) && (
              <div className="space-y-4">
                <RealtimeView
                  station={currentStation}
                  weather={weather}
                  hourly={hourly}
                  daily={daily}
                  anomaly={anomaly}
                  seniorMode={seniorMode}
                  simplifiedMode={simplifiedMode}
                  tempUnit={tempUnit}
                  onSelectStation={(st) => setCurrentStation(st)}
                  onOpenSearchModal={() => setIsSearchModalOpen(true)}
                  onOpenGigaRadar={() => setActiveTab('radar')}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                  onLocateGps={handleLocateGps}
                  onOpenInstallModal={() => setIsInstallModalOpen(true)}
                  onToggleFullscreen={handleToggleFullscreen}
                  isFullscreen={isFullscreen}
                  onRecalibrate={handleApplyDirectOffset}
                  onResetRecalibration={handleClearRecalibration}
                  showFloatingBubble={showFloatingBubble}
                  onToggleFloatingBubble={handleToggleFloatingBubble}
                  onWeatherRectified={() => {
                    if (rawWeatherRef.current && currentStation) {
                      const { weather: rectified } = applyCorrectionToWeather(currentStation.id, rawWeatherRef.current);
                      setWeather(rectified);
                    }
                  }}
                />
              </div>
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
                {/* EN-TÊTE H1 SÉMANTIQUE : CARTE OFFICIELLE DE VIGILANCE */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>Dispositif National de Sécurité Civile &bull; Actualisation 24h/24</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                        Suivi des risques météorologiques par département ({currentStation.name})
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                        Suivi en direct des 12 risques météo sur les 101 départements français : orages violents, crues, canicule, grand froid, neige-verglas et vent violent pour <strong>{currentStation.name}</strong> ({currentStation.department}).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <span className="px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-800 text-xs font-bold text-amber-200">
                        12 Phénomènes Météo-France
                      </span>
                    </div>
                  </div>
                </div>

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
                onOpenWeatherGame={() => setIsWeatherGameOpen(true)}
              />
            )}

            {activeTab === 'discussionGroup' && (
              <DiscussionGroupView
                station={currentStation}
                seniorMode={seniorMode}
                onOpenPseudoModal={() => setIsPseudoModalOpen(true)}
              />
            )}

            {activeTab === 'mountain' && (
              <MountainWeatherView
                station={currentStation}
                weather={weather}
                isLightMode={themeMode === 'light'}
              />
            )}

            {activeTab === 'beaches' && (
              <BeachWeatherView
                station={currentStation}
                weather={weather}
                isLightMode={themeMode === 'light'}
              />
            )}

            {activeTab === 'droughtFire' && (
              <DroughtAndFireView
                station={currentStation}
                weather={weather}
                isLightMode={themeMode === 'light'}
              />
            )}

            {activeTab === 'watercourses' && (
              <WatercoursesView
                station={currentStation}
                weather={weather}
                isLightMode={themeMode === 'light'}
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

            {/* Recommandation de site partenaire - Cin-Scope (Films & Cinéma) - Placé après le bloc Guide & FAQ */}
            <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl p-4 border shadow-sm transition-all ${
              themeMode === 'light'
                ? 'bg-amber-50/90 border-amber-200 text-slate-800'
                : 'bg-gradient-to-r from-slate-900/90 via-slate-850/80 to-slate-900/90 border-slate-700/50 text-slate-100'
            }`}>
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-red-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-inner">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <span>Envie d'une pause cinéma ?</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      Partenaire
                    </span>
                  </p>
                  <p className={`text-[11px] sm:text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Découvrez et explorez également notre autre site dédié au cinéma et aux films :{' '}
                    <a
                      href="https://cin-scope.ai.studio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 dark:text-amber-400 hover:underline font-mono font-medium"
                    >
                      https://cin-scope.ai.studio
                    </a>
                  </p>
                </div>
              </div>
              <a
                href="https://cin-scope.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-md transition transform active:scale-95 hover:shadow-amber-500/20 cursor-pointer"
              >
                <Film className="h-4 w-4" />
                <span>Visiter Cin-Scope</span>
                <span className="text-xs">→</span>
              </a>
            </div>
          </div>
        )}

        {/* Guide & FAQ Météo - Toujours présent dans le DOM dès le rendu initial pour l'indexation SEO */}
        <SeoPageGuideCard
          activeTab={activeTab}
          currentPath={currentPath}
          isLightMode={themeMode === 'light'}
          onNavigateRoute={(p, t) => {
            setCurrentPath(p);
            setActiveTab(t as NavTabId);
            window.history.pushState(null, '', p);
            updateDocumentSeo(p, false);
          }}
        />
        </section>
      </main>

      {/* Footer avec maillage interne complet et URLs canoniques strictes pour Google Search Console */}
      <footer className="border-t border-slate-800/80 bg-slate-950/70 py-8 px-4 text-center text-xs text-slate-500 pb-28">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <p className="text-left font-medium">
              © 2026 <strong>Instant Météo</strong> — Prévisions météorologiques de référence, temps réel, 14 jours, 8 mois par département &amp; Vigilances Météo-France.
            </p>
            <div className="flex flex-wrap items-center gap-3">
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
                🔍 Recherche 34 965 communes
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

          {/* Maillage interne exhaustif des 18 observatoires avec URLs canoniques strictes */}
          <div className="space-y-2 text-left">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Observatoires &amp; Cartographies Instant Météo (Indexation Officielle) :
            </h4>
            <nav aria-label="Index des pages météorologiques" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); setCurrentPath('/'); setActiveTab('realtime'); window.history.pushState(null, '', '/'); updateDocumentSeo('/', false); }}
                className="text-sky-400 hover:text-sky-300 hover:underline font-medium"
              >
                Accueil France
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/direct"
                onClick={(e) => { e.preventDefault(); setCurrentPath('/direct'); setActiveTab('realtime'); window.history.pushState(null, '', '/direct'); updateDocumentSeo('/direct', false); }}
                className="text-sky-400 hover:text-sky-300 hover:underline font-medium"
              >
                Météo en Direct
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/radar"
                onClick={(e) => { e.preventDefault(); setCurrentPath('/radar'); setActiveTab('radar'); window.history.pushState(null, '', '/radar'); updateDocumentSeo('/radar', false); }}
                className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
              >
                Radar Précipitations HD
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/vigilances"
                onClick={(e) => { e.preventDefault(); setCurrentPath('/vigilances'); setActiveTab('vigilance'); window.history.pushState(null, '', '/vigilances'); updateDocumentSeo('/vigilances', false); }}
                className="text-rose-400 hover:text-rose-300 hover:underline font-medium"
              >
                Vigilances Météo-France
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/nuages"
                onClick={(e) => { e.preventDefault(); setCurrentPath('/nuages'); setActiveTab('cloudNephology'); window.history.pushState(null, '', '/nuages'); updateDocumentSeo('/nuages', false); }}
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                Nuages &amp; Néphologie
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/14-jours"
                onClick={(e) => { e.preventDefault(); setCurrentPath('/14-jours'); setActiveTab('scenarios14d'); window.history.pushState(null, '', '/14-jours'); updateDocumentSeo('/14-jours', false); }}
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                Tendances 14 Jours
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/cartes-thematiques"
                onClick={(e) => { e.preventDefault(); setCurrentPath('/cartes-thematiques'); setActiveTab('radar'); window.history.pushState(null, '', '/cartes-thematiques'); updateDocumentSeo('/cartes-thematiques', false); }}
                className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
              >
                Cartes Thématiques (OSM)
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/climat"
                onClick={(e) => { e.preventDefault(); setActiveTab('eightMonths'); window.history.pushState(null, '', '/climat'); }}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
              >
                Tendances 8 Mois &amp; Climat
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/montagne"
                onClick={(e) => { e.preventDefault(); setActiveTab('mountain'); window.history.pushState(null, '', '/montagne'); }}
                className="text-sky-300 hover:text-sky-200 hover:underline font-medium"
              >
                Météo Montagne &amp; BERA
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/plages"
                onClick={(e) => { e.preventDefault(); setActiveTab('beaches'); window.history.pushState(null, '', '/plages'); }}
                className="text-teal-400 hover:text-teal-300 hover:underline font-medium"
              >
                Météo Plages &amp; SHOM
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/secheresse-incendie"
                onClick={(e) => { e.preventDefault(); setActiveTab('droughtFire'); window.history.pushState(null, '', '/secheresse-incendie'); }}
                className="text-orange-400 hover:text-orange-300 hover:underline font-medium"
              >
                Sécheresse &amp; Feux
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/cours-d-eau"
                onClick={(e) => { e.preventDefault(); setActiveTab('watercourses'); window.history.pushState(null, '', '/cours-d-eau'); }}
                className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
              >
                Cours d'Eau &amp; Crues
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/sports"
                onClick={(e) => { e.preventDefault(); setActiveTab('sportsActivities'); window.history.pushState(null, '', '/sports'); }}
                className="text-lime-400 hover:text-lime-300 hover:underline font-medium"
              >
                Météo Sport &amp; Itinéraire
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/bulletins"
                onClick={(e) => { e.preventDefault(); setActiveTab('bulletin'); window.history.pushState(null, '', '/bulletins'); }}
                className="text-violet-400 hover:text-violet-300 hover:underline font-medium"
              >
                Bulletins &amp; 4 Semaines
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/archives"
                onClick={(e) => { e.preventDefault(); setActiveTab('weatherArchive'); window.history.pushState(null, '', '/archives'); }}
                className="text-amber-300 hover:text-amber-200 hover:underline font-medium"
              >
                Archives Journalières
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/monde-catastrophes"
                onClick={(e) => { e.preventDefault(); setActiveTab('worldDisasters'); window.history.pushState(null, '', '/monde-catastrophes'); }}
                className="text-red-400 hover:text-red-300 hover:underline font-medium"
              >
                Catastrophes Monde
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/communaute"
                onClick={(e) => { e.preventDefault(); setActiveTab('discussionGroup'); window.history.pushState(null, '', '/communaute'); }}
                className="text-sky-300 hover:text-sky-200 hover:underline font-medium"
              >
                Salon Météo
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/competition"
                onClick={(e) => { e.preventDefault(); setActiveTab('competitive'); window.history.pushState(null, '', '/competition'); }}
                className="text-yellow-400 hover:text-yellow-300 hover:underline font-medium"
              >
                Arène Compétitive
              </a>
            </nav>
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
        isLightMode={themeMode === 'light'}
      />

      {/* Global Interactive Weather Bubble (Draggable, Detachable Picture-in-Picture & Home Screen Widget) */}
      {showFloatingBubble && weather && (
        <FloatingWeatherBubble
          station={currentStation}
          weather={weather}
          tempUnit={tempUnit}
          onClose={handleToggleFloatingBubble}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onRefresh={handleRefresh}
        />
      )}

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

      {/* Interactive Weather Game Modal (Arcade 2D, Duel, Quiz & .zip Runner) */}
      <WeatherGameModal
        isOpen={isWeatherGameOpen}
        onClose={() => setIsWeatherGameOpen(false)}
        currentStation={currentStation}
        currentWeather={weather}
        onOpenCompetitiveTab={() => setActiveTab('competitive')}
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
