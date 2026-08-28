import React, { useState } from 'react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import { 
  Footprints, 
  Bike, 
  Palmtree, 
  Sprout, 
  SunMedium, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Wind, 
  Thermometer, 
  Droplets,
  CloudLightning,
  Sparkles
} from 'lucide-react';

interface OutdoorIndicesCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  seniorMode: boolean;
}

export const OutdoorIndicesCard: React.FC<OutdoorIndicesCardProps> = ({
  weather,
  station,
  seniorMode
}) => {
  const [activeTab, setActiveTab] = useState<'hiking' | 'cycling' | 'beach' | 'agri' | 'solar'>('hiking');
  const indices = weather.outdoorIndices;

  if (!indices) return null;

  return (
    <div id="outdoor-indices-card" className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              Indices d'Activités & Confort Plein Air
            </h3>
            <p className="text-xs text-slate-400">
              Évaluations biométéorologiques pour sports, loisirs, agriculture et énergie
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-950 p-1 border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('hiking')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'hiking' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="h-3.5 w-3.5" />
            <span>Randonnée</span>
          </button>

          <button
            onClick={() => setActiveTab('cycling')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'cycling' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="h-3.5 w-3.5" />
            <span>Cyclisme / Run</span>
          </button>

          <button
            onClick={() => setActiveTab('beach')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'beach' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palmtree className="h-3.5 w-3.5" />
            <span>Plage / Voile</span>
          </button>

          <button
            onClick={() => setActiveTab('agri')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'agri' ? 'bg-lime-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sprout className="h-3.5 w-3.5" />
            <span>Jardin & Agri</span>
          </button>

          <button
            onClick={() => setActiveTab('solar')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'solar' ? 'bg-yellow-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SunMedium className="h-3.5 w-3.5" />
            <span>Énergie Solaire</span>
          </button>
        </div>
      </div>

      {/* Content for Active Tab */}
      {activeTab === 'hiking' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400">Score Randonnée & Alpinisme</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white">{indices.hiking.score}</span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
              <span className={`inline-block mt-2 rounded-xl px-2.5 py-1 text-xs font-black ${
                indices.hiking.status === 'EXCELLENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                indices.hiking.status === 'FAVORABLE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {indices.hiking.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
              Altitude du site : <strong>{station.altitude} m</strong>
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Facteurs de Sécurité Montagne</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Risque orageux :</span>
                <span className={`font-bold ${indices.hiking.riskThunderstorm === 'Élevé' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {indices.hiking.riskThunderstorm}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vent sur les crêtes :</span>
                <span className="font-bold text-white">{indices.hiking.windAtRidgeKmh} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plafond nuageux estimé :</span>
                <span className="font-bold text-blue-300">{indices.hiking.cloudBaseMeters} m</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Conseil de Sortie</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{indices.hiking.advice}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cycling' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400">Indice Cyclisme & Course à Pied</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white">{indices.cycling.score}</span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
              <span className="inline-block mt-2 rounded-xl px-2.5 py-1 text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {indices.cycling.status}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider">Conditions Routières</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Impact du vent :</span>
              <span className="font-bold text-amber-300">{indices.cycling.windImpact}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stress thermique à l'effort :</span>
              <span className="font-bold text-slate-200">{indices.cycling.heatStress}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bike className="h-4 w-4" />
                <span>Recommandation Endurance</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{indices.cycling.advice}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'beach' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400">Indice Plage & Baignade</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-amber-400">{indices.beachSea.score}</span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider">Aérologie Côtière</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Indice UV réel :</span>
              <span className="font-bold text-amber-400">{weather.uvIndex} ({indices.beachSea.uvRisk})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Brise marine thermique :</span>
              <span className="font-bold text-white">{indices.beachSea.thermalBreezeKmh} km/h</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palmtree className="h-4 w-4" />
                <span>Protection Solaire</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{indices.beachSea.advice}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agri' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400">Évapotranspiration (ETP Penman-Monteith)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-lime-400">{indices.gardeningAgriculture.et0Evapotranspiration}</span>
                <span className="text-sm font-bold text-slate-400">mm / jour</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Rythme d'assèchement : <strong className="text-slate-200">{indices.gardeningAgriculture.soilDryingRate}</strong>
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider">Fenêtres Agronomiques</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fenêtre de pulvérisation :</span>
              <span className="font-bold text-lime-300">{indices.gardeningAgriculture.sprayWindow}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risque gelée nocturne :</span>
              <span className="font-bold text-slate-200">{indices.gardeningAgriculture.frostRiskGround}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-lime-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sprout className="h-4 w-4" />
                <span>Conseil Cultures & Potager</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{indices.gardeningAgriculture.advice}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'solar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400">Rendement Photovoltaïque Estimé</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-yellow-400">{indices.solarEnergy.pvOutputPotentialKwhPerKwp}</span>
                <span className="text-sm font-bold text-slate-400">kWh / kWc / jour</span>
              </div>
              <span className="inline-block mt-2 rounded-xl px-2.5 py-1 text-xs font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                Efficacité {indices.solarEnergy.efficiencyScore}%
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider">Potentiel Solaire du Jour</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ensoleillement effectif :</span>
              <span className="font-bold text-yellow-300">~{indices.solarEnergy.sunHoursEstimated} heures</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Production pour installation 6 kWc :</span>
              <span className="font-bold text-white">{Number((indices.solarEnergy.pvOutputPotentialKwhPerKwp * 6).toFixed(1))} kWh</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <SunMedium className="h-4 w-4" />
                <span>Bilan Énergétique</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{indices.solarEnergy.advice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
