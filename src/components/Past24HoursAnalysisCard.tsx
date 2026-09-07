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
    <div id="past-24h-analysis-card" className="rounded-[24px] sm:rounded-3xl border border-slate-800/90 bg-[#0c1424]/95 sm:bg-slate-900/90 p-3.5 sm:p-8 shadow-xl backdrop-blur">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-lg">
            <History className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Relevés Météorologiques Précis des Dernières 24 Heures
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-bold">
                {pastHours.length} heures observées
              </span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Analyse Heure par Heure (Toutes les heures passées)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              viewMode === 'timeline' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vue Défilante (24h)
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              viewMode === 'table' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tableau Complet
          </button>
        </div>
      </div>

      {/* Quick Summary Highlights of past 24h */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
          <span className="text-xs text-slate-400 font-medium">Tn Observée (24h)</span>
          <div className="mt-1 text-2xl font-black text-sky-400">{formatTemp(minPastTemp)}</div>
          <span className="text-[11px] text-slate-500">Nuit / Aube</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
          <span className="text-xs text-slate-400 font-medium">Tx Observée (24h)</span>
          <div className="mt-1 text-2xl font-black text-amber-400">{formatTemp(maxPastTemp)}</div>
          <span className="text-[11px] text-slate-500">Après-midi</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
          <span className="text-xs text-slate-400 font-medium">Cumul Pluie Réel (24h)</span>
          <div className="mt-1 text-2xl font-black text-cyan-400">
            {Number(totalPastRain.toFixed(1))} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <span className="text-[11px] text-slate-500">Somme des 24 relevés</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
          <span className="text-xs text-slate-400 font-medium">Pression au Sol (QFE)</span>
          <div className="mt-1 text-2xl font-black text-indigo-400">
            {selectedHourData.pressureHpa} <span className="text-sm font-normal text-slate-400">hPa</span>
          </div>
          <span className="text-[11px] text-slate-500">À {station.altitude ?? 0}m d'altitude</span>
        </div>
      </div>

      {/* Selected Hour Deep Dive Card */}
      {selectedHourData && (
        <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-950/90 to-cyan-950/20 p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-cyan-400">
                  Détail de l'heure sélectionnée : Relevé à {selectedHourData.hourLabel}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-semibold">
                  Il y a {selectedHourData.hoursAgo} h
                </span>
              </div>
              <h4 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                <span>{selectedHourData.weatherDescription}</span>
                <span className="text-sm font-bold text-cyan-300">({formatTemp(selectedHourData.temperature)})</span>
              </h4>
            </div>

            {/* Diurnal Anomaly against exact 3-hour slot normal */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 border border-slate-800">
              <span className="text-xs text-slate-400">Écart normale créneau :</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${
                selectedHourData.tempAnomalyVsSlot > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                selectedHourData.tempAnomalyVsSlot < 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                'bg-slate-800 text-slate-300'
              }`}>
                {selectedHourData.tempAnomalyVsSlot > 0 ? `+${selectedHourData.tempAnomalyVsSlot}` : selectedHourData.tempAnomalyVsSlot}°C
              </span>
              <span className="text-[10px] text-slate-500">(Réf: {selectedHourData.normal3hSlotTemp}°C)</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Ressenti Windchill :</span>
              <span className="font-bold text-white text-sm">{formatTemp(selectedHourData.apparentTemperature)}</span>
            </div>
            <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Pluie sur l'heure :</span>
              <span className="font-bold text-cyan-300 text-sm">{selectedHourData.rainMm} mm</span>
            </div>
            <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Humidité / Rosée :</span>
              <span className="font-bold text-blue-300 text-sm">{selectedHourData.humidity}% ({selectedHourData.dewPoint}°C)</span>
            </div>
            <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Vent moyen & Rafales :</span>
              <span className="font-bold text-teal-300 text-sm">{selectedHourData.windSpeed} km/h (raf. {selectedHourData.windGust})</span>
            </div>
            <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Pression QFE locale :</span>
              <span className="font-bold text-indigo-300 text-sm">{selectedHourData.pressureHpa} hPa</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 1: Interactive Horizontal 24-Hour Scroller */}
      {viewMode === 'timeline' && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>← Il y a 24 heures</span>
            <span className="font-bold text-cyan-400">Cliquez sur une heure pour analyser ses mesures</span>
            <span>Dernière heure observée →</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1">
            {pastHours.map((hour, idx) => {
              const isSelected = idx === selectedHourIdx;
              const hasRain = hour.rainMm > 0;
              return (
                <button
                  key={idx}
                  id={`past-hour-btn-${idx}`}
                  onClick={() => setSelectedHourIdx(idx)}
                  className={`flex flex-col items-center rounded-2xl border p-3 text-center min-w-[90px] transition shrink-0 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/50 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400">{hour.hourLabel}</span>
                  <span className="my-1.5 text-xl">
                    {hasRain ? '🌧️' : hour.isDay ? '☀️' : '🌙'}
                  </span>
                  <span className="font-black text-white text-sm">{formatTemp(hour.temperature)}</span>
                  
                  {/* Diurnal Anomaly pill */}
                  <span className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    hour.tempAnomalyVsSlot > 0 ? 'text-amber-400 bg-amber-950/60' :
                    hour.tempAnomalyVsSlot < 0 ? 'text-blue-400 bg-blue-950/60' : 'text-slate-400 bg-slate-900'
                  }`}>
                    {hour.tempAnomalyVsSlot > 0 ? `+${hour.tempAnomalyVsSlot}` : hour.tempAnomalyVsSlot}°C
                  </span>

                  {/* Rain or wind */}
                  <div className="mt-1 text-[10px] text-slate-400">
                    {hasRain ? (
                      <span className="font-bold text-cyan-300">{hour.rainMm} mm</span>
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
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-3 px-4 font-bold">Heure</th>
                <th className="py-3 px-3 font-bold">Condition</th>
                <th className="py-3 px-3 font-bold">Température</th>
                <th className="py-3 px-3 font-bold">Normale Créneau (1991-2020)</th>
                <th className="py-3 px-3 font-bold">Écart Créneau</th>
                <th className="py-3 px-3 font-bold">Pluie (mm)</th>
                <th className="py-3 px-3 font-bold">Humidité</th>
                <th className="py-3 px-3 font-bold">Vent & Rafales</th>
                <th className="py-3 px-4 font-bold">Pression QFE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pastHours.map((hour, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => setSelectedHourIdx(idx)}
                  className={`hover:bg-slate-900/60 cursor-pointer transition ${idx === selectedHourIdx ? 'bg-cyan-950/30' : ''}`}
                >
                  <td className="py-2.5 px-4 font-bold text-white">{hour.hourLabel}</td>
                  <td className="py-2.5 px-3 text-slate-300">{hour.weatherDescription}</td>
                  <td className="py-2.5 px-3 font-extrabold text-white">{formatTemp(hour.temperature)}</td>
                  <td className="py-2.5 px-3 text-slate-400">{hour.normal3hSlotTemp}°C</td>
                  <td className="py-2.5 px-3 font-bold">
                    <span className={hour.tempAnomalyVsSlot > 0 ? 'text-amber-400' : hour.tempAnomalyVsSlot < 0 ? 'text-blue-400' : 'text-slate-400'}>
                      {hour.tempAnomalyVsSlot > 0 ? `+${hour.tempAnomalyVsSlot}` : hour.tempAnomalyVsSlot}°C
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{hour.rainMm > 0 ? `${hour.rainMm} mm` : '-'}</td>
                  <td className="py-2.5 px-3 text-blue-300">{hour.humidity}% ({hour.dewPoint}°C)</td>
                  <td className="py-2.5 px-3 text-teal-300">{hour.windSpeed} km/h (raf. {hour.windGust})</td>
                  <td className="py-2.5 px-4 text-indigo-300">{hour.pressureHpa} hPa</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
