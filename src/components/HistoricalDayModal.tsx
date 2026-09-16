import React from 'react';
import { HistoricalDayRecord, LocationPoint } from '../types/weather';
import { 
  X, 
  Calendar, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Sun, 
  Clock, 
  Compass, 
  Activity, 
  Award, 
  Layers, 
  Droplet, 
  Gauge, 
  Sparkles,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface HistoricalDayModalProps {
  dayRecord: HistoricalDayRecord | null;
  station: LocationPoint;
  onClose: () => void;
}

export const HistoricalDayModal: React.FC<HistoricalDayModalProps> = ({
  dayRecord,
  station,
  onClose
}) => {
  if (!dayRecord) return null;

  const chartData = dayRecord.hourlyProfile?.map((h) => ({
    hour: `${h.hour}h`,
    temp: h.temp,
    rain: h.rainMm,
    wind: h.windKmh
  })) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
      <div 
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-700 bg-[#0F172A] p-5 sm:p-6 space-y-4 text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-800 text-[#0284C7] border border-slate-700 text-2xl">
            {dayRecord.weatherEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0284C7]">
              <span>{station.name} ({station.altitude} m)</span>
              <span>•</span>
              <span className="text-slate-400">Archive Météorologique</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {dayRecord.dayOfWeek} {dayRecord.dayFormatted}
            </h2>
            <div className="text-xs text-slate-300">
              {dayRecord.weatherDescription}
            </div>
          </div>
        </div>

        {/* Core Temperature & Anomaly Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Tmin */}
          <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-sky-400">
              <ArrowDown className="h-3 w-3" />
              T° Min (Nuit)
            </div>
            <div className="mt-0.5 text-xl font-bold text-sky-300">
              {dayRecord.tempMin}°C
            </div>
            <div className="text-[10px] text-slate-400">À l'aube</div>
          </div>

          {/* Tmax */}
          <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-rose-400">
              <ArrowUp className="h-3 w-3" />
              T° Max (Jour)
            </div>
            <div className="mt-0.5 text-xl font-bold text-rose-300">
              {dayRecord.tempMax}°C
            </div>
            <div className="text-[10px] text-slate-400">Après-midi</div>
          </div>

          {/* Tmean */}
          <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
            <div className="text-[10px] font-semibold uppercase text-slate-400">Moyenne 24h</div>
            <div className="mt-0.5 text-xl font-bold text-white">
              {dayRecord.tempMean}°C
            </div>
            <div className="text-[10px] text-slate-400">Normale : {dayRecord.normalTempMean}°C</div>
          </div>

          {/* Anomaly */}
          <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
            <div className="text-[10px] font-semibold uppercase text-slate-400">Écart Normale</div>
            <div className={`mt-0.5 text-xl font-bold ${dayRecord.tempAnomalyVsNormal >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
              {dayRecord.tempAnomalyVsNormal > 0 ? `+${dayRecord.tempAnomalyVsNormal}` : dayRecord.tempAnomalyVsNormal}°C
            </div>
            <div className="text-[10px] text-slate-400">vs Réf. 1991-2020</div>
          </div>
        </div>

        {/* Detailed Secondary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-md bg-slate-900 p-2.5 border border-slate-800 flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-sky-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Pluviométrie 24h</div>
              <div className="font-bold text-white text-xs">
                {dayRecord.precipitationMm} mm <span className="text-slate-400 font-normal">({dayRecord.precipitationDurationHours}h de pluie)</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-slate-900 p-2.5 border border-slate-800 flex items-center gap-2">
            <Wind className="h-4 w-4 text-teal-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Rafale Max</div>
              <div className="font-bold text-white text-xs">
                {dayRecord.windGustMaxKmh} km/h <span className="text-slate-400 font-normal">({dayRecord.dominantWindDirection})</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-slate-900 p-2.5 border border-slate-800 flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Ensoleillement</div>
              <div className="font-bold text-white text-xs">
                {dayRecord.sunshineHours} h <span className="text-slate-400 font-normal">({dayRecord.solarRadiationKwhM2} kWh/m²)</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-slate-900 p-2.5 border border-slate-800 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Pression</div>
              <div className="font-bold text-white text-xs">
                {dayRecord.pressureMeanHpa} hPa
              </div>
            </div>
          </div>

          <div className="rounded-md bg-slate-900 p-2.5 border border-slate-800 flex items-center gap-2">
            <Droplet className="h-4 w-4 text-sky-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Humidité &amp; Rosée</div>
              <div className="font-bold text-white text-xs">
                {dayRecord.humidityMinPct}% à {dayRecord.humidityMaxPct}% <span className="text-slate-400 font-normal">({dayRecord.dewPointMeanC}°C)</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-slate-900 p-2.5 border border-slate-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Isotherme 0°C</div>
              <div className="font-bold text-white text-xs">
                {dayRecord.isotherm0Meters} m
              </div>
            </div>
          </div>
        </div>

        {/* 24h Hourly Profile Reconstructed Chart */}
        <div className="rounded-md border border-slate-800 bg-slate-900 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Reconstitution Horaire</span>
            <span className="text-slate-400">Température (°C)</span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#0284C7" fill="#0284C7" fillOpacity={0.2} name="Température (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All-time records benchmark */}
        {dayRecord.allTimeDailyRecordsComparison && (
          <div className="rounded-md border border-slate-800 bg-slate-900 p-3 space-y-2 text-xs">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#0284C7]" />
              Records Historiques pour cette Date Climatologique à {station.name} :
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
              <div className="rounded-md bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Record de Chaleur</span>
                <div className="font-bold text-rose-300 text-sm">
                  +{dayRecord.allTimeDailyRecordsComparison.recordMaxForDay}°C
                </div>
                <div className="text-[10px] text-slate-400">En {dayRecord.allTimeDailyRecordsComparison.recordMaxYear}</div>
              </div>

              <div className="rounded-md bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Record de Froid</span>
                <div className="font-bold text-sky-300 text-sm">
                  {dayRecord.allTimeDailyRecordsComparison.recordMinForDay}°C
                </div>
                <div className="text-[10px] text-slate-400">En {dayRecord.allTimeDailyRecordsComparison.recordMinYear}</div>
              </div>

              <div className="rounded-md bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Record Pluie 24h</span>
                <div className="font-bold text-sky-300 text-sm">
                  {dayRecord.allTimeDailyRecordsComparison.recordRainForDay} mm
                </div>
                <div className="text-[10px] text-slate-400">En {dayRecord.allTimeDailyRecordsComparison.recordRainYear}</div>
              </div>
            </div>
          </div>
        )}

        {/* Synoptic Note Footnote */}
        <div className="rounded-md bg-slate-900 p-3 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-[#0284C7] shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Note Synoptique de la Station :</strong> {dayRecord.synopticNotes}
          </p>
        </div>
      </div>
    </div>
  );
};
