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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-2xl">
            {dayRecord.weatherEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <span>{station.name} ({station.altitude} m)</span>
              <span>•</span>
              <span className="text-slate-400">Archive Météorologique Enregistrée</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {dayRecord.dayOfWeek} {dayRecord.dayFormatted}
            </h2>
            <div className="text-sm font-semibold text-slate-300">
              {dayRecord.weatherDescription}
            </div>
          </div>
        </div>

        {/* Core Temperature & Anomaly Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tmin */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase text-blue-400">
              <ArrowDown className="h-3.5 w-3.5" />
              T° Minimale (Nuit)
            </div>
            <div className="mt-1 text-2xl font-black text-blue-300">
              {dayRecord.tempMin}°C
            </div>
            <div className="text-[10px] text-slate-400">À l'aube</div>
          </div>

          {/* Tmax */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase text-rose-400">
              <ArrowUp className="h-3.5 w-3.5" />
              T° Maximale (Jour)
            </div>
            <div className="mt-1 text-2xl font-black text-rose-300">
              {dayRecord.tempMax}°C
            </div>
            <div className="text-[10px] text-slate-400">Au zénith / après-midi</div>
          </div>

          {/* Tmean */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="text-[11px] font-bold uppercase text-slate-400">Moyenne 24h</div>
            <div className="mt-1 text-2xl font-black text-white">
              {dayRecord.tempMean}°C
            </div>
            <div className="text-[10px] text-slate-400">Normale : {dayRecord.normalTempMean}°C</div>
          </div>

          {/* Anomaly */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="text-[11px] font-bold uppercase text-slate-400">Écart Climatologique</div>
            <div className={`mt-1 text-2xl font-black ${dayRecord.tempAnomalyVsNormal >= 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {dayRecord.tempAnomalyVsNormal > 0 ? `+${dayRecord.tempAnomalyVsNormal}` : dayRecord.tempAnomalyVsNormal}°C
            </div>
            <div className="text-[10px] text-slate-400">vs Réf. 1991-2020</div>
          </div>
        </div>

        {/* Detailed Secondary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex items-center gap-2.5">
            <CloudRain className="h-5 w-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Pluviométrie 24h</div>
              <div className="font-bold text-white text-sm">
                {dayRecord.precipitationMm} mm <span className="text-slate-400 text-[11px]">({dayRecord.precipitationDurationHours}h de pluie)</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex items-center gap-2.5">
            <Wind className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Rafale Max & Direction</div>
              <div className="font-bold text-white text-sm">
                {dayRecord.windGustMaxKmh} km/h <span className="text-slate-400 text-[11px]">({dayRecord.dominantWindDirection})</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex items-center gap-2.5">
            <Sun className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Ensoleillement & Rayonnement</div>
              <div className="font-bold text-white text-sm">
                {dayRecord.sunshineHours} h <span className="text-slate-400 text-[11px]">({dayRecord.solarRadiationKwhM2} kWh/m²)</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex items-center gap-2.5">
            <Gauge className="h-5 w-5 text-teal-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Pression Barométrique</div>
              <div className="font-bold text-white text-sm">
                {dayRecord.pressureMeanHpa} hPa
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex items-center gap-2.5">
            <Droplet className="h-5 w-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Humidité & Point de Rosée</div>
              <div className="font-bold text-white text-sm">
                {dayRecord.humidityMinPct}% à {dayRecord.humidityMaxPct}% <span className="text-slate-400 text-[11px]">({dayRecord.dewPointMeanC}°C)</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Isotherme 0°C</div>
              <div className="font-bold text-white text-sm">
                {dayRecord.isotherm0Meters} m
              </div>
            </div>
          </div>
        </div>

        {/* 24h Hourly Profile Reconstructed Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Reconstitution Horaire de la Journée</span>
            <span className="text-slate-400">Évolution de la Température (°C)</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} name="Température (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All-time records benchmark */}
        {dayRecord.allTimeDailyRecordsComparison && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2 text-xs">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-400" />
              Records Historiques pour cette Date Climatologique à {station.name} :
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
              <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Record de Chaleur</span>
                <div className="font-bold text-rose-300 text-sm">
                  +{dayRecord.allTimeDailyRecordsComparison.recordMaxForDay}°C
                </div>
                <div className="text-[10px] text-slate-400">En {dayRecord.allTimeDailyRecordsComparison.recordMaxYear}</div>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Record de Froid</span>
                <div className="font-bold text-cyan-300 text-sm">
                  {dayRecord.allTimeDailyRecordsComparison.recordMinForDay}°C
                </div>
                <div className="text-[10px] text-slate-400">En {dayRecord.allTimeDailyRecordsComparison.recordMinYear}</div>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Record Pluie 24h</span>
                <div className="font-bold text-blue-300 text-sm">
                  {dayRecord.allTimeDailyRecordsComparison.recordRainForDay} mm
                </div>
                <div className="text-[10px] text-slate-400">En {dayRecord.allTimeDailyRecordsComparison.recordRainYear}</div>
              </div>
            </div>
          </div>
        )}

        {/* Synoptic Note Footnote */}
        <div className="rounded-xl bg-slate-900/70 p-3.5 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Note Synoptique de la Station :</strong> {dayRecord.synopticNotes}
          </p>
        </div>
      </div>
    </div>
  );
};
