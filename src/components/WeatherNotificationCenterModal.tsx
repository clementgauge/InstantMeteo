import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  BellOff, 
  ShieldAlert, 
  Smartphone, 
  Zap, 
  Wind, 
  CloudRain, 
  Sun, 
  Snowflake, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Send, 
  Trash2, 
  Info,
  Sparkles,
  ChevronRight,
  Radio,
  Radar,
  Compass,
  Navigation,
  MapPin,
  LocateFixed,
  ArrowUpRight
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { 
  WeatherAlertNotification, 
  NotificationPreferences, 
  LiveThreatEvaluation, 
  AlertCategory 
} from '../types/notifications';
import { 
  loadNotificationPreferences, 
  saveNotificationPreferences, 
  isNotificationSupported, 
  getBrowserNotificationPermission, 
  requestNotificationPermission, 
  evaluateLiveThreatAndAlerts, 
  sendTestNotification, 
  sendRadarTestNotification,
  getNotificationHistory, 
  clearNotificationHistory,
  playAlertChime
} from '../services/notificationService';
import { calculateRadarProximity } from '../services/seasonalProjectionService';

interface WeatherNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LocationPoint;
  currentWeather: CurrentWeather | null;
  hourlyForecasts: HourlyForecast[];
  dailyForecasts: DailyForecast[];
  seniorMode?: boolean;
}

export const WeatherNotificationCenterModal: React.FC<WeatherNotificationCenterModalProps> = ({
  isOpen,
  onClose,
  station,
  currentWeather,
  hourlyForecasts,
  dailyForecasts,
  seniorMode = false
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'LIVE_DIAGNOSTIC' | 'RADAR_PROXIMITY' | 'PREFERENCES' | 'HISTORY_TEST'>('LIVE_DIAGNOSTIC');
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadNotificationPreferences());
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>('default');
  const [isRequestingPerm, setIsRequestingPerm] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState<boolean | null>(null);
  const [history, setHistory] = useState<WeatherAlertNotification[]>([]);
  const [liveEvaluation, setLiveEvaluation] = useState<LiveThreatEvaluation | null>(null);
  
  // Radar Proximity Subtab state
  const [radarFilterBand, setRadarFilterBand] = useState<'300' | '100' | '50' | '20'>('100');
  const [gpsLocationActive, setGpsLocationActive] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Load state and run live analysis on open
  useEffect(() => {
    if (isOpen) {
      setBrowserPerm(getBrowserNotificationPermission());
      setPrefs(loadNotificationPreferences());
      setHistory(getNotificationHistory());
      const evaluation = evaluateLiveThreatAndAlerts(station, currentWeather, hourlyForecasts, dailyForecasts);
      setLiveEvaluation(evaluation);
    }
  }, [isOpen, station, currentWeather, hourlyForecasts, dailyForecasts]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequestingPerm(true);
    try {
      const perm = await requestNotificationPermission();
      setBrowserPerm(perm);
      if (perm === 'granted') {
        const updated = { ...prefs, enabled: true };
        setPrefs(updated);
        saveNotificationPreferences(updated);
        playAlertChime('INFO');
      }
    } finally {
      setIsRequestingPerm(false);
    }
  };

  const handleTogglePref = <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveNotificationPreferences(updated);
  };

  const handleToggleCategory = (catKey: keyof NotificationPreferences['categories']) => {
    const updatedCategories = {
      ...prefs.categories,
      [catKey]: !prefs.categories[catKey]
    };
    const updated = { ...prefs, categories: updatedCategories };
    setPrefs(updated);
    saveNotificationPreferences(updated);
  };

  const handleSendTest = async () => {
    const res = await sendTestNotification(station.name);
    setTestSentSuccess(res);
    setHistory(getNotificationHistory());
    setTimeout(() => {
      setTestSentSuccess(null);
    }, 4000);
  };

  const handleClearHistory = () => {
    clearNotificationHistory();
    setHistory([]);
  };

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      setGpsError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }
    setIsLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGpsLocationActive(true);
        setIsLocating(false);
      },
      (err) => {
        setGpsError(`Impossible d'obtenir la position GPS (${err.message}). Utilisation de la station ${station.name}.`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const supported = isNotificationSupported();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-inner">
              <BellRing className="h-6 w-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-lg sm:text-xl'}`}>
                  Centre d'Alertes &amp; Notifications Météo
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Temps Réel
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Surveillance active et transmission d'alertes ciblées pour <strong className="text-white font-bold">{station.name}</strong> ({station.department})
              </p>
            </div>
          </div>

          <button
            id="close-weather-notif-modal-btn"
            onClick={onClose}
            className="rounded-2xl border border-slate-700 bg-slate-800/80 p-2.5 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Permission Banner */}
        <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`h-3 w-3 rounded-full ${
                browserPerm === 'granted' 
                  ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse' 
                  : browserPerm === 'denied'
                  ? 'bg-rose-500 ring-4 ring-rose-500/20'
                  : 'bg-amber-400 ring-4 ring-amber-500/20'
              }`} />
              <div className="text-xs sm:text-sm">
                <span className="text-slate-400">Statut des notifications : </span>
                <strong className={
                  browserPerm === 'granted' ? 'text-emerald-400' : browserPerm === 'denied' ? 'text-rose-400' : 'text-amber-400'
                }>
                  {browserPerm === 'granted' 
                    ? 'Autorisées sur cet appareil 🟢' 
                    : browserPerm === 'denied' 
                    ? 'Bloquées par le navigateur 🔴' 
                    : 'En attente d\'autorisation 🟡'}
                </strong>
              </div>
            </div>

            {browserPerm !== 'granted' && (
              <button
                id="request-notif-permission-btn"
                onClick={handleRequestPermission}
                disabled={isRequestingPerm}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-indigo-500 hover:to-blue-500 transition active:scale-95 disabled:opacity-50"
              >
                <Smartphone className="h-4 w-4" />
                <span>{isRequestingPerm ? 'Demande en cours...' : 'Activer les alertes sur mon téléphone'}</span>
              </button>
            )}

            {browserPerm === 'granted' && (
              <div className="flex items-center gap-2">
                <button
                  id="test-chime-btn"
                  onClick={() => playAlertChime('SEVERE')}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Tester le carillon sonore"
                >
                  <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Tester le son</span>
                </button>
                <span className="text-[11px] text-emerald-400/90 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                  ✓ Récepteur Actif
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/90 px-3 sm:px-6 gap-1">
          <button
            id="tab-notif-live-btn"
            onClick={() => setActiveSubTab('LIVE_DIAGNOSTIC')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'LIVE_DIAGNOSTIC'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Diagnostic &amp; Analyses</span>
            {liveEvaluation && liveEvaluation.activeAlerts.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                {liveEvaluation.activeAlerts.length}
              </span>
            )}
          </button>

          <button
            id="tab-notif-radar-btn"
            onClick={() => setActiveSubTab('RADAR_PROXIMITY')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'RADAR_PROXIMITY'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radar className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Traqueur Radar (300km / 100km)</span>
            {liveEvaluation?.radarProximityEchoes && (liveEvaluation.radarProximityEchoes.threateningCellsCount100km > 0 || liveEvaluation.radarProximityEchoes.threateningCellsCount300km > 0) && (
              <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-slate-950 animate-pulse">
                {liveEvaluation.radarProximityEchoes.threateningCellsCount100km > 0 
                  ? `${liveEvaluation.radarProximityEchoes.threateningCellsCount100km} (<100km)` 
                  : `${liveEvaluation.radarProximityEchoes.threateningCellsCount300km}`}
              </span>
            )}
          </button>

          <button
            id="tab-notif-prefs-btn"
            onClick={() => setActiveSubTab('PREFERENCES')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'PREFERENCES'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Paramètres &amp; Seuils</span>
          </button>

          <button
            id="tab-notif-history-btn"
            onClick={() => setActiveSubTab('HISTORY_TEST')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'HISTORY_TEST'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Testeur &amp; Historique ({history.length})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: LIVE DIAGNOSTIC & SELECTED RELEVANT DATA           */}
          {/* ======================================================== */}
          {activeSubTab === 'LIVE_DIAGNOSTIC' && liveEvaluation && (
            <div className="space-y-6">
              {/* Threat Score Header Card */}
              <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      <span>Évaluation du Niveau de Risque Actuel</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                      <span>Indice de Menace Globale :</span>
                      <span className={`font-mono ${
                        liveEvaluation.threatScore >= 80 ? 'text-rose-400' : liveEvaluation.threatScore >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {liveEvaluation.threatScore}/100
                      </span>
                    </h3>
                  </div>

                  <div className={`px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg ${
                    liveEvaluation.threatLevel === 'ALERTE_MAXIMALE'
                      ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/50 animate-pulse'
                      : liveEvaluation.threatLevel === 'RISQUE_ELEVE'
                      ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                      : liveEvaluation.threatLevel === 'VIGILANCE_MODEREE'
                      ? 'bg-yellow-950/90 border-yellow-500 text-yellow-200'
                      : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                  }`}>
                    <span>{liveEvaluation.dominantAlert?.emoji || '🟢'}</span>
                    <span>{liveEvaluation.threatLevel.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Progress Gauge */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        liveEvaluation.threatScore >= 80 
                          ? 'bg-gradient-to-r from-amber-500 to-rose-600' 
                          : liveEvaluation.threatScore >= 50 
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500' 
                          : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                      }`}
                      style={{ width: `${Math.max(5, liveEvaluation.threatScore)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>0 (Calme absolu)</span>
                    <span>50 (Vigilance Jaune/Orange)</span>
                    <span>100 (Paroxysme Rouge)</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  {liveEvaluation.evaluationSummary}
                </p>
              </div>

              {/* Mobile Notification Preview (Ultra Realistic Lock-screen mockup) */}
              <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 to-slate-950 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-indigo-400" />
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-300">
                      Aperçu de la Notification Envoyée sur votre Smartphone
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    Format Lock Screen PWA / Web Push
                  </span>
                </div>

                {liveEvaluation.dominantAlert ? (
                  /* Realistic Mobile Notification Card */
                  <div className="max-w-md mx-auto rounded-2xl bg-slate-900/95 border border-indigo-500/50 p-4 shadow-2xl backdrop-blur space-y-2 ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow">
                          IM
                        </div>
                        <span className="text-xs font-bold text-slate-200">Instant Météo • Alerte Immédiate</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Maintenant</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>{liveEvaluation.dominantAlert.emoji}</span>
                        <span>{liveEvaluation.dominantAlert.title}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">
                        {liveEvaluation.dominantAlert.shortSummary}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[10px]">
                      <span className="font-mono text-amber-300 font-bold">
                        ⏱️ Créneau : {liveEvaluation.dominantAlert.timeWindow} (Pic : {liveEvaluation.dominantAlert.peakHour})
                      </span>
                      <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                        Consulter <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto rounded-2xl bg-slate-900/95 border border-emerald-500/40 p-4 shadow-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-black shadow">
                          IM
                        </div>
                        <span className="text-xs font-bold text-slate-200">Instant Météo • Veille Active</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Maintenant</span>
                    </div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>🟢</span>
                      <span>Conditions Climatologiques Stables à {station.name}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      Aucun danger météo à signaler pour les prochaines 24h. Le système vous notifiera instantanément en cas d'apparition de rafales, orages ou pluie critique.
                    </p>
                  </div>
                )}
              </div>

              {/* Detailed Breakdown of All Evaluated Criteria */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Critères Scientifiques &amp; Données Météo Extraites</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Filtre anti-spam : seuls les critères critiques déclenchent un push
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Orages & Convection */}
                  <div className="p-4 rounded-2xl border border-slate-700 bg-slate-900/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span>Orages &amp; Instabilité Convective</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        liveEvaluation.activeAlerts.some(a => a.category === 'ORAGE')
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {liveEvaluation.activeAlerts.some(a => a.category === 'ORAGE') ? '⚠️ ALERTE ACTIVE' : '🟢 RISQUE FAIBLE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Surveillance de l'énergie CAPE (J/kg), de l'indice de soulèvement (Lifted Index) et du risque de grêle sur la commune.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <div>Statut : <strong className="text-white">Heure par heure</strong></div>
                      <div>Déclencheur : <strong className="text-amber-300">CAPE &gt; 800 J/kg</strong></div>
                    </div>
                  </div>

                  {/* Vent violent */}
                  <div className="p-4 rounded-2xl border border-slate-700 bg-slate-900/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                        <Wind className="h-4 w-4 text-cyan-400" />
                        <span>Rafales &amp; Tempête</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        liveEvaluation.activeAlerts.some(a => a.category === 'VENT')
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {liveEvaluation.activeAlerts.some(a => a.category === 'VENT') ? '⚠️ VENT VIOLENT' : '🟢 MODÉRÉ'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Détection des pointes de vent destructrices et des rafales descendantes sous grains orageux.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <div>Vent actuel : <strong className="text-white">{currentWeather?.windSpeed || 0} km/h</strong></div>
                      <div>Seuil d'alerte : <strong className="text-cyan-300">&gt; 70 km/h</strong></div>
                    </div>
                  </div>

                  {/* Pluies diluviennes */}
                  <div className="p-4 rounded-2xl border border-slate-700 bg-slate-900/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                        <CloudRain className="h-4 w-4 text-blue-400" />
                        <span>Pluies Intenses &amp; Crues Éclair</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        liveEvaluation.activeAlerts.some(a => a.category === 'PLUIE')
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {liveEvaluation.activeAlerts.some(a => a.category === 'PLUIE') ? '⚠️ PLUIE FORTE' : '🟢 SÉCURISÉ'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Analyse des cumuls en 1h et 24h pour prévenir les inondations de caves et chaussées submergées.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <div>Nowcasting 3h : <strong className="text-white">Actif</strong></div>
                      <div>Seuil d'alerte : <strong className="text-blue-300">&gt; 15 mm/h</strong></div>
                    </div>
                  </div>

                  {/* Canicule & Chaleur */}
                  <div className="p-4 rounded-2xl border border-slate-700 bg-slate-900/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span>Canicule &amp; Humidex Extrême</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        liveEvaluation.activeAlerts.some(a => a.category === 'CANICULE')
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {liveEvaluation.activeAlerts.some(a => a.category === 'CANICULE') ? '⚠️ CANICULE' : '🟢 NORMAL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Surveillance des seuils bioclimatiques diurnes et nocturnes pour la santé et le confort.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <div>Température : <strong className="text-white">{currentWeather?.temperature.toFixed(1) || 20}°C</strong></div>
                      <div>Seuil canicule : <strong className="text-amber-400">&gt; 35°C (Tx)</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: RADAR & PROXIMITY THREAT TRACKER (300km / 100km)  */}
          {/* ======================================================== */}
          {activeSubTab === 'RADAR_PROXIMITY' && (
            <div className="space-y-6">
              {(() => {
                const effectiveStation = (gpsLocationActive && gpsCoords) 
                  ? { ...station, latitude: gpsCoords.lat, longitude: gpsCoords.lon, name: `${station.name} (Position GPS)` }
                  : station;

                const radar = currentWeather?.radarProximity || calculateRadarProximity(
                  effectiveStation,
                  currentWeather?.precipitation || 0,
                  currentWeather?.weatherCode || 0,
                  currentWeather?.windSpeed || 15,
                  currentWeather?.windDirection || 220,
                  800,
                  hourlyForecasts.slice(0, 6).map(h => h.rainMm || h.precipitationMm || 0)
                );

                const maxDistance = parseInt(radarFilterBand, 10);
                const allStorms = radar.topThunderstormCells300km || [];
                const allRains = radar.topRainEchoes300km || [];

                const filteredStorms = allStorms.filter(c => c.distanceKm <= maxDistance);
                const filteredRains = allRains.filter(c => c.distanceKm <= maxDistance);

                const nearestStorm = filteredStorms[0] || allStorms[0] || null;
                const nearestRain = filteredRains[0] || allRains[0] || null;

                return (
                  <div className="space-y-6">
                    {/* GPS Location & Radius Control Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-950/80 border border-cyan-500/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                          <Compass className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">Position de Surveillance</h4>
                            {gpsLocationActive ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> GPS Actif
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                Station : {station.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {gpsLocationActive && gpsCoords 
                              ? `Coordonnées GPS réelles : ${gpsCoords.lat.toFixed(4)}°N, ${gpsCoords.lon.toFixed(4)}°E`
                              : `Centre radar basé sur ${station.name} (${station.department})`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id="radar-locate-me-btn"
                          onClick={handleLocateMe}
                          disabled={isLocating}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                            gpsLocationActive 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-indigo-600/80 text-white hover:bg-indigo-600 border border-indigo-400/40'
                          }`}
                        >
                          <LocateFixed className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
                          <span>{isLocating ? 'Géolocalisation...' : gpsLocationActive ? 'Actualiser mon GPS' : 'Autour de ma position GPS'}</span>
                        </button>
                      </div>
                    </div>

                    {gpsError && (
                      <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                        <span>{gpsError}</span>
                      </div>
                    )}

                    {/* Radius selector buttons */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <Radio className="h-4 w-4 text-cyan-400" />
                          <span>Sélectionner le Rayon de Détection Radar</span>
                        </span>
                        <span className="text-[11px] text-cyan-300 font-mono">
                          {filteredStorms.length} orage(s) • {filteredRains.length} écho(s) de pluie
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: '300', label: '< 300 km', sub: 'Échelle Synoptique (Grand Quart)', color: 'border-cyan-500' },
                          { id: '100', label: '< 100 km', sub: 'Échelle Méso (Département)', color: 'border-amber-500' },
                          { id: '50', label: '< 50 km', sub: 'Couronne Proche (< 1h)', color: 'border-rose-500' },
                          { id: '20', label: '< 20 km', sub: 'Zone Immédiate / Sur place', color: 'border-purple-500' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setRadarFilterBand(btn.id as any)}
                            className={`p-3 rounded-2xl border text-left transition ${
                              radarFilterBand === btn.id
                                ? `bg-cyan-950/80 ${btn.color} text-white ring-2 ring-cyan-500/40 shadow-lg`
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-sm text-white flex items-center justify-between">
                              <span>{btn.label}</span>
                              {radarFilterBand === btn.id && <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{btn.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Threat Highlight Cards (Storm & Rain) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Storm Cell Proximity Highlight */}
                      <div className="p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                              <Zap className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white">Cellule Orageuse la Plus Proche</h4>
                              <p className="text-[11px] text-slate-400">Réseau ARAMIS Doppler Météo-France</p>
                            </div>
                          </div>
                          {nearestStorm && (
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                              nearestStorm.distanceKm <= 25 
                                ? 'bg-rose-500/30 text-rose-200 border-rose-500 animate-pulse'
                                : nearestStorm.distanceKm <= 100
                                ? 'bg-amber-500/30 text-amber-200 border-amber-500'
                                : 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
                            }`}>
                              {nearestStorm.distanceKm <= 25 ? '🚨 Impact Imminent' : nearestStorm.distanceKm <= 100 ? '⚡ En Approche' : '🛰️ Surveillance'}
                            </span>
                          )}
                        </div>

                        {nearestStorm ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Distance &amp; Azimut :</span>
                                <strong className="text-white text-sm font-black">{nearestStorm.distanceKm} km</strong>
                                <span className="text-slate-400 text-[11px] ml-1">({nearestStorm.bearingCompass})</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Temps estimé (ETA) :</span>
                                <strong className="text-amber-400 text-sm font-black">
                                  {nearestStorm.distanceKm <= 3 ? 'Sur zone (0 min)' : `~${nearestStorm.estimatedArrivalMinutes} min`}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Vitesse Déplacement :</span>
                                <strong className="text-slate-200 font-mono">{nearestStorm.speedKmh} km/h</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Foudre Météorage :</span>
                                <strong className="text-amber-300 font-mono">{nearestStorm.lightningStrikesCount15min} éclairs/15m</strong>
                              </div>
                            </div>

                            <button
                              id="test-push-storm-cell-btn"
                              onClick={() => sendRadarTestNotification(station.name, 'ORAGE', nearestStorm.distanceKm, nearestStorm.bearingCompass, nearestStorm.estimatedArrivalMinutes || 30)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold transition shadow-md active:scale-95"
                            >
                              <Smartphone className="h-4 w-4" />
                              <span>Tester la Notification Push pour cet Orage ({nearestStorm.distanceKm} km)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs">
                            Aucun orage détecté dans le rayon de {maxDistance} km.
                          </div>
                        )}
                      </div>

                      {/* Rain Echo Proximity Highlight */}
                      <div className="p-5 rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-950 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                              <CloudRain className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white">Ligne de Pluie la Plus Proche</h4>
                              <p className="text-[11px] text-slate-400">Réflectivité radar Z-R &amp; Nowcasting</p>
                            </div>
                          </div>
                          {nearestRain && (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-blue-500/30 text-blue-200 border-blue-500">
                              {nearestRain.distanceKm <= 20 ? '🌧️ Pluie Imminente' : '🌧️ En Approche'}
                            </span>
                          )}
                        </div>

                        {nearestRain ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Distance &amp; Azimut :</span>
                                <strong className="text-white text-sm font-black">{nearestRain.distanceKm} km</strong>
                                <span className="text-slate-400 text-[11px] ml-1">({nearestRain.bearingCompass})</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Temps estimé (ETA) :</span>
                                <strong className="text-cyan-400 text-sm font-black">
                                  {nearestRain.distanceKm <= 2 ? 'En cours' : `~${nearestRain.estimatedArrivalMinutes} min`}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Intensité Précipitations :</span>
                                <strong className="text-blue-300 font-mono">{nearestRain.intensityMmH} mm/h</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Réflectivité Radar :</span>
                                <strong className="text-slate-200 font-mono">{nearestRain.reflectivityDbz} dBZ</strong>
                              </div>
                            </div>

                            <button
                              id="test-push-rain-echo-btn"
                              onClick={() => sendRadarTestNotification(station.name, 'PLUIE', nearestRain.distanceKm, nearestRain.bearingCompass, nearestRain.estimatedArrivalMinutes || 25)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition shadow-md active:scale-95"
                            >
                              <Smartphone className="h-4 w-4" />
                              <span>Tester la Notification Push pour cette Pluie ({nearestRain.distanceKm} km)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs">
                            Aucun écho de pluie mesuré dans le rayon de {maxDistance} km.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed List of All Cells in Selected Radius */}
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>Inventaire Détaillé des Cellules Météo Actives ({filteredStorms.length + filteredRains.length})</span>
                        <span className="text-[11px] text-slate-400 font-normal">Rayon &lt; {maxDistance} km</span>
                      </h4>

                      <div className="space-y-2.5">
                        {filteredStorms.map((cell) => (
                          <div 
                            key={cell.id}
                            className="p-4 rounded-2xl border border-amber-500/30 bg-slate-900/90 hover:bg-slate-900 transition flex flex-wrap items-center justify-between gap-3 shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                                <Zap className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-white text-sm">{cell.cellName}</h5>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    {cell.stormSeverity}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                                  <span>📍 <strong>{cell.distanceKm} km</strong> ({cell.bearingCompass})</span>
                                  <span>⏱️ ETA : <strong className="text-amber-400">{cell.distanceKm <= 3 ? 'Immédiat' : `~${cell.estimatedArrivalMinutes} min`}</strong></span>
                                  <span>⚡ Foudre : <strong>{cell.lightningStrikesCount15min} / 15m</strong></span>
                                  <span>💨 Dérive : <strong>{cell.speedKmh} km/h</strong></span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => sendRadarTestNotification(station.name, 'ORAGE', cell.distanceKm, cell.bearingCompass, cell.estimatedArrivalMinutes || 30)}
                              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                            >
                              Alerter Push
                            </button>
                          </div>
                        ))}

                        {filteredRains.map((cell) => (
                          <div 
                            key={cell.id}
                            className="p-4 rounded-2xl border border-blue-500/30 bg-slate-900/90 hover:bg-slate-900 transition flex flex-wrap items-center justify-between gap-3 shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                                <CloudRain className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-white text-sm">{cell.cellName}</h5>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                    {cell.intensityLabel}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                                  <span>📍 <strong>{cell.distanceKm} km</strong> ({cell.bearingCompass})</span>
                                  <span>⏱️ ETA : <strong className="text-cyan-400">{cell.distanceKm <= 2 ? 'En cours' : `~${cell.estimatedArrivalMinutes} min`}</strong></span>
                                  <span>🌧️ Pluie : <strong>{cell.intensityMmH} mm/h</strong></span>
                                  <span>📡 Réflectivité : <strong>{cell.reflectivityDbz} dBZ</strong></span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => sendRadarTestNotification(station.name, 'PLUIE', cell.distanceKm, cell.bearingCompass, cell.estimatedArrivalMinutes || 25)}
                              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                            >
                              Alerter Push
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PREFERENCES & ALERT THRESHOLDS                    */}
          {/* ======================================================== */}
          {activeSubTab === 'PREFERENCES' && (
            <div className="space-y-6">
              {/* Master Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Activer la Veille Météo Push</h4>
                    <p className="text-xs text-slate-300">Recevoir des notifications en temps réel pour ma localité</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={prefs.enabled} 
                    onChange={(e) => handleTogglePref('enabled', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Radar Proximity Threshold Controls */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
                    <Radar className="h-4 w-4 text-cyan-400" />
                    <span>Seuil de Distance pour les Alertes Radar Proximité</span>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    Rayon Max : &lt; {prefs.radarDistanceThresholdKm || 100} km
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 300, label: '300 km (Synoptique)' },
                    { val: 100, label: '100 km (Méso-échelle)' },
                    { val: 50, label: '50 km (Proximité)' },
                    { val: 20, label: '20 km (Immédiat)' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      onClick={() => handleTogglePref('radarDistanceThresholdKm', r.val as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        prefs.radarDistanceThresholdKm === r.val
                          ? 'bg-cyan-950 border-cyan-500 text-white ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-300">Alerter uniquement en cas d'approche directe vers ma zone</span>
                  <input 
                    type="checkbox"
                    checked={prefs.radarApproachingOnly}
                    onChange={(e) => handleTogglePref('radarApproachingOnly', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Categories Selection */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300">
                  Phénomènes Météo à Surveiller
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'radarProximity', label: 'Traqueur Radar & Échos Proches (<300km/100km)', desc: 'Cellules orageuses & lignes de pluie en approche avec ETA', icon: Radar, color: 'text-cyan-400' },
                    { id: 'vigilance', label: 'Vigilances Officielles (Jaune/Orange/Rouge)', desc: 'Changements de statuts départementaux Météo-France', icon: ShieldAlert, color: 'text-amber-400' },
                    { id: 'thunderstorms', label: 'Orages Violents & Grêle', desc: 'Pic horaire, CAPE > 800 J/kg, foudre', icon: Zap, color: 'text-yellow-400' },
                    { id: 'galeWind', label: 'Vent Violent & Coups de Gale', desc: 'Rafales supérieures à 70 km/h', icon: Wind, color: 'text-cyan-400' },
                    { id: 'torrentialRain', label: 'Pluies Diluviennes & Crues', desc: 'Précipitations > 15 mm/h', icon: CloudRain, color: 'text-blue-400' },
                    { id: 'heatwave', label: 'Canicule & Chaleur Extrême', desc: 'Température ressentie > 38°C', icon: Sun, color: 'text-amber-500' },
                    { id: 'frostSnow', label: 'Gel Nocturne & Chutes de Neige', desc: 'Risque de verglas et températures < 0°C', icon: Snowflake, color: 'text-blue-300' },
                  ].map((cat) => {
                    const isChecked = prefs.categories[cat.id as keyof NotificationPreferences['categories']];
                    const IconComponent = cat.icon;
                    return (
                      <div 
                        key={cat.id}
                        onClick={() => handleToggleCategory(cat.id as keyof NotificationPreferences['categories'])}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                          isChecked 
                            ? 'bg-slate-900 border-indigo-500/50 ring-1 ring-indigo-500/30' 
                            : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${cat.color}`} />
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white">{cat.label}</div>
                            <div className="text-[11px] text-slate-400">{cat.desc}</div>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => {}} // Handled by parent div
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Severity Filter */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300">
                  Niveau de Sensibilité des Alertes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'ALL', label: 'Toutes les Alertes', sub: 'Dès vigilance jaune ou événement notable', emoji: '🟡' },
                    { id: 'MODERATE_PLUS', label: 'Risque Confirmé & Orange', sub: 'Recommandé (évite les alertes mineures)', emoji: '🟠' },
                    { id: 'SEVERE_ONLY', label: 'Urgences & Rouge Seul', sub: 'Uniquement les phénomènes destructeurs', emoji: '🔴' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => handleTogglePref('minSeverity', lvl.id as NotificationPreferences['minSeverity'])}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        prefs.minSeverity === lvl.id
                          ? 'bg-indigo-950/80 border-indigo-500 text-white ring-2 ring-indigo-500/40'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-white">
                        <span>{lvl.emoji}</span>
                        <span>{lvl.label}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{lvl.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound, Vibration & Night mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="h-4 w-4 text-indigo-400" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">Signal Sonore</div>
                      <div className="text-[11px] text-slate-400">Carillon synthétique instantané</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={prefs.soundAlerts} 
                    onChange={(e) => handleTogglePref('soundAlerts', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" 
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Vibrate className="h-4 w-4 text-indigo-400" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">Vibration Mobile</div>
                      <div className="text-[11px] text-slate-400">Schéma haptique selon la sévérité</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={prefs.vibration} 
                    onChange={(e) => handleTogglePref('vibration', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: TEST DISPATCHER & NOTIFICATION HISTORY            */}
          {/* ======================================================== */}
          {activeSubTab === 'HISTORY_TEST' && (
            <div className="space-y-6">
              {/* Test Dispatcher Card */}
              <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Send className="h-4 w-4 text-indigo-400" />
                      <span>Simulateur &amp; Testeur de Notification Push</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Envoyez immédiatement un message de test réel sur cet appareil pour vérifier l'affichage et le carillon.
                    </p>
                  </div>

                  <button
                    id="trigger-test-push-btn"
                    onClick={handleSendTest}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg hover:from-indigo-500 hover:to-blue-500 transition active:scale-95"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Envoyer un Test Réel sur mon Appareil</span>
                  </button>
                </div>

                {testSentSuccess === true && (
                  <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Notification de test expédiée avec succès ! Regardez le centre de notifications de votre téléphone ou ordinateur.</span>
                  </div>
                )}

                {testSentSuccess === false && (
                  <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>Échec de l'envoi : Veuillez autoriser les notifications dans votre navigateur en cliquant sur le bouton en haut de la fenêtre.</span>
                  </div>
                )}
              </div>

              {/* History list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300">
                    Historique des Alertes Transmises ({history.length})
                  </h4>
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Effacer l'historique</span>
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-950/50 text-slate-400 space-y-2">
                    <BellOff className="h-8 w-8 text-slate-600 mx-auto" />
                    <p className="text-xs sm:text-sm">Aucune notification archivée pour le moment.</p>
                    <p className="text-[11px] text-slate-500">Cliquez sur « Envoyer un Test Réel » pour vérifier le bon fonctionnement.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {history.map((alert) => (
                      <div 
                        key={alert.id}
                        className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{alert.emoji}</span>
                            <h5 className="font-bold text-white text-xs sm:text-sm">{alert.title}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${alert.badgeBg} ${alert.badgeColor}`}>
                              {alert.severityLabel}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{alert.formattedTime}</span>
                        </div>

                        <p className="text-xs text-slate-300">
                          {alert.shortSummary}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                          <span>Localité : <strong className="text-slate-200">{alert.stationName}</strong></span>
                          <span>Créneau : <strong className="text-amber-300">{alert.timeWindow}</strong> (Pic : {alert.peakHour})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-5 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Calculs météorologiques haute résolution • Traitement local sécurisé</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
