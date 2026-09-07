import React, { useState } from 'react';
import { 
  FileText, 
  Globe, 
  Calendar, 
  Sparkles, 
  Layers, 
  MapPin, 
  Compass, 
  Sun, 
  CloudRain, 
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Flag,
  Search
} from 'lucide-react';
import { GigaDepartmentalDailyBulletinCard } from '../components/GigaDepartmentalDailyBulletinCard';
import { GigaNationalFourWeekBulletinCard } from '../components/GigaNationalFourWeekBulletinCard';
import { CommunalFourWeekBulletinCard } from '../components/CommunalFourWeekBulletinCard';
import { LocationPoint, DailyForecast } from '../types/weather';

interface GigaBulletinViewProps {
  currentStation: LocationPoint;
  dailyForecasts?: DailyForecast[];
  seniorMode: boolean;
  tempUnit: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
}

export const GigaBulletinView: React.FC<GigaBulletinViewProps> = ({
  currentStation,
  dailyForecasts,
  seniorMode,
  tempUnit,
  onSelectStation
}) => {
  // Sub-mode: 'communal-4w' | 'departmental-7d' | 'national-4w'
  const [bulletinSubMode, setBulletinSubMode] = useState<'communal-4w' | 'departmental-7d' | 'national-4w'>('communal-4w');

  // Extract department number from current station if available (e.g., "75 - Paris" -> "75")
  const defaultDeptCode = currentStation.department?.split(' ')[0] || '75';

  return (
    <div id="giga-bulletin-hub-view" className="space-y-6">
      {/* Selector between Communal 4 Semaines, Départemental J+1 à J+7, and National 4 Semaines */}
      <div className="rounded-[24px] sm:rounded-3xl border border-slate-800/90 bg-[#0c1424]/95 sm:bg-slate-900/90 p-3.5 sm:p-5 shadow-xl backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Espace Giga Bulletins Météorologiques &amp; Expertises Textuelles
            </h2>
            <p className="text-xs text-slate-400">
              Choisissez l'échelle : Bulletin 4 Semaines par Commune (36 000+ Communes), Bulletin J+1 à J+7 par Département (101 Dép. &amp; Monde), ou Synthèse Nationale 4 Semaines
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#080d19]/90 sm:bg-slate-950 rounded-[20px] sm:rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setBulletinSubMode('communal-4w')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full sm:rounded-xl text-xs font-black transition active:scale-95 ${
              bulletinSubMode === 'communal-4w'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>1. 🇫🇷 Bulletin 4 Semaines par Commune</span>
          </button>

          <button
            onClick={() => setBulletinSubMode('departmental-7d')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full sm:rounded-xl text-xs font-black transition active:scale-95 ${
              bulletinSubMode === 'departmental-7d'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="h-4 w-4" />
            <span>2. Bulletin J+1 à J+7 par Département</span>
          </button>

          <button
            onClick={() => setBulletinSubMode('national-4w')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full sm:rounded-xl text-xs font-black transition active:scale-95 ${
              bulletinSubMode === 'national-4w'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>3. Bulletin National 4 Semaines</span>
          </button>
        </div>
      </div>

      {/* Render selected bulletin */}
      {bulletinSubMode === 'communal-4w' ? (
        <CommunalFourWeekBulletinCard
          currentStation={currentStation}
          seniorMode={seniorMode}
          tempUnit={tempUnit}
          onSelectStation={onSelectStation}
        />
      ) : bulletinSubMode === 'departmental-7d' ? (
        <GigaDepartmentalDailyBulletinCard
          seniorMode={seniorMode}
          tempUnit={tempUnit}
          initialDepartmentCode={defaultDeptCode}
          currentStation={currentStation}
          dailyForecasts={dailyForecasts}
        />
      ) : (
        <GigaNationalFourWeekBulletinCard
          seniorMode={seniorMode}
          tempUnit={tempUnit}
        />
      )}
    </div>
  );
};
