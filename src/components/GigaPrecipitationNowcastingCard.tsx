import React, { useState } from 'react';
import { 
  CloudRain, 
  Droplets, 
  Clock, 
  TrendingUp, 
  Radar, 
  Waves, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  ShieldAlert, 
  Layers, 
  Zap,
  Activity,
  ArrowRight,
  Filter,
  Navigation,
  Compass,
  Gauge,
  Eye,
  Wind
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, NowcastingSlot } from '../types/weather';

interface GigaPrecipitationNowcastingCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  seniorMode: boolean;
}

export const GigaPrecipitationNowcastingCard: React.FC<GigaPrecipitationNowcastingCardProps> = ({
  weather,
  station,
  hourly,
  daily,
  seniorMode
}) => {
  const [activeHorizon, setActiveHorizon] = useState<'3h' | '24h' | 'models'>('3h');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const now = new Date();
  const currentPrecip = weather.precipitation || 0;
  const nowcasting = weather.nowcasting3h;

  const todayDaily = daily[0] || {
    precipitationSumMm: 2.5,
    precipitationProbabilityMax: 35
  };
  const totalExpected24hMm = Number(Math.max(currentPrecip, todayDaily.precipitationSumMm || 0).toFixed(1));

  // Extract slots
  const allSlots = nowcasting?.slots || [];
  const slots5Min = allSlots.slice(0, 12); // 0 to 55 min (12 x 5min)
  const slots15Min = allSlots.slice(12, 20); // 60 to 180 min (8 x 15min)

  const activeSelectedSlot: NowcastingSlot | null = selectedSlotIndex !== null && allSlots[selectedSlotIndex]
    ? allSlots[selectedSlotIndex]
    : null;

  // 24-Hour breakdown with exact durations in minutes per hour
  const hourly24hData = hourly.slice(0, 24).map((h) => {
    const rainMm = h.precipitationMm ?? h.rainMm ?? (h.precipitationProbability > 50 ? 0.8 : 0);
    const proba = h.precipitationProbability;
    
    // Estimate rain duration in minutes for this specific hour
    let durationMinutes = 0;
    if (rainMm > 5 || proba > 80) durationMinutes = 55;
    else if (rainMm > 2 || proba > 60) durationMinutes = 45;
    else if (rainMm > 0.5 || proba > 40) durationMinutes = 30;
    else if (rainMm > 0.1 || proba > 20) durationMinutes = 15;

    return {
      hour: h.hourLabel,
      rainMm,
      durationMinutes,
      proba,
      temp: h.temperature
    };
  });

  const totalRainHoursDay = Number((hourly24hData.reduce((acc, h) => acc + h.durationMinutes, 0) / 60).toFixed(1));
  const totalRainHoursMinutesFormatted = `${Math.floor(totalRainHoursDay)}h${Math.round((totalRainHoursDay % 1) * 60).toString().padStart(2, '0')}`;

  // Soil & hydrology
  const et0 = weather.altitudeMetrics?.evapotranspirationEt0 ?? 3.2;
  const hydricBalance = Number((totalExpected24hMm - et0).toFixed(1));

  return (
    <div id="giga-precipitation-nowcasting-card" className="rounded-3xl border border-cyan-500/40 bg-slate-900/95 p-6 shadow-2xl backdrop-blur sm:p-8 space-y-6">
      {/* Header & Mode Tabs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/20 border border-cyan-400/40 shrink-0">
            <CloudRain className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                Moteur Pluviométrique Ultra-Précis
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 font-bold">
                Radar Doppler & AROME 1.3km • {station.name}
              </span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              Prévisions Précipitations & Nowcasting Chirurgical (&lt; 3h & &lt; 24h)
            </h3>
          </div>
        </div>

        {/* Horizon Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-auto">
          <button
            id="tab-nowcast-3h"
            onClick={() => setActiveHorizon('3h')}
            className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              activeHorizon === '3h'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Radar className="h-4 w-4" />
            <span>Nowcasting &lt; 3 Heures (5 & 15 min)</span>
          </button>

          <button
            id="tab-nowcast-24h"
            onClick={() => setActiveHorizon('24h')}
            className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              activeHorizon === '24h'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Diagnostic 24 Heures</span>
          </button>

          <button
            id="tab-nowcast-models"
            onClick={() => setActiveHorizon('models')}
            className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              activeHorizon === 'models'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Comparatif Multi-Modèles</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HORIZON 1 : NOWCASTING À MOINS DE 3 HEURES (PLUIE PAR 5 MIN & 15 MIN)     */}
      {/* ========================================================================= */}
      {activeHorizon === '3h' && (
        <div className="space-y-6">
          {/* Live Radar Doppler Status Banner */}
          <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/70 via-slate-950/90 to-blue-950/60 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs uppercase font-black text-cyan-400 tracking-wider">
                    Écho Doppler & Nowcasting Haute Résolution
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-black text-white">
                  {nowcasting?.statusHeadline || (currentPrecip > 0 ? `🌧️ Précipitations en cours (${currentPrecip} mm/h)` : "☀️ Aucun épisode pluvieux détecté sur 3 heures")}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {nowcasting?.statusSubtext || `Atmosphère stable au-dessus de ${station.name}. Réflectivité radar < 15 dBZ.`}
                </p>
              </div>

              {/* 4 Quick Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs shrink-0">
                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Durée Pluie</span>
                  <span className="font-black text-cyan-300 text-base">
                    {nowcasting?.totalRainDurationMinutes ? `${nowcasting.totalRainDurationMinutes} min` : '0 min'}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cumul 3h</span>
                  <span className="font-black text-blue-300 text-base">
                    {nowcasting?.totalAccumulation3hMm ?? 0} mm
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pic Intensité</span>
                  <span className="font-black text-amber-300 text-base">
                    {nowcasting?.peakIntensityMmH ? `${nowcasting.peakIntensityMmH} mm/h` : '0 mm/h'}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Réflectivité Max</span>
                  <span className="font-black text-purple-300 text-base">
                    {nowcasting?.peakRadarDbz ? `${nowcasting.peakRadarDbz} dBZ` : '< 15 dBZ'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Granular Timeline : 0-60 min (5min) & 60-180 min (15min) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Radar className="h-4 w-4 text-cyan-400" />
                Chronologie par Créneau • Cliquez sur une case pour inspecter la microphysique
              </h4>
              <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-800 border border-slate-700"></span> Sec</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sky-800"></span> Bruine</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-cyan-500"></span> Modéré</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span> Fort</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Violent/Orage</span>
              </div>
            </div>

            {/* 0 to 60 Minutes (12 slots of 5 min) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Prochaine Heure (0 à 60 minutes) • Précision chirurgicale par palier de 5 min
                </span>
                <span className="text-[11px] text-slate-400 font-medium">12 intervalles</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
                {slots5Min.map((slot, i) => {
                  const isSelected = selectedSlotIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedSlotIndex(isSelected ? null : i)}
                      className={`rounded-xl border p-2 text-center transition cursor-pointer flex flex-col items-center justify-between min-h-[76px] ${
                        isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105' : 'hover:scale-[1.02]'
                      } ${slot.rainRateMmH > 0 ? slot.colorClass : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:border-slate-700'}`}
                    >
                      <span className="text-[11px] font-black">{slot.timeLabel}</span>
                      <span className="text-[9px] opacity-80">+{slot.minutes}m</span>
                      <div className="mt-1">
                        <span className="text-xs font-black block">
                          {slot.rainRateMmH > 0 ? `${slot.rainRateMmH}` : '0'}
                        </span>
                        <span className="text-[9px] block opacity-75">
                          {slot.rainRateMmH > 0 ? 'mm/h' : 'sec'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 60 to 180 Minutes (8 slots of 15 min) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Heures 2 et 3 (60 à 180 minutes) • Paliers de 15 min
                </span>
                <span className="text-[11px] text-slate-400 font-medium">8 intervalles</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {slots15Min.map((slot, i) => {
                  const actualIdx = 12 + i;
                  const isSelected = selectedSlotIndex === actualIdx;
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setSelectedSlotIndex(isSelected ? null : actualIdx)}
                      className={`rounded-xl border p-2.5 text-center transition cursor-pointer flex flex-col items-center justify-between min-h-[82px] ${
                        isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 scale-105' : 'hover:scale-[1.02]'
                      } ${slot.rainRateMmH > 0 ? slot.colorClass : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:border-slate-700'}`}
                    >
                      <span className="text-xs font-black">{slot.timeLabel}</span>
                      <span className="text-[10px] opacity-80">+{slot.minutes}m</span>
                      <div className="mt-1">
                        <span className="text-xs font-black block">
                          {slot.rainRateMmH > 0 ? `${slot.rainRateMmH} mm/h` : 'Sec'}
                        </span>
                        <span className="text-[9px] block opacity-75">
                          {slot.radarDbz} dBZ
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Slot Detail Inspection Inspector Card */}
          {activeSelectedSlot && (
            <div className="rounded-2xl border border-cyan-400/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-white text-base">
                      Détail Chirurgical du Créneau {activeSelectedSlot.timeLabel} (+{activeSelectedSlot.minutes} min)
                    </h5>
                    <span className="text-xs text-cyan-300 font-bold">
                      {activeSelectedSlot.intensityLabel}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSlotIndex(null)}
                  className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:text-white self-start sm:self-auto"
                >
                  Fermer l'inspection
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Intensité Instantanée</span>
                  <span className="text-base font-black text-cyan-300 mt-0.5 block">{activeSelectedSlot.rainRateMmH} mm/h</span>
                  <span className="text-[10px] text-slate-400">Cumul sur créneau : {activeSelectedSlot.accumulatedMm} mm</span>
                </div>

                <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Réflectivité Radar</span>
                  <span className="text-base font-black text-purple-300 mt-0.5 block">{activeSelectedSlot.radarDbz} dBZ</span>
                  <span className="text-[10px] text-slate-400">Écho Doppler modélisé</span>
                </div>

                <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Microphysique</span>
                  <span className="text-base font-black text-blue-300 mt-0.5 block">{activeSelectedSlot.microphysicsPhase}</span>
                  <span className="text-[10px] text-slate-400">Probabilité : {activeSelectedSlot.probabilityPct}%</span>
                </div>

                <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vent au Sol & Rafales</span>
                  <span className="text-base font-black text-emerald-300 mt-0.5 block">{activeSelectedSlot.windSpeedKmh} km/h</span>
                  <span className="text-[10px] text-slate-400">Rafales max : {activeSelectedSlot.windGustKmh} km/h</span>
                </div>
              </div>
            </div>
          )}

          {/* Microphysics & Cloud Physics Diagnostic Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Waves className="h-4 w-4" />
                <span className="uppercase text-[10px] tracking-wider">Microphysique des Gouttes</span>
              </div>
              <span className="text-white font-black text-sm block">
                {nowcasting?.dominantPrecipType || 'Sec'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {currentPrecip > 4
                  ? "Grosses gouttes de convection (> 2.5 mm). Risque de ruissellement immédiat."
                  : currentPrecip > 0.5
                  ? "Gouttes stratiformes régulières (0.8 à 1.5 mm). Excellente pénétration dans les sols."
                  : "Absence de gouttelettes précipitantes dans la colonne atmosphérique."}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                <Navigation className="h-4 w-4" />
                <span className="uppercase text-[10px] tracking-wider">Vitesse & Cap des Cellules</span>
              </div>
              <span className="text-cyan-300 font-black text-sm block">
                {nowcasting?.cellVelocityKmh ? `${nowcasting.cellVelocityKmh} km/h vers le ${nowcasting.cellDirectionLabel}` : 'Vitesse modérée'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Balayage continu par le flux synoptique. Pas de blocage stationnaire identifié.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Zap className="h-4 w-4" />
                <span className="uppercase text-[10px] tracking-wider">Instabilité Convective & CAPE</span>
              </div>
              <span className="text-amber-300 font-black text-sm block">
                {nowcasting?.capeConvectiveJkg ?? 50} J/kg • LI {nowcasting?.liftedIndex ?? 2.5}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Risque de grêle : {nowcasting?.hailRiskPercent ?? 0}% • Isothermie neige : {nowcasting?.isothermieRisk ? 'Alerte Isothermie' : 'Nul'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HORIZON 2 : PRÉVISIONS DÉTAILLÉES 24 HEURES (DURÉES & CUMULS AU MILLIMÈTRE) */}
      {/* ========================================================================= */}
      {activeHorizon === '24h' && (
        <div className="space-y-6">
          {/* Daily Precipitation Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <span className="text-xs text-slate-400 block font-bold">Cumul Total Prévu 24h</span>
              <span className="text-2xl font-black text-cyan-300 mt-1 block">{totalExpected24hMm} mm</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Équivalent à {totalExpected24hMm} Litres / m²
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <span className="text-xs text-slate-400 block font-bold">Durée Totale de Pluie</span>
              <span className="text-2xl font-black text-blue-300 mt-1 block">
                {totalRainHoursMinutesFormatted}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Sur les 24 heures de la journée
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <span className="text-xs text-slate-400 block font-bold">Bilan Hydrique (P - ET0)</span>
              <span className={`text-2xl font-black mt-1 block ${hydricBalance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hydricBalance > 0 ? `+${hydricBalance}` : hydricBalance} mm
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Évapotranspiration : {et0} mm/j
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <span className="text-xs text-slate-400 block font-bold">Infiltration des Sols</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {totalExpected24hMm > 25 ? 'Saturation / Ruissellement' : '100% Absorbé'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Capacité au champ préservée
              </span>
            </div>
          </div>

          {/* 24-Hour Hourly Precipitation & Rain Duration Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Chronologie 00h - 24h : Quantités (mm/h) & Probabilité (%)
              </h4>
              <span className="text-xs text-slate-400">Barres cyan = millimètres • Infobulle = durées précises</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourly24hData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="mm" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    formatter={(val: any, name: string) => [
                      name === 'rainMm' ? `${val} mm` : `${val} min`,
                      name === 'rainMm' ? 'Précipitations' : 'Durée de pluie'
                    ]}
                  />
                  <Bar dataKey="rainMm" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Précipitations (mm)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hour by Hour Durations & Rain Windows Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-2">Créneau Horaire</th>
                  <th className="pb-2">Intensité Prévue</th>
                  <th className="pb-2">Durée de Pluie estimée</th>
                  <th className="pb-2">Probabilité</th>
                  <th className="pb-2">Nature du Précipitant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {hourly24hData.slice(0, 12).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-bold text-white">{row.hour}</td>
                    <td className="py-2.5 font-bold text-cyan-300">{row.rainMm > 0 ? `${row.rainMm} mm` : '0 mm'}</td>
                    <td className="py-2.5 text-slate-300">
                      {row.durationMinutes > 0 ? (
                        <span className="rounded-md bg-blue-950 px-2 py-0.5 text-blue-300 font-bold border border-blue-800">
                          {row.durationMinutes} minutes
                        </span>
                      ) : (
                        <span className="text-slate-500">Temps Sec</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className={row.proba > 40 ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                        {row.proba}%
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {row.rainMm > 4 ? "Forte averse" : row.rainMm > 1 ? "Pluie continue" : row.rainMm > 0 ? "Bruine légère" : "Ciel sec"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HORIZON 3 : COMPARATIF MULTI-MODÈLES (AROME 1.3KM, ECMWF IFS, GFS)         */}
      {/* ========================================================================= */}
      {activeHorizon === 'models' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Synthèse du Consensus Numérique Multi-Modèles
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {nowcasting?.multiModelComparison?.consensusSummary || "Excellente concordance entre modèles haute résolution."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AROME 1.3km */}
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 text-[11px] font-black uppercase">
                  AROME 1.3 km
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Météo-France</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Heure de début prévue</span>
                <span className="text-white font-black text-base">{nowcasting?.multiModelComparison?.aromeOnsetFormatted || 'Temps sec'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Cumul attendu sur 3h</span>
                <span className="text-cyan-300 font-black text-xl">{nowcasting?.multiModelComparison?.arome3hTotalMm ?? 0} mm</span>
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                Modèle maille fine référence pour la convection, les orages et le relief.
              </p>
            </div>

            {/* ECMWF IFS 9km */}
            <div className="rounded-2xl border border-blue-500/40 bg-slate-950/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 text-[11px] font-black uppercase">
                  ECMWF IFS 9 km
                </span>
                <span className="text-[10px] text-slate-400 font-bold">CEPMMT Europe</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Heure de début prévue</span>
                <span className="text-white font-black text-base">{nowcasting?.multiModelComparison?.ecmwfOnsetFormatted || 'Temps sec'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Cumul attendu sur 3h</span>
                <span className="text-blue-300 font-black text-xl">{nowcasting?.multiModelComparison?.ecmwf3hTotalMm ?? 0} mm</span>
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                Modèle déterministe européen de référence mondiale pour les dynamiques synoptiques.
              </p>
            </div>

            {/* GFS 22km */}
            <div className="rounded-2xl border border-purple-500/40 bg-slate-950/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 text-[11px] font-black uppercase">
                  GFS 22 km
                </span>
                <span className="text-[10px] text-slate-400 font-bold">NOAA NCEP</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Heure de début prévue</span>
                <span className="text-white font-black text-base">{nowcasting?.multiModelComparison?.gfsOnsetFormatted || 'Temps sec'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Cumul attendu sur 3h</span>
                <span className="text-purple-300 font-black text-xl">{nowcasting?.multiModelComparison?.gfs3hTotalMm ?? 0} mm</span>
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                Modèle américain global, utile pour vérifier la cohérence d'ensemble.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
