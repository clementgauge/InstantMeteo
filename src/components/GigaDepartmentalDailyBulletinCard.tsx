import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MapPin, 
  Search, 
  Calendar, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Droplet, 
  Zap, 
  Activity, 
  Compass,
  Flame,
  Info,
  Tractor,
  Truck,
  HardHat,
  Trees,
  Snowflake,
  Clock,
  Eye,
  Globe2,
  Mountain
} from 'lucide-react';
import { 
  DepartmentBulletinData, 
  DepartmentDayForecast, 
  DayDiurnalPeriod, 
  ConvectiveRiskLevel,
  WorkSafetyRiskLevel,
  LocationPoint,
  DailyForecast
} from '../types/weather';
import { 
  DEPARTMENTS_AND_TERRITORIES_CATALOG, 
  DepartmentReference, 
  generateDepartment7DayBulletin 
} from '../services/departmentalBulletinService';

interface GigaDepartmentalDailyBulletinCardProps {
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  initialDepartmentCode?: string;
  currentStation?: LocationPoint;
  dailyForecasts?: DailyForecast[];
}

export const GigaDepartmentalDailyBulletinCard: React.FC<GigaDepartmentalDailyBulletinCardProps> = ({
  seniorMode = false,
  tempUnit = 'C',
  initialDepartmentCode = '75',
  currentStation,
  dailyForecasts
}) => {
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(initialDepartmentCode);
  const [bulletin, setBulletin] = useState<DepartmentBulletinData>(() => 
    generateDepartment7DayBulletin(initialDepartmentCode, currentStation, dailyForecasts)
  );
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'daily' | 'microclimate' | 'activities' | 'models'>('daily');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadBulletin = (code: string) => {
    setSelectedDeptCode(code);
    const isCurrentStationDept = currentStation && (
      currentStation.department?.split(' ')[0] === code || 
      currentStation.department?.toLowerCase().includes(code.toLowerCase())
    );
    const data = generateDepartment7DayBulletin(
      code, 
      isCurrentStationDept ? currentStation : undefined, 
      isCurrentStationDept ? dailyForecasts : undefined
    );
    setBulletin(data);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    loadBulletin(selectedDeptCode);
  }, [currentStation, dailyForecasts]);

  const handleRefresh = () => {
    loadBulletin(selectedDeptCode);
  };

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  const selectedDay: DepartmentDayForecast = bulletin.sevenDays.find(d => d.dayOffset === selectedDayOffset) || bulletin.sevenDays[0];

  // Filtered department list for quick search
  const filteredDepartments = DEPARTMENTS_AND_TERRITORIES_CATALOG.filter(d => {
    if (selectedRegionFilter !== 'ALL') {
      if (selectedRegionFilter === 'FRANCE' && !d.isFrench) return false;
      if (selectedRegionFilter === 'OUTRE-MER' && d.region !== 'Outre-Mer') return false;
      if (selectedRegionFilter === 'MONDE' && d.isFrench) return false;
      if (selectedRegionFilter !== 'FRANCE' && selectedRegionFilter !== 'OUTRE-MER' && selectedRegionFilter !== 'MONDE' && d.region !== selectedRegionFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = d.code.toLowerCase().includes(q);
      const matchName = d.name.toLowerCase().includes(q);
      const matchRegion = d.region.toLowerCase().includes(q);
      const matchChef = d.capitalChefLieu.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchRegion && !matchChef) return false;
    }
    return true;
  });

  const getConvectiveBadge = (risk: ConvectiveRiskLevel) => {
    switch (risk) {
      case 'EXTREME_GRELE':
        return { label: 'Risque Orages Violents & Grêle', color: 'bg-purple-950 text-purple-300 border-purple-500/50' };
      case 'FORT_ORAGES':
        return { label: 'Risque Orageux Fort', color: 'bg-rose-950 text-rose-300 border-rose-500/50' };
      case 'MODERE':
        return { label: 'Risque Convectif Modéré', color: 'bg-amber-950 text-amber-300 border-amber-500/50' };
      case 'FAIBLE':
        return { label: 'Risque Averse Faible', color: 'bg-blue-950 text-blue-300 border-blue-500/50' };
      default:
        return { label: 'Ciel Stable / Sans Risque', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/50' };
    }
  };

  const getSafetyBadge = (level: WorkSafetyRiskLevel) => {
    switch (level) {
      case 'FAVORABLE':
        return { label: 'Conditions Favorables', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
      case 'MODÉRÉ':
        return { label: 'Conditions Modérées / Prudence', bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40' };
      case 'DÉCONSEILLÉ':
        return { label: 'Déconseillé (Vent/Chaleur)', bg: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
      default:
        return { label: 'Critique / Interdit', bg: 'bg-rose-950 text-rose-300 border-rose-500' };
    }
  };

  return (
    <div id="giga-departmental-bulletin-card" className="space-y-6">
      {/* Top Banner: Giga Bulletin Départemental J+1 à J+7 */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
              <FileText className="h-4 w-4" />
              <span>Giga Bulletin Météorologique & Synoptique Quotidien (J+1 à J+7)</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
              Bulletin Expert par Département & Territoire : <span className="text-cyan-300">{bulletin.departmentName} ({bulletin.departmentCode})</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Découpage synoptique ultra-précis par tranches diurnes (Matin, Après-midi, Soirée/Nuit), microclimats locaux, modélisations comparées AROME / ARPEGE / ECMWF et vigilances métiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Réactualisation continue</span>
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 justify-end">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                {lastRefreshed || 'En direct'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 px-4 py-2.5 text-xs font-bold transition shadow active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Actualiser le Bulletin</span>
            </button>
          </div>
        </div>

        {/* Executive Departmental Synthesis */}
        <div className="mt-6 rounded-2xl bg-slate-950/85 border border-cyan-500/30 p-4 sm:p-5 space-y-2 text-xs text-slate-200 leading-relaxed shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-cyan-300 font-black uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Diagnostic Synoptique à 7 Jours pour le {bulletin.departmentCode} ({bulletin.departmentName}) :</span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              Région : <strong className="text-white">{bulletin.regionName}</strong> • Climat : <strong className="text-cyan-300">{bulletin.climateType}</strong>
            </span>
          </div>
          <p className="text-slate-100 font-medium text-xs sm:text-sm pt-1">
            {bulletin.executiveSynoptic7DaySummary}
          </p>
        </div>
      </div>

      {/* DEPARTMENT & LOCALITY SELECTOR BAR */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un département (ex: 75, 13, Rhône, Gironde, Tokyo...)"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Filtrer :</span>
            {[
              { id: 'ALL', label: 'Tous (101 Dép. + Monde)' },
              { id: 'FRANCE', label: '🇫🇷 France Métropolitaine' },
              { id: 'Île-de-France', label: 'Île-de-France' },
              { id: 'Auvergne-Rhône-Alpes', label: 'Auvergne-Rhône-Alpes' },
              { id: 'Provence-Alpes-Côte d\'Azur', label: 'PACA / Sud-Est' },
              { id: 'Occitanie', label: 'Occitanie' },
              { id: 'Nouvelle-Aquitaine', label: 'Nouvelle-Aquitaine' },
              { id: 'OUTRE-MER', label: '🌴 Outre-Mer (DROM)' },
              { id: 'MONDE', label: '🌍 Monde' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedRegionFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  selectedRegionFilter === f.id
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Scrollable Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Départements ({filteredDepartments.length}) :</span>
          {filteredDepartments.map((dept) => {
            const isSelected = dept.code === selectedDeptCode;
            return (
              <button
                key={dept.code}
                onClick={() => loadBulletin(dept.code)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30 ring-2 ring-white/60'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${isSelected ? 'bg-slate-900 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {dept.code}
                </span>
                <span>{dept.name}</span>
                <span className="text-[10px] opacity-70">({dept.capitalChefLieu})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7-DAY SELECTOR STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {bulletin.sevenDays.map((d) => {
          const isSelected = d.dayOffset === selectedDayOffset;
          const convBadge = getConvectiveBadge(d.convectiveRisk);

          return (
            <button
              key={d.dayOffset}
              onClick={() => setSelectedDayOffset(d.dayOffset)}
              className={`rounded-2xl border p-3.5 text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-400 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-400'
                  : 'bg-slate-900/90 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                    J+{d.dayOffset} • {d.shortDate}
                  </span>
                  <span className="text-xl">{d.afternoon.icon}</span>
                </div>
                <div className="text-xs font-black text-white truncate">{d.dayOfWeek.split(' ')[0]}</div>
              </div>

              <div className="my-2 py-1.5 border-y border-slate-800/80 flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-black text-cyan-300">
                  Tn {formatTemp(d.tempMinC)}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-[11px] font-black text-rose-300">
                  Tx {formatTemp(d.tempMaxC)}
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Ensol. :</span>
                  <span className="text-amber-300 font-bold">{d.sunshineHoursEstimate}h</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Fiabilité :</span>
                  <span className="text-emerald-400 font-bold">{d.confidenceScorePct}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'daily'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>1. Découpage Diurne Détaillé du {selectedDay.dayOfWeek} (Matin / Après-midi / Nuit)</span>
        </button>

        <button
          onClick={() => setActiveTab('microclimate')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'microclimate'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Mountain className="h-4 w-4" />
          <span>2. Microclimats & Reliefs du {bulletin.departmentName}</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'activities'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Tractor className="h-4 w-4" />
          <span>3. Indices Agricoles, BTP & Sécurité Routière</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'models'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>4. Modèles Numériques Comparés (AROME, ARPEGE, IFS, GFS)</span>
        </button>
      </div>

      {/* TAB 1: DIURNAL EVOLUTION (MORNING / AFTERNOON / EVENING-NIGHT) */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Day Overview Bar */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Échéance J+{selectedDay.dayOffset}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getConvectiveBadge(selectedDay.convectiveRisk).color}`}>
                  {getConvectiveBadge(selectedDay.convectiveRisk).label}
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                Chronologie détaillée du {selectedDay.dayOfWeek}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedDay.synopticSituationSummary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Indice UV Max</span>
                <div className="text-base font-black text-amber-400 mt-0.5">UV {selectedDay.uvIndex} / 11</div>
              </div>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Écart à la Normale</span>
                <div className={`text-base font-black mt-0.5 ${selectedDay.tempAnomalyC > 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                  {selectedDay.tempAnomalyC > 0 ? `+${selectedDay.tempAnomalyC}` : selectedDay.tempAnomalyC}°C
                </div>
              </div>
            </div>
          </div>

          {/* 3 Diurnal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. MATINÉE (06h - 12h) */}
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">Matinée (06h - 12h)</span>
                  </div>
                  <span className="text-2xl">{selectedDay.morning.icon}</span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-white">{formatTemp(selectedDay.morning.tempValue)}</span>
                    <span className="text-[10px] text-slate-400 block">Ressenti {formatTemp(selectedDay.morning.tempApparent)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-400">Tn du jour</span>
                    <span className="text-[10px] text-slate-400 block">{formatTemp(selectedDay.tempMinC)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium mt-3 leading-relaxed">
                  {selectedDay.morning.skyCondition}
                </p>

                <div className="mt-3 rounded-xl bg-slate-950 p-3 space-y-2 text-xs border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Vent & Rafales :</span>
                    <strong className="text-white">{selectedDay.morning.windSpeedKmh} km/h (raf. {selectedDay.morning.windGustKmh})</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Orientation :</span>
                    <strong className="text-cyan-300">{selectedDay.morning.windDirection}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Probabilité pluie :</span>
                    <strong className={selectedDay.morning.precipitationProbPct > 40 ? 'text-blue-400' : 'text-slate-300'}>
                      {selectedDay.morning.precipitationProbPct}% ({selectedDay.morning.precipitationMm} mm)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Isotherme 0°C :</span>
                    <strong className="text-white">{selectedDay.morning.isotherm0mMeters} m</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>{selectedDay.morning.fogOrFrostRisk}</span>
              </div>
            </div>

            {/* 2. APRÈS-MIDI (12h - 18h) */}
            <div className="rounded-3xl border border-rose-500/30 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-black text-rose-300 uppercase tracking-wider">Après-midi (12h - 18h)</span>
                  </div>
                  <span className="text-2xl">{selectedDay.afternoon.icon}</span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-rose-400">{formatTemp(selectedDay.afternoon.tempValue)}</span>
                    <span className="text-[10px] text-slate-400 block">Ressenti / Humidex {formatTemp(selectedDay.afternoon.tempApparent)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-400">Tx du jour</span>
                    <span className="text-[10px] text-slate-400 block">{formatTemp(selectedDay.tempMaxC)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium mt-3 leading-relaxed">
                  {selectedDay.afternoon.skyCondition}
                </p>

                <div className="mt-3 rounded-xl bg-slate-950 p-3 space-y-2 text-xs border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Vent moyen :</span>
                    <strong className="text-white">{selectedDay.afternoon.windSpeedKmh} km/h (raf. {selectedDay.afternoon.windGustKmh})</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Orientation :</span>
                    <strong className="text-amber-300">{selectedDay.afternoon.windDirection}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Précipitations :</span>
                    <strong className={selectedDay.afternoon.precipitationMm > 0 ? 'text-blue-400' : 'text-slate-300'}>
                      {selectedDay.afternoon.precipitationType} ({selectedDay.afternoon.precipitationMm} mm)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Humidité relative :</span>
                    <strong className="text-white">{selectedDay.afternoon.humidityPct}%</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Pic thermique diurne et dynamique convective</span>
              </div>
            </div>

            {/* 3. SOIRÉE & NUIT (18h - 06h) */}
            <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">Soirée & Nuit (18h - 06h)</span>
                  </div>
                  <span className="text-2xl">{selectedDay.eveningNight.icon}</span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-indigo-300">{formatTemp(selectedDay.eveningNight.tempValue)}</span>
                    <span className="text-[10px] text-slate-400 block">Ambiance nocturne</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-400">Humidité</span>
                    <span className="text-[10px] text-slate-400 block">{selectedDay.eveningNight.humidityPct}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium mt-3 leading-relaxed">
                  {selectedDay.eveningNight.skyCondition}
                </p>

                <div className="mt-3 rounded-xl bg-slate-950 p-3 space-y-2 text-xs border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Vent nocturne :</span>
                    <strong className="text-white">{selectedDay.eveningNight.windSpeedKmh} km/h (raf. {selectedDay.eveningNight.windGustKmh})</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Précipitations :</span>
                    <strong className="text-slate-300">{selectedDay.eveningNight.precipitationType}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Isotherme 0°C :</span>
                    <strong className="text-white">{selectedDay.eveningNight.isotherm0mMeters} m</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Nébuleuse :</span>
                    <strong className="text-indigo-300">Faible à modérée</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-indigo-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>{selectedDay.eveningNight.fogOrFrostRisk}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MICROCLIMATE & RELIEF DIAGNOSTIC */}
      {activeTab === 'microclimate' && (
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <Mountain className="h-6 w-6 text-indigo-400" />
            <div>
              <h3 className="text-xl font-black text-white">
                Diagnostic Topographique & Microclimatique du Département : {bulletin.departmentName} ({bulletin.departmentCode})
              </h3>
              <p className="text-xs text-slate-400">
                Effets d'altitude, cuvettes d'inversion, brises thermiques et circulation d'air locale
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Mountain className="h-4 w-4" />
                <span>Reliefs, Vallées & Effets Orographiques :</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.microclimate.reliefAndValleysEffect}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Thermometer className="h-4 w-4" />
                <span>Inversions Thermiques Nocturnes :</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.microclimate.thermalInversionsRisk}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Wind className="h-4 w-4" />
                <span>Régime de Vents Dominants & Locaux :</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.microclimate.localWindRegime}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Droplet className="h-4 w-4" />
                <span>État Hydrique & Évapotranspiration :</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.microclimate.hydrologicalState}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BIOCLIMATIC INDICES & PROFESSIONAL ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <Tractor className="h-6 w-6 text-emerald-400" />
            <div>
              <h3 className="text-xl font-black text-white">
                Indices Météo Professionnels & Activités Métier (7 Jours)
              </h3>
              <p className="text-xs text-slate-400">
                Recommandations techniques pour l'agriculture, le BTP, le transport routier et les espaces naturels
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Agriculture Spraying */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                  <Tractor className="h-4 w-4" />
                  <span>Pulvérisation & Traitements Phytosanitaires</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getSafetyBadge(bulletin.bioclimaticIndices.agriculturalSprayingIndex).bg}`}>
                  {getSafetyBadge(bulletin.bioclimaticIndices.agriculturalSprayingIndex).label}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.bioclimaticIndices.agriculturalSprayingDetails}
              </p>
            </div>

            {/* Hay & Harvesting */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                  <Sun className="h-4 w-4" />
                  <span>Fenaison, Récoltes & Andainage</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getSafetyBadge(bulletin.bioclimaticIndices.hayMakingAndHarvestingIndex).bg}`}>
                  {getSafetyBadge(bulletin.bioclimaticIndices.hayMakingAndHarvestingIndex).label}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.bioclimaticIndices.hayMakingDetails}
              </p>
            </div>

            {/* Construction BTP */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
                <HardHat className="h-4 w-4" />
                <span>BTP, Chantiers & Grues de Levage</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.bioclimaticIndices.constructionBtpAlert}
              </p>
            </div>

            {/* Road Transport */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase">
                <Truck className="h-4 w-4" />
                <span>Transports Routiers & Sécurité Circulation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.bioclimaticIndices.roadTransportAlert}
              </p>
            </div>

            {/* Forest Fire FWI */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase">
                  <Flame className="h-4 w-4" />
                  <span>Risque Feux de Forêt & Végétation (Indice FWI)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {bulletin.bioclimaticIndices.wildfireRiskFwi}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Surveillance accrue en cas de vent fort et d'humidité relative basse (&lt; 30%) dans les massifs boisés.
              </p>
            </div>

            {/* Air Quality & Pollen */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
                <Trees className="h-4 w-4" />
                <span>Qualité de l'Air & Allergènes Polliniques</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bulletin.bioclimaticIndices.airQualityAndPollen}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NUMERICAL MODELS COMPARISON */}
      {activeTab === 'models' && (
        <div className="rounded-3xl border border-purple-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <Layers className="h-6 w-6 text-purple-400" />
            <div>
              <h3 className="text-xl font-black text-white">
                Comparaison des Modèles Numériques pour le {selectedDay.dayOfWeek}
              </h3>
              <p className="text-xs text-slate-400">
                AROME (1.3km) • ARPEGE (5km) • ECMWF IFS (9km) • GFS (13km) • ICON-EU (7km)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center">
              <span className="text-[10px] font-black uppercase text-cyan-400 block">AROME 1.3km</span>
              <span className="text-[10px] text-slate-500 block">Météo-France Haute Réf.</span>
              <div className="text-2xl font-black text-white mt-2">
                {formatTemp(selectedDay.modelsComparison.aromeTempMax)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center">
              <span className="text-[10px] font-black uppercase text-blue-400 block">ARPEGE 5km</span>
              <span className="text-[10px] text-slate-500 block">Météo-France Synoptique</span>
              <div className="text-2xl font-black text-white mt-2">
                {formatTemp(selectedDay.modelsComparison.arpegeTempMax)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-emerald-500/40 p-4 text-center shadow">
              <span className="text-[10px] font-black uppercase text-emerald-400 block">ECMWF IFS 9km</span>
              <span className="text-[10px] text-emerald-400/80 block font-bold">Centre Européen (Référence)</span>
              <div className="text-2xl font-black text-emerald-300 mt-2">
                {formatTemp(selectedDay.modelsComparison.ecmwfTempMax)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center">
              <span className="text-[10px] font-black uppercase text-amber-400 block">GFS 13km</span>
              <span className="text-[10px] text-slate-500 block">NOAA / NCEP Américain</span>
              <div className="text-2xl font-black text-white mt-2">
                {formatTemp(selectedDay.modelsComparison.gfsTempMax)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center">
              <span className="text-[10px] font-black uppercase text-purple-400 block">ICON-EU 7km</span>
              <span className="text-[10px] text-slate-500 block">DWD Allemand</span>
              <div className="text-2xl font-black text-white mt-2">
                {formatTemp(selectedDay.modelsComparison.iconTempMax)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              Synthèse & Consensus des Ensembles :
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {selectedDay.modelsComparison.dominantConsensus}
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              Degré de dispersion : <strong className="text-cyan-400">{selectedDay.modelsComparison.spreadConfidence}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
