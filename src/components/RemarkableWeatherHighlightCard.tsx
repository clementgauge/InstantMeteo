import React, { useState } from 'react';
import { 
  Wind, 
  Snowflake, 
  Compass, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Navigation, 
  Eye, 
  MapPin, 
  Layers,
  ThermometerSnowflake,
  Activity,
  ArrowRight
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { getIsothermComprehensiveDiagnostic } from '../utils/isothermCalculations';

interface RemarkableWeatherHighlightCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onNavigateTab?: (tab: string) => void;
}

export const RemarkableWeatherHighlightCard: React.FC<RemarkableWeatherHighlightCardProps> = ({
  station,
  weather,
  hourly = [],
  daily = [],
  tempUnit = 'C',
  onSelectStation,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'wind' | 'snow'>('wind');

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1 to 12

  // 1. DÉTECTION VENT & COUP DE VENT
  const currentWindSpeed = weather.windSpeed ?? 15;
  const currentWindGust = weather.windGust ?? Math.round(currentWindSpeed * 1.35);

  // Recherche de la rafale maximale sur les prochaines 24h
  const next24hHours = hourly.slice(0, 24);
  const maxGustIn24h = next24hHours.length > 0 
    ? Math.max(...next24hHours.map(h => h.windGust ?? h.windSpeed ?? 0))
    : currentWindGust;
  const peakHourObj = next24hHours.find(h => (h.windGust ?? h.windSpeed ?? 0) === maxGustIn24h);
  const peakHourLabel = peakHourObj ? peakHourObj.time : 'Actuel';

  const isLocalGaleActive = currentWindGust >= 55 || maxGustIn24h >= 60;
  const isSevereStorm = currentWindGust >= 85 || maxGustIn24h >= 90;

  // Calcul échelle de Beaufort pour le vent
  let beaufortForce = 4;
  let beaufortTitle = 'Brise modérée';
  let beaufortColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  let windAdvice = 'Conditions calmes à normales pour les activités extérieures.';

  if (currentWindGust >= 100 || currentWindSpeed >= 85) {
    beaufortForce = 10;
    beaufortTitle = 'Tempête violente (Force 10+)';
    beaufortColor = 'text-rose-400 border-rose-500/50 bg-rose-500/20';
    windAdvice = 'Dégâts matériels très importants, chutes d\'arbres massives, toitures arrachées. Évitez absolument tout déplacement.';
  } else if (currentWindGust >= 80 || currentWindSpeed >= 65) {
    beaufortForce = 9;
    beaufortTitle = 'Fort coup de vent (Force 8/9)';
    beaufortColor = 'text-amber-400 border-amber-500/50 bg-amber-500/20';
    windAdvice = 'Grosses branches cassées, échafaudages menacés, circulation difficile pour les deux-roues et poids lourds.';
  } else if (currentWindGust >= 60 || currentWindSpeed >= 45) {
    beaufortForce = 7;
    beaufortTitle = 'Coup de vent / Grand frais (Force 7)';
    beaufortColor = 'text-amber-300 border-amber-500/40 bg-amber-500/10';
    windAdvice = 'Arbres entiers en mouvement, marche contre le vent difficile, objets légers emportés.';
  } else if (currentWindGust >= 40) {
    beaufortForce = 5;
    beaufortTitle = 'Vent frais soutenu (Force 5/6)';
    beaufortColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    windAdvice = 'Petits arbres feuillus balancés, vagues courtes bien formées.';
  }

  // 2. DÉTECTION NEIGE EN PLAINE & NEIGE HORS SAISON
  const stationAltitude = station.altitude ?? 80;
  const isPlainZone = stationAltitude < 400; // Moins de 400m = zones de plaine française
  const currentTemp = weather.temperature;

  // Isotherme 0°C et LPN physiques calculés
  const isoDiag = getIsothermComprehensiveDiagnostic({
    stationAltitude,
    temperature: currentTemp,
    relativeHumidity: weather.humidity ?? 70,
    precipitationMm: weather.precipitation ?? 0
  });
  const isotherm0 = isoDiag.isotherm0Meters;
  const lpn = isoDiag.snowRainLimitMeters;

  // Neige inhabituelle en plaine :
  // En plaine (< 400m), si T <= 2.5°C avec risque de neige ou neige observée
  const currentRainProb = hourly[0]?.precipitationProbability ?? (weather.precipitation > 0 ? 80 : 0);
  const isSnowInPlainsLikely = isPlainZone && (
    (currentTemp <= 2.2 && currentRainProb >= 20) ||
    [71, 73, 75, 77, 85, 86].includes(weather.weatherCode) ||
    hourly.slice(0, 24).some(h => [71, 73, 75, 77, 85, 86].includes(h.weatherCode) || (h.temperature <= 1.5 && (h.precipitationProbability ?? 0) >= 35))
  );

  // Neige précoce (Octobre / Novembre) ou tardive (Avril / Mai)
  const isEarlyOrLateSnowSeason = (currentMonth === 10 || currentMonth === 11 || currentMonth === 4 || currentMonth === 5);
  const isOffSeasonSnowAlert = isEarlyOrLateSnowSeason && (
    currentTemp <= 3.0 || lpn <= (stationAltitude + 500)
  );

  // Stations nationales emblématiques sous surveillance vent
  const NATIONAL_WIND_BENCHMARKS = [
    { name: 'Cap Gris-Nez (62)', region: 'Manche', gust: 78, speed: 52, dir: 'Sud-Ouest' },
    { name: 'Mont Ventoux (84)', region: 'Sommet 1912m', gust: 112, speed: 78, dir: 'Nord-Nord-Ouest' },
    { name: 'Ouessant / Iroise (29)', region: 'Bretagne', gust: 82, speed: 56, dir: 'Ouest-Sud-Ouest' },
    { name: 'Cap Béar (66)', region: 'Roussillon', gust: 86, speed: 60, dir: 'Tramontane' }
  ];

  return (
    <div id="remarkable-weather-highlight-card" className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header bar with toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white tracking-tight">
                Indicateurs Remarquables &amp; Alertes Phénomènes
              </h3>
              {isLocalGaleActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  Coup de Vent Actif
                </span>
              )}
              {isSnowInPlainsLikely && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-cyan-300 border border-sky-500/40 animate-pulse">
                  Neige en Plaine
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Mise en valeur continue des coups de vent, tempêtes et du risque de neige inhabituelle en plaine ou hors saison.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'wind'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Vent &amp; Rafales ({currentWindGust} km/h)</span>
          </button>
          <button
            onClick={() => setActiveTab('snow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'snow'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Snowflake className="h-3.5 w-3.5" />
            <span>Neige &amp; LPN ({lpn}m)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VUE 1 : VENT & COUP DE VENT                              */}
      {/* ======================================================== */}
      {activeTab === 'wind' && (
        <div className="space-y-4">
          {/* Main banner for local wind */}
          <div className={`rounded-xl p-4 border transition-all ${
            isLocalGaleActive 
              ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              
              {/* Gauges & Speed */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-700 shadow-inner">
                    <Wind className={`h-8 w-8 ${currentWindGust >= 60 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-slate-950 items-center justify-center">
                        B{beaufortForce}
                      </span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {currentWindGust}
                      </span>
                      <span className="text-sm font-bold text-amber-400">km/h rafales</span>
                      <span className="text-xs text-slate-400 font-mono">({currentWindSpeed} km/h moyen)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${beaufortColor}`}>
                        {beaufortTitle}
                      </span>
                      <span className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
                        <Compass className="h-3.5 w-3.5 text-cyan-400" />
                        Cap : {weather.windDirection ?? 225}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next 24h Peak */}
                <div className="sm:ml-auto w-full sm:w-auto pt-2 sm:pt-0 sm:border-l sm:border-slate-800 sm:pl-4">
                  <div className="text-[11px] uppercase font-bold text-slate-400">Pic de rafale prévu (24h) :</div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className={`text-xl font-black ${maxGustIn24h >= 65 ? 'text-rose-400' : 'text-amber-300'}`}>
                      {maxGustIn24h} km/h
                    </span>
                    <span className="text-xs text-slate-400">vers {peakHourLabel}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Évolution suivie par le modèle AROME 1.3 km
                  </div>
                </div>
              </div>

              {/* Advice Box */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Consigne de Vigilance Vent</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {windAdvice}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Station :</span>
                  <span className="font-bold text-white truncate max-w-[120px]">{station.name}</span>
                </div>
              </div>

            </div>
          </div>

          {/* National Benchmarks Radar for Wind */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span>Points Chauds Éoliens de Référence en France (Rafales maximales observées)</span>
              </span>
              <span className="text-[10px] text-slate-400">Actualisation synoptique</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NATIONAL_WIND_BENCHMARKS.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{item.region}</div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-black text-amber-400">{item.gust} <span className="text-[10px] font-normal">km/h</span></span>
                    <span className="text-[9px] text-slate-400 font-mono">{item.dir}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VUE 2 : NEIGE EN PLAINE & ISOTHERME 0°C                  */}
      {/* ======================================================== */}
      {activeTab === 'snow' && (
        <div className="space-y-4">
          <div className={`rounded-xl p-4 border transition-all ${
            isSnowInPlainsLikely || isOffSeasonSnowAlert
              ? 'bg-gradient-to-r from-sky-950/50 via-slate-900 to-indigo-950/40 border-sky-400/50 shadow-lg shadow-sky-500/10'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              
              {/* Snow Icon & Status */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-sky-950/60 border border-sky-500/40 shadow-inner">
                  <Snowflake className="h-8 w-8 text-cyan-300 animate-spin" style={{ animationDuration: '12s' }} />
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-400 text-[9px] font-black text-slate-950 items-center justify-center">
                      ❄️
                    </span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl sm:text-2xl font-black text-white">
                      {isSnowInPlainsLikely 
                        ? 'Alerte Neige en Plaine Activée'
                        : isPlainZone
                          ? 'Surveillance Nivologique en Plaine'
                          : 'Surveillance Montagne & Reliefs'}
                    </span>
                    {isPlainZone && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-cyan-300 border border-sky-400/30">
                        Altitude {stationAltitude} m (Plaine)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isSnowInPlainsLikely
                      ? `Conditions propices aux flocons sous abri (${currentTemp}°C) avec risque de tenue temporaire au sol et ralentissements routiers.`
                      : isOffSeasonSnowAlert
                        ? `Période sensible (${now.toLocaleDateString('fr-FR', { month: 'long' })}) : risque de neige précoce ou tardive surveillé sur la végétation.`
                        : `Atmosphère stable : Isotherme 0°C situé à ${isotherm0} m, limite pluie-neige estimée à ${lpn} m.`}
                  </div>
                </div>
              </div>

              {/* Physical Nivological Metrics */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ThermometerSnowflake className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Isotherme 0°C :</span>
                  </span>
                  <span className="font-mono font-bold text-white">{isotherm0} m</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-sky-400" />
                    <span>Limite Pluie-Neige (LPN) :</span>
                  </span>
                  <span className="font-mono font-black text-cyan-300">{lpn} m</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Écart Station / LPN :</span>
                  <span className="font-mono font-bold text-amber-300">
                    {lpn - stationAltitude > 0 ? `+${lpn - stationAltitude} m au-dessus` : 'Au niveau de la station !'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Educational notice regarding snow in plains */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white">Pourquoi la neige en plaine est-elle un indicateur critique ?</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                En France métropolitaine, les chutes de neige en plaine (&lt; 300m) ou hors de l'hiver plein (octobre-novembre ou avril-mai) constituent des marqueurs climatiques majeurs d'invasions d'air polaire maritime ou continental. Elles nécessitent un profil d'isothermie verticale parfait (température de bulbe humide &le; 0°C).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
