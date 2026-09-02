import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog, 
  Droplets, 
  Wind, 
  Clock, 
  Calendar, 
  Sparkles,
  Thermometer,
  Umbrella,
  Sunset,
  Sunrise,
  Moon,
  Eye
} from 'lucide-react';
import { DailyForecast, HourlyForecast, CurrentWeather } from '../types/weather';
import { getThermalTierForTemp } from '../utils/thermalTiers';
import { getDetailedCloudCover, getOctasFromPercent } from '../utils/weatherIcons';

interface DayWeatherOverviewCardProps {
  weather: CurrentWeather;
  daily?: DailyForecast[];
  hourly?: HourlyForecast[];
  tempUnit: 'C' | 'F';
  seniorMode?: boolean;
}

export const DayWeatherOverviewCard: React.FC<DayWeatherOverviewCardProps> = ({
  weather,
  daily,
  hourly = [],
  tempUnit,
  seniorMode = false
}) => {
  const todayDaily = daily && daily.length > 0 ? daily[0] : null;

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${Math.round(celsius * 10) / 10}°C`;
  };

  // Extract exact 0-23 hour number
  const getHourNumber = (h: HourlyForecast): number => {
    if (typeof h.hourNumber === 'number' && h.hourNumber >= 0 && h.hourNumber <= 23) return h.hourNumber;
    if (h.hourLabel) {
      const match = h.hourLabel.match(/^(\d{1,2})/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) return parsed;
      }
    }
    if (h.time) {
      const d = new Date(h.time);
      if (!isNaN(d.getTime())) return d.getHours();
    }
    return 0;
  };

  // Determine dominant weather code for the day
  const dayWeatherCode = todayDaily ? todayDaily.weatherCode : weather.weatherCode;
  const dayPrecipProb = todayDaily ? todayDaily.precipitationProbability : (weather.precipitation > 0 ? 90 : 10);
  const dayRainMm = todayDaily?.rainMm ?? weather.precipitation ?? 0;
  const daySunHours = todayDaily?.sunshineHours ?? (weather.sunshineDurationTodayHours ?? 7.5);
  const dayUvMax = todayDaily?.uvIndexMax ?? weather.uvIndex;
  const dayGustMax = todayDaily?.windGustMax ?? weather.windGust ?? weather.windSpeed;

  // Icon & Visual helper for the day
  const getDayWeatherVisual = (code: number) => {
    if (code === 0 || code === 1) {
      return {
        label: 'Journée Ensoleillée',
        sub: 'Ciel dégagé & belle luminosité',
        icon: <Sun className="h-10 w-10 sm:h-12 sm:w-12 text-amber-400" />,
        accentBg: 'from-amber-500/20 to-orange-500/10',
        borderColor: 'border-amber-500/40',
        textColor: 'text-amber-300',
        badge: 'Grand Soleil'
      };
    }
    if (code === 2) {
      return {
        label: 'Belles Éclaircies',
        sub: 'Alternance de soleil et de nuages',
        icon: <CloudSun className="h-10 w-10 sm:h-12 sm:w-12 text-amber-300" />,
        accentBg: 'from-blue-500/20 to-amber-500/10',
        borderColor: 'border-blue-400/40',
        textColor: 'text-blue-300',
        badge: 'Éclaircies'
      };
    }
    if (code === 3) {
      return {
        label: 'Ciel Couvert',
        sub: 'Nuages denses & lumière feutrée',
        icon: <Cloud className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300" />,
        accentBg: 'from-slate-600/20 to-slate-800/20',
        borderColor: 'border-slate-500/40',
        textColor: 'text-slate-200',
        badge: 'Très Nuageux'
      };
    }
    if (code === 45 || code === 48) {
      return {
        label: 'Brume & Brouillard',
        sub: 'Visibilité réduite, humidité élevée',
        icon: <CloudFog className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300" />,
        accentBg: 'from-slate-500/20 to-blue-900/20',
        borderColor: 'border-slate-400/40',
        textColor: 'text-slate-300',
        badge: 'Brumeux'
      };
    }
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return {
        label: 'Passages Pluvieux',
        sub: 'Averses et précipitations intermittentes',
        icon: <CloudRain className="h-10 w-10 sm:h-12 sm:w-12 text-sky-400" />,
        accentBg: 'from-sky-600/25 to-blue-950/40',
        borderColor: 'border-sky-500/40',
        textColor: 'text-sky-300',
        badge: 'Pluvieux'
      };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        label: 'Chutes de Neige',
        sub: 'Flocons cotonneux et froid marqué',
        icon: <CloudSnow className="h-10 w-10 sm:h-12 sm:w-12 text-cyan-200" />,
        accentBg: 'from-cyan-600/25 to-blue-950/40',
        borderColor: 'border-cyan-400/40',
        textColor: 'text-cyan-200',
        badge: 'Neige'
      };
    }
    if ([95, 96, 99].includes(code)) {
      return {
        label: 'Risque d’Orages',
        sub: 'Activité électrique et averses convectives',
        icon: <CloudLightning className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400" />,
        accentBg: 'from-purple-600/25 to-indigo-950/40',
        borderColor: 'border-purple-500/40',
        textColor: 'text-purple-300',
        badge: 'Orageux'
      };
    }
    return {
      label: todayDaily?.weatherDescription || weather.weatherDescription,
      sub: 'Évolution continue de la journée',
      icon: <CloudSun className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400" />,
      accentBg: 'from-blue-600/20 to-slate-900/30',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
      badge: 'Météo du Jour'
    };
  };

  const dayVisual = getDayWeatherVisual(dayWeatherCode);

  // Extract 24 hours of today
  const today24Hours: HourlyForecast[] = (todayDaily?.hourlyList && todayDaily.hourlyList.length > 0)
    ? todayDaily.hourlyList
    : hourly.slice(0, 24);

  // Full 4 periods breakdown mapped to chronological hours with rich meteorological data
  const rawPeriods = [
    {
      id: 'morning',
      label: 'Matinée',
      hoursLabel: '06h - 12h',
      icon: '🌅',
      slice: today24Hours.filter(h => {
        const hr = getHourNumber(h);
        return hr >= 6 && hr < 12;
      }),
      defaultDesc: 'Fraîcheur matinale, rosée et formation des premiers cumulus'
    },
    {
      id: 'afternoon',
      label: 'Après-Midi',
      hoursLabel: '12h - 18h',
      icon: '☀️',
      slice: today24Hours.filter(h => {
        const hr = getHourNumber(h);
        return hr >= 12 && hr < 18;
      }),
      defaultDesc: 'Pic thermique journalier, convection thermique et indice UV maximal'
    },
    {
      id: 'evening',
      label: 'Soirée',
      hoursLabel: '18h - 23h',
      icon: '🌇',
      slice: today24Hours.filter(h => {
        const hr = getHourNumber(h);
        return hr >= 18 && hr < 23;
      }),
      defaultDesc: 'Baisse graduelle des températures, brises thermiques descendantes'
    },
    {
      id: 'night',
      label: 'Nuit',
      hoursLabel: '23h - 06h',
      icon: '🌙',
      slice: today24Hours.filter(h => {
        const hr = getHourNumber(h);
        return hr >= 23 || hr < 6;
      }),
      defaultDesc: 'Rayonnement nocturne, minimum thermique au lever du jour'
    }
  ];

  const syntheticPeriods = rawPeriods.map(p => {
    const list = p.slice.length > 0 ? p.slice : today24Hours.slice(0, 6);
    const temps = list.map(h => h.temperature);
    const feels = list.map(h => h.apparentTemperature ?? h.feelsLike ?? h.temperature);
    const tMin = temps.length > 0 ? Math.min(...temps) : weather.tempMin;
    const tMax = temps.length > 0 ? Math.max(...temps) : weather.tempMax;
    const feelsMin = feels.length > 0 ? Math.min(...feels) : tMin;
    const feelsMax = feels.length > 0 ? Math.max(...feels) : tMax;
    const rainSum = list.reduce((acc, h) => acc + (h.precipitationMm || h.rainMm || 0), 0);
    const maxProb = list.length > 0 ? Math.max(...list.map(h => h.precipitationProbability || 0)) : dayPrecipProb;
    const winds = list.map(h => h.windSpeed || 0);
    const meanWind = Math.round(winds.reduce((a, b) => a + b, 0) / (winds.length || 1));
    const maxGust = Math.max(...list.map(h => h.windGust || (h.windSpeed ? h.windSpeed * 1.3 : 0)));

    // Clouds & octas
    const clouds = list.map(h => typeof h.cloudCover === 'number' ? h.cloudCover : 30);
    const meanCloudCover = Math.round(clouds.reduce((a, b) => a + b, 0) / (clouds.length || 1));
    const octas = getOctasFromPercent(meanCloudCover);
    const lows = list.map(h => typeof h.cloudCoverLow === 'number' ? h.cloudCoverLow : 0);
    const mids = list.map(h => typeof h.cloudCoverMid === 'number' ? h.cloudCoverMid : 0);
    const highs = list.map(h => typeof h.cloudCoverHigh === 'number' ? h.cloudCoverHigh : 0);
    const meanLow = Math.round(lows.reduce((a, b) => a + b, 0) / (lows.length || 1));
    const meanMid = Math.round(mids.reduce((a, b) => a + b, 0) / (mids.length || 1));
    const meanHigh = Math.round(highs.reduce((a, b) => a + b, 0) / (highs.length || 1));
    const cloudDetail = getDetailedCloudCover(meanCloudCover, meanLow, meanMid, meanHigh, p.id !== 'night');

    // Dynamic description tailored to actual meteorological forecast
    let dynamicDesc = p.defaultDesc;
    if (rainSum >= 1.0) {
      dynamicDesc = `Passages pluvieux (${Number(rainSum.toFixed(1))} mm, proba ${maxProb}%).`;
    } else if (maxProb >= 40) {
      dynamicDesc = `Risque d'ondées ou averses éparses (${maxProb}%).`;
    } else if (meanCloudCover <= 15) {
      dynamicDesc = p.id === 'night' 
        ? 'Ciel nocturne clair et étoilé, fort refroidissement.' 
        : 'Plein soleil et ciel limpide, belle luminosité.';
    } else if (meanCloudCover >= 80) {
      dynamicDesc = 'Ciel très chargé et compact, luminosité feutrée.';
    } else if (meanHigh >= 40 && meanLow <= 20) {
      dynamicDesc = 'Voile de cirrus d\'altitude laissant filtrer le soleil.';
    }

    const tierMax = getThermalTierForTemp(tMax);
    const tierMin = getThermalTierForTemp(tMin);

    return {
      ...p,
      tMin,
      tMax,
      feelsMin,
      feelsMax,
      rainSum: Number(rainSum.toFixed(1)),
      maxProb,
      meanWind,
      maxGust: Math.round(maxGust),
      meanCloudCover,
      octas,
      cloudDetail,
      tierMax,
      tierMin,
      desc: dynamicDesc
    };
  });

  return (
    <div id="day-weather-overview-card" className={`rounded-2xl border ${dayVisual.borderColor} bg-gradient-to-br ${dayVisual.accentBg} p-4 sm:p-5 text-slate-200 shadow-xl backdrop-blur-md w-full flex flex-col justify-between space-y-4`}>
      {/* Header with Title & Day Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tendance Météo &amp; Évolution de la Journée
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-cyan-300 hidden sm:inline-flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            4 Périodes Synthétiques
          </span>
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${dayVisual.borderColor} bg-slate-950/80 ${dayVisual.textColor} shadow-sm`}>
            {dayVisual.badge}
          </span>
        </div>
      </div>

      {/* Main Representative Day Weather Card with Full-width Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-inner">
            {dayVisual.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-base sm:text-lg font-black text-white leading-tight truncate">
              {dayVisual.label}
            </h4>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium">
              {todayDaily?.rainTimingSummary || dayVisual.sub}
            </p>
            
            {/* Badges Bar: Rain Risk, Sun, UV, Gusts */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                dayPrecipProb > 50 
                  ? 'bg-sky-950/80 border-sky-500/60 text-sky-300' 
                  : dayPrecipProb > 20 
                  ? 'bg-blue-950/70 border-blue-500/50 text-blue-300'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              }`}>
                <Umbrella className="h-3.5 w-3.5" />
                <span>Risque pluie : <strong>{dayPrecipProb}%</strong></span>
                {dayRainMm > 0 && <span className="font-extrabold text-white">({dayRainMm} mm)</span>}
              </span>

              {daySunHours > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-950/50 text-amber-300">
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Soleil : {daySunHours}h</span>
                </span>
              )}

              {dayUvMax !== undefined && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300">
                  <span>UV max : {dayUvMax}</span>
                </span>
              )}

              {dayGustMax !== undefined && dayGustMax > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-950/40 text-indigo-300">
                  <Wind className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Rafales : {Math.round(dayGustMax)} km/h</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Synthetic Breakdown of the Day into 4 Periods (Matinée, Après-Midi, Soirée, Nuit) */}
      <div className="pt-2 border-t border-slate-700/60">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Découpage Synthétique de la Journée (4 Créneaux)
          </span>
          <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
            Températures, Ressenti, Précipitations, Vent &amp; Ciel
          </span>
        </div>

        {/* 4 Periods Cards Grid with all Synthetic Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
          {syntheticPeriods.map((p) => {
            // Theme accents tailored to each time of day
            const periodTheme = 
              p.id === 'night' ? {
                cardBg: 'bg-gradient-to-b from-indigo-950/50 via-slate-950/90 to-slate-950',
                border: 'border-indigo-800/40 hover:border-indigo-600/70',
                iconBox: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50 shadow-indigo-950/40',
                headerText: 'text-indigo-200',
                timeText: 'text-indigo-400/80'
              } : p.id === 'morning' ? {
                cardBg: 'bg-gradient-to-b from-amber-950/40 via-slate-950/90 to-slate-950',
                border: 'border-amber-800/40 hover:border-amber-600/70',
                iconBox: 'bg-amber-950/80 text-amber-300 border-amber-700/50 shadow-amber-950/40',
                headerText: 'text-amber-200',
                timeText: 'text-amber-400/80'
              } : p.id === 'afternoon' ? {
                cardBg: 'bg-gradient-to-b from-sky-950/40 via-slate-950/90 to-slate-950',
                border: 'border-sky-800/40 hover:border-sky-600/70',
                iconBox: 'bg-sky-950/80 text-sky-300 border-sky-700/50 shadow-sky-950/40',
                headerText: 'text-sky-200',
                timeText: 'text-sky-400/80'
              } : {
                cardBg: 'bg-gradient-to-b from-purple-950/40 via-slate-950/90 to-slate-950',
                border: 'border-purple-800/40 hover:border-purple-600/70',
                iconBox: 'bg-purple-950/80 text-purple-300 border-purple-700/50 shadow-purple-950/40',
                headerText: 'text-purple-200',
                timeText: 'text-purple-400/80'
              };

            return (
              <div 
                key={p.id}
                className={`flex flex-col justify-between rounded-2xl border ${periodTheme.border} ${periodTheme.cardBg} p-3.5 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 shadow-lg space-y-3 relative overflow-hidden backdrop-blur-md`}
              >
                {/* Period Header & Tier Badge */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xl shadow-md ${periodTheme.iconBox}`}>
                      {p.icon}
                    </div>
                    <div>
                      <span className={`text-xs font-black block leading-tight ${periodTheme.headerText}`}>
                        {p.label}
                      </span>
                      <span className={`text-[10px] block font-semibold ${periodTheme.timeText}`}>
                        {p.hoursLabel}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border shadow-sm ${p.tierMax.tailwindBg} ${p.tierMax.tailwindBorder} ${p.tierMax.tailwindText}`}>
                    {p.tierMax.name.split('/')[0]}
                  </span>
                </div>

                {/* Temperature Min -> Max & Feels-like with Visual Gauge */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Thermique
                    </span>
                    <div className="text-base font-black text-white tabular-nums flex items-center gap-1.5">
                      <span className="text-blue-300 bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-900/50">
                        {formatTemp(p.tMin)}
                      </span>
                      <span className="text-slate-500 font-normal">→</span>
                      <span className="text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/50">
                        {formatTemp(p.tMax)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/60">
                    <span className="font-medium">Ressenti :</span>
                    <span className="font-bold text-slate-200">
                      {formatTemp(p.feelsMin)} à {formatTemp(p.feelsMax)}
                    </span>
                  </div>
                </div>

                {/* Rain & Wind indicators */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition ${
                    p.rainSum > 0 || p.maxProb >= 40
                      ? 'bg-sky-950/70 border-sky-600/50 text-sky-200 shadow-sm shadow-sky-950/40'
                      : 'bg-slate-900/90 border-slate-800/80 text-slate-300'
                  }`}>
                    <Droplets className={`h-3.5 w-3.5 shrink-0 ${p.maxProb >= 40 ? 'text-sky-400 animate-pulse' : 'text-sky-400/80'}`} />
                    <div className="min-w-0 flex-1 truncate">
                      <div className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-0.5">Précip.</div>
                      <span className="font-black tabular-nums text-xs">
                        {p.rainSum > 0 ? `${p.rainSum} mm` : `${p.maxProb}%`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800/80 text-slate-300">
                    <Wind className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <div className="min-w-0 flex-1 truncate">
                      <div className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-0.5">Vent</div>
                      <span className="font-black text-slate-200 tabular-nums text-xs">
                        {p.meanWind} <span className="text-[9px] font-bold text-slate-400">({p.maxGust})</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sky condition & Octas Indicator */}
                <div className="flex items-center justify-between text-[11px] bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-200 flex items-center gap-1.5 truncate">
                    <span className="text-sm">{p.cloudDetail.emoji}</span>
                    <span className="font-bold text-xs truncate">{p.cloudDetail.shortLabel}</span>
                  </span>
                  <div className="flex items-center gap-1 shrink-0 ml-1.5">
                    <span className="font-mono font-black text-cyan-300 text-xs">
                      {p.octas}/8
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">oct.</span>
                  </div>
                </div>

                {/* Dynamic synopsis text */}
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[10px] text-slate-300 line-clamp-2 leading-relaxed italic">
                  "{p.desc}"
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
