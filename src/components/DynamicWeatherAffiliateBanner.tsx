import React, { useState } from 'react';
import { ExternalLink, X, Umbrella, Sun, Wind } from 'lucide-react';
import { CurrentWeather, DailyForecast, HourlyForecast } from '../types/weather';
import { AMAZON_AFFILIATE_LINKS } from '../config/affiliateLinks';

interface DynamicWeatherAffiliateBannerProps {
  weather: CurrentWeather | null;
  daily?: DailyForecast[];
  hourly?: HourlyForecast[];
  seniorMode?: boolean;
}

export type WeatherAffiliateCategory = 'rain' | 'heat' | 'wind' | 'none';

/**
 * Evaluates weather conditions to determine if an affiliate banner should be triggered:
 * 1. Rain / Thunderstorm: rain/showers/storm in description or WMO codes / precipitation
 * 2. High Heat / Clear Sun: temperature >= 25°C or strong sunny sky
 * 3. Strong Wind: wind gusts >= 40 km/h or wind speed >= 30 km/h or gale/storm
 */
export function getWeatherAffiliateCategory(
  weather: CurrentWeather | null,
  daily?: DailyForecast[],
  hourly?: HourlyForecast[]
): WeatherAffiliateCategory {
  if (!weather && (!daily || daily.length === 0)) return 'none';

  const rainyKeywords = [
    'pluie', 'averses', 'averse', 'orage', 'orages', 'orageux', 'orageuse',
    'tempête', 'tempete', 'bruine', 'précipitation', 'precipitation',
    'pluvieux', 'pluvieuse', 'ondée', 'ondee', 'grêle', 'grele', 'grains'
  ];

  const sunnyKeywords = [
    'ensoleillé', 'ensoleille', 'dégagé', 'degage', 'soleil', 'ciel clair', 'clair'
  ];

  const windyKeywords = [
    'vent', 'rafale', 'rafales', 'bourrasque', 'tempête', 'coup de vent'
  ];

  // 1. CHECK RAIN / STORMS FIRST (Priority 1)
  if (weather) {
    if (weather.precipitation > 0.1) return 'rain';
    if (
      (weather.weatherCode >= 51 && weather.weatherCode <= 67) ||
      (weather.weatherCode >= 80 && weather.weatherCode <= 82) ||
      (weather.weatherCode >= 95 && weather.weatherCode <= 99)
    ) {
      return 'rain';
    }
    if (weather.weatherDescription) {
      const desc = weather.weatherDescription.toLowerCase();
      if (rainyKeywords.some((kw) => desc.includes(kw))) return 'rain';
    }
  }

  if (daily && daily.length > 0) {
    const today = daily[0];
    if (today.weatherDescription) {
      const desc = today.weatherDescription.toLowerCase();
      if (rainyKeywords.some((kw) => desc.includes(kw))) return 'rain';
    }
    if ((today.rainMm && today.rainMm >= 0.5) || (today.precipitationProbability && today.precipitationProbability >= 40)) {
      return 'rain';
    }
    if (
      (today.weatherCode >= 51 && today.weatherCode <= 67) ||
      (today.weatherCode >= 80 && today.weatherCode <= 82) ||
      (today.weatherCode >= 95 && today.weatherCode <= 99)
    ) {
      return 'rain';
    }
  }

  // 2. CHECK STRONG WIND (Priority 2)
  const currentGusts = weather?.windGust || 0;
  const currentWindSpeed = weather?.windSpeed || 0;
  if (currentGusts >= 40 || currentWindSpeed >= 30) {
    return 'wind';
  }

  if (daily && daily.length > 0) {
    const today = daily[0];
    if (today.windGustMax && today.windGustMax >= 40) return 'wind';
    if (today.windSpeedMax && today.windSpeedMax >= 30) return 'wind';
    if (today.weatherDescription) {
      const desc = today.weatherDescription.toLowerCase();
      if (windyKeywords.some((kw) => desc.includes(kw))) return 'wind';
    }
  }

  if (hourly && hourly.length > 0) {
    const nextHours = hourly.slice(0, 8);
    for (const h of nextHours) {
      if ((h.windGust && h.windGust >= 40) || (h.windSpeed && h.windSpeed >= 30)) {
        return 'wind';
      }
    }
  }

  // 3. CHECK HIGH HEAT / SUN (Priority 3: > 25°C or clear sky)
  const currentTemp = weather?.temperature || 0;
  const maxTodayTemp = daily && daily.length > 0 ? daily[0].tempMax : currentTemp;

  if (currentTemp >= 25 || maxTodayTemp >= 25) {
    return 'heat';
  }

  if (weather?.weatherDescription) {
    const desc = weather.weatherDescription.toLowerCase();
    if (sunnyKeywords.some((kw) => desc.includes(kw)) && (currentTemp >= 20 || maxTodayTemp >= 20)) {
      return 'heat';
    }
  }

  if (weather && (weather.weatherCode === 0 || weather.weatherCode === 1) && (currentTemp >= 20 || maxTodayTemp >= 20)) {
    return 'heat';
  }

  return 'none';
}

export const DynamicWeatherAffiliateBanner: React.FC<DynamicWeatherAffiliateBannerProps> = ({
  weather,
  daily,
  hourly,
  seniorMode = false
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const category = getWeatherAffiliateCategory(weather, daily, hourly);

  if (category === 'none' || isDismissed) {
    return null;
  }

  // Configuration according to weather scenario
  const bannerConfig = {
    rain: {
      id: 'banner-affiliate-rain',
      containerClass:
        'bg-gradient-to-r from-sky-950/95 via-blue-900/90 to-amber-950/90 border-sky-400/40 text-slate-100',
      iconBg: 'bg-sky-500/20 border-sky-400/30 group-hover:bg-sky-500/30 text-sky-300',
      Icon: Umbrella,
      title: '🌧️ Alerte Pluie :',
      text: 'Des averses sont prévues aujourd\'hui ! Restez au sec avec ce Parapluie Pliant Automatique ultra-résistant.',
      url: AMAZON_AFFILIATE_LINKS.VICLOON_UMBRELLA,
      linkText: 'Découvrir sur Amazon',
      badgeClass: 'text-amber-300 group-hover:text-amber-200 decoration-amber-400/50'
    },
    heat: {
      id: 'banner-affiliate-heat',
      containerClass:
        'bg-gradient-to-r from-amber-950/95 via-yellow-900/90 to-orange-950/95 border-amber-400/40 text-amber-50',
      iconBg: 'bg-amber-500/25 border-amber-400/40 group-hover:bg-amber-500/35 text-amber-300',
      Icon: Sun,
      title: '☀️ Forte Chaleur :',
      text: 'Protégez-vous efficacement du soleil avec ce Chapeau de Randonnée Anti-UV à large bord.',
      url: AMAZON_AFFILIATE_LINKS.SUN_HAT_UV,
      linkText: 'Voir le chapeau Anti-UV',
      badgeClass: 'text-yellow-300 group-hover:text-yellow-200 decoration-yellow-400/50'
    },
    wind: {
      id: 'banner-affiliate-wind',
      containerClass:
        'bg-gradient-to-r from-slate-900/95 via-zinc-800/95 to-slate-900/95 border-slate-400/40 text-slate-100',
      iconBg: 'bg-slate-700/50 border-slate-400/30 group-hover:bg-slate-600/50 text-cyan-300',
      Icon: Wind,
      title: '💨 Avis de Vent Fort :',
      text: 'Mesurez les rafales en temps réel comme un pro avec cet Anémomètre Portable Haute Précision.',
      url: AMAZON_AFFILIATE_LINKS.WIND_ANEMOMETER,
      linkText: 'Voir l\'anémomètre',
      badgeClass: 'text-cyan-300 group-hover:text-cyan-200 decoration-cyan-400/50'
    }
  }[category];

  const { Icon, title, text, url, linkText, containerClass, iconBg, badgeClass, id } = bannerConfig;

  return (
    <div
      id={id}
      className={`relative z-30 w-full border-b shadow-lg backdrop-blur-md transition-all animate-fadeIn ${containerClass}`}
    >
      <div className="mx-auto max-w-[1720px] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex-1 flex items-center gap-2.5 sm:gap-3.5 transition cursor-pointer min-w-0"
          title={`${title} ${text}`}
        >
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border group-hover:scale-105 transition shadow-inner ${iconBg}`}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
            <p
              className={`font-semibold leading-snug ${
                seniorMode ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
              }`}
            >
              <span className="font-extrabold mr-1">{title}</span>
              <span>{text}</span>
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold underline underline-offset-2 shrink-0 mt-0.5 sm:mt-0 ${badgeClass}`}
            >
              <span>{linkText}</span>
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </a>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Masquer cette bannière"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
