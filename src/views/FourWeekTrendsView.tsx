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
    <div id="extended-trends-and-bulletins-view" className="space-y-4">
      {/* Horizon Switcher Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-[#0F172A] p-2.5 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('14DAYS')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              activeSubTab === '14DAYS'
                ? 'bg-[#0284C7] text-white border-sky-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <Split className="h-3.5 w-3.5" />
            <span>Tendances 14 Jours (Divergences & N-1)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('BULLETIN4W')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              activeSubTab === 'BULLETIN4W'
                ? 'bg-[#0284C7] text-white border-sky-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Bulletin National 4 Semaines (France)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('30DAYS')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              activeSubTab === '30DAYS'
                ? 'bg-[#0284C7] text-white border-sky-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Prévisions 30 Jours</span>
          </button>

          <button
            onClick={() => setActiveSubTab('8MONTHS')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              activeSubTab === '8MONTHS'
                ? 'bg-[#0284C7] text-white border-sky-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Tendances 8 Mois</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SNOW')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              activeSubTab === 'SNOW'
                ? 'bg-[#0284C7] text-white border-sky-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <Mountain className="h-3.5 w-3.5" />
            <span>Enneigement & Nivologie</span>
          </button>

          <button
            onClick={() => setActiveSubTab('FROST')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              activeSubTab === 'FROST'
                ? 'bg-[#0284C7] text-white border-sky-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <ThermometerSnowflake className="h-3.5 w-3.5" />
            <span>Gelées & Vagues de Froid</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium px-1">
          {activeSubTab === '14DAYS' && 'Scénarios ensemblistes, divergences jour par jour & comparatif N-1'}
          {activeSubTab === 'BULLETIN4W' && 'S1 à S4 : Scénarios probabilistes, 6 régions et bilans hydriques'}
          {activeSubTab === '30DAYS' && 'Mise à jour horaire • Horizon J+1 à J+30'}
          {activeSubTab === '8MONTHS' && '24 Décades spatialisées par Département, Région et France'}
          {activeSubTab === 'SNOW' && 'Massifs alpins, pyrénéens, centraux et vosgiens'}
          {activeSubTab === 'FROST' && 'Paliers de gel et climatologie des hivers'}
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
