import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Droplets, 
  Wind, 
  Sun, 
  Moon, 
  RefreshCw, 
  Navigation, 
  ChevronRight, 
  ChevronLeft,
  X,
  Maximize2,
  Minimize2,
  Sliders,
  MapPin,
  Clock,
  Sparkles,
  CloudRain
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';

interface SmartwatchRoundViewProps {
  currentStation: LocationPoint;
  weather: CurrentWeather | null;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  onSelectStation: (station: LocationPoint) => void;
  onRefresh: () => void;
  onLocateGps?: () => void;
  themeMode?: 'dark' | 'light';
  onToggleThemeMode?: () => void;
  onCloseWatchMode: () => void;
}

export const SmartwatchRoundView: React.FC<SmartwatchRoundViewProps> = ({
  currentStation,
  weather,
  hourly,
  daily,
  onSelectStation,
  onRefresh,
  onLocateGps,
  themeMode = 'dark',
  onToggleThemeMode,
  onCloseWatchMode,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isRotatingRefresh, setIsRotatingRefresh] = useState(false);
  const [activeWatchFace, setActiveWatchFace] = useState<'main' | 'hourly' | 'radar_info'>('main');
  const [watchBezelSimulation, setWatchBezelSimulation] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // Si l'écran est déjà une vraie montre (shape: round ou écran <= 420px), pas besoin du faux contour en plastique
      const isActualRoundScreen = window.matchMedia && window.matchMedia('(shape: round)').matches;
      const isTinyScreen = window.innerWidth <= 420 && window.innerHeight <= 420;
      return !isActualRoundScreen && !isTinyScreen;
    }
    return true;
  });

  // Horloge temps réel de la montre
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRotatingRefresh(true);
    onRefresh();
    setTimeout(() => setIsRotatingRefresh(false), 900);
  };

  // Calculs météo pour le cadran rond
  const tempVal = weather ? Math.round(weather.temperature) : '--';
  const feelsLikeVal = weather ? Math.round(weather.feelsLike ?? weather.temperature) : tempVal;
  const windVal = weather ? Math.round(weather.windSpeed) : 0;
  const humidityVal = weather ? Math.round(weather.humidity) : 0;
  const rainProbability = hourly?.[0]?.precipitationProbability ?? (weather?.precipitation && weather.precipitation > 0 ? 80 : 0);
  
  const todayDaily = daily?.[0];
  const tMin = todayDaily ? Math.round(todayDaily.tempMin) : '--';
  const tMax = todayDaily ? Math.round(todayDaily.tempMax) : '--';

  // Extraire les 6 prochaines heures
  const upcomingHours = (hourly || []).slice(0, 6);

  // Nom optimisé pour petit écran rond (ex: "Paris 75000" ou "Versailles")
  const displayName = currentStation.name.replace(/-(Montsouris|Marignane|Bron|Blagnac|Lesquin|Mérignac|Satory)/gi, '').trim();
  const postalCode = currentStation.postalCode || (currentStation.name.toLowerCase().includes('paris') ? '75000' : '');

  // Calcul des jauges en arc SVG (Rayon 140, circonférence ~ 880)
  const rainAngle = Math.min(100, Math.max(0, rainProbability));
  const windAngle = Math.min(100, Math.max(0, (windVal / 90) * 100));

  return (
    <aside 
      aria-label="Cadran météo montre connectée"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden select-none touch-pan-y"
    >
      {/* Container principal du cadran rond */}
      <div 
        className={`relative flex flex-col items-center justify-between text-white transition-all duration-300 ${
          watchBezelSimulation 
            ? 'w-[360px] h-[360px] xs:w-[390px] xs:h-[390px] sm:w-[420px] sm:h-[420px] rounded-full border-[10px] sm:border-[14px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(0,0,0,0.8)] ring-2 ring-slate-700/60'
            : 'w-full h-full max-w-[460px] max-h-[460px] rounded-full'
        } bg-[#000000] p-4 sm:p-6 overflow-hidden`}
        style={{
          clipPath: 'circle(50% at 50% 50%)',
          WebkitClipPath: 'circle(50% at 50% 50%)'
        }}
      >
        {/* Arcs de jauges circulaires gauche (Pluie) et droite (Vent) */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none -rotate-90" 
          viewBox="0 0 200 200"
        >
          {/* Arc fond gauche (Pluie) */}
          <circle 
            cx="100" cy="100" r="92" 
            fill="none" 
            stroke="#1e293b" 
            strokeWidth="3.5" 
            strokeDasharray="90 360"
            strokeDashoffset="45"
            strokeLinecap="round" 
          />
          {/* Arc actif gauche (Pluie) */}
          <circle 
            cx="100" cy="100" r="92" 
            fill="none" 
            stroke="#38bdf8" 
            strokeWidth="3.5" 
            strokeDasharray={`${(rainAngle / 100) * 90} 360`}
            strokeDashoffset="45"
            strokeLinecap="round" 
          />

          {/* Arc fond droit (Vent) */}
          <circle 
            cx="100" cy="100" r="92" 
            fill="none" 
            stroke="#1e293b" 
            strokeWidth="3.5" 
            strokeDasharray="90 360"
            strokeDashoffset="225"
            strokeLinecap="round" 
          />
          {/* Arc actif droit (Vent) */}
          <circle 
            cx="100" cy="100" r="92" 
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="3.5" 
            strokeDasharray={`${(windAngle / 100) * 90} 360`}
            strokeDashoffset="225"
            strokeLinecap="round" 
          />
        </svg>

        {/* 1. HAUT DU CADRAN : Localité + Horloge */}
        <div className="z-10 flex flex-col items-center text-center pt-2 sm:pt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono tracking-wider font-bold text-sky-400">
              {timeStr}
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
          </div>
          
          <button
            type="button"
            onClick={() => {
              // Bascule rapide entre Paris, Versailles et Lyon en tapant le nom
              const nextStation = displayName.toLowerCase().includes('paris')
                ? FRENCH_STATIONS.find(s => s.name.toLowerCase().includes('versailles')) || FRENCH_STATIONS[1]
                : displayName.toLowerCase().includes('versailles')
                  ? FRENCH_STATIONS.find(s => s.name.toLowerCase().includes('lyon')) || FRENCH_STATIONS[2]
                  : FRENCH_STATIONS[0];
              onSelectStation(nextStation);
            }}
            title="Appuyer pour basculer rapidement de commune"
            className="group flex items-center justify-center gap-1 mt-0.5 active:scale-95 transition-transform"
          >
            <MapPin className="h-3 w-3 text-sky-400 group-hover:scale-110 transition-transform" />
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white truncate max-w-[150px] sm:max-w-[180px]">
              {displayName} {postalCode && <span className="text-[10px] text-sky-300 font-bold">{postalCode}</span>}
            </h2>
          </button>
        </div>

        {/* 2. CENTRE DU CADRAN : Température géante & Météo */}
        {activeWatchFace === 'main' ? (
          <div className="z-10 flex flex-col items-center justify-center my-auto text-center px-4">
            {/* Température géante au centre */}
            <div className="flex items-start justify-center leading-none">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white font-sans drop-shadow-md">
                {tempVal}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 ml-0.5">°</span>
            </div>

            {/* Condition Météo + Ressenti */}
            <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-200">
              <span>{weather?.weatherDescription || 'Ciel Dégagé'}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Ressenti {feelsLikeVal}°</span>
            </div>

            {/* Min / Max du jour */}
            <div className="mt-1 flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400">
              <span className="text-sky-300 font-bold">↓ {tMin}°</span>
              <span>·</span>
              <span className="text-amber-300 font-bold">↑ {tMax}°</span>
            </div>

            {/* Complications latérales (Pluie 1h & Vent) sous forme de badge minimal */}
            <div className="flex items-center gap-4 mt-2 text-[10px] font-semibold text-slate-300">
              <div className="flex items-center gap-1 text-sky-300">
                <Droplets className="h-3 w-3 text-sky-400" />
                <span>{rainProbability}%</span>
              </div>
              <div className="flex items-center gap-1 text-amber-300">
                <Wind className="h-3 w-3 text-amber-400" />
                <span>{windVal} km/h</span>
              </div>
            </div>
          </div>
        ) : (
          /* Vue Heure par Heure concentrique sur montre */
          <div className="z-10 flex flex-col items-center justify-center my-auto w-full px-2 py-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1.5">
              Prochaines Heures
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full max-w-[240px]">
              {upcomingHours.slice(0, 6).map((h, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 text-center flex flex-col items-center justify-center"
                >
                  <span className="text-[9px] font-mono text-slate-400">{h.time}</span>
                  <span className="text-xs font-black text-white my-0.5">{Math.round(h.temperature)}°</span>
                  <span className="text-[8px] text-sky-400 font-bold">{h.precipitationProbability}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BAS DU CADRAN : Commandes tactiles circulaires pour petits écrans */}
        <div className="z-10 flex items-center justify-center gap-2 sm:gap-3 pb-2 sm:pb-3">
          {/* Bouton GPS */}
          {onLocateGps && (
            <button
              type="button"
              onClick={onLocateGps}
              title="Position GPS"
              aria-label="Localiser par GPS"
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 active:scale-90 transition-transform cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5 fill-emerald-400/20" />
            </button>
          )}

          {/* Bouton Alterner Cadran Principal / Heure par heure */}
          <button
            type="button"
            onClick={() => setActiveWatchFace(prev => prev === 'main' ? 'hourly' : 'main')}
            title={activeWatchFace === 'main' ? "Voir prévisions heure par heure" : "Revenir à la température"}
            aria-label="Basculer vue horaire"
            className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 font-bold text-xs active:scale-90 transition-transform cursor-pointer shadow-md"
          >
            {activeWatchFace === 'main' ? '48H' : 'NOW'}
          </button>

          {/* Bouton Actualiser */}
          <button
            type="button"
            onClick={handleManualRefresh}
            title="Rafraîchir les relevés"
            aria-label="Rafraîchir"
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 active:scale-90 transition-transform cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRotatingRefresh ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Bouton Jour / Nuit (Icône seule sans texte) */}
          {onToggleThemeMode && (
            <button
              type="button"
              onClick={onToggleThemeMode}
              title={themeMode === 'light' ? "Mode Nuit" : "Mode Jour"}
              aria-label="Mode Jour/Nuit"
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 active:scale-90 transition-transform cursor-pointer"
            >
              {themeMode === 'light' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5 text-sky-400" />}
            </button>
          )}

          {/* Bouton Quitter Mode Montre */}
          <button
            type="button"
            onClick={onCloseWatchMode}
            title="Quitter le mode montre (revenir au site complet)"
            aria-label="Quitter mode montre"
            className="w-8 h-8 rounded-full bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-300 active:scale-90 transition-transform cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bouton externe pour activer/désactiver le simulateur de boîtier rond */}
        <div className="absolute top-2 right-6 sm:right-8 z-20">
          <button
            type="button"
            onClick={() => setWatchBezelSimulation(prev => !prev)}
            title={watchBezelSimulation ? "Mode plein écran sans boîtier" : "Afficher le boîtier rond de montre"}
            aria-label="Changer affichage boîtier"
            className="text-[9px] text-slate-500 hover:text-slate-300 font-mono"
          >
            {watchBezelSimulation ? 'Plein' : 'Cadran'}
          </button>
        </div>
      </div>
    </aside>
  );
};
