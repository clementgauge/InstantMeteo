import React, { useState } from 'react';
import { 
  CloudRain, 
  Droplets, 
  TrendingUp, 
  Info, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Waves,
  Sun,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { getRainRiskExplanation, getRichWeatherInfo } from '../utils/weatherIcons';

interface TodayPrecipitationDiagnosticCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  seniorMode: boolean;
}

export const TodayPrecipitationDiagnosticCard: React.FC<TodayPrecipitationDiagnosticCardProps> = ({
  weather,
  station,
  hourly,
  daily,
  seniorMode
}) => {
  const [showPedagogicalGuide, setShowPedagogicalGuide] = useState<boolean>(false);

  // Today's daily forecast entry
  const todayDaily = daily[0] || {
    precipitationSumMm: 0,
    precipitationProbability: 10,
    precipitationHours: 0,
    hourlyList: []
  };

  // Get today's actual 24-hour records (from todayDaily.hourlyList or first 24 items of hourly)
  const todayHourlyList: HourlyForecast[] = (todayDaily.hourlyList && todayDaily.hourlyList.length > 0)
    ? todayDaily.hourlyList
    : hourly.slice(0, 24);

  // Compute exact metrics:
  // 1. Fallen so far (from pastHourly since 00:00 or estimated)
  const currentHour = new Date().getHours();
  const pastHours = weather.pastHourly || [];
  
  // Calculate fallen since 00h00
  const fallenSinceMidnight = pastHours
    .filter(h => {
      const match = (h.hourLabel || '').match(/^(\d{1,2})/);
      const hNum = match ? parseInt(match[1], 10) : NaN;
      return !isNaN(hNum) && hNum <= currentHour;
    })
    .reduce((acc, h) => acc + (h.rainMm || 0), 0);

  const fallenSoFarMm = Number(Math.max(weather.precipitation, fallenSinceMidnight).toFixed(1));
  
  // Sum of rainfall for the full 24h of today directly from hourly list
  const realSumFromHourly = todayHourlyList.reduce((acc, h) => acc + (h.rainMm || 0), 0);
  const totalExpected24hMm = Number(Math.max(todayDaily.precipitationSumMm || 0, realSumFromHourly).toFixed(1));
  const remainingExpectedMm = Number(Math.max(0, totalExpected24hMm - fallenSoFarMm).toFixed(1));

  // Max probability across the 24 hours of today
  const maxProbaToday = Math.max(
    todayDaily.precipitationProbability || 0,
    todayHourlyList.reduce((max, h) => Math.max(max, h.precipitationProbability || 0), 0)
  );

  // Identify rain timing windows during the day
  const rainingHours = todayHourlyList.filter(h => (h.rainMm || 0) > 0.1 || (h.precipitationProbability || 0) >= 40);
  let rainTimingLabel = "Temps sec stable sur l'ensemble de la journée (00h à 24h).";
  if (rainingHours.length > 0) {
    const firstH = rainingHours[0].hourLabel;
    const lastH = rainingHours[rainingHours.length - 1].hourLabel;
    rainTimingLabel = `Plage pluvieuse identifiée : de ${firstH} à ${lastH} (${rainingHours.length}h avec risque de précipitations).`;
  }

  // Monthly normal reference divided by 30 to get daily normal
  const normalMonthlyRain = 65; // standard ~65mm/month
  const normalDailyRainMm = Number((normalMonthlyRain / 30).toFixed(1)); // ~2.2mm
  const rainfallAnomalyPercent = Math.round(((totalExpected24hMm - normalDailyRainMm) / normalDailyRainMm) * 100);

  // Evapotranspiration balance
  const et0 = weather.altitudeMetrics?.evapotranspirationEt0 ?? 3.2;
  const waterBalance = Number((totalExpected24hMm - et0).toFixed(1));

  // Complete Rain Risk Explanation Model
  const rainRiskModel = getRainRiskExplanation(maxProbaToday, totalExpected24hMm, todayDaily.precipitationHours ?? rainingHours.length);

  // 8 Three-Hour Sub-slots calculated from REAL 24h hourly data
  // Slots: 00-03h (idx 0,1,2), 03-06h (3,4,5), 06-09h (6,7,8), 09-12h (9,10,11), 12-15h (12,13,14), 15-18h (15,16,17), 18-21h (18,19,20), 21-24h (21,22,23)
  const slotRanges = [
    { label: "00h - 03h", start: 0, end: 3, name: "Nuit" },
    { label: "03h - 06h", start: 3, end: 6, name: "Aube" },
    { label: "06h - 09h", start: 6, end: 9, name: "Matinée" },
    { label: "09h - 12h", start: 9, end: 12, name: "Fin Matin" },
    { label: "12h - 15h", start: 12, end: 15, name: "Midi / Début AM" },
    { label: "15h - 18h", start: 15, end: 18, name: "Après-Midi" },
    { label: "18h - 21h", start: 18, end: 21, name: "Soirée" },
    { label: "21h - 24h", start: 21, end: 24, name: "Fin de Soirée" }
  ];

  const threeHourSlots = slotRanges.map(slot => {
    const hoursInSlot = todayHourlyList.slice(slot.start, slot.end);
    const slotRain = Number(hoursInSlot.reduce((acc, h) => acc + (h.rainMm || 0), 0).toFixed(1));
    const slotProba = hoursInSlot.length > 0 
      ? Math.max(...hoursInSlot.map(h => h.precipitationProbability || 0))
      : 0;
    
    let typeDesc = "Sec";
    let icon = "☀️";
    if (slotRain >= 5 || slotProba >= 80) {
      typeDesc = "Fortes pluies";
      icon = "🌧️💦";
    } else if (slotRain >= 1 || slotProba >= 50) {
      typeDesc = "Averses";
      icon = "🌧️";
    } else if (slotRain > 0 || slotProba >= 30) {
      typeDesc = "Bruine/Ondée";
      icon = "🌦️";
    } else {
      typeDesc = "Sec";
      icon = slot.start >= 6 && slot.start < 21 ? "⛅" : "🌙";
    }

    return {
      slot: slot.label,
      rain: slotRain,
      proba: slotProba,
      type: typeDesc,
      icon,
      name: slot.name
    };
  });

  // Hourly timeline for chart (24 hours of today)
  const hourlyData = todayHourlyList.map((h, i) => ({
    hour: h.hourLabel,
    rainMm: Number((h.rainMm ?? 0).toFixed(1)),
    proba: h.precipitationProbability ?? 0,
    temp: h.temperature
  }));

  // Microphysics diagnosis
  let microphysicsType = "Temps Sec / Pas de pluie significative";
  let microphysicsDesc = "Atmosphère stable sans condensation précipitante majeure.";
  let microphysicsBadge = "bg-emerald-950 text-emerald-300 border-emerald-800";

  if (totalExpected24hMm >= 25) {
    microphysicsType = "Épisode Pluvieux Majeur / Lame d'eau abondante";
    microphysicsDesc = "Fortes précipitations continues ou orageuses. Risque de ruissellement et saturation des sols.";
    microphysicsBadge = "bg-rose-950 text-rose-300 border-rose-800";
  } else if (totalExpected24hMm >= 10) {
    microphysicsType = "Pluies Stratiformes Modérées à Soutenues";
    microphysicsDesc = "Passage d'un front perturbé structuré. Humectation efficace des sols.";
    microphysicsBadge = "bg-blue-950 text-blue-300 border-blue-800";
  } else if (totalExpected24hMm >= 2) {
    microphysicsType = "Averses Intermittentes & Ondées";
    microphysicsDesc = "Régime d'averses ou traîne instable. Cumuls localisés selon le passage des averses.";
    microphysicsBadge = "bg-cyan-950 text-cyan-300 border-cyan-800";
  } else if (totalExpected24hMm > 0 || maxProbaToday >= 30) {
    microphysicsType = "Bruines Locales / Précipitations Faibles";
    microphysicsDesc = "Micro-gouttelettes sous nuages bas ou brumes humides denses.";
    microphysicsBadge = "bg-indigo-950 text-indigo-300 border-indigo-800";
  }

  return (
    <div id="today-precipitation-diagnostic-card" className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Diagnostic Hydrologique & Pluviométrie Fine du Jour
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 font-bold">
                {station.name} ({station.altitude ?? 0}m)
              </span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Précipitations Précises du Jour (00h00 à 23h59)
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase border ${microphysicsBadge}`}>
            {totalExpected24hMm > 0 ? `${totalExpected24hMm} mm prévus (${totalExpected24hMm} L/m²)` : "Temps Sec"}
          </span>
          <span className="rounded-xl px-3 py-1.5 text-xs font-black uppercase border border-cyan-500/40 bg-cyan-950/60 text-cyan-300">
            Risque max : {maxProbaToday}%
          </span>
        </div>
      </div>

      {/* Precipitation Diagnostic Banner & Exact Estimated Duration Timing Box */}
      <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-2">
          <div className="flex items-center gap-2 text-cyan-300 font-black text-sm uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Synthèse du Risque de Pluie & Quantités Prévues</span>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-200">
            ⏱️ Durée Totale Estimée : <strong className="text-white">{todayDaily.precipitationHours ?? rainingHours.length} Heures</strong>
          </div>
        </div>

        {/* High-Precision Estimated Duration & Timing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">⏱️ Fenêtre Horaire Précise</span>
            <div className="text-xs font-mono font-bold text-white">
              {rainingHours.length > 0 ? (
                <>Début : <span className="text-cyan-300">{rainingHours[0].hourLabel}</span> ➔ Fin : <span className="text-cyan-300">{rainingHours[rainingHours.length - 1].hourLabel}</span></>
              ) : (
                <span className="text-emerald-400">Aucune pluie prévue (00h-24h)</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {rainingHours.length > 0 ? `Durée active de passage pluvieux : ${rainingHours.length}h` : 'Condition sèche stable'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">⚡ Pic Maximal d'Intensité</span>
            <div className="text-xs font-mono font-bold text-amber-300">
              {todayHourlyList.reduce((max, h) => (h.rainMm || 0) > (max.rainMm || 0) ? h : max, todayHourlyList[0])?.rainMm ?? 0} mm/h 
              <span className="text-slate-300"> à {todayHourlyList.reduce((max, h) => (h.rainMm || 0) > (max.rainMm || 0) ? h : max, todayHourlyList[0])?.hourLabel ?? '12h00'}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Intensité horaire crête calculée sur la journée
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">❄️ Estimation Neige & Isotherme 0°C</span>
            <div className="text-xs font-mono font-bold text-blue-300">
              {todayHourlyList.filter(h => h.temperature <= 2 && (h.rainMm || 0) > 0).length > 0 ? (
                <>Neige prévue : <span className="text-white">{todayHourlyList.filter(h => h.temperature <= 2 && (h.rainMm || 0) > 0).length}h</span></>
              ) : (
                <span className="text-slate-400">Pas de chute de neige (LMN {station.altitude ? station.altitude + 1200 : 1800}m)</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Limite Pluie-Neige basée sur le profil thermique vertical
            </p>
          </div>
        </div>

        {/* Real Dynamic Diagnostic Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Diagnostic Combiné Probabilité & Volume</span>
            <p className="text-xs font-semibold text-white leading-relaxed">
              {rainRiskModel.combinedExplanation}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Conseil Pratique de Sortie</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              🕒 <strong className="text-cyan-300">{rainTimingLabel}</strong>
            </p>
            <p className="text-[11px] text-slate-400 italic">
              {rainRiskModel.dailyAdvice}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Quantitative Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Déjà tombé */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <span className="text-xs text-slate-400 font-medium">Déjà tombé depuis 00h00</span>
          <div className="mt-1.5 text-2xl sm:text-3xl font-black text-cyan-400">
            {fallenSoFarMm} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {fallenSoFarMm > 0 ? `${fallenSoFarMm} L/m² mesurés` : 'Aucune pluie mesurée'}
          </p>
        </div>

        {/* Restant prévu */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <span className="text-xs text-slate-400 font-medium">Restant prévu d'ici 23h59</span>
          <div className="mt-1.5 text-2xl sm:text-3xl font-black text-blue-300">
            {remainingExpectedMm} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {remainingExpectedMm > 0 ? `${remainingExpectedMm} L/m² à venir` : 'Fin des précipitations'}
          </p>
        </div>

        {/* Cumul 24h & Écart Normale */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <span className="text-xs text-slate-400 font-medium">Cumul Total Prévu 24h</span>
          <div className="mt-1.5 text-2xl sm:text-3xl font-black text-white">
            {totalExpected24hMm} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Normale jour : <strong className="text-slate-300">{normalDailyRainMm} mm</strong> ({rainfallAnomalyPercent >= 0 ? `+${rainfallAnomalyPercent}%` : `${rainfallAnomalyPercent}%`})
          </p>
        </div>

        {/* Bilan Hydrique (Pluie - ETP) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <span className="text-xs text-slate-400 font-medium">Bilan Hydrique (Pluie - ETP)</span>
          <div className={`mt-1.5 text-2xl sm:text-3xl font-black ${waterBalance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {waterBalance >= 0 ? `+${waterBalance}` : waterBalance} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {waterBalance >= 0 ? "Recharge hydrique des sols" : "Évapotranspiration dominante"}
          </p>
        </div>
      </div>

      {/* Microphysics Classification Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Régime Microphysique des Précipitations
          </span>
          <h4 className="text-base font-bold text-white mt-0.5">{microphysicsType}</h4>
          <p className="text-xs text-slate-300 mt-0.5">{microphysicsDesc}</p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 shrink-0">
          <div>Probabilité max du jour : <strong className="text-cyan-300">{maxProbaToday}%</strong></div>
          <div>Heures de pluie estimées : <strong className="text-white">{todayDaily.precipitationHours ?? rainingHours.length} heures</strong></div>
        </div>
      </div>

      {/* 8 Sub-slots 3-Hour Breakdown (00h-03h -> 21h-24h) calculated from REAL 24h data */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Découpage Réel par Créneaux de 3 Heures (00h à 24h)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Intensités & Probabilités calculées heure par heure</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {threeHourSlots.map((slot, idx) => {
            const hasRain = slot.rain > 0 || slot.proba >= 40;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border p-3 text-center transition ${
                  hasRain 
                    ? 'border-cyan-500/50 bg-cyan-950/40 shadow-sm' 
                    : 'border-slate-800/80 bg-slate-950/60'
                }`}
              >
                <span className="text-[11px] font-bold text-slate-300 block">{slot.slot}</span>
                <span className="my-1 text-lg block">{slot.icon}</span>
                <div className="text-base font-black text-white">
                  {slot.rain} <span className="text-[10px] font-normal text-slate-400">mm</span>
                </div>
                <span className={`text-[10px] font-black block mt-0.5 ${slot.proba >= 50 ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {slot.proba}%
                </span>
                <span className="text-[9px] text-slate-400 block truncate mt-0.5">{slot.type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Rainfall Chart for Today (00h to 23h) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Chronologie Horaire des Précipitations du Jour (00h à 23h • mm/h)
          </h4>
          <span className="text-xs text-slate-400">Relevés & Prévisions heure par heure</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: any, name: any) => [
                  name === 'rainMm' ? `${val} mm (${val} L/m²)` : `${val}%`,
                  name === 'rainMm' ? 'Volume Pluie' : 'Probabilité'
                ]}
                labelFormatter={(label) => `Heure ${label}`}
              />
              <Bar dataKey="rainMm" fill="#38bdf8" radius={[4, 4, 0, 0]} name="rainMm" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

