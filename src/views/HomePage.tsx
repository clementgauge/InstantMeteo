import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Gauge,
  MapPinned,
  Navigation,
  Radar,
  Search,
  ShieldCheck,
  Smartphone,
  Sun,
  ThermometerSun,
  Wind
} from 'lucide-react';
import { AppLogo } from '../components/AppLogo';

interface HomePageProps {
  onEnterApp: () => void;
}

interface CarouselSlide {
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: Array<{ label: string; value: string }>;
}

export const HomePage: React.FC<HomePageProps> = ({ onEnterApp }) => {
  const slides = useMemo<CarouselSlide[]>(
    () => [
      {
        label: 'Relevés en direct',
        title: 'Observations mesurées sur stations homologuées.',
        description:
          'Température mesurée sous abri, pression atmosphérique au niveau de la mer, humidité relative et force des rafales de vent.',
        icon: <ThermometerSun className="h-5 w-5 text-[#0284C7]" />,
        stats: [
          { label: 'Température', value: '+18.4°C' },
          { label: 'Pression', value: '1018 hPa' },
          { label: 'Humidité', value: '62 %' }
        ]
      },
      {
        label: 'Échéances 1 à 14 jours',
        title: 'Prévisions numériques haute résolution AROME & IFS.',
        description:
          'Modélisation déterministe horaire sur les premières 48 heures, relayée par l’ensemble européen pour anticiper le risque de précipitation.',
        icon: <CalendarDays className="h-5 w-5 text-[#0284C7]" />,
        stats: [
          { label: 'Échéance', value: '48 heures' },
          { label: 'Résolution', value: '1.3 km' },
          { label: 'Modèle', value: 'AROME' }
        ]
      },
      {
        label: 'Réseau radar ARAMIS',
        title: 'Suivi des précipitations et des orages en temps réel.',
        description:
          'Échos radar actualisés toutes les 5 minutes sur la France métropolitaine, avec vitesse de déplacement et prévision immédiate à 60 minutes.',
        icon: <Radar className="h-5 w-5 text-[#0284C7]" />,
        stats: [
          { label: 'Actualisation', value: '5 min' },
          { label: 'Portée', value: 'France' },
          { label: 'Nowcast', value: '+60 min' }
        ]
      },
      {
        label: 'Vigilance officielle',
        title: 'Tableaux des risques et alertes météorologiques.',
        description:
          'Cartographie des seuils de vigilance départementaux (vent, orages, pluie-inondation, grand froid) pour planifier vos activités en sécurité.',
        icon: <BellRing className="h-5 w-5 text-[#0284C7]" />,
        stats: [
          { label: 'Niveaux', value: 'Vert à Rouge' },
          { label: 'Échéance', value: '5 jours' },
          { label: 'Source', value: 'Météo-France' }
        ]
      }
    ],
    []
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const goToSlide = (index: number) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  const slide = slides[activeSlide];

  const features = [
    {
      icon: <Navigation className="h-4 w-4 text-[#0284C7]" />,
      title: 'Localisation GPS',
      text: 'Accès immédiat aux relevés de la station la plus proche.'
    },
    {
      icon: <Sun className="h-4 w-4 text-[#0284C7]" />,
      title: 'Relevés en direct',
      text: 'Mesures officielles de température, vent, humidité et point de rosée.'
    },
    {
      icon: <CalendarDays className="h-4 w-4 text-[#0284C7]" />,
      title: 'Prévisions 14 jours & 8 mois',
      text: 'Analyse synoptique horaire, hebdomadaire et tendances saisonnières.'
    },
    {
      icon: <Radar className="h-4 w-4 text-[#0284C7]" />,
      title: 'Radar de précipitations HD',
      text: 'Cartographie Leaflet & ArcGIS avec animation des échos de pluie.'
    },
    {
      icon: <BellRing className="h-4 w-4 text-[#0284C7]" />,
      title: 'Vigilances départementales',
      text: 'Suivi des phénomènes météo dangereux sur l’ensemble du territoire.'
    },
    {
      icon: <Gauge className="h-4 w-4 text-[#0284C7]" />,
      title: 'Comparateur multi-modèles',
      text: 'Confrontation des modèles AROME, IFS, GFS, ICON et GraphCast.'
    },
    {
      icon: <Search className="h-4 w-4 text-[#0284C7]" />,
      title: '35 000 communes référencées',
      text: 'Recherche par nom, code postal, sommet alpin ou station balnéaire.'
    },
    {
      icon: <Smartphone className="h-4 w-4 text-[#0284C7]" />,
      title: 'Installation PWA',
      text: 'Application utilisable hors-ligne et installable sur smartphone.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      {/* Header strict et sobre */}
      <header className="border-b border-slate-800 bg-[#0F172A] sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <AppLogo size="md" />
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] px-4 py-2 text-xs font-bold text-white transition active:scale-95 cursor-pointer"
          >
            <span>Accéder à la station</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Section Principale en 2 colonnes avec grille stricte */}
        <section className="grid items-start gap-8 lg:grid-cols-12 pb-12 border-b border-slate-800">
          {/* Colonne gauche : Titre & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900/90 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              <span>Service Météorologique &amp; Cartographique Français</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              Observations réelles, radar officiel et prévisions fiables.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Accédez aux relevés des stations météorologiques homologuées, à la détection des pluies en temps réel et aux modélisations numériques haute résolution sans artifices.
            </p>

            {/* Boutons d'action sobre */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] px-5 py-2.5 text-sm font-bold text-white transition active:scale-95 cursor-pointer"
              >
                <span>Ouvrir la météo en direct</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#modules"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition"
              >
                Consulter les rubriques
              </a>
            </div>

            {/* Métriques d'utilité météo séparées par de simples lignes */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-medium">Fréquence</div>
                <div className="mt-1 font-bold text-white text-sm">Toutes les 5 min</div>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <div className="text-slate-400 font-medium">Couverture</div>
                <div className="mt-1 font-bold text-white text-sm">35 000 communes</div>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <div className="text-slate-400 font-medium">Modèles</div>
                <div className="mt-1 font-bold text-white text-sm">AROME &bull; IFS &bull; GFS</div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Aperçu interactif sobre (pas de gradients, bordures nettes) */}
          <div
            className="lg:col-span-5 rounded-[10px] border border-slate-700 bg-slate-900 p-6 space-y-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-[#0284C7]">
                  {slide.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                  {slide.label}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {activeSlide + 1} / {slides.length}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white leading-snug">
                {slide.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {slide.description}
              </p>
            </div>

            {/* Relevés clés sans rectangles arrondis excessifs */}
            <div className="divide-y divide-slate-800 border-y border-slate-800 py-1">
              {slide.stats.map((st) => (
                <div key={st.label} className="flex items-center justify-between py-2 text-xs">
                  <span className="text-slate-400">{st.label}</span>
                  <span className="font-bold text-white font-mono">{st.value}</span>
                </div>
              ))}
            </div>

            {/* Contrôles carrousel */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    aria-label={`Afficher panneau ${i + 1}`}
                    className={`h-1.5 rounded-sm transition-all cursor-pointer ${
                      i === activeSlide ? 'w-6 bg-[#0284C7]' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToSlide(activeSlide - 1)}
                  aria-label="Diapositive précédente"
                  className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => goToSlide(activeSlide + 1)}
                  aria-label="Diapositive suivante"
                  className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Rubriques & Modules : Grille stricte, bordures sobres, 0 fioritures */}
        <section id="modules" className="py-10 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
              Architecture des données
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Modules météorologiques disponibles
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-slate-800 text-[#0284C7]">
                    {feat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bannière finale simple */}
        <section className="mt-8 rounded-[10px] border border-slate-700 bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Prêt à consulter votre station ?
            </h3>
            <p className="text-xs text-slate-300">
              Accédez aux observations de surface, aux cartes et à la vigilance départementale.
            </p>
          </div>
          <button
            onClick={onEnterApp}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] px-5 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer"
          >
            <span>Consulter les relevés</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>

      {/* Footer sobre et structuré */}
      <footer className="border-t border-slate-800 bg-[#0F172A] py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>Instant Météo — Données d'observation et de prévision synoptique.</div>
          <button onClick={onEnterApp} className="text-[#0284C7] hover:underline font-semibold cursor-pointer">
            Accéder à l'application →
          </button>
        </div>
      </footer>
    </div>
  );
};
