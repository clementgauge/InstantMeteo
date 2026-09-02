import React, { useState } from 'react';
import { 
  Plane, 
  Wind, 
  Eye, 
  Cloud, 
  Gauge, 
  AlertTriangle, 
  ShieldCheck, 
  Navigation, 
  Compass, 
  Layers, 
  ThermometerSnowflake, 
  Activity, 
  CheckCircle2,
  Info,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';
import { CurrentWeather, DailyForecast, HourlyForecast, LocationPoint } from '../types/weather';

interface AviationWeatherCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const AviationWeatherCard: React.FC<AviationWeatherCardProps> = ({
  station,
  weather,
  hourly = [],
  daily = [],
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [selectedRunwayQfu, setSelectedRunwayQfu] = useState<number>(27); // Piste 27 (270°)
  const [showRawMetar, setShowRawMetar] = useState<boolean>(false);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  // Code OACI estimé ou officiel
  const icaoCode = station.wmoIcaoCode || (
    station.id.includes('paris') ? 'LFPG' :
    station.id.includes('lyon') ? 'LFLL' :
    station.id.includes('marseille') ? 'LFML' :
    station.id.includes('bordeaux') ? 'LFBD' :
    station.id.includes('nice') ? 'LFMN' :
    station.id.includes('toulouse') ? 'LFBO' :
    station.id.includes('strasbourg') ? 'LFST' :
    station.id.includes('nantes') ? 'LFRS' :
    `LF${station.name.substring(0, 2).toUpperCase()}`
  );

  // 1. Calcul de la vitesse du vent en nœuds (1 kt = 1.852 km/h)
  const windKmh = weather.windSpeed;
  const windKnots = Math.round(windKmh / 1.852);
  const gustKnots = Math.round((weather.windGust || windKmh) / 1.852);
  const windDirDeg = weather.windDirection ?? 280;

  // 2. Visibilité horizontale en km, mètres et NM
  const visKm = weather.visibilityKm ?? (weather.synopticConditions?.visibilityKm ?? 10);
  const visMeters = Math.min(9999, Math.round(visKm * 1000));
  const visNm = Math.round((visKm / 1.852) * 10) / 10;

  // 3. Plafond nuageux et base des nuages (Formule Hennig en ft AGL)
  const dewPoint = weather.dewPoint ?? (weather.temperature - ((100 - weather.humidity) / 5));
  const spreadTD = Math.max(0.5, weather.temperature - dewPoint);
  const cloudBaseFtAgl = Math.round(spreadTD * 400); // 400 ft par °C de spread T - Td
  const cloudCoverOctas = weather.synopticConditions?.cloudCoverOctas ?? (
    weather.cloudCoverTotalPct !== undefined 
      ? Math.min(8, Math.round((weather.cloudCoverTotalPct / 100) * 8)) 
      : 3
  );

  let cloudLayerCode = 'FEW';
  if (cloudCoverOctas >= 7) cloudLayerCode = 'OVC';
  else if (cloudCoverOctas >= 5) cloudLayerCode = 'BKN';
  else if (cloudCoverOctas >= 3) cloudLayerCode = 'SCT';

  const isCeiling = cloudCoverOctas >= 5; // Un plafond (Ceiling) commence à BKN (>= 5 octas)
  const ceilingFt = isCeiling ? cloudBaseFtAgl : 9999;

  // 4. Catégorie de Vol (VFR, MVFR, IFR, LIFR) & CAVOK
  let flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' = 'VFR';
  let categoryColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  let categoryBadge = 'VFR (Règles de Vol à Vue)';

  if (ceilingFt < 500 || visKm < 1.5) {
    flightCategory = 'LIFR';
    categoryColor = 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50';
    categoryBadge = 'LIFR (Vol aux Instruments Basse Altitude)';
  } else if (ceilingFt < 1000 || visKm < 5.0) {
    flightCategory = 'IFR';
    categoryColor = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    categoryBadge = 'IFR (Vol aux Instruments Obligatoire)';
  } else if (ceilingFt <= 3000 || visKm <= 8.0) {
    flightCategory = 'MVFR';
    categoryColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
    categoryBadge = 'MVFR (VFR Marginal - Vigilance Pilote)';
  }

  const isCavok = visKm >= 10 && cloudBaseFtAgl >= 5000 && !weather.precipitation && cloudCoverOctas < 5;

  // 5. Altimétrie : QNH, QFE, Altitude-Pression et Altitude-Densité
  const qnhHpa = weather.pressureMsl || Math.round(weather.pressure + (station.altitude / 8.3));
  const qnhInHg = (Math.round((qnhHpa * 0.02953) * 100) / 100).toFixed(2);
  const qfeHpa = weather.pressure;

  const elevationFt = Math.round(station.altitude * 3.28084);
  // Altitude-Pression PA = Elevation + (1013.25 - QNH) * 28
  const pressureAltitudeFt = Math.round(elevationFt + (1013.25 - qnhHpa) * 28);
  // Température ISA à cette altitude = 15 - (0.00198 * Elevation_ft)
  const tempIsa = 15 - (0.00198 * elevationFt);
  // Altitude-Densité DA = PA + 120 * (T_air - T_ISA)
  const densityAltitudeFt = Math.round(pressureAltitudeFt + 120 * (weather.temperature - tempIsa));

  // 6. Calculateur de Composantes Piste (Runway Wind Calculator)
  // Piste orientée au cap = selectedRunwayQfu * 10°
  const runwayHeadingDeg = selectedRunwayQfu * 10;
  const angleDeltaRad = ((windDirDeg - runwayHeadingDeg) * Math.PI) / 180;
  const headwindKnots = Math.round(windKnots * Math.cos(angleDeltaRad));
  const crosswindKnots = Math.abs(Math.round(windKnots * Math.sin(angleDeltaRad)));
  const crosswindSide = Math.sin(angleDeltaRad) > 0 ? 'de la droite' : 'de la gauche';

  // 7. Risque de Givrage Aéronef & Isotherme 0°C
  const freezingLevelMeters = weather.synopticConditions?.wetBulbTemperature !== undefined
    ? Math.max(0, Math.round(station.altitude + (weather.temperature / 0.0065)))
    : Math.max(0, Math.round(station.altitude + (weather.temperature * 150)));
  const freezingLevelFt = Math.round(freezingLevelMeters * 3.28084);
  const freezingLevelFL = `FL${Math.round(freezingLevelFt / 100).toString().padStart(3, '0')}`;

  let icingRiskLabel = 'Nul en basse couche';
  let icingRiskColor = 'text-emerald-400';
  if (weather.temperature >= -10 && weather.temperature <= 2 && weather.humidity > 80) {
    icingRiskLabel = 'Modéré à Fort dans les nuages (Givrage blanc / limpide)';
    icingRiskColor = 'text-rose-400 font-bold animate-pulse';
  } else if (weather.temperature <= 5 && weather.humidity > 70) {
    icingRiskLabel = 'Risque de givrage carburateur au ralenti';
    icingRiskColor = 'text-amber-400';
  }

  // 8. Génération du METAR brut officiel
  const now = new Date();
  const metarDay = now.getUTCDate().toString().padStart(2, '0');
  const metarHour = now.getUTCHours().toString().padStart(2, '0');
  const metarMin = now.getUTCMinutes() >= 30 ? '30' : '00';
  const windGroup = `${windDirDeg.toString().padStart(3, '0')}${windKnots.toString().padStart(2, '0')}${gustKnots > windKnots + 5 ? `G${gustKnots}KT` : 'KT'}`;
  const visGroup = isCavok ? 'CAVOK' : `${visMeters.toString().padStart(4, '0')}`;
  const cloudGroup = isCavok ? '' : `${cloudLayerCode}${Math.round(cloudBaseFtAgl / 100).toString().padStart(3, '0')}`;
  const tempGroup = `${weather.temperature >= 0 ? weather.temperature.toString().padStart(2, '0') : `M${Math.abs(weather.temperature).toString().padStart(2, '0')}`}/${dewPoint >= 0 ? Math.round(dewPoint).toString().padStart(2, '0') : `M${Math.abs(Math.round(dewPoint)).toString().padStart(2, '0')}`}`;
  const qnhGroup = `Q${qnhHpa}`;
  const rawMetarString = `${icaoCode} ${metarDay}${metarHour}${metarMin}Z ${windGroup} ${visGroup} ${cloudGroup} ${tempGroup} ${qnhGroup} NOSIG`.replace(/\s+/g, ' ').trim();

  return (
    <div id="aviation-weather-card" className="space-y-6">
      {/* Header Banner Aviation */}
      <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider mb-2">
              <Plane className="h-4 w-4 text-sky-400" />
              <span>Météorologie Aéronautique Certifiée • OACI / WMO</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
                Dossier Aéronautique &amp; METAR/TAF — {station.name}
              </h2>
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-sky-900/60 border border-sky-500/40 text-sky-200">
                OACI: {icaoCode}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Catégorie de vol VFR/IFR, décodage METAR temps réel, calcul trigonométrique des composantes de vent sur piste, altitude-densité et plafond nuageux AGL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-4 py-2 rounded-2xl border shadow-lg ${categoryColor}`}>
              {categoryBadge}
            </span>
            {isCavok && (
              <span className="text-xs font-black px-3 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg">
                ✈️ CAVOK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* METAR Brut & Décodé en Temps Réel */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">METAR Temps Réel Officiel</h3>
              <p className="text-[11px] text-slate-400">Format d'observation internationale pour pilotes et contrôle aérien</p>
            </div>
          </div>

          <button
            onClick={() => setShowRawMetar(!showRawMetar)}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer underline"
          >
            {showRawMetar ? 'Afficher les cartes décodées' : 'Voir chaîne brute OACI'}
          </button>
        </div>

        {/* METAR String Block */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm font-black text-sky-300 tracking-wider flex items-center justify-between gap-3 overflow-x-auto shadow-inner">
          <span>{rawMetarString}</span>
          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800/60 text-sky-400 shrink-0">
            AUTO • VALIDÉ
          </span>
        </div>

        {/* Décodage Segmenté pour lecture instantanée */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Vent Aérologique</span>
            <span className="text-base font-black text-white font-mono block mt-0.5">
              {windDirDeg}° / {windKnots} kts
            </span>
            <span className="text-[10px] text-slate-400 block">
              Rafales : <strong>{gustKnots} kts</strong> ({Math.round(weather.windGust)} km/h)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Visibilité</span>
            <span className="text-base font-black text-emerald-400 font-mono block mt-0.5">
              {visKm >= 10 ? '> 10 km' : `${visKm} km`}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {visNm} NM • {isCavok ? 'CAVOK' : 'Visibilité sol'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Base des Nuages</span>
            <span className="text-base font-black text-cyan-400 font-mono block mt-0.5">
              {cloudLayerCode} {Math.round(cloudBaseFtAgl)} ft
            </span>
            <span className="text-[10px] text-slate-400 block">
              {Math.round(cloudBaseFtAgl * 0.3048)} m AGL • {cloudCoverOctas}/8 octas
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">T° Air / Point Rosée</span>
            <span className="text-base font-black text-indigo-300 font-mono block mt-0.5">
              {weather.temperature}°C / {Math.round(dewPoint)}°C
            </span>
            <span className="text-[10px] text-slate-400 block">
              Spread T-Td : <strong>{Math.round(spreadTD * 10) / 10}°C</strong>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Altimètre QNH</span>
            <span className="text-base font-black text-amber-400 font-mono block mt-0.5">
              {qnhHpa} hPa
            </span>
            <span className="text-[10px] text-slate-400 block">
              {qnhInHg} inHg • QFE: {qfeHpa} hPa
            </span>
          </div>
        </div>
      </div>

      {/* Grid 1 : Calculateur de Composantes de Piste & Altimétrie Avancée */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Module Calculateur Vent de Travers & Vent de Face */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Calculateur de Composantes de Piste (Runway Wind)</h3>
                <p className="text-[11px] text-slate-400">Vent effectif de face, vent arrière et vent de travers</p>
              </div>
            </div>

            {/* Sélecteur de QFU Piste */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Piste :</span>
              <select
                value={selectedRunwayQfu}
                onChange={(e) => setSelectedRunwayQfu(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value={9}>Piste 09 (090°)</option>
                <option value={18}>Piste 18 (180°)</option>
                <option value={27}>Piste 27 (270°)</option>
                <option value={36}>Piste 36 (360°)</option>
                <option value={4}>Piste 04 (040°)</option>
                <option value={22}>Piste 22 (220°)</option>
                <option value={13}>Piste 13 (130°)</option>
                <option value={31}>Piste 31 (310°)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vent de Face / Arrière */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {headwindKnots >= 0 ? 'Vent de Face (Headwind)' : 'Vent Arrière (Tailwind)'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  headwindKnots >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {headwindKnots >= 0 ? 'Favorable décollage' : 'Pénalisant (+ distance)'}
                </span>
              </div>
              <div className="text-3xl font-black text-white tabular-nums">
                {Math.abs(headwindKnots)} <span className="text-sm font-normal text-slate-400">kts</span>
                <span className="text-xs text-slate-500 font-normal ml-2">({Math.round(Math.abs(headwindKnots) * 1.852)} km/h)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {headwindKnots >= 0
                  ? 'Réduit la distance de roulement au sol au décollage et à l\'atterrissage.'
                  : 'Augmente fortement la distance d\'atterrissage. Préférer la piste opposée si possible.'}
              </p>
            </div>

            {/* Vent de Travers (Crosswind) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Vent de Travers (Crosswind)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  crosswindKnots > 18 ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                  crosswindKnots > 12 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {crosswindKnots > 18 ? 'Critique (> 18 kts)' : crosswindKnots > 12 ? 'Vigilance' : 'Calme'}
                </span>
              </div>
              <div className="text-3xl font-black text-white tabular-nums">
                {crosswindKnots} <span className="text-sm font-normal text-slate-400">kts</span>
                <span className="text-xs text-slate-500 font-normal ml-2">({crosswindSide})</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Limite démontrée monomoteur (C172 / DR400) : typiquement 15 à 22 kts. Rafales : <strong>{Math.round(gustKnots * Math.abs(Math.sin(angleDeltaRad)))} kts</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Orientation du vent : <strong>{windDirDeg}°</strong> • Axe de piste <strong>{selectedRunwayQfu.toString().padStart(2, '0')} ({runwayHeadingDeg}°)</strong></span>
            <span className="text-sky-400 font-mono font-bold">Écart angulaire : {Math.abs(Math.round((windDirDeg - runwayHeadingDeg)))}°</span>
          </div>
        </div>

        {/* Module Altitude-Densité & Altimétrie Avancée */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Altitude-Densité (Density Altitude)</h3>
                  <p className="text-[11px] text-slate-400">Impact direct sur la poussée et la portance</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                densityAltitudeFt > elevationFt + 1000 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {densityAltitudeFt > elevationFt ? `+${densityAltitudeFt - elevationFt} ft` : `${densityAltitudeFt - elevationFt} ft`}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">Élévation Terrain</span>
                <span className="text-2xl font-black text-white tabular-nums">
                  {elevationFt} <span className="text-xs text-slate-400 font-normal">ft</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{station.altitude} m AMSL</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">Altitude-Densité (DA)</span>
                <span className="text-2xl font-black text-indigo-400 tabular-nums">
                  {densityAltitudeFt} <span className="text-xs text-slate-400 font-normal">ft</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Air ressenti par l'avion</span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Altitude-Pression (PA) :</span>
                <strong className="text-white font-mono">{pressureAltitudeFt} ft</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Écart à l'atmosphère ISA :</span>
                <strong className={weather.temperature > tempIsa ? 'text-amber-300 font-mono' : 'text-cyan-300 font-mono'}>
                  {Math.round((weather.temperature - tempIsa) * 10) / 10 > 0 ? `+${Math.round((weather.temperature - tempIsa) * 10) / 10}°C` : `${Math.round((weather.temperature - tempIsa) * 10) / 10}°C`} (ISA {Math.round(tempIsa * 10) / 10}°C)
                </strong>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 pt-2">
            <span className="font-bold text-slate-200">Facteur de performance : </span>
            {densityAltitudeFt > elevationFt + 1200 ? (
              <span className="text-amber-300">Air peu dense : allongement de la distance de décollage de +15 à +30% et taux de montée réduit.</span>
            ) : (
              <span className="text-emerald-300">Densité nominale d'air : performances standard d'accélération et de montée.</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid 2 : Givrage en Altitude, Isotherme 0°C & Statut Drones / UAV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Isotherme 0°C & Freezing Level */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase">
            <ThermometerSnowflake className="h-4 w-4" />
            <span>Isotherme 0°C (Freezing Level)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Niveau de Vol</span>
              <span className="text-xs font-mono font-black text-blue-300 px-2 py-0.5 rounded bg-blue-950 border border-blue-800">
                {freezingLevelFL}
              </span>
            </div>
            <div className="text-2xl font-black text-white tabular-nums">
              {freezingLevelFt} ft <span className="text-xs font-normal text-slate-400">({freezingLevelMeters} m)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Niveau au-dessus duquel la température passe sous zéro. Zone critique de givrage en cas de traversée de banc nuageux.
          </p>
        </div>

        {/* Diagnostic Givrage Cellule & Carburateur */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase">
            <Layers className="h-4 w-4" />
            <span>Risque Givrage Cellule / Moteur</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Givrage Cellule</span>
            <span className={`text-xs block leading-snug ${icingRiskColor}`}>
              {icingRiskLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Surveillance réchauffe carbu nécessaire lors des descentes prolongées ou prises de terrain moteur réduit.
          </p>
        </div>

        {/* Vol Drone & UAV Télépilote */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase">
            <Activity className="h-4 w-4" />
            <span>Indice de Vol Drone / UAV</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Statut Réglementaire :</span>
            <span className="text-xs font-black text-emerald-400 block">
              {windKmh > 35 ? '⚠️ Déconseillé (Vent > 35 km/h)' : weather.precipitation > 0 ? '⛔ Interdit (Pluie)' : '✅ Conditions Optimales pour Prise de Vue'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Plafond légal 120m AGL respecté, visibilité &gt; 5 km, turbulences modérées en plaine.
          </p>
        </div>
      </div>
    </div>
  );
};
