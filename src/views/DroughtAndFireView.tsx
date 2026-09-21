import React, { useState } from 'react';
import { 
  Flame, 
  Droplets, 
  ShieldAlert, 
  AlertTriangle, 
  Wind, 
  Sun, 
  Gauge, 
  Layers, 
  CheckCircle2, 
  Info, 
  Activity, 
  MapPin, 
  FileText,
  Clock,
  Radio
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';

interface DroughtAndFireViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

interface DepartmentDroughtFireData {
  dptCode: string;
  dptName: string;
  region: string;
  forestFireDangerLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
  forestFireDangerLabel: 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
  fwiScore: number; // Fire Weather Index (0 à 60+)
  ffmc: number; // Fine Fuel Moisture Code (0-101)
  isi: number; // Initial Spread Index
  bui: number; // Build-Up Index
  vigiEauLevel: 'VIGILANCE' | 'ALERTE' | 'ALERTE_RENFORCEE' | 'CRISE';
  vigiEauLabel: string;
  vigiEauColor: string;
  soilWetnessIndexSwi: number; // 0.00 à 1.00 (normale ~0.50-0.70)
  soilMoistureStatus: string;
  rainfallDeficit30DaysPct: number; // e.g. -45%
  prohibitedUsages: string[];
  authorizedUsagesWithRestrictions: string[];
  activeFiresCount: number;
}

const DEPARTMENTS_DATABASE: DepartmentDroughtFireData[] = [
  {
    dptCode: '13',
    dptName: 'Bouches-du-Rhône',
    region: 'Provence-Alpes-Côte d\'Azur',
    forestFireDangerLevel: 'ORANGE',
    forestFireDangerLabel: 'Élevé',
    fwiScore: 38,
    ffmc: 91.5,
    isi: 14.2,
    bui: 62.0,
    vigiEauLevel: 'ALERTE_RENFORCEE',
    vigiEauLabel: 'Alerte Renforcée (Arrêté Préfectoral)',
    vigiEauColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    soilWetnessIndexSwi: 0.22,
    soilMoistureStatus: 'Sécheresse des sols sévère à très sévère',
    rainfallDeficit30DaysPct: -68,
    prohibitedUsages: [
      'Arrosage des pelouses, massifs fleuris et espaces verts',
      'Remplissage et vidange des piscines privées de plus de 1 m³',
      'Lavage des véhicules à titre privé à domicile',
      'Nettoyage des façades, toitures et terrasses'
    ],
    authorizedUsagesWithRestrictions: [
      'Arrosage des potagers autorisé uniquement entre 20h00 et 09h00',
      'Arrosage des arbres et arbustes plantés depuis moins de 2 ans autorisé la nuit',
      'Lavage en station professionnelle avec système de recyclage d\'eau'
    ],
    activeFiresCount: 1
  },
  {
    dptCode: '83',
    dptName: 'Var',
    region: 'Provence-Alpes-Côte d\'Azur',
    forestFireDangerLevel: 'ORANGE',
    forestFireDangerLabel: 'Élevé',
    fwiScore: 42,
    ffmc: 93.0,
    isi: 16.5,
    bui: 68.0,
    vigiEauLevel: 'ALERTE_RENFORCEE',
    vigiEauLabel: 'Alerte Renforcée',
    vigiEauColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    soilWetnessIndexSwi: 0.18,
    soilMoistureStatus: 'Stress hydrique profond et déficit historique',
    rainfallDeficit30DaysPct: -72,
    prohibitedUsages: [
      'Arrosage des pelouses et espaces verts de jour comme de nuit',
      'Remplissage complet des piscines privées',
      'Lavage des voitures chez les particuliers',
      'Alimentation des fontaines publiques en circuit ouvert'
    ],
    authorizedUsagesWithRestrictions: [
      'Arrosage des potagers vivriers de 20h00 à 08h00',
      'Usage de l\'eau réservé aux besoins vitaux et à l\'abreuvement des animaux'
    ],
    activeFiresCount: 2
  },
  {
    dptCode: '66',
    dptName: 'Pyrénées-Orientales',
    region: 'Occitanie',
    forestFireDangerLevel: 'ROUGE',
    forestFireDangerLabel: 'Très Élevé',
    fwiScore: 54,
    ffmc: 95.2,
    isi: 22.0,
    bui: 85.0,
    vigiEauLevel: 'CRISE',
    vigiEauLabel: 'Crise Majeure (Niveau Maximum VigiEau)',
    vigiEauColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    soilWetnessIndexSwi: 0.08,
    soilMoistureStatus: 'Sécheresse record pluriannuelle depuis 1959',
    rainfallDeficit30DaysPct: -85,
    prohibitedUsages: [
      'Arrosage des potagers strictement interdit',
      'Arrosage de tous les espaces verts, ronds-points et terrains de sport',
      'Tout remplissage de piscine, jacuzzi ou spa',
      'Nettoyage de toutes voiries et façades à l\'eau'
    ],
    authorizedUsagesWithRestrictions: [
      'Eau potable strictement réservée à l\'alimentation humaine, santé, sécurité civile et bétail'
    ],
    activeFiresCount: 1
  },
  {
    dptCode: '33',
    dptName: 'Gironde',
    region: 'Nouvelle-Aquitaine',
    forestFireDangerLevel: 'JAUNE',
    forestFireDangerLabel: 'Modéré',
    fwiScore: 24,
    ffmc: 86.0,
    isi: 7.5,
    bui: 42.0,
    vigiEauLevel: 'ALERTE',
    vigiEauLabel: 'Alerte',
    vigiEauColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    soilWetnessIndexSwi: 0.35,
    soilMoistureStatus: 'Déficit hydrique modéré sur massif forestier des Landes',
    rainfallDeficit30DaysPct: -35,
    prohibitedUsages: [
      'Arrosage des pelouses et massifs entre 09h00 et 20h00',
      'Lavage de véhicules à domicile',
      'Remplissage des piscines privées (hors première mise en eau chantier)'
    ],
    authorizedUsagesWithRestrictions: [
      'Arrosage potager autorisé en soirée (20h00 - 09h00)'
    ],
    activeFiresCount: 0
  },
  {
    dptCode: '75',
    dptName: 'Paris & Île-de-France',
    region: 'Île-de-France',
    forestFireDangerLevel: 'VERT',
    forestFireDangerLabel: 'Faible',
    fwiScore: 12,
    ffmc: 78.0,
    isi: 3.2,
    bui: 25.0,
    vigiEauLevel: 'VIGILANCE',
    vigiEauLabel: 'Vigilance (Sensibilisation)',
    vigiEauColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    soilWetnessIndexSwi: 0.58,
    soilMoistureStatus: 'Humidité des sols proche des normales saisonnières',
    rainfallDeficit30DaysPct: -10,
    prohibitedUsages: [
      'Aucune interdiction obligatoire : incitation forte à la sobriété hydrique'
    ],
    authorizedUsagesWithRestrictions: [
      'Éviter de laisser couler l\'eau inutilement et optimiser les arrosages'
    ],
    activeFiresCount: 0
  },
  {
    dptCode: '69',
    dptName: 'Rhône & Métropole de Lyon',
    region: 'Auvergne-Rhône-Alpes',
    forestFireDangerLevel: 'JAUNE',
    forestFireDangerLabel: 'Modéré',
    fwiScore: 26,
    ffmc: 87.5,
    isi: 8.8,
    bui: 45.0,
    vigiEauLevel: 'ALERTE',
    vigiEauLabel: 'Alerte',
    vigiEauColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    soilWetnessIndexSwi: 0.32,
    soilMoistureStatus: 'Assèchement superficiel sous l\'effet du vent du Sud',
    rainfallDeficit30DaysPct: -42,
    prohibitedUsages: [
      'Arrosage des pelouses et massifs fleuris entre 10h00 et 18h00',
      'Lavage des voitures à domicile',
      'Vidange et remplissage de piscines privées'
    ],
    authorizedUsagesWithRestrictions: [
      'Arrosage des jardins potagers autorisé de 18h00 à 10h00'
    ],
    activeFiresCount: 0
  },
  {
    dptCode: '2A',
    dptName: 'Corse-du-Sud',
    region: 'Corse',
    forestFireDangerLevel: 'ORANGE',
    forestFireDangerLabel: 'Élevé',
    fwiScore: 40,
    ffmc: 92.8,
    isi: 15.0,
    bui: 65.0,
    vigiEauLevel: 'ALERTE_RENFORCEE',
    vigiEauLabel: 'Alerte Renforcée',
    vigiEauColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    soilWetnessIndexSwi: 0.20,
    soilMoistureStatus: 'Végétation méditerranéenne en stress hydrique sévère',
    rainfallDeficit30DaysPct: -65,
    prohibitedUsages: [
      'Tout brûlage de végétaux et feux de camp strictement prohibé',
      'Arrosage des pelouses et espaces paysagers',
      'Remplissage des piscines privées'
    ],
    authorizedUsagesWithRestrictions: [
      'Arrosage maraîcher nocturne'
    ],
    activeFiresCount: 1
  }
];

export const DroughtAndFireView: React.FC<DroughtAndFireViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const [selectedDptCode, setSelectedDptCode] = useState<string>('13');
  const selectedDpt = DEPARTMENTS_DATABASE.find(d => d.dptCode === selectedDptCode) || DEPARTMENTS_DATABASE[0];

  const getForestFireBadge = (level: DepartmentDroughtFireData['forestFireDangerLevel']) => {
    switch (level) {
      case 'VERT':
        return { label: 'Danger Faible (Vert)', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'JAUNE':
        return { label: 'Danger Modéré (Jaune)', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'ORANGE':
        return { label: 'Danger Élevé (Orange)', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'ROUGE':
        return { label: 'Danger Très Élevé / Extrême (Rouge)', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
  };

  const fireInfo = getForestFireBadge(selectedDpt.forestFireDangerLevel);

  return (
    <div className={`min-h-screen px-4 py-6 md:px-8 space-y-8 animate-fadeIn ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Banner Header */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
        isLightMode 
          ? 'bg-gradient-to-br from-amber-50 via-white to-red-50/50 border-amber-200' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Météo des Forêts & VigiEau Officiel
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Arrêtés Préfectoraux & Satellite FIRMS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Vigilance Sécheresse & Incendie
              </h1>
              <p className={`text-sm mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Météo des forêts Météo-France, Indice Forêt Météo (IFM/FWI), sécheresse des sols SWI et restrictions d'eau VigiEau.
              </p>
            </div>
          </div>

          {/* Quick Summary Metrics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-950/30 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Indice IFM / FWI</div>
              <div className="text-lg font-black text-amber-400">{selectedDpt.fwiScore} / 60+</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Humidité Sols (SWI)</div>
              <div className="text-lg font-black text-indigo-400">{(selectedDpt.soilWetnessIndexSwi * 100).toFixed(0)}%</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Déficit Pluvio (30j)</div>
              <div className="text-lg font-black text-red-400">{selectedDpt.rainfallDeficit30DaysPct}%</div>
            </div>
          </div>
        </div>

        {/* Department Selector Pills */}
        <div className="mt-6 pt-5 border-t border-slate-700/40">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            Sélectionner un département sous surveillance :
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DEPARTMENTS_DATABASE.map(d => (
              <button
                key={d.dptCode}
                onClick={() => setSelectedDptCode(d.dptCode)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedDptCode === d.dptCode
                    ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/25'
                    : isLightMode
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{d.dptCode} - {d.dptName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  d.forestFireDangerLevel === 'ROUGE' ? 'bg-red-600 text-white' : d.forestFireDangerLevel === 'ORANGE' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {d.forestFireDangerLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 2 Major Modules (Météo des Forêts & VigiEau) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Météo-France Météo des Forêts & IFM / FWI */}
        <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Système d'Alerte Feu de Forêt de l'État & Météo-France
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">
                  Météo des Forêts : {selectedDpt.dptName} ({selectedDpt.dptCode})
                </h2>
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-center font-black ${fireInfo.bg}`}>
                <div className="text-[10px] uppercase tracking-wider">Niveau Météo-France</div>
                <div className="text-lg">{selectedDpt.forestFireDangerLabel}</div>
              </div>
            </div>

            {/* Fire Risk Context & Advice */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Consignes & Contexte Feux de Forêt
                  </div>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Le danger est <strong>{selectedDpt.forestFireDangerLabel.toLowerCase()}</strong> en raison de la siccité des végétaux et de la vitesse du vent. 9 feux de forêt sur 10 sont d'origine humaine : respectez scrupuleusement l'interdiction de tout feu de végétation et ne jetez aucun mégot.
                  </p>
                </div>
              </div>
            </div>

            {/* IFM Detailed Sub-Indices */}
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-400" />
                Décomposition Physique de l'Indice Forêt Météo (IFM / CFFDRS) :
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Combustible Fin (FFMC)</span>
                  <span className="text-2xl font-black text-amber-400 mt-0.5 block">{selectedDpt.ffmc}</span>
                  <span className="text-[10px] text-slate-500">Litière inflammable</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Vitesse Propagation (ISI)</span>
                  <span className="text-2xl font-black text-red-400 mt-0.5 block">{selectedDpt.isi}</span>
                  <span className="text-[10px] text-slate-500">Effet vent & relief</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Combustible Total (BUI)</span>
                  <span className="text-2xl font-black text-indigo-400 mt-0.5 block">{selectedDpt.bui}</span>
                  <span className="text-[10px] text-slate-500">Humus & sous-bois</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Satellite Detections */}
          <div className="mt-6 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              Points thermiques satellites NASA FIRMS actifs dans le secteur :
            </span>
            <span className={`font-black px-2.5 py-1 rounded-full border ${
              selectedDpt.activeFiresCount > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {selectedDpt.activeFiresCount} foyer(s) sous surveillance
            </span>
          </div>
        </div>

        {/* Module 2: VigiEau - Arrêtés Préfectoraux & Restrictions d'Eau */}
        <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Ministère de la Transition Écologique • Plateforme VigiEau
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">
                  Restrictions d'Usage de l'Eau
                </h2>
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-center font-black ${selectedDpt.vigiEauColor}`}>
                <div className="text-[10px] uppercase tracking-wider">Seuil Réglementaire</div>
                <div className="text-sm sm:text-base">{selectedDpt.vigiEauLabel}</div>
              </div>
            </div>

            {/* Soil Wetness Diagnosis */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Diagnostic de l'Humidité des Sols (SWI Météo-France) :
              </div>
              <div className="text-base font-black text-cyan-300">
                {selectedDpt.soilMoistureStatus} (Indice SWI : {selectedDpt.soilWetnessIndexSwi})
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Déficit pluviométrique cumulé sur 30 jours : <strong className="text-red-400">{selectedDpt.rainfallDeficit30DaysPct}%</strong> par rapport aux normales 1991-2020.
              </div>
            </div>

            {/* Prohibited Usages List */}
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Usages formellement INTERDITS par arrêté préfectoral en vigueur :
              </div>
              <div className="space-y-1.5">
                {selectedDpt.prohibitedUsages.map((usage, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span>{usage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Permitted with Restrictions */}
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Usages autorisés avec restrictions d'horaires :
              </div>
              <div className="space-y-1.5">
                {selectedDpt.authorizedUsagesWithRestrictions.map((usage, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{usage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/40 text-xs text-slate-400 flex items-center justify-between">
            <span>En cas de non-respect : amende de 5e classe jusqu'à <strong>1 500 €</strong> (OFB / Police de l'Eau).</span>
            <span className="text-cyan-400 font-bold">Source : vigieau.gouv.fr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
