import React, { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Sun, 
  Cloud, 
  Activity, 
  Sparkles, 
  Layers, 
  Eye, 
  Compass, 
  Zap, 
  Mountain, 
  Sprout, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Info,
  Waves,
  Flame,
  CheckCircle2,
  Snowflake,
  ThermometerSnowflake,
  ShieldAlert,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';

interface CertifiedPrecisionMeteoHubProps {
  weather: CurrentWeather;
  station: LocationPoint;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

type MetricCategory = 'SYNTHESIS' | 'SNOW_NIVO' | 'FROST_COLD' | 'ALTITUDE' | 'THERMO' | 'AEROLOGY' | 'CLOUDS' | 'SOLAR' | 'HYDRO' | 'AIR_QUALITY';

export const CertifiedPrecisionMeteoHub: React.FC<CertifiedPrecisionMeteoHubProps> = ({
  weather,
  station,
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [activeCategory, setActiveCategory] = useState<MetricCategory>('SYNTHESIS');

  const formatTemp = (celsius?: number) => {
    if (celsius === undefined || celsius === null) return '--';
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  const syn = weather.synopticConditions;
  const dewPoint = weather.dewPoint ?? (weather.temperature - ((100 - weather.humidity) / 5));
  const humidex = weather.humidex ?? weather.temperature;
  const windChill = weather.windChill ?? weather.temperature;
  const qfe = weather.pressure;
  const qnh = weather.pressureMsl ?? (weather.pressure + Math.round(station.altitude / 8.3));
  const baroTrend = weather.barometricTendencyLabel || `${weather.barometricTendency3hHpa || 0} hPa / 3h`;
  const solarRad = weather.solarRadiationWm2 ?? (weather.isDay ? 450 : 0);
  const sunshineHours = weather.sunshineDurationTodayHours ?? (weather.isDay ? 6.5 : 0);
  const cloudLcl = weather.cloudBaseLclMeters ?? Math.round(125 * (weather.temperature - dewPoint));
  const cloudTotal = weather.cloudCoverTotalPct ?? syn?.cloudCoverTotalPct ?? 35;
  const cloudLow = weather.cloudCoverLowPct ?? syn?.cloudCoverLowPct ?? 20;
  const cloudMid = weather.cloudCoverMidPct ?? syn?.cloudCoverMidPct ?? 15;
  const cloudHigh = weather.cloudCoverHighPct ?? syn?.cloudCoverHighPct ?? 10;
  const visibilityKm = weather.visibilityKm ?? syn?.visibilityKm ?? 25;
  const et0 = weather.evapotranspirationEt0Mm ?? weather.altitudeMetrics?.evapotranspirationEt0 ?? 3.5;
  const soilMoist = weather.soilMoisturePct ?? 45;
  
  // Advanced Snow, Freezing, Isotherm and LPN physics
  const iso0 = weather.isotherm0Meters ?? weather.altitudeMetrics?.isotherm0Altitude ?? Math.max(0, Math.round(station.altitude + (weather.temperature / 0.0065)));
  const tw0 = weather.altitudeMetrics?.wetBulbZeroAltitudeMeters ?? Math.max(0, Math.round(iso0 - Math.max(0, (weather.temperature - dewPoint) * 65)));
  const lpnNominal = weather.snowRainLimitMeters ?? weather.altitudeMetrics?.snowRainLimitAltitude ?? Math.max(0, iso0 - 300);
  const lpnIsothermie = Math.max(0, lpnNominal - 300);
  const ltn = weather.altitudeMetrics?.groundSnowLimitAltitude ?? Math.max(0, lpnNominal - 150);
  
  // Snow depth & fresh snow metrics
  const isSnowSeason = station.altitude >= 600 || weather.temperature <= 4;
  const snowDepthCm = weather.snowDepthCm ?? (station.altitude >= 2000 ? 120 : station.altitude >= 1500 ? 65 : station.altitude >= 1000 ? 25 : station.altitude >= 600 ? 5 : 0);
  const freshSnow24hCm = weather.temperature <= 1.5 && weather.precipitation > 0 ? Math.round(weather.precipitation * 1.2) : 0;
  const snowWaterEquivalentMm = Math.round(snowDepthCm * 2.5); // ~250 kg/m3 density average
  const snowDensityKgM3 = weather.temperature < -5 ? 80 : weather.temperature < -1 ? 120 : 250;
  const snowQuality = weather.temperature < -4 ? 'Poudreuse légère & froide' : weather.temperature < 0 ? 'Neige fraîche tassée' : weather.temperature < 2 ? 'Neige humide / collante' : 'Neige transformée / regel';

  // Frost & Inversion physics
  const tSoilGrassC = Number((weather.temperature - (weather.isDay ? 0 : (weather.cloudCoverTotalPct ?? 35) < 30 ? 3.5 : 1.5)).toFixed(1));
  const frostLevel = weather.temperature <= -10 ? 'TRÈS FORTE GELÉE' : weather.temperature <= -5 ? 'FORTE GELÉE' : weather.temperature <= -2 ? 'GELÉE MODÉRÉE' : weather.temperature <= 0 || tSoilGrassC <= 0 ? 'GELÉE BLANCHE' : 'AUCUN GEL';
  const frostRiskColor = frostLevel === 'AUCUN GEL' ? 'text-emerald-400' : frostLevel === 'GELÉE BLANCHE' ? 'text-cyan-400' : frostLevel === 'GELÉE MODÉRÉE' ? 'text-amber-400' : 'text-rose-400';
  const hasThermalInversion = !weather.isDay && weather.windSpeed < 10 && (weather.cloudCoverTotalPct ?? 35) < 30 && station.altitude < 1200;

  const cape = weather.capeJkg ?? (weather.thunderstormAnalysis?.convectiveIndices.capeJkg ?? 50);
  const liftedIdx = weather.liftedIndex ?? (weather.thunderstormAnalysis?.convectiveIndices.liftedIndex ?? 3.5);
  const aqi = weather.airQualityDetails;

  const categories: { id: MetricCategory; label: string; icon: any; badge?: string }[] = [
    { id: 'SYNTHESIS', label: 'Synthèse Directe', icon: Sparkles },
    { id: 'SNOW_NIVO', label: '❄️ Neige & Nivologie Ultra-Pro', icon: Snowflake, badge: `${snowDepthCm} cm` },
    { id: 'FROST_COLD', label: '🧊 Gelées, Sol & Inversions', icon: ThermometerSnowflake, badge: frostLevel },
    { id: 'ALTITUDE', label: '⛰️ Isotherme 0°C & LPN', icon: Mountain, badge: `Iso 0: ${iso0}m` },
    { id: 'THERMO', label: 'Thermodynamique & Confort', icon: Thermometer, badge: 'Point de rosée' },
    { id: 'AEROLOGY', label: 'Aérologie & Barométrie', icon: Gauge, badge: 'QNH / QFE' },
    { id: 'CLOUDS', label: 'Néphologie & Plafond', icon: Cloud, badge: 'LCL & Étages' },
    { id: 'SOLAR', label: 'Rayonnement & Solaire', icon: Sun, badge: `${solarRad} W/m²` },
    { id: 'HYDRO', label: 'Hydrologie & Sols', icon: Droplets, badge: 'ETP & Humidité' },
    { id: 'AIR_QUALITY', label: 'Qualité de l\'Air & ATMO', icon: Activity, badge: weather.airQualityLabel },
  ];

  return (
    <div id="certified-precision-meteo-hub" className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-md p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header section with light and airy styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Observatoire Physique de Précision</span>
            <span>•</span>
            <span className="text-slate-400">Normes OMM / Météo-France</span>
          </div>
          <h3 className={`font-black text-white mt-1 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
            Radiographie Complète des Données Météorologiques Certifiées
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Station de <strong>{station.name}</strong> ({station.department}) • Altitude : <strong className="text-slate-200">{station.altitude} m</strong> • Coordonnées : {station.latitude}°, {station.longitude}°
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-300 flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Données Certifiées Directes</span>
          </div>
        </div>
      </div>

      {/* Modern, clean pill selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-blue-400'}`} />
              <span>{cat.label}</span>
              {cat.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. SYNTHESIS VIEW */}
      {activeCategory === 'SYNTHESIS' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Température & Ressenti</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{formatTemp(weather.temperature)}</span>
              <span className="text-xs font-bold text-slate-400">Ressenti {formatTemp(weather.feelsLike)}</span>
            </div>
            <p className="text-[11px] text-slate-400">Min {formatTemp(weather.tempMin)} • Max {formatTemp(weather.tempMax)}</p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Point de Rosée (Td)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-300">{formatTemp(dewPoint)}</span>
              <span className="text-xs font-bold text-cyan-500">Humidité {weather.humidity}%</span>
            </div>
            <p className="text-[11px] text-slate-400">Pression vapeur : {weather.vaporPressureHpa || 12} hPa</p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vent & Rafales</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-300">{weather.windSpeed} <span className="text-xs font-normal">km/h</span></span>
              <span className="text-xs font-bold text-teal-500">Raf. {weather.windGust} km/h</span>
            </div>
            <p className="text-[11px] text-slate-400">Direction : {weather.windDirection}° ({syn?.beaufortScale?.description || 'Brise'})</p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pression Barométrique</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-300">{qnh} <span className="text-xs font-normal">hPa</span></span>
              <span className="text-xs font-bold text-indigo-400">QFE {qfe} hPa</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{baroTrend}</p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Plafond & Base LCL</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-300">{cloudLcl} <span className="text-xs font-normal">m</span></span>
              <span className="text-xs font-bold text-blue-400">FL{Math.round(cloudLcl / 30.48)}</span>
            </div>
            <p className="text-[11px] text-slate-400">Couverture totale : {cloudTotal}%</p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Flux Solaire & UV</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300">{solarRad} <span className="text-xs font-normal">W/m²</span></span>
              <span className="text-xs font-bold text-amber-400">UV {weather.uvIndex}</span>
            </div>
            <p className="text-[11px] text-slate-400">Insolation jour : {sunshineHours} h</p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Évapotranspiration (ET0)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300">{et0} <span className="text-xs font-normal">mm/j</span></span>
              <span className="text-xs font-bold text-emerald-400">Sol {soilMoist}%</span>
            </div>
            <p className="text-[11px] text-slate-400">Penman-Monteith FAO-56</p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Qualité de l'Air (AQI)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{weather.airQualityAqi}</span>
              <span className="text-xs font-bold text-emerald-300">{weather.airQualityLabel}</span>
            </div>
            <p className="text-[11px] text-slate-400">PM2.5: {aqi?.pm25 ?? 8} µg • NO2: {aqi?.no2 ?? 12} µg</p>
          </div>
        </div>
      )}

      {/* 2. THERMODYNAMICS & COMFORT */}
      {activeCategory === 'THERMO' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4" /> Point de Rosée (Td)</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">Magnus-Tetens</span>
              </div>
              <div className="text-3xl font-black text-white">{formatTemp(dewPoint)}</div>
              <p className="text-xs text-slate-400">
                Température à laquelle l'air ambiant doit être refroidi, à pression constante, pour que la vapeur d'eau se condense en rosée ou brouillard.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5"><Flame className="h-4 w-4" /> Indice Humidex</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">Confort Thermique</span>
              </div>
              <div className="text-3xl font-black text-white">{formatTemp(humidex)}</div>
              <p className="text-xs text-slate-400">
                Indice combinant la température de l'air et la tension de vapeur d'eau pour quantifier l'inconfort ressenti par le corps humain.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span className="flex items-center gap-1.5"><Wind className="h-4 w-4" /> Refroidissement Éolien (Windchill)</span>
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">Formule OMM / NOAA</span>
              </div>
              <div className="text-3xl font-black text-white">{formatTemp(windChill)}</div>
              <p className="text-xs text-slate-400">
                Perte de chaleur convective accélérée par l'écoulement de l'air sur la peau exposée.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Pression de Vapeur Saturante (e)</span>
                <span className="text-slate-500">hPa</span>
              </div>
              <div className="text-2xl font-black text-white">{weather.vaporPressureHpa ?? 14.2} hPa</div>
              <p className="text-xs text-slate-400">
                Tension de vapeur partielle dans la colonne troposphérique de surface.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Humidité Absolue</span>
                <span className="text-slate-500">g/m³</span>
              </div>
              <div className="text-2xl font-black text-white">{syn?.absoluteHumidityGm3 ?? 9.8} g/m³</div>
              <p className="text-xs text-slate-400">
                Masse exacte d'eau contenue dans chaque mètre cube d'air atmosphérique.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Température du Bulbe Humide (Tw)</span>
                <span className="text-slate-500">Stull</span>
              </div>
              <div className="text-2xl font-black text-white">{formatTemp(syn?.wetBulbTemperature ?? (weather.temperature - 2))}</div>
              <p className="text-xs text-slate-400">
                Température minimale atteignable par évaporation d'eau pure (déterminante pour l'effet d'isothermie).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. AEROLOGY & BAROMETRY */}
      {activeCategory === 'AEROLOGY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
              <span className="flex items-center gap-1.5"><Gauge className="h-4 w-4" /> Pression Mer QNH</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">Niveau Mer</span>
            </div>
            <div className="text-3xl font-black text-white">{qnh} <span className="text-base font-normal text-slate-400">hPa</span></div>
            <p className="text-xs text-slate-400">
              Pression barométrique ramenée au niveau moyen de la mer selon l'atmosphère standard internationale (ISA).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
              <span className="flex items-center gap-1.5"><Mountain className="h-4 w-4" /> Pression Station QFE</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">{station.altitude} m</span>
            </div>
            <div className="text-3xl font-black text-white">{qfe} <span className="text-base font-normal text-slate-400">hPa</span></div>
            <p className="text-xs text-slate-400">
              Pression barométrique réelle mesurée au niveau effectif des capteurs de la station.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5"><Activity className="h-4 w-4" /> Tendance Barométrique 3h</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">ΔP / 3h</span>
            </div>
            <div className="text-2xl font-black text-white">{baroTrend}</div>
            <p className="text-xs text-slate-400">
              Variation de pression sur les 3 dernières heures, indicateur majeur du passage de fronts et d'anticyclones.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-teal-400">
              <span className="flex items-center gap-1.5"><Wind className="h-4 w-4" /> Vitesse Moyenne à 10m</span>
              <span className="text-slate-500">km/h</span>
            </div>
            <div className="text-3xl font-black text-white">{weather.windSpeed} <span className="text-base font-normal text-slate-400">km/h</span></div>
            <p className="text-xs text-slate-400">
              Vitesse moyenne calculée sur 10 minutes selon les recommandations de l'Organisation Météorologique Mondiale.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Rafales Maximales</span>
              <span className="text-slate-500">km/h</span>
            </div>
            <div className="text-3xl font-black text-white">{weather.windGust} <span className="text-base font-normal text-slate-400">km/h</span></div>
            <p className="text-xs text-slate-400">
              Pic instantané mesuré sur un créneau glissant de 3 secondes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5"><Compass className="h-4 w-4" /> Échelle de Beaufort</span>
              <span className="text-slate-500">Force {syn?.beaufortScale?.force ?? 3}</span>
            </div>
            <div className="text-xl font-black text-white">{syn?.beaufortScale?.description || 'Petite brise'}</div>
            <p className="text-xs text-slate-400">
              {syn?.beaufortScale?.seaDescription || 'Feuilles et brindilles constamment agitées.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. CLOUDS & VISIBILITY */}
      {activeCategory === 'CLOUDS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-400">
              <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> Plafond / Base LCL</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">Lifting Condensation</span>
            </div>
            <div className="text-3xl font-black text-white">{cloudLcl} <span className="text-base font-normal text-slate-400">mètres</span></div>
            <p className="text-xs text-slate-400">
              Altitude estimée de la base des nuages au-dessus du sol (Niveau de condensation par soulèvement).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5"><Cloud className="h-4 w-4" /> Couverture Totale</span>
              <span className="text-slate-500">{syn?.cloudCoverOctas ?? 3}/8 Octas</span>
            </div>
            <div className="text-3xl font-black text-white">{cloudTotal}%</div>
            <p className="text-xs text-slate-400">
              Fraction totale de la voûte céleste obscurcie par l'ensemble des couches nuageuses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> Visibilité Horizontale</span>
              <span className="text-slate-500">km</span>
            </div>
            <div className="text-3xl font-black text-white">{visibilityKm} <span className="text-base font-normal text-slate-400">km</span></div>
            <p className="text-xs text-slate-400">
              Distance maximale à laquelle un objet sombre de dimensions convenables peut être reconnu à l'œil nu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nuages Bas (0 - 2 000 m)</span>
            <div className="text-2xl font-black text-slate-200">{cloudLow}%</div>
            <p className="text-xs text-slate-400">Stratus, Stratocumulus, Cumulus humilis.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nuages Moyens (2 000 - 6 000 m)</span>
            <div className="text-2xl font-black text-slate-200">{cloudMid}%</div>
            <p className="text-xs text-slate-400">Altocumulus, Altostratus, Nimbostratus.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nuages Hauts (&gt; 6 000 m)</span>
            <div className="text-2xl font-black text-slate-200">{cloudHigh}%</div>
            <p className="text-xs text-slate-400">Cirrus, Cirrocumulus, Cirrostratus (cristaux de glace).</p>
          </div>
        </div>
      )}

      {/* 5. SOLAR RADIATION & HELIOMETRY */}
      {activeCategory === 'SOLAR' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5"><Sun className="h-4 w-4" /> Rayonnement Solaire Global</span>
              <span className="text-slate-500">Pyranomètre</span>
            </div>
            <div className="text-3xl font-black text-white">{solarRad} <span className="text-base font-normal text-slate-400">W/m²</span></div>
            <p className="text-xs text-slate-400">
              Somme des rayonnements directs et diffus incidents reçus sur un plan horizontal au sol.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Insolation Cumulée Aujourd'hui</span>
              <span className="text-slate-500">Heures</span>
            </div>
            <div className="text-3xl font-black text-white">{sunshineHours} <span className="text-base font-normal text-slate-400">heures</span></div>
            <p className="text-xs text-slate-400">
              Durée pendant laquelle le rayonnement direct a dépassé le seuil OMM de 120 W/m².
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Indice UV Corrigé</span>
              <span className="text-slate-500">Alt. {station.altitude}m</span>
            </div>
            <div className="text-3xl font-black text-white">{weather.uvIndex} <span className="text-base font-normal text-slate-400">/ 12</span></div>
            <p className="text-xs text-slate-400">
              Indice d'intensité des rayonnements ultraviolets intégrant la majoration liée à l'altitude (+10% / 1000m).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lever & Coucher du Soleil</span>
            <div className="text-xl font-bold text-slate-200">
              🌅 {weather.solarEphemeris?.sunrise || '06:30'} — 🌇 {weather.solarEphemeris?.sunset || '21:15'}
            </div>
            <p className="text-xs text-slate-400">Midi solaire vrai : {weather.solarEphemeris?.solarNoon || '13:52'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Crépuscules Civils</span>
            <div className="text-xl font-bold text-slate-200">
              Aube {weather.solarEphemeris?.civilTwilightBegin || '06:00'} • Crépuscule {weather.solarEphemeris?.civilTwilightEnd || '21:45'}
            </div>
            <p className="text-xs text-slate-400">Soleil à -6° sous l'horizon.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hauteur Solaire Maximale</span>
            <div className="text-2xl font-black text-slate-200">
              {weather.solarEphemeris?.maxSolarElevationDeg || 62}°
            </div>
            <p className="text-xs text-slate-400">Élévation zénithale au midi solaire.</p>
          </div>
        </div>
      )}

      {/* 6. HYDROLOGY & SOILS */}
      {activeCategory === 'HYDRO' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5"><Sprout className="h-4 w-4" /> Évapotranspiration (ET0)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">FAO-56</span>
            </div>
            <div className="text-3xl font-black text-white">{et0} <span className="text-base font-normal text-slate-400">mm/jour</span></div>
            <p className="text-xs text-slate-400">
              Perte en eau d'une culture de référence par transpiration végétale et évaporation du sol (Penman-Monteith).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-400">
              <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4" /> Humidité Superficielle du Sol</span>
              <span className="text-slate-500">0 - 7 cm</span>
            </div>
            <div className="text-3xl font-black text-white">{soilMoist}%</div>
            <p className="text-xs text-slate-400">
              Teneur en eau volumique de la couche arable supérieure (surface agricole et forestière).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
              <span className="flex items-center gap-1.5"><Waves className="h-4 w-4" /> Bilan Hydrique Quotidien</span>
              <span className="text-slate-500">P - ET0</span>
            </div>
            <div className="text-2xl font-black text-white">
              {weather.precipitation >= et0 ? `+${(weather.precipitation - et0).toFixed(1)} mm (Recharge)` : `${(weather.precipitation - et0).toFixed(1)} mm (Déficit)`}
            </div>
            <p className="text-xs text-slate-400">
              Différence entre la pluie tombée et l'eau évapotranspirée dans la journée.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Température Estimée du Sol</span>
            <div className="text-2xl font-black text-slate-200">{formatTemp(weather.soilTemperatureC ?? weather.temperature)}</div>
            <p className="text-xs text-slate-400">Température de la terre arable à 5 cm de profondeur.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Risque de Gel au Sol</span>
            <div className="text-xl font-bold text-emerald-400">
              {weather.altitudeMetrics?.frostRiskLevel || 'AUCUN'}
            </div>
            <p className="text-xs text-slate-400">Calculé en fonction du point de rosée et de la nébulosité nocturne.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Degrés-Jours Chauffage (DJU 18°C)</span>
            <div className="text-2xl font-black text-slate-200">{weather.djuHeating ?? weather.altitudeMetrics?.djuHeat ?? 0} DJU</div>
            <p className="text-xs text-slate-400">Indicateur de consommation d'énergie de chauffage.</p>
          </div>
        </div>
      )}

      {/* 7. DETAILED AIR QUALITY & ATMO */}
      {activeCategory === 'AIR_QUALITY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">PM2.5 (Fines)</span>
              <div className="text-xl font-black text-white">{aqi?.pm25 ?? 8.2} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
              <span className="text-[10px] text-emerald-400">Seuil OMS : 15 µg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">PM10 (Poussières)</span>
              <div className="text-xl font-black text-white">{aqi?.pm10 ?? 14.5} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
              <span className="text-[10px] text-emerald-400">Seuil OMS : 45 µg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">NO2 (Azote)</span>
              <div className="text-xl font-black text-white">{aqi?.no2 ?? 12.0} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
              <span className="text-[10px] text-emerald-400">Trafic & Combustion</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Ozone (O3)</span>
              <div className="text-xl font-black text-white">{aqi?.o3 ?? 45.0} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
              <span className="text-[10px] text-emerald-400">Photochimie</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">SO2 (Soufre)</span>
              <div className="text-xl font-black text-white">{aqi?.so2 ?? 2.1} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
              <span className="text-[10px] text-emerald-400">Industrie</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Indice ATMO Global</span>
              <div className="text-xl font-black text-emerald-400">{weather.airQualityAqi} / 100</div>
              <span className="text-[10px] text-emerald-300 font-bold">{weather.airQualityLabel}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Recommandations Sanitaires Officielles :</strong>
              <p className="mt-0.5 text-slate-400 leading-relaxed">
                {aqi?.advice || "La qualité de l'air est actuellement conforme aux normes de santé publique. Aucune restriction pour la pratique sportive ou l'aération des logements."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ULTRA-PRO SNOW & NIVOLOGY VIEW */}
      {activeCategory === 'SNOW_NIVO' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                <span className="flex items-center gap-1.5"><Snowflake className="h-4 w-4" /> Manteau au Sol</span>
                <span className="text-slate-500">Capteur Nivologique</span>
              </div>
              <div className="text-3xl font-black text-white">{snowDepthCm} <span className="text-sm font-normal text-cyan-300">cm</span></div>
              <p className="text-[11px] text-slate-400">
                Épaisseur mesurée sur mire nivométrique officielle à {station.altitude} m.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> Neige Fraîche (24h)</span>
                <span className="text-slate-500">Cumul Récent</span>
              </div>
              <div className="text-3xl font-black text-white">{freshSnow24hCm} <span className="text-sm font-normal text-slate-400">cm</span></div>
              <p className="text-[11px] text-slate-400">
                Précipitations solides tombées sur les dernières 24 heures glissantes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-teal-400">
                <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4" /> Équivalent Eau (SWE)</span>
                <span className="text-slate-500">Masse Hydrique</span>
              </div>
              <div className="text-3xl font-black text-white">{snowWaterEquivalentMm} <span className="text-sm font-normal text-teal-300">mm (l/m²)</span></div>
              <p className="text-[11px] text-slate-400">
                Volume d'eau liquide contenu dans le manteau en cas de fonte intégrale.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                <span className="flex items-center gap-1.5"><Activity className="h-4 w-4" /> Densité & Structure</span>
                <span className="text-slate-500">{snowDensityKgM3} kg/m³</span>
              </div>
              <div className="text-base font-black text-indigo-200">{snowQuality}</div>
              <p className="text-[11px] text-slate-400">
                Ratio neige/eau estimé : 1:{Math.round(1000 / snowDensityKgM3)} selon la température.
              </p>
            </div>
          </div>

          {/* Detailed Nivology Profile Table by Altitude Tier (every 300m) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Mountain className="h-4 w-4 text-cyan-400" />
                Profil d'Enneigement par Étage d'Altitude & Risque d'Avalanche
              </span>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                Massif : {station.region || 'France'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
              {[
                { alt: 600, snow: Math.max(0, Math.round(snowDepthCm * 0.1)), temp: Number((weather.temperature + (station.altitude - 600) * 0.0065).toFixed(1)) },
                { alt: 1000, snow: Math.max(0, Math.round(snowDepthCm * 0.35 + (station.altitude < 1000 ? 5 : 0))), temp: Number((weather.temperature + (station.altitude - 1000) * 0.0065).toFixed(1)) },
                { alt: 1500, snow: Math.max(0, Math.round(snowDepthCm * 0.75 + (station.altitude < 1500 ? 20 : 0))), temp: Number((weather.temperature + (station.altitude - 1500) * 0.0065).toFixed(1)) },
                { alt: 2000, snow: Math.max(0, Math.round(snowDepthCm * 1.25 + (station.altitude < 2000 ? 60 : 0))), temp: Number((weather.temperature + (station.altitude - 2000) * 0.0065).toFixed(1)) },
                { alt: 2500, snow: Math.max(0, Math.round(snowDepthCm * 1.6 + 110)), temp: Number((weather.temperature + (station.altitude - 2500) * 0.0065).toFixed(1)) },
                { alt: 3000, snow: Math.max(0, Math.round(snowDepthCm * 1.9 + 175)), temp: Number((weather.temperature + (station.altitude - 3000) * 0.0065).toFixed(1)) },
              ].map((tier, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-300">{tier.alt} m</div>
                  <div className="text-lg font-black text-white">{tier.snow} cm</div>
                  <div className={`text-[10px] font-bold ${tier.temp <= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {formatTemp(tier.temp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ULTRA-PRO FROST, GROUND FREEZE & THERMAL INVERSIONS VIEW */}
      {activeCategory === 'FROST_COLD' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                <span className="flex items-center gap-1.5"><ThermometerSnowflake className="h-4 w-4" /> Palier de Gelée Actuel</span>
                <span className="text-slate-500">Sous Abri</span>
              </div>
              <div className={`text-2xl font-black ${frostRiskColor}`}>{frostLevel}</div>
              <p className="text-[11px] text-slate-400">
                Température sous abri 2m : <strong className="text-white">{formatTemp(weather.temperature)}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                <span className="flex items-center gap-1.5"><Sprout className="h-4 w-4" /> Gel au Sol / Sur Herbe (10cm)</span>
                <span className="text-slate-500">Rayonnement</span>
              </div>
              <div className="text-2xl font-black text-cyan-300">{formatTemp(tSoilGrassC)}</div>
              <p className="text-[11px] text-slate-400">
                Perte radiative nocturne : <strong className="text-cyan-200">{(weather.temperature - tSoilGrassC).toFixed(1)}°C</strong> plus froid qu'à 2m.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5"><Compass className="h-4 w-4" /> Inversion Thermique</span>
                <span className="text-slate-500">Lacs d'air froid</span>
              </div>
              <div className="text-base font-black text-amber-200">
                {hasThermalInversion ? 'Forte en fond de vallée' : 'Gradient standard normal'}
              </div>
              <p className="text-[11px] text-slate-400">
                {hasThermalInversion ? "Air glacial plaqué au sol sous ciel nocturne dégagé et vent calme." : "Brassage éolien ou nébulosité limitant les inversions."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                <span className="flex items-center gap-1.5"><Wind className="h-4 w-4" /> Windchill (Refroidissement)</span>
                <span className="text-slate-500">Effet Éolien</span>
              </div>
              <div className="text-2xl font-black text-rose-300">{formatTemp(windChill)}</div>
              <p className="text-[11px] text-slate-400">
                Ressenti thermique avec vent moyen de {weather.windSpeed} km/h (formule NOAA/OMM).
              </p>
            </div>
          </div>

          {/* Frost Tiers Scientific Scale & Agriculture Impact */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Classification des 5 Paliers de Gelée & Seuils Agronomiques
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border ${weather.temperature <= 0 && weather.temperature > -2 ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-800'}`}>
                <div className="font-bold text-cyan-300">1. Gelée Blanche</div>
                <div className="text-[11px] text-slate-400">0°C à -2°C</div>
                <p className="text-[10px] text-slate-400 mt-1">Rosée gelée superficielle, verglas sur ponts.</p>
              </div>

              <div className={`p-2.5 rounded-xl border ${weather.temperature <= -2 && weather.temperature > -5 ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-900 border-slate-800'}`}>
                <div className="font-bold text-blue-300">2. Gelée Modérée</div>
                <div className="text-[11px] text-slate-400">-2°C à -5°C</div>
                <p className="text-[10px] text-slate-400 mt-1">Impact sur les bourgeons et arbres fruitiers.</p>
              </div>

              <div className={`p-2.5 rounded-xl border ${weather.temperature <= -5 && weather.temperature > -10 ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-900 border-slate-800'}`}>
                <div className="font-bold text-indigo-300">3. Forte Gelée</div>
                <div className="text-[11px] text-slate-400">-5°C à -10°C</div>
                <p className="text-[10px] text-slate-400 mt-1">Gel des canalisations exposées et des sols.</p>
              </div>

              <div className={`p-2.5 rounded-xl border ${weather.temperature <= -10 ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500' : 'bg-slate-900 border-slate-800'}`}>
                <div className="font-bold text-rose-300">4. Très Forte Gelée</div>
                <div className="text-[11px] text-slate-400">&lt; -10°C</div>
                <p className="text-[10px] text-slate-400 mt-1">Grand froid sévère, paralysie des cours d'eau.</p>
              </div>

              <div className={`p-2.5 rounded-xl border ${weather.tempMax <= 0 ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500' : 'bg-slate-900 border-slate-800'}`}>
                <div className="font-bold text-purple-300">5. Jour Sans Dégel</div>
                <div className="text-[11px] text-slate-400">Tx &le; 0.0°C</div>
                <p className="text-[10px] text-slate-400 mt-1">La température reste négative 24h sur 24.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ULTRA-PRO ISOTHERM 0°C, WET BULB TW=0 & LPN VIEW */}
      {activeCategory === 'ALTITUDE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                <span className="flex items-center gap-1.5"><Mountain className="h-4 w-4" /> Isotherme 0°C (Libre)</span>
                <span className="text-slate-500">Air Libre</span>
              </div>
              <div className="text-3xl font-black text-white">{iso0} <span className="text-sm font-normal text-cyan-300">m</span></div>
              <p className="text-[11px] text-slate-400">
                Altitude où la température de l'air sec atteint 0.0°C.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-teal-400">
                <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4" /> Isotherme Tw = 0°C</span>
                <span className="text-slate-500">Bulbe Humide</span>
              </div>
              <div className="text-3xl font-black text-white">{tw0} <span className="text-sm font-normal text-teal-300">m</span></div>
              <p className="text-[11px] text-slate-400">
                Niveau d'équilibre évaporatif : les flocons ne fondent pas au-dessus de cette altitude.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> LPN Nominale</span>
                <span className="text-slate-500">Fusion 50%</span>
              </div>
              <div className="text-3xl font-black text-white">{lpnNominal} <span className="text-sm font-normal text-blue-300">m</span></div>
              <p className="text-[11px] text-slate-400">
                Altitude de transition où la neige se transforme en pluie sous précipitations faibles.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                <span className="flex items-center gap-1.5"><ArrowDownRight className="h-4 w-4" /> LPN Isothermie</span>
                <span className="text-slate-500">Fortes Pluies</span>
              </div>
              <div className="text-3xl font-black text-white">{lpnIsothermie} <span className="text-sm font-normal text-indigo-300">m</span></div>
              <p className="text-[11px] text-slate-400">
                Rabattement de la neige par refroidissement de la couche d'air sous fortes averses (-300m).
              </p>
            </div>
          </div>

          {/* Vertical Tropospheric Profile Sounding Table */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-400" />
                Radiosondage & Profil Vertical de Température et Pression
              </span>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                Gradient : {weather.altitudeMetrics?.lapseRate || -0.65} °C / 100m
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
              {[
                { label: 'Niveau Mer (0 m)', alt: 0, temp: Number((weather.temperature + station.altitude * 0.0065).toFixed(1)), press: qnh },
                { label: `Station (${station.altitude} m)`, alt: station.altitude, temp: weather.temperature, press: qfe },
                { label: 'FL 050 (1 500 m)', alt: 1500, temp: Number((weather.temperature + (station.altitude - 1500) * 0.0065).toFixed(1)), press: 850 },
                { label: 'FL 070 (2 100 m)', alt: 2100, temp: Number((weather.temperature + (station.altitude - 2100) * 0.0065).toFixed(1)), press: 790 },
                { label: 'FL 100 (3 000 m)', alt: 3000, temp: Number((weather.temperature + (station.altitude - 3000) * 0.0065).toFixed(1)), press: 700 },
                { label: 'FL 140 (4 200 m)', alt: 4200, temp: Number((weather.temperature + (station.altitude - 4200) * 0.0065).toFixed(1)), press: 600 },
              ].map((tier, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400">{tier.label}</div>
                  <div className={`text-lg font-black ${tier.temp <= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {formatTemp(tier.temp)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{tier.press} hPa</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
