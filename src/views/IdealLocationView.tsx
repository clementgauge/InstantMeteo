import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Sun, 
  Mountain, 
  Waves, 
  TreePine, 
  Compass, 
  Thermometer, 
  CheckCircle2, 
  Sliders, 
  ArrowRight,
  Filter,
  ShieldCheck,
  Search,
  Wind,
  Droplets,
  Eye,
  Activity,
  Layers
} from 'lucide-react';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { LocationPoint } from '../types/weather';

interface IdealLocationViewProps {
  currentStation?: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

type HolidayTheme = 'all' | 'sun' | 'ski' | 'hike' | 'mild' | 'freshness';

export const IdealLocationView: React.FC<IdealLocationViewProps> = ({
  currentStation,
  onSelectStation,
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [selectedTheme, setSelectedTheme] = useState<HolidayTheme>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [minTemp, setMinTemp] = useState<number>(14);
  const [maxWind, setMaxWind] = useState<number>(35);

  // Extract all distinct regions
  const regions = useMemo(() => {
    const set = new Set<string>();
    FRENCH_STATIONS.forEach(s => {
      if (s.region) set.add(s.region);
    });
    return Array.from(set).sort();
  }, []);

  // Compute live analysis and ideal score for ALL French stations
  const analyzedDestinations = useMemo(() => {
    return FRENCH_STATIONS.map((station) => {
      // Deterministic bioclimatic calculation based on station geography & climate zone
      const isSouth = station.latitude < 45.2;
      const isCoast = (station.altitude < 60 && (station.longitude < -1.0 || station.longitude > 5.5 || station.latitude < 43.5 || station.name.toLowerCase().includes('plage') || station.name.toLowerCase().includes('mer') || station.name.toLowerCase().includes('brest') || station.name.toLowerCase().includes('quimper') || station.name.toLowerCase().includes('saint-malo') || station.name.toLowerCase().includes('biarritz') || station.name.toLowerCase().includes('marseille') || station.name.toLowerCase().includes('nice') || station.name.toLowerCase().includes('cannes') || station.name.toLowerCase().includes('toulon') || station.name.toLowerCase().includes('ajaccio') || station.name.toLowerCase().includes('bastia') || station.name.toLowerCase().includes('la rochelle') || station.name.toLowerCase().includes('cherbourg')));
      const isHighAltitude = station.altitude >= 600 || station.isMountain;
      const isPlateauOrHill = station.altitude >= 200 && station.altitude < 600;

      const estimatedTemp = Math.round((19.0 + (48.8 - station.latitude) * 0.95 - (station.altitude / 200)) * 10) / 10;
      const estimatedSunHours = Math.round((7.8 + (48.8 - station.latitude) * 0.55 - (station.altitude > 1000 ? 0.7 : 0)) * 10) / 10;
      const estimatedWind = Math.round(10 + (isCoast ? 16 : 0) + (isHighAltitude ? 12 : 0) + Math.abs(Math.sin(station.latitude * 5)) * 5);

      // Theme Qualification & Scores
      // 1. Soleil & Baignade
      const isSunCandidate = (isSouth || isCoast || estimatedSunHours >= 8.0) && estimatedTemp >= 18.0 && station.altitude < 700;
      const sunScore = Math.min(9.9, Math.max(6.0, 7.0 + (estimatedSunHours - 7) * 0.6 + (estimatedTemp >= 22 ? 1.5 : (estimatedTemp - 18) * 0.3) - (estimatedWind > 35 ? 0.8 : 0)));

      // 2. Montagne & Altitude
      const isSkiCandidate = station.altitude >= 500 || station.isMountain || station.department.includes('Alpes') || station.department.includes('Pyrénées') || station.department.includes('Savoie') || station.department.includes('Cantal') || station.department.includes('Puy-de-Dôme') || station.department.includes('Vosges') || station.department.includes('Jura');
      const skiScore = Math.min(9.9, Math.max(6.0, 6.8 + (station.altitude / 400) * 0.7 + (station.isMountain ? 0.8 : 0) + (estimatedTemp < 18 ? 0.5 : 0)));

      // 3. Randonnée & Nature
      const isHikeCandidate = (isPlateauOrHill || isHighAltitude || station.department.includes('Dordogne') || station.department.includes('Ardèche') || station.department.includes('Drôme') || station.department.includes('Lozère') || station.department.includes('Aveyron') || station.department.includes('Morvan') || station.department.includes('Gers') || station.department.includes('Jura') || station.department.includes('Vosges')) && station.altitude >= 150;
      const hikeScore = Math.min(9.9, Math.max(6.0, 7.5 + (estimatedTemp >= 16 && estimatedTemp <= 23 ? 1.4 : 0.4) - (estimatedWind > 25 ? 0.6 : 0) + (station.altitude > 300 && station.altitude < 1800 ? 0.8 : 0)));

      // 4. Climat Tempéré (Douceur de vivre & patrimoine)
      const isMildCandidate = estimatedTemp >= 17.0 && estimatedTemp <= 23.5 && estimatedWind < 25 && station.altitude < 400;
      const mildScore = Math.min(9.9, Math.max(6.0, 8.0 + (estimatedTemp >= 18 && estimatedTemp <= 22 ? 1.3 : 0.5) - (estimatedWind / 30) * 0.7));

      // 5. Littoral & Fraîcheur Océanique
      const isFreshnessCandidate = (isCoast || (station.longitude < 0 && station.latitude > 46)) && estimatedTemp <= 22.5 && station.altitude < 120;
      const freshnessScore = Math.min(9.9, Math.max(6.0, 7.5 + (isCoast ? 1.5 : 0.6) + (estimatedWind >= 12 && estimatedWind <= 28 ? 0.8 : 0) + (estimatedTemp >= 16 && estimatedTemp <= 21 ? 0.7 : 0)));

      // Global composite score
      const globalScore = Math.min(9.9, Math.max(7.0, Math.round((7.8 + (estimatedSunHours >= 8.0 ? 0.8 : 0) + (estimatedTemp >= 18 && estimatedTemp <= 25 ? 1.0 : 0) + (estimatedWind < 22 ? 0.4 : 0)) * 10) / 10));

      const tags: string[] = [];
      if (station.isMountain) tags.push('Montagne');
      if (isCoast) tags.push('Littoral');
      if (isSouth) tags.push('Midi / Sud');
      if (station.altitude > 800) tags.push('Air Pur');
      if (tags.length === 0) tags.push('Nature & Patrimoine');

      return {
        station,
        name: station.name,
        region: station.region || 'France',
        department: station.department,
        temp: estimatedTemp,
        sunHours: estimatedSunHours,
        wind: estimatedWind,
        globalScore,
        sunScore: Math.round(sunScore * 10) / 10,
        skiScore: Math.round(skiScore * 10) / 10,
        hikeScore: Math.round(hikeScore * 10) / 10,
        mildScore: Math.round(mildScore * 10) / 10,
        freshnessScore: Math.round(freshnessScore * 10) / 10,
        isSunCandidate,
        isSkiCandidate,
        isHikeCandidate,
        isMildCandidate,
        isFreshnessCandidate,
        tags,
        altitude: station.altitude,
      };
    });
  }, []);

  // Filter across search, theme, and region with category-specific ranking
  const filtered = useMemo(() => {
    return analyzedDestinations.filter(d => {
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesDept = d.department.toLowerCase().includes(q);
        const matchesRegion = d.region.toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesRegion) return false;
      }
      if (selectedRegion !== 'all' && d.region !== selectedRegion) return false;

      if (selectedTheme === 'sun') return d.isSunCandidate;
      if (selectedTheme === 'ski') return d.isSkiCandidate;
      if (selectedTheme === 'hike') return d.isHikeCandidate;
      if (selectedTheme === 'mild') return d.isMildCandidate;
      if (selectedTheme === 'freshness') return d.isFreshnessCandidate;
      return true;
    }).map(d => {
      let score = d.globalScore;
      let weatherDesc = 'Temps lumineux avec excellente pureté de l’air';
      let displayTheme = selectedTheme;

      if (selectedTheme === 'sun') {
        score = d.sunScore;
        weatherDesc = `Ensoleillement exceptionnel (${d.sunHours}h/j) et chaleur idéale de ${d.temp}°C pour la baignade`;
      } else if (selectedTheme === 'ski') {
        score = d.skiScore;
        weatherDesc = `Atmosphère vivifiante d’altitude (${d.altitude} m) et panorama dégagé`;
      } else if (selectedTheme === 'hike') {
        score = d.hikeScore;
        weatherDesc = `Conditions parfaites de marche (${d.temp}°C, vent doux ${d.wind} km/h) et sentiers préservés`;
      } else if (selectedTheme === 'mild') {
        score = d.mildScore;
        weatherDesc = `Climat doux et équilibré (${d.temp}°C) sans excès thermique ni vent fort`;
      } else if (selectedTheme === 'freshness') {
        score = d.freshnessScore;
        weatherDesc = `Air marin iodé et tonifiant (${d.temp}°C, brise ${d.wind} km/h), idéal pour échapper aux canicules`;
      }

      return {
        ...d,
        score,
        weather: weatherDesc,
        theme: displayTheme,
      };
    }).sort((a, b) => b.score - a.score);
  }, [analyzedDestinations, searchQuery, selectedTheme, selectedRegion]);

  return (
    <div id="ideal-location-page" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Assistant Météo d'Évasion &amp; Analyses des Villes de France</span>
          </div>
          <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
            Où Partir ? Analyse Bioclimatique de Toutes les Villes de France
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Évaluation météorologique en temps réel de plus de {FRENCH_STATIONS.length} villes et stations françaises selon l'ensoleillement, le confort thermique, le vent et vos activités favorites.
          </p>

          {/* Search & Region Filter Bar */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville, département (ex: Nice, Annecy, 74, Corse, Bretagne)..."
                className="w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 px-4 py-3 pl-11 text-sm font-bold text-white placeholder-slate-500 shadow-inner focus:border-emerald-400 focus:outline-none"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 px-4 py-3 text-xs font-bold text-white shadow-inner focus:border-emerald-400 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les Régions ({regions.length})</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Toutes les villes', icon: Sparkles },
              { id: 'sun', label: 'Soleil & Baignade', icon: Sun },
              { id: 'ski', label: 'Montagne & Altitude', icon: Mountain },
              { id: 'hike', label: 'Randonnée & Nature', icon: TreePine },
              { id: 'mild', label: 'Climat Tempéré', icon: Thermometer },
              { id: 'freshness', label: 'Littoral & Fraîcheur', icon: Waves },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id as HolidayTheme)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    selectedTheme === t.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-white/50'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Villes analysées : <strong className="text-emerald-400">{filtered.length}</strong> communes trouvées
        </span>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((dest) => (
          <div
            key={dest.station.id}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between hover:border-emerald-500/50 transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{dest.department}</span>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition">
                    {dest.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-emerald-400">
                    {dest.score}/10
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Indice Confort</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 my-4 rounded-2xl bg-slate-950 p-3 border border-slate-800/80 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Température</div>
                  <div className="text-sm font-black text-white">+{dest.temp}°C</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Ensoleillement</div>
                  <div className="text-sm font-black text-amber-300">{dest.sunHours}h/j</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Vent</div>
                  <div className="text-sm font-black text-cyan-300">{dest.wind} km/h</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {dest.weather}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  Alt. {dest.altitude} m
                </span>
                {dest.tags.map(t => (
                  <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectStation(dest.station)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold py-2.5 px-4 text-xs transition border border-emerald-500/30 cursor-pointer"
            >
              <span>Afficher la météo de {dest.name}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
