import React, { useState } from 'react';
import { 
  LocationPoint, 
  CurrentWeather, 
  ClimateAnomaly,
  DailyForecast
} from '../types/weather';
import { FourteenDayDetailedTrendsCard } from '../components/FourteenDayDetailedTrendsCard';
import { GigaNationalFourWeekBulletinCard } from '../components/GigaNationalFourWeekBulletinCard';
import { ThirtyDayDailyForecastCard } from '../components/ThirtyDayDailyForecastCard';
import { SeasonalEightMonthTrendsCard } from '../components/SeasonalEightMonthTrendsCard';
import { WinterSnowObservatoryCard } from '../components/WinterSnowObservatoryCard';
import { FrostAndColdObservatoryCard } from '../components/FrostAndColdObservatoryCard';
import { 
  Calendar, 
  Sparkles, 
  Mountain, 
  ThermometerSnowflake, 
  Snowflake, 
  Layers, 
  Clock, 
  Globe, 
  RefreshCw,
  Split,
  MapPin,
  History
} from 'lucide-react';

interface FourWeekTrendsViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  anomaly: ClimateAnomaly;
  dailyForecasts?: DailyForecast[];
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
  initialSubTab?: '14DAYS' | 'BULLETIN4W' | '30DAYS' | '8MONTHS' | 'SNOW' | 'FROST';
}

export const FourWeekTrendsView: React.FC<FourWeekTrendsViewProps> = ({
  station,
  weather,
  anomaly,
  dailyForecasts,
  seniorMode,
  tempUnit = 'C',
  initialSubTab = '14DAYS'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'14DAYS' | 'BULLETIN4W' | '30DAYS' | '8MONTHS' | 'SNOW' | 'FROST'>(initialSubTab);

  return (
    <div id="extended-trends-and-bulletins-view" className="space-y-6">
      {/* Horizon Switcher Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/90 p-2 border border-slate-800 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('14DAYS')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeSubTab === '14DAYS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Split className="h-4 w-4" />
            <span>Tendances 14 Jours (Divergences & N-1)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('BULLETIN4W')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'BULLETIN4W'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Giga Bulletin National 4 Semaines (France)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('30DAYS')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeSubTab === '30DAYS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Prévisions 30 Jours (1x/h)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('8MONTHS')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeSubTab === '8MONTHS'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Tendances 8 Mois (Département / Région / Pays)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SNOW')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'SNOW'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Mountain className="h-4 w-4" />
            <span>Enneigement & Nivologie</span>
          </button>

          <button
            onClick={() => setActiveSubTab('FROST')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'FROST'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <ThermometerSnowflake className="h-4 w-4" />
            <span>Analyseur des Gelées</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium px-2">
          {activeSubTab === '14DAYS' && '🎯 Scénarios ensemblistes, divergences jour par jour & comparatif 2025'}
          {activeSubTab === 'BULLETIN4W' && '🇫🇷 S1 à S4 : Scénarios probabilistes, 6 régions et bilans hydriques'}
          {activeSubTab === '30DAYS' && '⏱️ Reactualisé toutes les heures • J+1 à J+30'}
          {activeSubTab === '8MONTHS' && '🌍 24 Décades spatialisées par Département (101), Région (13) et France'}
          {activeSubTab === 'SNOW' && '🏔️ Couches d\'altitude & Historique 1950-2026'}
          {activeSubTab === 'FROST' && '❄️ 5 Paliers d\'intensité & Grandes vagues de froid'}
        </span>
      </div>

      {/* Render selected component */}
      {activeSubTab === '14DAYS' && (
        <FourteenDayDetailedTrendsCard
          station={station}
          currentTemp={weather.temperature}
          currentAnomaly={anomaly.tempAnomaly}
          dailyForecasts={dailyForecasts}
          currentWeather={weather}
          seniorMode={seniorMode}
          tempUnit={tempUnit}
        />
      )}

      {activeSubTab === 'BULLETIN4W' && (
        <GigaNationalFourWeekBulletinCard
          seniorMode={seniorMode}
          tempUnit={tempUnit}
        />
      )}

      {activeSubTab === '30DAYS' && (
        <ThirtyDayDailyForecastCard
          station={station}
          currentTemp={weather.temperature}
          currentAnomaly={anomaly.tempAnomaly}
          dailyForecasts={dailyForecasts}
          currentWeather={weather}
          seniorMode={seniorMode}
          tempUnit={tempUnit}
        />
      )}

      {activeSubTab === '8MONTHS' && (
        <SeasonalEightMonthTrendsCard
          station={station}
          currentTemp={weather.temperature}
          currentAnomaly={anomaly.tempAnomaly}
          seniorMode={seniorMode}
          tempUnit={tempUnit}
        />
      )}

      {activeSubTab === 'SNOW' && (
        <WinterSnowObservatoryCard
          station={station}
          currentTemp={weather.temperature}
          seniorMode={seniorMode}
        />
      )}

      {activeSubTab === 'FROST' && (
        <FrostAndColdObservatoryCard
          station={station}
          seniorMode={seniorMode}
          tempUnit={tempUnit}
        />
      )}
    </div>
  );
};
