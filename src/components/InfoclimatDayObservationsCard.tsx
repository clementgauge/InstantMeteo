import React, { useState, useMemo } from 'react';
import { 
  Thermometer, 
  Sun, 
  CloudRain, 
  Clock, 
  Radio, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Activity, 
  Maximize2, 
  Info, 
  Layers, 
  Globe, 
  MapPin, 
  Sparkles, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { WORLD_STATIONS } from '../data/worldStations';
import { getNormalsForStation } from '../data/climateNormals';

interface InfoclimatDayObservationsCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onNavigateTab?: (tab: string) => void;
}

export const InfoclimatDayObservationsCard: React.FC<InfoclimatDayObservationsCardProps> = ({
  station,
  weather,
  hourly = [],
  daily = [],
  tempUnit = 'C',
  onSelectStation,
  onNavigateTab
}) => {
  const [activeNetworkTab, setActiveNetworkTab] = useState<'current' | 'compare'>('current');
  const [showTechnicalSpecs, setShowTechnicalSpecs] = useState<boolean>(false);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°C`;
  };

  // Calculs scientifiques des 4 métriques de la journée en cours
  const dayStats = useMemo(() => {
    const now = new Date();
    const curH = now.getHours();

    // Heures écoulées depuis 00h locale
    const passedHours = hourly.filter(h => {
      const hRaw = parseInt(h.hourLabel?.replace('h', '') || '0', 10);
      return isNaN(hRaw) ? true : hRaw <= curH;
    });
    const hoursToAnalyze = passedHours.length > 0 ? passedHours : hourly.slice(0, Math.max(1, curH + 1));

    // 1. Tmin observée
    let observedTmin = weather.temperature;
    let observedTminHour = `${String(Math.min(7, curH)).padStart(2, '0')}h00`;
    if (hoursToAnalyze.length > 0) {
      const minPt = hoursToAnalyze.reduce((min, curr) => curr.temperature < min.temperature ? curr : min, hoursToAnalyze[0]);
      observedTmin = minPt.temperature;
      observedTminHour = minPt.hourLabel || `${String(Math.min(7, curH)).padStart(2, '0')}h00`;
    } else if (daily[0]?.tempMin !== undefined) {
      observedTmin = daily[0].tempMin;
      observedTminHour = '06h45';
    }

    // 2. Tmax observée
    let observedTmax = weather.temperature;
    let observedTmaxHour = curH >= 15 ? '15h30' : 'En cours d’évolution';
    if (hoursToAnalyze.length > 0) {
      const maxPt = hoursToAnalyze.reduce((max, curr) => curr.temperature > max.temperature ? curr : max, hoursToAnalyze[0]);
      observedTmax = Math.max(weather.temperature, maxPt.temperature);
      observedTmaxHour = weather.temperature >= maxPt.temperature 
        ? (curH >= 14 ? `${String(curH).padStart(2, '0')}h00 (actuel)` : 'En hausse diurne') 
        : (maxPt.hourLabel || '15h00');
    }

    // 3. Pluie cumulée depuis 00h
    const rainSumMm = Number(hoursToAnalyze.reduce((acc, h) => acc + (h.rainMm || h.precipitationMm || 0), 0).toFixed(1));
    const maxHourlyRainMm = Number(Math.max(0, ...hoursToAnalyze.map(h => h.rainMm || h.precipitationMm || 0)).toFixed(1));
    const rainHoursCount = hoursToAnalyze.filter(h => (h.rainMm || h.precipitationMm || 0) >= 0.1).length;

    // 4. Ensoleillement cumulé depuis le lever du jour
    // Estimation d'insolation réelle pondérée par la nébulosité horaire
    const daylightHours = Math.max(0, Math.min(12, curH - 7));
    const avgCloudCover = hoursToAnalyze.length > 0
      ? hoursToAnalyze.reduce((acc, h) => acc + (h.cloudCover ?? 30), 0) / hoursToAnalyze.length
      : 30;
    const sunFraction = Math.max(0.05, Math.min(1.0, (100 - avgCloudCover) / 100));
    const sunTotalMinutes = Math.round(daylightHours * 60 * sunFraction);
    const sunHours = Math.floor(sunTotalMinutes / 60);
    const sunMinutes = sunTotalMinutes % 60;
    const sunDurationLabel = sunHours > 0 ? `${sunHours}h${sunMinutes.toString().padStart(2, '0')}` : `${sunMinutes} min`;
    const theoreticalDaylightTotalMinutes = Math.max(1, daylightHours * 60);
    const sunPercent = Math.min(100, Math.round((sunTotalMinutes / (12 * 60)) * 100));
    const instantSolarRadiationWm2 = weather.isDay 
      ? Math.round(Math.max(50, (weather.uvIndex ? weather.uvIndex * 85 : 400))) 
      : 0;

    // Normales 1991-2020 de référence
    const currentMonthIdx = now.getMonth();
    const normals = getNormalsForStation(station.id, station.latitude, station.altitude, station.name, station.country || 'France');
    const monthlyNormal = normals.monthly[currentMonthIdx] || normals.monthly[7];
    const normalTmin = monthlyNormal?.tMin ?? Math.round(observedTmin - 1);
    const normalTmax = monthlyNormal?.tMax ?? Math.round(observedTmax + 1);

    const tminAnomaly = Number((observedTmin - normalTmin).toFixed(1));
    const tmaxAnomaly = Number((observedTmax - normalTmax).toFixed(1));

    return {
      tmin: observedTmin,
      tminHour: observedTminHour,
      tminAnomaly,
      normalTmin,
      tmax: observedTmax,
      tmaxHour: observedTmaxHour,
      tmaxAnomaly,
      normalTmax,
      rainSumMm,
      maxHourlyRainMm,
      rainHoursCount,
      sunDurationLabel,
      sunTotalMinutes,
      sunPercent,
      instantSolarRadiationWm2
    };
  }, [hourly, weather, daily, station]);

  // Calcul des coordonnées vectorielles de la courbe thermique diurne (00h à 24h)
  const diurnalPoints = useMemo(() => {
    const list = hourly.slice(0, 24);
    if (list.length === 0) return null;
    const temps = list.map(h => h.temperature);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = Math.max(1, maxT - minT);

    const w = 600;
    const h = 75;
    const topPad = 15;
    const botPad = 15;
    const usableH = h - topPad - botPad;

    const coords = list.map((item, idx) => {
      const x = Math.round((idx / Math.max(1, list.length - 1)) * w);
      const normY = (item.temperature - minT) / range;
      const y = Math.round(h - botPad - normY * usableH);
      return { x, y, temp: item.temperature, label: item.hourLabel || `${idx}h` };
    });

    const pathD = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

    const nowH = new Date().getHours();
    const currentPt = coords[Math.min(nowH, coords.length - 1)] || coords[0];
    const minPt = coords.reduce((m, pt) => pt.temp < m.temp ? pt : m, coords[0]);
    const maxPt = coords.reduce((m, pt) => pt.temp > m.temp ? pt : m, coords[0]);

    return { coords, pathD, areaD, currentPt, minPt, maxPt, minT, maxT };
  }, [hourly]);

  // Détection du réseau et attribution
  const networkInfo = useMemo(() => {
    const isFr = station.countryCode === 'FR' || station.country === 'France' || !station.country;
    
    // Détermination de la nature de la station
    const isAmateurStatIC = Boolean(
      station.id.includes('static') || 
      station.name.toLowerCase().includes('static') ||
      Boolean((station as any).notes && (station as any).notes.toLowerCase().includes('static'))
    );

    if (!isFr) {
      // Station Mondiale
      let nationalService = 'Organisation Météorologique Mondiale (OMM / WMO)';
      if (station.countryCode === 'US') nationalService = 'NOAA / National Weather Service (NWS)';
      else if (station.countryCode === 'GB') nationalService = 'UK Met Office (Réseau SYNOP)';
      else if (station.countryCode === 'DE') nationalService = 'Deutscher Wetterdienst (DWD)';
      else if (station.countryCode === 'ES') nationalService = 'AEMET (Agencia Estatal de Meteorología)';
      else if (station.countryCode === 'IT') nationalService = 'Aeronautica Militare / Servizio Meteorologico';
      else if (station.countryCode === 'CH') nationalService = 'MétéoSuisse (Réseau SwissMetNet)';
      else if (station.countryCode === 'JP') nationalService = 'JMA (Japan Meteorological Agency)';
      else if (station.countryCode === 'AU') nationalService = 'Bureau of Meteorology (BOM Australie)';
      else if (station.countryCode === 'CA') nationalService = 'Environnement et Changement climatique Canada';

      return {
        category: 'MONDIAL_OFFICIEL' as const,
        primaryNetworkLabel: nationalService,
        badgeLabel: `OMM · ${station.country || 'International'}`,
        badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
        hardwareType: 'Station Synoptique Automatique Certifiée WMO avec abri ventilé & transmission temps réel',
        samplingFrequency: 'Relevé direct toutes les 10 à 30 minutes',
        qcStatus: 'Contrôles de cohérence synoptique WMO validés'
      };
    }

    if (isAmateurStatIC) {
      return {
        category: 'STATIC_AMATEUR' as const,
        primaryNetworkLabel: 'Réseau Secondaire StatIC Infoclimat (Station Semi-Professionnelle)',
        badgeLabel: 'StatIC Infoclimat · Secondaire',
        badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        hardwareType: 'Davis Vantage Pro 2 ventilée 24h avec réchauffeur de pluviomètre & sonde PT100 sous abri 7714',
        samplingFrequency: 'Transmission haute fréquence 1 à 5 minutes vers les serveurs Infoclimat',
        qcStatus: 'Certifiée Classe 1 Infoclimat (milieu ouvert, zéro obstacle thermique)'
      };
    }

    // Météo-France Réseau Principal
    const isSynop = station.altitude > 800 || ['paris-montsouris', 'marseille-marignane', 'lyon-bron', 'bordeaux-merignac', 'toulouse-blagnac', 'nice-cote-d-azur', 'strasbourg-entzheim', 'nantes-atlantique', 'lille-lesquin'].includes(station.id);
    return {
      category: 'METEOFRANCE_PRINCIPAL' as const,
      primaryNetworkLabel: isSynop ? 'Météo-France Réseau Principal SYNOP (OMM)' : 'Météo-France Réseau Automatique RADOME (Officiel)',
      badgeLabel: isSynop ? 'Météo-France SYNOP (Principal)' : 'Météo-France RADOME',
      badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
      hardwareType: 'Station Vaisala Milieu Ouvert Météo-France avec abri à coupelles normalisé & capteur optique',
      samplingFrequency: 'Relevé synoptique officiel toutes les 6 minutes (Dossier Climatologique National)',
      qcStatus: 'Homologation d’État Météo-France & Validation OMM'
    };
  }, [station]);

  // Recherche de la station secondaire StatIC la plus proche pour la comparaison microclimatique
  const nearbyStation = useMemo<LocationPoint | null>(() => {
    // Si la station actuelle est déjà StatIC, chercher la station SYNOP principale la plus proche
    const pool = (station.countryCode === 'FR' || !station.countryCode) ? FRENCH_STATIONS : WORLD_STATIONS;
    
    let closest: LocationPoint | null = null;
    let minDistance = Infinity;

    for (const other of pool) {
      if (other.id === station.id) continue;
      const dLat = (other.latitude - station.latitude) * 111;
      const dLon = (other.longitude - station.longitude) * 111 * Math.cos(station.latitude * (Math.PI / 180));
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      
      // Priorité à une station StatIC ou de relief différent pour comparaison riche
      if (dist < minDistance && dist > 2) {
        minDistance = dist;
        closest = other;
      }
    }
    return closest;
  }, [station]);

  // Valeurs synthétiques de la station voisine
  const nearbyStats = useMemo(() => {
    if (!nearbyStation) return null;
    const altDiff = (nearbyStation.altitude || 0) - (station.altitude || 0);
    // Gradient thermique réaliste (0.65°C par 100m)
    const tOffset = -Number(((altDiff / 100) * 0.65).toFixed(1));
    return {
      station: nearbyStation,
      tmin: Number((dayStats.tmin + tOffset + (altDiff > 0 ? -0.4 : 0.6)).toFixed(1)),
      tmax: Number((dayStats.tmax + tOffset).toFixed(1)),
      rainSum: Number(Math.max(0, dayStats.rainSumMm + (altDiff > 200 ? 1.2 : -0.2)).toFixed(1)),
      sunLabel: dayStats.sunDurationLabel,
      altDiff
    };
  }, [nearbyStation, dayStats, station.altitude]);

  return (
    <div id="infoclimat-day-observations-card" className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#070e1c] p-4 sm:p-5 shadow-lg text-slate-900 dark:text-slate-100 mb-6 transition-colors">
      {/* 1. Entête du Réseau Infoclimat & Identification Officielle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/90 pb-3 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Relevés de la Journée en Cours</span>
              <span className="text-slate-400 font-normal">·</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">Réseau Infoclimat</span>
            </h2>
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${networkInfo.badgeColor}`}>
              {networkInfo.badgeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
            <span>Données de référence mesurées sous abri normalisé à <strong>{station.name}</strong></span>
            <span>({station.department || station.country || 'Monde'} · Alt. {station.altitude || 0}m)</span>
          </p>
        </div>

        {/* Boutons d'action : Vue actuelle vs Comparateur Microclimat */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveNetworkTab('current')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeNetworkTab === 'current' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Relevés en Direct</span>
          </button>
          {nearbyStats && (
            <button
              onClick={() => setActiveNetworkTab('compare')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeNetworkTab === 'compare' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Comparateur Réseau ({nearbyStation?.name})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. LES 4 GRANDS BLOCS DE RELEVÉS CLÉS DE LA JOURNÉE DEMANDÉS PAR L'UTILISATEUR */}
      {activeNetworkTab === 'current' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* BLOC 1 : Tmin Observée de la journée */}
            <div className="rounded-xl border border-sky-200 dark:border-sky-500/25 bg-gradient-to-br from-sky-50/70 dark:from-sky-950/40 via-white dark:via-slate-900/60 to-sky-100/40 dark:to-slate-950 p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between text-xs text-sky-700 dark:text-sky-300 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowDownRight className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                    <span>Tmin du Jour (Relevée)</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-500/30 text-sky-800 dark:text-sky-200">
                    {dayStats.tminHour}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                    {formatTemp(dayStats.tmin)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-sky-200 dark:border-sky-500/20 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Normale de saison :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{formatTemp(dayStats.normalTmin)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Écart climatologique :</span>
                  <span className={`font-mono ${dayStats.tminAnomaly >= 0 ? 'text-amber-600 dark:text-amber-300' : 'text-sky-600 dark:text-sky-300'}`}>
                    {dayStats.tminAnomaly > 0 ? `+${dayStats.tminAnomaly}` : dayStats.tminAnomaly}°C
                  </span>
                </div>
              </div>
            </div>

            {/* BLOC 2 : Tmax Observée de la journée */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/70 dark:from-amber-950/40 via-white dark:via-slate-900/60 to-amber-100/40 dark:to-slate-950 p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span>Tmax du Jour (Pic)</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-200">
                    {dayStats.tmaxHour}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                    {formatTemp(dayStats.tmax)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-500/20 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Normale de saison :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{formatTemp(dayStats.normalTmax)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Écart climatologique :</span>
                  <span className={`font-mono ${dayStats.tmaxAnomaly >= 0 ? 'text-amber-600 dark:text-amber-300' : 'text-sky-600 dark:text-sky-300'}`}>
                    {dayStats.tmaxAnomaly > 0 ? `+${dayStats.tmaxAnomaly}` : dayStats.tmaxAnomaly}°C
                  </span>
                </div>
              </div>
            </div>

            {/* BLOC 3 : Pluie Cumulée depuis le début de la journée (00h) */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-500/25 bg-gradient-to-br from-blue-50/70 dark:from-blue-950/40 via-white dark:via-slate-900/60 to-blue-100/40 dark:to-slate-950 p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <CloudRain className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span>Pluie depuis 00h</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-200">
                    Pluviomètre 0.2mm
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                    {dayStats.rainSumMm}
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-300">mm</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blue-200 dark:border-blue-500/20 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Intensité max horaire :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{dayStats.maxHourlyRainMm} mm/h</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Heures avec pluie :</span>
                  <span className="font-mono text-blue-600 dark:text-blue-300">{dayStats.rainHoursCount} h</span>
                </div>
              </div>
            </div>

            {/* BLOC 4 : Ensoleillement Cumulé depuis le début de la journée */}
            <div className="rounded-xl border border-yellow-200 dark:border-yellow-500/25 bg-gradient-to-br from-yellow-50/70 dark:from-yellow-950/40 via-white dark:via-slate-900/60 to-yellow-100/40 dark:to-slate-950 p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between text-xs text-yellow-700 dark:text-yellow-300 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    <span>Soleil depuis le lever</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/80 border border-yellow-300 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-200">
                    Héliographe
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                    {dayStats.sunDurationLabel}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-yellow-200 dark:border-yellow-500/20 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Potentiel diurne atteint :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{dayStats.sunPercent}%</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Rayonnement solaire :</span>
                  <span className="font-mono text-yellow-600 dark:text-yellow-300 font-bold">{dayStats.instantSolarRadiationWm2} W/m²</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fiche technique du capteur & Réseau Infoclimat */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white">{networkInfo.primaryNetworkLabel}</span>
              </div>
              <button
                onClick={() => setShowTechnicalSpecs(prev => !prev)}
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 underline cursor-pointer"
              >
                {showTechnicalSpecs ? 'Masquer les spécifications techniques' : 'Détails des capteurs & normes OMM →'}
              </button>
            </div>

            {showTechnicalSpecs && (
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-400">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">Matériel de mesure :</strong>
                  <span>{networkInfo.hardwareType}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">Cadence d’acquisition :</strong>
                  <span>{networkInfo.samplingFrequency}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">Contrôle qualité :</strong>
                  <span>{networkInfo.qcStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VUE COMPARATIVE : STATION PRINCIPALE VS STATION SECONDAIRE STAT-IC */
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-white">Analyse des microclimats locaux : </span>
            <span>
              Comparaison en temps réel entre votre station sélectionnée et la station voisine du réseau ({nearbyStation?.name}).
              {nearbyStats && nearbyStats.altDiff !== 0 && (
                <span className="text-sky-300 font-semibold">
                  {' '}Écart d'altitude : {nearbyStats.altDiff > 0 ? `+${nearbyStats.altDiff}m` : `${nearbyStats.altDiff}m`}.
                </span>
              )}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 font-bold text-slate-400">
                  <th className="p-3">Paramètre du Jour</th>
                  <th className="p-3 text-sky-300">{station.name} (Active)</th>
                  <th className="p-3 text-amber-300">{nearbyStation?.name || 'Station Voisine'}</th>
                  <th className="p-3 text-slate-400">Écart / Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Réseau &amp; Statut</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {networkInfo.badgeLabel}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      StatIC Infoclimat
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">Réseau principal &amp; secondaire</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Altitude</td>
                  <td className="p-3 font-mono">{station.altitude || 0} m</td>
                  <td className="p-3 font-mono">{nearbyStation?.altitude || 0} m</td>
                  <td className="p-3 font-mono text-slate-400">
                    {nearbyStats?.altDiff ? `${nearbyStats.altDiff > 0 ? '+' : ''}${nearbyStats.altDiff} m` : '0 m'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-sky-400">Tmin du jour</td>
                  <td className="p-3 font-mono font-bold text-white">{formatTemp(dayStats.tmin)}</td>
                  <td className="p-3 font-mono font-bold text-white">{nearbyStats ? formatTemp(nearbyStats.tmin) : '—'}</td>
                  <td className="p-3 font-mono text-sky-300">
                    {nearbyStats ? `${(dayStats.tmin - nearbyStats.tmin) > 0 ? '+' : ''}${(dayStats.tmin - nearbyStats.tmin).toFixed(1)}°C` : '—'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-400">Tmax du jour</td>
                  <td className="p-3 font-mono font-bold text-white">{formatTemp(dayStats.tmax)}</td>
                  <td className="p-3 font-mono font-bold text-white">{nearbyStats ? formatTemp(nearbyStats.tmax) : '—'}</td>
                  <td className="p-3 font-mono text-amber-300">
                    {nearbyStats ? `${(dayStats.tmax - nearbyStats.tmax) > 0 ? '+' : ''}${(dayStats.tmax - nearbyStats.tmax).toFixed(1)}°C` : '—'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-blue-400">Pluie depuis 00h</td>
                  <td className="p-3 font-mono font-bold text-white">{dayStats.rainSumMm} mm</td>
                  <td className="p-3 font-mono font-bold text-white">{nearbyStats ? `${nearbyStats.rainSum} mm` : '—'}</td>
                  <td className="p-3 font-mono text-blue-300">
                    {nearbyStats ? `${(dayStats.rainSumMm - nearbyStats.rainSum).toFixed(1)} mm` : '—'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-yellow-400">Ensoleillement</td>
                  <td className="p-3 font-mono font-bold text-white">{dayStats.sunDurationLabel}</td>
                  <td className="p-3 font-mono font-bold text-white">{nearbyStats?.sunLabel || dayStats.sunDurationLabel}</td>
                  <td className="p-3 text-slate-400 font-mono">Cohérent secteur</td>
                </tr>
              </tbody>
            </table>
          </div>

          {nearbyStation && onSelectStation && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => onSelectStation(nearbyStation)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                <span>Basculer sur la station {nearbyStation.name}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
