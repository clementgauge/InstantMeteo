import React, { useState, useMemo } from 'react';
import { 
  Waves, 
  Thermometer, 
  Wind, 
  Sun, 
  Compass, 
  ShieldAlert, 
  Clock, 
  Droplets, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Anchor,
  Navigation,
  LifeBuoy
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { 
  FRENCH_BEACH_SPOTS, 
  BeachSpotData, 
  findNearestBeach, 
  calculateAstronomicalTides 
} from '../services/beachWeatherService';

interface BeachWeatherViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

export const BeachWeatherView: React.FC<BeachWeatherViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const defaultBeach = useMemo(() => findNearestBeach(station), [station]);
  const [selectedBeachId, setSelectedBeachId] = useState<string>(defaultBeach.id);
  const [selectedFacadeFilter, setSelectedFacadeFilter] = useState<string>('all');

  const selectedBeach = useMemo(() => {
    return FRENCH_BEACH_SPOTS.find(b => b.id === selectedBeachId) || defaultBeach;
  }, [selectedBeachId, defaultBeach]);

  // Re-sync when station changes
  React.useEffect(() => {
    const nearest = findNearestBeach(station);
    setSelectedBeachId(nearest.id);
  }, [station]);

  // Calculate astronomical tide for current date and time
  const liveTides = useMemo(() => {
    const isMed = selectedBeach.facade === 'mediterranee' || selectedBeach.facade === 'cote-azur';
    return calculateAstronomicalTides(new Date(), isMed);
  }, [selectedBeach]);

  const filteredBeaches = useMemo(() => {
    if (selectedFacadeFilter === 'all') return FRENCH_BEACH_SPOTS;
    return FRENCH_BEACH_SPOTS.filter(b => b.facade === selectedFacadeFilter);
  }, [selectedFacadeFilter]);

  // Bathing flag styling
  const getFlagStyle = (flag: 'VERT' | 'JAUNE' | 'ROUGE' | 'VIOLET') => {
    switch (flag) {
      case 'VERT':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'Drapeau Vert - Baignade Surveillée Sans Danger',
          dot: 'bg-emerald-400'
        };
      case 'JAUNE':
        return {
          bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          label: 'Drapeau Jaune - Baignade Dangereuse mais Surveillée',
          dot: 'bg-yellow-400'
        };
      case 'ROUGE':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
          label: 'Drapeau Rouge - Baignade Interdite',
          dot: 'bg-red-400'
        };
      case 'VIOLET':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          label: 'Drapeau Violet - Pollution ou Méduses',
          dot: 'bg-purple-400'
        };
    }
  };

  const flagStyle = getFlagStyle(selectedBeach.flagColor);

  return (
    <div className={`min-h-screen px-3 sm:px-6 py-6 space-y-6 animate-fadeIn ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Maritime Banner */}
      <div className={`p-5 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
        isLightMode 
          ? 'bg-gradient-to-br from-cyan-50 via-white to-blue-50/50 border-cyan-200' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Waves className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  SHOM • Météo-France Maritime • Copernicus SST
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Marées Astronomiques SHOM en Temps Réel
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Météo des Plages, Marées & Conditions Maritimes
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Température de l'eau (SST), coefficients et horaires de marée SHOM, houle Douglas, sécurité baïnes et drapeaux officiels.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/80">
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Eau de Mer</div>
              <div className="text-base sm:text-lg font-black text-cyan-400">{selectedBeach.waterTempC} °C</div>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Coeff. Marée</div>
              <div className="text-base sm:text-lg font-black text-blue-400">{liveTides.tideCoefficient}</div>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Plage Active</div>
              <div className="text-xs font-bold text-emerald-400 max-w-[130px] truncate">{selectedBeach.name.split(' - ')[0]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Beach Selector Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sélectionnez un Spot Côtier Français ({FRENCH_BEACH_SPOTS.length} spots répertoriés)</span>
          </div>

          {/* Facade Filter Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'Toutes les côtes' },
              { id: 'atlantique-sud', label: 'Atlantique Sud' },
              { id: 'atlantique-nord', label: 'Atlantique Nord' },
              { id: 'mediterranee', label: 'Méditerranée' },
              { id: 'cote-azur', label: 'Côte d\'Azur' },
              { id: 'manche', label: 'Manche' },
              { id: 'corse', label: 'Corse' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFacadeFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedFacadeFilter === f.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal scroll of beaches */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {filteredBeaches.map(b => {
            const isSelected = b.id === selectedBeach.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBeachId(b.id)}
                className={`flex flex-col text-left px-3.5 py-2.5 rounded-xl border transition shrink-0 min-w-[210px] cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">{b.facadeName.split(' & ')[0]}</span>
                  <span className="text-[11px] font-black text-cyan-300">{b.waterTempC}°C eau</span>
                </div>
                <div className="font-bold text-sm text-white mt-1 truncate">{b.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>Houle : {b.waveHeightM}m ({b.wavePeriodSec}s)</span>
                  <span className="text-slate-500">{b.department.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Tidal & Beach Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tides & Water Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Beach Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <LifeBuoy className="w-4 h-4" />
                  <span>{selectedBeach.facadeName}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  {selectedBeach.name}
                </h3>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${flagStyle.bg}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${flagStyle.dot}`} />
                <span>{flagStyle.label}</span>
              </div>
            </div>

            {/* Description & Flag Meaning */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Réglementation Baignade & État du Plan d'Eau</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedBeach.flagMeaning}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-800/80 pt-2">
                {selectedBeach.description}
              </p>
            </div>

            {/* Baïne Danger Alert Banner */}
            {selectedBeach.baineWarning && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Alerte Courants d'Arrachement de Baïnes (Océan Atlantique)</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  Sur le littoral atlantique (Landes, Gironde, Pyrénées-Atlantiques), les baïnes créent de violents courants aspirant vers le large, particulièrement entre la mi-marée et la marée basse. En cas d'entraînement, <strong>ne luttez jamais à contre-courant</strong> : laissez-vous porter et nagez parallèlement à la plage pour regagner le banc de sable.
                </p>
              </div>
            )}

            {/* Astronomical SHOM Tides Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <Anchor className="w-4 h-4" />
                  <span>Annuaire des Marées SHOM (Calcul Réel Aujourd'hui)</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Régime semi-diurne
                </span>
              </div>

              {liveTides.isMicroTide ? (
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  Bassin Méditerranéen : <strong>Micro-marée négligeable (&lt; 25 cm de marnage)</strong>. Les courants de marée sont quasi nuls. La hauteur d'eau dépend principalement des vents synoptiques et de la pression atmosphérique.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pleine Mer (PM)</span>
                    </div>
                    <div className="text-lg font-black text-blue-400 mt-1">{liveTides.tideHighTime}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Haute mer</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Basse Mer (BM)</span>
                    </div>
                    <div className="text-lg font-black text-indigo-400 mt-1">{liveTides.tideLowTime}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Basse mer</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Coeff. Marée</div>
                    <div className="text-lg font-black text-cyan-400 mt-1">{liveTides.tideCoefficient}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{liveTides.tideType}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">État Actuel</div>
                    <div className="text-xs font-black text-emerald-400 mt-2 truncate">{liveTides.tideStatus.split(' (')[0]}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Marnage ~{liveTides.rangeMeters} m</div>
                  </div>
                </div>
              )}
            </div>

            {/* Water Quality & Pavillon Bleu */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Qualité des Eaux de Baignade (ARS) :</span>
                <strong className="text-slate-200">{selectedBeach.waterQuality}</strong>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Régime : <strong className="text-slate-200">{selectedBeach.windThermalBreeze}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Marine Variables (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Waves className="w-4 h-4" />
                <span>Conditions Nautiques & Baignade</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Score {selectedBeach.bathingComfortScore}/10
              </span>
            </div>

            {/* Variables List */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Température de l'Eau (SST)</div>
                    <div className="text-[10px] text-slate-500">Capteurs bouées côtières Météo-France</div>
                  </div>
                </div>
                <div className="text-lg font-black text-cyan-400">
                  {selectedBeach.waterTempC} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Température de l'Air Littoral</div>
                    <div className="text-[10px] text-slate-500">Ambiance thermique sous abri</div>
                  </div>
                </div>
                <div className="text-lg font-black text-amber-300">
                  {selectedBeach.airTempC} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Waves className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Hauteur & Période de Houle</div>
                    <div className="text-[10px] text-slate-500">Modèle vagues MFWAM</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{selectedBeach.waveHeightM} m</span>
                  <span className="text-xs text-slate-400 ml-1.5">(période {selectedBeach.wavePeriodSec}s)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wind className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Vent Côtier & Rafales</div>
                    <div className="text-[10px] text-slate-500">Secteur {selectedBeach.windDirectionCompass}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{selectedBeach.windSpeedKnots} kts</span>
                  <span className="text-xs text-slate-400 ml-1.5">({Math.round(selectedBeach.windSpeedKnots * 1.852)} km/h)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">État de la Mer (Échelle Douglas)</div>
                    <div className="text-[10px] text-slate-500">Agitation de surface</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-200">
                  {selectedBeach.seaStateDouglas}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Rayonnement UV Plage</div>
                    <div className="text-[10px] text-slate-500">Réverbération sable et eau</div>
                  </div>
                </div>
                <div className="text-base font-black text-amber-400">
                  Indice UV {selectedBeach.beachUvIndex}
                </div>
              </div>
            </div>

            {/* Bathing Advice Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Conseil Baignade : </strong>
              Écart eau-air de <strong>{Math.abs(Number((selectedBeach.airTempC - selectedBeach.waterTempC).toFixed(1)))}°C</strong>. Mouillez-vous la nuque et le torse avant immersion pour prévenir l'hydrocution. Appliquez une protection solaire SPF 50+ toutes les deux heures.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
