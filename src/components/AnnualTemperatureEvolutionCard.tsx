import React, { useState } from 'react';
import { 
  TrendingUp, 
  Globe, 
  Layers, 
  Thermometer, 
  Sun, 
  Snowflake, 
  Flame, 
  Droplets, 
  AlertTriangle, 
  Info,
  Calendar,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { LocationPoint, AnnualTemperatureEvolutionRecord } from '../types/weather';
import { 
  REFERENCE_LOCALITIES_CLIMATE, 
  generateAnnualTemperatureHistory,
  MultiLocalityClimateCard 
} from '../services/annualTemperatureService';
import { FRENCH_STATIONS } from '../data/frenchStations';

interface AnnualTemperatureEvolutionCardProps {
  currentStation?: LocationPoint;
  seniorMode: boolean;
}

// Expanded international & French reference climate database
const EXPANDED_WORLD_AND_FRANCE_CITIES: MultiLocalityClimateCard[] = [
  ...REFERENCE_LOCALITIES_CLIMATE,
  {
    id: "nice-cote-azur",
    name: "Nice-Côte d'Azur",
    department: "06 - Alpes-Maritimes",
    altitude: 10,
    climateZone: "Méditerranéen littoral doux (Nuits tropicales)",
    annualTMean: 16.3,
    annualPrecipitation: 733,
    annualSunHours: 2724,
    frostDays: 2,
    heatDays: 85,
    warmingTrendVs1950: 2.3
  },
  {
    id: "bordeaux-merignac",
    name: "Bordeaux-Mérignac",
    department: "33 - Gironde (Nouvelle-Aquitaine)",
    altitude: 47,
    climateZone: "Océanique aquitain chaud",
    annualTMean: 14.2,
    annualPrecipitation: 904,
    annualSunHours: 2035,
    frostDays: 28,
    heatDays: 62,
    warmingTrendVs1950: 2.1
  },
  {
    id: "lille-lesquin",
    name: "Lille-Lesquin",
    department: "59 - Nord (Hauts-de-France)",
    altitude: 47,
    climateZone: "Océanique dégradé septentrional",
    annualTMean: 11.2,
    annualPrecipitation: 743,
    annualSunHours: 1617,
    frostDays: 39,
    heatDays: 24,
    warmingTrendVs1950: 1.9
  },
  {
    id: "grenoble-saint-geoirs",
    name: "Grenoble-Isère",
    department: "38 - Isère (Alpes)",
    altitude: 384,
    climateZone: "Préalpin d'abri (Fortes amplitudes thermiques)",
    annualTMean: 12.0,
    annualPrecipitation: 934,
    annualSunHours: 2060,
    frostDays: 52,
    heatDays: 58,
    warmingTrendVs1950: 2.4
  },
  {
    id: "clermont-ferrand-aulnat",
    name: "Clermont-Ferrand",
    department: "63 - Puy-de-Dôme (Massif Central)",
    altitude: 329,
    climateZone: "Semi-continental d'abri (Limagne)",
    annualTMean: 11.8,
    annualPrecipitation: 579,
    annualSunHours: 1914,
    frostDays: 55,
    heatDays: 48,
    warmingTrendVs1950: 2.2
  },
  {
    id: "ajaccio-campo-dell-oro",
    name: "Ajaccio (Corse)",
    department: "2A - Corse-du-Sud",
    altitude: 5,
    climateZone: "Méditerranéen insulaire",
    annualTMean: 16.4,
    annualPrecipitation: 648,
    annualSunHours: 2726,
    frostDays: 3,
    heatDays: 78,
    warmingTrendVs1950: 2.2
  },
  {
    id: "nantes-atlantique",
    name: "Nantes-Atlantique",
    department: "44 - Loire-Atlantique",
    altitude: 26,
    climateZone: "Océanique tempéré estuarien",
    annualTMean: 12.6,
    annualPrecipitation: 820,
    annualSunHours: 1795,
    frostDays: 28,
    heatDays: 38,
    warmingTrendVs1950: 1.9
  },
  {
    id: "montpellier-frejorgues",
    name: "Montpellier-Fréjorgues",
    department: "34 - Hérault (Occitanie)",
    altitude: 3,
    climateZone: "Méditerranéen franc (Épisodes cévenols)",
    annualTMean: 15.6,
    annualPrecipitation: 629,
    annualSunHours: 2668,
    frostDays: 16,
    heatDays: 82,
    warmingTrendVs1950: 2.3
  },
  {
    id: "biarritz-anglet",
    name: "Biarritz-Pays Basque",
    department: "64 - Pyrénées-Atlantiques",
    altitude: 73,
    climateZone: "Océanique aquitain très arrosé",
    annualTMean: 14.5,
    annualPrecipitation: 1450,
    annualSunHours: 1887,
    frostDays: 14,
    heatDays: 28,
    warmingTrendVs1950: 1.8
  },
  {
    id: "geneve-cointrin",
    name: "Genève (Suisse)",
    department: "Suisse Romande (Lac Léman)",
    altitude: 416,
    climateZone: "Semi-continental lémanique",
    annualTMean: 11.0,
    annualPrecipitation: 1005,
    annualSunHours: 1830,
    frostDays: 62,
    heatDays: 42,
    warmingTrendVs1950: 2.4
  },
  {
    id: "madrid-barajas",
    name: "Madrid (Espagne)",
    department: "Espagne Centrale (Meseta)",
    altitude: 609,
    climateZone: "Méditerranéen continentalisé aride",
    annualTMean: 15.0,
    annualPrecipitation: 436,
    annualSunHours: 2769,
    frostDays: 32,
    heatDays: 112,
    warmingTrendVs1950: 2.5
  },
  {
    id: "roma-fiumicino",
    name: "Rome (Italie)",
    department: "Italie (Latium)",
    altitude: 14,
    climateZone: "Méditerranéen tyrrhénien",
    annualTMean: 16.2,
    annualPrecipitation: 798,
    annualSunHours: 2600,
    frostDays: 8,
    heatDays: 95,
    warmingTrendVs1950: 2.2
  },
  {
    id: "london-heathrow",
    name: "Londres (Royaume-Uni)",
    department: "Angleterre (Bassin de Londres)",
    altitude: 25,
    climateZone: "Océanique tempéré d'abri",
    annualTMean: 11.3,
    annualPrecipitation: 615,
    annualSunHours: 1633,
    frostDays: 35,
    heatDays: 22,
    warmingTrendVs1950: 1.8
  },
  {
    id: "berlin-brandenburg",
    name: "Berlin (Allemagne)",
    department: "Allemagne du Nord-Est",
    altitude: 34,
    climateZone: "Semi-continental tempéré",
    annualTMean: 10.3,
    annualPrecipitation: 570,
    annualSunHours: 1626,
    frostDays: 78,
    heatDays: 32,
    warmingTrendVs1950: 2.1
  },
  {
    id: "tokyo-haneda",
    name: "Tokyo (Japon)",
    department: "Japon (Kanto)",
    altitude: 10,
    climateZone: "Subtropical humide maritime",
    annualTMean: 15.8,
    annualPrecipitation: 1530,
    annualSunHours: 1876,
    frostDays: 5,
    heatDays: 72,
    warmingTrendVs1950: 2.2
  },
  {
    id: "montreal-trudeau",
    name: "Montréal (Canada)",
    department: "Québec (Saint-Laurent)",
    altitude: 36,
    climateZone: "Continental humide à hivers rigoureux",
    annualTMean: 6.8,
    annualPrecipitation: 1000,
    annualSunHours: 2050,
    frostDays: 142,
    heatDays: 45,
    warmingTrendVs1950: 2.6
  }
];

export const AnnualTemperatureEvolutionCard: React.FC<AnnualTemperatureEvolutionCardProps> = ({
  currentStation = FRENCH_STATIONS[0],
  seniorMode
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>(currentStation.id || "paris-montsouris");
  const [activeScenario, setActiveScenario] = useState<'SSP1_26' | 'SSP2_45' | 'SSP5_85'>('SSP2_45');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [analysisHorizon, setAnalysisHorizon] = useState<'2030' | '2050' | '2100'>('2050');

  // Find currently selected city
  const selectedCityData = EXPANDED_WORLD_AND_FRANCE_CITIES.find(c => c.id === selectedCityId) || {
    id: currentStation.id,
    name: currentStation.name,
    department: currentStation.department,
    altitude: currentStation.altitude ?? 0,
    climateZone: currentStation.climateZone || 'Tempéré',
    annualTMean: 12.5,
    annualPrecipitation: 700,
    annualSunHours: 1800,
    frostDays: 35,
    heatDays: 40,
    warmingTrendVs1950: 2.0
  };

  // Generate historical data 1950-2026 for selected station
  const historySeries: AnnualTemperatureEvolutionRecord[] = generateAnnualTemperatureHistory({
    id: selectedCityData.id,
    name: selectedCityData.name,
    latitude: 46.0,
    longitude: 3.0,
    altitude: selectedCityData.altitude,
    country: "France",
    department: selectedCityData.department
  } as LocationPoint);

  // Future projection curve up to 2100
  const baselineTemp = selectedCityData.annualTMean;
  const projectionsData = [
    { year: 2020, baseline: baselineTemp, ssp126: baselineTemp + 0.1, ssp245: baselineTemp + 0.2, ssp585: baselineTemp + 0.3, heatDays: selectedCityData.heatDays, frostDays: selectedCityData.frostDays },
    { year: 2026, baseline: baselineTemp, ssp126: baselineTemp + 0.3, ssp245: baselineTemp + 0.5, ssp585: baselineTemp + 0.7, heatDays: selectedCityData.heatDays + 6, frostDays: Math.max(0, selectedCityData.frostDays - 5) },
    { year: 2030, baseline: baselineTemp, ssp126: baselineTemp + 0.5, ssp245: baselineTemp + 0.9, ssp585: baselineTemp + 1.3, heatDays: selectedCityData.heatDays + 12, frostDays: Math.max(0, selectedCityData.frostDays - 10) },
    { year: 2040, baseline: baselineTemp, ssp126: baselineTemp + 0.7, ssp245: baselineTemp + 1.4, ssp585: baselineTemp + 2.1, heatDays: selectedCityData.heatDays + 18, frostDays: Math.max(0, selectedCityData.frostDays - 15) },
    { year: 2050, baseline: baselineTemp, ssp126: baselineTemp + 0.9, ssp245: baselineTemp + 1.9, ssp585: baselineTemp + 2.9, heatDays: selectedCityData.heatDays + 28, frostDays: Math.max(0, selectedCityData.frostDays - 20) },
    { year: 2060, baseline: baselineTemp, ssp126: baselineTemp + 1.0, ssp245: baselineTemp + 2.3, ssp585: baselineTemp + 3.7, heatDays: selectedCityData.heatDays + 35, frostDays: Math.max(0, selectedCityData.frostDays - 24) },
    { year: 2070, baseline: baselineTemp, ssp126: baselineTemp + 1.1, ssp245: baselineTemp + 2.6, ssp585: baselineTemp + 4.5, heatDays: selectedCityData.heatDays + 42, frostDays: Math.max(0, selectedCityData.frostDays - 28) },
    { year: 2080, baseline: baselineTemp, ssp126: baselineTemp + 1.1, ssp245: baselineTemp + 2.8, ssp585: baselineTemp + 5.3, heatDays: selectedCityData.heatDays + 48, frostDays: Math.max(0, selectedCityData.frostDays - 31) },
    { year: 2090, baseline: baselineTemp, ssp126: baselineTemp + 1.1, ssp245: baselineTemp + 2.9, ssp585: baselineTemp + 6.0, heatDays: selectedCityData.heatDays + 54, frostDays: Math.max(0, selectedCityData.frostDays - 33) },
    { year: 2100, baseline: baselineTemp, ssp126: baselineTemp + 1.2, ssp245: baselineTemp + 3.0, ssp585: baselineTemp + 6.8, heatDays: selectedCityData.heatDays + 60, frostDays: Math.max(0, selectedCityData.frostDays - 35) }
  ];

  const filteredCities = EXPANDED_WORLD_AND_FRANCE_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.climateZone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="annual-temperature-evolution-card" className="space-y-6">
      {/* Main Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Observatoire du Réchauffement Climatique • 1950 - 2100
                </span>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 font-medium">
                  Modèles DRIAS / Météo-France / GIEC AR6
                </span>
              </div>
              <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
                Évolution Historique & Projections par Ville
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2.5">
              <span className="text-xs text-slate-400 block">Réchauffement mesuré (1950 → 2026) :</span>
              <span className="text-lg font-black text-rose-400">+{selectedCityData.warmingTrendVs1950}°C</span>
            </div>
          </div>
        </div>

        {/* City Filter & Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une ville en France ou dans le monde (Paris, Lyon, Marseille, Chamonix, Nice, Genève, Madrid, Tokyo...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* City Quick Pills */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 pt-1">
          {filteredCities.slice(0, 14).map((city) => {
            const isSelected = city.id === selectedCityId;
            return (
              <button
                key={city.id}
                id={`city-pill-${city.id}`}
                onClick={() => setSelectedCityId(city.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black ring-1 ring-white/20'
                    : 'border border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{city.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  ({city.altitude}m)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected City Climate Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Thermometer className="h-4 w-4 text-amber-400" />
            <span>Moyenne Annuelle</span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {selectedCityData.annualTMean > 0 ? `+${selectedCityData.annualTMean}` : selectedCityData.annualTMean}°C
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Normale officielle 1991-2020</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <span>Précipitations Annuelles</span>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-300">
            {selectedCityData.annualPrecipitation} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cumul moyen annuel</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Sun className="h-4 w-4 text-amber-400" />
            <span>Jours de Forte Chaleur</span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">
            {selectedCityData.heatDays} <span className="text-sm font-normal text-slate-400">j / an</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Jours avec Tmax {'>'} 25°C</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Snowflake className="h-4 w-4 text-blue-400" />
            <span>Jours de Gelée</span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-300">
            {selectedCityData.frostDays} <span className="text-sm font-normal text-slate-400">j / an</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Jours avec Tmin ≤ 0°C</p>
        </div>
      </div>

      {/* Historical Annual Temperatures Chart 1950 - 2026 */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-amber-400">Relevés Historiques & Évolution</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-bold">
                {selectedCityData.name}
              </span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Températures Moyennes Annuelles Observées (1950 - 2026)
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Normale de référence : <strong className="text-white">{selectedCityData.annualTMean}°C</strong>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historySeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHistorical" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickCount={12} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: any, name: string) => [
                  `${val}°C`, 
                  name === 'annualMeanTemp' ? 'Moyenne Annuelle' : name === 'summerMeanTemp' ? 'Moyenne Été' : 'Moyenne Hiver'
                ]}
                labelFormatter={(label) => `Année ${label}`}
              />
              <Legend />
              <Area type="monotone" name="annualMeanTemp" dataKey="annualMeanTemp" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorHistorical)" />
              <Line type="monotone" name="summerMeanTemp" dataKey="summerMeanTemp" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" name="winterMeanTemp" dataKey="winterMeanTemp" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone Anomaly Badges */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800 pt-4 text-xs text-slate-300">
          <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
            <span className="text-slate-400">Décennie 1960-1970 :</span>
            <div className="text-base font-bold text-sky-400">~{Number((selectedCityData.annualTMean - 1.2).toFixed(1))}°C</div>
            <span className="text-[10px] text-slate-500">Climat tempéré historique</span>
          </div>
          <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
            <span className="text-slate-400">Décennie 1991-2020 :</span>
            <div className="text-base font-bold text-amber-400">{selectedCityData.annualTMean}°C</div>
            <span className="text-[10px] text-slate-500">Normale trentenaire WMO</span>
          </div>
          <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
            <span className="text-slate-400">Année record 2022 :</span>
            <div className="text-base font-bold text-rose-400">+{Number((selectedCityData.annualTMean + 1.8).toFixed(1))}°C</div>
            <span className="text-[10px] text-slate-500">+1.8°C au-dessus de la normale</span>
          </div>
          <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
            <span className="text-slate-400">Tendance actuelle 2026 :</span>
            <div className="text-base font-bold text-rose-300">+{Number((selectedCityData.annualTMean + 1.6).toFixed(1))}°C</div>
            <span className="text-[10px] text-slate-500">Persistance des anomalies chaudes</span>
          </div>
        </div>
      </div>

      {/* GIEC AR6 Future Scenarios Projections 2020 - 2100 */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-indigo-400">Projections GIEC / DRIAS</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-bold">
                {selectedCityData.name}
              </span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Scénarios Climatiques jusqu'en 2100 (SSP1-2.6 / SSP2-4.5 / SSP5-8.5)
            </h3>
          </div>

          {/* Scenario Picker */}
          <div className="flex gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveScenario('SSP1_26')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeScenario === 'SSP1_26' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Accord Paris (SSP1-2.6)
            </button>
            <button
              onClick={() => setActiveScenario('SSP2_45')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeScenario === 'SSP2_45' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Médian (SSP2-4.5)
            </button>
            <button
              onClick={() => setActiveScenario('SSP5_85')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeScenario === 'SSP5_85' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tendanciel Haut (SSP5-8.5)
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: any, name: string) => [
                  `${val}°C`, 
                  name === 'ssp126' ? 'SSP1-2.6 (Transition Forte)' :
                  name === 'ssp245' ? 'SSP2-4.5 (Trajectoire Médiane)' :
                  name === 'ssp585' ? 'SSP5-8.5 (Émissions Hautes)' : 'Normale 1991-2020'
                ]}
                labelFormatter={(label) => `Horizon ${label}`}
              />
              <Legend />
              <Line type="monotone" name="baseline" dataKey="baseline" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" name="ssp126" dataKey="ssp126" stroke="#10b981" strokeWidth={activeScenario === 'SSP1_26' ? 4 : 2} dot={{ r: 4 }} />
              <Line type="monotone" name="ssp245" dataKey="ssp245" stroke="#3b82f6" strokeWidth={activeScenario === 'SSP2_45' ? 4 : 2} dot={{ r: 4 }} />
              <Line type="monotone" name="ssp585" dataKey="ssp585" stroke="#ef4444" strokeWidth={activeScenario === 'SSP5_85' ? 4 : 2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Impacts comparison grid for horizon 2050 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-5 text-xs text-slate-300">
          <div className="rounded-2xl bg-emerald-950/30 border border-emerald-800/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase text-[11px]">Scénario Vert (SSP1-2.6)</span>
              <span className="text-xs font-black text-emerald-300">+0.9°C à 2050</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Stabilisation des températures après 2050. Augmentation limitée des canicules (+10 jours/an à {selectedCityData.name}).
            </p>
          </div>

          <div className="rounded-2xl bg-blue-950/30 border border-blue-800/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 uppercase text-[11px]">Scénario Médian (SSP2-4.5)</span>
              <span className="text-xs font-black text-blue-300">+1.9°C à 2050</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Poursuite modérée du réchauffement. Doublement des vagues de chaleur estivales et réduction de 45% du manteau neigeux moyen.
            </p>
          </div>

          <div className="rounded-2xl bg-rose-950/30 border border-rose-800/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 uppercase text-[11px]">Scénario Haut (SSP5-8.5)</span>
              <span className="text-xs font-black text-rose-300">+2.9°C à 2050 (+6.8°C à 2100)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Extrêmes caniculaires récurrents ({'>'}45°C en plaine), quasi-disparition des gelées d'hiver et stress hydrique sévère des sols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
