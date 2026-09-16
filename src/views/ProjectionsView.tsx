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
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
          <Globe className="h-4 w-4 text-indigo-400" />
          <span>Climatologie historique et prospective nationale</span>
        </div>
        <h2 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-2xl'}`}>
          Évolution des températures en France (1900 - 2100)
        </h2>
        <p className={`mt-1 text-slate-300 leading-relaxed ${seniorMode ? 'text-base' : 'text-xs'}`}>
          Réchauffement mesuré en France métropolitaine depuis 1900 (+1,9°C en moyenne nationale) et projections climatiques du GIEC (scénarios RCP 4.5 et RCP 8.5).
        </p>
      </div>

      {/* Chart 1: Historical Trends (1900 - 2026) */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <h3 className={`font-bold text-white mb-1 ${seniorMode ? 'text-xl' : 'text-base'}`}>
          Évolution historique mesurée (1900 à 2026)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Température moyenne annuelle en France métropolitaine (°C) et anomalies par rapport à l'ère préindustrielle.
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_FRANCE_TEMPS} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[9.5, 16.0]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#fff' }}
                formatter={(value: any) => [`${value}°C`, 'Température Moyenne']}
                labelFormatter={(label) => `Année ${label}`}
              />
              <Area type="monotone" dataKey="meanTemp" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Future Projections (2020 - 2100) */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <h3 className={`font-bold text-white mb-1 ${seniorMode ? 'text-xl' : 'text-base'}`}>
          Projections climatiques futures (GIEC 2020 - 2100)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Comparaison entre le scénario avec transition écologique (RCP 4.5) et tendanciel sans réduction (RCP 8.5).
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CLIMATE_PROJECTIONS_GIEC} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[13.5, 21.0]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#fff' }}
                formatter={(val: any, name: string) => [
                  `${val}°C`, 
                  name === 'rcp85Temp' ? 'Scénario Émissions Hautes (RCP 8.5)' : 'Scénario Transition (RCP 4.5)'
                ]}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" name="rcp45Temp" dataKey="rcp45Temp" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" name="rcp85Temp" dataKey="rcp85Temp" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-xs text-slate-300">
          <div className="rounded-md bg-slate-950 border border-slate-800 p-3">
            <h4 className="font-bold text-blue-300 mb-1">Scénario modéré (RCP 4.5) :</h4>
            <p className="leading-relaxed text-slate-300">
              Stabilisation à environ +2,6°C à l'horizon 2050 en France, avec une augmentation des jours chauds.
            </p>
          </div>
          <div className="rounded-md bg-slate-950 border border-slate-800 p-3">
            <h4 className="font-bold text-rose-300 mb-1">Scénario tendanciel (RCP 8.5) :</h4>
            <p className="leading-relaxed text-slate-300">
              Hausse pouvant atteindre +7,0°C d'ici 2100 en été avec forte augmentation des vagues de chaleur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
