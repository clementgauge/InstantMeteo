import React, { useEffect, useRef } from 'react';
import { AtmosphereThemeConfig } from '../types/atmosphere';

interface AtmosphereBackgroundProps {
  theme: AtmosphereThemeConfig;
  seniorMode?: boolean;
  isLightMode?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  fading: boolean;
  color: string;
  rotation?: number;
  rotationSpeed?: number;
}

export const AtmosphereBackground: React.FC<AtmosphereBackgroundProps> = ({ theme, seniorMode, isLightMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate lightweight particles based on theme
    const count = seniorMode ? 18 : 36;
    const particles: Particle[] = [];

    const getParticleColor = () => {
      if (isLightMode) {
        switch (theme.particleType) {
          case 'stars':
          case 'frost':
            return Math.random() > 0.4 ? '#38bdf8' : '#818cf8';
          case 'sunflare':
            return Math.random() > 0.4 ? '#f59e0b' : '#fb923c';
          case 'embers':
            return Math.random() > 0.5 ? '#ea580c' : '#dc2626';
          case 'petals':
            return Math.random() > 0.5 ? '#f472b6' : '#34d399';
          case 'snowflakes':
            return Math.random() > 0.3 ? '#60a5fa' : '#93c5fd';
          case 'rain':
            return Math.random() > 0.3 ? 'rgba(2, 132, 199, 0.6)' : 'rgba(14, 165, 233, 0.5)';
          case 'thunder':
            return Math.random() > 0.4 ? 'rgba(147, 51, 234, 0.6)' : 'rgba(37, 99, 235, 0.6)';
          case 'mist':
          default:
            return '#94a3b8';
        }
      }

      switch (theme.particleType) {
        case 'stars':
          return Math.random() > 0.3 ? '#ffffff' : '#93c5fd';
        case 'sunflare':
          return Math.random() > 0.4 ? '#fef08a' : '#fb923c';
        case 'embers':
          return Math.random() > 0.5 ? '#f97316' : '#ef4444';
        case 'frost':
          return Math.random() > 0.3 ? '#e0f2fe' : '#bae6fd';
        case 'petals':
          return Math.random() > 0.5 ? '#fbcfe8' : '#a7f3d0';
        case 'snowflakes':
          return Math.random() > 0.25 ? '#ffffff' : '#fef08a'; // Flocons blancs et pépites d'or de Noël
        case 'rain':
          return Math.random() > 0.3 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(125, 211, 252, 0.5)';
        case 'thunder':
          return Math.random() > 0.4 ? 'rgba(168, 85, 247, 0.8)' : 'rgba(96, 165, 250, 0.7)';
        case 'mist':
        default:
          return '#cbd5e1';
      }
    };

    for (let i = 0; i < count; i++) {
      const isRain = theme.particleType === 'rain';
      const isThunder = theme.particleType === 'thunder';
      const isSnow = theme.particleType === 'snowflakes';

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSnow ? Math.random() * 4.5 + 1.2 : isRain ? Math.random() * 12 + 8 : isThunder ? Math.random() * 4 + 1.5 : Math.random() * 3.5 + 0.8,
        speedX: isSnow 
          ? (Math.random() - 0.5) * 0.8 
          : isRain 
          ? -1.2 - Math.random() * 0.8 // slight slant
          : (Math.random() - 0.5) * 0.3,
        speedY: isSnow
          ? Math.random() * 0.9 + 0.4 
          : isRain
          ? Math.random() * 8 + 7 // Rain falls briskly
          : isThunder
          ? Math.random() * 2 + 0.5
          : theme.particleType === 'embers' 
          ? -(Math.random() * 0.8 + 0.2) 
          : theme.particleType === 'frost' || theme.particleType === 'petals'
          ? Math.random() * 0.5 + 0.1 
          : (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.1,
        maxOpacity: Math.random() * 0.5 + 0.3,
        fading: Math.random() > 0.5,
        color: getParticleColor(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Update positions
        p.x += p.speedX;
        p.y += p.speedY;

        // Opacity pulsing
        if (p.fading) {
          p.opacity -= 0.005;
          if (p.opacity <= 0.05) p.fading = false;
        } else {
          p.opacity += 0.005;
          if (p.opacity >= p.maxOpacity) p.fading = true;
        }

        // Screen wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = theme.particleType === 'rain' ? 1.4 : 1.2;

        if (theme.particleType === 'rain') {
          // Dynamic rain droplet streak
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.size);
          ctx.stroke();
        } else if (theme.particleType === 'snowflakes') {
          // Beautiful snowflake crystal
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          const r = p.size;
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -r);
            ctx.moveTo(0, -r * 0.5);
            ctx.lineTo(-r * 0.25, -r * 0.7);
            ctx.moveTo(0, -r * 0.5);
            ctx.lineTo(r * 0.25, -r * 0.7);
            ctx.stroke();
            ctx.rotate(Math.PI / 3);
          }
        } else if (theme.particleType === 'stars') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (theme.particleType === 'frost') {
          // Hexagonal/diamond glint
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.fill();
        } else if (theme.particleType === 'sunflare' || theme.particleType === 'embers') {
          // Soft glowing orb
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, seniorMode]);

  // Light mode dynamic sky palette
  const getLightModeBg = () => {
    if (theme.timeOfDay === 'DAWN') {
      return 'linear-gradient(180deg, #fee2e2 0%, #ffedd5 30%, #fefce8 65%, #f8fafc 100%)';
    }
    if (theme.timeOfDay === 'DUSK') {
      return 'linear-gradient(180deg, #fce7f3 0%, #ede9fe 35%, #f1f5f9 70%, #f8fafc 100%)';
    }
    if (theme.season === 'WINTER' || theme.particleType === 'frost' || theme.particleType === 'snowflakes') {
      return 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 40%, #f1f5f9 75%, #f8fafc 100%)';
    }
    if (theme.season === 'AUTUMN' || theme.particleType === 'embers') {
      return 'linear-gradient(180deg, #fef3c7 0%, #fff7ed 35%, #f8fafc 100%)';
    }
    if (theme.particleType === 'rain' || theme.particleType === 'thunder' || theme.particleType === 'mist') {
      return 'linear-gradient(180deg, #e2e8f0 0%, #edf2f7 40%, #f8fafc 100%)';
    }
    // Default crisp daylight azure
    return 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 35%, #f6f9fc 70%, #f8fafc 100%)';
  };

  const getLightModeGlowPrimary = () => {
    if (theme.timeOfDay === 'DAWN') return 'rgba(253, 186, 116, 0.45)';
    if (theme.timeOfDay === 'DUSK') return 'rgba(244, 114, 182, 0.35)';
    if (theme.season === 'WINTER') return 'rgba(186, 230, 254, 0.55)';
    if (theme.season === 'AUTUMN') return 'rgba(252, 211, 77, 0.45)';
    if (theme.particleType === 'rain') return 'rgba(148, 163, 184, 0.35)';
    return 'rgba(186, 230, 254, 0.55)';
  };

  const getLightModeGlowSecondary = () => {
    if (theme.timeOfDay === 'DAWN') return 'rgba(254, 205, 211, 0.35)';
    if (theme.timeOfDay === 'DUSK') return 'rgba(216, 180, 254, 0.3)';
    if (theme.season === 'WINTER') return 'rgba(224, 242, 254, 0.45)';
    if (theme.season === 'AUTUMN') return 'rgba(254, 215, 170, 0.35)';
    if (theme.particleType === 'rain') return 'rgba(203, 213, 225, 0.35)';
    return 'rgba(254, 240, 138, 0.3)';
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-in-out">
      {/* 1. Deep Base Ambient Mesh Gradient */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: isLightMode 
            ? getLightModeBg() 
            : theme.bgGradient,
        }}
      />

      {/* 2. Primary Luminous Atmospheric Orb (Top Horizon / Zenith) */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          backgroundColor: isLightMode ? getLightModeGlowPrimary() : theme.meshGlowPrimary,
          transform: `translate(-50%, 0) scale(${1 + theme.lightingIntensity * 0.2})`,
        }}
      />

      {/* 3. Secondary Atmospheric Accent Orb (Bottom / Lateral) */}
      <div 
        className="absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          backgroundColor: isLightMode ? getLightModeGlowSecondary() : theme.meshGlowSecondary,
        }}
      />

      {/* 4. Tertiary Ambient Glow (Deep Base) */}
      <div 
        className="absolute -bottom-40 -left-20 w-[700px] h-[500px] rounded-full blur-[130px] transition-all duration-1000 ease-in-out pointer-events-none opacity-50"
        style={{
          backgroundColor: isLightMode ? 'rgba(224, 242, 254, 0.3)' : theme.glowAccentColor,
        }}
      />

      {/* 5. Delicate Atmospheric Micro-Particles Canvas */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isLightMode ? 'opacity-25' : 'opacity-40'}`}
      />

      {/* 6. Subtle Noise / Texture Overlay for High-End Glassmorphism */}
      <div className={`absolute inset-0 [background-size:24px_24px] ${isLightMode ? 'bg-[radial-gradient(#0f172a08_1px,transparent_1px)] opacity-25' : 'bg-[radial-gradient(#ffffff08_1px,transparent_1px)] opacity-40'}`} />
    </div>
  );
};
