import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Share2, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { CurrentWeather, DailyForecast, LocationPoint } from '../types/weather';
import { getRichWeatherInfo } from '../utils/weatherIcons';

interface ShareableWeatherCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LocationPoint;
  weather: CurrentWeather;
  daily: DailyForecast[];
  tempUnit: 'C' | 'F';
}

type CardFormat = 'landscape' | 'story';
type CardTheme = 'midnight' | 'ocean' | 'sunset';

export const ShareableWeatherCardModal: React.FC<ShareableWeatherCardModalProps> = ({
  isOpen,
  onClose,
  station,
  weather,
  daily,
  tempUnit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [format, setFormat] = useState<CardFormat>('landscape');
  const [theme, setTheme] = useState<CardTheme>('midnight');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const formatTemp = (c: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(((c * 9) / 5 + 32) * 10) / 10}°F`;
    }
    return `${c}°C`;
  };

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = format === 'landscape' ? 1200 : 900;
    const height = format === 'landscape' ? 675 : 1400;
    canvas.width = width;
    canvas.height = height;

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'midnight') {
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
    } else if (theme === 'ocean') {
      grad.addColorStop(0, '#042f2e');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#083344');
    } else {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#31102f');
      grad.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle decorative glow circles
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.22, 240, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.07)';
    ctx.beginPath();
    ctx.arc(width * 0.18, height * 0.78, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Border frame
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    const pad = 64;
    const nowStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const info = getRichWeatherInfo(weather.weatherCode, weather.isDay ?? true);

    // Header brand
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('⚡ INSTANT MÉTÉO • BULLETIN CERTIFIÉ EN DIRECT', pad, pad + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${nowStr.toUpperCase()} • ${timeStr}`, pad, pad + 52);

    // Station Name & Sub-info
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px system-ui, -apple-system, sans-serif';
    ctx.fillText(station.name, pad, pad + 130);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `📍 ${station.department || station.country || 'France'} • Altitude : ${station.altitude || 75} m`,
      pad,
      pad + 172
    );

    // Massive Temperature & Weather Emoji
    const mainY = format === 'landscape' ? pad + 310 : pad + 340;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 135px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${ info.emoji } ${formatTemp(weather.temperature)}`, pad, mainY);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.fillText(weather.weatherDescription, pad, mainY + 52);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    const todayMin = daily[0]?.tempMin ?? weather.tempMin;
    const todayMax = daily[0]?.tempMax ?? weather.tempMax;
    ctx.fillText(
      `Ressenti : ${formatTemp(weather.feelsLike)}   •   Min : ${formatTemp(todayMin)}   •   Max : ${formatTemp(todayMax)}`,
      pad,
      mainY + 95
    );

    // Metrics Grid Boxes
    const metrics = [
      { label: 'HUMIDITÉ', value: `${weather.humidity}%` },
      { label: 'VENT & RAFALES', value: `${Math.round(weather.windSpeed)} / ${Math.round(weather.windGust)} km/h` },
      { label: 'PRESSION BARO', value: `${Math.round(weather.pressure)} hPa` },
      { label: 'INDICE UV', value: `${weather.uvIndex} / 12` },
      { label: 'QUALITÉ DE L\'AIR', value: `${weather.airQualityLabel} (${weather.airQualityAqi})` },
      {
        label: 'SOLEIL (LEVER / COUCHER)',
        value: `${weather.solarEphemeris?.sunrise || '07:30'} ➔ ${weather.solarEphemeris?.sunset || '19:30'}`
      }
    ];

    const cols = format === 'landscape' ? 3 : 2;
    const boxW = (width - pad * 2 - (cols - 1) * 20) / cols;
    const boxH = 100;
    const startGridY = format === 'landscape' ? height - 275 : mainY + 150;

    metrics.forEach((m, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const bx = pad + col * (boxW + 20);
      const by = startGridY + row * (boxH + 18);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.label, bx + 20, by + 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.value, bx + 20, by + 76);
    });

    // If Story format, also render 4-day outlook at the bottom
    if (format === 'story' && daily.length > 1) {
      const forecastY = startGridY + 3 * (boxH + 18) + 35;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText('PRÉVISIONS DES PROCHAINS JOURS', pad, forecastY);

      daily.slice(1, 5).forEach((d, idx) => {
        const fy = forecastY + 25 + idx * 72;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(pad, fy, width - pad * 2, 58);
        const dInfo = getRichWeatherInfo(d.weatherCode, true);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(`${dInfo.emoji}  ${d.dayLabel}`, pad + 20, fy + 37);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(d.weatherDescription, pad + 230, fy + 37);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(`${formatTemp(d.tempMin)} / ${formatTemp(d.tempMax)}`, width - pad - 180, fy + 37);
      });
    }

    // Footer signature
    ctx.fillStyle = '#64748b';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      'Instant Météo • Haute Précision Multi-Modèles (AROME, ECMWF, GFS) • France & Monde',
      pad,
      height - 38
    );
  }, [isOpen, format, theme, station, weather, daily, tempUnit]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Instant-Meteo-${station.name.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const handleShareNative = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current?.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], `meteo-${station.name}.png`, { type: 'image/png' });
        await navigator.share({
          title: `Météo en direct à ${station.name}`,
          text: `Météo à ${station.name} : ${weather.temperature}°C (${weather.weatherDescription})`,
          files: [file]
        });
        return;
      }
      if (blob && navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
        return;
      }
    } catch {}
    handleDownloadPng();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Studio de Carte Météo Partageable — {station.name}
              </h3>
              <p className="text-xs text-slate-400">
                Générez une carte météo haute définition pour Discord, Instagram, WhatsApp ou X
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Format :</span>
            <button
              type="button"
              onClick={() => setFormat('landscape')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                format === 'landscape'
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              Paysage / Discord (16:9)
            </button>
            <button
              type="button"
              onClick={() => setFormat('story')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                format === 'story'
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              Story Mobile (9:16)
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Thème :</span>
            {(
              [
                { id: 'midnight', label: 'Nuit Polaire' },
                { id: 'ocean', label: 'Océan Émeraude' },
                { id: 'sunset', label: 'Crépuscule Pourpre' }
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  theme === t.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="flex justify-center bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`rounded-lg shadow-xl border border-slate-800 ${
              format === 'landscape' ? 'w-full max-h-[340px] object-contain' : 'max-h-[420px] w-auto object-contain'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleShareNative}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            {copiedSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">Image copiée dans le presse-papiers !</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-sky-400" />
                <span>Partager / Copier l&apos;image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger la Carte (.PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
