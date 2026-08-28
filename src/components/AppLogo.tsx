import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick
}) => {
  const iconDimensions = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  }[size];

  const titleSize = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-3xl sm:text-4xl'
  }[size];

  return (
    <div 
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Bright, Positive & Gradient App Icon Emblem */}
      <div className={`relative ${iconDimensions} rounded-2xl overflow-hidden shadow-lg shadow-sky-500/25 border border-white/40 bg-gradient-to-br from-sky-400 via-blue-500 to-amber-300 group flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        {/* Soft Glass Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/30 pointer-events-none" />
        
        {/* Outer White Rim Highlight */}
        <div className="absolute inset-0 rounded-2xl border border-white/50 opacity-90 group-hover:border-white group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
        
        {/* Vector Artwork: Warm Radiant Sun, Fluffy White Cloud, Positive Sparkles & Instant Bolt */}
        <div className="relative z-10 flex items-center justify-center w-full h-full p-1">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full drop-shadow-sm"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="appSunGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>

              <linearGradient id="appCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>

              <linearGradient id="appBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>

              <linearGradient id="appSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
            </defs>

            {/* Cheerful Golden Sun & Corona */}
            <circle cx="66" cy="34" r="16" fill="url(#appSunGrad)" filter="drop-shadow(0 2px 4px rgba(234,88,12,0.4))" />
            
            {/* Soft Smiling Sunbeams */}
            <rect x="64.5" y="12" width="3" height="5" rx="1.5" fill="#ffffff" />
            <rect x="64.5" y="51" width="3" height="5" rx="1.5" fill="#fde047" />
            <rect x="44" y="32.5" width="5" height="3" rx="1.5" fill="#ffffff" />
            <rect x="83" y="32.5" width="5" height="3" rx="1.5" fill="#fde047" />
            <g transform="rotate(45, 66, 34)">
              <rect x="64.5" y="12" width="3" height="5" rx="1.5" fill="#ffffff" />
              <rect x="64.5" y="51" width="3" height="5" rx="1.5" fill="#fde047" />
              <rect x="44" y="32.5" width="5" height="3" rx="1.5" fill="#fde047" />
              <rect x="83" y="32.5" width="5" height="3" rx="1.5" fill="#ffffff" />
            </g>

            {/* Friendly Positive Weather Sparkles */}
            <path d="M22 22 Q22 28 16 28 Q22 28 22 34 Q22 28 28 28 Q22 28 22 22 Z" fill="url(#appSparkleGrad)" />
            <path d="M34 16 Q34 19 31 19 Q34 19 34 22 Q34 19 37 19 Q34 19 34 16 Z" fill="#ffffff" />

            {/* Soft, Fluffy Pure-White Cloud */}
            <path 
              d="M24 66h48c9 0 16-7 16-16 0-8-6-14.5-14-15.8-1-11.5-10.5-20.2-22-20.2-9.5 0-18 6-21 15.2-1.5-.6-3.4-.6-5-.6-9.5 0-17.5 8-17.5 17.5 0 9.5 8 19.9 15.5 19.9z" 
              fill="url(#appCloudGrad)" 
              filter="drop-shadow(0 4px 6px rgba(2,132,199,0.35))"
            />
            
            {/* Crisp Cloud Light Contour */}
            <path 
              d="M24 66h48c9 0 16-7 16-16 0-8-6-14.5-14-15.8-1-11.5-10.5-20.2-22-20.2-9.5 0-18 6-21 15.2-1.5-.6-3.4-.6-5-.6-9.5 0-17.5 8-17.5 17.5 0 9.5 8 19.9 15.5 19.9z" 
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
            
            {/* Cheerful Energy Instant Bolt */}
            <polygon 
              points="49,52 40,68 49,68 41,84 62,64 51,64" 
              fill="url(#appBoltGrad)" 
              stroke="#ffffff" 
              strokeWidth="1.5" 
              strokeLinejoin="round"
              filter="drop-shadow(0 2px 3px rgba(234,88,12,0.3))"
            />
          </svg>
        </div>
      </div>

      {/* Brand Typography with Positive Radiant Styling */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className={`font-black tracking-tight text-white ${titleSize} font-sans flex items-center gap-1.5 drop-shadow-sm`}>
            <span className="tracking-tight text-slate-50 font-black">INSTANT</span>
            <span className="bg-gradient-to-r from-sky-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent font-black">MÉTÉO</span>
          </h1>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-emerald-500/20 border border-amber-300/40 text-[9px] font-black text-amber-200 uppercase tracking-widest shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>HD & DIRECT</span>
          </div>
        </div>
        
        {showSubtitle && (
          <p className="text-[11px] text-sky-200/80 font-medium tracking-normal">
            Radar Doppler HD & Prévisions Météorologiques Temps Réel
          </p>
        )}
      </div>
    </div>
  );
};
