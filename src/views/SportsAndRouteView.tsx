import React from 'react';
import { 
  Activity, 
  Bike, 
  Footprints, 
  Sun, 
  CloudRain, 
  Wind, 
  ShieldCheck, 
  Compass, 
  Navigation, 
  Shirt, 
  Glasses, 
  Umbrella, 
  Clock,
  Sparkles,
  TrendingUp,
  Waves
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast } from '../types/weather';
import { RouteWeatherCalculator } from '../components/RouteWeatherCalculator';

interface SportsAndRouteViewProps {
  station: LocationPoint;
  currentStation?: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily?: any[];
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const SportsAndRouteView: React.FC<SportsAndRouteViewProps> = ({
  station,
  currentStation,
  weather,
  hourly,
  daily,
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const activeStation = station || currentStation;

  // Compute outdoor activity score (0-10) "Ça vaut le coup de sortir ?"
  const calculateOutdoorsScore = () => {
    let score = 10;
    if (weather.precipitation > 0) score -= Math.min(5, weather.precipitation * 2);
    if (weather.windSpeed > 35) score -= 2;
    if (weather.windSpeed > 60) score -= 4;
    if (weather.temperature < 3 || weather.temperature > 34) score -= 2.5;
    if (weather.uvIndex && weather.uvIndex >= 8) score -= 1;
    return Math.max(1, Math.min(10, Number(score.toFixed(1))));
  };

  const outdoorScore = calculateOutdoorsScore();

  const activities = [
    {
      name: 'Running & Course à pied',
      icon: Footprints,
      score: outdoorScore >= 7 ? '9/10 • Idéal' : outdoorScore >= 4 ? '6/10 • Faisable' : '3/10 • Déconseillé',
      color: outdoorScore >= 7 ? 'text-emerald-400' : 'text-amber-400',
      tips: 'Température optimale pour l\'effort aérobie. Prévoyez une bonne hydratation.',
      slot: '08h00 - 11h30'
    },
    {
      name: 'Cyclisme sur route & VTT',
      icon: Bike,
      score: (weather.windSpeed > 30 || weather.precipitation > 0) ? '4/10 • Prudence' : '8.5/10 • Excellent',
      color: (weather.windSpeed > 30 || weather.precipitation > 0) ? 'text-amber-400' : 'text-emerald-400',
      tips: `Vent à ${weather.windSpeed} km/h. Attention aux rafales latérales en descente.`,
      slot: '14h00 - 18h00'
    },
    {
      name: 'Randonnée & Plein Air',
      icon: Compass,
      score: weather.precipitation === 0 ? '9.2/10 • Remarquable' : '5/10 • Chaussures étanches',
      color: weather.precipitation === 0 ? 'text-emerald-400' : 'text-amber-400',
      tips: 'Visibilité dégagée. Prenez une veste respirante dans le sac.',
      slot: 'Journée entière'
    },
    {
      name: 'Baignade & Sports Nautiques',
      icon: Sun,
      score: weather.temperature >= 22 && weather.precipitation === 0 ? '8.8/10 • Très propice' : '4.5/10 • Frais',
      color: weather.temperature >= 22 ? 'text-emerald-400' : 'text-slate-400',
      tips: `Indice UV : ${weather.uvIndex ?? 5}. Crème solaire recommandée.`,
      slot: '12h00 - 17h00'
    }
  ];

  return (
    <div id="page-sportsActivities" className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-wider mb-2">
            <Activity className="h-4 w-4 text-teal-400" />
            <span>Page 15 • Observatoire Activités, Sports &amp; Trajets</span>
          </div>
          <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
            Météo Sportive &amp; Calculateur d'Itinéraire Routier
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Index biométéorologique « Ça vaut le coup de sortir ? », analyse des créneaux horaires favorables pour le sport et calcul météo étape par étape sur vos trajets routiers.
          </p>
        </div>
      </div>

      {/* Main Outdoor Score Card */}
      <div id="sports-score-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Index Global de Sortie ({activeStation?.name})
            </span>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-black text-white">{outdoorScore}</span>
              <span className="text-xl text-slate-400 font-bold">/ 10</span>
            </div>
            <div className="mt-2 text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>{outdoorScore >= 7.5 ? 'Conditions Très Favorables' : outdoorScore >= 5 ? 'Conditions Correctes' : 'Conditions Délicates'}</span>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Basé sur la température ({weather.temperature}°{tempUnit}), le ressenti ({weather.feelsLike}°{tempUnit}), les précipitations ({weather.precipitation} mm) et le vent ({weather.windSpeed} km/h).
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-300">Recommandations Vestimentaires :</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                <Shirt className="h-3.5 w-3.5 text-teal-400" />
                {weather.temperature < 15 ? 'Veste respirante' : 'T-shirt technique'}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                <Glasses className="h-3.5 w-3.5 text-amber-400" />
                Protection UV
              </span>
              {weather.precipitation > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <Umbrella className="h-3.5 w-3.5 text-blue-400" />
                  Imperméable
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Specific Sports Breakdown */}
        <div id="sports-disciplines-section" className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.name} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-white text-sm">{act.name}</span>
                    </div>
                  </div>
                  <div className={`text-xs font-black mb-2 ${act.color}`}>
                    {act.score}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {act.tips}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-teal-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Meilleur créneau : <strong>{act.slot}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trajet & Itinéraire Routier Complet avec Moteur de Recherche de Communes & Calcul Open-Meteo */}
      <RouteWeatherCalculator
        currentStation={activeStation}
        tempUnit={tempUnit}
        seniorMode={seniorMode}
      />
    </div>
  );
};
