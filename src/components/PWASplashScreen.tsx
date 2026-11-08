import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface PWASplashScreenProps {
  forceShow?: boolean;
  onFinished?: () => void;
}

export const PWASplashScreen: React.FC<PWASplashScreenProps> = ({
  forceShow = false,
  onFinished
}) => {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (forceShow) return true;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    const alreadyShown = sessionStorage.getItem('instant_meteo_splash_seen');
    if (!alreadyShown) {
      return true;
    }
    return isStandalone && !alreadyShown;
  });

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isGo, setIsGo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Manual replay listener
  useEffect(() => {
    const handleTrigger = () => {
      setVisible(true);
      setIsFadingOut(false);
      setIsGo(false);
      setTimeout(() => setIsGo(true), 30);
    };
    window.addEventListener('instant_meteo_trigger_splash', handleTrigger);
    return () => window.removeEventListener('instant_meteo_trigger_splash', handleTrigger);
  }, []);

  // Launch animations and auto-dismiss timer
  useEffect(() => {
    if (!visible) return;

    try {
      sessionStorage.setItem('instant_meteo_splash_seen', 'true');
    } catch (_) {}

    // Start CSS animations
    const startTimer = setTimeout(() => setIsGo(true), 40);

    // Auto fade-out into app after full sequence has played and completed (~8.5s)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      const closeTimer = setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 700);
      return () => clearTimeout(closeTimer);
    }, 8500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(fadeTimer);
    };
  }, [visible, onFinished]);

  // Canvas Procedural Clouds, Stars & Sky Loop from script_68f42f58.js
  useEffect(() => {
    if (!visible) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    function rng(a: number) {
      return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function puff(g: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${rgb},${a})`);
      gr.addColorStop(0.6, `rgba(${rgb},${a * 0.55})`);
      gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, r, 0, 7);
      g.fill();
    }

    function sprite(seed: number, isWarm: boolean) {
      const c = document.createElement('canvas');
      c.width = 560;
      c.height = 300;
      const g = c.getContext('2d');
      if (!g) return c;
      const r = rng(seed);
      const ps: { x: number; y: number; r: number }[] = [];
      for (let i = 0; i < 26; i++) {
        const u = r();
        const b = Math.sin(u * Math.PI);
        ps.push({
          x: 80 + u * 400,
          y: 220 - b * (40 + r() * 60) - r() * 18,
          r: 34 + r() * 34 + b * 42
        });
      }
      ps.forEach(p => puff(g, p.x, p.y + 14, p.r, '4,10,28', 0.95)); // ombre
      ps.forEach(p => puff(g, p.x, p.y, p.r * 0.92, '22,42,86', 0.95)); // corps bleu nuit
      ps.forEach(p =>
        puff(
          g,
          p.x - p.r * 0.25,
          p.y - p.r * 0.32,
          p.r * 0.5,
          isWarm ? '255,170,110' : '90,140,220',
          isWarm ? 0.65 : 0.4
        )
      ); // lumière
      return c;
    }

    const cool = [0, 1, 2, 3].map(i => sprite(i * 331 + 7, false));
    const warm = [0, 1].map(i => sprite(i * 577 + 99, true));

    const clouds = [
      // arrière-plan (petits, sombres, lents)
      { s: cool[0], x: 0.2, y: 0.12, w: 0.55, v: 0.004, a: 0.55, l: 0.2 },
      { s: cool[1], x: 0.7, y: 0.08, w: 0.6, v: 0.003, a: 0.5, l: 0.2 },
      { s: cool[2], x: 0.5, y: 0.55, w: 0.5, v: 0.004, a: 0.35, l: 0.3 },
      // milieu
      { s: cool[3], x: 0.02, y: 0.28, w: 0.42, v: 0.006, a: 0.85, l: 0.6 },
      { s: cool[1], x: 0.92, y: 0.3, w: 0.3, v: 0.005, a: 0.5, l: 0.5 },
      { s: cool[2], x: 0.88, y: 0.72, w: 0.55, v: 0.007, a: 0.95, l: 0.9 },
      // premier plan (grands, bas, éclairés en orange à gauche)
      { s: warm[0], x: 0.02, y: 0.86, w: 0.7, v: 0.005, a: 1, l: 1.2 },
      { s: warm[1], x: 0.3, y: 0.98, w: 0.62, v: 0.004, a: 0.9, l: 1.4 }
    ];

    const stars: { x: number; y: number; r: number; f: number; p: number }[] = [];
    {
      const r = rng(21);
      for (let i = 0; i < 90; i++) {
        stars.push({
          x: r(),
          y: r() * 0.7,
          r: 0.3 + r() * 0.9,
          f: 0.6 + r() * 2,
          p: r() * 6.28
        });
      }
    }

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      if (cv) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
    }
    resize();
    window.addEventListener('resize', resize);

    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    let active = false;

    const handlePointerMove = (e: PointerEvent) => {
      active = true;
      tx = (e.clientX / W - 0.5) * 2;
      ty = (e.clientY / H - 0.5) * 2;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let t0 = performance.now();
    let last = t0;

    function render(now: number) {
      if (!ctx) return;
      const context = ctx;
      const t = (now - t0) / 1000;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const gx = active ? tx : Math.sin(t * 0.25) * 0.6;
      const gy = active ? ty : Math.cos(t * 0.2) * 0.2;
      px += (gx - px) * Math.min(1, dt * 2.5);
      py += (gy - py) * Math.min(1, dt * 2.5);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = context.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#02060f');
      bg.addColorStop(0.6, '#061226');
      bg.addColorStop(1, '#0a1c3a');
      context.fillStyle = bg;
      context.fillRect(0, 0, W, H);

      // Étoiles discrètes
      for (const s of stars) {
        context.fillStyle = `rgba(190,215,255,${0.15 + 0.35 * Math.abs(Math.sin(t * s.f + s.p))})`;
        context.beginPath();
        context.arc(s.x * W + px * 3, s.y * H, s.r, 0, 7);
        context.fill();
      }

      // Lueur chaude en bas à gauche
      const wg = context.createRadialGradient(0, H, 0, 0, H, Math.max(W, H) * 0.6);
      wg.addColorStop(0, 'rgba(255,150,90,.28)');
      wg.addColorStop(1, 'rgba(255,150,90,0)');
      context.fillStyle = wg;
      context.fillRect(0, 0, W, H);

      // Nuages en dérive lente avec parallaxe
      const base = Math.max(W, 420);
      for (const c of clouds) {
        const w = base * c.w;
        const h = (w * 300) / 560;
        const u = (((c.x + t * c.v) % 1.5) + 1.5) % 1.5;
        const x = (u - 0.25) * W - w / 2 + px * 22 * c.l;
        const y = c.y * H - h / 2 + py * 10 * c.l + Math.sin(t * 0.3 + c.x * 9) * 4 * c.l;
        context.globalAlpha = c.a;
        context.drawImage(c.s, x, y, w, h);
      }
      context.globalAlpha = 1;

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [visible]);

  if (!visible) return null;

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onFinished) onFinished();
    }, 250);
  };

  const word1 = 'Instant';
  const word2 = 'Météo';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[99999] select-none overflow-hidden transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      } ${isGo ? 'go' : ''}`}
      style={{
        background: '#030913',
        color: '#ffffff',
        fontFamily: '"SF Pro Display",Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'
      }}
    >
      <style>{`
        :root {
          --neon: #2f86ff;
          --neon-light: #8fd8ff;
          --warm: #ffb27a;
          --size: min(46vw, 46vh, 300px);
        }
        .sky-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .splash-vignette {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(1,5,14,.75) 100%);
        }
        .splash-stage {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(14px, 3vh, 28px);
          padding-bottom: 4vh;
        }

        /* ---------- Icône ---------- */
        .splash-icon {
          position: relative;
          width: var(--size);
          height: var(--size);
          opacity: 0;
          transform: scale(.92);
        }
        .go .splash-icon {
          animation: iconIn 1.2s cubic-bezier(.2,.8,.2,1) .1s forwards, float 6s ease-in-out 2.5s infinite;
        }
        @keyframes iconIn { to { opacity: 1; transform: scale(1); } }
        @keyframes float { 50% { transform: translateY(-8px); } }

        .splash-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          filter: drop-shadow(0 0 5px rgba(80,170,255,.9)) drop-shadow(0 0 18px rgba(30,110,255,.65)) drop-shadow(0 0 40px rgba(20,80,255,.35));
        }
        .splash-line {
          fill: none;
          stroke: url(#neon-splash);
          stroke-linecap: round;
        }
        .splash-base {
          stroke-width: 2.2;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }
        .go .splash-base {
          animation: draw 2.4s cubic-bezier(.6,.05,.2,1) .2s forwards;
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }

        .splash-comet {
          stroke: #e9f8ff;
          stroke-width: 3.4;
          stroke-dasharray: .1 .9;
          stroke-dashoffset: 0;
          opacity: 0;
        }
        .go .splash-comet {
          animation: orbit 3.2s linear 2.2s infinite, cometIn .8s ease 2.2s forwards;
        }
        @keyframes orbit { to { stroke-dashoffset: -1; } }
        @keyframes cometIn { to { opacity: 1; } }

        /* halo qui respire derrière le cadre */
        .splash-icon::before {
          content: "";
          position: absolute;
          inset: -14%;
          border-radius: 36%;
          background: radial-gradient(circle, rgba(40,120,255,.28), rgba(40,120,255,0) 65%);
          opacity: 0;
        }
        .go .splash-icon::before {
          animation: halo 4s ease-in-out 1.8s infinite;
        }
        @keyframes halo {
          0%, 100% { opacity: .35; transform: scale(.96); }
          50% { opacity: .9; transform: scale(1.05); }
        }

        /* ---------- Pictogramme ---------- */
        .splash-glyph {
          position: absolute;
          inset: 22%;
          width: 56%;
          height: 56%;
          overflow: visible;
          filter: drop-shadow(0 0 10px rgba(255,190,110,.5));
        }
        .splash-sun {
          fill: #ffd36a;
        }
        .splash-rays path {
          fill: none;
          stroke: #ffd36a;
          stroke-width: 3;
          stroke-linecap: round;
        }
        .splash-cloud {
          fill: #dbeaff;
          stroke: #8fd8ff;
          stroke-width: 1.5;
        }
        .splash-glyph > * {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
        }
        .go .splash-sun {
          animation: pop .8s cubic-bezier(.2,1.4,.3,1) 2.3s forwards;
        }
        .go .splash-rays {
          animation: pop .8s ease 2.5s forwards, spin 14s linear 3.3s infinite;
          transform-origin: 40px 38px;
          transform-box: view-box;
        }
        .go .splash-cloud {
          animation: cloudIn 1s cubic-bezier(.2,.9,.2,1) 2.7s forwards;
        }
        @keyframes pop {
          from { opacity: 0; transform: scale(.4); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes cloudIn {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: none; }
        }

        /* ---------- Texte ---------- */
        .splash-title {
          display: flex;
          gap: .28em;
          font-weight: 800;
          letter-spacing: -.02em;
          line-height: 1;
          font-size: clamp(30px, min(9vw, 8vh), 64px);
        }
        .splash-title .w {
          display: inline-flex;
        }
        .splash-title .l {
          display: inline-block;
          opacity: 0;
          color: #eaf4ff;
          text-shadow: 0 0 24px rgba(60,140,255,.55);
        }
        .splash-title .accent .l {
          color: #9fdcff;
        }
        .go .splash-title .l {
          animation: letter .9s cubic-bezier(.2,.9,.2,1) both;
          animation-delay: calc(3s + var(--i) * 55ms);
        }
        @keyframes letter {
          from {
            opacity: 0;
            transform: translateY(22px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: none;
            filter: blur(0);
          }
        }

        .splash-tag {
          font-size: clamp(11px, 2.8vw, 15px);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .6em;
          color: #9db6d6;
          opacity: 0;
        }
        .go .splash-tag {
          animation: tag 1.4s ease 3.8s forwards;
        }
        @keyframes tag {
          from { opacity: 0; letter-spacing: .7em; }
          to { opacity: .85; letter-spacing: .34em; }
        }

        .splash-skip-btn {
          position: fixed;
          top: max(16px, env(safe-area-inset-top));
          right: max(16px, env(safe-area-inset-right));
          z-index: 20;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.2);
          color: #cfe0f5;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: background .2s, transform .1s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .splash-skip-btn:hover {
          background: rgba(255,255,255,.16);
        }
        .splash-skip-btn:active {
          transform: scale(.96);
        }

        @media (prefers-reduced-motion: reduce) {
          .go .splash-icon,
          .go .splash-icon::before,
          .go .splash-comet,
          .go .splash-rays {
            animation-duration: .01s !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      {/* Canvas Sky with Procedural Volumetric Clouds & Twinkling Stars */}
      <canvas ref={canvasRef} className="sky-canvas" aria-hidden="true" />
      <div className="splash-vignette" aria-hidden="true" />

      {/* Top Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="splash-skip-btn"
        title="Accéder directement à l'application"
      >
        <span>Passer</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Main Stage */}
      <main className="splash-stage" id="stage" onClick={handleSkip}>
        <div className="splash-icon">
          {/* Cadre néon */}
          <svg className="splash-frame" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="neon-splash" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8fd8ff" />
                <stop offset="0.5" stopColor="#2f86ff" />
                <stop offset="1" stopColor="#7fe3ff" />
              </linearGradient>
            </defs>
            <rect className="splash-line splash-base" x="20" y="20" width="160" height="160" rx="48" pathLength={1} />
            <rect className="splash-line splash-comet" x="20" y="20" width="160" height="160" rx="48" pathLength={1} />
          </svg>

          {/* Pictogramme météo */}
          <svg className="splash-glyph" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="splash-sun" cx="40" cy="38" r="13" />
            <g className="splash-rays">
              <path d="M40 14v6M40 56v6M16 38h6M58 38h6M23 21l4 4M57 55l4 4M23 55l4-4M57 21l4-4" />
            </g>
            <path className="splash-cloud" d="M34 72h38a12 12 0 0 0 1.5-23.9A17 17 0 0 0 41 52a10 10 0 0 0-7 20z" />
          </svg>
        </div>

        {/* Titre lettre par lettre */}
        <h1 className="splash-title" aria-label="Instant Météo">
          <span className="w">
            {word1.split('').map((ch, idx) => (
              <span key={idx} className="l" aria-hidden="true" style={{ ['--i' as any]: idx }}>
                {ch}
              </span>
            ))}
          </span>
          <span className="w accent">
            {word2.split('').map((ch, idx) => (
              <span key={idx} className="l" aria-hidden="true" style={{ ['--i' as any]: word1.length + idx }}>
                {ch}
              </span>
            ))}
          </span>
        </h1>

        {/* Tagline */}
        <p className="splash-tag">La météo, à l'instant</p>
      </main>
    </div>
  );
};
