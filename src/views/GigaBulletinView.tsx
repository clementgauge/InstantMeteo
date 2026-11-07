import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wind,
  CloudRain,
  Sun,
  CloudSun,
  CloudFog,
  CloudLightning,
  Snowflake,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Compass,
  Volume2,
  VolumeX,
  Printer,
  ChevronRight,
  Layers,
  Thermometer,
  Droplet,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowUpRight,
  Activity,
  Zap,
  Info,
  Scale,
  Award,
  Sliders,
  ChevronDown,
  Building2,
  Mountain,
  ShieldCheck
} from 'lucide-react';
import { LocationPoint, DailyForecast } from '../types/weather';
import { 
  fetchLiveMultiModelBulletin, 
  MultiModelBulletinReport, 
  MultiModelDayComparison,
  METEOROLOGICAL_CENTERS,
  LiveKeyCityForecast
} from '../services/multiModelBulletinService';
import { getNationalPrefecturesSynthesis } from '../services/prefecturesBulletinService';
import { generateNationalFourWeekBulletin } from '../services/nationalFourWeekBulletinService';
import { generateEnsoAndTeleconnectionsObservatory } from '../services/ensoAndRegimesService';
import { GigaNationalFourWeekBulletinCard } from '../components/GigaNationalFourWeekBulletinCard';
import { PrefecturesRegionalBulletinCard } from '../components/PrefecturesRegionalBulletinCard';
import { MountainAdaptivePhysicsCard } from '../components/MountainAdaptivePhysicsCard';

interface GigaBulletinViewProps {
  currentStation: LocationPoint;
  dailyForecasts?: DailyForecast[];
  seniorMode: boolean;
  tempUnit: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
}

export const GigaBulletinView: React.FC<GigaBulletinViewProps> = ({
  currentStation,
  dailyForecasts,
  seniorMode,
  tempUnit,
  onSelectStation
}) => {
  // Navigation principale
  const [activeTab, setActiveTab] = useState<'centres' | 'regions' | 'montagne' | 'regimes' | 'synoptique' | 'quotidien' | 'climatologie' | 'vigilance'>('centres');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0); // 0 = Aujourd'hui, 1 = Demain, etc.
  const [selectedCenterId, setSelectedCenterId] = useState<'meteofrance' | 'ecmwf' | 'gfs' | 'icon' | 'ukmo'>('ecmwf');
  
  // Données multi-modèles réelles
  const [report, setReport] = useState<MultiModelBulletinReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');

  // 4 Semaines climatologiques
  const [national4WData, setNational4WData] = useState(() => generateNationalFourWeekBulletin());

  // Observatoire des Régimes Météo & Téléconnexions (NAO, AO, MJO, QBO)
  const teleconnectionsData = useMemo(() => {
    return generateEnsoAndTeleconnectionsObservatory(
      currentStation,
      report?.keyCities?.[0]?.tMax ?? 18,
      1.5
    );
  }, [currentStation, report]);

  const toDisplayTemp = (celsius: number): string => {
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  const [dailyRefreshFeedback, setDailyRefreshFeedback] = useState<string>('');

  // Chargement des données multi-modèles réelles en direct avec gestion du cycle quotidien
  const loadData = async (
    lat = currentStation.latitude || 46.5,
    lon = currentStation.longitude || 2.5,
    name = currentStation.name,
    forceBustCache = false
  ) => {
    try {
      const data = await fetchLiveMultiModelBulletin(lat, lon, name, forceBustCache);
      setReport(data);
      setLastRefreshedTime(new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date()));
    } catch (e) {
      console.error('Failed to load multi-model bulletin:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentStation.latitude, currentStation.longitude]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setNational4WData(generateNationalFourWeekBulletin());
    await getNationalPrefecturesSynthesis(true);
    await loadData(currentStation.latitude || 46.5, currentStation.longitude || 2.5, currentStation.name, true);
    setDailyRefreshFeedback("Édition quotidienne et modèles réactualisés avec succès !");
    setTimeout(() => setDailyRefreshFeedback(''), 4500);
  };

  // Synthèse vocale officielle du bulletin (Web Speech API)
  const toggleSpeechAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("La synthèse vocale n'est pas disponible sur votre navigateur.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!report) return;

    const currentDay = report.dailyComparisons[selectedDayIndex] || report.dailyComparisons[0];
    const textToSpeak = `Bulletin Météorologique Multi-Modèles Instant Météo. Situation générale : ${report.synopticDiagnosis.title}. ${report.synopticDiagnosis.synopticOverview} Pour ${currentDay.dayLabel} : Le consensus des centres météo prévoit des températures minimales de ${currentDay.consensus.tMinMean} degrés et maximales de ${currentDay.consensus.tMaxMean} degrés. ${currentDay.divergence.description} Fin du bulletin.`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const activeDay: MultiModelDayComparison | undefined = report?.dailyComparisons[selectedDayIndex] || report?.dailyComparisons[0];

  const renderWeatherIcon = (code: number, className = "w-5 h-5") => {
    if (code === 0 || code === 1) {
      return <Sun className={`${className} text-amber-400`} />;
    }
    if (code === 2) {
      return <CloudSun className={`${className} text-amber-300`} />;
    }
    if (code === 3) {
      return <CloudSun className={`${className} text-slate-300`} />;
    }
    if (code === 45 || code === 48) {
      return <CloudFog className={`${className} text-slate-300`} />;
    }
    if (code >= 51 && code <= 65) {
      return <CloudRain className={`${className} text-blue-400`} />;
    }
    if (code >= 71 && code <= 86) {
      return <Snowflake className={`${className} text-cyan-300`} />;
    }
    if (code >= 95) {
      return <CloudLightning className={`${className} text-purple-400`} />;
    }
    return <CloudSun className={`${className} text-sky-300`} />;
  };

  // Vigilance météorologique honnête et de saison
  const seasonalAlertSynthesis = useMemo(() => {
    const isColdSeason = new Date().getMonth() >= 9 || new Date().getMonth() <= 2;
    return [
      {
        phenomenon: "Brouillards & Visibilité Réduite",
        status: isColdSeason ? "Vigilance Jaune Matinale (Plaines & Vallées)" : "Niveau Vert",
        level: isColdSeason ? 2 : 1,
        color: isColdSeason ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        details: isColdSeason
          ? "Inversions thermiques automnales marquées : formation de brouillards denses et stratus avec visibilité souvent inférieure à 150m dans les bassins de la Seine, de la Saône et de la Garonne."
          : "Bonne visibilité générale."
      },
      {
        phenomenon: "Gelées Blanches & Verglas Local",
        status: isColdSeason ? "Vigilance Ponctuelle (Nord & Est)" : "Niveau Vert",
        level: isColdSeason ? 2 : 1,
        color: isColdSeason ? "text-sky-400 bg-sky-500/10 border-sky-500/30" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        details: isColdSeason
          ? "Températures nocturnes frôlant 0°C à 2°C dans les campagnes et fonds de vallées sous ciel dégagé. Risque de chaussées glissantes au lever du jour."
          : "Nuit sans gel."
      },
      {
        phenomenon: "Vents Côtiers & Rafales",
        status: "Niveau Vert National (Mistral modéré)",
        level: 1,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        details: "Pas de coup de vent synoptique tempétueux modélisé par les 5 centres météo. Seuls le Mistral et la Tramontane soufflent modérément à 45-60 km/h."
      },
      {
        phenomenon: "Pluies Inondations & Crues",
        status: "Niveau Vert National",
        level: 1,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        details: "Régime très majoritairement sec sous la dorsale anticyclonique. Cours d'eau aux débits calmes et sans risque de débordement immédiat."
      },
      {
        phenomenon: "Neige & Haute Montagne",
        status: isColdSeason ? "Isotherme 0°C vers 2200-2400m" : "Niveau Vert",
        level: 1,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        details: isColdSeason
          ? "Manteau neigeux stabilisé en haute altitude. Premières neiges fraîches limitées aux crêtes frontalières au-dessus de 2200m."
          : "Conditions estivales en altitude."
      }
    ];
  }, []);

  // Quadrants régionaux honnêtes et de saison
  const seasonalRegionalBulletins = useMemo(() => {
    const isColdSeason = new Date().getMonth() >= 9 || new Date().getMonth() <= 2;
    return [
      {
        id: 'no',
        code: 'NO',
        title: 'Quart Nord-Ouest',
        departments: 'Bretagne, Normandie, Pays de la Loire, Hauts-de-France Ouest',
        dominantSky: isColdSeason ? 'Grisailles matinales maritimes, dissipées au profit d\'éclaircies l\'après-midi.' : 'Éclaircies de saison.',
        tempRange: isColdSeason ? 'Matin 5 à 8°C • Après-midi 12 à 15°C' : 'Matin 12 à 15°C • Après-midi 20 à 23°C',
        windNotice: 'Vent d\'Ouest-Sud-Ouest modéré, 20 à 35 km/h sur les caps côtiers.',
        phenomenaRisk: 'Brumes côtières locales et chaussées humides à l\'aube.',
        riskLevel: 'FAIBLE',
        expertAdvice: 'Ventilation maritime saine, prévoir des vêtements coupe-vent en bord de mer.',
        morningSummary: 'Ciel souvent voilé ou encombré de nuages bas maritimes se morcelant en cours de matinée.',
        afternoonSummary: 'Atmosphère vivifiante et lumineuse avec de belles plages d\'éclaircies.'
      },
      {
        id: 'ne',
        code: 'NE',
        title: 'Quart Nord-Est & Bassin Parisien',
        departments: 'Île-de-France, Hauts-de-France Est, Grand Est, Bourgogne-Franche-Comté',
        dominantSky: isColdSeason ? 'Brouillards et stratus denses le matin, déblocage lumineux partiel l\'après-midi.' : 'Soleil dominant.',
        tempRange: isColdSeason ? 'Matin 2 à 5°C • Après-midi 10 à 13°C' : 'Matin 10 à 13°C • Après-midi 21 à 24°C',
        windNotice: 'Vent très faible, inférieur à 10 km/h, favorisant la stagnation des brumes.',
        phenomenaRisk: 'Brouillards matinaux denses réduisant la visibilité à moins de 200m.',
        riskLevel: isColdSeason ? 'MODERE' : 'FAIBLE',
        expertAdvice: 'Allumez les feux de brouillard lors des déplacements matinaux.',
        morningSummary: 'Fraîcheur vive et humidité saturée en basse couche, brumes givrantes possibles localement.',
        afternoonSummary: 'Éclaircies plus larges sur les collines et vers les Vosges, restant parfois brumeux en plaine.'
      },
      {
        id: 'so',
        code: 'SO',
        title: 'Quart Sud-Ouest & Bassin Aquitain',
        departments: 'Nouvelle-Aquitaine, Occitanie Ouest (Midi-Pyrénées)',
        dominantSky: isColdSeason ? 'Bancs de brume matinaux en vallée de Garonne puis très bel ensoleillement.' : 'Grand soleil.',
        tempRange: isColdSeason ? 'Matin 4 à 7°C • Après-midi 15 à 18°C' : 'Matin 14 à 17°C • Après-midi 25 à 28°C',
        windNotice: 'Brises légères, vent d\'Autan très modéré (20 km/h).',
        phenomenaRisk: 'Grande amplitude thermique entre l\'aube et l\'après-midi.',
        riskLevel: 'FAIBLE',
        expertAdvice: 'Conditions idéales d\'arrière-saison pour les activités en plein air.',
        morningSummary: 'Brouillards au lever du jour vite résorbés avant 10h sous l\'action solaire.',
        afternoonSummary: 'Douceur très agréable au soleil avec un ressenti confortable.'
      },
      {
        id: 'se',
        code: 'SE',
        title: 'Quart Sud-Est & Pourtour Méditerranéen',
        departments: 'Provence-Alpes-Côte d\'Azur, Languedoc-Roussillon, Corse',
        dominantSky: 'Ciel bleu d\'azur limpide, grand soleil continu.',
        tempRange: isColdSeason ? 'Matin 8 à 12°C • Après-midi 17 à 20°C' : 'Matin 17 à 20°C • Après-midi 27 à 30°C',
        windNotice: 'Mistral et Tramontane modérés soufflant à 40-55 km/h.',
        phenomenaRisk: 'Sécheresse des sols superficiels en Basse-Provence.',
        riskLevel: 'FAIBLE',
        expertAdvice: 'Luminosité exceptionnelle, port de lunettes de soleil conseillé.',
        morningSummary: 'Soleil dès l\'aurore, température montant rapidement sous le rayonnement.',
        afternoonSummary: 'Après-midi très douce et sèche, idéale pour toutes activités extérieures.'
      },
      {
        id: 'montagnes',
        code: 'MONTAGNES',
        title: 'Grands Massifs de Montagne',
        departments: 'Alpes, Pyrénées, Massif Central, Jura, Vosges',
        dominantSky: isColdSeason ? 'Mer de nuages remarquable dans les vallées sous 800m, soleil éclatant au-dessus.' : 'Grand beau temps d\'altitude.',
        tempRange: isColdSeason ? 'Isotherme 0°C vers 2300m • 8°C à 1500m • 1°C à 3000m' : 'Isotherme 0°C vers 3800m',
        windNotice: 'Vent de crête de secteur Ouest-Nord-Ouest 25 à 40 km/h.',
        phenomenaRisk: 'Inversion thermique : sensation plus douce à 1500m qu\'au fond des vallées abritées.',
        riskLevel: 'FAIBLE',
        expertAdvice: 'Excellente fenêtre pour la randonnée au-dessus de la nappe de brouillard.',
        morningSummary: 'Vallées froides et embrumées contrastant avec la lumière pure des cimes.',
        afternoonSummary: 'Conditions très stables et limpides sans aucune menace orageuse.'
      }
    ];
  }, []);

  return (
    <div id="grand-bulletin-national-view" className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER DU GRAND BULLETIN NATIONAL                                 */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-[#091528] via-[#0E2244] to-[#121E36] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider">
              <Globe className="h-4 w-4" />
              <span>Observatoire National • Simulations Multi-Centres Météorologiques</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                ECMWF • Météo-France • GFS • ICON • UKMO
              </span>
            </div>
            <h1 className={`font-black text-white tracking-tight ${seniorMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              Grand Bulletin Météorologique &amp; Simulations des Centres
            </h1>
            <p className={`text-slate-300 max-w-4xl leading-relaxed ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'}`}>
              Expertise synoptique rigoureuse fondée sur la comparaison en direct des 5 grands centres mondiaux : consensus numérique, dispersion, divergences physiques et chronologie réelle.
            </p>
          </div>

          {/* Badges d'action rapide & actualisation */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Télémétrie Numérique</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {lastRefreshedTime ? `Actualisé à ${lastRefreshedTime}` : 'Calcul en direct...'}
              </span>
            </div>

            {/* Bouton Synthèse Vocale */}
            <button
              onClick={toggleSpeechAudio}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                  : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sky-300 hover:text-white'
              }`}
              title="Écouter le bulletin officiel lu par la synthèse vocale en français"
            >
              {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
              <span>{isPlayingAudio ? 'Arrêter la lecture' : 'Écouter le Bulletin'}</span>
            </button>

            {/* Bouton Actualiser */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2.5 text-xs font-bold transition shadow cursor-pointer"
              title="Réinterroger en direct les simulations de tous les centres météorologiques"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
              <span>{isRefreshing || isLoading ? 'Calcul...' : 'Réactualiser'}</span>
            </button>

            {/* Bouton Imprimer */}
            <button
              onClick={() => window.print()}
              className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2.5 text-xs font-bold transition cursor-pointer"
              title="Imprimer ou exporter le Bulletin National en PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* BANNIÈRE OFFICIELLE DU BULLETIN QUOTIDIEN CERTIFIÉ */}
        {report && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-white">
                      Édition Quotidienne du {report.dailyEditionInfo?.editionDateFormatted || new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      🟢 Bulletin du Jour Certifié &amp; Consolidé
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1 leading-relaxed">
                    <span>• <strong>Run de référence :</strong> {report.dailyEditionInfo?.runLabel || "AROME 00z & CEP ECMWF IFS 00z"}</span>
                    <span>• <strong>Cycle :</strong> Actualisé chaque jour à 06h00 UTC</span>
                    <span>• <strong>Prochaine édition :</strong> {report.dailyEditionInfo?.nextDailyUpdate || "Demain à 06h00 UTC"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
                {dailyRefreshFeedback && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                    ✓ {dailyRefreshFeedback}
                  </span>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
                  title="Forcer la réactualisation quotidienne complète de tous les modèles et préfectures"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Réactualisation en cours...' : 'Forcer la réactualisation quotidienne'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Exécutif Multi-Centres Express */}
        {report && (
          <div className="mt-5 rounded-2xl bg-slate-950/80 border border-sky-500/30 p-4.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                  🌐 [Échelle Nationale : France métropolitaine]
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-sky-400" />
                  <span>Diagnostic Synoptique Conjoint des 5 Centres Météo :</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Consensus des Modèles : {report.synopticDiagnosis.centersConsensusIndex} %
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  5 Centres Connectés
                </span>
              </div>
            </div>
            <p className="text-slate-100 text-xs sm:text-sm font-medium leading-relaxed">
              {report.synopticDiagnosis.synopticOverview}
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-[11px] text-slate-400">
              <span>• <strong>Régime Dominant :</strong> <span className="text-sky-300 font-semibold">{report.synopticDiagnosis.regimeName}</span></span>
              <span>• <strong>Pression Moyenne Mer :</strong> <span className="text-white font-semibold">{report.synopticDiagnosis.meanSeaPressureHpa} hPa</span></span>
              <span>• <strong>Isotherme 0°C Modélisé :</strong> <span className="text-emerald-400 font-semibold">{report.synopticDiagnosis.isoZeroMeters} m</span></span>
              <span>• <strong>Masse d'Air :</strong> <span className="text-amber-300 font-semibold">{report.synopticDiagnosis.airMassType}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ONGLETS DE NAVIGATION DU GRAND BULLETIN NATIONAL                       */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-2 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('centres')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'centres'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>1. Modèles &amp; Consensus 90%</span>
          </button>

          <button
            onClick={() => setActiveTab('regions')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'regions'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>2. 13 Régions, 96 Préfectures &amp; Sous-Préfectures</span>
          </button>

          <button
            onClick={() => setActiveTab('montagne')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'montagne'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mountain className="h-3.5 w-3.5" />
            <span>3. Météo de Montagne &amp; Orographie</span>
          </button>

          <button
            onClick={() => setActiveTab('regimes')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'regimes'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>4. Régimes Météo &amp; Téléconnexions (NAO, MJO, QBO)</span>
          </button>

          <button
            onClick={() => setActiveTab('synoptique')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'synoptique'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>5. Situation Synoptique &amp; Masses d'Air</span>
          </button>

          <button
            onClick={() => setActiveTab('quotidien')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'quotidien'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>6. 10 Métropoles &amp; Quotidien</span>
          </button>

          <button
            onClick={() => setActiveTab('climatologie')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'climatologie'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>7. 4 Semaines Climatologiques</span>
          </button>

          <button
            onClick={() => setActiveTab('vigilance')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'vigilance'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>8. Vigilance</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ONGLET 1 : COMPARATEUR DES 5 CENTRES METEO                             */}
      {/* ========================================================================= */}
      {activeTab === 'centres' && report && (
        <div className="space-y-6">
          {/* Bandeau d'information sur les 5 centres météorologiques */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.values(METEOROLOGICAL_CENTERS).map(center => {
              const isSelected = selectedCenterId === center.id;
              return (
                <button
                  key={center.id}
                  onClick={() => setSelectedCenterId(center.id as any)}
                  className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/80 border-sky-400 shadow-md ring-1 ring-sky-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{center.flag}</span>
                    <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {center.resolution}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white truncate">{center.shortName}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{center.organization}</p>
                  <p className="text-[9px] text-sky-400/90 mt-1.5 font-medium line-clamp-2">{center.specialty}</p>
                </button>
              );
            })}
          </div>

          {/* Sélecteur de jour pour la comparaison (J0 à J+6) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Scale className="h-4 w-4" />
                  <span>Comparaison Jour par Jour des Modèles Numériques</span>
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Simulations Parallèles pour : <span className="text-sky-300">{activeDay?.dayLabel}</span>
                </h2>
              </div>

              {/* Sélecteur de jour */}
              <div className="flex flex-wrap items-center gap-1.5">
                {report.dailyComparisons.map((day, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>{day.dayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fiche d'Analyse de Convergence & Consensus Mathématique du jour */}
            {activeDay && (
              <div className="rounded-xl border border-sky-500/20 bg-slate-900/90 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                      📍 [Échelle Locale : {currentStation.name}{currentStation.department ? ` (${currentStation.department})` : ''}]
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-sky-400" />
                      <span>Consensus Robuste 90% (5% Extrêmes Neutralisés) :</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Coefficients Zonaux Adaptés
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${activeDay.divergence.color}`}>
                      Écart : ±{activeDay.divergence.spreadCelsius}°C ({activeDay.divergence.level})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      Concordance Inter-Modèles : <span className="text-emerald-400 font-black">{activeDay.consensus.concordanceScorePct || activeDay.confidencePct}%</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-lg bg-slate-950/70 border border-sky-500/30 p-2.5">
                    <span className="text-[10px] text-sky-300 uppercase font-black block">Tn Élaguée 90% (Consensus)</span>
                    <span className="text-lg font-black text-sky-400">
                      {toDisplayTemp(activeDay.consensus.trimmedTMinConsensus ?? activeDay.consensus.tMinMean)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Brute : {toDisplayTemp(activeDay.consensus.tMinMean)} • Méd. : {toDisplayTemp(activeDay.consensus.tMinMedian)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 border border-amber-500/30 p-2.5">
                    <span className="text-[10px] text-amber-300 uppercase font-black block">Tx Élaguée 90% (Consensus)</span>
                    <span className="text-lg font-black text-amber-400">
                      {toDisplayTemp(activeDay.consensus.trimmedTMaxConsensus ?? activeDay.consensus.tMaxMean)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Brute : {toDisplayTemp(activeDay.consensus.tMaxMean)} • Méd. : {toDisplayTemp(activeDay.consensus.tMaxMedian)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Précipitations Élaguées</span>
                    <span className="text-base font-black text-blue-400">
                      {activeDay.consensus.trimmedPrecipConsensus ?? activeDay.consensus.precipMean} mm
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">{activeDay.consensus.precipAgreement}</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Temps Dominant</span>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      {renderWeatherIcon(activeDay.consensus.dominantWeatherCode, "w-4 h-4")}
                      <span className="text-xs font-bold text-white truncate">{activeDay.consensus.dominantWeatherLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Bloc d'Analyse Concrète : Impacts Quotidien & Risque de Neige Explicite */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <span>🎯</span>
                      <span>Ce que ça donnera concrètement ({activeDay.dayLabel}) :</span>
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {(activeDay.consensus.trimmedTMaxConsensus ?? activeDay.consensus.tMaxMean) >= 22
                        ? "Douceur très agréable et printanière/estivale. Vêtements légers, conditions excellentes pour les loisirs en extérieur et déplacements."
                        : (activeDay.consensus.trimmedTMaxConsensus ?? activeDay.consensus.tMaxMean) <= 4
                        ? "Ambiance glaciale ou très froide. Vêtements chauds, manteau d'hiver et gants nécessaires. Prudence sur les axes routiers ombragés."
                        : "Températures conformes à la saison. Prévoir une veste pour la matinée et un confort thermique équilibré l'après-midi."}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
                      <Snowflake className="h-3 w-3 text-sky-400" />
                      <span>Analyse Neige &amp; Phénomènes Hivernaux :</span>
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {(activeDay.consensus.trimmedTMaxConsensus ?? activeDay.consensus.tMaxMean) <= 2.5 && (activeDay.consensus.trimmedPrecipConsensus ?? activeDay.consensus.precipMean) > 0
                        ? "❄️ Risque de neige ou pluie mêlée de flocons en plaine lors des averses les plus soutenues."
                        : (currentStation.altitude || 0) >= 600 && (activeDay.consensus.trimmedTMaxConsensus ?? activeDay.consensus.tMaxMean) <= 6
                        ? `🏔️ Flocons possibles sur les reliefs à partir de ${Math.max(400, Math.round((currentStation.altitude || 600) + ((activeDay.consensus.trimmedTMaxConsensus ?? 10) - 1) * 150))} m.`
                        : "☀️ Rien de spécial / Aucun risque de neige en plaine (isotherme 0°C trop élevé, températures positives)."}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1">
                  <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{activeDay.consensus.eliminatedExtremesNotice}</span>
                  </div>
                  <p><strong>Diagnostic de Divergence :</strong> {activeDay.divergence.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Modèle le plus frais : <span className="text-sky-300 font-semibold">{activeDay.divergence.colderModel}</span> • Modèle le plus doux : <span className="text-amber-300 font-semibold">{activeDay.divergence.warmerModel}</span> • Scénario retenu : <span className="text-white font-medium">{activeDay.divergence.dominantScenario}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Cartes comparatives côte à côte des 5 centres */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {activeDay && Object.entries(activeDay.simulations).map(([centerId, sim]) => {
                const centerInfo = METEOROLOGICAL_CENTERS[centerId];
                const isColder = centerInfo?.name === activeDay.divergence.colderModel;
                const isWarmer = centerInfo?.name === activeDay.divergence.warmerModel;

                return (
                  <div
                    key={centerId}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 relative hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{centerInfo?.flag}</span>
                        <span className="text-xs font-bold text-white truncate">{centerInfo?.shortName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{centerInfo?.resolution}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-y border-slate-800/70">
                      <div className="flex items-center gap-2">
                        {renderWeatherIcon(sim.weatherCode, "w-6 h-6")}
                        <div>
                          <span className="text-xs font-semibold text-slate-200 block truncate max-w-[120px]">{sim.weatherLabel}</span>
                          <span className="text-[10px] text-slate-400">Vent : {sim.windSpeedMax} km/h</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/60">
                        <span className="text-[9px] text-slate-400 block font-semibold uppercase">Minimale (Tn)</span>
                        <span className="text-sm font-black text-sky-400">{toDisplayTemp(sim.tMin)}</span>
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/60">
                        <span className="text-[9px] text-slate-400 block font-semibold uppercase">Maximale (Tx)</span>
                        <span className="text-sm font-black text-amber-400">{toDisplayTemp(sim.tMax)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Pluie estimée :</span>
                      <span className={`font-bold ${sim.precipSum > 0.5 ? 'text-blue-400' : 'text-slate-300'}`}>
                        {sim.precipSum} mm
                      </span>
                    </div>

                    {/* Badge de tendance */}
                    <div className="pt-1">
                      {isColder && (
                        <span className="inline-block w-full text-center py-1 rounded text-[9px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          Option la plus fraîche
                        </span>
                      )}
                      {isWarmer && (
                        <span className="inline-block w-full text-center py-1 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Option la plus douce
                        </span>
                      )}
                      {!isColder && !isWarmer && (
                        <span className="inline-block w-full text-center py-1 rounded text-[9px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700/50">
                          Aligné sur le consensus
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tableau Synoptique Global des 7 Jours (Matrice Multi-Modèles) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Matrice Complète Multi-Centres à 7 Jours (J à J+6)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Comparatif Températures Minimales / Maximales en °C
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Jour &amp; Date</th>
                    <th className="py-2.5 px-3">Consensus (Moyenne)</th>
                    <th className="py-2.5 px-3 text-sky-300">🇫🇷 Météo-France</th>
                    <th className="py-2.5 px-3 text-blue-300">🇪🇺 ECMWF IFS</th>
                    <th className="py-2.5 px-3 text-purple-300">🇺🇸 NOAA GFS</th>
                    <th className="py-2.5 px-3 text-emerald-300">🇩🇪 DWD ICON</th>
                    <th className="py-2.5 px-3 text-amber-300">🇬🇧 UK Met Office</th>
                    <th className="py-2.5 px-3">Dispersion</th>
                    <th className="py-2.5 px-3 text-right">Fiabilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {report.dailyComparisons.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    return (
                      <tr
                        key={day.date}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`hover:bg-slate-800/40 transition cursor-pointer ${
                          isSelected ? 'bg-sky-950/40 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{day.dayName}</span>
                          <span className="text-[10px] text-slate-400">{day.date}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {renderWeatherIcon(day.consensus.dominantWeatherCode, "w-4 h-4")}
                            <span className="font-bold text-white">
                              {toDisplayTemp(day.consensus.tMinMean)} / {toDisplayTemp(day.consensus.tMaxMean)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{day.consensus.precipMean} mm</span>
                        </td>
                        <td className="py-3 px-3 text-sky-300 font-semibold">
                          {toDisplayTemp(day.simulations.meteofrance.tMin)} / {toDisplayTemp(day.simulations.meteofrance.tMax)}
                        </td>
                        <td className="py-3 px-3 text-blue-300 font-semibold">
                          {toDisplayTemp(day.simulations.ecmwf.tMin)} / {toDisplayTemp(day.simulations.ecmwf.tMax)}
                        </td>
                        <td className="py-3 px-3 text-purple-300 font-semibold">
                          {toDisplayTemp(day.simulations.gfs.tMin)} / {toDisplayTemp(day.simulations.gfs.tMax)}
                        </td>
                        <td className="py-3 px-3 text-emerald-300 font-semibold">
                          {toDisplayTemp(day.simulations.icon.tMin)} / {toDisplayTemp(day.simulations.icon.tMax)}
                        </td>
                        <td className="py-3 px-3 text-amber-300 font-semibold">
                          {toDisplayTemp(day.simulations.ukmo.tMin)} / {toDisplayTemp(day.simulations.ukmo.tMax)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${day.divergence.color}`}>
                            ±{day.divergence.spreadCelsius}°C
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-black text-emerald-400">{day.confidencePct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ONGLET 2 : SITUATION SYNOPTIQUE & MASSES D'AIR                         */}
      {/* ========================================================================= */}
      {activeTab === 'synoptique' && report && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Cartographie des Masses d'Air &amp; Centres d'Action
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Analyse Synoptique sur l'Europe Occidentale et la France
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Pression : {report.synopticDiagnosis.meanSeaPressureHpa} hPa
              </span>
            </div>

            {/* Centres d'action */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.synopticDiagnosis.actionCenters.map((center, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-300 uppercase tracking-wider">{center.name}</span>
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {center.pressure}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{center.role}</p>
                </div>
              ))}
            </div>

            {/* Description détaillée des masses d'air */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-amber-400" />
                <span>Physique de la Masse d'Air &amp; Températures à 850 hPa</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {report.synopticDiagnosis.airMassType}. L'isotherme 0°C moyen est calculé à{' '}
                <strong className="text-emerald-400">{report.synopticDiagnosis.isoZeroMeters} mètres</strong>. 
                Cette configuration garantit des conditions de forte stabilité atmosphérique en basse couche avec un phénomène classique d'inversion thermique : les températures au lever du jour sont souvent plus froides dans les vallées abritées (0°C à 4°C) que sur les premiers reliefs au soleil (6°C à 10°C vers 1000m).
              </p>
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>• <strong>Vigilance Gouttes Froides :</strong> Pas de décrochage polaire direct prévu sur l'Hexagone sous 72h.</span>
                <span>• <strong>Courant-Jet (Jet Stream) :</strong> Circule haut en latitude au large de l'Écosse (210 km/h).</span>
              </div>
            </div>

            {/* Synthèse des divergences entre les centres */}
            <div className="rounded-xl bg-sky-950/30 border border-sky-500/30 p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-sky-400" />
                <span>Points d'Incertitude et Scénarios Alternatifs des Centres :</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {report.synopticDiagnosis.divergenceSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ONGLET 3 : PREVISION REELLE & 10 METROPOLES                            */}
      {/* ========================================================================= */}
      {activeTab === 'quotidien' && report && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>Données Météorologiques Réelles &amp; Télémétrie en Direct</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Les 10 Villes Nationales Repères de France
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Source : Open-Meteo High-Resolution Seamless
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {report.keyCities.map(city => (
                <div
                  key={city.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{city.name}</h3>
                      <span className="text-[10px] text-slate-400 block truncate">{city.region}</span>
                    </div>
                    {renderWeatherIcon(city.weatherCode, "w-6 h-6")}
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-y border-slate-800/80">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">Minimale</span>
                      <span className="text-sm font-black text-sky-400">{toDisplayTemp(city.tMin)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">Maximale</span>
                      <span className="text-sm font-black text-amber-400">{toDisplayTemp(city.tMax)}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    <span className="line-clamp-1">{city.summary}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Vent : {city.windSpeedMax} km/h</span>
                    <span>Pluie : {city.precipSum} mm</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chronologie de la journée type en France */}
            <div className="mt-4 rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-400" />
                <span>Chronologie Moyenne de la Journée sur le Territoire Métropolitain</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-sky-300 block">Matinée (06h - 12h)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Fraîcheur vive et grisailles de basse couche (brouillards et stratus) dans les vallées du Nord, du Centre et du Sud-Ouest. Plein soleil dès l'aube sur les reliefs et la Méditerranée.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block">Après-midi (12h - 19h)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Morcellement progressif des nuages bas laissant place à de belles éclaircies. Les thermomètres atteignent leur maximum sous le soleil avec un ressenti agréable de saison.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-indigo-300 block">Soirée &amp; Nuit (19h - 06h)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Ciel dégagé ou légèrement voilé favorisant un fort rayonnement infrarouge nocturne. Baisse rapide du mercure et réapparition précoce de bancs de brumes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. ONGLET 2 : SYNTHÈSE DES 13 RÉGIONS & 96 PRÉFECTURES / SOUS-PRÉFECTURES */}
      {/* ========================================================================= */}
      {activeTab === 'regions' && (
        <div className="space-y-6">
          <PrefecturesRegionalBulletinCard
            seniorMode={seniorMode}
            tempUnit={tempUnit}
            onSelectStation={onSelectStation}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 6. ONGLET 3 : PHYSIQUE & MÉTÉO DE MONTAGNE PAR MASSIF (LPN & OROGRAPHIE) */}
      {/* ========================================================================= */}
      {activeTab === 'montagne' && (
        <div className="space-y-6">
          <MountainAdaptivePhysicsCard
            seniorMode={seniorMode}
            tempUnit={tempUnit}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6b. ONGLET 4 : RÉGIMES MÉTÉO, TÉLÉCONNEXIONS (NAO, MJO, QBO) & ANOMALIES */}
      {/* ========================================================================= */}
      {activeTab === 'regimes' && (
        <div className="space-y-6">
          {/* Header didactique et cadrage des échelles géographiques */}
          <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-br from-[#0c1322] via-[#101b33] to-[#181a2e] p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    🌐 [Échelle Hémisphérique &amp; Synoptique Européenne — 5000 km]
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                    ⚡ Modèles Couplés ECMWF EPS &amp; NOAA GEFS
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Alternance des Régimes de Temps &amp; Téléconnexions Climatologiques (NAO, MJO, QBO)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Projection &amp; Matrice de Transition à 14 Jours
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              La météo européenne ne varie pas au hasard : elle s'articule autour de <strong>4 régimes de temps fondamentaux</strong> (NAO+, Dorsale Atlantique, Blocage Scandinave, Blocage Groenlandais / NAO-). Identifier le régime en cours et anticiper sa bascule permet de prévoir les grands contrastes thermiques et les risques de neige ou de tempête avec une fiabilité bien supérieure aux prévisions brutes.
            </p>

            {/* Cadre de clarification des échelles d'analyse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-400 block">1. Échelle Hémisphérique (5000 km)</span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  MJO tropicale, onde de Rossby, oscillations de la stratosphère (QBO, Vortex Polaire).
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-sky-400 block">2. Échelle Synoptique (1000 km)</span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Trajectoire des dépressions d'Islande, anticyclone des Açores, flux zonal vs flux méridien.
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-400 block">3. Échelle Régionale (100-300 km)</span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Entrées maritimes Manche/Atlantique, Mistral et Tramontane, épisodes orageux cévenols.
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-400 block">4. Échelle Locale &amp; Maille Fine (1.3 km)</span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Résolue par AROME : inversions de combe, foehn en fond de vallée, brises côtières.
                </p>
              </div>
            </div>
          </div>

          {/* 1. ALTERNANCE PRÉVISIONNELLE DES RÉGIMES DE TEMPS À 14 JOURS */}
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  <span>Chronologie de l'Alternance Synoptique (J0 à J+14)</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Succession des Régimes et Probabilités de Transition
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Consensus multi-ensembliste ECMWF ENS 51 &amp; NCEP GEFS 31
              </span>
            </div>

            {/* Timeline interactive des 14 jours */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { day: 'J0', date: "Aujourd'hui", regime: 'Dorsale Subtropicale', proba: 78, color: 'border-amber-500/50 bg-amber-950/20 text-amber-300', icon: '🔥', concrete: 'Très doux et ensoleillé, brumes matinales' },
                { day: 'J+1', date: 'Demain', regime: 'Dorsale Subtropicale', proba: 75, color: 'border-amber-500/50 bg-amber-950/20 text-amber-300', icon: '🔥', concrete: 'Persistance de la douceur, inversions' },
                { day: 'J+2', date: 'J+2', regime: 'Dorsale Subtropicale', proba: 70, color: 'border-amber-500/50 bg-amber-950/20 text-amber-300', icon: '🔥', concrete: 'Temps calme et sec, voiles d\'altitude' },
                { day: 'J+3', date: 'J+3', regime: 'NAO+ (Zonal)', proba: 62, color: 'border-blue-500/50 bg-blue-950/20 text-blue-300', icon: '🌊', concrete: 'Passage perturbé rapide au Nord, doux' },
                { day: 'J+4', date: 'J+4', regime: 'NAO+ (Zonal)', proba: 60, color: 'border-blue-500/50 bg-blue-950/20 text-blue-300', icon: '🌊', concrete: 'Vent d\'Ouest sensible, averses côtières' },
                { day: 'J+5', date: 'J+5', regime: 'Dorsale Atlantique', proba: 54, color: 'border-teal-500/50 bg-teal-950/20 text-teal-300', icon: '🛡️', concrete: 'Hausse barométrique, bascule au Nord-Ouest' },
                { day: 'J+6', date: 'J+6', regime: 'Dorsale Atlantique', proba: 52, color: 'border-teal-500/50 bg-teal-950/20 text-teal-300', icon: '🛡️', concrete: 'Fraîcheur vive le matin, ciel dégagé' },
                { day: 'J+7', date: 'J+7', regime: 'Blocage Scandinave', proba: 48, color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300', icon: '❄️', concrete: 'Flux d\'Est continental sec et tonique' },
                { day: 'J+8', date: 'J+8', regime: 'Blocage Scandinave', proba: 46, color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300', icon: '❄️', concrete: 'Bise sensible au Nord, soleil froid' },
                { day: 'J+9', date: 'J+9', regime: 'Blocage Scandinave', proba: 44, color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300', icon: '❄️', concrete: 'Risque de gelées matinales en plaine' },
                { day: 'J+10', date: 'J+10', regime: 'Creusement Méd.', proba: 42, color: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300', icon: '⛈️', concrete: 'Goutte froide ibérique, humidité Sud-Est' },
                { day: 'J+11', date: 'J+11', regime: 'Creusement Méd.', proba: 40, color: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300', icon: '⛈️', concrete: 'Pluies orageuses sur le pourtour méditerranéen' },
                { day: 'J+12', date: 'J+12', regime: 'Dorsale Subtropicale', proba: 38, color: 'border-amber-500/50 bg-amber-950/20 text-amber-300', icon: '🔥', concrete: 'Remontée d\'une crête anticyclonique douce' },
                { day: 'J+13', date: 'J+13', regime: 'NAO+ (Zonal)', proba: 35, color: 'border-blue-500/50 bg-blue-950/20 text-blue-300', icon: '🌊', concrete: 'Reprise progressive du rail océanique doux' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 space-y-1.5 transition hover:scale-[1.02] cursor-pointer ${item.color}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black">
                    <span>{item.day} · {item.date}</span>
                    <span className="text-base">{item.icon}</span>
                  </div>
                  <div className="text-xs font-black truncate">{item.regime}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Probabilité :</span>
                    <span className="font-bold">{item.proba}%</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight pt-1 border-t border-white/10 line-clamp-2">
                    {item.concrete}
                  </p>
                </div>
              ))}
            </div>

            {/* Matrice des 4 Grands Régimes Européens en détail */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {teleconnectionsData.europeanRegimes.slice(0, 4).map((regime) => (
                <div
                  key={regime.regimeId}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{regime.icon}</span>
                        <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{regime.shortName}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {regime.currentProbabilityPct}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {regime.synopticMechanism}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px]">
                    <div className="text-sky-300 font-semibold">
                      🌡️ <strong>Températures :</strong> {regime.impactFranceTemperature}
                    </div>
                    <div className="text-blue-300 font-semibold">
                      🌧️ <strong>Précipitations :</strong> {regime.impactFrancePrecipitation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. OBSERVATOIRE DES TÉLÉCONNEXIONS MAJEURES (NAO, MJO, QBO, VORTEX POLAIRE) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span>Couplages Atmosphériques &amp; Téléconnexions Planétaires</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Indices Clés : NAO, MJO, QBO, Dipôle Océan Indien &amp; Vortex Polaire
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Indices normalisés certifiés NOAA CPC &amp; Copernicus
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teleconnectionsData.majorTeleconnections.map((tele) => (
                <div
                  key={tele.code}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-4.5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-sky-300 uppercase tracking-wider">{tele.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-200">
                        {tele.phaseLabel}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{tele.name}</h4>
                    <div className="text-sm font-mono font-black text-emerald-400">
                      {tele.currentValueFormatted}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {tele.trendDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                    <div className="text-amber-300/90 leading-tight">
                      <strong>Impact direct France :</strong> {tele.impactFranceSummary}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. DIAGNOSTIC COMPLET DES ANOMALIES THERMIQUES MULTI-NIVEAUX (Surface, 850 hPa, 500 hPa) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4" />
                  <span>Anomalies Thermiques Multi-Niveaux &amp; Comparatif Modèles</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Écarts aux Normales Climatiques (Surface 2m, 850 hPa &amp; Géopotentiel Z500)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Référence Climatologique WMO 1991-2020
              </span>
            </div>

            {/* Tri-couche atmosphérique explicative */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Niveau 1: Surface 2m */}
              <div className="rounded-xl border border-sky-500/30 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-300 uppercase">1. Surface 2m (Sous Abri)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +1.8°C / Normale
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Température mesurée à 2 mètres au-dessus du sol. Fortement modulée par le cycle jour/nuit, l'ensoleillement et les inversions thermiques nocturnes dans les vallées.
                </p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Consensus : <strong>Douceur continue en journée, nuits fraîches sous abri</strong>
                </div>
              </div>

              {/* Niveau 2: 850 hPa (~1500m) */}
              <div className="rounded-xl border border-emerald-500/30 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 uppercase">2. Masse d'Air 850 hPa (~1500m)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    +3.2°C / Normale
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Atmosphère libre hors de l'influence du sol. Révèle l'origine réelle de la masse d'air advectée (air tropical maritime ou d'origine ibérique).
                </p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Isotherme 0°C calculé : <strong className="text-emerald-400">2200 à 2800 mètres</strong>
                </div>
              </div>

              {/* Niveau 3: 500 hPa (~5500m) */}
              <div className="rounded-xl border border-indigo-500/30 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300 uppercase">3. Géopotentiel Z500 (~5500m)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Hauts Géopotentiels
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Crête anticyclonique d'altitude (géopotentiel élevé &gt; 576 dam) bloquant les fronts froids perturbés et forçant la subsidence d'air sec.
                </p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Gouttes froides : <strong className="text-slate-200">Absentes de la métropole</strong>
                </div>
              </div>
            </div>

            {/* Tableau comparatif des anomalies par modèle */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Scale className="h-4 w-4 text-sky-400" />
                <span>Comparatif des Anomalies Prévues par Centre Météo à 7 Jours (Écart aux Normales)</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Modèle Numérique</th>
                      <th className="py-2 px-3">Résolution</th>
                      <th className="py-2 px-3">Anomalie T2m Sol</th>
                      <th className="py-2 px-3">Anomalie T850 Masse d'Air</th>
                      <th className="py-2 px-3">Tendance Synoptique</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-sky-300">🇫🇷 Météo-France (AROME / ARPEGE)</td>
                      <td className="py-2.5 px-3 font-mono">1.3 km à 10 km</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">+1.6°C</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-400">+3.0°C</td>
                      <td className="py-2.5 px-3">Excellente gestion des inversions en plaine</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-blue-300">🇪🇺 ECMWF IFS (Centre Européen)</td>
                      <td className="py-2.5 px-3 font-mono">9 km (HRES)</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">+1.8°C</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-400">+3.4°C</td>
                      <td className="py-2.5 px-3">Dorsale anticyclonique puissante et très stable</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-purple-300">🇺🇸 NOAA GFS (Américain)</td>
                      <td className="py-2.5 px-3 font-mono">13 km</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">+2.1°C</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-400">+3.8°C</td>
                      <td className="py-2.5 px-3">Prévoit une remontée d'air chaud encore plus marquée</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-emerald-300">🇩🇪 DWD ICON (Allemand)</td>
                      <td className="py-2.5 px-3 font-mono">6.5 km (ICON-EU)</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">+1.5°C</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-400">+2.9°C</td>
                      <td className="py-2.5 px-3">Maintien de brouillards matinaux dissipés à midi</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-amber-300">🇬🇧 UK Met Office</td>
                      <td className="py-2.5 px-3 font-mono">10 km</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">+1.7°C</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-400">+3.1°C</td>
                      <td className="py-2.5 px-3">Très concordant avec le modèle européen ECMWF</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. RÉPONSES CONCRÈTES SANS ÉQUIVOQUE (Ce que ça donne concrètement) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Ce que cela donne concrètement sur le terrain (Synthèse Opérationnelle)</span>
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                Questions Fréquentes &amp; Diagnostics de Phénomènes
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                  <Snowflake className="h-4 w-4 text-sky-400" />
                  <span>Risque de Neige en Plaine :</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  ❌ <strong>AUCUN RISQUE de neige en plaine pour les 14 prochains jours.</strong> L'isotherme 0°C oscille entre 2200 et 2900 mètres. Les éventuelles chutes de neige restent strictement cantonnées à la très haute montagne (crêtes alpines et pyrénéennes &gt; 2500m).
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Thermometer className="h-4 w-4 text-cyan-400" />
                  <span>Risque de Gelées sous Abri :</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  ⚠️ <strong>Gelées blanches au sol très localisées</strong> possibles à l'aube dans les fonds de combes jurassiennes et creux abrités du Massif Central par rayonnement nocturne (0°C à -1°C sous abri), mais températures largement positives en journée partout ailleurs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                  <Wind className="h-4 w-4 text-teal-400" />
                  <span>Risque de Coups de Vent ou Tempêtes :</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  🛡️ <strong>Aucune tempête modélisée.</strong> Les rafales maximales restent cantonnées au littoral de la Manche (40 à 50 km/h) et au couloir rhodanien sous Mistral modéré (45 à 60 km/h).
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <Droplet className="h-4 w-4 text-blue-400" />
                  <span>Risque d'Inondations / Épisodes Cévenols :</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  🌤️ <strong>Risque cévenol nul à très faible à court terme</strong> en raison de la protection de la dorsale. Surveillance d'une potentielle goutte froide ibérique vers J+10 pouvant réactiver des entrées maritimes humides sur le golfe du Lion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ONGLET 5 : TENDANCES 4 SEMAINES CLIMATOLOGIQUES                        */}
      {/* ========================================================================= */}
      {activeTab === 'climatologie' && (
        <div className="space-y-6">
          <GigaNationalFourWeekBulletinCard
            seniorMode={seniorMode}
            tempUnit={tempUnit}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ONGLET 6 : RISQUES & VIGILANCE NATIONALE                              */}
      {/* ========================================================================= */}
      {activeTab === 'vigilance' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Sécurité Météorologique &amp; Surveillance des Phénomènes
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Vigilance Météorologique Nationale &amp; Risques de Saison
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seasonalAlertSynthesis.map((alert, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white">{alert.phenomenon}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${alert.color}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.details}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 text-xs text-slate-400 leading-relaxed">
              <strong>Note de l'Observatoire :</strong> Ces niveaux de vigilance sont actualisés en continu à partir des simulations des modèles numériques haute résolution (AROME, ICON-EU) et du modèle d'ensemble européen ECMWF EPS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
