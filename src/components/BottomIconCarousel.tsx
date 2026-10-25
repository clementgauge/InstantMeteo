import React, { useRef, useState, useEffect } from 'react';
import { Radio, Play, Sparkles, Instagram, Flame, Globe, Compass, ExternalLink } from 'lucide-react';

interface BottomIconCarouselProps {
  onOpenRadar?: () => void;
  onOpenAura?: () => void;
  onNavigateDirect?: () => void;
}

export const BottomIconCarousel: React.FC<BottomIconCarouselProps> = ({
  onOpenRadar,
  onOpenAura,
  onNavigateDirect
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Éléments du carrousel d'icônes défilant
  const carouselItems = [
    {
      id: 'radar',
      name: 'Radar HD',
      subtitle: 'Pluie Doppler 5 min',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
            <Radio className="h-5 w-5 text-cyan-300 animate-pulse" />
          </div>
        </div>
      ),
      badge: 'DIRECT',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      action: () => onOpenRadar?.(),
      isExternal: false
    },
    {
      id: 'videos',
      name: 'Vidéos & Analyses',
      subtitle: 'YouTube Officiel',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 p-0.5 shadow-md shadow-purple-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
            <Play className="h-5 w-5 text-rose-300 fill-rose-300/40 ml-0.5" />
          </div>
        </div>
      ),
      badge: 'CHAÎNE',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      action: () => window.open('https://www.youtube.com/@InstantM%C3%A9t%C3%A9o', '_blank', 'noopener,noreferrer'),
      isExternal: true
    },
    {
      id: 'discord',
      name: 'Discord Officiel',
      subtitle: 'Communauté Météo Live',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5865F2] to-indigo-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
            <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
          </div>
        </div>
      ),
      badge: 'SALON',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      action: () => window.open('https://discord.gg/MjFDekSbnt', '_blank', 'noopener,noreferrer'),
      isExternal: true
    },
    {
      id: 'aura-ai',
      name: 'AURA IA Météo',
      subtitle: 'Analyses & Graphiques 7j',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-sky-400 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
          </div>
        </div>
      ),
      badge: 'IA SPATIALE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      action: () => onOpenAura?.(),
      isExternal: false
    },
    {
      id: 'instagram',
      name: 'Instagram Officiel',
      subtitle: '@instantmeteo_fr',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-md shadow-pink-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
            <Instagram className="h-5 w-5 text-pink-200" />
          </div>
        </div>
      ),
      badge: 'PHOTOS',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      action: () => window.open('https://www.instagram.com/instantmeteo_fr/', '_blank', 'noopener,noreferrer'),
      isExternal: true
    },
    {
      id: 'direct-live',
      name: 'Direct National',
      subtitle: '34 965 Communes',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
            <Compass className="h-5 w-5 text-emerald-300" />
          </div>
        </div>
      ),
      badge: 'TEMPS RÉEL',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      action: () => onNavigateDirect?.(),
      isExternal: false
    }
  ];

  // Auto-scroll doux continu
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    const speed = 0.65; // pixels par frame

    const step = () => {
      if (!isPaused && el) {
        el.scrollLeft += speed;
        // Si on a atteint la moitié (les éléments sont dupliqués pour un défilement infini)
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  return (
    <div className="w-full my-6 select-none">
      <div className="flex items-center justify-between mb-2.5 px-2">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>Raccourcis &amp; Canaux Officiels Instant Météo</span>
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">Défilement continu</span>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 cursor-grab active:cursor-grabbing"
      >
        {/* Double jeu pour défilement infini sans coupure */}
        {[...carouselItems, ...carouselItems].map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            type="button"
            onClick={item.action}
            className="group shrink-0 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-850/80 to-slate-900/90 border border-slate-700/60 hover:border-sky-400/80 transition-all duration-200 active:scale-95 shadow-lg shadow-black/40 text-left min-w-[210px] sm:min-w-[240px]"
          >
            {item.icon}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                  {item.name}
                </span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                {item.subtitle}
              </p>
            </div>
            {item.isExternal && (
              <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-300 shrink-0 ml-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
