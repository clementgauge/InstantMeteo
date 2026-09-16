import React, { useState, useMemo } from 'react';
import { LocationPoint, HistoricalDayRecord, HistoricalSameDayComparison } from '../types/weather';
import { 
  generatePastWeekArchive, 
  generateHistoricalMonthArchive,
  generateSameDayMultiYearComparison,
  getExactHistoricalDayRecord
} from '../services/historicalArchiveService';
import { HistoricalDayModal } from '../components/HistoricalDayModal';
import { 
  Archive, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer, 
  Award, 
  ArrowDown, 
  ArrowUp, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Download, 
  Sparkles,
  Layers,
  Search,
  Zap,
  Flame,
  Snowflake,
  BarChart3,
  CalendarDays,
  Eye,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine 
} from 'recharts';

interface HistoricalArchiveViewProps {
  station: LocationPoint;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const HistoricalArchiveView: React.FC<HistoricalArchiveViewProps> = ({
  station,
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [activeTab, setActiveTab] = useState<'MONTHLY_TABLE' | 'SAME_DAY_MULTI_YEAR' | 'PAST_WEEK' | 'DATE_PICKER'>('MONTHLY_TABLE');
  
  // Date states
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedDayRecord, setSelectedDayRecord] = useState<HistoricalDayRecord | null>(null);

  // Table filter state
  const [tableFilter, setTableFilter] = useState<'ALL' | 'RAIN' | 'HEAT' | 'FROST' | 'STORM'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Same Day Multi-Year state
  const [compareMonth, setCompareMonth] = useState<number>(currentMonth);
  const [compareDay, setCompareDay] = useState<number>(currentDay);

  // Direct Date Picker state
  const [customDateInput, setCustomDateInput] = useState<string>(
    `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.max(1, currentDay - 1)).padStart(2, '0')}`
  );
  const [customDayRecord, setCustomDayRecord] = useState<HistoricalDayRecord | null>(null);

  // Generate data
  const pastWeekSummary = useMemo(() => generatePastWeekArchive(station), [station]);
  
  const monthArchive = useMemo(
    () => generateHistoricalMonthArchive(station, selectedYear, selectedMonth),
    [station, selectedYear, selectedMonth]
  );

  const sameDayComparison: HistoricalSameDayComparison = useMemo(
    () => generateSameDayMultiYearComparison(station, compareMonth, compareDay, 2010, currentYear),
    [station, compareMonth, compareDay, currentYear]
  );

  // Years list for explorer (1990 to current year)
  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= 1990; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  const monthsList = [
    { num: 1, name: 'Janvier' },
    { num: 2, name: 'Février' },
    { num: 3, name: 'Mars' },
    { num: 4, name: 'Avril' },
    { num: 5, name: 'Mai' },
    { num: 6, name: 'Juin' },
    { num: 7, name: 'Juillet' },
    { num: 8, name: 'Août' },
    { num: 9, name: 'Septembre' },
    { num: 10, name: 'Octobre' },
    { num: 11, name: 'Novembre' },
    { num: 12, name: 'Décembre' }
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => Math.max(1990, y - 1));
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      if (selectedYear < currentYear) {
        setSelectedMonth(1);
        setSelectedYear((y) => y + 1);
      }
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Filtered month days
  const filteredDays = useMemo(() => {
    return monthArchive.days.filter((d) => {
      // Filter type
      if (tableFilter === 'RAIN' && d.precipitationMm <= 0) return false;
      if (tableFilter === 'HEAT' && d.tempMax < 25) return false;
      if (tableFilter === 'FROST' && d.tempMin > 0) return false;
      if (tableFilter === 'STORM' && !d.weatherDescription.toLowerCase().includes('orage') && !d.weatherEmoji.includes('⛈️')) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = d.date.includes(q) || d.dayFormatted.toLowerCase().includes(q) || d.dayOfWeek.toLowerCase().includes(q);
        const matchesWeather = d.weatherDescription.toLowerCase().includes(q);
        if (!matchesDate && !matchesWeather) return false;
      }

      return true;
    });
  }, [monthArchive, tableFilter, searchQuery]);

  // Chart data for temperature profile across the month
  const monthChartData = useMemo(() => {
    return monthArchive.days.map((d) => ({
      jour: `${d.day}`,
      date: d.dayFormatted,
      Tmin: d.tempMin,
      Tmax: d.tempMax,
      Tmean: d.tempMean,
      Normale: d.normalTempMean,
      Pluie: d.precipitationMm,
      Soleil: d.sunshineHours
    }));
  }, [monthArchive]);

  const handleLookupCustomDate = () => {
    const rec = getExactHistoricalDayRecord(station, customDateInput);
    setCustomDayRecord(rec);
  };

  const handleExportCSV = () => {
    const records = activeTab === 'PAST_WEEK' ? pastWeekSummary.days : monthArchive.days;
    const headers = "Date,Jour,Tmin(C),Tmax(C),Tmean(C),EcartNormale(C),Pluie(mm),DureePluie(h),RafaleMax(kmh),Soleil(h),Pression(hPa)\n";
    const rows = records.map((d) => 
      `"${d.date}","${d.dayOfWeek}",${d.tempMin},${d.tempMax},${d.tempMean},${d.tempAnomalyVsNormal},${d.precipitationMm},${d.precipitationDurationHours},${d.windGustMaxKmh},${d.sunshineHours},${d.pressureMeanHpa}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `archives_meteo_${station.id}_${activeTab === 'PAST_WEEK' ? 'semaine' : `${selectedYear}_${selectedMonth}`}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="historical-archive-view" className="space-y-4">
      {/* View Header */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-[#0284C7] border border-slate-700">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
                <span>Archives Météorologiques & Données Quotidiennes</span>
                <span>•</span>
                <span className="text-slate-400">{station.name} ({station.altitude} m)</span>
              </div>
              <h1 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-2xl'}`}>
                Historique Météo & Registre Multi-Années
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Consultez les relevés quotidiens (températures, pluie, vent, ensoleillement, écarts aux normales 1991-2020) et comparez la même journée sur plusieurs années.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#0284C7]" />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 border-t border-slate-800 pt-3">
          <button
            onClick={() => setActiveTab('MONTHLY_TABLE')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'MONTHLY_TABLE'
                ? 'bg-[#0284C7] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Tableau Mensuel ({monthArchive.monthName} {selectedYear})</span>
          </button>

          <button
            onClick={() => setActiveTab('SAME_DAY_MULTI_YEAR')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'SAME_DAY_MULTI_YEAR'
                ? 'bg-[#0284C7] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Même Jour (Comparatif 15 ans)</span>
          </button>

          <button
            onClick={() => setActiveTab('PAST_WEEK')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'PAST_WEEK'
                ? 'bg-[#0284C7] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>7 Derniers Jours</span>
          </button>

          <button
            onClick={() => setActiveTab('DATE_PICKER')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'DATE_PICKER'
                ? 'bg-[#0284C7] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Recherche par Date</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MONTHLY TABLE & DIRECT IN-APP CHARTS */}
      {activeTab === 'MONTHLY_TABLE' && (
        <div className="space-y-4">
          {/* Controls: Year, Month & Fast Stats */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-md border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                  title="Mois précédent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-base font-bold text-white">
                  {monthArchive.monthName} {selectedYear}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="rounded-md border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                  title="Mois suivant"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Mois :</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white focus:border-[#0284C7] focus:outline-none"
                  >
                    {monthsList.map((m) => (
                      <option key={m.num} value={m.num}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Année :</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white focus:border-[#0284C7] focus:outline-none"
                  >
                    {yearsList.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Monthly Key Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">T° Moyenne</span>
                <div className="my-0.5 text-lg font-bold text-white">{monthArchive.monthTMean}°C</div>
                <span className={`text-[10px] font-semibold ${monthArchive.monthTMeanAnomaly >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                  {monthArchive.monthTMeanAnomaly > 0 ? `+${monthArchive.monthTMeanAnomaly}` : monthArchive.monthTMeanAnomaly}°C
                </span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Cumul Pluie</span>
                <div className="my-0.5 text-lg font-bold text-sky-300">{monthArchive.monthPrecipTotalMm} mm</div>
                <span className="text-[10px] text-sky-400">{monthArchive.rainDaysCount} jours de pluie</span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Ensoleillement</span>
                <div className="my-0.5 text-lg font-bold text-amber-300">{monthArchive.monthSunHoursTotal} h</div>
                <span className="text-[10px] text-slate-400">Rayonnement</span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Chaleur (≥25°C)</span>
                <div className="my-0.5 text-lg font-bold text-rose-400">{monthArchive.heatwaveDaysCount} j</div>
                <span className="text-[10px] text-slate-400">Tmax chaude</span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Gel (≤0°C)</span>
                <div className="my-0.5 text-lg font-bold text-sky-300">{monthArchive.frostDaysCount} j</div>
                <span className="text-[10px] text-slate-400">Tmin négative</span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Écart Pluie</span>
                <div className={`my-0.5 text-lg font-bold ${monthArchive.monthPrecipAnomalyPct >= 0 ? 'text-sky-300' : 'text-amber-400'}`}>
                  {monthArchive.monthPrecipAnomalyPct > 0 ? `+${monthArchive.monthPrecipAnomalyPct}` : monthArchive.monthPrecipAnomalyPct}%
                </div>
                <span className="text-[10px] text-slate-400">vs 1991-2020</span>
              </div>
            </div>

            {/* Highlights List */}
            <div className="rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-[#0284C7]" />
                Faits Marquants ({monthArchive.monthName} {selectedYear}) :
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-4 list-disc text-slate-300">
                {monthArchive.monthHighlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive In-App Evolution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Temperature curves (Tmin, Tmax, Tmean, Normale) */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                  Températures (°C) — {monthArchive.monthName} {selectedYear}
                </h3>
                <span className="text-[11px] text-slate-400">Tmin, Tmax &amp; Normale</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="jour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 3', 'dataMax + 3']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any, name: any) => [`${val} °C`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Area type="monotone" dataKey="Tmax" stroke="#f43f5e" strokeWidth={1.5} fill="#f43f5e" fillOpacity={0.1} name="Tmax Jour" />
                    <Area type="monotone" dataKey="Tmin" stroke="#38bdf8" strokeWidth={1.5} fill="#38bdf8" fillOpacity={0.1} name="Tmin Nuit" />
                    <Area type="monotone" dataKey="Normale" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.2} fill="none" name="Normale 1991-2020" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Rainfall & Sunshine */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CloudRain className="h-3.5 w-3.5 text-blue-400" />
                  Précipitations (mm) &amp; Ensoleillement (h)
                </h3>
                <span className="text-[11px] text-slate-400">Relevés journaliers</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="jour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any, name: any) => [name === 'Pluie' ? `${val} mm` : `${val} h`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="Pluie" fill="#0284c7" radius={[2, 2, 0, 0]} name="Pluie (mm)" />
                    <Bar dataKey="Soleil" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Soleil (h)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Full Interactive In-App Table */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[#0284C7]" />
                  Relevés Quotidiens — {monthArchive.monthName} {selectedYear}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {filteredDays.length} jours affichés • Cliquez sur une ligne pour voir le détail horaire
                </span>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer..."
                    className="rounded-md border border-slate-700 bg-slate-950 pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => setTableFilter('ALL')}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${tableFilter === 'ALL' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setTableFilter('RAIN')}
                    className={`px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer ${tableFilter === 'RAIN' ? 'bg-sky-600 text-white' : 'text-sky-400 hover:text-white'}`}
                  >
                    <CloudRain className="h-3 w-3" /> Pluie
                  </button>
                  <button
                    onClick={() => setTableFilter('HEAT')}
                    className={`px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer ${tableFilter === 'HEAT' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-white'}`}
                  >
                    <Flame className="h-3 w-3" /> Chaleur
                  </button>
                  <button
                    onClick={() => setTableFilter('FROST')}
                    className={`px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer ${tableFilter === 'FROST' ? 'bg-sky-700 text-white' : 'text-sky-300 hover:text-white'}`}
                  >
                    <Snowflake className="h-3 w-3" /> Gel
                  </button>
                  <button
                    onClick={() => setTableFilter('STORM')}
                    className={`px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer ${tableFilter === 'STORM' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-white'}`}
                  >
                    <Zap className="h-3 w-3" /> Orages
                  </button>
                </div>
              </div>
            </div>

            {/* Clean HTML Data Table */}
            <div className="overflow-x-auto rounded-md border border-slate-800">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Conditions</th>
                    <th className="py-2.5 px-3 text-center text-sky-400">Tmin</th>
                    <th className="py-2.5 px-3 text-center text-rose-400">Tmax</th>
                    <th className="py-2.5 px-3 text-center">T. Moy</th>
                    <th className="py-2.5 px-3 text-center">Écart Normale</th>
                    <th className="py-2.5 px-3 text-center text-sky-300">Pluie (mm)</th>
                    <th className="py-2.5 px-3 text-center text-teal-300">Rafale Max</th>
                    <th className="py-2.5 px-3 text-center text-amber-300">Soleil (h)</th>
                    <th className="py-2.5 px-3 text-center text-slate-400">Pression</th>
                    <th className="py-2.5 px-3 text-right">Détail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0F172A]">
                  {filteredDays.map((day) => {
                    const isHeat = day.tempMax >= 25;
                    const isFrost = day.tempMin <= 0;
                    const isStorm = day.weatherEmoji.includes('⛈️') || day.weatherDescription.toLowerCase().includes('orage');
                    return (
                      <tr 
                        key={day.date}
                        onClick={() => setSelectedDayRecord(day)}
                        className="hover:bg-slate-800/60 cursor-pointer transition"
                      >
                        <td className="py-2 px-3 font-semibold whitespace-nowrap">
                          <div className="text-white">{day.dayFormatted.replace(` ${day.year}`, '')}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{day.dayOfWeek}</div>
                        </td>

                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{day.weatherEmoji}</span>
                            <span className="text-xs text-slate-300 line-clamp-1">{day.weatherDescription}</span>
                            {isStorm && (
                              <span className="rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 border border-amber-500/30">
                                Orage
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-3 text-center font-bold text-sky-300 whitespace-nowrap">
                          {day.tempMin}°C
                          {isFrost && <span className="ml-1 text-[10px] text-sky-400">❄️</span>}
                        </td>

                        <td className="py-2 px-3 text-center font-bold text-rose-300 whitespace-nowrap">
                          {day.tempMax}°C
                          {isHeat && <span className="ml-1 text-[10px] text-rose-400">🔥</span>}
                        </td>

                        <td className="py-2 px-3 text-center font-bold text-white whitespace-nowrap">
                          {day.tempMean}°C
                        </td>

                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className={`rounded px-1.5 py-0.5 font-bold text-[11px] ${
                            day.tempAnomalyVsNormal >= 2 ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50' :
                            day.tempAnomalyVsNormal > 0 ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' :
                            day.tempAnomalyVsNormal <= -2 ? 'bg-sky-950/60 text-sky-300 border border-sky-800/50' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {day.tempAnomalyVsNormal > 0 ? `+${day.tempAnomalyVsNormal}` : day.tempAnomalyVsNormal}°C
                          </span>
                        </td>

                        <td className="py-2 px-3 text-center font-bold whitespace-nowrap">
                          {day.precipitationMm > 0 ? (
                            <span className="text-sky-300 font-bold bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-800/50">
                              {day.precipitationMm} mm
                            </span>
                          ) : (
                            <span className="text-slate-500">0.0</span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-center font-medium text-teal-300 whitespace-nowrap">
                          {day.windGustMaxKmh} km/h
                        </td>

                        <td className="py-2 px-3 text-center font-medium text-amber-300 whitespace-nowrap">
                          {day.sunshineHours} h
                        </td>

                        <td className="py-2 px-3 text-center text-slate-400 whitespace-nowrap">
                          {day.pressureMeanHpa} hPa
                        </td>

                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayRecord(day);
                            }}
                            className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200 hover:bg-[#0284C7] hover:text-white transition cursor-pointer border border-slate-700"
                          >
                            Détail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAME DAY MULTI-YEAR CLIMATE COMPARISON */}
      {activeTab === 'SAME_DAY_MULTI_YEAR' && (
        <div className="space-y-4">
          {/* Controls Box */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="rounded-md bg-slate-800 p-2 text-[#0284C7] border border-slate-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Que s'est-il passé ce même jour ({sameDayComparison.dateReferenceFormatted}) les années précédentes ?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comparatif du <strong className="text-white">{sameDayComparison.dateReferenceFormatted}</strong> depuis 2010 jusqu'à {currentYear} sur {station.name}.
                  </p>
                </div>
              </div>

              {/* Day & Month Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Jour :</label>
                  <select
                    value={compareDay}
                    onChange={(e) => setCompareDay(Number(e.target.value))}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white focus:border-[#0284C7] focus:outline-none"
                  >
                    {Array.from({ length: 31 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Mois :</label>
                  <select
                    value={compareMonth}
                    onChange={(e) => setCompareMonth(Number(e.target.value))}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white focus:border-[#0284C7] focus:outline-none"
                  >
                    {monthsList.map((m) => (
                      <option key={m.num} value={m.num}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Highlights: Record Hot, Cold, Rainiest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
                <span className="text-[10px] font-semibold uppercase text-rose-300 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-rose-400" /> Année la Plus Chaude
                </span>
                <div className="mt-1 text-xl font-bold text-rose-300">
                  {sameDayComparison.recordHotYear.tempMax}°C
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  En {sameDayComparison.recordHotYear.year} (Tmax record)
                </div>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
                <span className="text-[10px] font-semibold uppercase text-sky-300 flex items-center gap-1">
                  <Snowflake className="h-3 w-3 text-sky-400" /> Année la Plus Froide
                </span>
                <div className="mt-1 text-xl font-bold text-sky-300">
                  {sameDayComparison.recordColdYear.tempMin}°C
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  En {sameDayComparison.recordColdYear.year} (Tmin basse)
                </div>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
                <span className="text-[10px] font-semibold uppercase text-sky-300 flex items-center gap-1">
                  <CloudRain className="h-3 w-3 text-sky-400" /> Année la Plus Pluvieuse
                </span>
                <div className="mt-1 text-xl font-bold text-sky-300">
                  {sameDayComparison.recordRainYear.rainMm} mm
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  En {sameDayComparison.recordRainYear.year} (Cumul 24h)
                </div>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
                <span className="text-[10px] font-semibold uppercase text-amber-300 flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-amber-400" /> T° Moyenne Historique
                </span>
                <div className="mt-1 text-xl font-bold text-amber-300">
                  {sameDayComparison.averageTempOverYears}°C
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Tendance : +{sameDayComparison.warmingTrendDecadeC}°C / décennie
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Year Timeline Table */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-[#0284C7]" />
              Historique Chronologique du {sameDayComparison.dateReferenceFormatted} (2010 - {currentYear})
            </h3>

            <div className="overflow-x-auto rounded-md border border-slate-800">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Année</th>
                    <th className="py-2.5 px-3">Conditions Météo</th>
                    <th className="py-2.5 px-3 text-center text-sky-400">Tmin (°C)</th>
                    <th className="py-2.5 px-3 text-center text-rose-400">Tmax (°C)</th>
                    <th className="py-2.5 px-3 text-center">T. Moy (°C)</th>
                    <th className="py-2.5 px-3 text-center">Écart Normale</th>
                    <th className="py-2.5 px-3 text-center text-sky-300">Pluie (mm)</th>
                    <th className="py-2.5 px-3 text-center text-amber-300">Soleil (h)</th>
                    <th className="py-2.5 px-3">Événement Remarquable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0F172A]">
                  {sameDayComparison.years.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-800/60 transition">
                      <td className="py-2 px-3 font-bold text-white">
                        {row.year}
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{row.weatherEmoji}</span>
                          <span className="text-slate-300">{row.weatherDescription}</span>
                        </div>
                      </td>

                      <td className="py-2 px-3 text-center font-bold text-sky-300">
                        {row.tempMin}°C
                      </td>

                      <td className="py-2 px-3 text-center font-bold text-rose-300">
                        {row.tempMax}°C
                      </td>

                      <td className="py-2 px-3 text-center font-bold text-white">
                        {row.tempMean}°C
                      </td>

                      <td className="py-2 px-3 text-center">
                        <span className={`rounded px-1.5 py-0.5 font-bold text-[11px] ${
                          row.anomalyVsNormal >= 2 ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50' :
                          row.anomalyVsNormal > 0 ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' :
                          'bg-sky-950/60 text-sky-300 border border-sky-800/50'
                        }`}>
                          {row.anomalyVsNormal > 0 ? `+${row.anomalyVsNormal}` : row.anomalyVsNormal}°C
                        </span>
                      </td>

                      <td className="py-2 px-3 text-center font-bold">
                        {row.precipitationMm > 0 ? (
                          <span className="text-sky-300 font-bold">{row.precipitationMm} mm</span>
                        ) : (
                          <span className="text-slate-500">0.0</span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center font-bold text-amber-300">
                        {row.sunshineHours} h
                      </td>

                      <td className="py-2 px-3">
                        {row.historicalEventTag ? (
                          <span className="rounded bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            {row.historicalEventTag}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Normal de saison</span>
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

      {/* TAB 3: PAST WEEK (7 RECENT DAYS) */}
      {activeTab === 'PAST_WEEK' && (
        <div className="space-y-4">
          {/* Week Summary Banner */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#0284C7]" />
                {pastWeekSummary.weekTitle}
              </h2>
              <span className="text-xs text-slate-400">Cliquez sur un jour pour ouvrir sa fiche détaillée</span>
            </div>

            {/* Weekly Aggregated Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">T° Moyenne</span>
                <div className="my-0.5">
                  <span className="text-lg font-bold text-white">{pastWeekSummary.tMeanWeek}</span>
                  <span className="text-xs text-slate-400 ml-1">°C</span>
                </div>
                <span className={`text-[10px] font-semibold ${pastWeekSummary.tempAnomalyWeek >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                  {pastWeekSummary.tempAnomalyWeek > 0 ? `+${pastWeekSummary.tempAnomalyWeek}` : pastWeekSummary.tempAnomalyWeek}°C
                </span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Pluie Semaine</span>
                <div className="my-0.5">
                  <span className="text-lg font-bold text-sky-300">{pastWeekSummary.totalPrecipWeekMm}</span>
                  <span className="text-xs text-slate-400 ml-1">mm</span>
                </div>
                <span className="text-[10px] text-sky-400">
                  {pastWeekSummary.precipAnomalyWeekPct > 0 ? `+${pastWeekSummary.precipAnomalyWeekPct}` : pastWeekSummary.precipAnomalyWeekPct}% vs moyenne
                </span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Soleil Total</span>
                <div className="my-0.5">
                  <span className="text-lg font-bold text-amber-300">{pastWeekSummary.totalSunHoursWeek}</span>
                  <span className="text-xs text-slate-400 ml-1">h</span>
                </div>
                <span className="text-[10px] text-slate-400">Cumul hebdomadaire</span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Rafale Max</span>
                <div className="my-0.5">
                  <span className="text-lg font-bold text-sky-300">{pastWeekSummary.maxGustWeekKmh}</span>
                  <span className="text-xs text-slate-400 ml-1">km/h</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">{pastWeekSummary.maxGustDayLabel}</span>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900 p-2.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Station</span>
                <div className="my-0.5 text-xs font-bold text-white truncate">{station.name}</div>
                <span className="text-[10px] text-slate-400">{station.department}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-md border border-slate-800">
              {pastWeekSummary.weekSummaryText}
            </p>
          </div>

          {/* 7 Days Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
            {pastWeekSummary.days.map((day) => (
              <div
                key={day.date}
                onClick={() => setSelectedDayRecord(day)}
                className="cursor-pointer rounded-md border border-slate-800 bg-[#0F172A] p-3 hover:border-[#0284C7] hover:bg-slate-900 transition space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">{day.dayOfWeek}</span>
                    <span className="text-lg">{day.weatherEmoji}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{day.dayFormatted.replace(` ${day.year}`, '')}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{day.weatherDescription}</div>
                </div>

                <div className="space-y-0.5 py-1.5 border-y border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 flex items-center text-[11px] font-semibold">
                      <ArrowDown className="h-3 w-3 mr-0.5" /> Tmin
                    </span>
                    <span className="font-bold text-white">{day.tempMin}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 flex items-center text-[11px] font-semibold">
                      <ArrowUp className="h-3 w-3 mr-0.5" /> Tmax
                    </span>
                    <span className="font-bold text-white">{day.tempMax}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Écart</span>
                    <span className={`font-semibold ${day.tempAnomalyVsNormal >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                      {day.tempAnomalyVsNormal > 0 ? `+${day.tempAnomalyVsNormal}` : day.tempAnomalyVsNormal}°
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <CloudRain className="h-3 w-3 text-sky-400" /> Pluie
                    </span>
                    <span className="font-semibold text-white">{day.precipitationMm} mm</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Wind className="h-3 w-3 text-teal-400" /> Rafale
                    </span>
                    <span className="font-semibold text-white">{day.windGustMaxKmh} km/h</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Sun className="h-3 w-3 text-amber-400" /> Soleil
                    </span>
                    <span className="font-semibold text-white">{day.sunshineHours} h</span>
                  </div>
                </div>

                <div className="pt-0.5 text-center">
                  <span className="inline-block w-full rounded bg-slate-800 py-1 text-[10px] font-semibold text-slate-300 hover:bg-[#0284C7] hover:text-white transition">
                    Voir la fiche
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT DATE PICKER & REPORT */}
      {activeTab === 'DATE_PICKER' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Search className="h-4 w-4 text-[#0284C7]" />
                  Recherche &amp; Affichage d'un Relevé Historique
                </h3>
                <p className="text-xs text-slate-400">
                  Entrez une date passée pour afficher sa fiche météorologique sur {station.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDateInput}
                  onChange={(e) => setCustomDateInput(e.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white focus:border-[#0284C7] focus:outline-none"
                />
                <button
                  onClick={handleLookupCustomDate}
                  className="rounded-md bg-[#0284C7] px-3 py-1 text-xs font-semibold text-white hover:bg-sky-500 transition cursor-pointer"
                >
                  Afficher la Fiche
                </button>
              </div>
            </div>

            {/* Render Selected Day Details */}
            {customDayRecord ? (
              <div className="rounded-md border border-slate-800 bg-slate-900 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{customDayRecord.weatherEmoji}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {customDayRecord.dayOfWeek} {customDayRecord.dayFormatted}
                      </h4>
                      <span className="text-xs text-slate-300">
                        {customDayRecord.weatherDescription}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDayRecord(customDayRecord)}
                      className="rounded-md bg-[#0284C7] px-3 py-1 text-xs font-semibold text-white hover:bg-sky-500 transition cursor-pointer"
                    >
                      Ouvrir en Grand Format
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-md bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-sky-400 font-semibold uppercase">T° Min</span>
                    <div className="text-lg font-bold text-sky-300 mt-0.5">{customDayRecord.tempMin}°C</div>
                  </div>
                  <div className="rounded-md bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-rose-400 font-semibold uppercase">T° Max</span>
                    <div className="text-lg font-bold text-rose-300 mt-0.5">{customDayRecord.tempMax}°C</div>
                  </div>
                  <div className="rounded-md bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">T° Moyenne</span>
                    <div className="text-lg font-bold text-white mt-0.5">{customDayRecord.tempMean}°C</div>
                  </div>
                  <div className="rounded-md bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-semibold uppercase">Écart Normale</span>
                    <div className="text-lg font-bold text-amber-300 mt-0.5">
                      {customDayRecord.tempAnomalyVsNormal > 0 ? `+${customDayRecord.tempAnomalyVsNormal}` : customDayRecord.tempAnomalyVsNormal}°C
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-md bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400">🌧️ Pluie :</span>
                    <strong className="text-white ml-1">{customDayRecord.precipitationMm} mm</strong>
                  </div>
                  <div className="rounded-md bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400">💨 Rafale Max :</span>
                    <strong className="text-white ml-1">{customDayRecord.windGustMaxKmh} km/h</strong>
                  </div>
                  <div className="rounded-md bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400">☀️ Soleil :</span>
                    <strong className="text-white ml-1">{customDayRecord.sunshineHours} h</strong>
                  </div>
                  <div className="rounded-md bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400">⏱️ Pression :</span>
                    <strong className="text-white ml-1">{customDayRecord.pressureMeanHpa} hPa</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Sélectionnez une date ci-dessus et cliquez sur « Afficher la Fiche »
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      {selectedDayRecord && (
        <HistoricalDayModal
          dayRecord={selectedDayRecord}
          station={station}
          onClose={() => setSelectedDayRecord(null)}
        />
      )}
    </div>
  );
};
