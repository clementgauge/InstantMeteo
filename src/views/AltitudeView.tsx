import React, { useState } from 'react';
import { 
  Mountain, 
  ThermometerSnowflake, 
  TrendingDown, 
  Layers, 
  Sun, 
  Wind, 
  Gauge, 
  Activity, 
  Droplets, 
  Flame, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  Eye
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { AltitudeMeteorologyCard } from '../components/AltitudeMeteorologyCard';

interface AltitudeViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  seniorMode: boolean;
  tempUnit: 'C' | 'F';
}

export const AltitudeView: React.FC<AltitudeViewProps> = ({
  station,
  weather,
  seniorMode,
  tempUnit
}) => {
  const stationAlt = station.altitude ?? 150;
  const currentTemp = weather.temperature;
  const windSpeed = weather.windSpeed;
  const rain = weather.precipitation;
  const humidity = weather.humidity;
  const isNight = !weather.isDay;

  // Custom user interactive altitude slider state
  const [customAltitude, setCustomAltitude] = useState<number>(Math.max(0, Math.min(4000, stationAlt)));

  const altMetrics = weather.altitudeMetrics || {
    altitudeMeters: stationAlt,
    bioclimaticStage: 'Plaine / Littoral (< 300 m)',
    isotherm0Altitude: 2800,
    snowRainLimitAltitude: 2500,
    lapseRate: -0.65,
    qfePressure: weather.pressure,
    qnhPressure: weather.pressureMsl ?? 1016,
    uvElevationFactor: 1.0,
    uvSnowReflectanceIndex: 1.0,
    frostRiskLevel: 'AUCUN',
    dewPoint: 8.5,
    evapotranspirationEt0: 3.5,
    djuHeat: 0,
    djuCool: 0
  };

  const topo = weather.topographicAnalysis;

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9/5 + 32) * 10) / 10;
      return `${f > 0 ? `+${f}` : f}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  // Calculate physical metrics for any given altitude
  const computeAltitudeMetrics = (targetAlt: number) => {
    const altDiff = targetAlt - stationAlt;
    const isSaturated = humidity > 85 || rain > 0;
    const gradientPerMeter = isSaturated ? -0.0058 : -0.0075;
    
    // Inversion check
    const isValleyInversion = topo?.valleyInversion?.isActive && targetAlt < stationAlt;
    let temp = currentTemp;
    
    if (isValleyInversion && topo.valleyInversion.valleyBottomTemp !== undefined) {
      temp = topo.valleyInversion.valleyBottomTemp;
    } else {
      temp = Number((currentTemp + (altDiff * gradientPerMeter)).toFixed(1));
    }

    // Wind speed generally increases with altitude (+15% per 1000m)
    const altitudeWindFactor = 1 + (targetAlt / 1000) * 0.18;
    const simulatedWind = Math.round(windSpeed * altitudeWindFactor);

    // Windchill calculation
    const feels = Number((temp - (simulatedWind * 0.14 + (targetAlt / 1000) * 1.6)).toFixed(1));

    // Barometric pressure formula QFE (hPa)
    const pressureQfe = Math.round(1013.25 * Math.pow(1 - (0.0065 * targetAlt) / 288.15, 5.255));

    // Air density kg/m3 (approx)
    const airDensity = Number((1.225 * Math.pow(1 - 0.0065 * targetAlt / 288.15, 4.256)).toFixed(2));

    // UV Index elevation factor (+10% every 1000m)
    const simulatedUv = Math.round((weather.uvIndex || 3) * (1 + (targetAlt / 1000) * 0.12));

    // Precipitation state
    let precipState = 'Temps Sec';
    let precipBadge = 'bg-slate-800 text-slate-300 border-slate-700';
    if (rain > 0 || weather.weatherCode >= 50) {
      if (temp <= -1) {
        precipState = simulatedWind > 45 ? 'Blizzard / Neige soufflée' : 'Neige seule';
        precipBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      } else if (temp <= 1.8) {
        precipState = 'Pluie & Neige mêlées';
        precipBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      } else {
        precipState = 'Pluie liquide';
        precipBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      }
    }

    // Bioclimatic Stage for targetAlt
    let stage = "Étage de Plaine (< 300 m)";
    if (targetAlt >= 3000) stage = "Étage Nival / Hautes Cimes (> 3000 m)";
    else if (targetAlt >= 2400) stage = "Étage Alpin (2400 - 3000 m)";
    else if (targetAlt >= 1600) stage = "Étage Subalpin (1600 - 2400 m)";
    else if (targetAlt >= 800) stage = "Étage Montagnard (800 - 1600 m)";
    else if (targetAlt >= 300) stage = "Étage Collinéen (300 - 800 m)";

    // Temp color class
    let tempColorClass = 'text-cyan-300';
    let tempBgClass = 'from-cyan-950/40 to-blue-950/30';
    if (temp <= -5) {
      tempColorClass = 'text-indigo-300';
      tempBgClass = 'from-indigo-950/60 to-purple-950/40';
    } else if (temp <= 0) {
      tempColorClass = 'text-blue-300';
      tempBgClass = 'from-blue-950/60 to-cyan-950/40';
    } else if (temp > 25) {
      tempColorClass = 'text-red-400';
      tempBgClass = 'from-red-950/50 to-amber-950/30';
    } else if (temp > 18) {
      tempColorClass = 'text-amber-300';
      tempBgClass = 'from-amber-950/40 to-yellow-950/20';
    } else if (temp > 8) {
      tempColorClass = 'text-emerald-300';
      tempBgClass = 'from-emerald-950/40 to-teal-950/20';
    }

    return {
      altitude: targetAlt,
      temperature: temp,
      feelsLike: feels,
      windSpeed: simulatedWind,
      pressureQfe,
      airDensity,
      uvIndex: simulatedUv,
      precipState,
      precipBadge,
      stage,
      tempColorClass,
      tempBgClass,
      iso0Diff: targetAlt - altMetrics.isotherm0Altitude
    };
  };

  const customMetrics = computeAltitudeMetrics(customAltitude);

  // Granular Multi-Tier Slices from 0m to 4000m (13 tiers)
  const fullAltitudeSlices = [
    { alt: 0, label: 'Niveau de la Mer (0 m)', icon: '🌊' },
    { alt: 250, label: 'Plaine & Basses Vallées (250 m)', icon: '🌾' },
    { alt: 500, label: 'Collines & Piémonts (500 m)', icon: '🍇' },
    { alt: 750, label: 'Moyenne Montagne Basse (750 m)', icon: '🌲' },
    { alt: 1000, label: 'Étage Montagnard 1 (1 000 m)', icon: '🏡' },
    { alt: 1250, label: 'Moyenne Montagne Haute (1 250 m)', icon: '🚠' },
    { alt: 1500, label: 'Front de Forêt & Stations (1 500 m)', icon: '⛷️' },
    { alt: 1800, label: 'Étage Subalpin (1 800 m)', icon: '🏔️' },
    { alt: 2000, label: 'Limite des Arbres / Alpages (2 000 m)', icon: '🌿' },
    { alt: 2500, label: 'Cols Alpins & Roches (2 500 m)', icon: '🦅' },
    { alt: 3000, label: 'Haute Montagne & Glaciers (3 000 m)', icon: '❄️' },
    { alt: 3500, label: 'Dômes Glaciaires (3 500 m)', icon: '🧊' },
    { alt: 4000, label: 'Hauts Sommets (4 000 m)', icon: '⭐' }
  ].map((tier) => ({
    ...tier,
    metrics: computeAltitudeMetrics(tier.alt)
  }));

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner: Altitude Observatory */}
      <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/50 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/40 bg-indigo-950/60 text-indigo-300 shadow-inner">
              <Mountain className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
                  Profil Thermique & Observatoire d'Altitude
                </h2>
                <span className="rounded-xl border border-indigo-500/40 bg-indigo-900/40 px-3 py-0.5 text-xs font-black text-indigo-300">
                  0 à 4 000 m
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Visualisez la déclinaison exacte de la température, du vent, du ressenti et de la pression à chaque palier altimétrique pour <strong>{station.name}</strong> (Altitude station : {stationAlt} m).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/40 px-4 py-2 text-left">
              <span className="text-[11px] font-bold uppercase text-cyan-300">Isotherme 0°C</span>
              <div className="text-xl font-black text-white">
                {altMetrics.isotherm0Altitude.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-300">m</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 px-4 py-2 text-left">
              <span className="text-[11px] font-bold uppercase text-blue-300">Limite Pluie/Neige</span>
              <div className="text-xl font-black text-white">
                {altMetrics.snowRainLimitAltitude.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-300">m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Custom Altitude Explorer (Slider from 0 to 4000m) */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`font-black text-white ${seniorMode ? 'text-xl' : 'text-lg'}`}>
                Simulateur Altimétrique Interactif au Mètre Près
              </h3>
              <p className="text-xs text-slate-400">
                Glissez le curseur pour simuler instantanément les conditions à l'altitude de votre choix (sommet, col, station, randonnée).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCustomAltitude(stationAlt)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Altitude Station ({stationAlt} m)
            </button>
            <button
              onClick={() => setCustomAltitude(altMetrics.isotherm0Altitude)}
              className="rounded-xl border border-cyan-800 bg-cyan-950/60 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900 transition"
            >
              Isotherme 0°C ({altMetrics.isotherm0Altitude} m)
            </button>
          </div>
        </div>

        {/* Altitude Range Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span>0 m (Plaine)</span>
            <span className="text-base sm:text-lg font-black text-cyan-400 bg-cyan-950/80 px-4 py-1 rounded-xl border border-cyan-800 shadow-inner">
              Altitude simulée : {customAltitude.toLocaleString('fr-FR')} mètres
            </span>
            <span>4 000 m (Haute Cime)</span>
          </div>

          <input
            type="range"
            min="0"
            max="4000"
            step="25"
            value={customAltitude}
            onChange={(e) => setCustomAltitude(Number(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          />

          {/* Quick preset altitude badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[0, 300, 600, 1000, 1500, 2000, 2500, 3000, 3800].map((presetAlt) => (
              <button
                key={presetAlt}
                onClick={() => setCustomAltitude(presetAlt)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  customAltitude === presetAlt
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {presetAlt} m
              </button>
            ))}
          </div>
        </div>

        {/* Computed Live Simulation Output Cards */}
        <div className={`rounded-2xl border border-slate-800 bg-gradient-to-r ${customMetrics.tempBgClass} p-5 shadow-inner`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {/* Température */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
              <span className="text-[11px] font-bold uppercase text-slate-400">Température</span>
              <div className={`text-2xl sm:text-3xl font-black mt-1 ${customMetrics.tempColorClass}`}>
                {formatTemp(customMetrics.temperature)}
              </div>
              <span className="text-[10px] text-slate-400">Sous abri</span>
            </div>

            {/* Ressenti Windchill */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
              <span className="text-[11px] font-bold uppercase text-slate-400">Ressenti (Windchill)</span>
              <div className="text-2xl sm:text-3xl font-black text-cyan-200 mt-1">
                {formatTemp(customMetrics.feelsLike)}
              </div>
              <span className="text-[10px] text-slate-400">Effet éolien</span>
            </div>

            {/* Vent Estimé */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
              <span className="text-[11px] font-bold uppercase text-slate-400">Vent Estimé</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {customMetrics.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
              </div>
              <span className="text-[10px] text-slate-400">+18%/1000m</span>
            </div>

            {/* Pression QFE */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
              <span className="text-[11px] font-bold uppercase text-slate-400">Pression QFE</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">
                {customMetrics.pressureQfe} <span className="text-xs font-normal text-slate-400">hPa</span>
              </div>
              <span className="text-[10px] text-slate-400">Densité : {customMetrics.airDensity} kg/m³</span>
            </div>

            {/* Indice UV */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
              <span className="text-[11px] font-bold uppercase text-slate-400">Indice UV</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                UV {customMetrics.uvIndex}
              </div>
              <span className="text-[10px] text-slate-400">+12%/1000m</span>
            </div>

            {/* Précipitations */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-400">État Précipitations</span>
              <div className="mt-1">
                <span className={`inline-block rounded-lg px-2 py-1 text-xs font-black border ${customMetrics.precipBadge}`}>
                  {customMetrics.precipState}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                {customAltitude >= altMetrics.isotherm0Altitude
                  ? `+${customAltitude - altMetrics.isotherm0Altitude} m au-dessus du 0°C`
                  : `${altMetrics.isotherm0Altitude - customAltitude} m sous l'isotherme 0°C`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Altitude Multi-Tier Table (0m to 4000m) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`font-black text-white ${seniorMode ? 'text-xl' : 'text-lg'}`}>
                Tableau Exhaustif des Températures par Paliers d'Altitude (0 - 4 000 m)
              </h3>
              <p className="text-xs text-slate-400">
                Paliers réguliers de 250m à 500m avec étagement bioclimatique et écarts à l'isotherme zéro degré.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-bold bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            Gradient moyen : <strong className="text-cyan-300">-0,65°C / 100m</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 font-bold">Étage & Altitude</th>
                <th className="py-3 px-3 font-bold">Température Réelle</th>
                <th className="py-3 px-3 font-bold">Ressenti Éolien</th>
                <th className="py-3 px-3 font-bold">Vent Estimé</th>
                <th className="py-3 px-3 font-bold">Pression Barométrique</th>
                <th className="py-3 px-3 font-bold">Phase Précipitations</th>
                <th className="py-3 px-3 font-bold">Position / 0°C</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {fullAltitudeSlices.map((tier) => {
                const isCurrentStationTier = Math.abs(tier.alt - stationAlt) < 150;
                const m = tier.metrics;
                return (
                  <tr 
                    key={tier.alt} 
                    className={`transition ${
                      isCurrentStationTier 
                        ? 'bg-blue-950/50 font-bold text-white ring-1 ring-blue-500/40' 
                        : 'hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tier.icon}</span>
                        <div>
                          <div className="font-black text-white flex items-center gap-1.5">
                            <span>{tier.alt} m</span>
                            {isCurrentStationTier && (
                              <span className="rounded bg-blue-600 px-1.5 py-0.2 text-[10px] text-white">
                                Votre Station
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{tier.label}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-base font-black ${m.tempColorClass}`}>
                        {formatTemp(m.temperature)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-bold">
                      {formatTemp(m.feelsLike)}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {m.windSpeed} km/h
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {m.pressureQfe} hPa
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block rounded-lg px-2 py-0.5 text-xs font-bold border ${m.precipBadge}`}>
                        {m.precipState}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {tier.alt >= altMetrics.isotherm0Altitude ? (
                        <span className="text-xs font-bold text-blue-300">
                          +{tier.alt - altMetrics.isotherm0Altitude} m (Gel continu)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400">
                          {altMetrics.isotherm0Altitude - tier.alt} m sous l'isotherme (Hors gel)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Complete Microclimate, Inversions & Mountain Physics Card */}
      <AltitudeMeteorologyCard
        weather={weather}
        station={station}
        seniorMode={seniorMode}
      />
    </div>
  );
};
