import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Radio,
  Sparkles,
  Share2,
  FileText
} from 'lucide-react';
import { CurrentWeather, DailyForecast, HourlyForecast, LocationPoint } from '../types/weather';

interface MorningAudioBriefingCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  onOpenShareCardModal?: () => void;
}

export const MorningAudioBriefingCard: React.FC<MorningAudioBriefingCardProps> = ({
  station,
  weather,
  hourly,
  daily,
  onOpenShareCardModal
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

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
    <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-r from-slate-900 via-slate-900/95 to-blue-950/50 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Radio Studio Badge */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
              isPlaying
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
            }`}
          >
            <Volume2 className={`h-5 w-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Briefing Audio &amp; Synthèse Vocale
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Lecture vocale en cours...
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
              Écouter la Météo Parlée de {station.name}
            </h3>
            <p className="text-xs text-slate-400">
              Bulletin vocal complet : direct, comparaison hier, pluie, vent, UV, pollen et prévisions demain
            </p>
          </div>
        </div>

        {/* Right: Audio Controls + Shareable Weather Card Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handlePlayBriefing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{isPaused ? 'Reprendre le bulletin' : 'Écouter le briefing météo'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePauseBriefing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Pause className="h-4 w-4 fill-slate-950" />
              <span>Pause</span>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={handleStopBriefing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition cursor-pointer"
            >
              <Square className="h-3.5 w-3.5 fill-rose-300" />
              <span>Stop</span>
            </button>
          )}

          {/* Speed Selector */}
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5 text-[11px]">
            {[0.9, 1.0, 1.15].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSpeechRate(r)}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  speechRate === r
                    ? 'bg-sky-600 text-white'
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-sky-400" />
            <span>{showTranscript ? 'Masquer le texte' : 'Lire le script'}</span>
          </button>

          {onOpenShareCardModal && (
            <button
              type="button"
              onClick={onOpenShareCardModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Créer Carte Météo Partageable</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcript Box */}
      {showTranscript && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <span className="text-sky-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
              Transcription du Bulletin Vocal Officiel — {station.name}
            </span>
            « {briefingText} »
          </div>
        </div>
      )}
    </div>
  );
};
