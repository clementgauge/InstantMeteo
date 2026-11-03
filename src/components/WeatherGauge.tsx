import React from 'react';
import { LucideIcon } from 'lucide-react';

interface WeatherGaugeProps {
  id?: string;
  title: string;
  value: string | number;
  unit: string;
  subValue?: string;
  icon: LucideIcon;
  colorClass?: string;
  bgGradient?: string;
  description?: string;
  seniorMode?: boolean;
}

export const WeatherGauge: React.FC<WeatherGaugeProps> = ({
  id,
  title,
  value,
  unit,
  subValue,
  icon: Icon,
  colorClass = 'text-sky-500 dark:text-sky-400',
  seniorMode = false,
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

  return (
    <div
      id={id || `gauge-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between ${
        seniorMode ? 'p-5' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <span className={`font-semibold text-slate-700 dark:text-slate-300 tracking-tight leading-snug ${seniorMode ? 'text-base' : 'text-xs'}`}>
            {title}
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Icon className="h-3.5 w-3.5 shrink-0" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-1.5 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className={`font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums leading-none ${seniorMode ? 'text-3xl' : 'text-xl sm:text-2xl'}`}>
              {value}
            </span>
            <span className={`text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums`}>
              {unit}
            </span>
          </div>

          {subValue && (
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {subValue}
            </span>
          )}
        </div>

        {/* Clean subtle progress bar */}
        <div className="mt-2.5 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-500"
            style={{ width: `${Math.round(progressPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
