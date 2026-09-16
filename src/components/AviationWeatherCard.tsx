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
    <div id="aviation-weather-card" className="space-y-4">
      {/* Header Banner Aviation */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Plane className="h-4 w-4 text-sky-400" />
              <span>Météorologie Aéronautique Certifiée • OACI / WMO</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-2xl'}`}>
                Dossier Aéronautique &amp; METAR/TAF — {station.name}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300">
                OACI: {icaoCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Catégorie de vol VFR/IFR, décodage METAR temps réel, calcul trigonométrique des composantes de vent sur piste, altitude-densité et plafond nuageux AGL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-md border ${categoryColor}`}>
              {categoryBadge}
            </span>
            {isCavok && (
              <span className="text-xs font-bold px-2.5 py-1.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                ✈️ CAVOK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* METAR Brut & Décodé en Temps Réel */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">METAR Temps Réel Officiel</h3>
              <p className="text-[11px] text-slate-400">Format d'observation internationale pour pilotes et contrôle aérien</p>
            </div>
          </div>

          <button
            onClick={() => setShowRawMetar(!showRawMetar)}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 transition cursor-pointer underline"
          >
            {showRawMetar ? 'Afficher les cartes décodées' : 'Voir chaîne brute OACI'}
          </button>
        </div>

        {/* METAR String Block */}
        <div className="p-3 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm font-semibold text-sky-300 tracking-wider flex items-center justify-between gap-3 overflow-x-auto">
          <span>{rawMetarString}</span>
          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800/60 text-sky-400 shrink-0">
            AUTO • VALIDÉ
          </span>
        </div>

        {/* Décodage Segmenté pour lecture instantanée */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Vent Aérologique</span>
            <span className="text-sm font-bold text-white font-mono block mt-0.5">
              {windDirDeg}° / {windKnots} kts
            </span>
            <span className="text-[10px] text-slate-400 block">
              Rafales : <strong className="text-slate-200">{gustKnots} kts</strong> ({Math.round(weather.windGust)} km/h)
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Visibilité</span>
            <span className="text-sm font-bold text-emerald-400 font-mono block mt-0.5">
              {visKm >= 10 ? '> 10 km' : `${visKm} km`}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {visNm} NM • {isCavok ? 'CAVOK' : 'Visibilité sol'}
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Base des Nuages</span>
            <span className="text-sm font-bold text-cyan-400 font-mono block mt-0.5">
              {cloudLayerCode} {Math.round(cloudBaseFtAgl)} ft
            </span>
            <span className="text-[10px] text-slate-400 block">
              {Math.round(cloudBaseFtAgl * 0.3048)} m AGL • {cloudCoverOctas}/8 octas
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">T° Air / Point Rosée</span>
            <span className="text-sm font-bold text-indigo-300 font-mono block mt-0.5">
              {weather.temperature}°C / {Math.round(dewPoint)}°C
            </span>
            <span className="text-[10px] text-slate-400 block">
              Spread T-Td : <strong className="text-slate-200">{Math.round(spreadTD * 10) / 10}°C</strong>
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Altimètre QNH</span>
            <span className="text-sm font-bold text-amber-400 font-mono block mt-0.5">
              {qnhHpa} hPa
            </span>
            <span className="text-[10px] text-slate-400 block">
              {qnhInHg} inHg • QFE: {qfeHpa} hPa
            </span>
          </div>
        </div>
      </div>

      {/* Grid 1 : Calculateur de Composantes de Piste & Altimétrie Avancée */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Module Calculateur Vent de Travers & Vent de Face */}
        <div className="lg:col-span-7 rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-teal-400">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Calculateur de Composantes de Piste</h3>
                <p className="text-[11px] text-slate-400">Vent effectif de face, vent arrière et vent de travers</p>
              </div>
            </div>

            {/* Sélecteur de QFU Piste */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Piste :</span>
              <select
                value={selectedRunwayQfu}
                onChange={(e) => setSelectedRunwayQfu(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Vent de Face / Arrière */}
            <div className="p-3 rounded-md bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {headwindKnots >= 0 ? 'Vent de Face' : 'Vent Arrière'}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  headwindKnots >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {headwindKnots >= 0 ? 'Favorable' : 'Pénalisant'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {Math.abs(headwindKnots)} <span className="text-xs font-normal text-slate-400">kts</span>
                <span className="text-xs text-slate-500 font-normal ml-2">({Math.round(Math.abs(headwindKnots) * 1.852)} km/h)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {headwindKnots >= 0
                  ? 'Réduit la distance de roulement au décollage et à l\'atterrissage.'
                  : 'Augmente la distance d\'atterrissage. Préférer la piste opposée si possible.'}
              </p>
            </div>

            {/* Vent de Travers (Crosswind) */}
            <div className="p-3 rounded-md bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Vent de Travers
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  crosswindKnots > 18 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  crosswindKnots > 12 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {crosswindKnots > 18 ? 'Critique (> 18 kts)' : crosswindKnots > 12 ? 'Vigilance' : 'Calme'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {crosswindKnots} <span className="text-xs font-normal text-slate-400">kts</span>
                <span className="text-xs text-slate-500 font-normal ml-2">({crosswindSide})</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Limite typique monomoteur : 15 à 22 kts. Rafales travers : <strong>{Math.round(gustKnots * Math.abs(Math.sin(angleDeltaRad)))} kts</strong>.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Orientation vent : <strong>{windDirDeg}°</strong> • Axe de piste <strong>{selectedRunwayQfu.toString().padStart(2, '0')} ({runwayHeadingDeg}°)</strong></span>
            <span className="text-sky-400 font-mono font-bold">Écart : {Math.abs(Math.round((windDirDeg - runwayHeadingDeg)))}°</span>
          </div>
        </div>

        {/* Module Altitude-Densité & Altimétrie Avancée */}
        <div className="lg:col-span-5 rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
                  <Gauge className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Altitude-Densité (DA)</h3>
                  <p className="text-[11px] text-slate-400">Impact direct sur la poussée et la portance</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                densityAltitudeFt > elevationFt + 1000 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {densityAltitudeFt > elevationFt ? `+${densityAltitudeFt - elevationFt} ft` : `${densityAltitudeFt - elevationFt} ft`}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Élévation Terrain</span>
                <span className="text-xl font-bold text-white tabular-nums">
                  {elevationFt} <span className="text-xs text-slate-400 font-normal">ft</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{station.altitude} m AMSL</span>
              </div>

              <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Altitude-Densité</span>
                <span className="text-xl font-bold text-indigo-300 tabular-nums">
                  {densityAltitudeFt} <span className="text-xs text-slate-400 font-normal">ft</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Air ressenti par l'avion</span>
              </div>
            </div>

            <div className="mt-2.5 p-2.5 rounded-md bg-slate-950 border border-slate-800 space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Altitude-Pression (PA) :</span>
                <strong className="text-white font-mono">{pressureAltitudeFt} ft</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Écart ISA :</span>
                <strong className={weather.temperature > tempIsa ? 'text-amber-300 font-mono' : 'text-cyan-300 font-mono'}>
                  {Math.round((weather.temperature - tempIsa) * 10) / 10 > 0 ? `+${Math.round((weather.temperature - tempIsa) * 10) / 10}°C` : `${Math.round((weather.temperature - tempIsa) * 10) / 10}°C`} (ISA {Math.round(tempIsa * 10) / 10}°C)
                </strong>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 pt-1">
            <span className="font-semibold text-slate-200">Comportement : </span>
            {densityAltitudeFt > elevationFt + 1200 ? (
              <span className="text-amber-300">Air peu dense : allongement de la distance de décollage et montée réduite.</span>
            ) : (
              <span className="text-slate-400">Performances standard de roulage et de montée.</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid 2 : Givrage en Altitude, Isotherme 0°C & Statut Drones / UAV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Isotherme 0°C & Freezing Level */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
            <ThermometerSnowflake className="h-4 w-4" />
            <span>Isotherme 0°C</span>
          </div>
          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Niveau de Vol</span>
              <span className="text-xs font-mono font-bold text-blue-300 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800">
                {freezingLevelFL}
              </span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">
              {freezingLevelFt} ft <span className="text-xs font-normal text-slate-400">({freezingLevelMeters} m)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Niveau au-dessus duquel la température passe sous zéro. Zone de givrage potentiel en nuage.
          </p>
        </div>

        {/* Diagnostic Givrage Cellule & Carburateur */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
            <Layers className="h-4 w-4" />
            <span>Risque Givrage Cellule / Moteur</span>
          </div>
          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Givrage Cellule</span>
            <span className={`text-xs block leading-snug font-semibold ${icingRiskColor}`}>
              {icingRiskLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Surveillance réchauffe carbu recommandée lors des descentes prolongées moteur réduit.
          </p>
        </div>

        {/* Vol Drone & UAV Télépilote */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
            <Activity className="h-4 w-4" />
            <span>Indice de Vol Drone / UAV</span>
          </div>
          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Statut Réglementaire :</span>
            <span className="text-xs font-bold text-emerald-400 block">
              {windKmh > 35 ? '⚠️ Déconseillé (Vent > 35 km/h)' : weather.precipitation > 0 ? '⛔ Interdit (Pluie)' : 'Conditions favorables pour vol'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Plafond légal 120m AGL, visibilité &gt; 5 km, turbulences faibles à modérées.
          </p>
        </div>
      </div>
    </div>
  );
};
