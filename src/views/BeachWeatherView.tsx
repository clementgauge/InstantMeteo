import React, { useState } from 'react';
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
  Anchor
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';

interface BeachWeatherViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

interface BeachSpotData {
  id: string;
  name: string;
  facade: string;
  department: string;
  waterTempC: number;
  airTempC: number;
  tideHighTime: string;
  tideLowTime: string;
  tideCoefficient: number; // 20 à 120
  tideStatus: 'Marée Montante (Flot)' | 'Marée Descendante (Jusant)' | 'Pleine Mer' | 'Basse Mer';
  tideType: 'Vives-Eaux' | 'Mortes-Eaux' | 'Moyennes';
  seaStateDouglas: '0 - Mer d\'huile' | '1 - Mer ridée' | '2 - Belle' | '3 - Peu agitée' | '4 - Agitée' | '5 - Forte';
  waveHeightM: number;
  wavePeriodSec: number;
  flagColor: 'VERT' | 'JAUNE' | 'ROUGE' | 'VIOLET';
  flagMeaning: string;
  windSpeedKnots: number;
  windGustKnots: number;
  windDirectionCompass: string;
  windThermalBreeze: 'Brise de mer active (on-shore)' | 'Brise de terre (off-shore)' | 'Régime général synoptique';
  beachUvIndex: number;
  bathingComfortScore: number; // 0-10
  waterQuality: 'Excellente (Pavillon Bleu)' | 'Bonne' | 'Surveillance temporaire';
  description: string;
}

const BEACH_SPOTS_DATABASE: BeachSpotData[] = [
  {
    id: 'biarritz',
    name: 'Biarritz - Grande Plage & Côte des Basques',
    facade: 'Côte Basque & Atlantique Sud',
    department: 'Pyrénées-Atlantiques (64)',
    waterTempC: 17.5,
    airTempC: 22.0,
    tideHighTime: '16h45',
    tideLowTime: '10h30',
    tideCoefficient: 88,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '4 - Agitée',
    waveHeightM: 1.8,
    wavePeriodSec: 12,
    flagColor: 'JAUNE',
    flagMeaning: 'Baignade surveillée avec danger limité : courants de baïne actifs à marée montante et shorebreak marqué.',
    windSpeedKnots: 12,
    windGustKnots: 18,
    windDirectionCompass: 'ONO',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.5,
    bathingComfortScore: 7.8,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Hauts rouleaux atlantiques célèbres pour le surf. Prudence impérative lors de la montée du flot dans les zones de baïnes.'
  },
  {
    id: 'marseille-prado',
    name: 'Marseille - Plages du Prado & Calanques',
    facade: 'Méditerranée Occidentale',
    department: 'Bouches-du-Rhône (13)',
    waterTempC: 21.5,
    airTempC: 26.5,
    tideHighTime: '14h20',
    tideLowTime: '08h15',
    tideCoefficient: 42,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '2 - Belle',
    waveHeightM: 0.4,
    wavePeriodSec: 5,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée sans danger particulier. Eau limpide et vent thermique modéré.',
    windSpeedKnots: 8,
    windGustKnots: 12,
    windDirectionCompass: 'SO',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 7.2,
    bathingComfortScore: 9.2,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Conditions idéales de baignade estivale. Mer peu agitée, courant quasi nul typique du bassin méditerranéen.'
  },
  {
    id: 'saint-malo',
    name: 'Saint-Malo - Plage du Sillon',
    facade: 'Manche & Mer de Bretagne',
    department: 'Ille-et-Vilaine (35)',
    waterTempC: 15.2,
    airTempC: 19.5,
    tideHighTime: '18h10',
    tideLowTime: '11h50',
    tideCoefficient: 95,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '3 - Peu agitée',
    waveHeightM: 0.9,
    wavePeriodSec: 8,
    flagColor: 'JAUNE',
    flagMeaning: 'Marée de vive-eau spectaculaire : vitesse de submersion rapide de l\'estran. Ne pas se laisser isoler sur les bancs de sable.',
    windSpeedKnots: 15,
    windGustKnots: 22,
    windDirectionCompass: 'O',
    windThermalBreeze: 'Régime général synoptique',
    beachUvIndex: 5.5,
    bathingComfortScore: 6.8,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Plus fortes marées d\'Europe avec marnage supérieur à 11 mètres. Spectacle magistral des vagues sur la digue du Sillon.'
  },
  {
    id: 'arcachon',
    name: 'Arcachon - Dune du Pilat & Pereire',
    facade: 'Côte d\'Argent & Atlantique',
    department: 'Gironde (33)',
    waterTempC: 19.0,
    airTempC: 23.5,
    tideHighTime: '17h05',
    tideLowTime: '10h55',
    tideCoefficient: 84,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '2 - Belle',
    waveHeightM: 0.6,
    wavePeriodSec: 7,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée dans le bassin d\'Arcachon. Bassin abrité de la grosse houle océanique.',
    windSpeedKnots: 9,
    windGustKnots: 14,
    windDirectionCompass: 'NO',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.8,
    bathingComfortScore: 8.9,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Eaux plus calmes et plus chaudes à l\'intérieur du bassin que sur le littoral océanique ouvert.'
  },
  {
    id: 'nice-promenade',
    name: 'Nice - Baie des Anges (Promenade)',
    facade: 'Côte d\'Azur & Riviera',
    department: 'Alpes-Maritimes (06)',
    waterTempC: 22.8,
    airTempC: 27.0,
    tideHighTime: '15h00',
    tideLowTime: '09h00',
    tideCoefficient: 38,
    tideStatus: 'Basse Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '1 - Mer ridée',
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    flagColor: 'VERT',
    flagMeaning: 'Baignade sans risque. Forte déclivité immédiate des fonds de galets (forte pente à 3 mètres du rivage).',
    windSpeedKnots: 6,
    windGustKnots: 10,
    windDirectionCompass: 'S',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 7.6,
    bathingComfortScore: 9.4,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Eau turquoise cristalline de la baie des Anges. Vigilance pour les jeunes enfants en raison du tombant abrupt de galets.'
  },
  {
    id: 'la-rochelle',
    name: 'La Rochelle - Île de Ré & Minimes',
    facade: 'Côte Charentaise & Pertuis',
    department: 'Charente-Maritime (17)',
    waterTempC: 18.2,
    airTempC: 21.5,
    tideHighTime: '17h30',
    tideLowTime: '11h20',
    tideCoefficient: 82,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '2 - Belle',
    waveHeightM: 0.7,
    wavePeriodSec: 7,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée sans danger. Pertuis d\'Antioche protégeant le plan d\'eau de la houle du large.',
    windSpeedKnots: 11,
    windGustKnots: 16,
    windDirectionCompass: 'O',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.2,
    bathingComfortScore: 8.2,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Parfait équilibre entre baignade familiale et sports nautiques (voile, paddle, kite-surf).'
  },
  {
    id: 'le-touquet',
    name: 'Le Touquet-Paris-Plage',
    facade: 'Côte d\'Opale & Manche Est',
    department: 'Pas-de-Calais (62)',
    waterTempC: 14.8,
    airTempC: 18.5,
    tideHighTime: '13h40',
    tideLowTime: '20h15',
    tideCoefficient: 76,
    tideStatus: 'Marée Descendante (Jusant)',
    tideType: 'Moyennes',
    seaStateDouglas: '3 - Peu agitée',
    waveHeightM: 0.8,
    wavePeriodSec: 6,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée. Immense estran de sable fin se découvrant à perte de vue à marée basse.',
    windSpeedKnots: 14,
    windGustKnots: 20,
    windDirectionCompass: 'SO',
    windThermalBreeze: 'Régime général synoptique',
    beachUvIndex: 5.0,
    bathingComfortScore: 6.5,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Paradis du char à voile et des grandes promenades iodées le long des dunes côtières.'
  },
  {
    id: 'porto-vecchio',
    name: 'Porto-Vecchio - Palombaggia & Santa Giulia',
    facade: 'Corse du Sud',
    department: 'Corse-du-Sud (2A)',
    waterTempC: 23.5,
    airTempC: 28.2,
    tideHighTime: '14h45',
    tideLowTime: '08h30',
    tideCoefficient: 35,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '0 - Mer d\'huile',
    waveHeightM: 0.2,
    wavePeriodSec: 3,
    flagColor: 'VERT',
    flagMeaning: 'Conditions paradisiaques : eau chaude transparente, lagon peu profond et vent nul.',
    windSpeedKnots: 5,
    windGustKnots: 8,
    windDirectionCompass: 'E',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 8.0,
    bathingComfortScore: 9.8,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Sable blanc corallien, pins parasols et rochers de granit rouge. Température de l\'eau digne d\'un lagon tropical.'
  }
];

export const BeachWeatherView: React.FC<BeachWeatherViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const [selectedSpotId, setSelectedSpotId] = useState<string>('biarritz');
  const selectedSpot = BEACH_SPOTS_DATABASE.find(b => b.id === selectedSpotId) || BEACH_SPOTS_DATABASE[0];

  const getFlagBadge = (color: BeachSpotData['flagColor']) => {
    switch (color) {
      case 'VERT':
        return { label: 'Drapeau Vert (Baignade sans danger)', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'JAUNE':
        return { label: 'Drapeau Jaune (Baignade dangereuse mais surveillée)', bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      case 'ROUGE':
        return { label: 'Drapeau Rouge (Baignade strictement interdite)', bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
      case 'VIOLET':
        return { label: 'Drapeau Violet (Pollution ou méduses)', bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' };
    }
  };

  const flagInfo = getFlagBadge(selectedSpot.flagColor);

  return (
    <div className={`min-h-screen px-4 py-6 md:px-8 space-y-8 animate-fadeIn ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Banner Header */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
        isLightMode 
          ? 'bg-gradient-to-br from-cyan-50 via-white to-blue-50/50 border-cyan-200' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Waves className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  SHOM & Copernicus Marine
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Température Mer Satellite en Direct
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Météo des Plages & Littoral
              </h1>
              <p className={`text-sm mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Température de l'eau, coefficients & horaires des marées SHOM, état de la mer, houle et drapeaux de baignade officiels.
              </p>
            </div>
          </div>

          {/* Quick Tide & Sea Summary */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-950/30 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Eau de Mer</div>
              <div className="text-lg font-black text-cyan-400">+{selectedSpot.waterTempC}°C</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Marée SHOM</div>
              <div className="text-lg font-black text-indigo-400">Coef. {selectedSpot.tideCoefficient}</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Houle (Hs)</div>
              <div className="text-lg font-black text-emerald-400">{selectedSpot.waveHeightM} m</div>
            </div>
          </div>
        </div>

        {/* Coastal Beach Spot Selector Pills */}
        <div className="mt-6 pt-5 border-t border-slate-700/40">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Sélectionner une station balnéaire / plage officielle :
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BEACH_SPOTS_DATABASE.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedSpotId(b.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedSpotId === b.id
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/25'
                    : isLightMode
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{b.name.split(' - ')[0]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-extrabold bg-cyan-600/30 text-cyan-200">
                  {b.waterTempC}°C
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Spot Detailed Overview & Nautical Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Selected Beach Spot Details (2 cols) */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-700/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {selectedSpot.facade} • {selectedSpot.department}
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">
                  {selectedSpot.name}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Confort Baignade</span>
                <span className="text-2xl font-black text-emerald-400">{selectedSpot.bathingComfortScore}/10</span>
              </div>
            </div>

            {/* Official Bathing Flag Alert */}
            <div className={`mt-5 p-4 rounded-2xl border flex items-start gap-3.5 bg-slate-950/40 ${flagInfo.border}`}>
              <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ${flagInfo.bg} animate-pulse`} />
              <div>
                <div className={`text-xs font-black uppercase tracking-wider ${flagInfo.text}`}>
                  {flagInfo.label}
                </div>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {selectedSpot.flagMeaning}
                </p>
              </div>
            </div>

            {/* Narrative Spot Description */}
            <p className={`text-sm mt-4 leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              {selectedSpot.description}
            </p>

            {/* 4 Essential Oceanic Metrics */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Température Eau</span>
                <span className="text-2xl font-black text-cyan-400 mt-1 block">+{selectedSpot.waterTempC}°C</span>
                <span className="text-[10px] text-slate-500">Air : +{selectedSpot.airTempC}°C</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Hauteur Houle</span>
                <span className="text-2xl font-black text-indigo-400 mt-1 block">{selectedSpot.waveHeightM} m</span>
                <span className="text-[10px] text-slate-500">Période : {selectedSpot.wavePeriodSec}s</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Vent Marin</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{selectedSpot.windSpeedKnots} kts</span>
                <span className="text-[10px] text-slate-500">Raf. {selectedSpot.windGustKnots} kts ({selectedSpot.windDirectionCompass})</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Indice UV Plage</span>
                <span className="text-2xl font-black text-yellow-400 mt-1 block">{selectedSpot.beachUvIndex}</span>
                <span className="text-[10px] text-slate-500">Protection +50 requise</span>
              </div>
            </div>
          </div>

          {/* Bottom Quality and Thermal Breeze Footer */}
          <div className="mt-6 pt-4 border-t border-slate-700/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Qualité des eaux de baignade (ARS / Ministère de la Santé) : <strong className="text-slate-200">{selectedSpot.waterQuality}</strong>
            </span>
            <span className="text-cyan-400 font-bold">
              {selectedSpot.windThermalBreeze}
            </span>
          </div>
        </div>

        {/* Card 2: Marées SHOM & Horaires Officiels (1 col) */}
        <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black tracking-tight">Annuaire des Marées SHOM</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Certifié SHOM
              </span>
            </div>

            <p className={`text-xs mt-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Calcul astronomique du Service Hydrographique et Océanographique de la Marine (SHOM) pour la station de référence.
            </p>

            {/* Coefficient Gauge Display */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                Coefficient de Marée du Jour
              </span>
              <div className="text-4xl font-black text-cyan-400 mt-1">
                {selectedSpot.tideCoefficient}
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                Régime : <span className="text-indigo-300">{selectedSpot.tideType}</span> (Échelle 20 - 120)
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all ${
                    selectedSpot.tideCoefficient >= 90 ? 'bg-red-500' : selectedSpot.tideCoefficient >= 70 ? 'bg-cyan-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, (selectedSpot.tideCoefficient / 120) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                <span>Mortes-Eaux (20)</span>
                <span>Moyenne (70)</span>
                <span>Grandes Marées (120)</span>
              </div>
            </div>

            {/* Tide Times Today */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                  Pleine Mer (Haute Mer)
                </span>
                <span className="text-base font-black text-cyan-400">
                  {selectedSpot.tideHighTime}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4 text-indigo-400" />
                  Basse Mer (Étal)
                </span>
                <span className="text-base font-black text-indigo-400">
                  {selectedSpot.tideLowTime}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Phase en cours
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {selectedSpot.tideStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-purple-400" />
                  État de la Mer (Douglas)
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedSpot.seaStateDouglas}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>Surveillance des courants de jusant et de déferlement recommandée lors des coefficients &gt; 80.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
