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

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-in-out">
      {/* 1. Deep Base Ambient Mesh Gradient */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: isLightMode 
            ? 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 40%, #f1f5f9 100%)' 
            : theme.bgGradient,
        }}
      />

      {/* 2. Primary Luminous Atmospheric Orb (Top Horizon / Zenith) */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          backgroundColor: isLightMode ? '#93c5fd40' : theme.meshGlowPrimary,
          transform: `translate(-50%, 0) scale(${1 + theme.lightingIntensity * 0.2})`,
        }}
      />

      {/* 3. Secondary Atmospheric Accent Orb (Bottom / Lateral) */}
      <div 
        className="absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          backgroundColor: isLightMode ? '#fde68a30' : theme.meshGlowSecondary,
        }}
      />

      {/* 4. Tertiary Ambient Glow (Deep Base) */}
      <div 
        className="absolute -bottom-40 -left-20 w-[700px] h-[500px] rounded-full blur-[130px] transition-all duration-1000 ease-in-out pointer-events-none opacity-50"
        style={{
          backgroundColor: isLightMode ? '#e0f2fe60' : theme.glowAccentColor,
        }}
      />

      {/* 5. Delicate Atmospheric Micro-Particles Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-40 transition-opacity duration-1000"
      />

      {/* 6. Subtle Noise / Texture Overlay for High-End Glassmorphism */}
      <div className={`absolute inset-0 [background-size:24px_24px] ${isLightMode ? 'bg-[radial-gradient(#0000000a_1px,transparent_1px)] opacity-20' : 'bg-[radial-gradient(#ffffff08_1px,transparent_1px)] opacity-40'}`} />
    </div>
  );
};
