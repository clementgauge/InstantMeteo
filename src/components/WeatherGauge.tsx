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
  return (
    <div
      id={id || `gauge-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/90 p-5 shadow-lg backdrop-blur transition-all hover:border-slate-700 hover:shadow-xl ${
        seniorMode ? 'p-6 ring-1 ring-slate-700' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-medium text-slate-300 ${seniorMode ? 'text-lg' : 'text-sm'}`}>
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgGradient}`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className={`font-black tracking-tight text-white ${seniorMode ? 'text-4xl' : 'text-3xl'}`}>
          {value}
        </span>
        <span className={`font-semibold text-slate-400 ${seniorMode ? 'text-xl' : 'text-sm'}`}>
          {unit}
        </span>
        {subValue && (
          <span className={`ml-auto font-medium ${seniorMode ? 'text-base text-slate-300' : 'text-xs text-slate-400'}`}>
            {subValue}
          </span>
        )}
      </div>

      <p className={`mt-3 border-t border-slate-800/60 pt-2.5 text-slate-400 ${seniorMode ? 'text-base font-normal leading-relaxed text-slate-200' : 'text-xs leading-normal'}`}>
        {description}
      </p>
    </div>
  );
};
