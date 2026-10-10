import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Square,
  Share2,
  FileText
} from 'lucide-react';
import { CurrentWeather, DailyForecast, HourlyForecast, LocationPoint } from '../types/weather';

interface MorningAudioBriefingCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  tempUnit?: 'C' | 'F';
  onOpenShareCard?: () => void;
  onOpenShareCardModal?: () => void;
}

export const MorningAudioBriefingCard: React.FC<MorningAudioBriefingCardProps> = ({
  station,
  weather,
  daily,
  onOpenShareCard,
  onOpenShareCardModal
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  const handleOpenShare = onOpenShareCard || onOpenShareCardModal;

  const briefingText = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const greeting =
      hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    const today = daily[0];
    const tomorrow = daily[1];
    const past24 = weather.pastHourly?.find((p) => p.hoursAgo === 24) || weather.pastHourly?.[0];
    const deltaYesterday = past24
      ? Number((weather.temperature - past24.temperature).toFixed(1))
      : 0;

    const deltaPhrase =
      Math.abs(deltaYesterday) >= 0.8
        ? `Il fait ${Math.abs(deltaYesterday)} degrés de ${
            deltaYesterday > 0 ? 'plus' : 'moins'
          } qu'hier à la même heure.`
        : `La température est très proche de celle d'hier à la même heure.`;

    const rainPhrase =
      weather.precipitation > 0
        ? `Des précipitations sont actuellement observées avec une intensité de ${weather.precipitation} millimètres par heure.`
        : weather.nowcasting3h?.hasPrecipitationIn3h
          ? `Attention, des précipitations sont attendues dans les 3 prochaines heures, vers ${weather.nowcasting3h.startTimeFormatted}.`
          : `Le temps reste sec sur les 3 prochaines heures, aucune pluie n'est détectée au radar.`;

    const windPhrase =
      weather.windSpeed >= 30
        ? `Le vent est soutenu à ${Math.round(weather.windSpeed)} kilomètres heure, avec des rafales atteignant ${Math.round(weather.windGust)} kilomètres heure.`
        : `Le vent souffle à ${Math.round(weather.windSpeed)} kilomètres heure.`;

    const pollenRisk = weather.pollenData?.overallStatusLabel || 'faible';
    const sunInfo = weather.solarEphemeris
      ? `Le soleil se couche à ${weather.solarEphemeris.sunset}, pour une durée du jour de ${weather.solarEphemeris.dayLengthFormatted}.`
      : '';

    const tomorrowPhrase = tomorrow
      ? `Pour demain à ${station.name}, le temps sera ${tomorrow.weatherDescription.toLowerCase()}, avec des températures comprises entre ${tomorrow.tempMin} et ${tomorrow.tempMax} degrés.`
      : '';

    return `${greeting}, voici votre bulletin météo complet en direct pour ${station.name}, située à ${station.altitude || 80} mètres d'altitude. Actuellement, le ciel est ${weather.weatherDescription.toLowerCase()} avec une température relevée de ${weather.temperature} degrés et un ressenti de ${weather.feelsLike} degrés. ${deltaPhrase} Aujourd'hui, les températures évoluent entre ${today?.tempMin ?? weather.tempMin} degrés au plus frais et ${today?.tempMax ?? weather.tempMax} degrés au meilleur de la journée. ${rainPhrase} ${windPhrase} L'humidité relative est de ${weather.humidity} pourcent, l'indice UV atteint ${weather.uvIndex}, et le risque allergique lié au pollen est ${pollenRisk.toLowerCase()}. ${sunInfo} ${tomorrowPhrase} Excellente journée sur Instant Météo !`;
  }, [station, weather, daily]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [station.id]);

  const handlePlayBriefing = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(briefingText);
    utterance.lang = 'fr-FR';
    utterance.rate = speechRate;
    utterance.pitch = 1.02;

    const voices = window.speechSynthesis.getVoices();
    const frVoice =
      voices.find((v) => v.lang.startsWith('fr') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Thomas') || v.name.includes(' Denise'))) ||
      voices.find((v) => v.lang.startsWith('fr'));
    if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseBriefing = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStopBriefing = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="rounded-xl border border-slate-800/90 bg-[#0a1220]/95 p-5 shadow-md flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <Volume2 className="h-3.5 w-3.5 shrink-0" />
              <span>Synthèse vocale francophone</span>
              {isPlaying && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold">Lecture en cours</span>
                </>
              )}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Bulletin Audio de {station.name}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Point complet sur le direct, l&apos;écart avec hier, la pluie dans les 3h, le vent, l&apos;UV et la tendance de demain.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handlePlayBriefing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{isPaused ? 'Reprendre la lecture' : 'Écouter le bulletin'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePauseBriefing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Pause className="h-3.5 w-3.5 fill-slate-950" />
              <span>Pause</span>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={handleStopBriefing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Square className="h-3 w-3 fill-rose-300" />
              <span>Arrêter</span>
            </button>
          )}

          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-mono tabular-nums">
            {[0.9, 1.0, 1.15].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSpeechRate(r)}
                className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                  speechRate === r
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>{showTranscript ? 'Masquer le script' : 'Afficher le script'}</span>
          </button>

          {handleOpenShare && (
            <button
              type="button"
              onClick={handleOpenShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 hover:text-sky-200 font-semibold text-xs transition cursor-pointer whitespace-nowrap shrink-0 ml-auto"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Carte partageable</span>
            </button>
          )}
        </div>
      </div>

      {showTranscript && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          <div className="text-[11px] font-semibold text-sky-400 mb-1">
            Transcription du bulletin — {station.name}
          </div>
          <p>« {briefingText} »</p>
        </div>
      )}
    </div>
  );
};
