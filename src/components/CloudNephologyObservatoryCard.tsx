import React, { useState, useMemo } from 'react';
import { LocationPoint, CurrentWeather, HourlyForecast } from '../types/weather';
import { 
  generate48hCloudNephologySounding, 
  CloudHourlyDetailed48h, 
  CLOUD_GENERA_ATLAS, 
  CLOUD_SPECIES_ATLAS, 
  CLOUD_SUPPLEMENTARY_FEATURES,
  CloudGenusAtlasItem 
} from '../services/cloudNephology48hService';
import { 
  Cloud, 
  CloudSun, 
  Sun, 
  Layers, 
  Eye, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  Plane, 
  Mountain, 
  Clock, 
  Calendar, 
  Maximize2, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  Zap, 
  Thermometer, 
  Droplets, 
  Compass, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wind, 
  Gauge, 
  Filter, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

interface CloudNephologyObservatoryCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourlyForecasts?: HourlyForecast[];
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const CloudNephologyObservatoryCard: React.FC<CloudNephologyObservatoryCardProps> = ({
  station,
  weather,
  hourlyForecasts = [],
  seniorMode,
  tempUnit = 'C'
}) => {
  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'SOUNDING_48H' | 'VERTICAL_CROSS_SECTION' | 'TABLE_METAR' | 'ATLAS_GENERA' | 'OPTICAL_LUMINANCE'>('SOUNDING_48H');
  const [timeFilter, setTimeFilter] = useState<'48H' | 'DAY_1' | 'DAY_2'>('48H');
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);
  const [selectedGenus, setSelectedGenus] = useState<CloudGenusAtlasItem>(CLOUD_GENERA_ATLAS[0]);
  const [genusFamilyFilter, setGenusFamilyFilter] = useState<'ALL' | 'HAUT' | 'MOYEN' | 'BAS' | 'CONVECTIF'>('ALL');
  const [showAdvancedPhysics, setShowAdvancedPhysics] = useState<boolean>(false);

  // Generate complete 48h sounding data
  const soundingData = useMemo(() => {
    return generate48hCloudNephologySounding(station, weather, hourlyForecasts);
  }, [station, weather, hourlyForecasts]);

  // Filtered hours based on timeFilter
  const displayedHours = useMemo(() => {
    if (timeFilter === 'DAY_1') {
      return soundingData.hourly48h.slice(0, 24);
    } else if (timeFilter === 'DAY_2') {
      return soundingData.hourly48h.slice(24, 48);
    }
    return soundingData.hourly48h;
  }, [soundingData, timeFilter]);

  const selectedHour: CloudHourlyDetailed48h = soundingData.hourly48h[selectedHourIndex] || soundingData.hourly48h[0];

  // Filtered Genera for Atlas
  const filteredGenera = useMemo(() => {
    if (genusFamilyFilter === 'ALL') return CLOUD_GENERA_ATLAS;
    return CLOUD_GENERA_ATLAS.filter(g => g.family === genusFamilyFilter);
  }, [genusFamilyFilter]);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  // Prepare chart dataset for cross-section
  const crossSectionChartData = useMemo(() => {
    return displayedHours.map((h) => ({
      hourLabel: `${h.dayOfWeek} ${h.hourLabel}`,
      hourIndex: h.hourIndex,
      timeString: h.timeString,
      totalCover: h.totalCloudCoverPct,
      totalOctas: h.totalCloudCoverOctas,
      lowBase: h.lowCloud.octas > 0 ? h.lowCloud.baseMeters : 0,
      lowTop: h.lowCloud.octas > 0 ? h.lowCloud.topMeters : 0,
      lowThickness: h.lowCloud.octas > 0 ? h.lowCloud.thicknessMeters : 0,
      midBase: h.midCloud.octas > 0 ? h.midCloud.baseMeters : 0,
      midTop: h.midCloud.octas > 0 ? h.midCloud.topMeters : 0,
      midThickness: h.midCloud.octas > 0 ? h.midCloud.thicknessMeters : 0,
      highBase: h.highCloud.octas > 0 ? h.highCloud.baseMeters : 0,
      highTop: h.highCloud.octas > 0 ? h.highCloud.topMeters : 0,
      highThickness: h.highCloud.octas > 0 ? h.highCloud.thicknessMeters : 0,
      isotherm0: h.isotherm0Meters,
      snowRainLimit: h.snowRainLimitMeters,
      groundSnowLimit: h.groundSnowLimitMeters,
      ceiling: h.ceilingMeters < 9000 ? h.ceilingMeters : null,
      directSolar: h.directSolarTransmissionPct,
      isConvective: h.isConvective,
      convectiveTop: h.convectiveTopMeters,
      cloudTopMax: h.cloudTopMaxMeters,
      emoji: h.primaryWmoEmoji,
      metar: h.syntheticMetarGroup
    }));
  }, [displayedHours]);

  return (
    <div className="rounded-3xl border border-sky-500/30 bg-slate-950/85 p-4 sm:p-6 shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      
      {/* Header & Observatoire Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <Cloud className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Observatoire Néphologique &amp; Nuages 48h
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Sondage Vertical 0-12 000m • OMM &amp; METAR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Station de {station.name} ({station.altitude} m) • Décomposition physique par étages, LCL, base/sommet, givrage &amp; atlas
            </p>
          </div>
        </div>

        {/* 48h Key Metrics Quick Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Nébulosité 48h :</span>
            <span className="font-black text-sky-300">{soundingData.averageCover48hPct}% ({Math.round(soundingData.averageCover48hPct / 12.5)}/8)</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Plafond mini :</span>
            <span className={`font-black ${soundingData.lowestCeilingMeters < 300 ? 'text-rose-400' : 'text-emerald-300'}`}>
              {soundingData.lowestCeilingMeters < 9000 ? `${soundingData.lowestCeilingMeters} m` : 'Illimité'}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sommet max :</span>
            <span className="font-black text-indigo-300">{soundingData.highestCloudTopMeters} m (FL{Math.round(soundingData.highestCloudTopMeters/30.48)})</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (Low ceiling, In-cloud Icing, Convective Cb) */}
      {(soundingData.hasLowCeilingAlert || soundingData.hasIcingAlert || soundingData.hasConvectiveThreat || soundingData.hasMountainObscurationThreat) && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Alertes Aérologiques &amp; Plafond Nuageux sur les 48 Prochaines Heures :</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-slate-300">
            {soundingData.hasLowCeilingAlert && (
              <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30">
                <span className="font-bold text-rose-300 block">⚠️ Plafond Très Bas (&lt;300m)</span>
                <span className="text-[11px] text-slate-400">{soundingData.lowCeilingAlertTimeRange}</span>
              </div>
            )}
            {soundingData.hasIcingAlert && (
              <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="font-bold text-indigo-300 block">🧊 Risque Givrage en Couche</span>
                <span className="text-[11px] text-slate-400">{soundingData.icingAlertTimeRange}</span>
              </div>
            )}
            {soundingData.hasConvectiveThreat && (
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <span className="font-bold text-purple-300 block">⚡ Bourgeonnement Convectif (Cb)</span>
                <span className="text-[11px] text-slate-400">{soundingData.convectiveThreatTimeRange}</span>
              </div>
            )}
            {soundingData.hasMountainObscurationThreat && (
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                <span className="font-bold text-amber-300 block">🏔️ Sommets en Nuage</span>
                <span className="text-[11px] text-slate-400">Plafond au niveau du relief local</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('SOUNDING_48H')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'SOUNDING_48H'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Timeline 48h Heure par Heure</span>
          </button>

          <button
            onClick={() => setActiveTab('VERTICAL_CROSS_SECTION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'VERTICAL_CROSS_SECTION'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Coupe Verticale 0-12 000m</span>
          </button>

          <button
            onClick={() => setActiveTab('TABLE_METAR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'TABLE_METAR'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plane className="h-3.5 w-3.5" />
            <span>Tableau METAR &amp; Aérologie</span>
          </button>

          <button
            onClick={() => setActiveTab('ATLAS_GENERA')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'ATLAS_GENERA'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Atlas des 10 Genres OMM</span>
          </button>

          <button
            onClick={() => setActiveTab('OPTICAL_LUMINANCE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'OPTICAL_LUMINANCE'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Optique, Halo &amp; Luminance</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 48H HOURLY TIMELINE SOUNDING CARDS & DRILL-DOWN                    */}
      {/* ========================================================================= */}
      {activeTab === 'SOUNDING_48H' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Active Selected Hour Drill-down Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-sky-950/40 border border-sky-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedHour.primaryWmoEmoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Sondage Néphologique à {selectedHour.timeString} • {selectedHour.fullDate}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      H+{selectedHour.hourOffset}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {selectedHour.skyDescription}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Couverture Céleste</span>
                  <span className="text-base font-black text-sky-400">
                    {selectedHour.totalCloudCoverPct}% ({selectedHour.totalCloudCoverOctas}/8)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">METAR Simulé</span>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400">
                    {selectedHour.syntheticMetarGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-Tier Layer Decomposition Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Étage Bas (0-2000m) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                    Étage Bas (0 - 2 000 m)
                  </span>
                  <span className="font-bold text-slate-200">{selectedHour.lowCloud.coverPct}% ({selectedHour.lowCloud.octas}/8)</span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Genre dominant :</span>
                    <span className="font-bold text-white">{selectedHour.lowCloud.dominantGenusLatin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Base / LCL :</span>
                    <span className="font-bold text-sky-300">{selectedHour.lowCloud.baseMeters} m ({Math.round(selectedHour.lowCloud.baseMeters * 3.28)} ft)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sommet :</span>
                    <span className="font-bold text-slate-200">{selectedHour.lowCloud.topMeters} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Microphysique :</span>
                    <span className="text-[11px] text-teal-300">{selectedHour.lowCloud.microphysicsPhase}</span>
                  </div>
                </div>
              </div>

              {/* Étage Moyen (2000-6000m) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                    Étage Moyen (2 000 - 6 000 m)
                  </span>
                  <span className="font-bold text-slate-200">{selectedHour.midCloud.coverPct}% ({selectedHour.midCloud.octas}/8)</span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Genre dominant :</span>
                    <span className="font-bold text-white">{selectedHour.midCloud.dominantGenusLatin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Base estimée :</span>
                    <span className="font-bold text-sky-300">{selectedHour.midCloud.baseMeters} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sommet :</span>
                    <span className="font-bold text-slate-200">{selectedHour.midCloud.topMeters} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Microphysique :</span>
                    <span className="text-[11px] text-blue-300">{selectedHour.midCloud.microphysicsPhase}</span>
                  </div>
                </div>
              </div>

              {/* Étage Élevé (6000-12000m) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                    Étage Élevé (6 000 - 12 000 m)
                  </span>
                  <span className="font-bold text-slate-200">{selectedHour.highCloud.coverPct}% ({selectedHour.highCloud.octas}/8)</span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Genre dominant :</span>
                    <span className="font-bold text-white">{selectedHour.highCloud.dominantGenusLatin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Base estimée :</span>
                    <span className="font-bold text-sky-300">{selectedHour.highCloud.baseMeters} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sommet :</span>
                    <span className="font-bold text-slate-200">{selectedHour.highCloud.topMeters} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Microphysique :</span>
                    <span className="text-[11px] text-indigo-300">{selectedHour.highCloud.microphysicsPhase}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Aerological Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Plafond Opérationnel</span>
                <span className={`font-bold ${selectedHour.ceilingMeters < 300 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {selectedHour.ceilingMeters < 9000 ? `${selectedHour.ceilingMeters} m (${selectedHour.ceilingFeet} ft)` : 'Illimité'}
                </span>
                <span className="text-[10px] text-slate-400 block">{selectedHour.ceilingStatus}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Isotherme 0°C &amp; LPN</span>
                <span className="font-bold text-cyan-300">0°C à {selectedHour.isotherm0Meters} m</span>
                <span className="text-[10px] font-bold text-teal-300 block">
                  LPN : {selectedHour.snowRainLimitMeters} m (LTN {selectedHour.groundSnowLimitMeters} m)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Transmission Rayonnement</span>
                <span className="font-bold text-amber-300">{selectedHour.directSolarTransmissionPct}% direct</span>
                <span className="text-[10px] text-slate-400 block">{selectedHour.opticalThickness}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Givrage &amp; Épaisseur</span>
                <span className="font-bold text-indigo-300">{selectedHour.totalCloudThicknessMeters} m de nuage</span>
                <span className={`text-[10px] font-bold block ${selectedHour.icingRiskLevel === 'SÉVÈRE' ? 'text-rose-400' : selectedHour.icingRiskLevel === 'MODÉRÉ' ? 'text-amber-400' : 'text-slate-400'}`}>
                  Givrage : {selectedHour.icingRiskLevel} ({selectedHour.icingAltitudeRange})
                </span>
              </div>
            </div>

            {/* Microphysics Cloud <-> LPN & Precipitation Phase Correlation Banner */}
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Mountain className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Liaison Néphologie &amp; Limite Pluie-Neige :
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    {selectedHour.cloudBaseVsLpnRelation}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-cyan-200 border border-cyan-400/40 text-[11px] font-bold">
                  Phase Station : {selectedHour.precipitationPhaseAtStation}
                </span>
                {selectedHour.isothermieRisk && (
                  <span className="px-2 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Isothermie active (-{selectedHour.isothermieDropMeters}m)
                  </span>
                )}
              </div>
            </div>

            {/* Photometeor note if any */}
            {selectedHour.photometeorPossibility && !selectedHour.photometeorPossibility.startsWith('Aucun') && (
              <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-2 text-xs text-sky-200">
                <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
                <span><strong>Phénomène Optique Céleste :</strong> {selectedHour.photometeorPossibility}</span>
              </div>
            )}
          </div>

          {/* Horizontal Scrollable 48h Hourly Carousel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-sky-400" />
                Sélectionnez une heure pour inspecter le sondage (0 à 48h) :
              </h4>
              <span className="text-[11px] text-slate-400">
                {displayedHours.length} échéances horaires
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {displayedHours.map((h) => {
                const isSelected = selectedHourIndex === h.hourIndex;
                return (
                  <button
                    key={h.hourIndex}
                    onClick={() => setSelectedHourIndex(h.hourIndex)}
                    className={`shrink-0 p-3 rounded-2xl border transition-all text-left w-28 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30 ring-2 ring-sky-400'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold">{h.hourLabel}</span>
                      <span className="text-[10px] opacity-75">{h.dayOfWeek}</span>
                    </div>

                    <div className="my-1.5 text-center">
                      <span className="text-xl block">{h.primaryWmoEmoji}</span>
                      <span className="text-xs font-bold block mt-0.5">{h.totalCloudCoverPct}%</span>
                      <span className="text-[10px] text-sky-300 font-semibold">{h.totalCloudCoverOctas}/8 oct</span>
                    </div>

                    <div className="text-[9px] text-center truncate opacity-80 border-t border-slate-700/60 pt-1">
                      {h.lowCloud.dominantGenus}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VERTICAL ATMOSPHERIC CROSS-SECTION (COUPE 0-12 000 M)               */}
      {/* ========================================================================= */}
      {activeTab === 'VERTICAL_CROSS_SECTION' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-sky-400" />
                  Coupe Verticale Atmosphérique Multi-Couches (0 - 12 000 m)
                </h3>
                <p className="text-xs text-slate-400">
                  Visualisation continue des bases et sommets des nuages par étage (Bas, Moyen, Haut) avec isotherme 0°C
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1 text-teal-300 font-bold">
                  <span className="h-2.5 w-2.5 rounded-sm bg-teal-500"></span> Étage Bas
                </span>
                <span className="flex items-center gap-1 text-blue-300 font-bold">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-500"></span> Étage Moyen
                </span>
                <span className="flex items-center gap-1 text-indigo-300 font-bold">
                  <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500"></span> Étage Haut
                </span>
                <span className="flex items-center gap-1 text-cyan-300 font-bold">
                  <span className="h-0.5 w-3 bg-cyan-400"></span> Isotherme 0°C
                </span>
                <span className="flex items-center gap-1 text-emerald-300 font-bold">
                  <span className="h-0.5 w-3 bg-emerald-400"></span> LPN (Pluie/Neige)
                </span>
              </div>
            </div>

            {/* Altitude Cross Section Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={crossSectionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="hourLabel" stroke="#94a3b8" fontSize={10} interval="preserveStartEnd" />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 12000]} unit="m" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-2xl bg-slate-950/95 border border-sky-500/40 text-xs shadow-2xl space-y-1.5 min-w-[200px]">
                            <p className="font-bold text-white flex items-center justify-between border-b border-slate-800 pb-1">
                              <span>{label}</span>
                              <span>{d.emoji} {d.totalCover}% ({d.totalOctas}/8)</span>
                            </p>
                            <div className="space-y-1 text-slate-300">
                              <p className="flex justify-between text-teal-300">
                                <span>Étage Bas:</span>
                                <span>{d.lowBase}m - {d.lowTop}m</span>
                              </p>
                              <p className="flex justify-between text-blue-300">
                                <span>Étage Moyen:</span>
                                <span>{d.midBase}m - {d.midTop}m</span>
                              </p>
                              <p className="flex justify-between text-indigo-300">
                                <span>Étage Haut:</span>
                                <span>{d.highBase}m - {d.highTop}m</span>
                              </p>
                              <p className="flex justify-between text-cyan-300 font-bold border-t border-slate-800 pt-1">
                                <span>Isotherme 0°C:</span>
                                <span>{d.isotherm0}m</span>
                              </p>
                              <p className="flex justify-between text-emerald-300 font-bold">
                                <span>Limite Pluie-Neige:</span>
                                <span>{d.snowRainLimit}m</span>
                              </p>
                              {d.ceiling && (
                                <p className="flex justify-between text-amber-300 font-bold">
                                  <span>Plafond:</span>
                                  <span>{d.ceiling}m</span>
                                </p>
                              )}
                              <p className="text-[10px] text-emerald-400 font-mono">
                                METAR: {d.metar}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* High Clouds Band */}
                  <Area type="monotone" dataKey="highTop" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} />
                  {/* Mid Clouds Band */}
                  <Area type="monotone" dataKey="midTop" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.35} />
                  {/* Low Clouds Band */}
                  <Area type="monotone" dataKey="lowTop" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.5} />
                  {/* 0°C Isotherm line */}
                  <Line type="monotone" dataKey="isotherm0" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Isotherme 0°C" />
                  {/* Snow-Rain Limit line */}
                  <Line type="monotone" dataKey="snowRainLimit" stroke="#34d399" strokeWidth={2} dot={false} strokeDasharray="2 2" name="LPN (m)" />
                  {/* Station Ground Level Line */}
                  <ReferenceLine y={station.altitude} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Sol (${station.altitude}m)`, fill: '#f59e0b', fontSize: 10 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Nebulosity & Direct Solar Transmission Curve */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-400" />
                Nébulosité Globale (%) vs Transmission Solaire Directe (%)
              </h4>
              <span className="text-xs text-slate-400">Impact photovoltaïque &amp; ensoleillement effectif</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={crossSectionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="hourLabel" stroke="#94a3b8" fontSize={10} interval="preserveStartEnd" />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} unit="%" />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalCover" name="Couverture Nuageuse (%)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                  <Line type="monotone" dataKey="directSolar" name="Rayonnement Direct Transmis (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TABLEAU METAR & AÉROLOGIE EXPERTE                                  */}
      {/* ========================================================================= */}
      {activeTab === 'TABLE_METAR' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plane className="h-4 w-4 text-sky-400" />
              Tableau Heure par Heure de Synthèse Aérologique &amp; Codes METAR
            </h3>
            <span className="text-xs text-slate-400">
              Format OACI / OMM pour l'aviation VFR &amp; IFR
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Heure</th>
                  <th className="py-3 px-2">Ciel</th>
                  <th className="py-3 px-3">Total (Octas)</th>
                  <th className="py-3 px-3">Plafond (m)</th>
                  <th className="py-3 px-3">Étage Bas</th>
                  <th className="py-3 px-3">Étage Moyen</th>
                  <th className="py-3 px-3">Étage Haut</th>
                  <th className="py-3 px-3">Isoth. 0°C</th>
                  <th className="py-3 px-3">LPN (m)</th>
                  <th className="py-3 px-3">Phase Station</th>
                  <th className="py-3 px-3">Givrage</th>
                  <th className="py-3 px-3 font-mono">Groupe METAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {displayedHours.map((h) => {
                  return (
                    <tr 
                      key={h.hourIndex}
                      onClick={() => {
                        setSelectedHourIndex(h.hourIndex);
                        setActiveTab('SOUNDING_48H');
                      }}
                      className="hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        {h.dayOfWeek} {h.hourLabel}
                      </td>
                      <td className="py-2.5 px-2 text-lg">
                        {h.primaryWmoEmoji}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-sky-300">{h.totalCloudCoverPct}%</span>
                        <span className="text-[10px] text-slate-400 block">{h.totalCloudCoverOctas}/8 oct</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${h.ceilingMeters < 300 ? 'text-rose-400' : 'text-slate-200'}`}>
                          {h.ceilingMeters < 9000 ? `${h.ceilingMeters}m` : 'Illimité'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-teal-300">
                        {h.lowCloud.octas > 0 ? `${h.lowCloud.dominantGenus} (${h.lowCloud.baseMeters}m)` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-blue-300">
                        {h.midCloud.octas > 0 ? `${h.midCloud.dominantGenus} (${h.midCloud.baseMeters}m)` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-indigo-300">
                        {h.highCloud.octas > 0 ? `${h.highCloud.dominantGenus} (${h.highCloud.baseMeters}m)` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300 font-bold">
                        {h.isotherm0Meters}m
                      </td>
                      <td className="py-2.5 px-3 font-bold text-teal-300">
                        {h.snowRainLimitMeters}m
                        <span className="text-[10px] text-slate-400 block font-normal">LTN {h.groundSnowLimitMeters}m</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs font-semibold text-slate-200">
                          {h.precipitationPhaseAtStation}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.icingRiskLevel === 'SÉVÈRE' ? 'bg-rose-500/20 text-rose-300' :
                          h.icingRiskLevel === 'MODÉRÉ' ? 'bg-amber-500/20 text-amber-300' :
                          h.icingRiskLevel === 'FAIBLE' ? 'bg-blue-500/20 text-blue-300' :
                          'text-slate-500'
                        }`}>
                          {h.icingRiskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400 font-bold whitespace-nowrap">
                        {h.syntheticMetarGroup}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ATLAS DES 10 GENRES OMM & ESPÈCES REMARQUABLES                     */}
      {/* ========================================================================= */}
      {activeTab === 'ATLAS_GENERA' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1">Filtrer par étage :</span>
              {(['ALL', 'HAUT', 'MOYEN', 'BAS', 'CONVECTIF'] as const).map((fam) => (
                <button
                  key={fam}
                  onClick={() => setGenusFamilyFilter(fam)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    genusFamilyFilter === fam
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {fam === 'ALL' ? 'Tous (10 Genres)' : fam}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Genus Spotlight Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedGenus.iconEmoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedGenus.latinName} ({selectedGenus.frenchName})</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${selectedGenus.badgeBg} ${selectedGenus.badgeText} ${selectedGenus.badgeBorder}`}>
                      {selectedGenus.abbreviation} • Étage {selectedGenus.family}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    {selectedGenus.visualDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Altitudes Typiques :</span>
                  <p className="text-slate-200">Base: <strong className="text-sky-300">{selectedGenus.typicalBaseMeters}</strong> | Sommet: <strong className="text-indigo-300">{selectedGenus.typicalTopMeters}</strong></p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Composition Microphysique :</span>
                  <p className="text-slate-200">{selectedGenus.composition}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Précipitations Associées :</span>
                  <p className="text-slate-200">{selectedGenus.precipitationType}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Signification Météorologique &amp; Synoptique :</span>
                  <p className="text-slate-200">{selectedGenus.significance}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Dangers Aéronautiques &amp; Montagne :</span>
                  <p className="text-slate-200">{selectedGenus.aviationHazard}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Espèces Principales :</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedGenus.varieties.map((v) => (
                      <span key={v} className="px-2 py-0.5 rounded-lg bg-sky-950/50 border border-sky-500/30 text-sky-200 text-[11px] font-mono">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of 10 Genera Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {filteredGenera.map((g) => {
              const isSelected = selectedGenus.id === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenus(g)}
                  className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600/30 border-sky-400 shadow-lg shadow-sky-600/20 ring-1 ring-sky-400'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{g.iconEmoji}</span>
                    <span className="font-mono font-bold text-xs text-sky-300">{g.abbreviation}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-2">{g.latinName}</h4>
                  <p className="text-[10px] text-slate-400">{g.frenchName}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950 border border-slate-700 text-slate-300">
                    {g.family}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Species & Supplementary Features Encyclopedia */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Espèces Nuageuses &amp; Particularités Remarquables (Mammatus, Lenticularis, Arcus...)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {CLOUD_SPECIES_ATLAS.map((sp) => (
                <div key={sp.nameLatin} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-sky-300 font-mono">{sp.nameLatin}</strong>
                    <span className="text-[10px] text-slate-400">{sp.nameFrench}</span>
                  </div>
                  <p className="text-slate-300">{sp.characteristic}</p>
                  <p className="text-[11px] text-amber-300/90 italic">🔎 {sp.identifyingFeature}</p>
                  <p className="text-[10px] text-slate-400">Sens météo: {sp.synopticMeaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OPTIQUE, HALO & LUMINANCE DU CIEL                                  */}
      {/* ========================================================================= */}
      {activeTab === 'OPTICAL_LUMINANCE' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Phénomènes Optiques &amp; Photométéores Détectés sur 48h
            </h3>
            <p className="text-xs text-slate-400">
              Prévisibilité des halos solaires de 22°, parhélies, arcs-en-ciel, spectres de Brocken et couchers de soleil flamboyants
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Halos Solaires &amp; Cristaux Cirrostratiques (22° &amp; 46°)
                </span>
                <p className="text-slate-300">
                  Générés par la réfraction de la lumière solaire à travers les prismes hexagonaux des cristaux de glace des <strong>Cirrostratus</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-sky-300 text-[11px]">
                  Opportunités prévues : {soundingData.photometeorOpportunities.join(', ') || 'Aucune fenêtre majeure détectée'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="font-bold text-sky-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Luminance Solaire &amp; Qualité de l'Ombrage
                </span>
                <p className="text-slate-300">
                  Pour l'heure actuelle ({selectedHour.hourLabel}) : <strong>{selectedHour.skyLuminanceCategory}</strong> ({selectedHour.directSolarTransmissionPct}% de lumière directe transmise).
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 text-[11px]">
                  Épaisseur optique : <strong className="text-white">{selectedHour.opticalThickness}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
