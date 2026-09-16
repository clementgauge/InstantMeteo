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
    <div id="giga-bulletin-hub-view" className="space-y-4">
      {/* Selector between Communal 4 Semaines, Départemental J+1 à J+7, and National 4 Semaines */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[#0284C7]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Bulletins Météorologiques &amp; Synthèses Régionales
            </h2>
            <p className="text-xs text-slate-400">
              Consultation des expertises : prévision communale 4 semaines, analyse départementale 7 jours ou synthèse nationale.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setBulletinSubMode('communal-4w')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              bulletinSubMode === 'communal-4w'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>1. Bulletin Communal 4 Semaines</span>
          </button>

          <button
            onClick={() => setBulletinSubMode('departmental-7d')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              bulletinSubMode === 'departmental-7d'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            <span>2. Bulletin Départemental 7 Jours</span>
          </button>

          <button
            onClick={() => setBulletinSubMode('national-4w')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              bulletinSubMode === 'national-4w'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>3. Synthèse Nationale</span>
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
