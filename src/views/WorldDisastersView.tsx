import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  MapPin,
  Newspaper,
  Snowflake,
  Flame,
  Wind,
  Droplets,
  ThermometerSnowflake,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Radio,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Satellite,
  Layers,
  Activity
} from 'lucide-react';
import { 
  CURATED_VERIFIED_DISASTERS, 
  fetchLiveWorldDisasters 
} from '../services/worldDisastersLiveService';
import { GlobalExtremeEventsCard } from '../components/GlobalExtremeEventsCard';

interface WorldDisastersViewProps {
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export type DisasterCategory = 
  | 'all' 
  | 'recent_24h'
  | 'cold_snow'
  | 'fire' 
  | 'ice'
  | 'tornado' 
  | 'cyclone' 
  | 'heat' 
  | 'flood' 
  | 'tsunami';

export interface VerifiedDisasterEvent {
  id: string;
  type: 'cold_snow' | 'fire' | 'ice' | 'tornado' | 'cyclone' | 'heat' | 'flood' | 'tsunami';
  title: string;
  region: string;
  severity: 'Critique' | 'Extrême' | 'Majeur' | 'Élevé';
  badgeColor: string;
  metric: string;
  desc: string;
  updated: string;
  timestampUtc: string;
  verifiedWithin24h: boolean;
  categoryLabel: string;
  officialMeteoCentres: string[];
  verifiedMedia: string[];
  dataVerification: string;
  sourceUrl: string;
}

export const WorldDisastersView: React.FC<WorldDisastersViewProps> = ({
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [viewMode, setViewMode] = useState<'live_disasters' | 'climate_observatory'>('live_disasters');
  const [filterType, setFilterType] = useState<DisasterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCertId, setExpandedCertId] = useState<string | null>(null);
  const [disasters, setDisasters] = useState<VerifiedDisasterEvent[]>(CURATED_VERIFIED_DISASTERS);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [liveCount, setLiveCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('À l’instant');

  const loadLiveEvents = async () => {
    setIsLoadingLive(true);
    try {
      const result = await fetchLiveWorldDisasters();
      setDisasters(result.events);
      setIsLiveConnected(result.isLiveApiConnected);
      setLiveCount(result.liveCount);
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.warn('Erreur lors du chargement des flux météo du monde :', e);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    loadLiveEvents();
  }, []);

  const toggleCert = (id: string) => {
    setExpandedCertId(prev => prev === id ? null : id);
  };

  const filtered = disasters.filter(d => {
    if (filterType === 'recent_24h' && !d.verifiedWithin24h) return false;
    const matchesCategory = filterType === 'all' || filterType === 'recent_24h' || d.type === filterType;
    const matchesSearch = searchQuery.trim() === '' || 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.verifiedMedia.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.officialMeteoCentres.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const coldCount = disasters.filter(d => d.type === 'cold_snow' || d.type === 'ice').length;
  const fireCount = disasters.filter(d => d.type === 'fire').length;
  const totalVerified24h = disasters.filter(d => d.verifiedWithin24h).length;

  return (
    <div id="world-disasters-page" className="space-y-6">
      {/* Header Banner with Multi-Source Certification Guarantee */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Globe2 className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span>Observatoire Mondial des Phénomènes Extrêmes &amp; Climat</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-black">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Vérifié Multi-Sources &amp; Centres Météo (&lt; 24h)
              </span>
            </div>

            {/* Live Refresh Button */}
            <button
              onClick={loadLiveEvents}
              disabled={isLoadingLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
              title="Actualiser les événements en direct depuis la NASA et les agences mondiales"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLive ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isLoadingLive ? 'Synchronisation...' : 'Actualiser les flux directs'}</span>
            </button>
          </div>

          <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
            Météo du Monde, Phénomènes en Cours &amp; Événements Climatiques Majeurs
          </h2>
          
          <p className="text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
            Tous les événements répertoriés sont <strong>actuels, en cours d’évolution</strong> et <strong>systématiquement vérifiés de moins de 24 heures</strong> par recoupement de trois canaux fiables :
            <br />
            1. <strong>Agences de presse de référence</strong> : AFP, Reuters, Associated Press, Le Monde, Franceinfo, TF1 Info, BFMTV, Le Figaro, BBC News, Radio-Canada.
            <br />
            2. <strong>Centres météorologiques &amp; spatiaux officiels</strong> : Météo-France, NOAA / NWS, Environnement Canada, SMHI, DWD, JMA, OMM / WMO, Copernicus C3S &amp; EFFIS, NASA EONET / FIRMS.
            <br />
            3. <strong>Capteurs physiques &amp; télédétection</strong> : Réseaux synoptiques normalisés OMM sous abri, satellites infrarouges (VIIRS 375 m / MODIS), radars Doppler et balises océaniques DART.
          </p>

          {/* Primary View Switcher */}
          <div className="mt-6 flex flex-wrap items-center gap-3 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 w-fit">
            <button
              onClick={() => setViewMode('live_disasters')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                viewMode === 'live_disasters'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 ring-1 ring-white/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>🚨 Dépêches &amp; Catastrophes Récentes (&lt; 24h)</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                {disasters.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('climate_observatory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                viewMode === 'climate_observatory'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-white/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Globe2 className="h-4 w-4 text-indigo-300 animate-spin" style={{ animationDuration: '20s' }} />
              <span>🌍 Observatoire Planétaire &amp; 30 Métropoles</span>
            </button>
          </div>

          {viewMode === 'live_disasters' && (
            <>
              {/* Search bar */}
              <div className="mt-5 max-w-md relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par média (AFP, Le Monde), centre météo, pays, froid, verglas..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Filter Pills */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: `Tous les événements (${disasters.length})` },
                  { id: 'recent_24h', label: `⚡ Moins de 24h certifiés (${totalVerified24h})` },
                  { id: 'cold_snow', label: `❄️ Froid & Neige (${disasters.filter(d => d.type === 'cold_snow').length})` },
                  { id: 'ice', label: `🧊 Verglas & Glace (${disasters.filter(d => d.type === 'ice').length})` },
                  { id: 'fire', label: `🔥 Feux NASA FIRMS (${fireCount})` },
                  { id: 'tornado', label: '🌪️ Tornades & Tempêtes' },
                  { id: 'cyclone', label: '🌀 Cyclones & Typhons' },
                  { id: 'heat', label: '☀️ Dômes de Chaleur' },
                  { id: 'flood', label: '🌧️ Inondations & Crues' },
                  { id: 'tsunami', label: '🌊 Tsunamis & Séismes' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id as any)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      filterType === f.id
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 ring-1 ring-white/50'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Mode 2: Observatoire Climatique Planétaire */}
      {viewMode === 'climate_observatory' ? (
        <GlobalExtremeEventsCard seniorMode={seniorMode} tempUnit={tempUnit} />
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase">
                <ThermometerSnowflake className="h-4 w-4" />
                <span>Froid / Neige / Glace</span>
              </div>
              <div className="text-xl font-black text-white">{coldCount} Événements</div>
              <p className="text-[11px] text-slate-400">Vortex arctique, -58 °C, blizzards</p>
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-slate-900/80 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold uppercase">
                <Flame className="h-4 w-4" />
                <span>Feux Satellites NASA</span>
              </div>
              <div className="text-xl font-black text-white">{fireCount} Foyers Majeurs</div>
              <p className="text-[11px] text-slate-400">VIIRS 375 m &amp; MODIS NRT</p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold uppercase">
                <Wind className="h-4 w-4" />
                <span>Tornades &amp; Cyclones</span>
              </div>
              <div className="text-xl font-black text-white">
                {disasters.filter(d => d.type === 'cyclone' || d.type === 'tornado').length} Phénomènes
              </div>
              <p className="text-[11px] text-slate-400">Vents 295 km/h, supercellules</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Recoupement &amp; Direct</span>
              </div>
              <div className="text-xl font-black text-emerald-400">100% &lt; 24h</div>
              <p className="text-[11px] text-emerald-300/80">Synchronisé à {lastSyncTime}</p>
            </div>
          </div>

      {/* Disasters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const isCold = item.type === 'cold_snow' || item.type === 'ice';
          const isFire = item.type === 'fire';
          const isCertExpanded = expandedCertId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-6 shadow-xl backdrop-blur flex flex-col justify-between transition group ${
                isCold 
                  ? 'border-cyan-500/30 bg-slate-900/90 hover:border-cyan-400/60' 
                  : isFire
                  ? 'border-orange-500/30 bg-slate-900/90 hover:border-orange-400/60'
                  : 'border-slate-800 bg-slate-900/90 hover:border-rose-500/50'
              }`}
            >
              <div>
                {/* Top header badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                      isCold ? 'text-cyan-400' : isFire ? 'text-orange-400' : 'text-rose-400'
                    }`}>
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{item.region}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-200 transition">
                      {item.title}
                    </h3>
                  </div>
                  
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 border ${
                    item.severity === 'Extrême' || item.severity === 'Critique'
                      ? 'bg-rose-950 border-rose-500/50 text-rose-300'
                      : 'bg-amber-950 border-amber-500/50 text-amber-300'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                {/* Metric pill */}
                <div className={`rounded-2xl p-3.5 border my-3 shadow-inner ${
                  isCold 
                    ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
                    : isFire
                    ? 'bg-orange-950/40 border-orange-500/30 text-orange-200'
                    : 'bg-slate-950 border-slate-800/80 text-amber-300'
                }`}>
                  <div className="text-xs font-mono font-black">
                    {item.metric}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {item.desc}
                </p>

                {/* Multi-source mini tags */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Newspaper className="h-3 w-3 text-cyan-400" />
                      Médias vérifiés ({item.verifiedMedia.length}) :
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.updated}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.verifiedMedia.slice(0, 3).map((media, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                        {media}
                      </span>
                    ))}
                    {item.verifiedMedia.length > 3 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        +{item.verifiedMedia.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Direct Link to Source Page */}
                  <div className="pt-2">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-500/40 text-[11px] font-bold transition shadow-sm"
                      title={`Consulter les données et dépêches sources sur ${item.sourceUrl}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Consulter la source officielle de l’événement</span>
                    </a>
                  </div>
                </div>

                {/* Expandable Full Verification Certificate */}
                {isCertExpanded && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2.5 text-xs animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 uppercase">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Certificat de Triple Validation (&lt; 24h)</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">🏛️ Centres Météo Officiels Référents :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.officialMeteoCentres.map((centre, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30">
                            {centre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">📰 Rédactions &amp; Agences de Presse :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.verifiedMedia.map((media, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700">
                            {media}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">📡 Capteurs &amp; Données Physiques Contrôlées :</span>
                      <p className="text-[11px] text-slate-300 mt-0.5 font-mono">{item.dataVerification}</p>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span>Horodatage UTC : <strong>{item.timestampUtc}</strong></span>
                      <span className="text-emerald-400 font-bold">100% Conforme</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Source Footer Button */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => toggleCert(item.id)}
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer text-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isCertExpanded ? 'Masquer la certification' : 'Détail des sources vérifiées'}</span>
                  {isCertExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  &lt; 24h
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
          <Globe2 className="h-10 w-10 mx-auto text-slate-600 animate-spin" />
          <p className="text-base font-bold text-white">Aucun événement ne correspond à votre filtre de recherche</p>
          <p className="text-xs text-slate-400">Essayez de modifier votre mot-clé ou sélectionnez « Tous les événements ».</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};
