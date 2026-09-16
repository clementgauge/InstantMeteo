import React, { useState } from 'react';
import { 
  Clock, 
  History, 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  CloudRain, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Info,
  Layers
} from 'lucide-react';
import { LocationPoint, CurrentWeather, PastHourObservation } from '../types/weather';

interface Past24HoursAnalysisCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  seniorMode: boolean;
  tempUnit: 'C' | 'F';
}

export const Past24HoursAnalysisCard: React.FC<Past24HoursAnalysisCardProps> = ({
  weather,
  station,
  seniorMode,
  tempUnit
}) => {
  const pastHours = weather.pastHourly || [];
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(Math.max(0, pastHours.length - 1));
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  if (!pastHours || pastHours.length === 0) {
    return null;
  }

  const selectedHourData = pastHours[selectedHourIdx] || pastHours[pastHours.length - 1];

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  // Find min and max temperature in past 24h
  const minPastTemp = Math.min(...pastHours.map(h => h.temperature));
  const maxPastTemp = Math.max(...pastHours.map(h => h.temperature));
  const totalPastRain = pastHours.reduce((acc, h) => acc + (h.rainMm || 0), 0);

  return (
    <div id="past-24h-analysis-card" className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Relevés Météorologiques des Dernières 24 Heures
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-semibold">
                {pastHours.length} heures observées
              </span>
            </div>
            <h3 className={`font-bold text-white ${seniorMode ? 'text-xl' : 'text-lg'}`}>
              Analyse Heure par Heure
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer ${
              viewMode === 'timeline' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vue Défilante (24h)
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer ${
              viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tableau Complet
          </button>
        </div>
      </div>

      {/* Quick Summary Highlights of past 24h */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
          <span className="text-xs text-slate-400 font-medium">Tn Observée (24h)</span>
          <div className="mt-1 text-xl font-bold text-sky-400">{formatTemp(minPastTemp)}</div>
          <span className="text-[11px] text-slate-500">Nuit / Aube</span>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
          <span className="text-xs text-slate-400 font-medium">Tx Observée (24h)</span>
          <div className="mt-1 text-xl font-bold text-amber-400">{formatTemp(maxPastTemp)}</div>
          <span className="text-[11px] text-slate-500">Après-midi</span>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
          <span className="text-xs text-slate-400 font-medium">Cumul Pluie Réel (24h)</span>
          <div className="mt-1 text-xl font-bold text-cyan-400">
            {Number(totalPastRain.toFixed(1))} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <span className="text-[11px] text-slate-500">Somme des 24 relevés</span>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
          <span className="text-xs text-slate-400 font-medium">Pression au Sol (QFE)</span>
          <div className="mt-1 text-xl font-bold text-indigo-400">
            {selectedHourData.pressureHpa} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <span className="text-[11px] text-slate-500">À {station.altitude ?? 0}m d'altitude</span>
        </div>
      </div>

      {/* Selected Hour Deep Dive Card */}
      {selectedHourData && (
        <div className="mt-4 rounded-md border border-slate-800 bg-slate-950 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-cyan-400">
                  Détail : Relevé à {selectedHourData.hourLabel}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
                  Il y a {selectedHourData.hoursAgo} h
                </span>
              </div>
              <h4 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{selectedHourData.weatherDescription}</span>
                <span className="text-sm font-semibold text-cyan-300">({formatTemp(selectedHourData.temperature)})</span>
              </h4>
            </div>

            {/* Diurnal Anomaly against exact 3-hour slot normal */}
            <div className="flex items-center gap-2 rounded-md bg-slate-900 px-2.5 py-1 border border-slate-800">
              <span className="text-xs text-slate-400">Écart normale :</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                selectedHourData.tempAnomalyVsSlot > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                selectedHourData.tempAnomalyVsSlot < 0 ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                'bg-slate-800 text-slate-300'
              }`}>
                {selectedHourData.tempAnomalyVsSlot > 0 ? `+${selectedHourData.tempAnomalyVsSlot}` : selectedHourData.tempAnomalyVsSlot}°C
              </span>
              <span className="text-[10px] text-slate-500">(Réf: {selectedHourData.normal3hSlotTemp}°C)</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="rounded bg-slate-900 p-2.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Ressenti :</span>
              <span className="font-bold text-white text-sm">{formatTemp(selectedHourData.apparentTemperature)}</span>
            </div>
            <div className="rounded bg-slate-900 p-2.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Pluie sur l'heure :</span>
              <span className="font-bold text-cyan-300 text-sm">{selectedHourData.rainMm} mm</span>
            </div>
            <div className="rounded bg-slate-900 p-2.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Humidité / Rosée :</span>
              <span className="font-bold text-blue-300 text-sm">{selectedHourData.humidity}% ({selectedHourData.dewPoint}°C)</span>
            </div>
            <div className="rounded bg-slate-900 p-2.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Vent & Rafales :</span>
              <span className="font-bold text-teal-300 text-sm">{selectedHourData.windSpeed} km/h (raf. {selectedHourData.windGust})</span>
            </div>
            <div className="rounded bg-slate-900 p-2.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Pression QFE :</span>
              <span className="font-bold text-indigo-300 text-sm">{selectedHourData.pressureHpa} hPa</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 1: Interactive Horizontal 24-Hour Scroller */}
      {viewMode === 'timeline' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>← Il y a 24 heures</span>
            <span className="font-medium text-cyan-400">Cliquez sur une heure pour analyser ses mesures</span>
            <span>Dernière heure observée →</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
            {pastHours.map((hour, idx) => {
              const isSelected = idx === selectedHourIdx;
              const hasRain = hour.rainMm > 0;
              return (
                <button
                  key={idx}
                  id={`past-hour-btn-${idx}`}
                  onClick={() => setSelectedHourIdx(idx)}
                  className={`flex flex-col items-center rounded-md border p-2 text-center min-w-[85px] transition shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400">{hour.hourLabel}</span>
                  <span className="my-1 text-lg">
                    {hasRain ? '🌧️' : hour.isDay ? '☀️' : '🌙'}
                  </span>
                  <span className="font-bold text-white text-sm">{formatTemp(hour.temperature)}</span>
                  
                  {/* Diurnal Anomaly pill */}
                  <span className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    hour.tempAnomalyVsSlot > 0 ? 'text-amber-400 bg-amber-950/60' :
                    hour.tempAnomalyVsSlot < 0 ? 'text-blue-400 bg-blue-950/60' : 'text-slate-400 bg-slate-900'
                  }`}>
                    {hour.tempAnomalyVsSlot > 0 ? `+${hour.tempAnomalyVsSlot}` : hour.tempAnomalyVsSlot}°C
                  </span>

                  {/* Rain or wind */}
                  <div className="mt-1 text-[10px] text-slate-400">
                    {hasRain ? (
                      <span className="font-semibold text-cyan-300">{hour.rainMm} mm</span>
                    ) : (
                      <span>{hour.windSpeed} km/h</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Complete 24h Table */}
      {viewMode === 'table' && (
        <div className="mt-4 overflow-x-auto rounded-md border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900">
                <th className="py-2.5 px-3 font-semibold">Heure</th>
                <th className="py-2.5 px-3 font-semibold">Condition</th>
                <th className="py-2.5 px-3 font-semibold">Température</th>
                <th className="py-2.5 px-3 font-semibold">Normale Créneau (1991-2020)</th>
                <th className="py-2.5 px-3 font-semibold">Écart Créneau</th>
                <th className="py-2.5 px-3 font-semibold">Pluie (mm)</th>
                <th className="py-2.5 px-3 font-semibold">Humidité</th>
                <th className="py-2.5 px-3 font-semibold">Vent & Rafales</th>
                <th className="py-2.5 px-3 font-semibold">Pression QFE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pastHours.map((hour, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => setSelectedHourIdx(idx)}
                  className={`hover:bg-slate-900/60 cursor-pointer transition ${idx === selectedHourIdx ? 'bg-cyan-950/30' : ''}`}
                >
                  <td className="py-2 px-3 font-semibold text-white">{hour.hourLabel}</td>
                  <td className="py-2 px-3 text-slate-300">{hour.weatherDescription}</td>
                  <td className="py-2 px-3 font-bold text-white">{formatTemp(hour.temperature)}</td>
                  <td className="py-2 px-3 text-slate-400">{hour.normal3hSlotTemp}°C</td>
                  <td className="py-2 px-3 font-semibold">
                    <span className={hour.tempAnomalyVsSlot > 0 ? 'text-amber-400' : hour.tempAnomalyVsSlot < 0 ? 'text-blue-400' : 'text-slate-400'}>
                      {hour.tempAnomalyVsSlot > 0 ? `+${hour.tempAnomalyVsSlot}` : hour.tempAnomalyVsSlot}°C
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-cyan-300">{hour.rainMm > 0 ? `${hour.rainMm} mm` : '-'}</td>
                  <td className="py-2 px-3 text-blue-300">{hour.humidity}% ({hour.dewPoint}°C)</td>
                  <td className="py-2 px-3 text-teal-300">{hour.windSpeed} km/h (raf. {hour.windGust})</td>
                  <td className="py-2 px-3 text-indigo-300">{hour.pressureHpa} hPa</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
