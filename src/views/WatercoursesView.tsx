import React, { useState } from 'react';
import { 
  Droplets, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Info, 
  MapPin, 
  ExternalLink,
  ArrowUpRight,
  Radio
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';

interface WatercoursesViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

interface RiverStationData {
  id: string;
  riverName: string;
  stationName: string;
  basin: string;
  department: string;
  vigicruesLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
  vigicruesLabel: string;
  currentHeightM: number;
  currentDischargeM3s: number; // Débit Q en m3/s
  trend: 'UP' | 'STABLE' | 'DOWN';
  trendLabel: string;
  yellowThresholdM: number; // Débordements localisés
  orangeThresholdM: number; // Débordements importants
  historicalFloodRecord: {
    heightM: number;
    year: number;
    name: string;
  };
  tenYearFloodDischargeQ10: number; // Débit crue décennale en m3/s
  hydraulicContext: string;
}

const RIVER_STATIONS_DATABASE: RiverStationData[] = [
  {
    id: 'seine-paris',
    riverName: 'La Seine',
    stationName: 'Paris - Pont d\'Austerlitz',
    basin: 'Bassin Seine-Normandie',
    department: 'Paris (75)',
    vigicruesLevel: 'VERT',
    vigicruesLabel: 'Pas de vigilance particulière (Vert)',
    currentHeightM: 2.15,
    currentDischargeM3s: 310,
    trend: 'STABLE',
    trendLabel: 'Niveau d\'eau stable',
    yellowThresholdM: 3.20,
    orangeThresholdM: 5.50,
    historicalFloodRecord: {
      heightM: 8.62,
      year: 1910,
      name: 'Crue centennale historique de Paris (1910)'
    },
    tenYearFloodDischargeQ10: 1600,
    hydraulicContext: 'Débit régulé en amont par les 4 Grands Lacs de Seine (Pannecière, Orient, Der-Chantecoq, Amance-Temple).'
  },
  {
    id: 'rhone-lyon',
    riverName: 'Le Rhône',
    stationName: 'Lyon - Pont Morand / Perrache',
    basin: 'Bassin Rhône-Méditerranée',
    department: 'Rhône (69)',
    vigicruesLevel: 'VERT',
    vigicruesLabel: 'Pas de vigilance particulière (Vert)',
    currentHeightM: 1.85,
    currentDischargeM3s: 1150,
    trend: 'STABLE',
    trendLabel: 'Écoulement régulier',
    yellowThresholdM: 3.80,
    orangeThresholdM: 5.20,
    historicalFloodRecord: {
      heightM: 7.20,
      year: 2003,
      name: 'Crue majeure du Rhône de décembre 2003'
    },
    tenYearFloodDischargeQ10: 2900,
    hydraulicContext: 'Confluence avec la Saône sous surveillance. Régulation par les barrages CNR (Compagnie Nationale du Rhône).'
  },
  {
    id: 'loire-orleans',
    riverName: 'La Loire',
    stationName: 'Orléans - Pont George V',
    basin: 'Bassin Loire-Bretagne',
    department: 'Loiret (45)',
    vigicruesLevel: 'VERT',
    vigicruesLabel: 'Pas de vigilance particulière (Vert)',
    currentHeightM: 0.95,
    currentDischargeM3s: 240,
    trend: 'DOWN',
    trendLabel: 'Lente décrue',
    yellowThresholdM: 2.60,
    orangeThresholdM: 4.30,
    historicalFloodRecord: {
      heightM: 7.10,
      year: 1856,
      name: 'Grande Crue de la Loire de juin 1856'
    },
    tenYearFloodDischargeQ10: 2100,
    hydraulicContext: 'Fleuve sauvage avec bancs de sable mouvants. Rôle écrêteur du barrage de Villerest en amont.'
  },
  {
    id: 'garonne-toulouse',
    riverName: 'La Garonne',
    stationName: 'Toulouse - Pont-Neuf',
    basin: 'Bassin Adour-Garonne',
    department: 'Haute-Garonne (31)',
    vigicruesLevel: 'JAUNE',
    vigicruesLabel: 'Vigilance Jaune : Risque de crue ou montée rapide des eaux',
    currentHeightM: 2.45,
    currentDischargeM3s: 680,
    trend: 'UP',
    trendLabel: 'Montée des eaux consécutive aux pluies pyrénéennes',
    yellowThresholdM: 2.20,
    orangeThresholdM: 3.50,
    historicalFloodRecord: {
      heightM: 8.32,
      year: 1875,
      name: 'Catastrophe de l\'inondation de Toulouse (1875)'
    },
    tenYearFloodDischargeQ10: 2200,
    hydraulicContext: 'Forte réactivité aux précipitations orographiques sur le bassin versant pyrénéen et aux fontes nivales.'
  },
  {
    id: 'rhin-strasbourg',
    riverName: 'Le Rhin',
    stationName: 'Strasbourg - Kehl / Pont de l\'Europe',
    basin: 'Bassin Rhin-Meuse',
    department: 'Bas-Rhin (67)',
    vigicruesLevel: 'VERT',
    vigicruesLabel: 'Pas de vigilance particulière (Vert)',
    currentHeightM: 3.10,
    currentDischargeM3s: 1450,
    trend: 'STABLE',
    trendLabel: 'Débit soutenu',
    yellowThresholdM: 5.50,
    orangeThresholdM: 7.00,
    historicalFloodRecord: {
      heightM: 8.40,
      year: 1999,
      name: 'Crue de la Pentecôte 1999'
    },
    tenYearFloodDischargeQ10: 3800,
    hydraulicContext: 'Régime nivo-glaciaire alpin. Polders de crue franco-allemands mobilisables en cas d\'alerte majeure.'
  },
  {
    id: 'marne-gournay',
    riverName: 'La Marne',
    stationName: 'Gournay-sur-Marne',
    basin: 'Bassin Seine-Normandie',
    department: 'Seine-Saint-Denis (93)',
    vigicruesLevel: 'VERT',
    vigicruesLabel: 'Pas de vigilance particulière (Vert)',
    currentHeightM: 2.40,
    currentDischargeM3s: 110,
    trend: 'STABLE',
    trendLabel: 'Niveau normal d\'écoulement',
    yellowThresholdM: 3.40,
    orangeThresholdM: 4.80,
    historicalFloodRecord: {
      heightM: 6.25,
      year: 1910,
      name: 'Crue historique de la Marne (1910)'
    },
    tenYearFloodDischargeQ10: 420,
    hydraulicContext: 'Écrêtement par le lac-réservoir du Der (plus grand lac artificiel de France métropolitaine).'
  },
  {
    id: 'durance-cadarache',
    riverName: 'La Durance',
    stationName: 'Cadarache / Confluence Verdon',
    basin: 'Bassin Rhône-Méditerranée',
    department: 'Bouches-du-Rhône (13)',
    vigicruesLevel: 'VERT',
    vigicruesLabel: 'Pas de vigilance particulière (Vert)',
    currentHeightM: 1.15,
    currentDischargeM3s: 95,
    trend: 'DOWN',
    trendLabel: 'Étiage estival',
    yellowThresholdM: 2.80,
    orangeThresholdM: 4.50,
    historicalFloodRecord: {
      heightM: 6.00,
      year: 1994,
      name: 'Crue millénaire de la Durance (1994)'
    },
    tenYearFloodDischargeQ10: 1200,
    hydraulicContext: 'Régulation intégrale par le barrage de Serre-Ponçon et le canal EDF de la Durance.'
  }
];

export const WatercoursesView: React.FC<WatercoursesViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('seine-paris');
  const selectedStation = RIVER_STATIONS_DATABASE.find(r => r.id === selectedStationId) || RIVER_STATIONS_DATABASE[0];

  const getVigicruesBadge = (level: RiverStationData['vigicruesLevel']) => {
    switch (level) {
      case 'VERT':
        return { label: 'Vigilance Verte (Normale)', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'JAUNE':
        return { label: 'Vigilance Jaune (Débordements localisés)', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'ORANGE':
        return { label: 'Vigilance Orange (Crue majeure)', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'ROUGE':
        return { label: 'Vigilance Rouge (Crue exceptionnelle)', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
  };

  const vigicruesBadge = getVigicruesBadge(selectedStation.vigicruesLevel);

  return (
    <div className={`min-h-screen px-4 py-6 md:px-8 space-y-8 animate-fadeIn ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Banner Header */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
        isLightMode 
          ? 'bg-gradient-to-br from-blue-50 via-white to-cyan-50/50 border-blue-200' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Droplets className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Vigicrues & Hub'Eau Officiel
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Réseau Hydrométrique Télétransmis en Direct
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Vigie Cours d'Eau & Vigicrues
              </h1>
              <p className={`text-sm mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Hauteurs d'eau en direct, débits instantanés (m³/s), cotes d'alerte SCHAPI et historique des crues centennales.
              </p>
            </div>
          </div>

          {/* Quick River Stat Summary */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-950/30 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Hauteur d'Eau H</div>
              <div className="text-lg font-black text-blue-400">{selectedStation.currentHeightM.toFixed(2)} m</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Débit Déversé Q</div>
              <div className="text-lg font-black text-cyan-400">{selectedStation.currentDischargeM3s} m³/s</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Tendance 1h</div>
              <div className="text-lg font-black text-emerald-400">
                {selectedStation.trend === 'UP' ? '↗ Hausse' : selectedStation.trend === 'DOWN' ? '↘ Baisse' : '→ Stable'}
              </div>
            </div>
          </div>
        </div>

        {/* River Station Selector Pills */}
        <div className="mt-6 pt-5 border-t border-slate-700/40">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-400" />
            Sélectionner une station hydrométrique officielle (SCHAPI Vigicrues) :
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {RIVER_STATIONS_DATABASE.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedStationId(r.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedStationId === r.id
                    ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                    : isLightMode
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{r.riverName} ({r.stationName.split(' - ')[0]})</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  r.vigicruesLevel === 'ROUGE' ? 'bg-red-600 text-white' : r.vigicruesLevel === 'ORANGE' ? 'bg-amber-600 text-white' : r.vigicruesLevel === 'JAUNE' ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                  {r.currentHeightM.toFixed(2)}m
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Station Hydraulic Overview & Flood Thresholds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Selected River Station Dashboard (2 cols) */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-700/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {selectedStation.basin} • {selectedStation.department}
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">
                  {selectedStation.riverName} à {selectedStation.stationName}
                </h2>
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-center font-black ${vigicruesBadge.bg}`}>
                <div className="text-[10px] uppercase tracking-wider">Statut Vigicrues</div>
                <div className="text-sm sm:text-base">{selectedStation.vigicruesLabel.split(' : ')[0]}</div>
              </div>
            </div>

            {/* Hydraulic Context */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Bassin Versant & Fonctionnement Hydrologique
                  </div>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {selectedStation.hydraulicContext}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Measurements Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Hauteur Actuelle</span>
                <span className="text-2xl font-black text-blue-400 mt-1 block">{selectedStation.currentHeightM.toFixed(2)} m</span>
                <span className="text-[10px] text-slate-500">Échelle limnimétrique</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Débit Instantané</span>
                <span className="text-2xl font-black text-cyan-400 mt-1 block">{selectedStation.currentDischargeM3s} m³/s</span>
                <span className="text-[10px] text-slate-500">Flux volumique Q</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Seuil Jaune</span>
                <span className="text-2xl font-black text-yellow-400 mt-1 block">{selectedStation.yellowThresholdM.toFixed(2)} m</span>
                <span className="text-[10px] text-slate-500">Débordements locaux</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Seuil Orange</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{selectedStation.orangeThresholdM.toFixed(2)} m</span>
                <span className="text-[10px] text-slate-500">Crue dommageable</span>
              </div>
            </div>

            {/* Height Progress Bar Comparison */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">Position par rapport aux seuils de débordement :</span>
                <span className="text-blue-400 font-black">{selectedStation.currentHeightM.toFixed(2)} m / Seuil max {selectedStation.orangeThresholdM.toFixed(2)} m</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all ${
                    selectedStation.currentHeightM >= selectedStation.orangeThresholdM 
                      ? 'bg-amber-500' 
                      : selectedStation.currentHeightM >= selectedStation.yellowThresholdM 
                        ? 'bg-yellow-400' 
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (selectedStation.currentHeightM / selectedStation.orangeThresholdM) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1.5">
                <span>Étiage (0m)</span>
                <span className="text-yellow-400">Seuil Jaune ({selectedStation.yellowThresholdM}m)</span>
                <span className="text-amber-400">Seuil Orange ({selectedStation.orangeThresholdM}m)</span>
              </div>
            </div>
          </div>

          {/* Bottom Historical Benchmark */}
          <div className="mt-6 pt-4 border-t border-slate-700/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Crue historique de référence : <strong className="text-white">{selectedStation.historicalFloodRecord.name}</strong> ({selectedStation.historicalFloodRecord.heightM} m)
            </span>
            <span className="text-cyan-400 font-bold">
              Débit Q10 (décennal) : {selectedStation.tenYearFloodDischargeQ10} m³/s
            </span>
          </div>
        </div>

        {/* Card 2: Vigicrues Official Direct Feed (1 col) */}
        <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black tracking-tight">Services de Prévision des Crues</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                SCHAPI
              </span>
            </div>

            <p className={`text-xs mt-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Bulletins émis 2 fois par jour (06h et 16h) par les SPC régionaux et le Service Central d'Hydrométéorologie et d'Appui à la Prévision des Inondations.
            </p>

            {/* Official Vigicrues Color Levels Key */}
            <div className="mt-5 space-y-2.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Niveau Vert
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Pas de vigilance requise. Risque de crue ou de montée rapide des eaux n'entraînant pas de dommages significatifs.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs">
                <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  Niveau Jaune
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Risque de crue génératrice de débordements et de dommages localisés, nécessitant une vigilance particulière notamment pour les activités exposées.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Niveau Orange
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Risque de crue génératrice de débordements importants susceptibles d'avoir un impact significatif sur la sécurité des personnes et des biens.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Niveau Rouge
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Risque de crue majeure avec menace directe et généralisée sur la sécurité des personnes et des biens.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-400" />
            <span>Données issues du référentiel hydrologique national SANDRE et de l'API publique Hub'Eau Hydrométrie.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
