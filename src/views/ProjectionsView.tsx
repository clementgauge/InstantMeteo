import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { HISTORICAL_FRANCE_TEMPS, CLIMATE_PROJECTIONS_GIEC } from '../data/historicalTrends';
import { TrendingUp, AlertTriangle, Globe, Sparkles, ShieldAlert } from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { AnnualTemperatureEvolutionCard } from '../components/AnnualTemperatureEvolutionCard';
import { FRENCH_STATIONS } from '../data/frenchStations';

interface ProjectionsViewProps {
  currentStation?: LocationPoint;
  seniorMode: boolean;
}

export const ProjectionsView: React.FC<ProjectionsViewProps> = ({ 
  currentStation = FRENCH_STATIONS[0],
  seniorMode 
}) => {
  return (
    <div className="space-y-6">
      {/* Annual Temperature Evolution (1950 - 2026) per Locality */}
      <AnnualTemperatureEvolutionCard
        currentStation={currentStation}
        seniorMode={seniorMode}
      />

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Climatologie Historique & Prospective Nationale
            </span>
            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              Évolution Globale des Températures en France (1900 - 2100)
            </h2>
          </div>
        </div>
        <p className={`mt-3 text-slate-300 leading-relaxed ${seniorMode ? 'text-lg' : 'text-sm'}`}>
          Visualisez le réchauffement observé en France depuis 1900 (+1,9°C en moyenne nationale) ainsi que les projections climatiques officielles du GIEC (Scénarios RCP 4.5 maîtrisé et RCP 8.5 tendanciel).
        </p>
      </div>

      {/* Chart 1: Historical Trends (1900 - 2026) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
        <h3 className={`font-bold text-white mb-2 ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
          📈 Évolution Historique Réelle (1900 à 2026)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Température moyenne annuelle en France métropolitaine (°C) et anomalies par rapport à l'ère préindustrielle.
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_FRANCE_TEMPS} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[9.5, 16.0]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(value: any) => [`${value}°C`, 'Température Moyenne']}
                labelFormatter={(label) => `Année ${label}`}
              />
              <Area type="monotone" dataKey="meanTemp" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Future Projections (2020 - 2100) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
        <h3 className={`font-bold text-white mb-2 ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
          🔮 Projections Climatiques Futures (GIEC 2020 - 2100)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Comparaison entre le scénario avec transition écologique (RCP 4.5 en bleu) et sans réduction d'émissions (RCP 8.5 en rouge).
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CLIMATE_PROJECTIONS_GIEC} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[13.5, 21.0]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: any, name: string) => [
                  `${val}°C`, 
                  name === 'rcp85Temp' ? 'Scénario Émissions Hautes (RCP 8.5)' : 'Scénario Transition (RCP 4.5)'
                ]}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" name="rcp45Temp" dataKey="rcp45Temp" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" name="rcp85Temp" dataKey="rcp85Temp" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-5 text-xs text-slate-300">
          <div className="rounded-2xl bg-blue-950/30 border border-blue-800/40 p-4">
            <h4 className="font-bold text-blue-300 mb-1">Scénario Modéré (RCP 4.5) :</h4>
            <p className="leading-relaxed">
              Stabilisation à environ +2,6°C à l'horizon 2050 en France, avec une augmentation maîtrisée des jours caniculaires (+32 jours/an).
            </p>
          </div>
          <div className="rounded-2xl bg-rose-950/30 border border-rose-800/40 p-4">
            <h4 className="font-bold text-rose-300 mb-1">Scénario Intensif (RCP 8.5) :</h4>
            <p className="leading-relaxed">
              Hausse pouvant atteindre +7,0°C d'ici 2100 en été avec près de 98 jours de forte chaleur par an dans le Sud de la France.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
