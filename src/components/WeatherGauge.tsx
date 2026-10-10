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
      className={`rounded-[24px] border border-slate-700/70 bg-[#0c1424]/90 p-5 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-slate-600/90 hover:bg-[#0f1a30]/95 hover:shadow-2xl hover:-translate-y-0.5 group ${
        seniorMode ? 'p-6 ring-1 ring-slate-700' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-bold text-slate-300 group-hover:text-white transition ${seniorMode ? 'text-lg' : 'text-sm'}`}>
          {title}
        </span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 shadow-inner transition-transform group-hover:scale-105 ${bgGradient}`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5 flex-wrap">
        <span className={`font-black tracking-tight text-white drop-shadow-sm ${seniorMode ? 'text-4xl' : 'text-3xl'}`}>
          {value}
        </span>
        <span className={`font-bold text-slate-400 ${seniorMode ? 'text-xl' : 'text-sm'}`}>
          {unit}
        </span>
        {subValue && (
          <span className={`ml-auto font-semibold px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800 text-[11px] ${seniorMode ? 'text-sm text-slate-300' : 'text-slate-300'}`}>
            {subValue}
          </span>
        )}
      </div>

      <p className={`mt-3 border-t border-slate-800/80 pt-2.5 text-slate-400 ${seniorMode ? 'text-base font-normal leading-relaxed text-slate-200' : 'text-xs leading-relaxed'}`}>
        {description}
      </p>
    </div>
  );
};
