import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Smartphone, 
  RefreshCw, 
  Wind, 
  CloudRain, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Home,
  Check,
  Share2,
  Tv
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { getRichWeatherInfo } from '../utils/weatherIcons';

interface FloatingWeatherBubbleProps {
  station: LocationPoint;
  weather: CurrentWeather;
  tempUnit: 'C' | 'F';
  onClose: () => void;
  onOpenDetails?: () => void;
  onClick?: () => void;
  onOpenSearchModal?: () => void;
  onRefresh?: () => void;
}

export const FloatingWeatherBubble: React.FC<FloatingWeatherBubbleProps> = ({
  station,
  weather,
  tempUnit,
  onClose,
  onOpenDetails,
  onClick,
  onOpenSearchModal,
  onRefresh
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isVideoPipActive, setIsVideoPipActive] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const weatherInfo = getRichWeatherInfo(weather.weatherCode, weather.isDay ?? true, weather.precipitation, weather.windGust);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°C`;
  };

  // Clock string update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for beforeinstallprompt event for PWA / Home Screen
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // 1. TOUCH & MOUSE DRAGGING FOR IN-APP BUBBLE
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    setHasMoved(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
    setHasMoved(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    setHasMoved(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
      setHasMoved(true);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 2. CANVAS RENDERING ENGINE (For Video PiP on mobile / fallback)
  const drawCanvasFrame = () => {
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 300;
      canvasRef.current = canvas;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rounded rectangle background with deep sapphire gradient
    const r = 28;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(canvas.width - r, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
    ctx.lineTo(canvas.width, canvas.height - r);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
    ctx.lineTo(r, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0c1424');
    grad.addColorStop(0.5, '#071533');
    grad.addColorStop(1, '#0e2247');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle cyan aura
    const glow = ctx.createRadialGradient(canvas.width * 0.75, 80, 10, canvas.width * 0.75, 80, 200);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
    ctx.restore();

    // Top Header: Station Name & Live Indicator
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`📍 ${station.name.toUpperCase()}`, 28, 48);

    // Live Pill
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(canvas.width - 130, 42, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('EN DIRECT', canvas.width - 116, 48);

    // Big Temperature
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 86px system-ui, sans-serif';
    ctx.fillText(formatTemp(weather.temperature), 28, 150);

    // Weather Emoji / Icon Orb
    ctx.font = '72px system-ui, sans-serif';
    ctx.fillText(weatherInfo.emoji || '☀️', canvas.width - 125, 150);

    // Weather condition description
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(weatherInfo.shortLabel || weather.weatherDescription, 28, 195);

    // Bottom row: Wind, Rain & Live Time
    ctx.fillStyle = '#64748b';
    ctx.font = '600 18px system-ui, sans-serif';
    const detailLine = `💨 ${weather.windSpeed} km/h   💧 ${weather.precipitation} mm   🕒 ${currentTimeStr}`;
    ctx.fillText(detailLine, 28, 252);

    // Subtitle
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('Bulle Instant Météo • Écran d\'Accueil / Bureau', 28, 280);
  };

  // Continuous canvas redraw when video PiP is active
  useEffect(() => {
    if (!isVideoPipActive) return;
    const loop = () => {
      drawCanvasFrame();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVideoPipActive, weather, station, currentTimeStr]);

  // 3. LAUNCH PICTURE-IN-PICTURE (Sortir la bulle de l'application)
  const handlePopoutBubble = async () => {
    // Attempt 1: Modern Document Picture-in-Picture API (Chrome 116+, Edge, Android Chrome)
    const dPip = (window as any).documentPictureInPicture;
    if (dPip && typeof dPip.requestWindow === 'function') {
      try {
        const pip = await dPip.requestWindow({
          width: 320,
          height: 140,
          disallowReturnToOpener: false
        });

        // Inject high-precision styling into external window
        const style = pip.document.createElement('style');
        style.textContent = `
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
            background: #020617;
            color: white;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
            user-select: none;
            padding: 6px;
          }
          .ext-card {
            width: 100%;
            height: 100%;
            border-radius: 18px;
            background: linear-gradient(135deg, #0c1424 0%, #061633 50%, #0d234a 100%);
            border: 1.5px solid rgba(56, 189, 248, 0.5);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 10px 14px;
            cursor: pointer;
          }
          .ext-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .ext-station {
            font-size: 11px;
            font-weight: 800;
            color: #38bdf8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
          }
          .ext-live {
            font-size: 9px;
            font-weight: 900;
            padding: 2px 6px;
            border-radius: 9999px;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.5);
            color: #34d399;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .ext-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
          }
          .ext-center {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .ext-temp {
            font-size: 34px;
            font-weight: 900;
            line-height: 1;
            color: #ffffff;
            letter-spacing: -1px;
          }
          .ext-desc {
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            margin-top: 2px;
          }
          .ext-emoji {
            font-size: 30px;
            line-height: 1;
          }
          .ext-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 4px;
          }
          .ext-btn {
            background: rgba(56, 189, 248, 0.2);
            border: 1px solid rgba(56, 189, 248, 0.4);
            color: #38bdf8;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 6px;
            cursor: pointer;
          }
          .ext-btn:hover {
            background: #38bdf8;
            color: #020617;
          }
        `;
        pip.document.head.appendChild(style);

        setPipWindow(pip);
        setIsPipActive(true);

        pip.addEventListener('pagehide', () => {
          setIsPipActive(false);
          setPipWindow(null);
        });
        return;
      } catch (err) {
        console.warn('Document Picture-in-Picture error:', err);
      }
    }

    // Attempt 2: Universal Video Picture-in-Picture with Canvas stream
    try {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        canvasRef.current = canvas;
      }
      drawCanvasFrame();

      let video = videoRef.current;
      if (!video) {
        video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
        document.body.appendChild(video);
        videoRef.current = video;
      }

      const stream = canvas.captureStream(15);
      video.srcObject = stream;
      await video.play();

      if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        setIsVideoPipActive(true);

        video.addEventListener('leavepictureinpicture', () => {
          setIsVideoPipActive(false);
        }, { once: true });
        return;
      }
    } catch (videoPipErr) {
      console.warn('Video Picture-in-Picture failed:', videoPipErr);
    }

    // Attempt 3: Standalone Popup Window (works in all browsers without PiP permission)
    try {
      const bubbleUrl = `/?mini_bubble=true&station=${encodeURIComponent(station.name)}`;
      const newWin = window.open(
        bubbleUrl,
        'MeteoBubbleWindow',
        'width=380,height=180,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      );
      if (newWin) {
        newWin.focus();
        return;
      }
    } catch (popupErr) {
      console.warn('Popup window fallback:', popupErr);
    }

    // Attempt 4: If browser blocks window.open, offer direct Home Screen install guide
    setShowInstallGuide(true);
  };

  // 4. INSTALL ON HOME SCREEN HANDLER
  const handleInstallToHomeScreen = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallSuccess(true);
          setTimeout(() => setInstallSuccess(false), 3000);
        }
        setDeferredPrompt(null);
      } catch (e) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      {/* 1. In-App Floating Draggable Bubble (When not hidden) */}
      <aside
        role="complementary"
        aria-label="Bulle météo interactive flottante et détachable"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none'
        }}
        className="fixed bottom-24 right-4 z-50 select-none animate-in fade-in zoom-in-95 duration-200 cursor-grab active:cursor-grabbing"
      >
        <div
          id="floating-weather-bubble-card"
          className="group relative flex flex-col rounded-3xl bg-[#0c1424]/95 border-2 border-sky-400/80 shadow-2xl shadow-sky-500/35 backdrop-blur-2xl transition-all"
        >
          {/* Main Bubble Pill Bar */}
          <div 
            onClick={() => {
              if (!hasMoved) setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer"
          >
            {/* Pulsing Aura */}
            <div className="absolute inset-0 rounded-3xl bg-sky-400/15 blur-md -z-10" />

            {/* Weather Emoji / Orb */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border border-yellow-200/70 flex items-center justify-center text-lg shadow-md shrink-0">
              <span className="leading-none drop-shadow">{weatherInfo.emoji || '☀️'}</span>
            </div>

            {/* Station and Temperature */}
            <div className="flex flex-col text-left pr-1 min-w-[75px] max-w-[140px]">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sky-300 truncate">
                <MapPin className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                <span className="truncate">{station.name}</span>
              </div>
              <div className="text-sm font-black text-white leading-tight tabular-nums flex items-baseline gap-1">
                <span>{formatTemp(weather.temperature)}</span>
                <span className="text-[10px] text-slate-300 font-semibold truncate hidden xs:inline">
                  • {weatherInfo.shortLabel}
                </span>
              </div>
            </div>

            {/* Quick Action: Pop out to Home Screen / External Desktop */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePopoutBubble();
              }}
              className="p-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-400/40 transition active:scale-90 shrink-0 shadow-sm"
              title="Sortir la bulle de l'application (Fenêtre flottante extérieure / Écran d'accueil)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Quick Action: Add to Home Screen Widget */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleInstallToHomeScreen();
              }}
              className="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-400/40 transition active:scale-90 shrink-0 shadow-sm"
              title="Mettre le widget météo sur la page d'accueil de votre téléphone"
            >
              <Home className="w-3.5 h-3.5" />
            </button>

            {/* Expand / Collapse Chevron */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 text-slate-400 hover:text-white transition"
              title={isExpanded ? 'Réduire' : 'Développer'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-5 h-5 rounded-full bg-slate-800/80 hover:bg-rose-500 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700/60 shadow shrink-0"
              title="Fermer la bulle météo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Expanded Tray with Complete Controls & Instructions */}
          {isExpanded && (
            <div className="px-3.5 pb-3 pt-1 border-t border-slate-800/80 space-y-2.5 text-xs animate-in fade-in duration-150">
              {/* Secondary Weather Metrics */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-400" />
                  <span>{weather.windSpeed} km/h</span>
                </span>
                <span className="flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" />
                  <span>{weather.precipitation > 0 ? `${weather.precipitation} mm` : `${weather.humidity}% hum.`}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  ● {currentTimeStr}
                </span>
              </div>

              {/* Two Primary Action Buttons */}
              <div className="grid grid-cols-1 gap-2 pt-0.5">
                {/* 1. Sortir la bulle de l'application */}
                <button
                  type="button"
                  onClick={handlePopoutBubble}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition cursor-pointer border border-sky-300/40"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Sortir la bulle de l'application (PiP)</span>
                </button>

                {/* 2. Mettre sur la page d'accueil (Écran d'accueil) */}
                <button
                  type="button"
                  onClick={handleInstallToHomeScreen}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-400/50 text-slate-200 hover:text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mettre sur la page d'accueil (Widget)</span>
                </button>
              </div>

              {/* Status Indicator */}
              {(isPipActive || isVideoPipActive) && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Bulle active hors de l'application</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">Flotte sur l'écran</span>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 2. React Portal for Document Picture-in-Picture External Floating Window */}
      {isPipActive && pipWindow && createPortal(
        <div 
          className="ext-card"
          onClick={() => {
            window.focus();
            if (onOpenDetails) onOpenDetails();
          }}
          title="Cliquez pour revenir à l'application"
        >
          {/* Header Row */}
          <div className="ext-top">
            <div className="ext-station">
              <span>📍</span>
              <span>{station.name}</span>
            </div>
            <div className="ext-live">
              <span className="ext-dot" />
              <span>EN DIRECT</span>
            </div>
          </div>

          {/* Center Row */}
          <div className="ext-center">
            <div>
              <div className="ext-temp">{formatTemp(weather.temperature)}</div>
              <div className="ext-desc">{weatherInfo.shortLabel}</div>
            </div>
            <div className="ext-emoji">{weatherInfo.emoji || '☀️'}</div>
          </div>

          {/* Bottom Row */}
          <div className="ext-bottom">
            <span>💨 {weather.windSpeed} km/h • 💧 {weather.precipitation > 0 ? `${weather.precipitation} mm` : `${weather.humidity}%`}</span>
            <button
              className="ext-btn"
              onClick={(e) => {
                e.stopPropagation();
                window.focus();
              }}
            >
              Ouvrir l'app
            </button>
          </div>
        </div>,
        pipWindow.document.body
      )}

      {/* 3. Modal Guide : Mettre la bulle / widget sur la page d'accueil (Écran d'accueil) */}
      {showInstallGuide && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowInstallGuide(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#0c1424] border-2 border-sky-400/80 p-6 shadow-2xl space-y-5 text-white"
          >
            {/* Title Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Mettre sur l'Écran d'Accueil
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Accédez à la météo de {station.name} directement depuis votre téléphone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Native 1-Click Button if browser supports beforeinstallprompt */}
            {deferredPrompt && (
              <button
                onClick={handleInstallToHomeScreen}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-sky-500/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Installer le Widget sur l'Écran d'Accueil en 1 Clic</span>
              </button>
            )}

            {/* Platform Instructions */}
            <div className="space-y-3 text-xs">
              {/* iPhone / Safari */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-300">
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span>Sur iPhone &amp; iPad (Safari) :</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Appuyez sur le bouton <strong>Partager</strong> (carré avec flèche vers le haut ⎋) en bas de Safari.</li>
                  <li>Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong> (icône ⊞).</li>
                  <li>Cliquez sur <strong>« Ajouter »</strong> : la bulle et l'icône Instant Météo s'installent directement sur votre page d'accueil !</li>
                </ol>
              </div>

              {/* Android / Chrome */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Sur Téléphones Android (Chrome / Samsung) :</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Appuyez sur le menu <strong>(les 3 points ⋮)</strong> en haut à droite.</li>
                  <li>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
                  <li>Validez pour épingler le widget météo en accès direct sur votre écran d'accueil !</li>
                </ol>
              </div>

              {/* Desktop Picture-in-Picture */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Tv className="w-4 h-4 text-amber-400" />
                  <span>Sur Ordinateur (Windows / Mac) :</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Utilisez le bouton <strong>« Sortir la bulle de l'application »</strong> : une mini-fenêtre Picture-in-Picture s'ouvrira et restera visible en permanence au-dessus de votre Bureau et de vos logiciels !
                </p>
              </div>
            </div>

            {/* Bottom Dismiss */}
            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
