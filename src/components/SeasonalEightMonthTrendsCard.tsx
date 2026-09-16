import React, { useState, useEffect, useMemo } from 'react';
import { 
  SeasonalEightMonthTrends, 
  LocationPoint,
  SeasonalScaleLevel,
  MonthlySeasonalProjection,
  DecadeProjection
} from '../types/weather';
import { generateEightMonthSeasonalTrends } from '../services/seasonalEightMonthService';
import { 
  FRENCH_DEPARTMENTS, 
  FRENCH_REGIONS,
  findDepartmentForStation
} from '../data/frenchTerritoriesData';
import { 
  Sparkles, 
  CloudSnow, 
  ThermometerSnowflake, 
  Compass, 
  Wind, 
  Sun, 
  AlertTriangle, 
  ShieldCheck, 
  Zap,
  Globe,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Building2,
  MapPin,
  Flag,
  Search,
  BarChart3,
  Calendar,
  Layers,
  Clock,
  Lock,
  Droplets,
  Activity,
  Cpu,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

interface SeasonalEightMonthTrendsCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentAnomaly?: number;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const SeasonalEightMonthTrendsCard: React.FC<SeasonalEightMonthTrendsCardProps> = ({
  station,
  currentTemp,
  currentAnomaly,
  seniorMode,
  tempUnit = 'C'
}) => {
  // Determine default department matching the active station
  const defaultDept = useMemo(() => findDepartmentForStation(station), [station]);

  const [scaleMode, setScaleMode] = useState<SeasonalScaleLevel>('DEPARTMENT');
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(defaultDept.code);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('ARA');
  const [deptSearchQuery, setDeptSearchQuery] = useState<string>('');

  const [selectedDecadeNumber, setSelectedDecadeNumber] = useState<number>(1);
  const [expandedMonthIndex, setExpandedMonthIndex] = useState<number | null>(null);
  const [viewTab, setViewTab] = useState<
    'MONTHLY_OVERVIEW' | 'DECIMAL_GRID' | 'MULTI_MODEL_CHARTS' | 'MACRO_SYNOPTIC' | 'RISK_MATRIX' | 'SPATIAL_COMPARISON'
  >('MONTHLY_OVERVIEW');

  // Keep department aligned if station changes and in department mode
  useEffect(() => {
    const matched = findDepartmentForStation(station);
    setSelectedDeptCode(matched.code);
  }, [station]);

  // Compute seasonal data based on current scale mode
  const activeTerritoryId = scaleMode === 'NATIONAL' 
    ? 'FRANCE' 
    : scaleMode === 'REGION' 
      ? selectedRegionId 
      : selectedDeptCode;

  const seasonalData: SeasonalEightMonthTrends = useMemo(() => {
    return generateEightMonthSeasonalTrends(
      station,
      currentTemp,
      currentAnomaly,
      scaleMode,
      activeTerritoryId
    );
  }, [station, currentTemp, currentAnomaly, scaleMode, activeTerritoryId]);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  const selectedDecade = seasonalData.decades.find(d => d.decadeNumber === selectedDecadeNumber) || seasonalData.decades[0];

  // Recharts chart dataset over 24 decades
  const chartData = seasonalData.decades.map(d => ({
    name: `D${d.decadeNumber}`,
    month: d.monthName.slice(0, 3),
    decadeLabel: `${d.decadeInMonth}e déc. ${d.monthName}`,
    tempMean: d.expectedTMean,
    tempNormal: Number((d.expectedTMean - d.tempAnomalyVsNormal).toFixed(1)),
    tempAnomaly: d.tempAnomalyVsNormal,
    precipAnomaly: d.precipAnomalyPct,
    precipExpectedMm: d.expectedPrecipMm,
    precipNormalMm: d.normalPrecipMm,
    snowScore: d.snowPotentialScore,
    snowfallCm: d.expectedSnowfallCm,
    frostDays: d.frostDaysExpected,
    coldProb: d.coldWaveProbability,
    confidence: d.confidenceScore
  }));

  const getAnomalyBadge = (anom: number) => {
    if (anom >= 2.0) return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
    if (anom >= 0.8) return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    if (anom >= -0.7) return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    if (anom >= -2.0) return 'bg-sky-950/80 text-sky-300 border-sky-500/50';
    return 'bg-indigo-950/90 text-indigo-200 border-indigo-400 font-black shadow-indigo-900/40';
  };

  const getPrecipBadge = (precipPct: number) => {
    if (precipPct > 20) return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
    if (precipPct >= -15) return 'bg-slate-800 text-slate-300 border-slate-700';
    return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
  };

  // Filtered departments list for search
  const filteredDepartments = useMemo(() => {
    if (!deptSearchQuery.trim()) return FRENCH_DEPARTMENTS;
    const q = deptSearchQuery.toLowerCase().trim();
    return FRENCH_DEPARTMENTS.filter(d => 
      d.code.toLowerCase().includes(q) || 
      d.name.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.prefecture.toLowerCase().includes(q)
    );
  }, [deptSearchQuery]);

  const toggleExpandMonth = (index: number) => {
    setExpandedMonthIndex(prev => prev === index ? null : index);
  };

  return (
    <div id="seasonal-eight-month-card" className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5 space-y-4">
      
      {/* 1. 3-DAY OPERATIONAL RUN STATUS BAR (RÉACTUALISÉ TOUS LES 3 JOURS) */}
      <div className="rounded-md border border-slate-800 bg-slate-950 p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
            <Clock className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" />
                Cycle Tri-Journalier (Réactualisé tous les 3 jours)
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50 text-[10px]">
                Run Actif : {seasonalData.biDailyRun.runSlot}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculé le <strong className="text-slate-200">{seasonalData.biDailyRun.runTimestamp}</strong> • ECMWF SEAS5, Copernicus C3S &amp; Système 8
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs">
            <span className="text-slate-500 block text-[10px]">Prochain run :</span>
            <span className="text-sky-300 font-mono text-[11px]">
              {seasonalData.biDailyRun.nextRunTimestamp} (dans {seasonalData.biDailyRun.nextRunCountdownHours}h)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Header & Territorial Scale Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-800 p-2 text-sky-400 border border-slate-700 shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Modélisation Saisonnière à 8 Mois (240 Jours)</span>
              <span>•</span>
              <span className="text-slate-400">24 Décades</span>
              <span>•</span>
              <span className="text-emerald-400">Normale 1991-2020</span>
            </div>
            
            <h3 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-lg sm:text-xl'} mt-0.5 flex flex-wrap items-center gap-2`}>
              <span>{seasonalData.territoryName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold uppercase tracking-normal">
                {scaleMode === 'DEPARTMENT' ? 'Échelle Départementale' : scaleMode === 'REGION' ? 'Échelle Régionale' : 'Échelle Pays'}
              </span>
            </h3>

            <p className="text-xs text-slate-400 mt-0.5">
              {seasonalData.territorySubtitle} • Altitude moy. {seasonalData.altitudeMeters} m • Climat : {seasonalData.climateZone}
            </p>
          </div>
        </div>

        {/* Spatial Scale Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            id="scale-btn-department"
            onClick={() => setScaleMode('DEPARTMENT')}
            className={`flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
              scaleMode === 'DEPARTMENT' 
                ? 'bg-[#0284C7] text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="h-3 w-3" />
            <span>Département (101)</span>
          </button>

          <button
            id="scale-btn-region"
            onClick={() => setScaleMode('REGION')}
            className={`flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
              scaleMode === 'REGION' 
                ? 'bg-[#0284C7] text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>Région (13)</span>
          </button>

          <button
            id="scale-btn-national"
            onClick={() => setScaleMode('NATIONAL')}
            className={`flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
              scaleMode === 'NATIONAL' 
                ? 'bg-[#0284C7] text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Flag className="h-3 w-3" />
            <span>France</span>
          </button>
        </div>
      </div>

      {/* 3. Territory Selector Bar depending on Scale */}
      <div className="rounded-md bg-slate-950 border border-slate-800 p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {scaleMode === 'DEPARTMENT' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 whitespace-nowrap">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <span>Choisir un département :</span>
            </div>

            <div className="relative flex-1 max-w-md">
              <select
                id="select-department"
                value={selectedDeptCode}
                onChange={(e) => setSelectedDeptCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#0284C7] appearance-none pr-8 cursor-pointer"
              >
                {filteredDepartments.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.code} - {dept.name} ({dept.region})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrer n° ou nom..."
                value={deptSearchQuery}
                onChange={(e) => setDeptSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-md pl-8 pr-2.5 py-1 text-xs focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>
        )}

        {scaleMode === 'REGION' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 whitespace-nowrap">
              <MapPin className="h-3.5 w-3.5 text-sky-400" />
              <span>Sélectionner une région :</span>
            </div>

            <div className="relative flex-1 max-w-lg">
              <select
                id="select-region"
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#0284C7] appearance-none pr-8 cursor-pointer"
              >
                {FRENCH_REGIONS.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name} ({reg.departmentCodes.length} dépts • Chef-lieu : {reg.capital})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {scaleMode === 'NATIONAL' && (
          <div className="flex items-center gap-2 text-xs text-slate-300 w-full">
            <Flag className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="font-bold text-white">France Métropolitaine Intégrale</span>
            <span className="text-slate-400 hidden sm:inline">— Moyenne nationale pondérée des anomalies thermiques, régimes synoptiques et bilans hydriques.</span>
          </div>
        )}

        {/* View Tabs Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800 self-end md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setViewTab('MONTHLY_OVERVIEW')}
            className={`rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'MONTHLY_OVERVIEW' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>Synthèse par Mois (8 Mois)</span>
          </button>

          <button
            onClick={() => setViewTab('DECIMAL_GRID')}
            className={`rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'DECIMAL_GRID' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>24 Décades</span>
          </button>

          <button
            onClick={() => setViewTab('MULTI_MODEL_CHARTS')}
            className={`rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'MULTI_MODEL_CHARTS' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            <span>Courbes &amp; Modèles</span>
          </button>

          <button
            onClick={() => setViewTab('MACRO_SYNOPTIC')}
            className={`rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'MACRO_SYNOPTIC' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3 w-3" />
            <span>Téléconnexions</span>
          </button>

          <button
            onClick={() => setViewTab('RISK_MATRIX')}
            className={`rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'RISK_MATRIX' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Matrice Risques</span>
          </button>

          <button
            onClick={() => setViewTab('SPATIAL_COMPARISON')}
            className={`rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'SPATIAL_COMPARISON' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>Comparatif</span>
          </button>
        </div>
      </div>

      {/* Climatological Method Note & Synthesis Banner */}
      <div className="rounded-md bg-slate-950 border border-slate-800 p-3 space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="text-slate-200 font-normal leading-relaxed">
              {seasonalData.eightMonthSynthesis}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-0.5 border-t border-slate-800">
              <span><strong>Caractère Hivernal :</strong> {seasonalData.winterSummary.winterCharacter}</span>
              <span>•</span>
              <span><strong>Anomalie Neige :</strong> {seasonalData.winterSummary.expectedSnowAnomaly}</span>
              <span>•</span>
              <span><strong>Indice Risque Vague de Froid :</strong> {seasonalData.winterSummary.coldWaveRiskIndex}/100</span>
              {seasonalData.spatialComparison && (
                <>
                  <span>•</span>
                  <span><strong>Position / Moyenne France :</strong> {seasonalData.spatialComparison.relativeToNationalAverage}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MONTHLY OVERVIEW (SYNTHÈSE PAR MOIS - 8 MOIS BIEN STRUCTURÉE) */}
      {/* ========================================================================= */}
      {viewTab === 'MONTHLY_OVERVIEW' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Panorama Chronologique des 8 Prochains Mois ({seasonalData.territoryName})</span>
            </span>
            <span className="text-slate-400 font-normal">
              Cliquez sur un mois pour déplier ses 3 décades
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {seasonalData.months.map((m, idx) => {
              const isExpanded = expandedMonthIndex === idx;
              return (
                <div
                  key={`month-${idx}-${m.year}-${m.monthIndex}`}
                  className={`rounded-md border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                    isExpanded 
                      ? 'border-[#0284C7] bg-slate-900' 
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="p-3.5 space-y-2.5">
                    {/* Header: Month & Season */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                          Mois {idx + 1} / 8 • {m.season}
                        </span>
                        <h4 className="text-sm font-bold text-white">{m.monthLabel}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {m.confidenceScore}% conf.
                      </span>
                    </div>

                    {/* Temperature Anomaly Section */}
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Temp. Moyenne :</span>
                        <span className="font-bold text-white text-xs">{formatTemp(m.expectedTMean)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Normale : {formatTemp(m.normalTMean)}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getAnomalyBadge(m.tempAnomaly)}`}>
                          {m.tempAnomaly > 0 ? `+${m.tempAnomaly}` : `${m.tempAnomaly}`}°C
                        </span>
                      </div>

                      {/* Tercile Thermal Probability Gauge */}
                      <div className="pt-1 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5 font-medium">
                          <span className="text-rose-400">Chaud {m.tercilesTemp.warmPct}%</span>
                          <span className="text-slate-300">Norm. {m.tercilesTemp.normalPct}%</span>
                          <span className="text-sky-400">Froid {m.tercilesTemp.coldPct}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-800 flex overflow-hidden">
                          <div style={{ width: `${m.tercilesTemp.warmPct}%` }} className="bg-rose-500" title="Probabilité Chaud" />
                          <div style={{ width: `${m.tercilesTemp.normalPct}%` }} className="bg-slate-400" title="Probabilité Normal" />
                          <div style={{ width: `${m.tercilesTemp.coldPct}%` }} className="bg-sky-500" title="Probabilité Froid" />
                        </div>
                      </div>
                    </div>

                    {/* Precipitation Section */}
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Cumul Précip. :</span>
                        <span className="font-bold text-white text-xs">{m.expectedPrecipMm} mm</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Normale : {m.normalPrecipMm} mm</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getPrecipBadge(m.precipAnomalyPct)}`}>
                          {m.precipAnomalyPct > 0 ? `+${m.precipAnomalyPct}%` : `${m.precipAnomalyPct}%`}
                        </span>
                      </div>

                      {/* Tercile Pluvio Probability Gauge */}
                      <div className="pt-1 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5 font-medium">
                          <span className="text-sky-400">Humide {m.tercilesPrecip.wetPct}%</span>
                          <span className="text-slate-300">Norm. {m.tercilesPrecip.normalPct}%</span>
                          <span className="text-amber-400">Sec {m.tercilesPrecip.dryPct}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-800 flex overflow-hidden">
                          <div style={{ width: `${m.tercilesPrecip.wetPct}%` }} className="bg-sky-500" title="Probabilité Humide" />
                          <div style={{ width: `${m.tercilesPrecip.normalPct}%` }} className="bg-slate-400" title="Probabilité Normal" />
                          <div style={{ width: `${m.tercilesPrecip.dryPct}%` }} className="bg-amber-500" title="Probabilité Sec" />
                        </div>
                      </div>
                    </div>

                    {/* Highlights & Risks */}
                    <div className="text-[10px] text-slate-300 space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-300 font-medium truncate">
                        <Compass className="h-3 w-3 shrink-0 text-sky-400" />
                        <span className="truncate">{m.dominantSynopticRegime}</span>
                      </div>
                      <p className="text-slate-400 leading-snug line-clamp-2">
                        {m.riskSummary}
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Decades Button */}
                  <button
                    onClick={() => toggleExpandMonth(idx)}
                    className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border-t border-slate-800 text-[11px] font-semibold text-sky-400 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>{isExpanded ? 'Masquer les 3 décades' : 'Détail 3 décades'}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {/* Expanded 3 Decades Details */}
                  {isExpanded && (
                    <div className="p-2.5 bg-slate-950 border-t border-slate-800 space-y-1.5 text-xs">
                      {m.decades.map((dec) => (
                        <div 
                          key={dec.decadeNumber}
                          onClick={() => {
                            setSelectedDecadeNumber(dec.decadeNumber);
                            setViewTab('DECIMAL_GRID');
                          }}
                          className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 transition cursor-pointer space-y-0.5"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-sky-300 text-[11px]">{dec.decadeInMonth}e Décade</span>
                            <span className="text-white text-xs">{formatTemp(dec.expectedTMean)}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span>{dec.dateRangeFormatted}</span>
                            <span className={dec.tempAnomalyVsNormal > 0 ? 'text-rose-400' : 'text-sky-400'}>
                              {dec.tempAnomalyVsNormal > 0 ? `+${dec.tempAnomalyVsNormal}` : dec.tempAnomalyVsNormal}°C
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span>Précip. : {dec.expectedPrecipMm} mm ({dec.precipAnomalyPct > 0 ? `+${dec.precipAnomalyPct}%` : `${dec.precipAnomalyPct}%`})</span>
                            {dec.expectedSnowfallCm > 0 && (
                              <span className="text-sky-300 font-semibold flex items-center gap-0.5">
                                <CloudSnow className="h-2.5 w-2.5" /> {dec.expectedSnowfallCm}cm
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 24 DECADES INTERACTIVE GRID */}
      {/* ========================================================================= */}
      {viewTab === 'DECIMAL_GRID' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {seasonalData.decades.map((d) => {
              const isSelected = selectedDecade.decadeNumber === d.decadeNumber;
              return (
                <button
                  key={d.decadeNumber}
                  onClick={() => setSelectedDecadeNumber(d.decadeNumber)}
                  className={`flex flex-col text-left p-2 rounded-md border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0284C7] bg-slate-900'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-0.5">
                    <span>Déc. {d.decadeNumber}</span>
                    <span className="text-sky-400">{d.monthName.slice(0, 3)}</span>
                  </div>

                  <div className="font-semibold text-white text-xs truncate">
                    {d.decadeInMonth}e Déc. {d.monthName.slice(0, 4)}.
                  </div>

                  <div className="my-1 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-white">
                      {formatTemp(d.expectedTMean)}
                    </span>
                    <span className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${getAnomalyBadge(d.tempAnomalyVsNormal)}`}>
                      {d.tempAnomalyVsNormal > 0 ? `+${d.tempAnomalyVsNormal}` : `${d.tempAnomalyVsNormal}`}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 mt-auto pt-1 border-t border-slate-800">
                    <span className={d.precipAnomalyPct > 0 ? 'text-sky-400' : 'text-amber-400'}>
                      {d.precipAnomalyPct > 0 ? `+${d.precipAnomalyPct}%` : `${d.precipAnomalyPct}%`}
                    </span>
                    {d.expectedSnowfallCm > 0 && (
                      <span className="text-sky-300 font-semibold flex items-center gap-0.5">
                        <CloudSnow className="h-2 w-2" />
                        {d.expectedSnowfallCm}cm
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Decade Focus Card */}
          <div className="rounded-md bg-slate-950 border border-slate-800 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">
                  Décade {selectedDecade.decadeNumber} sur 24 • {selectedDecade.dateRangeFormatted}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {selectedDecade.decadeTitle} — {selectedDecade.dominantSynopticRegime}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getAnomalyBadge(selectedDecade.tempAnomalyVsNormal)}`}>
                  Anomalie {selectedDecade.tempAnomalyVsNormal > 0 ? `+${selectedDecade.tempAnomalyVsNormal}` : `${selectedDecade.tempAnomalyVsNormal}`}°C ({selectedDecade.tempAnomalyStatus})
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {selectedDecade.confidenceScore}% confiance
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-md border border-slate-800 space-y-1.5">
                <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ThermometerSnowflake className="h-3.5 w-3.5 text-sky-400" />
                  <span>Thermique, Gel &amp; Vagues de Chaleur</span>
                </h5>
                <p className="text-slate-300">
                  <strong>Moyenne attendue :</strong> {formatTemp(selectedDecade.expectedTMean)} (Normale : {formatTemp(selectedDecade.expectedTMean - selectedDecade.tempAnomalyVsNormal)})
                </p>
                <p className="text-slate-300">
                  <strong>Jours de gelée attendus :</strong> {selectedDecade.frostDaysExpected} j • <strong>Vague de froid :</strong> {selectedDecade.coldWaveProbability}%
                </p>
                {(selectedDecade.hotDaysExpected !== undefined && selectedDecade.hotDaysExpected > 0) && (
                  <p className="text-amber-300">
                    <strong>Jours de chaleur (≥25°C) :</strong> {selectedDecade.hotDaysExpected} j • <strong>Très forte chaleur (≥30°C) :</strong> {selectedDecade.veryHotDaysExpected} j
                  </p>
                )}
                {selectedDecade.synopticBlockingIndexPct !== undefined && (
                  <p className="text-slate-300">
                    <strong>Indice Blocage Synoptique :</strong> {selectedDecade.synopticBlockingIndexPct}% (Tibaldi-Molteni)
                  </p>
                )}
              </div>

              <div className="bg-slate-900/60 p-3 rounded-md border border-slate-800 space-y-1.5">
                <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CloudSnow className="h-3.5 w-3.5 text-sky-400" />
                  <span>Précipitations, Neige &amp; Convection</span>
                </h5>
                <p className="text-slate-300">
                  <strong>Précipitations :</strong> {selectedDecade.expectedPrecipMm} mm ({selectedDecade.precipAnomalyPct > 0 ? `+${selectedDecade.precipAnomalyPct}%` : `${selectedDecade.precipAnomalyPct}%`} vs normale)
                </p>
                {selectedDecade.expectedSnowfallCm > 0 ? (
                  <p className="text-sky-300">
                    <strong>Neige cumulée estimée :</strong> {selectedDecade.expectedSnowfallCm} cm (Potentiel : {selectedDecade.snowPotentialScore}%)
                  </p>
                ) : (
                  <p className="text-slate-400">
                    <strong>Risque Chutes de Neige :</strong> Nul en plaine
                  </p>
                )}
                {selectedDecade.capePotentialJkg !== undefined && (
                  <p className="text-slate-300">
                    <strong>CAPE Instabilité Convective :</strong> ~{selectedDecade.capePotentialJkg} J/kg (Risque Orages : {selectedDecade.thunderstormRiskScore}/100)
                  </p>
                )}
              </div>

              <div className="bg-slate-900/60 p-3 rounded-md border border-slate-800 space-y-1.5">
                <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  <span>Hydrologie des Sols &amp; Nappes</span>
                </h5>
                {selectedDecade.soilWaterIndexPct !== undefined && (
                  <p className="text-slate-300">
                    <strong>Humidité des Sols (SWI) :</strong> {selectedDecade.soilWaterIndexPct}% ({selectedDecade.groundMoistureStatus})
                  </p>
                )}
                {selectedDecade.speiDroughtIndex !== undefined && (
                  <p className="text-slate-300">
                    <strong>Indice Sécheresse SPEI :</strong> {selectedDecade.speiDroughtIndex > 0 ? `+${selectedDecade.speiDroughtIndex}` : selectedDecade.speiDroughtIndex} ({selectedDecade.speiLabel})
                  </p>
                )}
                {selectedDecade.waterTableRechargeIndex && (
                  <p className="text-slate-300">
                    <strong>Recharge Nappes :</strong> {selectedDecade.waterTableRechargeIndex}
                  </p>
                )}
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  <strong>Agro / Énergie :</strong> {selectedDecade.agriculturalAndEnergyImpact}
                </p>
              </div>
            </div>

            {/* Multi-Model Consensus Breakdown for Selected Decade */}
            {selectedDecade.multiModelConsensus && (
              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-sky-400" />
                    Consensus Multi-Modèles Ensemblistes (Anomalies T° Prévues) :
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                    selectedDecade.multiModelConsensus.spreadLevel === 'FAIBLE_ACCORD_FORT' 
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                  }`}>
                    Accord Ensembliste : {selectedDecade.multiModelConsensus.spreadLevel === 'FAIBLE_ACCORD_FORT' ? 'Fort' : 'Modéré'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">ECMWF SEAS5</span>
                    <span className="font-bold text-white">{selectedDecade.multiModelConsensus.ecmwfSeas5Anom > 0 ? `+${selectedDecade.multiModelConsensus.ecmwfSeas5Anom}` : selectedDecade.multiModelConsensus.ecmwfSeas5Anom}°C</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Copernicus C3S</span>
                    <span className="font-bold text-white">{selectedDecade.multiModelConsensus.copernicusC3sAnom > 0 ? `+${selectedDecade.multiModelConsensus.copernicusC3sAnom}` : selectedDecade.multiModelConsensus.copernicusC3sAnom}°C</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Météo-France S8</span>
                    <span className="font-bold text-white">{selectedDecade.multiModelConsensus.meteoFranceSystem8Anom > 0 ? `+${selectedDecade.multiModelConsensus.meteoFranceSystem8Anom}` : selectedDecade.multiModelConsensus.meteoFranceSystem8Anom}°C</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">NCEP CFSv2</span>
                    <span className="font-bold text-white">{selectedDecade.multiModelConsensus.ncepCfsv2Anom > 0 ? `+${selectedDecade.multiModelConsensus.ncepCfsv2Anom}` : selectedDecade.multiModelConsensus.ncepCfsv2Anom}°C</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">UKMO GloSea6</span>
                    <span className="font-bold text-white">{selectedDecade.multiModelConsensus.ukmoGloSea6Anom > 0 ? `+${selectedDecade.multiModelConsensus.ukmoGloSea6Anom}` : selectedDecade.multiModelConsensus.ukmoGloSea6Anom}°C</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">DWD GCFS</span>
                    <span className="font-bold text-white">{selectedDecade.multiModelConsensus.dwdGcfsAnom > 0 ? `+${selectedDecade.multiModelConsensus.dwdGcfsAnom}` : selectedDecade.multiModelConsensus.dwdGcfsAnom}°C</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MULTI-MODEL CHARTS & CLIMATOLOGICAL CURVES */}
      {/* ========================================================================= */}
      {viewTab === 'MULTI_MODEL_CHARTS' && (
        <div className="space-y-3">
          <div className="rounded-md bg-slate-950 p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Profil Thermique &amp; Précipitations sur 24 Décades ({seasonalData.territoryName})</span>
              <span className="text-sky-400">Multi-Modèles C3S / ECMWF / Météo-France</span>
            </h4>
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="decadeLabel" stroke="#94a3b8" tick={{ fontSize: 9 }} interval={1} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                  <Bar dataKey="snowfallCm" name="Chutes Neige (cm)" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="tempMean" name="T° Moyenne Attendue (°C)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="tempNormal" name="Normale Climatologique (°C)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="2 2" />
                  <Line type="monotone" dataKey="tempAnomaly" name="Anomalie vs Normale (°C)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="confidence" name="Confiance (%)" stroke="#a78bfa" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supercomputer Multi-Model Consensus Table */}
          <div className="rounded-md bg-slate-950 p-4 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-sky-400" />
              <span>Supercalculateurs &amp; Modèles Intégrés (Consensus C3S)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-white block">ECMWF SEAS5 (Europe / Reading)</span>
                <p className="text-slate-400 text-[11px]">51 membres ensemblistes. Référence mondiale couplée océan-atmosphère.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-white block">Météo-France Système 8 (Toulouse)</span>
                <p className="text-slate-400 text-[11px]">Modélisation haute résolution ARPEGE-Climat couplée avec le modèle océanique NEMO.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-white block">UK Met Office GloSea6 (Exeter)</span>
                <p className="text-slate-400 text-[11px]">Modèle saisonnier britannique spécialisé dans la prévision de l'indice NAO hivernal.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-white block">NCEP CFSv2 (NOAA / USA)</span>
                <p className="text-slate-400 text-[11px]">Ensemble dynamique américain intégrant les téléconnexions pacifiques et atlantiques.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-white block">DWD GCFS (Offenbach / Allemagne)</span>
                <p className="text-slate-400 text-[11px]">Modèle climatologique allemand ciblé sur les blocages continentaux en Europe centrale.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="font-semibold text-white block">Copernicus C3S Multi-System</span>
                <p className="text-slate-400 text-[11px]">Synthèse bayésienne officielle des 8 centres météorologiques mondiaux.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MACRO TELECONNECTIONS */}
      {/* ========================================================================= */}
      {viewTab === 'MACRO_SYNOPTIC' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase">
              <Compass className="h-3.5 w-3.5" />
              <span>Oscillation Nord-Atlantique (NAO)</span>
            </div>
            <p className="text-white font-semibold text-xs">{seasonalData.macroTeleconnections.naoState}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Une phase NAO- affaiblit le flux d'Ouest zonal et favorise des descentes d'air polaire froid sur l'Europe occidentale.
            </p>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Blocage Scandinave (Scand Blocking)</span>
            </div>
            <p className="text-white font-semibold text-xs">{seasonalData.macroTeleconnections.scandBlockState}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Présence de hautes pressions sur la Scandinavie canalisant le flux continental d'Est froid (Moscou-Paris).
            </p>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase">
              <Zap className="h-3.5 w-3.5" />
              <span>Vortex Polaire Stratosphérique</span>
            </div>
            <p className="text-white font-semibold text-xs">{seasonalData.macroTeleconnections.polarVortexStatus}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {seasonalData.winterSummary.polarVortexStability}.
            </p>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase">
              <Globe className="h-3.5 w-3.5" />
              <span>ENSO (El Niño / La Niña)</span>
            </div>
            <p className="text-white font-semibold text-xs">{seasonalData.macroTeleconnections.ensoStatus}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Influence globale sur la trajectoire des ondes de Rossby planétaires et le positionnement du Jet Stream.
            </p>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase">
              <Sun className="h-3.5 w-3.5" />
              <span>Température de Surface Mer (SST)</span>
            </div>
            <p className="text-white font-semibold text-xs">{seasonalData.macroTeleconnections.atlanticMdrSst}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              L'Atlantique Nord surchauffé injecte de la vapeur d'eau disponible et renforce les contrastes thermiques lors des descentes polaires.
            </p>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase">
              <Wind className="h-3.5 w-3.5" />
              <span>Oscillation Madden-Julian (MJO)</span>
            </div>
            <p className="text-white font-semibold text-xs">{seasonalData.macroTeleconnections.mjoPhase}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Propagation tropicale stimulant des régimes de blocage en moyenne et haute troposphère européenne.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RISK MATRIX */}
      {/* ========================================================================= */}
      {viewTab === 'RISK_MATRIX' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <ThermometerSnowflake className="h-3.5 w-3.5 text-sky-400" />
              <span>Vagues de Froid &amp; Épisodes Hivernaux Majeurs</span>
            </h4>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-xs space-y-1">
              <p><strong>Niveau de risque maximal :</strong> <span className="text-amber-400 font-semibold">{seasonalData.seasonalRiskMatrix.coldWave.maxRisk}</span></p>
              <p className="text-slate-400"><strong>Fenêtre temporelle critique :</strong> {seasonalData.seasonalRiskMatrix.coldWave.peakPeriod}</p>
            </div>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <CloudSnow className="h-3.5 w-3.5 text-sky-400" />
              <span>Enneigement Montagne &amp; Plaine</span>
            </h4>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-xs space-y-1">
              <p><strong>Bilan projeté :</strong> {seasonalData.seasonalRiskMatrix.snowDeficitOrExcess.severity}</p>
              <p className="text-slate-400"><strong>Massifs et zones cibles :</strong> {seasonalData.seasonalRiskMatrix.snowDeficitOrExcess.impactedMassifs}</p>
            </div>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>Gelées Précoces &amp; Gelées Tardives Agricoles</span>
            </h4>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-xs space-y-1">
              <p><strong>Premières gelées probables :</strong> {seasonalData.seasonalRiskMatrix.frost.firstRiskDate}</p>
              <p className="text-slate-400"><strong>Secteurs vulnérables :</strong> {seasonalData.seasonalRiskMatrix.frost.altitudeImpact}</p>
            </div>
          </div>

          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tempêtes Hivernales &amp; Sécheresses Printanières</span>
            </h4>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-xs space-y-1">
              <p><strong>Risque de coups de vent / tempêtes :</strong> {seasonalData.seasonalRiskMatrix.winterStorms.probability} ({seasonalData.seasonalRiskMatrix.winterStorms.mainZones})</p>
              <p className="text-slate-400"><strong>Risque déficit hydrique printanier :</strong> {seasonalData.seasonalRiskMatrix.springDrought.severity}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SPATIAL COMPARISON (COMPARATIF TERRITORIAL) */}
      {/* ========================================================================= */}
      {viewTab === 'SPATIAL_COMPARISON' && seasonalData.spatialComparison && (
        <div className="space-y-3">
          <div className="rounded-md bg-slate-950 p-3.5 border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-sky-400" />
                  <span>{seasonalData.spatialComparison.scaleContextLabel}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Comparaison des anomalies moyennes projetées sur 8 mois
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                Réf. : {seasonalData.spatialComparison.relativeToNationalAverage}
              </span>
            </div>

            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-2.5">Territoire</th>
                    <th className="p-2.5">Profil / Zone</th>
                    <th className="p-2.5">Anomalie T° (8 Mois)</th>
                    <th className="p-2.5">Bilan Pluviométrique</th>
                    <th className="p-2.5">Indice Neige</th>
                    <th className="p-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {(seasonalData.spatialComparison.subTerritories || []).map((sub) => (
                    <tr key={sub.codeOrId} className="hover:bg-slate-900/50 transition">
                      <td className="p-2.5 font-semibold text-white">
                        <span>{sub.name}</span>
                      </td>
                      <td className="p-2.5 text-slate-400">{sub.character}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getAnomalyBadge(sub.tempAnomalyVsNormal)}`}>
                          {sub.tempAnomalyVsNormal > 0 ? `+${sub.tempAnomalyVsNormal}` : `${sub.tempAnomalyVsNormal}`}°C
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getPrecipBadge(sub.precipAnomalyPct)}`}>
                          {sub.precipAnomalyPct > 0 ? `+${sub.precipAnomalyPct}%` : `${sub.precipAnomalyPct}%`}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-sky-400 h-full rounded-full" 
                              style={{ width: `${sub.snowPotentialScore}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-sky-300 font-semibold">{sub.snowPotentialScore}%</span>
                        </div>
                      </td>
                      <td className="p-2.5">
                        {scaleMode === 'NATIONAL' ? (
                          <button
                            onClick={() => {
                              setScaleMode('REGION');
                              setSelectedRegionId(sub.codeOrId);
                              setViewTab('MONTHLY_OVERVIEW');
                            }}
                            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Détailler Région</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setScaleMode('DEPARTMENT');
                              setSelectedDeptCode(sub.codeOrId);
                              setViewTab('MONTHLY_OVERVIEW');
                            }}
                            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Détailler Dépt</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
