import React from 'react';
import { LucideIcon } from 'lucide-react';

interface WeatherGaugeProps {
  id?: string;
  title: string;
  value: string | number;
  unit: string;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
  bgGradient: string;
  description: string;
  seniorMode: boolean;
}

export const WeatherGauge: React.FC<WeatherGaugeProps> = ({
  id,
  title,
  value,
  unit,
  subValue,
  icon: Icon,
  colorClass,
  bgGradient,
  description,
  seniorMode,
}) => {
  // Compute visual progress bar percentage (8% to 100%) based on metric type
  const numericVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  let progressPct = 50;
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('humidité')) {
    progressPct = Math.max(8, Math.min(100, numericVal));
  } else if (lowerTitle.includes('vent')) {
    progressPct = Math.max(10, Math.min(100, (numericVal / 90) * 100));
  } else if (lowerTitle.includes('uv')) {
    progressPct = Math.max(8, Math.min(100, (numericVal / 11) * 100));
  } else if (lowerTitle.includes('air') || lowerTitle.includes('aqi')) {
    progressPct = Math.max(12, Math.min(100, 100 - Math.min(85, numericVal * 0.7)));
  } else if (lowerTitle.includes('pression')) {
    progressPct = Math.max(12, Math.min(100, ((numericVal - 975) / 60) * 100));
  } else if (lowerTitle.includes('précipitation') || lowerTitle.includes('pluie')) {
    progressPct = numericVal <= 0 ? 8 : Math.max(18, Math.min(100, (numericVal / 15) * 100));
  }

  const barGradient = colorClass.includes('blue')
    ? 'from-blue-500 via-sky-400 to-cyan-300'
    : colorClass.includes('teal')
      ? 'from-teal-500 via-emerald-400 to-cyan-300'
      : colorClass.includes('amber')
        ? 'from-amber-500 via-yellow-400 to-orange-400'
        : colorClass.includes('emerald')
          ? 'from-emerald-500 via-teal-400 to-lime-300'
          : colorClass.includes('indigo')
            ? 'from-indigo-500 via-violet-400 to-sky-400'
            : 'from-cyan-500 via-sky-400 to-blue-400';

  return (
    <div
      id={id || `gauge-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-gradient-to-b dark:from-[#0d182c]/95 dark:to-[#091120]/95 p-3.5 sm:p-4 shadow-lg transition-all duration-300 hover:border-sky-500/40 hover:shadow-sky-950/30 motion-hover-lift flex flex-col justify-between ${
        seniorMode ? 'p-5 ring-1 ring-slate-700' : ''
      }`}
    >
      {/* Top luminous accent line */}
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${barGradient} opacity-80`} />

      <div>
        <div className="flex items-center justify-between gap-1.5">
          <span className={`font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-snug ${seniorMode ? 'text-base' : 'text-[11px] sm:text-xs'}`}>
            {title}
          </span>
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 ${bgGradient} shadow-inner`}>
            <Icon className={`h-3.5 w-3.5 shrink-0 ${colorClass}`} />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-1.5 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums leading-none ${seniorMode ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>
              {value}
            </span>
            <span className={`font-bold text-slate-500 dark:text-slate-400 font-mono tabular-nums ${seniorMode ? 'text-base' : 'text-[10px] sm:text-xs'}`}>
              {unit}
            </span>
          </div>

          {subValue && (
            <span className={`inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 font-bold text-right ${colorClass} ${seniorMode ? 'text-xs' : 'text-[9px] sm:text-[10px]'}`}>
              {subValue}
            </span>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 overflow-hidden p-[1px]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700`}
            style={{ width: `${Math.round(progressPct)}%` }}
          />
        </div>
      </div>

      <p className={`mt-2.5 border-t border-slate-100 dark:border-slate-800/70 pt-2 text-slate-600 dark:text-slate-400 ${seniorMode ? 'text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300' : 'text-[10px] sm:text-[11px] leading-snug line-clamp-2 sm:line-clamp-none'}`}>
        {description}
      </p>
    </div>
  );
};
