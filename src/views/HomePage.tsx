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
  Sparkles,
  Sun,
  ThermometerSun,
  Wind
} from 'lucide-react';
import { AppLogo } from '../components/AppLogo';

interface HomePageProps {
  onEnterApp: () => void;
}

interface CarouselSlide {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: React.ReactNode;
  stats: Array<{ label: string; value: string }>;
}

export const HomePage: React.FC<HomePageProps> = ({ onEnterApp }) => {
  const slides = useMemo<CarouselSlide[]>(
    () => [
      {
        eyebrow: 'OBSERVATION EN DIRECT',
        title: 'La météo actuelle, lisible en un coup d’œil.',
        description:
          'Température, ressenti, vent, pression, humidité et indicateurs météo détaillés autour de votre station.',
        accent: 'from-blue-500/25 via-cyan-400/10 to-transparent',
        icon: <ThermometerSun className="h-7 w-7" />,
        stats: [
          { label: 'Température', value: '+24°C' },
          { label: 'Ressenti', value: '+21°C' },
          { label: 'Pression', value: '1021 hPa' }
        ]
      },
      {
        eyebrow: 'PRÉVISIONS',
        title: 'Anticipez les prochaines heures et les prochains jours.',
        description:
          'Prévisions jour/semaine, tendances à 14 jours et vues longues pour préparer vos déplacements et vos activités.',
        accent: 'from-violet-500/25 via-blue-500/10 to-transparent',
        icon: <CalendarDays className="h-7 w-7" />,
        stats: [
          { label: 'Aujourd’hui', value: '24° / 14°' },
          { label: 'Demain', value: '23° / 13°' },
          { label: 'Tendance', value: 'Stable' }
        ]
      },
      {
        eyebrow: 'RADAR & CARTES',
        title: 'Suivez les précipitations et la situation météo sur la carte.',
        description:
          'Radar HD, cartes de France et repères géographiques pour visualiser rapidement ce qui arrive près de chez vous.',
        accent: 'from-emerald-500/20 via-cyan-500/10 to-transparent',
        icon: <Radar className="h-7 w-7" />,
        stats: [
          { label: 'Radar', value: 'HD' },
          { label: 'Carte', value: 'France' },
          { label: 'Position', value: 'GPS' }
        ]
      },
      {
        eyebrow: 'ALERTES & PRÉCISION',
        title: 'Restez informé quand la météo devient importante.',
        description:
          'Vigilances, alertes, comparaison et correction météo pour mieux comprendre les écarts et les phénomènes locaux.',
        accent: 'from-amber-500/20 via-rose-500/10 to-transparent',
        icon: <BellRing className="h-7 w-7" />,
        stats: [
          { label: 'Alertes', value: 'En direct' },
          { label: 'Vigilance', value: '5 jours' },
          { label: 'Précision', value: 'Locale' }
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
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const goToSlide = (index: number) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  const slide = slides[activeSlide];

  const features = [
    {
      icon: <Navigation className="h-5 w-5" />,
      title: 'Ma position GPS',
      text: 'Trouvez rapidement la station météo adaptée à votre position.'
    },
    {
      icon: <Sun className="h-5 w-5" />,
      title: 'Temps réel',
      text: 'Consultez les principales mesures météo et le ressenti actuel.'
    },
    {
      icon: <CalendarDays className="h-5 w-5" />,
      title: 'Prévisions détaillées',
      text: 'Explorez les heures, les jours et les tendances plus longues.'
    },
    {
      icon: <Radar className="h-5 w-5" />,
      title: 'Radar & cartes',
      text: 'Visualisez les précipitations et les phénomènes sur la France.'
    },
    {
      icon: <BellRing className="h-5 w-5" />,
      title: 'Alertes météo',
      text: 'Repérez les vigilances et les situations qui demandent votre attention.'
    },
    {
      icon: <Gauge className="h-5 w-5" />,
      title: 'Indicateurs de précision',
      text: 'Comparez les données et comprenez mieux la fiabilité des prévisions.'
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: 'Recherche de commune',
      text: 'Passez rapidement d’une commune, d’un sommet ou d’une zone à une autre.'
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: 'Application mobile',
      text: 'Retrouvez l’expérience Instant Météo sur votre appareil compatible.'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050b1c] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-36 top-20 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute right-[-8rem] top-72 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <AppLogo size="md" />
          <button
            onClick={onEnterApp}
            className="group inline-flex items-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-sm font-black text-blue-100 transition hover:border-blue-300/60 hover:bg-blue-500/20"
          >
            Ouvrir la météo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pb-24 lg:pt-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              Météo, radar & prévisions
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
              Comprendre la météo,
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                avant qu’elle ne vous surprenne.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-slate-300 sm:text-lg">
              Instant Météo réunit les observations en direct, les prévisions, le radar, les cartes et les alertes dans une interface pensée pour aller vite sans perdre les détails importants.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onEnterApp}
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3.5 text-sm font-black shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:shadow-blue-700/30"
              >
                Accéder à la météo en direct
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#decouvrir"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-black text-slate-200 transition hover:bg-white/10"
              >
                Découvrir les fonctionnalités
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-400">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Données météo détaillées</span>
              <span className="inline-flex items-center gap-2"><MapPinned className="h-4 w-4 text-cyan-400" /> France & localisation GPS</span>
              <span className="inline-flex items-center gap-2"><CloudRain className="h-4 w-4 text-blue-400" /> Radar et précipitations</span>
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="absolute -inset-4 rounded-[2.2rem] bg-gradient-to-r from-blue-500/10 via-cyan-400/5 to-violet-500/10 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent}`} />

              <div className="relative min-h-[420px] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-200 shadow-inner">
                    {slide.icon}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    Aperçu {activeSlide + 1}/{slides.length}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{slide.eyebrow}</div>
                  <h2 className="mt-3 max-w-xl text-2xl font-black leading-tight sm:text-3xl">{slide.title}</h2>
                  <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-300 sm:text-base">{slide.description}</p>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
                  {slide.stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3 sm:p-4">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{stat.label}</div>
                      <div className="mt-1 text-sm font-black text-white sm:text-lg">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-between">
                  <div className="flex gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        aria-label={`Afficher le panneau ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-blue-400' : 'w-2.5 bg-slate-600 hover:bg-slate-500'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToSlide(activeSlide - 1)}
                      aria-label="Panneau précédent"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => goToSlide(activeSlide + 1)}
                      aria-label="Panneau suivant"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="decouvrir" className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="max-w-2xl">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Tout au même endroit</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Ce que vous pouvez faire</h2>
              <p className="mt-4 text-base font-medium leading-7 text-slate-400">
                Passez de l’observation immédiate à l’anticipation, sans changer d’outil.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group rounded-3xl border border-white/10 bg-slate-900/55 p-5 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-slate-900/80"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20 transition group-hover:bg-blue-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 text-base font-black">{feature.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-400">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid overflow-hidden rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900/80 to-cyan-500/10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                <Wind className="h-4 w-4" />
                Prêt à commencer ?
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Ouvrez l’application et consultez la météo de votre zone.
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-base">
                La page météo actuelle reste exactement derrière ce bouton : vos cartes, prévisions, alertes et réglages sont accessibles immédiatement.
              </p>
            </div>
            <div className="border-t border-white/10 p-7 lg:border-l lg:border-t-0 lg:p-12">
              <button
                onClick={onEnterApp}
                className="group flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5 sm:text-base"
              >
                Entrer dans Instant Météo
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>Instant Météo — Radar, observations et prévisions météorologiques.</div>
          <button onClick={onEnterApp} className="text-left font-black text-blue-300 transition hover:text-blue-200">
            Accéder à l’application →
          </button>
        </div>
      </footer>
    </div>
  );
};
