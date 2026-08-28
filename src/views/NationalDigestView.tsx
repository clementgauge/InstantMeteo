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
    <div id="national-digest-view" className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-2xl backdrop-blur space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Globe className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <span>Bilan Météorologique National & Régional</span>
                <span>•</span>
                <span className="text-slate-400">Mise à jour : {digest.lastUpdated}</span>
              </div>
              <h1 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
                Bilan de la Journée & Bilan Hebdomadaire par Territoire
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Synthèse officielle des extrêmes climatiques (Tmax, Tmin, pluie max, rafales, foudre, records battus et vigilances).
              </p>
            </div>
          </div>
        </div>

        {/* Territory Selector By Category */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-xs font-bold uppercase text-slate-400">Sélectionnez le Territoire ou la Région :</div>
          <div className="flex flex-wrap gap-2">
            {TERRITORIES_LIST.map((terr: TerritoryDefinition) => {
              const isSelected = terr.id === selectedTerritoryId;
              return (
                <button
                  key={terr.id}
                  onClick={() => setSelectedTerritoryId(terr.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                      : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
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
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('DAILY')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
              activeTab === 'DAILY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Bilan Quotidien du Jour ({digest.daily.date})</span>
          </button>

          <button
            onClick={() => setActiveTab('WEEKLY')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
              activeTab === 'WEEKLY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Bilan Hebdomadaire (7 Derniers Jours)</span>
          </button>

          <button
            onClick={() => setActiveTab('FOUR_WEEKS')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
              activeTab === 'FOUR_WEEKS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Giga Bulletin National 4 Semaines (S+1 à S+4)</span>
          </button>
        </div>
      </div>

      {/* 1. DAILY DIGEST */}
      {activeTab === 'DAILY' && (
        <div className="space-y-6">
          {/* Key National Highlights Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tmax National */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-rose-400 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-500" /> Tmax du Territoire
                </span>
                <span className="text-xs text-slate-400 font-semibold">{digest.daily.tMaxNational.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{digest.daily.tMaxNational.value}°C</span>
                <span className="text-xs font-bold text-rose-300">{digest.daily.tMaxNational.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.tMaxNational.comment}</p>
            </div>

            {/* Tmin National */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  <Snowflake className="h-4 w-4 text-cyan-500" /> Tmin du Territoire
                </span>
                <span className="text-xs text-slate-400 font-semibold">{digest.daily.tMinNational.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{digest.daily.tMinNational.value}°C</span>
                <span className="text-xs font-bold text-cyan-300">{digest.daily.tMinNational.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.tMinNational.comment}</p>
            </div>

            {/* Rain Max */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
                  <CloudRain className="h-4 w-4 text-blue-500" /> Pluie Max 24h
                </span>
                <span className="text-xs text-slate-400 font-semibold">{digest.daily.maxPrecipitation24h.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{digest.daily.maxPrecipitation24h.value} mm</span>
                <span className="text-xs font-bold text-blue-300">{digest.daily.maxPrecipitation24h.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.maxPrecipitation24h.comment}</p>
            </div>

            {/* Wind Max */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                  <Wind className="h-4 w-4 text-indigo-500" /> Rafale Max
                </span>
                <span className="text-xs text-slate-400 font-semibold">{digest.daily.maxWindGust.department}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{digest.daily.maxWindGust.value} km/h</span>
                <span className="text-xs font-bold text-indigo-300">{digest.daily.maxWindGust.stationName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.daily.maxWindGust.comment}</p>
            </div>
          </div>

          {/* Secondary Stats: Mean Temp, Lightning, Sunshine */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="text-xs font-bold uppercase text-slate-400">Température Moyenne Globale</div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{digest.daily.nationalMeanTemp}°C</span>
                <span className={`text-xs font-bold ${digest.daily.nationalTempAnomalyVsNormal >= 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {digest.daily.nationalTempAnomalyVsNormal > 0 ? `+${digest.daily.nationalTempAnomalyVsNormal}` : digest.daily.nationalTempAnomalyVsNormal}°C vs normale
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Climatologie de référence 1991-2020</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="text-xs font-bold uppercase text-slate-400">Activité Électrique & Foudre</div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-yellow-300">
                  {digest.daily.totalLightningStrikesCount.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs text-slate-400">impacts détectés</span>
              </div>
              <div className="text-[11px] text-slate-400">Réseau de détection foudre national</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="text-xs font-bold uppercase text-slate-400">Ensoleillement Moyen</div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-300">{digest.daily.sunshineAverageHours} h</span>
                <span className={`text-xs font-bold ${digest.daily.sunshineAnomalyPct >= 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {digest.daily.sunshineAnomalyPct > 0 ? `+${digest.daily.sunshineAnomalyPct}` : digest.daily.sunshineAnomalyPct}%
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Durée d'insolation moyenne du jour</div>
            </div>
          </div>

          {/* Synoptic situation & Vigilances synthesis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Situation */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Situation Synoptique Générale :
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {digest.daily.synopticSituation}
              </p>
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-white">Faits marquants du jour :</div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {digest.daily.keyHighlights.map((hl: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vigilance Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                Carte des Vigilances Météorologiques Actives :
              </div>
              <div className="space-y-2">
                {digest.daily.vigilancesSummary.map((vig: NationalVigilanceSummaryItem, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-950/80 p-3 border border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-black ${getVigilanceBadge(vig.level)}`}>
                          {vig.level}
                        </span>
                        <span className="text-xs font-bold text-white">{vig.phenomenon}</span>
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
        <div className="space-y-6">
          {/* Weekly Aggregated Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Moyenne Thermique 7 Jours</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{digest.weekly.weeklyMeanTemp}°C</span>
                <span className={`text-xs font-bold ${digest.weekly.weeklyTempAnomalyVsNormal >= 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {digest.weekly.weeklyTempAnomalyVsNormal > 0 ? `+${digest.weekly.weeklyTempAnomalyVsNormal}` : digest.weekly.weeklyTempAnomalyVsNormal}°C vs normale
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Écart moyen calculé sur toutes les stations</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Cumul Pluviométrique</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-300">{digest.weekly.weeklyMeanPrecipitationMm} mm</span>
                <span className="text-xs font-bold text-rose-400">
                  {digest.weekly.weeklyPrecipAnomalyPct}% vs normale
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{digest.weekly.soilMoistureStatus}</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Ensoleillement & Jours de Pluie</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-300">{digest.weekly.weeklySunshineTotalHours} h</span>
                <span className="text-xs text-slate-300">{digest.weekly.rainDaysCount}j de pluie / {digest.weekly.fullSunDaysCount}j grand soleil</span>
              </div>
              <p className="text-[11px] text-slate-400">Cumul d'insolation sur 7 jours</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Rafale Max de la Semaine</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-400">{digest.weekly.weeklyMaxGustKmh} km/h</span>
                <span className="text-xs text-slate-300 font-bold">{digest.weekly.weeklyMaxGustStation}</span>
              </div>
              <p className="text-[11px] text-slate-400">Pic anémométrique hebdomadaire</p>
            </div>
          </div>

          {/* Notable Milestones & Broken Records Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Milestones */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                Chronologie des Événements Météorologiques Marquants :
              </div>
              <div className="space-y-2.5">
                {digest.weekly.notableMilestones.map((ms: NationalWeeklyMilestone, i: number) => (
                  <div key={i} className="rounded-2xl bg-slate-950/80 p-3.5 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-400">{ms.dayLabel} • {ms.eventTitle}</span>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                        ms.severity === 'record' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        ms.severity === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
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
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                <Award className="h-4 w-4 text-amber-400" />
                Records de Stations Battus ou Égalés au Cours de la Semaine :
              </div>
              <div className="space-y-2.5">
                {digest.weekly.brokenRecordsList.map((rec: NationalBrokenRecord, i: number) => (
                  <div key={i} className="rounded-2xl bg-slate-950/80 p-3.5 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">{rec.stationName}</span>
                      <span className="text-[11px] text-slate-400">{rec.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-amber-400 font-bold">{rec.metric} :</span>
                      <span className="font-black text-rose-400 text-sm">{rec.newValue}</span>
                      <span className="text-slate-500 line-through text-[11px]">{rec.oldValue} ({rec.previousYear})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Synthesis Box */}
              <div className="rounded-2xl bg-slate-950/90 p-3.5 border border-slate-800 space-y-1 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Synthèse Climatologique Hebdomadaire :
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
