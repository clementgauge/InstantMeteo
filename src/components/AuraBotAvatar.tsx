import React from 'react';

interface AuraBotAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

export const AuraBotAvatar: React.FC<AuraBotAvatarProps> = ({
  size = 'md',
  className = '',
  glow = true
}) => {
  const sizeMap = {
    sm: { container: 'w-7 h-7', svg: 28, strokeWidth: 1.5 },
    md: { container: 'w-9 h-9', svg: 36, strokeWidth: 2 },
    lg: { container: 'w-12 h-12', svg: 48, strokeWidth: 2.5 }
  };

  const { container, svg } = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${container} ${className}`}>
      {/* Outer Atmospheric Aura Glow */}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-sky-500/40 to-indigo-500/40 blur-md animate-pulse pointer-events-none" />
      )}

      {/* SVG Neural Atmospheric Orb */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 drop-shadow-md select-none"
        fill="none"
      >
        <defs>
          <linearGradient id="auraCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="auraRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
          </linearGradient>

          <radialGradient id="auraCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#0B132B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#05070B" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Outer Orbital Orbit Ring with Dashes */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#auraRingGrad)"
          strokeWidth="2"
          strokeDasharray="6 3 2 3"
          className="animate-spin [animation-duration:18s]"
        />

        {/* Inner Counter-Rotating Orbit Ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#38BDF8"
          strokeWidth="1.2"
          strokeOpacity="0.5"
          strokeDasharray="12 4"
          className="animate-spin [animation-duration:12s] [animation-direction:reverse]"
        />

        {/* Planetary Satellite Nodes */}
        <circle cx="50" cy="5" r="2.8" fill="#F59E0B" className="animate-pulse" />
        <circle cx="95" cy="50" r="2.2" fill="#38BDF8" />
        <circle cx="50" cy="95" r="2.5" fill="#A855F7" />
        <circle cx="5" cy="50" r="2.2" fill="#10B981" />

        {/* Central Atmospheric Orb Base */}
        <circle cx="50" cy="50" r="29" fill="url(#auraCenterGlow)" stroke="url(#auraCoreGrad)" strokeWidth="2" />

        {/* Neural Weather Waves / Vortex */}
        <path
          d="M 32 50 Q 50 34 68 50 Q 50 66 32 50 Z"
          fill="none"
          stroke="url(#auraCoreGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Core AI Iris Spark */}
        <circle cx="50" cy="50" r="7" fill="#FFFFFF" className="animate-ping opacity-60" />
        <circle cx="50" cy="50" r="5" fill="#F59E0B" />
        <circle cx="48" cy="48" r="1.5" fill="#FFFFFF" />

        {/* Atmospheric Cardinal Raylets */}
        <line x1="50" y1="23" x2="50" y2="28" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="72" x2="50" y2="77" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <line x1="23" y1="50" x2="28" y2="50" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="50" x2="77" y2="50" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
