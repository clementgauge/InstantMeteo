import React, { useState, useMemo } from 'react';
import { 
  FullNationalDigest, 
  LocationPoint, 
  NationalVigilanceSummaryItem,
  NationalWeeklyMilestone,
  NationalBrokenRecord 
} from '../types/weather';
import { 
  TERRITORIES_LIST, 
  generateNationalDigest,
  TerritoryDefinition
} from '../services/nationalDigestService';
import { GigaNationalFourWeekBulletinCard } from '../components/GigaNationalFourWeekBulletinCard';
import { 
  Globe, 
  Award, 
  Flame, 
  Snowflake, 
  CloudRain, 
  Wind, 
  Zap, 
  Sun, 
  ShieldAlert, 
  Calendar, 
  TrendingUp, 
  Droplet, 
  Clock, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';

interface NationalDigestViewProps {
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
}

export const NationalDigestView: React.FC<NationalDigestViewProps> = ({
  seniorMode = false,
  tempUnit = 'C',
  onSelectStation
}) => {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('france-metropole');
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY' | 'FOUR_WEEKS'>('DAILY');

  const digest: FullNationalDigest = useMemo(
    () => generateNationalDigest(selectedTerritoryId),
    [selectedTerritoryId]
  );

  const categories = [
    'France Métropolitaine',
    'Grandes Régions Françaises',
    'Outre-Mer (DOM-TOM)',
    'Pays Limitrophes'
  ] as const;

  const getVigilanceBadge = (level: string) => {
    switch (level) {
      case 'ROUGE':
        return 'bg-red-600 text-white border-red-400';
      case 'ORANGE':
        return 'bg-amber-500 text-slate-950 font-black border-amber-300';
      case 'JAUNE':
        return 'bg-yellow-400 text-slate-950 font-bold border-yellow-200';
      default:
        return 'bg-emerald-600 text-white border-emerald-400';
    }
  };

  return (
    <div id="national-digest-view" className="space-y-4">
      {/* Top Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-[#0284C7] border border-slate-700">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
                <span>Bilan Météorologique Synoptique</span>
                <span>•</span>
                <span className="text-slate-400">Actualisé à {digest.lastUpdated}</span>
              </div>
              <h1 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-2xl'}`}>
                Bilan National &amp; Régional des Extrêmes
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Synthèse des extrêmes climatiques (Tmax, Tmin, pluviométrie 24h, rafales de vent et faits marquants).
              </p>
            </div>
          </div>
        </div>

        {/* Territory Selector By Category */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Territoire ou Région :</div>
          <div className="flex flex-wrap gap-1.5">
            {TERRITORIES_LIST.map((terr: TerritoryDefinition) => {
              const isSelected = terr.id === selectedTerritoryId;
              return (
                <button
                  key={terr.id}
                  onClick={() => setSelectedTerritoryId(terr.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{terr.flag}</span>
                  <span>{terr.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Toggle: Daily vs Weekly vs 4 Weeks */}
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('DAILY')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'DAILY'
                ? 'bg-[#0284C7] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Bilan Quotidien ({digest.daily.date})</span>
          </button>

          <button
            onClick={() => setActiveTab('WEEKLY')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'WEEKLY'
                ? 'bg-[#0284C7] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Bilan Hebdomadaire (7 derniers jours)</span>
          </button>

          <button
            onClick={() => setActiveTab('FOUR_WEEKS')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'FOUR_WEEKS'
                ? 'bg-[#0284C7] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Bulletin 4 Semaines (S+1 à S+4)</span>
          </button>
        </div>
      </div>

      {/* 1. DAILY DIGEST */}
      {activeTab === 'DAILY' && (
        <div className="space-y-4">
          {/* Key National Highlights Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tmax National */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-rose-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-rose-400" /> Tmax
                </span>
                <span className="text-[11px] text-slate-400">{digest.daily.tMaxNational.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{digest.daily.tMaxNational.value}°C</span>
                <span className="text-xs text-rose-300 font-medium">{digest.daily.tMaxNational.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.tMaxNational.comment}</p>
            </div>

            {/* Tmin National */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-sky-400 flex items-center gap-1">
                  <Snowflake className="h-3.5 w-3.5 text-sky-400" /> Tmin
                </span>
                <span className="text-[11px] text-slate-400">{digest.daily.tMinNational.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{digest.daily.tMinNational.value}°C</span>
                <span className="text-xs text-sky-300 font-medium">{digest.daily.tMinNational.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.tMinNational.comment}</p>
            </div>

            {/* Rain Max */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-blue-400 flex items-center gap-1">
                  <CloudRain className="h-3.5 w-3.5 text-blue-400" /> Pluie 24h
                </span>
                <span className="text-[11px] text-slate-400">{digest.daily.maxPrecipitation24h.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{digest.daily.maxPrecipitation24h.value} mm</span>
                <span className="text-xs text-blue-300 font-medium">{digest.daily.maxPrecipitation24h.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.maxPrecipitation24h.comment}</p>
            </div>

            {/* Wind Max */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-teal-400 flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-teal-400" /> Rafale Max
                </span>
                <span className="text-[11px] text-slate-400">{digest.daily.maxWindGust.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{digest.daily.maxWindGust.value} km/h</span>
                <span className="text-xs text-teal-300 font-medium">{digest.daily.maxWindGust.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.maxWindGust.comment}</p>
            </div>
          </div>

          {/* Secondary Stats: Mean Temp, Lightning, Sunshine */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-md border border-slate-800 bg-slate-900 p-3.5">
              <div className="text-[11px] font-semibold uppercase text-slate-400">Température Moyenne</div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{digest.daily.nationalMeanTemp}°C</span>
                <span className={`text-xs font-semibold ${digest.daily.nationalTempAnomalyVsNormal >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                  {digest.daily.nationalTempAnomalyVsNormal > 0 ? `+${digest.daily.nationalTempAnomalyVsNormal}` : digest.daily.nationalTempAnomalyVsNormal}°C vs normale
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Référence 1991-2020</div>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900 p-3.5">
              <div className="text-[11px] font-semibold uppercase text-slate-400">Impacts de Foudre</div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-yellow-300">
                  {digest.daily.totalLightningStrikesCount.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs text-slate-400">impacts détectés</span>
              </div>
              <div className="text-[11px] text-slate-400">Réseau détection synoptique</div>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900 p-3.5">
              <div className="text-[11px] font-semibold uppercase text-slate-400">Ensoleillement Moyen</div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-amber-300">{digest.daily.sunshineAverageHours} h</span>
                <span className={`text-xs font-semibold ${digest.daily.sunshineAnomalyPct >= 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {digest.daily.sunshineAnomalyPct > 0 ? `+${digest.daily.sunshineAnomalyPct}` : digest.daily.sunshineAnomalyPct}%
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Durée d'insolation moyenne</div>
            </div>
          </div>

          {/* Synoptic situation & Vigilances synthesis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Situation */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <Sparkles className="h-3.5 w-3.5 text-[#0284C7]" />
                Situation Synoptique
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {digest.daily.synopticSituation}
              </p>
              <div className="space-y-1.5 pt-1.5">
                <div className="text-xs font-semibold text-white">Points marquants :</div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {digest.daily.keyHighlights.map((hl: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vigilance Table */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                Vigilances Météorologiques
              </div>
              <div className="space-y-2">
                {digest.daily.vigilancesSummary.map((vig: NationalVigilanceSummaryItem, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-3 rounded-md bg-slate-900 p-2.5 border border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${getVigilanceBadge(vig.level)}`}>
                          {vig.level}
                        </span>
                        <span className="text-xs font-semibold text-white">{vig.phenomenon}</span>
                        <span className="text-[11px] text-slate-400">• {vig.territoryName}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{vig.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. WEEKLY DIGEST */}
      {activeTab === 'WEEKLY' && (
        <div className="space-y-4">
          {/* Weekly Aggregated Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Moyenne 7 Jours</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{digest.weekly.weeklyMeanTemp}°C</span>
                <span className={`text-xs font-semibold ${digest.weekly.weeklyTempAnomalyVsNormal >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                  {digest.weekly.weeklyTempAnomalyVsNormal > 0 ? `+${digest.weekly.weeklyTempAnomalyVsNormal}` : digest.weekly.weeklyTempAnomalyVsNormal}°C
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Écart moyen sur l'ensemble du réseau</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Cumul Pluviométrique</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-sky-300">{digest.weekly.weeklyMeanPrecipitationMm} mm</span>
                <span className="text-xs font-semibold text-rose-400">
                  {digest.weekly.weeklyPrecipAnomalyPct}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.weekly.soilMoistureStatus}</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Ensoleillement 7j</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-300">{digest.weekly.weeklySunshineTotalHours} h</span>
                <span className="text-xs text-slate-300">{digest.weekly.rainDaysCount}j pluie / {digest.weekly.fullSunDaysCount}j soleil</span>
              </div>
              <p className="text-[11px] text-slate-400">Cumul d'insolation sur 7 jours</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Rafale Hebdo Max</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-teal-300">{digest.weekly.weeklyMaxGustKmh} km/h</span>
                <span className="text-xs text-slate-300 font-medium">{digest.weekly.weeklyMaxGustStation}</span>
              </div>
              <p className="text-[11px] text-slate-400">Pic anémométrique hebdomadaire</p>
            </div>
          </div>

          {/* Notable Milestones & Broken Records Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Milestones */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <Clock className="h-3.5 w-3.5 text-[#0284C7]" />
                Chronologie des Événements
              </div>
              <div className="space-y-2">
                {digest.weekly.notableMilestones.map((ms: NationalWeeklyMilestone, i: number) => (
                  <div key={i} className="rounded-md bg-slate-900 p-3 border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300">{ms.dayLabel} • {ms.eventTitle}</span>
                      <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded ${
                        ms.severity === 'record' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        ms.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {ms.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ms.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Broken Records */}
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                Records Battus ou Égalés
              </div>
              <div className="space-y-2">
                {digest.weekly.brokenRecordsList.map((rec: NationalBrokenRecord, i: number) => (
                  <div key={i} className="rounded-md bg-slate-900 p-3 border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rec.stationName}</span>
                      <span className="text-[11px] text-slate-400">{rec.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{rec.metric} :</span>
                      <span className="font-bold text-rose-400">{rec.newValue}</span>
                      <span className="text-slate-500 line-through text-[11px]">{rec.oldValue} ({rec.previousYear})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Synthesis Box */}
              <div className="rounded-md bg-slate-900 p-3 border border-slate-800 space-y-1 text-xs">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#0284C7]" />
                  Synthèse Hebdomadaire
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {digest.weekly.weeklySynthesis}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FOUR WEEKS NATIONAL BULLETIN */}
      {activeTab === 'FOUR_WEEKS' && (
        <GigaNationalFourWeekBulletinCard
          seniorMode={seniorMode}
          tempUnit={tempUnit}
        />
      )}
    </div>
  );
};
