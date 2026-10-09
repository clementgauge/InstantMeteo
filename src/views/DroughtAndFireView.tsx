import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame,
  Droplets,
  AlertTriangle,
  ShieldAlert,
  Ban,
  Wind,
  Layers,
  Activity,
  FileText,
  Compass,
  Clock,
  Search,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import {
  DROUGHT_FIRE_ZONES,
  DroughtAndFireZone,
  computeRealtimeFireWeather,
  fetchLiveDroughtFireProfileForLocality
} from '../services/droughtFireService';

interface DroughtAndFireViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

export const DroughtAndFireView: React.FC<DroughtAndFireViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const [liveLocalZone, setLiveLocalZone] = useState<DroughtAndFireZone | null>(null);
  const [customSearchedZones, setCustomSearchedZones] = useState<DroughtAndFireZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(DROUGHT_FIRE_ZONES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Charge automatiquement le profil Pyro-Météo & Hydrique de la localité active (station)
  useEffect(() => {
    let isMounted = true;
    fetchLiveDroughtFireProfileForLocality(
      station.name,
      `${station.department || station.region || 'France / Monde'}`,
      station.latitude,
      station.longitude,
      weather
    ).then((zone) => {
      if (isMounted) {
        setLiveLocalZone(zone);
        setSelectedZoneId(zone.id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [station.id, station.latitude, station.longitude]);

  const allZones = useMemo(() => {
    const list: DroughtAndFireZone[] = [];
    if (liveLocalZone) list.push(liveLocalZone);
    return [...list, ...customSearchedZones, ...DROUGHT_FIRE_ZONES];
  }, [liveLocalZone, customSearchedZones]);

  const baseZone: DroughtAndFireZone = useMemo(() => {
    return allZones.find((z) => z.id === selectedZoneId) || liveLocalZone || DROUGHT_FIRE_ZONES[0];
  }, [allZones, selectedZoneId, liveLocalZone]);

  const liveData = useMemo(() => {
    return computeRealtimeFireWeather(baseZone, weather);
  }, [baseZone, weather]);

  const handleSearchCommuneOrForest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=4&language=fr&format=json`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && Array.isArray(geoData.results) && geoData.results.length > 0) {
          const zones = await Promise.all(
            geoData.results.slice(0, 3).map((item: any) =>
              fetchLiveDroughtFireProfileForLocality(
                item.name,
                `${item.admin2 || item.admin1 || ''} (${item.country || ''})`,
                Number(item.latitude),
                Number(item.longitude),
                weather
              )
            )
          );
          setCustomSearchedZones((prev) => {
            const ids = new Set(zones.map((z) => z.id));
            return [...zones, ...prev.filter((x) => !ids.has(x.id))].slice(0, 8);
          });
          setSelectedZoneId(zones[0].id);
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  const getVigiEauStyle = (level: DroughtAndFireZone['vigiEauLevel']) => {
    switch (level) {
      case 'NORMALE':
        return { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', dot: 'bg-emerald-400', step: 0 };
      case 'VIGILANCE':
        return { bg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300', dot: 'bg-yellow-400', step: 1 };
      case 'ALERTE':
        return { bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400', dot: 'bg-amber-500', step: 2 };
      case 'ALERTE_RENFORCEE':
        return { bg: 'bg-orange-600/25 border-orange-500/50 text-orange-400', dot: 'bg-orange-500', step: 3 };
      case 'CRISE':
        return { bg: 'bg-red-600/25 border-red-500/50 text-red-400', dot: 'bg-red-500', step: 4 };
    }
  };

  const getFireDangerStyle = (danger: DroughtAndFireZone['forestFireDanger']) => {
    switch (danger) {
      case 'FAIBLE':
        return { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', dot: 'bg-emerald-400' };
      case 'MODÉRÉ':
        return { bg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400', dot: 'bg-yellow-400' };
      case 'ÉLEVÉ':
        return { bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400', dot: 'bg-amber-500' };
      case 'TRÈS ÉLEVÉ':
        return { bg: 'bg-red-500/20 border-red-500/40 text-red-400', dot: 'bg-red-500' };
      case 'EXTRÊME':
        return { bg: 'bg-purple-600/25 border-purple-500/50 text-purple-300', dot: 'bg-purple-500' };
    }
  };

  const vigiEauStyle = getVigiEauStyle(liveData.vigiEauLevel);
  const fireStyle = getFireDangerStyle(liveData.forestFireDanger);

  // Horizons d'humidité du sol
  const soilHorizons = [
    {
      label: 'Horizon 0–1 cm (Litière & aiguilles)',
      pct: liveData.soilMoisture0to1cm ?? Math.round(liveData.soilWetnessIndexSwi * 85),
      desc: 'Inflammabilité directe aux étincelles'
    },
    {
      label: 'Horizon 1–3 cm (Humus & herbacées)',
      pct: liveData.soilMoisture1to3cm ?? Math.round(liveData.soilWetnessIndexSwi * 95),
      desc: 'Combustibles légers de surface'
    },
    {
      label: 'Horizon 3–9 cm (Racines superficielles)',
      pct: liveData.soilMoisture3to9cm ?? Math.round(liveData.soilWetnessIndexSwi * 105),
      desc: 'Stress hydrique des pelouses et cultures'
    },
    {
      label: 'Horizon 9–27 cm (Réserve arbustive)',
      pct: liveData.soilMoisture9to27cm ?? Math.round(liveData.soilWetnessIndexSwi * 115),
      desc: 'Teneur en eau des ligneux et maquis'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-lg relative overflow-hidden ${
        isLightMode
          ? 'bg-gradient-to-br from-amber-50 via-white to-red-50 border-amber-200 text-slate-900'
          : 'bg-gradient-to-br from-[#23120B] via-[#2C160E] to-[#3B1910] border-amber-500/30 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Flame className="w-4 h-4" />
              <span>Observatoire Pyro-Météorologique & Sécheresse Universel • Toutes Communes & Massifs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              VigiEau, Humidité des Sols (4 Horizons) & Météo des Forêts (Indice FWI)
            </h2>
            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              Chaque commune, forêt ou massif de France et du Monde bénéficie d'une analyse pyro-météorologique et hydrique complète : humidité des sols de 0 à 27 cm, déficit de pression de vapeur (VPD), évapotranspiration FAO et vitesse de propagation du feu selon la pente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Indice FWI Feu</div>
              <div className="text-base sm:text-lg font-black text-white">{liveData.fwiScore} / 60</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-sky-300 font-bold">Indice Sol (SWI)</div>
              <div className="text-base sm:text-lg font-black text-white">{liveData.soilWetnessIndexSwi}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-rose-300 font-bold">Anomalie Nappes</div>
              <div className="text-base sm:text-lg font-black text-white">
                {liveData.groundwaterAnomalyPercent > 0 ? `+${liveData.groundwaterAnomalyPercent}%` : `${liveData.groundwaterAnomalyPercent}%`}
              </div>
            </div>
          </div>
        </div>

        {/* Barre de Recherche Universelle de Commune / Massif Forestier */}
        <div className="mt-5 pt-4 border-t border-amber-500/20">
          <form onSubmit={handleSearchCommuneOrForest} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher n'importe quelle commune, forêt ou massif (ex: Aubagne, Fréjus, Arcachon, Corte, Fontainebleau, Athènes, Los Angeles...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm transition shrink-0 cursor-pointer"
            >
              {isSearching ? 'Analyse Pyro-Météo...' : 'Analyser cette Localité'}
            </button>
          </form>
        </div>
      </div>

      {/* Zone Selector Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Votre Localité Active & Zones de Surveillance ({allZones.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Cliquez sur une commune ou un département pour afficher son diagnostic complet
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
          {allZones.map((z) => {
            const isSelected = z.id === baseZone.id;
            const vStyle = getVigiEauStyle(z.vigiEauLevel);
            return (
              <button
                key={z.id}
                onClick={() => setSelectedZoneId(z.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-600/20 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                    : 'bg-[#0F172A]/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 truncate">
                      {z.isLiveLocal ? '📍 Ma Commune' : `Dép. ${z.departmentCode}`}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${vStyle.dot}`} title={z.vigiEauLabel} />
                  </div>
                  <div className="text-xs font-black text-white mt-1 line-clamp-1">
                    {z.departmentName}
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>SWI {z.soilWetnessIndexSwi}</span>
                  <span className="font-bold text-amber-300">🔥 FWI {z.fwiScore}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: VigiEau Restrictions, Soil Horizons & BRGM Hydrogeology (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  {liveData.region} • {liveData.prefecturalDecreeDate}
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {liveData.departmentName}
                </h3>
              </div>

              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${vigiEauStyle.bg}`}>
                <Droplets className="w-4 h-4" />
                <span>{liveData.vigiEauLabel}</span>
              </div>
            </div>

            {/* 5-Stage VigiEau Official Escalation Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Échelle Officielle de Sécheresse (VigiEau)</span>
                <span className="text-amber-400">Niveau {vigiEauStyle.step}/4</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: 'Normale', step: 0, color: 'bg-emerald-500' },
                  { label: 'Vigilance', step: 1, color: 'bg-yellow-400' },
                  { label: 'Alerte', step: 2, color: 'bg-amber-500' },
                  { label: 'Alerte Renf.', step: 3, color: 'bg-orange-500' },
                  { label: 'Crise', step: 4, color: 'bg-red-600' }
                ].map((s) => (
                  <div key={s.step} className="space-y-1 text-center">
                    <div className={`h-2.5 rounded-full ${vigiEauStyle.step >= s.step ? s.color : 'bg-slate-800'}`} />
                    <div className={`text-[10px] font-bold ${vigiEauStyle.step === s.step ? 'text-white' : 'text-slate-500'}`}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profil d'Humidité des Sols sur 4 Horizons de Profondeur */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Profil Hydrique des Sols & Litières Forestières (4 Profondeurs)</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  ET0: <strong className="text-amber-300">{liveData.et0MmDay ?? 3.8} mm/j</strong> • VPD: <strong className="text-rose-300">{liveData.vpdKpa ?? 1.2} kPa</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {soilHorizons.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{h.label}</span>
                      <span className={`font-black ${h.pct <= 25 ? 'text-red-400' : h.pct <= 40 ? 'text-amber-400' : 'text-sky-400'}`}>
                        {Math.min(100, Math.max(5, h.pct))}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          h.pct <= 25 ? 'bg-red-500' : h.pct <= 40 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, h.pct))}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500">{h.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited Water Usages */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>Usages Interdits ou Réglementés (Sécheresse & Prévention Incendie)</span>
              </div>

              <div className="space-y-2">
                {liveData.prohibitedUsages.map((usage, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-slate-200 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{usage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Authorized with Restrictions */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Consignes Hydriques & Agro-Météorologiques Locales</span>
              </div>

              <div className="space-y-1.5">
                {liveData.authorizedUsagesWithRestrictions.map((usage, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{usage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VigiEau Legal Link and Agency note */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-800 text-slate-400">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Sources : <strong>VigiEau, Météo des Forêts, BRGM & Modèle Sol Open-Meteo</strong></span>
              </div>
              <span className="text-[11px] text-slate-500">Obligation Légale de Débroussaillement (OLD) : rayon de 50m autour du bâti</span>
            </div>
          </div>
        </div>

        {/* Right Column: Forest Fire Risk, Slope Spread Speed & CFFDRS FWI (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Météo des Forêts & Cinématique du Feu</span>
              </div>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${fireStyle.bg}`}>
                <span className={`w-2 h-2 rounded-full ${fireStyle.dot}`} />
                <span>{liveData.forestFireDangerLabel}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Indice standardisé international <strong>CFFDRS (Canadian Forest Fire Weather Index)</strong> couplé à la loi de propagation de Rothermel sur pente topographique.
            </p>

            {/* Indices Breakdown */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Indice Forêt Météo (FWI)</div>
                    <div className="text-[10px] text-slate-500">Intensité énergétique du front de flamme</div>
                  </div>
                </div>
                <div className={`text-lg font-black ${
                  liveData.fwiScore >= 38 ? 'text-red-400' : liveData.fwiScore >= 22 ? 'text-orange-400' : 'text-amber-400'
                }`}>
                  {liveData.fwiScore} / 60+
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Inflammabilité Litière Sèche (FFMC)</div>
                    <div className="text-[10px] text-slate-500">Teneur en eau des combustibles fins</div>
                  </div>
                </div>
                <div className="text-base font-black text-white">
                  {liveData.ffmc} / 101
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wind className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Indice de Propagation Initiale (ISI)</div>
                    <div className="text-[10px] text-slate-500">Effet combiné vent ({weather.windSpeed} km/h) & sécheresse</div>
                  </div>
                </div>
                <div className="text-base font-black text-white">
                  {liveData.isi}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Biomasse Combustible Disponible (BUI)</div>
                    <div className="text-[10px] text-slate-500">Matière organique sèche mobilisable</div>
                  </div>
                </div>
                <div className="text-base font-black text-white">
                  {liveData.bui}
                </div>
              </div>
            </div>

            {/* Cinématique de Propagation selon la Pente Topographique (0° à 30°) */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Vitesse de Propagation selon la Pente</span>
                </span>
                <span className="text-[10px] text-slate-400">Loi physique : x2 tous les +10°</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { deg: '0° (Plat)', speed: liveData.spreadRatesBySlope.slope0Deg },
                  { deg: '+10°', speed: liveData.spreadRatesBySlope.slope10Deg },
                  { deg: '+20°', speed: liveData.spreadRatesBySlope.slope20Deg },
                  { deg: '+30° (Raide)', speed: liveData.spreadRatesBySlope.slope30Deg }
                ].map((sl, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">{sl.deg}</div>
                    <div className="text-xs sm:text-sm font-black text-amber-300 mt-1">{sl.speed} m/h</div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                <span>Portée potentielle de sautes de feu (escarbilles) :</span>
                <strong className="text-rose-400">{liveData.spottingDistanceM} mètres</strong>
              </div>
            </div>

            {/* Forest Fire Safety Rules */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-2">
              <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Règles de Prévention Incendies en Forêt, Maquis & Garrigue</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Interdiction absolue de faire du feu ou des barbecues à moins de 200m des massifs boisés.</li>
                <li>En cas de départ de feu, fuites de fumée ou odeur de brûlé, alertez immédiatement le <strong>18</strong> ou le <strong>112</strong> en précisant votre commune ({station.name}).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
