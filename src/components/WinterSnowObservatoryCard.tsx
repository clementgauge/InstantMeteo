import React, { useState } from 'react';
import { 
  SnowNivologyObservatory, 
  LocationPoint, 
  MultiYearSnowSeasonRecord,
  AltitudeSnowLayer,
  CurrentWeather,
  DailyForecast
} from '../types/weather';
import { generateSnowNivologyObservatory } from '../services/winterObservatoryService';
import { 
  probeAltitudePrecipitationPhase,
  AltitudePrecipitationProbeResult
} from '../utils/isothermCalculations';
import { 
  Mountain, 
  Snowflake, 
  CloudSnow, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Compass, 
  ThermometerSnowflake, 
  Calendar, 
  Search, 
  Sliders, 
  ChevronRight,
  Sparkles,
  Info,
  Droplets,
  Activity,
  Zap,
  Car,
  Gauge,
  Eye,
  Cloud,
  ArrowDownCircle,
  Wind
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

interface WinterSnowObservatoryCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentWeather?: CurrentWeather;
  dailyForecasts?: DailyForecast[];
  seniorMode: boolean;
}

export const WinterSnowObservatoryCard: React.FC<WinterSnowObservatoryCardProps> = ({
  station,
  currentTemp,
  currentWeather,
  dailyForecasts,
  seniorMode
}) => {
  const [subTab, setSubTab] = useState<'CURRENT_STATUS' | 'LPN_PROFILER' | 'ALTITUDE_PROFILE' | 'SNOW_TYPE_PHYSICS' | 'HISTORICAL_SEASONS' | 'AVALANCHE_BERA'>('CURRENT_STATUS');
  const [historySearchYear, setHistorySearchYear] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<MultiYearSnowSeasonRecord | null>(null);
  const [probeAltitude, setProbeAltitude] = useState<number>(Math.max(200, Math.round(station.altitude || 1000)));

  const observatory: SnowNivologyObservatory = generateSnowNivologyObservatory(
    station, 
    currentTemp, 
    currentWeather, 
    dailyForecasts
  );

  // Live probe calculation for selected altitude
  const stationT = currentTemp ?? currentWeather?.temperature ?? 10;
  const stationHum = currentWeather?.humidity ?? 65;
  const stationPrecip = currentWeather?.precipitation ?? 0;
  const probedResult: AltitudePrecipitationProbeResult = probeAltitudePrecipitationPhase(
    probeAltitude,
    station.altitude,
    stationT,
    stationHum,
    stationPrecip,
    observatory.currentIsotherm0Meters,
    observatory.currentRainSnowLimitMeters
  );

  // Filter historical seasons
  const filteredSeasons = observatory.historicalSeasons.filter(s => 
    s.seasonLabel.toLowerCase().includes(historySearchYear.toLowerCase()) ||
    s.endYear.toString().includes(historySearchYear) ||
    s.winterCharacter.toLowerCase().includes(historySearchYear.toLowerCase())
  );

  // Altitude presets for rapid testing strictly adapted to local topography
  const isMountainStation = (station.altitude ?? 0) >= 600;
  const isHighMassif = (station.altitude ?? 0) >= 1200;
  const stAlt = station.altitude ?? 130;

  const altitudePresets = isMountainStation
    ? [
        { label: `Station (${stAlt} m)`, alt: stAlt },
        { label: 'Pied de massif (800 m)', alt: 800 },
        { label: 'Moyenne montagne (1 400 m)', alt: 1400 },
        { label: 'Étage subalpin (1 800 m)', alt: 1800 },
        ...(isHighMassif ? [
          { label: 'Cols & Hauts Domaines (2 300 m)', alt: 2300 },
          { label: 'Hauts Sommets (3 000 m)', alt: 3000 }
        ] : [
          { label: 'Crêtes & Sommets du Massif (1 700 m)', alt: 1700 }
        ])
      ]
    : [
        { label: `Centre-ville (${station.name} - ${stAlt} m)`, alt: stAlt },
        { label: `Plateaux & Collines (${stAlt + 40} m)`, alt: stAlt + 40 },
        { label: `Point haut départemental (${stAlt + 90} m)`, alt: stAlt + 90 },
        { label: `Basse atmosphère (${stAlt + 400} m)`, alt: stAlt + 400 },
        { label: `Étage isothère (${stAlt + 800} m)`, alt: stAlt + 800 }
      ];

  // Chart data from historical seasons (sample every 2 years or top 25 recent for clean chart)
  const chartData = observatory.historicalSeasons.slice(0, 30).reverse().map(s => ({
    name: s.seasonLabel.replace('Hiver ', ''),
    totalSnowfall: s.totalSnowfallSeasonCm,
    maxDepth: s.maxSnowDepthRecordedCm,
    daysGt1cm: s.daysWithSnowCoverGt1cm,
    daysGt10cm: s.daysWithSnowCoverGt10cm,
    anomaly: s.snowAnomalyVs1991_2020Pct
  }));

  return (
    <div id="winter-snow-observatory-card" className="rounded-3xl border border-blue-900/50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-2xl backdrop-blur space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-600/20 p-3 text-cyan-400 border border-cyan-500/30">
            <Mountain className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Snowflake className="h-3.5 w-3.5" /> Observatoire de l'Enneigement & Nivologie
              </span>
              <span>•</span>
              <span className="text-white font-bold">{observatory.massifName}</span>
              <span>•</span>
              <span className="text-emerald-400">Archives 1950 - 2026</span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'} mt-0.5`}>
              Enneigement & Niveaux de Neige — {station.name} ({station.altitude} m)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Département {station.department} • Isotherme 0°C à {observatory.currentIsotherm0Meters} m • LPN estimée à {observatory.currentRainSnowLimitMeters} m
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSubTab('CURRENT_STATUS')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'CURRENT_STATUS' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Snowflake className="h-3 w-3" />
            <span>Manteau Actuel</span>
          </button>
          <button
            onClick={() => setSubTab('LPN_PROFILER')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'LPN_PROFILER' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg ring-1 ring-cyan-400/50' : 'text-cyan-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-300" />
            <span>Profileur LPN & Altitude (0-4000m)</span>
          </button>
          <button
            onClick={() => setSubTab('ALTITUDE_PROFILE')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'ALTITUDE_PROFILE' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Profil par Étage</span>
          </button>
          <button
            onClick={() => setSubTab('SNOW_TYPE_PHYSICS')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'SNOW_TYPE_PHYSICS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Type de Neige & Isothermie</span>
          </button>
          <button
            onClick={() => setSubTab('HISTORICAL_SEASONS')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'HISTORICAL_SEASONS' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>Historique (1950-2026)</span>
          </button>
          <button
            onClick={() => setSubTab('AVALANCHE_BERA')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'AVALANCHE_BERA' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Risque Avalanche (BERA)</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Record Épaisseur Absolu</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300">{observatory.allTimeRecordSnowDepthCm}</span>
            <span className="text-xs text-slate-400">cm au sol</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {observatory.allTimeRecordSnowYear}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <CloudSnow className="h-4 w-4 text-blue-400" />
            <span>Cumul Moyen Saison</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-300">{observatory.historicalAverages.avgSnowfallSeasonCm}</span>
            <span className="text-xs text-slate-400">cm / hiver</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Moyenne climatologique {observatory.historicalAverages.avgDaysSnowCoverGt1cm} j avec neige
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>Dates Clés Saisonnières</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            1ère Neige : {observatory.historicalAverages.avgFirstSnowDate}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dernière Neige : {observatory.historicalAverages.avgLastSnowDate}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Activity className="h-4 w-4 text-amber-400" />
            <span>Tendance Climatologique</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-400">{observatory.historicalAverages.climateTrendDecadeDays}</span>
            <span className="text-xs text-slate-400">j / décennie</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Évolution durée enneigement depuis 1950
          </p>
        </div>
      </div>

      {/* Sub-tab 1: Current Snowpack & Quality Details */}
      {subTab === 'CURRENT_STATUS' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/80 p-5 border border-cyan-500/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Diagnostic Manteau Neigeux & Praticabilité
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {observatory.currentSnowStatus}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                Stabilité Manteau : {observatory.snowQualityDetails.stabilityScore}/100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold">Structure des Grains :</span>
                <p className="text-white font-black text-sm">{observatory.snowQualityDetails.grainType}</p>
                <p className="text-slate-400 text-[11px]">Évolution métamorphique en cours</p>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold">Condition Ski & Randonnée :</span>
                <p className="text-white font-black text-sm">{observatory.snowQualityDetails.skatingAndSkiCondition}</p>
                <p className="text-slate-400 text-[11px]">Domaines skiables & hors-piste</p>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold">Conditions Routières :</span>
                <p className="text-white font-black text-sm">{observatory.snowQualityDetails.drivingCondition}</p>
                <p className="text-slate-400 text-[11px]">Accès cols et stations</p>
              </div>
            </div>
          </div>

          {/* Altitude Layers Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {observatory.altitudeLayers.map((layer, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>{layer.label}</span>
                  <span className="text-cyan-400">{layer.altitudeMeters} m</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{layer.snowDepthCm}</span>
                  <span className="text-xs text-slate-400">cm au sol</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                  <p><strong>Neige fraîche (24h/72h) :</strong> {layer.freshSnow24hCm} cm / {layer.freshSnow72hCm} cm</p>
                  <p><strong>Qualité :</strong> <span className="text-cyan-300">{layer.snowQuality}</span></p>
                  <p><strong>Densité :</strong> {layer.densityKgM3} kg/m³ (SWE {layer.sweWaterEquivalentMm} mm)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab: Interactive LPN & Altitude Vertical Profiler */}
      {subTab === 'LPN_PROFILER' && (
        <div className="space-y-5">
          {/* Main Interactive Control Hero */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 border border-cyan-500/40 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" /> Sondeur Microphysique Altimétrique & Limite Pluie-Neige en Temps Réel
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  Sonde Altimétrique Interactive (0 à 4 000 m)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ajustez l'altitude pour observer le comportement instantané de la colonne d'air, la phase des précipitations et l'isothermie.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40">
                  Isotherme 0°C : {observatory.currentIsotherm0Meters} m
                </span>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  LPN : {observatory.currentRainSnowLimitMeters} m
                </span>
              </div>
            </div>

            {/* Interactive Altitude Slider */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-cyan-400" /> Altitude Sondée
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-cyan-300">{probeAltitude}</span>
                  <span className="text-sm font-bold text-slate-400">mètres</span>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={4000}
                  step={25}
                  value={probeAltitude}
                  onChange={(e) => setProbeAltitude(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>0 m (Mer)</span>
                  <span>500 m</span>
                  <span>1 000 m</span>
                  <span>1 500 m</span>
                  <span>2 000 m</span>
                  <span>2 500 m</span>
                  <span>3 000 m</span>
                  <span>4 000 m (Sommets)</span>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-semibold">Repères rapides :</span>
                {altitudePresets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProbeAltitude(p.alt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      probeAltitude === p.alt
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Probed Result Display */}
            <div className={`p-5 rounded-2xl border ${probedResult.phaseBadgeBorder} ${probedResult.phaseBadgeBg} space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{probedResult.phaseEmoji}</span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                      Phase & Type d'Hydrométéore à {probeAltitude} m
                    </span>
                    <h5 className="text-lg font-black text-white">
                      {probedResult.phaseLabel}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">T° Air / T° Mouillée :</span>
                    <span className="text-base font-black text-white">
                      {probedResult.airTemperatureC}°C <span className="text-xs text-slate-400 font-normal">/ Tw {probedResult.wetBulbTemperatureC}°C</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of Microphysical Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Tenue de la Neige au Sol :</span>
                  <p className="text-white font-black text-sm">{probedResult.groundAccumulationLabel}</p>
                  <p className="text-slate-400 text-[11px]">
                    {probeAltitude >= observatory.currentRainSnowLimitMeters + 160 ? 'Au-dessus de la LTN (Tenue assurée)' : 'Sous la LTN (Fonte au contact)'}
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Ratio Eau / Neige :</span>
                  <p className="text-cyan-300 font-black text-sm">
                    {probedResult.snowWaterRatioCmPerMm > 0 ? `1 mm pluie = ${probedResult.snowWaterRatioCmPerMm} cm neige` : '0 (Pluie liquide pure)'}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Chute estimée : {probedResult.expectedSnowRateCmH} cm/h
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Diagnostic Routier & Cols :</span>
                  <p className="text-amber-300 font-bold text-xs">{probedResult.roadConditionDiagnostic}</p>
                  <p className="text-slate-400 text-[11px]">Adhérence & équipements</p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Position Thermique :</span>
                  <p className="text-white font-bold text-xs">
                    {probedResult.deltaToIso0Meters > 0 
                      ? `+${probedResult.deltaToIso0Meters} m au-dessus de l'Iso 0°C` 
                      : `${probedResult.deltaToIso0Meters} m sous l'Iso 0°C`}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {probedResult.isInsideMeltingLayer ? '⚠️ Dans la zone de fusion des flocons' : 'Hors zone de fusion'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vertical Atmosphere Slices Reference */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-cyan-400" /> Profil Vertical Stratifié Actuel
              </h5>

              <div className="space-y-2 text-xs">
                {/* 1. Freezing atmosphere */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  probeAltitude >= observatory.currentIsotherm0Meters
                    ? 'bg-blue-950/80 border-blue-400 text-blue-100'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Snowflake className="h-4 w-4 text-cyan-300" />
                    <div>
                      <span className="font-bold text-white">Étage Nival & Glacial (&gt; {observatory.currentIsotherm0Meters} m)</span>
                      <p className="text-[11px]">Atmosphère entièrement négative (&lt; 0°C) • Neige poudreuse & cristaux de glace</p>
                    </div>
                  </div>
                  <span className="font-black text-cyan-300">Isotherme 0°C</span>
                </div>

                {/* 2. Melting layer / Isothermie */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  probeAltitude < observatory.currentIsotherm0Meters && probeAltitude >= observatory.currentRainSnowLimitMeters
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white">Zone de Fusion & Isothermie ({observatory.currentRainSnowLimitMeters} m à {observatory.currentIsotherm0Meters} m)</span>
                      <p className="text-[11px]">Flocons en cours de liquéfaction • Refroidissement actif de la colonne d'air</p>
                    </div>
                  </div>
                  <span className="font-black text-teal-300">LPN : {observatory.currentRainSnowLimitMeters} m</span>
                </div>

                {/* 3. Liquid rain layer */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  probeAltitude < observatory.currentRainSnowLimitMeters
                    ? 'bg-slate-900 border-sky-400 text-sky-100'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <CloudSnow className="h-4 w-4 text-blue-400" />
                    <div>
                      <span className="font-bold text-white">Étage Liquide / Pluie (&lt; {observatory.currentRainSnowLimitMeters} m)</span>
                      <p className="text-[11px]">Liquéfaction complète des hydrométéores • Précipitations liquides sur chaussée</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-400">Pluie Liquide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Detailed Altitude Profile */}
      {subTab === 'ALTITUDE_PROFILE' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Étage Altitudinal</th>
                <th className="p-3">Altitude</th>
                <th className="p-3">Épaisseur Totale</th>
                <th className="p-3">Chute 24h</th>
                <th className="p-3">Chute 72h</th>
                <th className="p-3">Chute 7 Jours</th>
                <th className="p-3">Type de Neige</th>
                <th className="p-3">Densité</th>
                <th className="p-3">Équivalent Eau (SWE)</th>
                <th className="p-3">T° Surface</th>
                <th className="p-3">Continuité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {observatory.altitudeLayers.map((l, i) => (
                <tr key={i} className="hover:bg-cyan-950/20 transition">
                  <td className="p-3 font-bold text-white">{l.label}</td>
                  <td className="p-3 font-semibold text-cyan-400">{l.altitudeMeters} m</td>
                  <td className="p-3 font-black text-xl text-white">{l.snowDepthCm} cm</td>
                  <td className="p-3 font-bold text-blue-300">{l.freshSnow24hCm > 0 ? `+${l.freshSnow24hCm} cm` : '0 cm'}</td>
                  <td className="p-3 font-bold text-blue-400">{l.freshSnow72hCm > 0 ? `+${l.freshSnow72hCm} cm` : '0 cm'}</td>
                  <td className="p-3 font-bold text-indigo-300">{l.freshSnow7DaysCm > 0 ? `+${l.freshSnow7DaysCm} cm` : '0 cm'}</td>
                  <td className="p-3 font-semibold text-cyan-200">{l.snowQuality}</td>
                  <td className="p-3 text-slate-400">{l.densityKgM3} kg/m³</td>
                  <td className="p-3 font-bold text-emerald-400">{l.sweWaterEquivalentMm} mm</td>
                  <td className="p-3 text-cyan-300">{l.snowTemperatureSurfaceC}°C</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.isContinuousSnowpack ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {l.isContinuousSnowpack ? 'Continu' : 'Discontinu'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-tab: Snow Type Physics & Diagnostic T0 */}
      {subTab === 'SNOW_TYPE_PHYSICS' && observatory.snowTypeDiagnostic && (
        <div className="space-y-5">
          {/* Main Hero Card for Snow Type Physics */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-5 border border-indigo-500/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900/50 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> Analyse Physico-Atmosphérique Avancée du Type de Neige (Isotherme T0)
                </span>
                <h4 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                  <span>{observatory.snowTypeDiagnostic.emoji}</span>
                  <span>{observatory.snowTypeDiagnostic.title}</span>
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-900/60 text-indigo-200 border border-indigo-500/30">
                  Code : {observatory.snowTypeDiagnostic.typeCode}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-900/60 text-cyan-200 border border-cyan-500/30">
                  {observatory.snowTypeDiagnostic.subtitle}
                </span>
              </div>
            </div>

            {/* Warning Banners for Inversion or Graupel */}
            {observatory.snowTypeDiagnostic.typeCode === 'PLUIE_VERGLACANTE_VERGLAS' && (
              <div className="rounded-xl bg-amber-950/80 border border-amber-500/50 p-3 flex items-center gap-3 text-amber-200 text-xs font-bold">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>ALERTE INVERSION THERMIQUE / PLUIE VERGLAÇANTE :</strong> Une couche d'air chaud en altitude refond les flocons avant surfusion au sol. Risque de verglas massif.
                </span>
              </div>
            )}
            {observatory.snowTypeDiagnostic.typeCode === 'NEIGE_ROULEE_GRAUPEL' && (
              <div className="rounded-xl bg-purple-950/80 border border-purple-500/50 p-3 flex items-center gap-3 text-purple-200 text-xs font-bold">
                <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <span>
                  <strong>INSTABILITÉ CONVECTIVE / GRÉSIL & GRAUPEL :</strong> Forte ascendance dans nuage convectif instable entraînant un givrage intense des cristaux (neige roulée).
                </span>
              </div>
            )}

            {/* Microphysical Mechanism Description */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="text-indigo-300 font-bold uppercase tracking-wider block">Mécanisme de Cristallisation & Microphysique :</span>
              <p>{observatory.snowTypeDiagnostic.thermalContextExplanation}</p>
            </div>

            {/* Grid of Key Physical Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-cyan-400" /> Densité du Manteau
                </span>
                <p className="text-lg font-black text-cyan-300">{observatory.snowTypeDiagnostic.densityKgM3} <span className="text-xs font-normal text-slate-400">kg/m³</span></p>
                <p className="text-[11px] text-slate-500">Masse volumique mesurée</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-400" /> Ratio Neige / Eau (SLR)
                </span>
                <p className="text-lg font-black text-blue-300">1:{observatory.snowTypeDiagnostic.snowToLiquidRatio}</p>
                <p className="text-[11px] text-slate-500">{observatory.snowTypeDiagnostic.slrLabel}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Snowflake className="h-3.5 w-3.5 text-indigo-400" /> Structure Cristalline
                </span>
                <p className="text-xs font-bold text-indigo-200 mt-1">{observatory.snowTypeDiagnostic.crystalName}</p>
                <p className="text-[11px] text-slate-500">Croissance dans le nuage à {observatory.snowTypeDiagnostic.cloudGrowthZoneTempC}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-amber-400" /> Cohésion & Collant
                </span>
                <p className="text-xs font-bold text-amber-300 mt-1">{observatory.snowTypeDiagnostic.structuralCohesion}</p>
                <p className="text-[11px] text-slate-500">Charge arbres/toits : {observatory.snowTypeDiagnostic.electricalTreeWeightRiskScore}/100</p>
              </div>
            </div>

            {/* Impact Cards: Ski, Driving, Avalanche */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Qualité Ski & Glisse
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    {observatory.snowTypeDiagnostic.skiabilityIndex}/100
                  </span>
                </div>
                <p className="text-slate-200 font-medium">{observatory.snowTypeDiagnostic.crystalDescription}</p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Car className="h-4 w-4" /> Sécurité Routière & Adhérence
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-950 text-amber-300 border border-amber-500/40">
                    {observatory.snowTypeDiagnostic.roadAdhesionIndex}/100
                  </span>
                </div>
                <p className="text-slate-200 font-medium">
                  {observatory.snowTypeDiagnostic.actionableRecommendations?.[0] || "Ajuster les équipements de conduite."}
                </p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Risque Instabilité / Avalanche
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-500/40">
                    Nivologie
                  </span>
                </div>
                <p className="text-slate-200 font-medium">{observatory.snowTypeDiagnostic.avalancheLayerRisk}</p>
              </div>
            </div>
          </div>

          {/* Breakdown per Altitude Layer */}
          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Diagnostic Détaillé du Type de Neige par Étage Altitudinal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {observatory.altitudeLayers.map((layer, idx) => {
                const diag = layer.snowTypeDiagnostic;
                if (!diag) return null;
                return (
                  <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
                      <span className="text-white">{layer.label}</span>
                      <span className="text-cyan-400 font-black">{layer.altitudeMeters} m</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300 flex items-center gap-1">
                        <span>{diag.emoji}</span> {diag.title}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {layer.snowTemperatureSurfaceC > 0 ? `+${layer.snowTemperatureSurfaceC}` : layer.snowTemperatureSurfaceC}°C
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                      {diag.thermalContextExplanation}
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Densité : <strong className="text-slate-200">{diag.densityKgM3} kg/m³</strong></span>
                      <span>Ratio SLR : <strong className="text-blue-300">1:{diag.snowToLiquidRatio}</strong></span>
                      <span>Ski : <strong className="text-emerald-400">{diag.skiabilityIndex}/100</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Multi-Year Historical Seasons (1950 to 2026) */}
      {subTab === 'HISTORICAL_SEASONS' && (
        <div className="space-y-4">
          {/* Search bar & filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span><strong>{observatory.historicalSeasons.length} Hivers Documentés</strong> (1950 à 2026)</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une année (ex: 1956, 1985, 2012, 1999)..."
                value={historySearchYear}
                onChange={(e) => setHistorySearchYear(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Historical Chart of Snow Depth & Seasons */}
          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Évolution de l'Enneigement Maximal et des Jours de Neige (1995-2026)</span>
              <span className="text-cyan-400">Normale 1991-2020 de référence</span>
            </h4>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} interval={2} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                  <Bar dataKey="maxDepth" name="Épaisseur Max Enregistrée (cm)" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                  <Line type="monotone" dataKey="daysGt1cm" name="Jours avec neige au sol >1cm" stroke="#a855f7" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="daysGt10cm" name="Jours avec neige >10cm" stroke="#34d399" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-900/95 border-b border-slate-800 z-10 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Saison Hivernale</th>
                  <th className="p-3">Cumul Neige Saison</th>
                  <th className="p-3">Épaisseur Max (cm)</th>
                  <th className="p-3">Date Record</th>
                  <th className="p-3">Jours Neige &gt;1cm</th>
                  <th className="p-3">Jours Neige &gt;10cm</th>
                  <th className="p-3">Jours Neige &gt;30cm</th>
                  <th className="p-3">1ère Neige</th>
                  <th className="p-3">Dernière Neige</th>
                  <th className="p-3">Anomalie vs Normale</th>
                  <th className="p-3">Caractère de l'Hiver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredSeasons.map((s, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => setSelectedSeason(s)}
                    className={`hover:bg-cyan-950/30 cursor-pointer transition ${
                      s.isRecordSnowy ? 'bg-cyan-950/20 font-bold text-cyan-200' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <span>{s.seasonLabel}</span>
                      {s.isRecordSnowy && (
                        <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.2 rounded border border-cyan-500/40">
                          Record
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-black text-cyan-300">{s.totalSnowfallSeasonCm} cm</td>
                    <td className="p-3 font-black text-white">{s.maxSnowDepthRecordedCm} cm</td>
                    <td className="p-3 text-slate-400">{s.maxSnowDepthDate}</td>
                    <td className="p-3 font-bold text-purple-300">{s.daysWithSnowCoverGt1cm} j</td>
                    <td className="p-3 font-bold text-blue-300">{s.daysWithSnowCoverGt10cm} j</td>
                    <td className="p-3 font-bold text-indigo-300">{s.daysWithSnowCoverGt30cm} j</td>
                    <td className="p-3 text-slate-400">{s.firstSnowDate}</td>
                    <td className="p-3 text-slate-400">{s.lastSnowDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.snowAnomalyVs1991_2020Pct > 20 
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' 
                          : s.snowAnomalyVs1991_2020Pct < -20 
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40' 
                            : 'bg-slate-800 text-slate-300'
                      }`}>
                        {s.snowAnomalyVs1991_2020Pct > 0 ? `+${s.snowAnomalyVs1991_2020Pct}%` : `${s.snowAnomalyVs1991_2020Pct}%`}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 max-w-[280px] truncate">{s.winterCharacter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Avalanche Hazard BERA */}
      {subTab === 'AVALANCHE_BERA' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/80 p-5 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bulletin d'Estimation du Risque d'Avalanche (BERA)
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  Massif : {observatory.massifName}
                </h4>
              </div>
              <span className={`px-4 py-1.5 rounded-2xl text-sm font-black border ${observatory.avalancheReport.color}`}>
                Risque {observatory.avalancheReport.dangerLabel}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {observatory.avalancheReport.beraBulletinSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Versants Critiques & Pièges Nivologiques</span>
                </h5>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {observatory.avalancheReport.primaryRiskTypes.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <p className="text-slate-400 pt-1">
                  <strong>Expositions dangereuses :</strong> {observatory.avalancheReport.criticalExposures.join(', ')}
                </p>
                <p className="text-slate-400">
                  <strong>Altitudes vulnérables :</strong> {observatory.avalancheReport.criticalAltitudes}
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Versants Favorables & Consignes de Sécurité</span>
                </h5>
                <p className="text-slate-300">
                  <strong>Expositions plus stables :</strong> {observatory.avalancheReport.favorableExposures.join(', ')}
                </p>
                <div className="bg-slate-950 p-3 rounded-lg text-slate-400 space-y-1">
                  <p>• DVA (Détecteur de Victimes d'Avalanches), Pelle et Sonde obligatoires.</p>
                  <p>• Consulter le BERA quotidien avant tout engagement hors-piste.</p>
                  <p>• Respecter les distances de sécurité à la montée comme à la descente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
