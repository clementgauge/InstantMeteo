import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MapPin, 
  Search, 
  Calendar, 
  Globe, 
  Thermometer, 
  CloudRain, 
  Wind, 
  ShieldAlert, 
  Sparkles, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Radar as RadarIcon, 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  RefreshCw,
  Sun,
  Flame,
  Snowflake,
  Mountain
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { searchLocalities } from '../services/openMeteoService';
import { 
  CommunalFourWeekBulletinData, 
  CommunalFourWeekBulletinWeek, 
  generateCommunalFourWeekBulletin 
} from '../services/communalFourWeekBulletinService';

interface CommunalFourWeekBulletinCardProps {
  currentStation: LocationPoint;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
}

export const CommunalFourWeekBulletinCard: React.FC<CommunalFourWeekBulletinCardProps> = ({
  currentStation,
  seniorMode = false,
  tempUnit = 'C',
  onSelectStation
}) => {
  const [selectedCommune, setSelectedCommune] = useState<LocationPoint>(currentStation);
  const [bulletin, setBulletin] = useState<CommunalFourWeekBulletinData>(() => generateCommunalFourWeekBulletin(currentStation));
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationPoint[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Sync if currentStation changes
  useEffect(() => {
    setSelectedCommune(currentStation);
    setBulletin(generateCommunalFourWeekBulletin(currentStation));
  }, [currentStation]);

  // Regenerate when selected commune changes
  const handleSelectCommune = (commune: LocationPoint) => {
    setSelectedCommune(commune);
    setBulletin(generateCommunalFourWeekBulletin(commune));
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (onSelectStation) {
      onSelectStation(commune);
    }
  };

  // Search handler (searches preloaded stations + Open-Meteo 36,000 communes)
  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const q = val.toLowerCase().trim();
    const localMatches = FRENCH_STATIONS.filter(s => 
      s.name.toLowerCase().includes(q) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.postalCode && s.postalCode.startsWith(q))
    ).slice(0, 8);

    setSearchResults(localMatches);
    setShowSearchDropdown(true);

    if (val.length >= 3) {
      setIsSearching(true);
      try {
        const remoteResults = await searchLocalities(val);
        if (remoteResults && remoteResults.length > 0) {
          // Combine without duplicates
          const combined = [...localMatches];
          for (const rem of remoteResults) {
            if (!combined.some(c => c.name.toLowerCase() === rem.name.toLowerCase() && Math.abs(c.latitude - rem.latitude) < 0.05)) {
              combined.push(rem);
            }
          }
          setSearchResults(combined.slice(0, 12));
        }
      } catch (err) {
        console.warn('Remote geocoding error:', err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleCopyBulletin = () => {
    if (!bulletin) return;
    const textToCopy = `=== BULLETIN MÉTÉOROLOGIQUE OFFICIEL À 4 SEMAINES ===\n` +
      `Commune : ${bulletin.commune.name} (${bulletin.commune.department || 'France'}, alt. ${bulletin.commune.altitude || 100}m)\n` +
      `Édition : ${bulletin.generatedAtFormatted}\n` +
      `Radar Doppler de référence : ${bulletin.nearestRadar.name} (${bulletin.nearestRadar.distanceKm} km)\n\n` +
      `[SYNTHÈSE EXÉCUTIVE]\n${bulletin.executiveSynthesisText}\n\n` +
      bulletin.weeks.map(w => 
        `-- ${w.weekLabel} (${w.dateRangeFormatted}) --\n` +
        `Scénario dominant (${w.dominantScenario.probabilityPct}%) : ${w.dominantScenario.title}\n` +
        `Régime : ${w.dominantScenario.synopticRegime}\n` +
        `Températures prévues : Min ${w.dominantScenario.tempMinExpectedC}°C / Max ${w.dominantScenario.tempMaxExpectedC}°C (Anomalie: ${w.dominantScenario.temperatureAnomalyC > 0 ? '+' : ''}${w.dominantScenario.temperatureAnomalyC}°C)\n` +
        `Précipitations estimées : ${w.dominantScenario.rainAccumulationEstimatedMm} mm\n` +
        `Diagnostic : ${w.dominantScenario.communeSpecificText}\n`
      ).join('\n') +
      `\n[BILAN AGRO-HYDROLOGIQUE]\n${bulletin.agroHydrologicalSummary}\n\n` +
      `[CONSEIL SENIOR & SANTÉ]\n${bulletin.seniorRecommendation}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedWeek: CommunalFourWeekBulletinWeek = bulletin.weeks.find(w => w.weekIndex === selectedWeekIndex) || bulletin.weeks[0];

  const formatTemp = (c: number) => {
    if (tempUnit === 'F') return `${Math.round((c * 9/5 + 32) * 10) / 10}°F`;
    return `${c > 0 ? '+' : ''}${c}°C`;
  };

  return (
    <div id="communal-four-week-bulletin-card" className="space-y-6">
      {/* Search Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
                <MapPin className="h-4 w-4" />
                <span>Bulletin Textuel à 4 Semaines • Disponible pour TOUTES les 36 000+ Communes de France</span>
              </div>
              <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
                Bulletin Météorologique 4 Semaines : <span className="text-cyan-400">{selectedCommune.name}</span>
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Expertise météorologique rédigée à l'échelle communale (S+1 à S+4) • Diagnostic synoptique, températures attendues, cumuls de pluie, normales 1991-2020 et bilans agro-climatiques.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBulletin}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition shadow"
                title="Copier l'intégralité du bulletin texte"
              >
                {copiedSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-cyan-400" />}
                <span>{copiedSuccess ? 'Copié !' : 'Copier Texte'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition shadow hidden sm:flex"
                title="Imprimer ou enregistrer en PDF"
              >
                <Printer className="h-4 w-4 text-indigo-400" />
                <span>Imprimer / PDF</span>
              </button>

              <button
                onClick={() => setBulletin(generateCommunalFourWeekBulletin(selectedCommune))}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-3.5 py-2 text-xs font-bold transition shadow"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Réactualiser</span>
              </button>
            </div>
          </div>

          {/* Search Commune Input */}
          <div className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Tapez le nom de n'importe quelle commune de France (ex: Annecy, Biarritz, Saint-Malo, Corte, Dinan...)"
                className="w-full rounded-2xl bg-slate-950/90 border border-cyan-500/40 pl-12 pr-10 py-3 text-sm text-white placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              {isSearching && (
                <div className="absolute right-4">
                  <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950 border-b border-slate-800">
                  Résultats de recherche ({searchResults.length} communes trouvées)
                </div>
                {searchResults.map((st) => (
                  <button
                    key={`${st.name}-${st.latitude}-${st.longitude}`}
                    onClick={() => handleSelectCommune(st)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800/50 flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-bold text-white text-sm block">{st.name}</span>
                      <span className="text-xs text-slate-400">
                        {st.department || st.region || 'France'} • Alt. {st.altitude || 100} m • {st.climateZone || 'Climat tempéré'}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Commune Metadata Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Département & Région</span>
              <span className="text-xs font-bold text-white truncate block">{selectedCommune.department || selectedCommune.region || 'France'}</span>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Altitude & Étage</span>
              <span className="text-xs font-bold text-emerald-400">{selectedCommune.altitude || 100} m • {bulletin.climaticContext.elevationTier}</span>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Radar Doppler ARAMIS</span>
              <span className="text-xs font-bold text-cyan-400 truncate block">
                {bulletin.nearestRadar.name} ({bulletin.nearestRadar.distanceKm} km)
              </span>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Normales Référence</span>
              <span className="text-xs font-bold text-amber-300">
                Moy. {bulletin.climaticContext.normalTempAnnualC}°C • {bulletin.climaticContext.normalPrecipAnnualMm} mm/mois
              </span>
            </div>
          </div>

          {/* Executive Synthesis Box */}
          <div className="rounded-2xl bg-slate-950/90 border border-cyan-500/30 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-black uppercase tracking-wider text-xs">
              <Sparkles className="h-4 w-4" />
              <span>Synthèse Climatologique Officielle à 4 Semaines pour {selectedCommune.name} :</span>
            </div>
            <p>{bulletin.executiveSynthesisText}</p>
          </div>
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {bulletin.weeks.map((w) => {
          const isSelected = w.weekIndex === selectedWeekIndex;
          const isWarm = w.dominantScenario.temperatureAnomalyC > 0;
          return (
            <button
              key={w.weekIndex}
              onClick={() => setSelectedWeekIndex(w.weekIndex)}
              className={`rounded-2xl p-4 text-left border transition relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-cyan-400">Semaine {w.weekIndex}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isWarm ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {formatTemp(w.dominantScenario.temperatureAnomalyC)} vs normale
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">{w.dateRangeFormatted}</span>
              <div className="mt-2 flex items-center justify-between text-xs font-bold">
                <span className="text-white">{w.dominantScenario.tempMinExpectedC}° / {w.dominantScenario.tempMaxExpectedC}°C</span>
                <span className="text-blue-400 flex items-center gap-1">
                  <CloudRain className="h-3 w-3" />
                  {w.dominantScenario.rainAccumulationEstimatedMm} mm
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Week Detailed Communal Analysis */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-wider mb-1">
              <Calendar className="h-4 w-4" />
              <span>{selectedWeek.weekLabel} • {selectedWeek.dateRangeFormatted}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {selectedWeek.dominantScenario.title}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Régime synoptique : <strong className="text-slate-200">{selectedWeek.dominantScenario.synopticRegime}</strong> • Indice de confiance : <strong className="text-emerald-400">{selectedWeek.dominantScenario.confidenceScorePercent}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Min / Max Prévus</span>
              <span className="text-base font-black text-white">
                {selectedWeek.dominantScenario.tempMinExpectedC}° / {selectedWeek.dominantScenario.tempMaxExpectedC}°C
              </span>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pluviométrie</span>
              <span className="text-base font-black text-blue-400">
                {selectedWeek.dominantScenario.rainAccumulationEstimatedMm} mm
              </span>
            </div>
          </div>
        </div>

        {/* Textual Detailed Communal Forecast */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Texte du Bulletin Officiel pour {selectedCommune.name} :</span>
          </h4>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 text-sm sm:text-base text-slate-100 leading-relaxed font-sans shadow-inner">
            {selectedWeek.dominantScenario.communeSpecificText}
          </div>
        </div>

        {/* Multi-Parameter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wind & Gusts */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase">
              <Wind className="h-4 w-4" />
              <span>Vent & Aérologie Locale</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedWeek.dominantScenario.dominantWind}
            </p>
            <div className="text-[11px] text-slate-400">
              Rafales maximales modélisées : <strong className="text-white">{selectedWeek.dominantScenario.gustMaxKmh} km/h</strong>
            </div>
          </div>

          {/* Agro-Climatic Impacts */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Impacts Agricoles & Espaces Verts</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedWeek.dominantScenario.agroClimaticImpacts.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vigilances & Risks */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
              <ShieldAlert className="h-4 w-4" />
              <span>Surveillance des Risques</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedWeek.dominantScenario.riskHighlights.map((r, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alternative Scenario */}
        {selectedWeek.alternativeScenario && (
          <div className="rounded-2xl bg-slate-950/50 border border-slate-800/80 p-4 text-xs text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[11px]">
              <span>Scénario Alternatif ({selectedWeek.alternativeScenario.probabilityPct}% de probabilité) :</span>
              <span className="text-cyan-400">{selectedWeek.alternativeScenario.title}</span>
            </div>
            <p className="text-slate-300">{selectedWeek.alternativeScenario.description}</p>
          </div>
        )}
      </div>

      {/* Agro-Hydrological & Senior Health Outlook */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase">
            <Sun className="h-4 w-4" />
            <span>Bilan Agro-Hydrologique Global à 4 Semaines</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {bulletin.agroHydrologicalSummary}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase">
            <Info className="h-4 w-4" />
            <span>Conseil Spécial Santé, Confort & Seniors</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {bulletin.seniorRecommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
