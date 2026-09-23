import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Droplets, 
  ShieldAlert, 
  AlertTriangle, 
  Wind, 
  Sun, 
  Gauge, 
  Layers, 
  CheckCircle2, 
  Info, 
  Activity, 
  MapPin, 
  FileText,
  Clock,
  Radio,
  Search,
  XCircle
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { 
  ALL_FRENCH_DEPARTMENTS, 
  DepartmentDroughtFireData, 
  extractDepartmentCode, 
  computeDroughtAndFireData 
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
  const autoDptCode = useMemo(() => extractDepartmentCode(station), [station]);
  const [selectedDptCode, setSelectedDptCode] = useState<string>(autoDptCode);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Re-sync when station changes
  React.useEffect(() => {
    setSelectedDptCode(extractDepartmentCode(station));
  }, [station]);

  const liveData: DepartmentDroughtFireData = useMemo(() => {
    return computeDroughtAndFireData(station, weather, selectedDptCode);
  }, [station, weather, selectedDptCode]);

  // Filtered department list for quick search
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return ALL_FRENCH_DEPARTMENTS;
    const q = searchQuery.toLowerCase().trim();
    return ALL_FRENCH_DEPARTMENTS.filter(d => 
      d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Forest fire danger badge styles
  const getFireBadgeStyle = (level: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE') => {
    switch (level) {
      case 'VERT':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400'
        };
      case 'JAUNE':
        return {
          bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          dot: 'bg-yellow-400'
        };
      case 'ORANGE':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          dot: 'bg-orange-400'
        };
      case 'ROUGE':
        return {
          bg: 'bg-red-500/25 text-red-300 border-red-500/50',
          dot: 'bg-red-400'
        };
    }
  };

  const fireStyle = getFireBadgeStyle(liveData.forestFireDangerLevel);

  return (
    <div className={`min-h-screen px-3 sm:px-6 py-6 space-y-6 animate-fadeIn ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Banner Header */}
      <div className={`p-5 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
        isLightMode 
          ? 'bg-gradient-to-br from-amber-50 via-white to-red-50/50 border-amber-200' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-red-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  VigiEau • Météo des Forêts Météo-France • CFFDRS FWI
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  96 Départements Métropolitains Connectés
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Sécheresse des Sols, Restrictions VigiEau & Feux de Forêt
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Indice Forêt Météo (FWI), indice d'humidité des sols (SWI), arrêtés préfectoraux et restrictions d'eau officielles.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/80">
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Score FWI Feux</div>
              <div className="text-base sm:text-lg font-black text-amber-400">{liveData.fwiScore} / 60+</div>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Indice Sols (SWI)</div>
              <div className="text-base sm:text-lg font-black text-sky-400">{liveData.soilWetnessIndexSwi}</div>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Département</div>
              <div className="text-xs font-bold text-emerald-400 max-w-[130px] truncate">{liveData.dptCode} - {liveData.dptName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Selector with Instant Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Sélection Départementale ({ALL_FRENCH_DEPARTMENTS.length} départements)</span>
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher (ex: 13, Var, Paris, 33)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Department Chips Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filteredDepartments.map(d => {
            const isSelected = d.code === liveData.dptCode;
            return (
              <button
                key={d.code}
                onClick={() => setSelectedDptCode(d.code)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{d.code}</span>
                <span>{d.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: VigiEau Official Restrictions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <Droplets className="w-4 h-4" />
                  <span>Statut Hydrologique Officiel • Arrêté Préfectoral</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  Département : {liveData.dptName} ({liveData.dptCode})
                </h3>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${liveData.vigiEauColor}`}>
                {liveData.vigiEauLabel}
              </div>
            </div>

            {/* Diagnostic Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Diagnostic des Nappes & Humidité des Sols (SWI)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {liveData.soilMoistureStatus}. L'indice de sécheresse des sols superficiels s'établit à <strong>{liveData.soilWetnessIndexSwi}</strong> (la normale de référence saisonnière est comprise entre 0.55 et 0.70). Le déficit pluviométrique cumulé sur 30 jours est de <strong>{liveData.rainfallDeficit30DaysPct}%</strong>.
              </p>
            </div>

            {/* Prohibited Usages (Interdictions formelles) */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>Usages Interdits par Arrêté Préfectoral ({liveData.prohibitedUsages.length})</span>
              </div>

              {liveData.prohibitedUsages.length > 0 ? (
                <div className="space-y-1.5">
                  {liveData.prohibitedUsages.map((usage, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{usage}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aucune interdiction formelle en vigueur. Sensibilisation citoyenne recommandée.</span>
                </div>
              )}
            </div>

            {/* Authorized Usages with Restrictions */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Usages Autorisés sous Conditions et Restrictions Horaires</span>
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
                <span>Source officielle : <strong>VigiEau (Ministère de la Transition Écologique)</strong></span>
              </div>
              <span className="text-[11px] text-slate-500">Sanction pénale encourue en cas d'infraction : contravention de 5e classe (jusqu'à 1 500 € d'amende)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Forest Fire Risk & CFFDRS FWI (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Météo des Forêts & Feux Végétation</span>
              </div>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${fireStyle.bg}`}>
                <span className={`w-2 h-2 rounded-full ${fireStyle.dot}`} />
                <span>Niveau {liveData.forestFireDangerLabel}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Indice standardisé international <strong>CFFDRS (Canadian Forest Fire Weather Index)</strong> calculé par Météo-France d'après la température de l'air, l'humidité relative et les rafales de vent.
            </p>

            {/* Indices Breakdown */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Indice Forêt Météo (FWI)</div>
                    <div className="text-[10px] text-slate-500">Intensité prévisible du feu</div>
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
                    <div className="text-xs font-bold text-slate-300">Humidité Combustibles Légers (FFMC)</div>
                    <div className="text-[10px] text-slate-500">Inflammabilité litière et herbe sèche</div>
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
                    <div className="text-xs font-bold text-slate-300">Vitesse de Propagation Initiale (ISI)</div>
                    <div className="text-[10px] text-slate-500">Couplage vent synoptique et sécheresse</div>
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
                    <div className="text-xs font-bold text-slate-300">Combustible Disponible (BUI)</div>
                    <div className="text-[10px] text-slate-500">Matière organique combustible totale</div>
                  </div>
                </div>
                <div className="text-base font-black text-white">
                  {liveData.bui}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Humidité des Sols (SWI)</div>
                    <div className="text-[10px] text-slate-500">Modèle SIM Météo-France</div>
                  </div>
                </div>
                <div className={`text-base font-black ${liveData.soilWetnessIndexSwi <= 0.20 ? 'text-red-400' : 'text-sky-400'}`}>
                  {liveData.soilWetnessIndexSwi}
                </div>
              </div>
            </div>

            {/* Forest Fire Safety Rules */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-2">
              <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Règles de Prévention Incendies en Forêt & Garrigue</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Interdiction absolue de faire du feu ou des barbecues à moins de 200m des massifs boisés.</li>
                <li>Ne jetez jamais de mégot par la fenêtre de votre véhicule ou en forêt.</li>
                <li>Ne réalisez pas de travaux générateurs d'étincelles (débroussailleuse, meuleuse) les jours de vent fort.</li>
                <li>En cas de départ de feu, alertez immédiatement les sapeurs-pompiers en composant le <strong>18</strong> ou le <strong>112</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
