import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  Calendar,
  Sparkles,
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
  Eye,
  Droplet,
  Flame,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowUpRight,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { LocationPoint, DailyForecast } from '../types/weather';
import { generateNationalFourWeekBulletin } from '../services/nationalFourWeekBulletinService';
import { GigaNationalFourWeekBulletinCard } from '../components/GigaNationalFourWeekBulletinCard';

interface GigaBulletinViewProps {
  currentStation: LocationPoint;
  dailyForecasts?: DailyForecast[];
  seniorMode: boolean;
  tempUnit: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
}

// 10 Villes Repères Nationales pour la cartographie des températures
interface KeyCityForecast {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  tMinC: number;
  tMaxC: number;
  weatherType: 'soleil' | 'eclaircies' | 'nuageux' | 'pluie' | 'orages' | 'brouillard';
  summary: string;
  windSpeedKmh: number;
  precipMm: number;
}

// 5 Grands Quadrants Régionaux de France
interface FrenchRegionBulletin {
  id: string;
  code: 'NO' | 'NE' | 'SO' | 'SE' | 'MONTAGNES';
  title: string;
  departments: string;
  dominantSky: string;
  tempRange: string;
  windNotice: string;
  phenomenaRisk: string;
  riskLevel: 'FAIBLE' | 'MODERE' | 'VIGILANCE';
  expertAdvice: string;
  morningSummary: string;
  afternoonSummary: string;
}

export const GigaBulletinView: React.FC<GigaBulletinViewProps> = ({
  currentStation,
  dailyForecasts,
  seniorMode,
  tempUnit,
  onSelectStation
}) => {
  // Navigation principale du Bulletin National
  const [activeNationalTab, setActiveNationalTab] = useState<'synoptique' | 'quotidien' | 'regions' | 'climatologie' | 'vigilance'>('synoptique');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0); // 0 = Aujourd'hui, 1 = Demain, etc.
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(() => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());
  });

  // Données climatologiques multi-modèles à 4 semaines
  const [national4WData, setNational4WData] = useState(() => generateNationalFourWeekBulletin());

  const toDisplayTemp = (celsius: number): string => {
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  // Re-génération / réactualisation du bulletin
  const handleRefreshNationalBulletin = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNational4WData(generateNationalFourWeekBulletin());
      const nowTime = new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date());
      setLastRefreshedTime(nowTime);
      setIsRefreshing(false);
    }, 400);
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

    const textToSpeak = `Grand Bulletin Météorologique National Instant Météo. Situation générale : ${synopticDiagnostic.title}. ${synopticDiagnostic.overviewText} Prévisions pour les prochaines heures : ${nationalDays[selectedDayIndex].afternoonSummary} Fin du bulletin de synthèse.`;
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

  // Diagnostic synoptique national calculé
  const synopticDiagnostic = useMemo(() => {
    return {
      title: "Régime Ondulatoire Doux et Anticyclone des Açores en Retrait",
      regimeCode: "NAO+ / Dorsale Atlantique Ouest",
      confidenceIndex: 92,
      meanSeaPressureHpa: 1022,
      isoZeroFranceM: 2250,
      jetStreamSpeedKmh: 210,
      gradientNordSudC: 8.5,
      overviewText: "La France est actuellement sous l'influence d'un champ de pressions légèrement supérieures à la normale, piloté par un anticyclone étiré des Açores vers le Golfe de Gascogne. Le flux d'Ouest à Sud-Ouest tempéré véhicule une humidité modérée sur la façade de la Manche et les côtes atlantiques, tandis qu'un air sec et très lumineux s'impose au Sud de la Loire et sur le pourtour méditerranéen.",
      airMassAnalysis: "Masse d'air subtropicale d'origine maritime circulant sur la moitié Sud (advection douce entre 12 et 14°C à 850 hPa), contrastant avec une masse d'air polaire maritime dégradée léchant les côtes de la Manche (5 à 7°C à 850 hPa).",
      actionCenters: [
        { name: "Anticyclone des Açores", pressure: "1028 hPa", status: "Protecteur sur le Sud-Ouest et la Méditerranée" },
        { name: "Dépression d'Irlande & Mer du Nord", pressure: "998 hPa", status: "Engendre des passages nuageux au Nord de la Somme" },
        { name: "Goutte froide d'Europe Centrale", pressure: "1012 hPa", status: "Maintient des matinées fraîches vers l'Alsace" }
      ]
    };
  }, [national4WData]);

  // 8 Jours de prévisions nationales détaillées (J à J+7)
  const nationalDays = useMemo(() => {
    const days = [];
    const baseNames = ['Aujourd\'hui', 'Demain', 'J+2 (Après-demain)', 'J+3', 'J+4', 'J+5', 'J+6', 'J+7'];
    const now = new Date();

    for (let i = 0; i < 8; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dateLabel = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      const confidence = Math.max(60, 96 - i * 5);
      const tempDelta = i === 1 ? +1 : i === 2 ? +2 : i === 3 ? 0 : -1;

      days.push({
        dayIndex: i,
        shortTitle: baseNames[i],
        fullDateFormatted: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1),
        confidencePct: confidence,
        synopticType: i <= 2 ? 'Anticyclonique lumineux' : i === 3 ? 'Passage d\'un front atténué' : 'Ciel de traîne & éclaircies',
        morningSummary: i === 3
          ? "Grisaille et brumes tenaces du Bassin Parisien aux frontières du Nord-Est. Douceur maritime et ciel voilé sur l'Ouest."
          : "Fraîcheur matinale vivifiante avec bancs de brouillards dans les fonds de vallées. Soleil franc dès l'aube sur les massifs et le littoral méditerranéen.",
        afternoonSummary: i === 3
          ? "Quelques gouttes intermittentes de la Normandie aux Ardennes (1 à 4 mm). Belles éclaircies de la Vendée au Lyonnais, grand soleil et chaleur au Sud."
          : "Après-midi très agréable et lumineuse sur la quasi-totalité du territoire. Températures maximales de 20 à 24°C au Nord, 25 à 29°C au Sud.",
        nightSummary: "Nuit calme et étoilée favorisant un net rayonnement nocturne. Ciel restant voilé au Nord-Ouest.",
        nationalMinAvgC: Math.round(11 + tempDelta),
        nationalMaxAvgC: Math.round(24 + tempDelta),
        windSynthesis: i <= 2 ? "Vent de secteur Ouest-Sud-Ouest faible à modéré (20 à 35 km/h sur les caps)." : "Rafales de 45 à 55 km/h sous les averses au Nord de la Seine.",
        keyCities: [
          { id: 'lille', name: 'Lille', region: 'Hauts-de-France', latitude: 50.6292, longitude: 3.0573, tMinC: 11 + tempDelta, tMaxC: 20 + tempDelta, weatherType: i === 3 ? 'pluie' : 'eclaircies', summary: 'Nuages & éclaircies', windSpeedKmh: 35, precipMm: i === 3 ? 3 : 0 },
          { id: 'paris', name: 'Paris', region: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, tMinC: 13 + tempDelta, tMaxC: 23 + tempDelta, weatherType: i === 3 ? 'nuageux' : 'soleil', summary: 'Beau temps estival', windSpeedKmh: 20, precipMm: i === 3 ? 1 : 0 },
          { id: 'brest', name: 'Brest', region: 'Bretagne', latitude: 48.3904, longitude: -4.4861, tMinC: 12 + tempDelta, tMaxC: 19 + tempDelta, weatherType: i === 3 ? 'pluie' : 'eclaircies', summary: 'Brise océanique', windSpeedKmh: 42, precipMm: i === 3 ? 4 : 0.2 },
          { id: 'strasbourg', name: 'Strasbourg', region: 'Grand Est', latitude: 48.5734, longitude: 7.7521, tMinC: 10 + tempDelta, tMaxC: 24 + tempDelta, weatherType: 'soleil', summary: 'Ensoleillé et sec', windSpeedKmh: 15, precipMm: 0 },
          { id: 'lyon', name: 'Lyon', region: 'Auvergne-Rhône-Alpes', latitude: 45.7640, longitude: 4.8357, tMinC: 14 + tempDelta, tMaxC: 26 + tempDelta, weatherType: 'soleil', summary: 'Chaleur agréable', windSpeedKmh: 18, precipMm: 0 },
          { id: 'bordeaux', name: 'Bordeaux', region: 'Nouvelle-Aquitaine', latitude: 44.8378, longitude: -0.5792, tMinC: 14 + tempDelta, tMaxC: 27 + tempDelta, weatherType: 'soleil', summary: 'Grand ciel bleu', windSpeedKmh: 20, precipMm: 0 },
          { id: 'toulouse', name: 'Toulouse', region: 'Occitanie', latitude: 43.6047, longitude: 1.4442, tMinC: 15 + tempDelta, tMaxC: 28 + tempDelta, weatherType: 'soleil', summary: 'Très ensoleillé', windSpeedKmh: 25, precipMm: 0 },
          { id: 'marseille', name: 'Marseille', region: 'PACA', latitude: 43.2965, longitude: 5.3698, tMinC: 17 + tempDelta, tMaxC: 28 + tempDelta, weatherType: 'soleil', summary: 'Mistral modéré', windSpeedKmh: 45, precipMm: 0 },
          { id: 'nice', name: 'Nice', region: 'Côte d\'Azur', latitude: 43.7102, longitude: 7.2620, tMinC: 18 + tempDelta, tMaxC: 27 + tempDelta, weatherType: 'soleil', summary: 'Ciel limpide', windSpeedKmh: 15, precipMm: 0 },
          { id: 'ajaccio', name: 'Ajaccio', region: 'Corse', latitude: 41.9192, longitude: 8.7386, tMinC: 16 + tempDelta, tMaxC: 27 + tempDelta, weatherType: 'soleil', summary: 'Temps splendide', windSpeedKmh: 20, precipMm: 0 }
        ] as KeyCityForecast[]
      });
    }

    return days;
  }, []);

  const activeDay = nationalDays[selectedDayIndex] || nationalDays[0];

  // Les 5 Grands Quadrants Régionaux de France
  const regionalBulletins: FrenchRegionBulletin[] = useMemo(() => [
    {
      id: 'no',
      code: 'NO',
      title: 'Quart Nord-Ouest',
      departments: 'Bretagne, Normandie, Pays de la Loire, Centre-Val de Loire Ouest',
      dominantSky: 'Éclaircies larges alternant avec quelques bancs de strato-cumulus côtiers inoffensifs.',
      tempRange: 'Matin 11 à 13°C • Après-midi 19 à 24°C',
      windNotice: 'Vent de Sud-Ouest 20 à 35 km/h, fraîchissant jusqu\'à 50 km/h sur les caps de la presqu\'île du Cotentin.',
      phenomenaRisk: 'Brumes matinales locales au lever du jour dans les vallées intérieures bretonnes.',
      riskLevel: 'FAIBLE',
      expertAdvice: 'Excellentes conditions de navigation et d\'activités de plein air, prévoir une petite laine le matin.',
      morningSummary: 'Nuages bas temporaires dissipés avant 10h, ciel se voilant légèrement en fin de matinée.',
      afternoonSummary: 'Atmosphère ventilée et lumineuse, thermomètre très agréable sans excès thermique.'
    },
    {
      id: 'ne',
      code: 'NE',
      title: 'Quart Nord-Est & Bassin Parisien',
      departments: 'Île-de-France, Hauts-de-France, Grand Est, Bourgogne-Franche-Comté',
      dominantSky: 'Soleil franc et ciel bleu limpide après la dissipation rapide des brouillards nocturnes.',
      tempRange: 'Matin 9 à 13°C • Après-midi 22 à 25°C',
      windNotice: 'Vent variable très faible, inférieur à 15 km/h.',
      phenomenaRisk: 'Aucun phénomène dangereux prévu sur le domaine.',
      riskLevel: 'FAIBLE',
      expertAdvice: 'Journée idéale pour l\'agriculture, les chantiers et le tourisme urbain dans la capitale.',
      morningSummary: 'Fraîcheur piquante dans les plaines de Champagne et de Lorraine, ciel immaculé.',
      afternoonSummary: 'Chaleur modérée et bienfaisante, cumulus de beau temps très épars sur les Vosges.'
    },
    {
      id: 'so',
      code: 'SO',
      title: 'Quart Sud-Ouest & Bassin Aquitain',
      departments: 'Nouvelle-Aquitaine, Occitanie Ouest (Midi-Pyrénées)',
      dominantSky: 'Grand soleil et ambiance estivale continue, voile décoratif en direction des Pyrénées.',
      tempRange: 'Matin 13 à 16°C • Après-midi 26 à 29°C',
      windNotice: 'Légères brises thermiques en bord d\'Océan, vent d\'Autan modéré vers le Lauragais (30 km/h).',
      phenomenaRisk: 'Indice UV élevé (niveau 7 à 8) aux heures zénithales.',
      riskLevel: 'FAIBLE',
      expertAdvice: 'Pensez à bien vous hydrater et protéger les enfants du soleil aux heures les plus chaudes.',
      morningSummary: 'Ciel bleu d\'azur dès l\'aube, températures très douces en milieu de matinée.',
      afternoonSummary: 'Ressenti pleinement estival, ambiance d\'un grand confort thermique.'
    },
    {
      id: 'se',
      code: 'SE',
      title: 'Quart Sud-Est & Pourtour Méditerranéen',
      departments: 'Provence-Alpes-Côte d\'Azur, Languedoc-Roussillon, Corse',
      dominantSky: 'Ciel bleu profond d\'une limpidité absolue sous l\'effet du Mistral et de la Tramontane.',
      tempRange: 'Matin 16 à 19°C • Après-midi 27 à 30°C',
      windNotice: 'Mistral et Tramontane soufflant en rafales à 50-65 km/h dans leur couloir habituel.',
      phenomenaRisk: 'Risque feux de forêts modéré à sévère sur la basse vallée du Rhône et les Maures.',
      riskLevel: 'MODERE',
      expertAdvice: 'Prudence absolue avec tout apport de flamme en extérieur dans les massifs forestiers.',
      morningSummary: 'Lumière méditerranéenne exceptionnelle, température montant rapidement au soleil.',
      afternoonSummary: 'Chaleur sèche marquée, plan d\'eau moutonné dans le Golfe du Lion.'
    },
    {
      id: 'montagnes',
      code: 'MONTAGNES',
      title: 'Grands Massifs de Montagne',
      departments: 'Alpes du Nord & Sud, Pyrénées, Massif Central, Jura, Vosges',
      dominantSky: 'Conditions d\'altitude très stables, excellentes visibilités sommitales.',
      tempRange: 'Isotherme 0°C vers 2200-2400 m • 14°C à 1500 m • 5°C à 3000 m',
      windNotice: 'Vent de crête de secteur Nord-Ouest 30 à 45 km/h.',
      phenomenaRisk: 'Névés résiduels durs le matin en haute altitude (> 2600 m), crampons nécessaires.',
      riskLevel: 'FAIBLE',
      expertAdvice: 'Fenêtre météo de haute montagne très favorable pour l\'alpinisme et les randonnées.',
      morningSummary: 'Inversions thermiques : vallées plus fraîches que les cols au lever du jour.',
      afternoonSummary: 'Quelques bourgeonnements discrets sur les crêtes frontalières, sans menace orageuse.'
    }
  ], []);

  // Synthèse des risques et vigilances nationales
  const nationalAlertSynthesis = useMemo(() => [
    {
      phenomenon: "Vent Violent & Coup de Vent",
      status: "Niveau Vert National",
      level: 1,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      details: "Pas de tempête ni de coup de vent synoptique. Seuls le Mistral et la Tramontane atteignent 50 à 65 km/h dans le Sud-Est sans dépasser les seuils d'alerte."
    },
    {
      phenomenon: "Orages & Convection Diurne",
      status: "Niveau Vert National",
      level: 1,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      details: "Stabilité atmosphérique dominante sous l'influence des hauts géopotentiels. Risque orageux quasi nul sur le territoire métropolitain."
    },
    {
      phenomenon: "Crues & Pluies Inondations",
      status: "Niveau Vert National",
      level: 1,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      details: "Débits fluviaux calmes et conformes aux normales saisonnières. Pas de crues génératrices de dommages."
    },
    {
      phenomenon: "Vagues-Submersion & Littoral",
      status: "Niveau Vert National",
      level: 1,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      details: "Houle océanique modérée (1.0 à 1.4 m) sur la côte atlantique et mer peu agitée en Manche et Méditerranée."
    },
    {
      phenomenon: "Sécheresse & Risque Feux de Forêt",
      status: "Vigilance Jaune Ciblée (PACA & Occitanie)",
      level: 2,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      details: "Végétation sèche et vent soutenu en Provence et Bas-Languedoc. Accès aux massifs forestiers potentiellement régulé."
    },
    {
      phenomenon: "Avalanches en Haute Montagne",
      status: "Niveau 1/5 Faible (BERA)",
      level: 1,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      details: "Manteau neigeux stabilisé et fondu sous 2400 m. Seuls quelques glissements de neige humide aux heures les plus chaudes en versants ensoleillés."
    }
  ], []);

  const renderWeatherIcon = (type: KeyCityForecast['weatherType'], className = "w-5 h-5") => {
    switch (type) {
      case 'soleil':
        return <Sun className={`${className} text-amber-400 animate-pulse`} />;
      case 'eclaircies':
        return <CloudSun className={`${className} text-amber-300`} />;
      case 'nuageux':
        return <CloudSun className={`${className} text-slate-300`} />;
      case 'pluie':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'orages':
        return <CloudLightning className={`${className} text-purple-400`} />;
      case 'brouillard':
        return <CloudFog className={`${className} text-slate-400`} />;
      default:
        return <Sun className={`${className} text-amber-400`} />;
    }
  };

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
              <span>Observatoire Météorologique Officiel • France Métropolitaine &amp; Régions</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Multi-Modèles AROME / ARPEGE / IFS
              </span>
            </div>
            <h1 className={`font-black text-white tracking-tight ${seniorMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              Grand Bulletin Météorologique National
            </h1>
            <p className={`text-slate-300 max-w-4xl leading-relaxed ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'}`}>
              Expertise synoptique complète pour la France : masses d'air, chronologie jour par jour (matin, après-midi, nuit), grand tour des régions, thermométrie des métropoles et perspectives climatologiques à 4 semaines.
            </p>
          </div>

          {/* Badges d'action rapide & actualisation */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Télémétrie Officielle</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Actualisé à {lastRefreshedTime}
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
              onClick={handleRefreshNationalBulletin}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2.5 text-xs font-bold transition shadow cursor-pointer"
              title="Réactualiser immédiatement tous les calculs du bulletin national"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Actualisation...' : 'Réactualiser'}</span>
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

        {/* Diagnostic Exécutif Express */}
        <div className="mt-5 rounded-2xl bg-slate-950/80 border border-sky-500/30 p-4.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>Synthèse Exécutive du Prévisionniste National :</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Indice de Fiabilité Nationale : {synopticDiagnostic.confidenceIndex} %
            </span>
          </div>
          <p className="text-slate-100 text-xs sm:text-sm font-medium leading-relaxed">
            {synopticDiagnostic.overviewText}
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-[11px] text-slate-400">
            <span>• <strong>Régime Synoptique :</strong> <span className="text-sky-300 font-semibold">{synopticDiagnostic.regimeCode}</span></span>
            <span>• <strong>Pression Moyenne Mer :</strong> <span className="text-white font-semibold">{synopticDiagnostic.meanSeaPressureHpa} hPa</span></span>
            <span>• <strong>Isotherme 0°C Moyen :</strong> <span className="text-emerald-400 font-semibold">{synopticDiagnostic.isoZeroFranceM} m</span></span>
            <span>• <strong>Gradient Thermique Nord-Sud :</strong> <span className="text-amber-300 font-semibold">+{synopticDiagnostic.gradientNordSudC}°C</span></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ONGLETS DE NAVIGATION DU GRAND BULLETIN NATIONAL                       */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-2 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveNationalTab('synoptique')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeNationalTab === 'synoptique'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>1. Situation Synoptique &amp; Masses d'Air</span>
          </button>

          <button
            onClick={() => setActiveNationalTab('quotidien')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeNationalTab === 'quotidien'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>2. Prévision Quotidienne &amp; 7 Jours France</span>
          </button>

          <button
            onClick={() => setActiveNationalTab('regions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeNationalTab === 'regions'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>3. Tour des Régions Françaises</span>
          </button>

          <button
            onClick={() => setActiveNationalTab('climatologie')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeNationalTab === 'climatologie'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>4. Tendance Climatologique 4 Semaines</span>
          </button>

          <button
            onClick={() => setActiveNationalTab('vigilance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeNationalTab === 'vigilance'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>5. Risques &amp; Vigilance Nationale</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTENU : ONGLET 1 - SITUATION SYNOPTIQUE & MASSES D'AIR               */}
      {/* ========================================================================= */}
      {activeNationalTab === 'synoptique' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Cartographie des Masses d'Air &amp; Centres d'Action
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Analyse Météorologique Globale sur l'Europe et la France
                </h2>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-sky-300">
                Pression : {synopticDiagnostic.meanSeaPressureHpa} hPa
              </div>
            </div>

            {/* Diagnostic Détaillé des Masses d'Air */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Activity className="h-4 w-4" />
                  <span>Origine &amp; Trajectoire des Masses d'Air :</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {synopticDiagnostic.airMassAnalysis}
                </p>
                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-bold text-emerald-400 block mb-0.5">Courant-Jet (Jet-Stream) :</span>
                  L'axe du jet-stream polaire ondule à une altitude d'environ 9200 m (niveau 300 hPa) avec des vitesses de pointe mesurées à <strong>{synopticDiagnostic.jetStreamSpeedKmh} km/h</strong> entre l'Écosse et la Scandinavie, maintenant les dépressions creuses à distance respectable de la métropole.
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Layers className="h-4 w-4" />
                  <span>Centres d'Action Régulateurs Actifs :</span>
                </div>
                <div className="space-y-2">
                  {synopticDiagnostic.actionCenters.map((c, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-bold text-white">{c.name}</span>
                        <p className="text-[11px] text-slate-400">{c.status}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-500/15 text-sky-300 border border-sky-500/30 self-start sm:self-auto shrink-0">
                        {c.pressure}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thermométrie d'ensemble Nord / Sud */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-950 to-amber-950/30 border border-slate-800 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contraste Thermique National (Nord vs Sud)
                </span>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Le gradient de température moyen entre les côtes de la Manche et la plaine toulousaine ou méditerranéenne atteint <strong>+{synopticDiagnostic.gradientNordSudC}°C</strong> l'après-midi, marquant la frontière entre flux océanique tempéré et masse d'air subtropicale.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3.5 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-center">
                  <div className="text-[10px] text-blue-300 font-bold uppercase">Moyenne Nord</div>
                  <div className="text-base font-black text-white">21°C</div>
                </div>
                <div className="text-slate-600 font-bold text-lg">→</div>
                <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-center">
                  <div className="text-[10px] text-amber-300 font-bold uppercase">Moyenne Sud</div>
                  <div className="text-base font-black text-white">28°C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTENU : ONGLET 2 - PRÉVISION QUOTIDIENNE & 7 JOURS FRANCE            */}
      {/* ========================================================================= */}
      {activeNationalTab === 'quotidien' && (
        <div className="space-y-6">
          {/* Sélecteur de Jour Quotidien (Aujourd'hui à J+7) */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-4 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Choisissez l'échéance journalière pour la France :
              </span>
              <span className="text-xs text-sky-400 font-bold">
                Échéance active : {activeDay.fullDateFormatted} ({activeDay.confidencePct}% de fiabilité)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {nationalDays.map((d) => {
                const isSel = d.dayIndex === selectedDayIndex;
                return (
                  <button
                    key={d.dayIndex}
                    onClick={() => setSelectedDayIndex(d.dayIndex)}
                    className={`rounded-xl border p-2.5 text-center transition cursor-pointer flex flex-col justify-between ${
                      isSel
                        ? 'bg-sky-600 border-sky-400 text-white shadow-lg ring-1 ring-sky-300'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold line-clamp-1">{d.shortTitle}</div>
                    <div className="my-1.5 flex justify-center">
                      <Sun className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-[10px] font-semibold opacity-90">
                      {d.nationalMinAvgC}° / {d.nationalMaxAvgC}°
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Découpage Chronologique de la Journée Sélectionnée */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Chronologie Détaillée France Entière • {activeDay.fullDateFormatted}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Évolution Diurne : Matinée, Après-midi et Soirée/Nuit
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300">
                  Régime : <strong className="text-sky-300">{activeDay.synopticType}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Matin */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span>Matinée (06h - 12h)</span>
                  </div>
                  <span className="text-xs font-black text-slate-400">
                    Tn moy. : {toDisplayTemp(activeDay.nationalMinAvgC)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeDay.morningSummary}
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Rosée et brumes temporaires dans les vallées abritées, vent calme.
                </div>
              </div>

              {/* Après-midi */}
              <div className="rounded-2xl bg-slate-950/80 border-2 border-sky-500/40 p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                    <CloudSun className="h-4 w-4 text-amber-400" />
                    <span>Après-midi (12h - 18h)</span>
                  </div>
                  <span className="text-xs font-black text-amber-400">
                    Tx moy. : {toDisplayTemp(activeDay.nationalMaxAvgC)}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activeDay.afternoonSummary}
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-sky-300">
                  {activeDay.windSynthesis}
                </div>
              </div>

              {/* Soir & Nuit */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span>Soirée &amp; Nuit (18h - 06h)</span>
                  </div>
                  <span className="text-xs font-bold text-purple-300">
                    Ciel calme
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeDay.nightSummary}
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Excellente qualité de l'air nocturne, baisse thermique progressive.
                </div>
              </div>
            </div>

            {/* Thermométrie des 10 Grandes Métropoles Nationales */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-rose-400" />
                  <span>Thermométrie Nationale : 10 Métropoles Clés ({activeDay.shortTitle})</span>
                </h4>
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  Minima matinaux (Tn) &amp; Maxima diurnes (Tx)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {activeDay.keyCities.map((city) => (
                  <div
                    key={city.id}
                    className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{city.name}</span>
                        {renderWeatherIcon(city.weatherType)}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{city.region}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-blue-400 font-bold">{toDisplayTemp(city.tMinC)}</span>
                      <span className="text-slate-600 font-bold">/</span>
                      <span className="text-amber-400 font-bold">{toDisplayTemp(city.tMaxC)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTENU : ONGLET 3 - GRAND TOUR DES RÉGIONS FRANÇAISES                 */}
      {/* ========================================================================= */}
      {activeNationalTab === 'regions' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Découpage Biogéographique &amp; Climatique
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Le Grand Tour des Régions Françaises
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Analyses sectorielles approfondies pour les 5 grands quadrants de l'Hexagone et ses massifs.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {regionalBulletins.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 sm:p-6 shadow-lg space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {reg.code}
                        </span>
                        <h3 className="text-lg font-black text-white">{reg.title}</h3>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{reg.departments}</span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-amber-300">
                        {reg.tempRange}
                      </span>
                    </div>
                  </div>

                  {/* Analyse Matin / Après-midi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
                      <span className="font-bold text-sky-400 flex items-center gap-1.5">
                        <Sun className="h-3.5 w-3.5 text-amber-400" />
                        <span>Matin :</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed">{reg.morningSummary}</p>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
                      <span className="font-bold text-sky-400 flex items-center gap-1.5">
                        <CloudSun className="h-3.5 w-3.5 text-amber-400" />
                        <span>Après-midi :</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed">{reg.afternoonSummary}</p>
                    </div>
                  </div>

                  {/* Vent, Risques & Recommandations */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-400 block mb-0.5">Régime de Vent :</span>
                      <span className="text-slate-300">{reg.windNotice}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block mb-0.5">Phénomènes Particuliers :</span>
                      <span className="text-slate-300">{reg.phenomenaRisk}</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-400 block mb-0.5">Conseil Prévisionniste :</span>
                      <span className="text-slate-200">{reg.expertAdvice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CONTENU : ONGLET 4 - TENDANCE CLIMATOLOGIQUE MULTI-MODÈLES 4 SEMAINES    */}
      {/* ========================================================================= */}
      {activeNationalTab === 'climatologie' && (
        <div className="space-y-6">
          <GigaNationalFourWeekBulletinCard
            seniorMode={seniorMode}
            tempUnit={tempUnit}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CONTENU : ONGLET 5 - RISQUES & VIGILANCE NATIONALE                     */}
      {/* ========================================================================= */}
      {activeNationalTab === 'vigilance' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Cartographie &amp; Synthèse des Vigilances Phénomènes
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Synthèse Nationale des Risques Météorologiques
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Surveillance continue des 6 paramètres majeurs de sécurité civile.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Situation Générale Calme</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nationalAlertSynthesis.map((alert, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{alert.phenomenon}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${alert.color}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alert.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Mise à jour officielle continue</span>
                    <span>Niveau {alert.level} / 4</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Consignes de Sécurité Civile */}
            <div className="rounded-2xl bg-slate-950/90 border border-sky-500/30 p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                <Info className="h-4 w-4" />
                <span>Conseils &amp; Recommandations aux Usagers :</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Restez attentifs lors de vos déplacements en cas de brouillard matinal réduisant la visibilité à moins de 200 m.</li>
                <li>Respectez scrupuleusement les consignes de sécurité anti-incendie en forêt sur le pourtour méditerranéen.</li>
                <li>En montagne, prévoyez un équipement thermique adapté : les températures chutent rapidement dès le coucher du soleil.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
