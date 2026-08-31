import React, { useState } from 'react';
import { CloudRain, ExternalLink, X, Umbrella } from 'lucide-react';
import { CurrentWeather, DailyForecast, HourlyForecast } from '../types/weather';

import { AMAZON_AFFILIATE_LINKS } from '../config/affiliateLinks';

interface DynamicRainAffiliateBannerProps {
  weather: CurrentWeather | null;
  daily?: DailyForecast[];
  hourly?: HourlyForecast[];
  affiliateUrl?: string;
  seniorMode?: boolean;
}

/**
 * Checks if current or today's forecast matches rainy, stormy, or shower conditions.
 */
export function isRainOrStormExpected(
  weather: CurrentWeather | null,
  daily?: DailyForecast[],
  hourly?: HourlyForecast[]
): boolean {
  if (!weather && (!daily || daily.length === 0)) return false;

  const rainyKeywords = [
    'pluie',
    'averses',
    'averse',
    'orage',
    'orages',
    'orageux',
    'orageuse',
    'tempête',
    'tempete',
    'bruine',
    'précipitation',
    'precipitation',
    'pluvieux',
    'pluvieuse',
    'ondée',
    'ondee',
    'grêle',
    'grele',
    'grains'
  ];

  // 1. Check current weather description
  if (weather?.weatherDescription) {
    const desc = weather.weatherDescription.toLowerCase();
    if (rainyKeywords.some((kw) => desc.includes(kw))) {
      return true;
    }
  }

  // 2. Check current precipitation or weather code (WMO rain/shower/storm codes)
  if (weather) {
    if (weather.precipitation > 0.1) return true;
    // WMO Codes: 51-67 (Drizzle/Rain), 80-82 (Showers), 95-99 (Thunderstorms)
    if (
      (weather.weatherCode >= 51 && weather.weatherCode <= 67) ||
      (weather.weatherCode >= 80 && weather.weatherCode <= 82) ||
      (weather.weatherCode >= 95 && weather.weatherCode <= 99)
    ) {
      return true;
    }
  }

  // 3. Check today's daily forecast (index 0)
  if (daily && daily.length > 0) {
    const today = daily[0];
    if (today.weatherDescription) {
      const desc = today.weatherDescription.toLowerCase();
      if (rainyKeywords.some((kw) => desc.includes(kw))) {
        return true;
      }
    }
    if ((today.rainMm && today.rainMm >= 0.5) || (today.precipitationSumMm && today.precipitationSumMm >= 0.5)) {
      return true;
    }
    if (today.precipitationProbability && today.precipitationProbability >= 40) {
      return true;
    }
    if (
      (today.weatherCode >= 51 && today.weatherCode <= 67) ||
      (today.weatherCode >= 80 && today.weatherCode <= 82) ||
      (today.weatherCode >= 95 && today.weatherCode <= 99)
    ) {
      return true;
    }
  }

  // 4. Check today's next few hourly slots (first 12 hours)
  if (hourly && hourly.length > 0) {
    const nextHours = hourly.slice(0, 12);
    for (const h of nextHours) {
      if (h.rainMm && h.rainMm >= 0.3) return true;
      if (h.precipitationMm && h.precipitationMm >= 0.3) return true;
      if (h.precipitationProbability && h.precipitationProbability >= 50) return true;
      if (h.weatherDescription) {
        const desc = h.weatherDescription.toLowerCase();
        if (rainyKeywords.some((kw) => desc.includes(kw))) {
          return true;
        }
      }
      if (
        (h.weatherCode >= 51 && h.weatherCode <= 67) ||
        (h.weatherCode >= 80 && h.weatherCode <= 82) ||
        (h.weatherCode >= 95 && h.weatherCode <= 99)
      ) {
        return true;
      }
    }
  }

  return false;
}

export const DynamicRainAffiliateBanner: React.FC<DynamicRainAffiliateBannerProps> = ({
  weather,
  daily,
  hourly,
  affiliateUrl = AMAZON_AFFILIATE_LINKS.VICLOON_UMBRELLA,
  seniorMode = false
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const shouldShow = isRainOrStormExpected(weather, daily, hourly);

  if (!shouldShow || isDismissed) {
    return null;
  }

  return (
    <div
      id="amazon-dynamic-rain-banner"
      className="relative z-30 w-full bg-gradient-to-r from-sky-950/95 via-blue-900/90 to-indigo-950/95 border-b border-sky-400/40 shadow-lg backdrop-blur-md transition-all animate-fadeIn"
    >
      <div className="mx-auto max-w-[1720px] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-slate-100">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex-1 flex items-center gap-2.5 sm:gap-3.5 hover:text-white transition cursor-pointer min-w-0"
          title="Voir le Parapluie Pliant Automatique sur Amazon"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-400/30 group-hover:scale-105 group-hover:bg-sky-500/30 transition shadow-inner">
            <Umbrella className="h-4 w-4 sm:h-5 sm:w-5 text-sky-300 group-hover:text-white transition" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
            <p className={`font-semibold text-slate-100 group-hover:text-white leading-snug ${seniorMode ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
              🌧️ Des averses sont prévues aujourd'hui ! Restez au sec avec ce Parapluie Pliant Automatique ultra-résistant sur Amazon.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-sky-300 group-hover:text-sky-200 underline decoration-sky-400/50 underline-offset-2 shrink-0 mt-0.5 sm:mt-0">
              <span>Voir l'offre</span>
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </a>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 transition cursor-pointer"
            title="Fermer ce message"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
