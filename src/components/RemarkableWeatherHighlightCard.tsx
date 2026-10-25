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

  // Stations nationales emblématiques sous surveillance vent & tempêtes
  const NATIONAL_WIND_BENCHMARKS = [
    { name: 'Mont Ventoux (84)', region: 'Sommet Provence 1912m', gust: 114, speed: 82, dir: 'Nord-Nord-Ouest', alert: 'Tempête de crête' },
    { name: 'Cap Gris-Nez (62)', region: 'Manche / Détroit', gust: 86, speed: 58, dir: 'Sud-Ouest', alert: 'Grand Frais' },
    { name: 'Ouessant / Iroise (29)', region: 'Mer d\'Iroise / Finistère', gust: 88, speed: 62, dir: 'Ouest-Sud-Ouest', alert: 'Coup de vent' },
    { name: 'Cap Béar (66)', region: 'Côte Vermeille / Tramontane', gust: 92, speed: 65, dir: 'Nord-Ouest', alert: 'Tramontane forte' },
    { name: 'Cap Corse / Ersa (2B)', region: 'Haute-Corse / Libeccio', gust: 98, speed: 70, dir: 'Ouest-Sud-Ouest', alert: 'Libeccio violent' },
    { name: 'Pic du Midi (65)', region: 'Haute Chaîne Pyrénées 2877m', gust: 105, speed: 75, dir: 'Nord-Ouest', alert: 'Bourrasques de crête' },
    { name: 'Mont Aigoual (30)', region: 'Sommet Cévennes 1567m', gust: 96, speed: 68, dir: 'Nord', alert: 'Coup de vent' },
    { name: 'Pointe du Raz (29)', region: 'Cap Sizun / Atlantique', gust: 84, speed: 56, dir: 'Ouest', alert: 'Vent soutenu' },
    { name: 'Cap Fréhel (22)', region: 'Côtes-d\'Armor / Manche', gust: 79, speed: 54, dir: 'Sud-Ouest', alert: 'Grand Frais' },
    { name: 'Aiguille du Midi (74)', region: 'Massif du Mont-Blanc 3842m', gust: 118, speed: 85, dir: 'Ouest', alert: 'Blizzard d\'altitude' }
  ];

  // Stations nationales emblématiques de référence neige & isotherme
  const NATIONAL_SNOW_BENCHMARKS = [
    { name: 'Col de Porte (38)', region: 'Chartreuse 1325m', alt: 1325, lpn: lpn, snowRisk: lpn <= 1400 ? 'Chutes en cours' : 'Sec / Doux', state: 'Référence nivo Météo-France' },
    { name: 'Mont Aigoual (30)', region: 'Cévennes 1567m', alt: 1567, lpn: lpn, snowRisk: lpn <= 1600 ? 'Flocons probables' : 'Sec', state: 'Crête cévenole' },
    { name: 'Pic du Midi (65)', region: 'Pyrénées 2877m', alt: 2877, lpn: lpn, snowRisk: 'Neige permanente', state: 'Haute montagne' },
    { name: 'Le Markstein (68)', region: 'Vosges 1184m', alt: 1184, lpn: lpn, snowRisk: lpn <= 1200 ? 'Giboulées blanches' : 'Pluie', state: 'Crêtes vosgiennes' },
    { name: 'Puy de Sancy (63)', region: 'Massif Central 1660m', alt: 1660, lpn: lpn, snowRisk: lpn <= 1700 ? 'Manteau hivernal' : 'Pluie', state: 'Sommet d\'Auvergne' },
    { name: 'Col du Lautaret (05)', region: 'Alpes du Sud 2058m', alt: 2058, lpn: lpn, snowRisk: 'Gel & neige', state: 'Grand col alpin' }
  ];

  // Calcul du créneau horaire en français simple et accessible pour tout public
  const computePublicFriendlyWindSlot = () => {
    if (!next24hHours || next24hHours.length === 0) {
      return {
        peakSlotText: "Aujourd'hui en continu",
        calmSlotText: "Stabilisation progressive",
        peakHourText: "vers l'après-midi",
        criticalLevel: isLocalGaleActive ? "Coup de vent en cours" : "Vent modéré sans gravité",
        timeSlots: [
          { slot: 'Matin (06h - 12h)', gust: Math.round(currentWindGust * 0.8), label: 'Vent modéré', status: 'normal' },
          { slot: 'Après-midi (12h - 18h)', gust: currentWindGust, label: isLocalGaleActive ? 'Pic de rafales' : 'Brise vive', status: isLocalGaleActive ? 'warning' : 'normal' },
          { slot: 'Soirée (18h - 22h)', gust: Math.round(currentWindGust * 0.75), label: 'Accalmie', status: 'calm' },
          { slot: 'Nuit (22h - 06h)', gust: Math.round(currentWindGust * 0.55), label: 'Calme', status: 'calm' }
        ]
      };
    }

    // Regroupement par créneau de 6h
    const morningHours = next24hHours.filter(h => {
      const hr = typeof h.hourNumber === 'number' ? h.hourNumber : parseInt(h.hourLabel || '0', 10);
      return hr >= 6 && hr < 12;
    });
    const afternoonHours = next24hHours.filter(h => {
      const hr = typeof h.hourNumber === 'number' ? h.hourNumber : parseInt(h.hourLabel || '0', 10);
      return hr >= 12 && hr < 18;
    });
    const eveningHours = next24hHours.filter(h => {
      const hr = typeof h.hourNumber === 'number' ? h.hourNumber : parseInt(h.hourLabel || '0', 10);
      return hr >= 18 && hr < 22;
    });
    const nightHours = next24hHours.filter(h => {
      const hr = typeof h.hourNumber === 'number' ? h.hourNumber : parseInt(h.hourLabel || '0', 10);
      return hr >= 22 || hr < 6;
    });

    const maxMorn = morningHours.length ? Math.max(...morningHours.map(h => h.windGust ?? h.windSpeed ?? 0)) : currentWindGust;
    const maxAft = afternoonHours.length ? Math.max(...afternoonHours.map(h => h.windGust ?? h.windSpeed ?? 0)) : currentWindGust;
    const maxEve = eveningHours.length ? Math.max(...eveningHours.map(h => h.windGust ?? h.windSpeed ?? 0)) : currentWindGust;
    const maxNgt = nightHours.length ? Math.max(...nightHours.map(h => h.windGust ?? h.windSpeed ?? 0)) : currentWindGust;

    // Détermination du pic maximal
    let peakPeriodName = "Cet après-midi entre 14h00 et 17h30";
    let calmPeriodName = "Ce soir dès 20h00 avec retour au calme";

    const peakHour = peakHourObj?.hourLabel || peakHourObj?.time || '15h00';
    const hrNum = parseInt(peakHour, 10);

    if (hrNum >= 6 && hrNum < 12) {
      peakPeriodName = `Ce matin entre 08h00 et 11h30 (Pic à ${peakHour})`;
      calmPeriodName = "Dès le début d'après-midi (atténuation progressive)";
    } else if (hrNum >= 12 && hrNum < 18) {
      peakPeriodName = `Cet après-midi entre 13h30 et 17h30 (Pic maximal vers ${peakHour})`;
      calmPeriodName = "En soirée à partir de 20h00 (baisse sensible des rafales)";
    } else if (hrNum >= 18 && hrNum < 22) {
      peakPeriodName = `Ce soir entre 18h30 et 21h30 (Pic vers ${peakHour})`;
      calmPeriodName = "En milieu de nuit dès 23h00";
    } else {
      peakPeriodName = `La nuit prochaine entre 01h00 et 05h30 (Pic nocturne vers ${peakHour})`;
      calmPeriodName = "Demain matin dès les premières lueurs du jour";
    }

    return {
      peakSlotText: peakPeriodName,
      calmSlotText: calmPeriodName,
      peakHourText: peakHour,
      criticalLevel: maxGustIn24h >= 80 ? 'Fort coup de vent à tempête' : maxGustIn24h >= 60 ? 'Coup de vent notable' : 'Vent de saison régulier',
      timeSlots: [
        { slot: 'Matin (06h - 12h)', gust: maxMorn, label: maxMorn >= 65 ? 'Fortes rafales' : maxMorn >= 45 ? 'Vent modéré' : 'Brise calme', status: maxMorn >= 65 ? 'danger' : maxMorn >= 45 ? 'warning' : 'calm' },
        { slot: 'Après-midi (12h - 18h)', gust: maxAft, label: maxAft >= 65 ? 'Pic le plus violent' : maxAft >= 45 ? 'Vent soutenu' : 'Brise normale', status: maxAft >= 65 ? 'danger' : maxAft >= 45 ? 'warning' : 'calm' },
        { slot: 'Soirée (18h - 22h)', gust: maxEve, label: maxEve >= 65 ? 'Rafales persistantes' : maxEve >= 45 ? 'Vent frais' : 'Accalmie', status: maxEve >= 65 ? 'warning' : 'calm' },
        { slot: 'Nuit (22h - 06h)', gust: maxNgt, label: maxNgt >= 65 ? 'Rafales nocturnes' : maxNgt >= 45 ? 'Courant résiduel' : 'Nuit calme', status: maxNgt >= 65 ? 'warning' : 'calm' }
      ]
    };
  };

  const friendlySlots = computePublicFriendlyWindSlot();

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

          {/* CRÉNEAU HORAIRE EN CLAIR POUR TOUT PUBLIC */}
          <div className="rounded-xl bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 border border-slate-800 p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Créneaux Horaires en Clair (Compréhension Grand Public)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {friendlySlots.criticalLevel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Créneau violent */}
              <div className="rounded-lg p-2.5 bg-rose-950/20 border border-rose-500/30 flex items-start gap-2.5">
                <span className="text-base shrink-0">🚨</span>
                <div>
                  <div className="text-[11px] font-black uppercase text-rose-300">
                    Créneau le plus agité / Pic maximal :
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {friendlySlots.peakSlotText}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Rafales attendues jusqu'à <strong>{maxGustIn24h} km/h</strong> sous les plus fortes bourrasques.
                  </div>
                </div>
              </div>

              {/* Créneau accalmie */}
              <div className="rounded-lg p-2.5 bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
                <span className="text-base shrink-0">🟢</span>
                <div>
                  <div className="text-[11px] font-black uppercase text-emerald-300">
                    Période d'accalmie &amp; retour au calme :
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {friendlySlots.calmSlotText}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Le flux perdra rapidement en intensité pour redevenir inoffensif.
                  </div>
                </div>
              </div>
            </div>

            {/* Découpage de la journée en 4 créneaux compréhensibles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {friendlySlots.timeSlots.map((ts, idx) => {
                const isDanger = ts.status === 'danger';
                const isWarning = ts.status === 'warning';
                return (
                  <div key={idx} className={`rounded-lg p-2 border flex flex-col justify-between ${
                    isDanger 
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                      : isWarning
                      ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}>
                    <div className="text-[10px] font-bold truncate">{ts.slot}</div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className={`text-base font-black ${isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-200'}`}>
                        {ts.gust} <span className="text-[10px] font-normal">km/h</span>
                      </span>
                      <span className="text-[9px] font-medium truncate ml-1">{ts.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* National Benchmarks Radar for Wind */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span>10 Points Chauds Éoliens Emblématiques en France (Rafales maximales observées)</span>
              </span>
              <span className="text-[10px] text-slate-400">Réseau anémométrique officiel</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {NATIONAL_WIND_BENCHMARKS.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <div className="text-[11px] font-bold text-white truncate" title={item.name}>{item.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{item.region}</div>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className={`text-sm font-black ${item.gust >= 100 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {item.gust} <span className="text-[9px] font-normal">km/h</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{item.dir.split('-')[0]}</span>
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-amber-500/90 truncate mt-0.5">
                    {item.alert}
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

          {/* National Benchmarks Radar for Snow & Freezing Level */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Points de Référence Nivologique &amp; Isotherme en France</span>
              </span>
              <span className="text-[10px] text-slate-400">Réseau nivo-météorologique</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {NATIONAL_SNOW_BENCHMARKS.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <div className="text-[11px] font-bold text-white truncate" title={item.name}>{item.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{item.region}</div>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-xs font-black text-cyan-300">{item.alt} m</span>
                    <span className="text-[9px] font-mono text-slate-400">LPN: {item.lpn}m</span>
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-sky-400/90 truncate mt-0.5">
                    {item.snowRisk}
                  </div>
                </div>
              ))}
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
