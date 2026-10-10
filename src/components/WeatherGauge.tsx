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
  description,
  seniorMode,
}) => {
  return (
    <div
      id={id || `gauge-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`rounded-xl border border-slate-800/90 bg-[#0a1220]/95 p-4 sm:p-5 shadow-md transition-colors duration-200 hover:border-slate-700 hover:bg-[#0d1729] flex flex-col justify-between ${
        seniorMode ? 'p-6 ring-1 ring-slate-700' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-slate-300 tracking-tight ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'}`}>
            {title}
          </span>
          <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} />
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className={`font-extrabold tracking-tight text-white font-mono tabular-nums leading-none ${seniorMode ? 'text-4xl' : 'text-2xl sm:text-3xl'}`}>
              {value}
            </span>
            <span className={`font-semibold text-slate-400 font-mono tabular-nums ${seniorMode ? 'text-lg' : 'text-xs'}`}>
              {unit}
            </span>
          </div>

          {subValue && (
            <span className={`font-medium text-right ${colorClass} ${seniorMode ? 'text-sm' : 'text-[11px]'}`}>
              {subValue}
            </span>
          )}
        </div>
      </div>

      <p className={`mt-3 border-t border-slate-800/80 pt-2.5 text-slate-400 ${seniorMode ? 'text-sm leading-relaxed text-slate-300' : 'text-[11px] leading-relaxed'}`}>
        {description}
      </p>
    </div>
  );
};
