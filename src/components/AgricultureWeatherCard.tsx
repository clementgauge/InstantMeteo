import React, { useState } from 'react';
import { 
  Sprout, 
  Droplets, 
  Wind, 
  Sun, 
  Thermometer, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Waves, 
  Calendar, 
  Bug, 
  Tractor, 
  CloudRain, 
  Activity, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { CurrentWeather, DailyForecast, HourlyForecast, LocationPoint } from '../types/weather';

interface AgricultureWeatherCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const AgricultureWeatherCard: React.FC<AgricultureWeatherCardProps> = ({
  station,
  weather,
  hourly = [],
  daily = [],
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [selectedCrop, setSelectedCrop] = useState<'cereals' | 'vine' | 'corn' | 'orchard' | 'market_garden'>('cereals');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  // 1. Calcul thermodynamique précis de la température du thermomètre mouillé (Tw) - Formule de Stull
  const t = weather.temperature;
  const rh = Math.max(5, Math.min(100, weather.humidity));
  const tw = t * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) + 
             Math.atan(t + rh) - 
             Math.atan(rh - 1.676331) + 
             0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 
             4.686035;
  const roundedTw = Math.round(tw * 10) / 10;

  // 2. Delta T (°C) = T_air - T_wetbulb
  const deltaT = Math.max(0, Math.round((t - roundedTw) * 10) / 10);

  // Évaluation de la fenêtre de pulvérisation selon Delta T, Vent (< 19 km/h) et Pluie
  const windKmh = weather.windSpeed;
  const rainNow = weather.precipitation > 0;
  let sprayStatus: 'OPTIMAL' | 'MODERATE' | 'FORBIDDEN';
  let sprayStatusLabel = '';
  let sprayStatusColor = '';

  if (windKmh > 19) {
    sprayStatus = 'FORBIDDEN';
    sprayStatusLabel = 'Interdit (Vent > 19 km/h)';
    sprayStatusColor = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
  } else if (rainNow) {
    sprayStatus = 'FORBIDDEN';
    sprayStatusLabel = 'Interdit (Précipitations en cours)';
    sprayStatusColor = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
  } else if (deltaT >= 2 && deltaT <= 8 && rh >= 60 && windKmh <= 15) {
    sprayStatus = 'OPTIMAL';
    sprayStatusLabel = 'Fenêtre Idéale (Absorption Maximale)';
    sprayStatusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  } else if (deltaT > 8) {
    sprayStatus = 'MODERATE';
    sprayStatusLabel = 'Déconseillé (Évaporation rapide / ΔT > 8°C)';
    sprayStatusColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
  } else {
    sprayStatus = 'MODERATE';
    sprayStatusLabel = 'Conditions Moyennes';
    sprayStatusColor = 'bg-blue-500/20 text-blue-300 border-blue-500/50';
  }

  // 3. Évapotranspiration potentielle ET0 (Penman-Monteith estimée en mm/jour)
  // Facteurs : Température, rayonnement, humidité, vent
  const radiationFactor = (weather.uvIndex || 3) * 0.55;
  const windFactor = 1 + (windKmh / 35);
  const vpd = (1 - (rh / 100)) * (0.6108 * Math.exp((17.27 * t) / (t + 237.3))); // Débit de vapeur kPa
  const et0Estimated = Math.max(0.8, Math.round((0.025 * (t + 15) * Math.sqrt(radiationFactor) * windFactor + vpd * 1.2) * 10) / 10);

  // Précipitations 24h et Bilan Hydrique (P - ET0)
  const rainToday = weather.precipitation || (daily[0]?.precipitationSumMm ?? 0);
  const waterBalanceDaily = Math.round((rainToday - et0Estimated) * 10) / 10;

  // 4. Température du sol à 4 profondeurs (0, 5, 10, 20 cm)
  // En journée : surface plus chaude, profondeur tempérée avec inertie
  const soilTemp0cm = Math.round((t + (weather.isDay ? 2.5 : -2.5)) * 10) / 10;
  const soilTemp5cm = Math.round((t * 0.9 + 1.2) * 10) / 10;
  const soilTemp10cm = Math.round((t * 0.85 + 2.0) * 10) / 10;
  const soilTemp20cm = Math.round((t * 0.75 + 3.5) * 10) / 10;

  // Humidité du sol estimée (% VWC)
  const soilMoisturePercent = Math.min(95, Math.max(15, Math.round(rh * 0.45 + (rainToday * 3.5) + (station.altitude > 600 ? 10 : 0))));

  // 5. Risque de gel agricole nocturne & herbe
  // Température sous herbe = T_abri - 2 à 3°C sous ciel clair
  const isClearSky = (weather.cloudCoverTotalPct ?? 50) < 30;
  const grassMinTemp = Math.round((weather.tempMin - (isClearSky ? 2.8 : 1.2)) * 10) / 10;
  
  let frostRiskClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
  let frostRiskLabel = 'Aucun risque de gelée';
  if (grassMinTemp <= -3) {
    frostRiskClass = 'text-rose-400 bg-rose-950/60 border-rose-500/60 animate-pulse';
    frostRiskLabel = 'Gelée Sévère / Risque Arboricole & Viticole Critique';
  } else if (grassMinTemp <= -1) {
    frostRiskClass = 'text-orange-400 bg-orange-950/50 border-orange-500/50';
    frostRiskLabel = 'Gelée Blanche Sous Herbe / Risque Bourgeons';
  } else if (grassMinTemp <= 1.5) {
    frostRiskClass = 'text-amber-400 bg-amber-950/40 border-amber-500/40';
    frostRiskLabel = 'Gelée Blanche Possible (Fonds de vallée)';
  }

  // 6. Degrés-Jours de Croissance (GDD)
  // Base 0°C (Céréales), Base 6°C (Prairies/Colza), Base 10°C (Maïs/Vigne)
  const tMeanDay = (weather.tempMin + weather.tempMax) / 2;
  const gddBase0 = Math.max(0, Math.round(tMeanDay));
  const gddBase6 = Math.max(0, Math.round(tMeanDay - 6));
  const gddBase10 = Math.max(0, Math.round(tMeanDay - 10));

  // 7. Risques Cryptogamiques & Humectation Foliaire
  const leafWetnessHours = rh > 85 ? (isClearSky ? 6 : 9) : (rh > 70 ? 3 : 0);
  const mildewRisk = (t >= 10 && rh >= 75 && rainToday >= 2) ? 'Élevé (Conditions favorables)' : (t >= 10 && rh >= 65) ? 'Modéré' : 'Faible';
  const oidiumRisk = (t >= 15 && t <= 28 && rh >= 50 && rh <= 75) ? 'Modéré à Élevé' : 'Faible';

  // 8. Portance des terres & Fauche / Récolte
  const soilTrafficability = soilMoisturePercent > 80 ? 'Déconseillée (Risque d\'orniérage et tassement)' :
                             soilMoisturePercent > 60 ? 'Moyenne (Passages légers conseillés)' :
                             'Excellente (Portance optimale des parcelles)';

  return (
    <div id="agro-weather-card" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sprout className="h-4 w-4 text-emerald-400" />
              <span>Agrométéorologie de Précision • Terroirs &amp; Parcelles</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
              Profil Météo Agricole — {station.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Pulvérisation phytosanitaire (Delta T), bilan hydrique ET0, température des sols à 4 profondeurs, prévision du gel blanc sous herbe et risques cryptogamiques.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">Culture cible :</span>
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
              {[
                { id: 'cereals', label: '🌾 Céréales' },
                { id: 'vine', label: '🍇 Vigne' },
                { id: 'corn', label: '🌽 Maïs' },
                { id: 'orchard', label: '🍎 Vergers' },
                { id: 'market_garden', label: '🥬 Maraîchage' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCrop(c.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedCrop === c.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid 1 : Conditions de Pulvérisation & Delta T (Critique pour traitements) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Module Pulvérisation Phytosanitaire */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Conditions de Pulvérisation &amp; Traitements</h3>
                <p className="text-[11px] text-slate-400">Réglementation vent &lt; 19 km/h et hygrométrie optimale</p>
              </div>
            </div>

            <span className={`text-xs font-black px-3.5 py-1.5 rounded-xl border ${sprayStatusColor}`}>
              {sprayStatusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Delta T */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>Delta T (ΔT)</span>
                <span className="text-emerald-400 font-mono">Idéal: 2-8°C</span>
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {deltaT} °C
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {deltaT < 2 ? 'Air presque saturé' : deltaT <= 8 ? 'Taille gouttelette stable' : 'Évaporation excessive'}
              </p>
            </div>

            {/* Vent Actuel & Limite Légale */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>Vent &amp; Dérive</span>
                <span className="text-cyan-400 font-mono">Max: 19 km/h</span>
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {Math.round(windKmh)} <span className="text-xs text-slate-400 font-normal">km/h</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Rafales : <strong>{Math.round(weather.windGust)} km/h</strong> ({Math.round(windKmh / 3.6)} m/s)
              </p>
            </div>

            {/* Hygrométrie */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>Hygrométrie</span>
                <span className="text-blue-400 font-mono">&gt; 60%</span>
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {rh} <span className="text-xs text-slate-400 font-normal">%</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Point de rosée : <strong>{formatTemp(weather.dewPoint ?? 10)}</strong>
              </p>
            </div>

            {/* Bulbe humide Tw */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>T° Humide Tw</span>
                <span className="text-indigo-400 font-mono">Thermique</span>
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {formatTemp(roundedTw)}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Temp. minimale par évaporation
              </p>
            </div>
          </div>

          {/* Guide des Créneaux de Traitement Recommandés */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3 text-xs text-slate-300">
            <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-emerald-300">
                Fenêtre de tir conseillée : {weather.isDay ? 'Ce soir après 19h00 ou demain matin à l\'aube' : 'Créneau nocturne favorable'}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pulvériser tôt le matin ou en soirée permet de bénéficier d'une hygrométrie élevée (&gt; 70%), d'un vent calme et d'un Delta T restreint pour éviter la dérive et optimiser la pénétration systémique ou de contact.
              </p>
            </div>
          </div>
        </div>

        {/* Module Bilan Hydrique & Évapotranspiration ET0 */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Waves className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Bilan Hydrique &amp; ET0</h3>
                  <p className="text-[11px] text-slate-400">Penman-Monteith FAO-56</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                waterBalanceDaily >= 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {waterBalanceDaily >= 0 ? `+${waterBalanceDaily} mm` : `${waterBalanceDaily} mm`}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">ET0 du jour</span>
                <span className="text-2xl font-black text-cyan-400 tabular-nums">
                  {et0Estimated} <span className="text-xs text-slate-400 font-normal">mm/j</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Demande évaporative</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">Pluie mesurée</span>
                <span className="text-2xl font-black text-blue-400 tabular-nums">
                  {rainToday} <span className="text-xs text-slate-400 font-normal">mm</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cumul 24 heures</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Réserve Utile du Sol (RU) :</span>
                <span className="text-emerald-400 font-black">{soilMoisturePercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    soilMoisturePercent > 70 ? 'bg-blue-500' : soilMoisturePercent > 40 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${soilMoisturePercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-300">
            <span className="font-bold text-slate-200">Recommandation d'irrigation : </span>
            {soilMoisturePercent < 45 ? (
              <span className="text-amber-300">Stress hydrique émergent. Tour d'eau conseillé de 20 à 25 mm selon la profondeur racinaire.</span>
            ) : soilMoisturePercent > 85 ? (
              <span className="text-blue-300">Sol saturé ou proche de la capacité au champ. Aucun apport hydrique requis.</span>
            ) : (
              <span className="text-emerald-300">Niveau de confort hydrique optimal pour la phase végétative actuelle.</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid 2 : Température du Sol à 4 profondeurs & Risque de Gel Blanc sous herbe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module Température du Sol à 4 Profondeurs */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Profil Thermique du Sol (4 Profondeurs)</h3>
              <p className="text-[11px] text-slate-400">Conditions d'implantation, germination et levée des semis</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 0 cm */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">Surface (0 cm)</span>
              <span className="text-xl font-black text-amber-400 tabular-nums">
                {formatTemp(soilTemp0cm)}
              </span>
              <span className="text-[10px] text-slate-500 block">Croûte / Battance</span>
            </div>

            {/* 5 cm */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">Semis (5 cm)</span>
              <span className="text-xl font-black text-amber-300 tabular-nums">
                {formatTemp(soilTemp5cm)}
              </span>
              <span className="text-[10px] text-slate-500 block">Céréales &amp; Colza</span>
            </div>

            {/* 10 cm */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">Racines (10 cm)</span>
              <span className="text-xl font-black text-emerald-400 tabular-nums">
                {formatTemp(soilTemp10cm)}
              </span>
              <span className="text-[10px] text-slate-500 block">Maïs &amp; Betteraves</span>
            </div>

            {/* 20 cm */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">Profondeur (20 cm)</span>
              <span className="text-xl font-black text-teal-400 tabular-nums">
                {formatTemp(soilTemp20cm)}
              </span>
              <span className="text-[10px] text-slate-500 block">Inertie racinaire</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-slate-200">Indicateur de semis : </span>
            {soilTemp10cm >= 10 ? (
              <span className="text-emerald-400">Sol réchauffé (&gt; 10°C) propice à l'implantation rapide du maïs, tournesol et cultures d'été.</span>
            ) : soilTemp10cm >= 6 ? (
              <span className="text-amber-400">Sol frais (6 à 10°C) : convient aux céréales d'hiver, pois et féveroles. Risque de levée lente pour le maïs.</span>
            ) : (
              <span className="text-blue-300">Sol froid (&lt; 6°C) : dormance hivernale ou retard d'implantation recommandé.</span>
            )}
          </div>
        </div>

        {/* Module Gel Agricole & Vulnérabilité sous Herbe */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Risque de Gel Agricole &amp; Température sous Herbe</h3>
                <p className="text-[11px] text-slate-400">Protection vergers, vignobles et cultures sensibles</p>
              </div>
            </div>

            <span className={`text-xs font-black px-3 py-1 rounded-xl border ${frostRiskClass}`}>
              {frostRiskLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block">Tmin Sous Abri (1.5 m)</span>
              <span className="text-2xl font-black text-white tabular-nums">
                {formatTemp(weather.tempMin)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Norme station Météo-France</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block">Tmin Sous Herbe (Sol +10 cm)</span>
              <span className={`text-2xl font-black tabular-nums ${
                grassMinTemp <= 0 ? 'text-blue-400' : 'text-emerald-400'
              }`}>
                {formatTemp(grassMinTemp)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Perte radiative nocturne</span>
            </div>
          </div>

          {/* Seuils critiques de sensibilité */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Paliers de Vulnérabilité des Bourgeons :</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Débourrement</span>
                <strong className="text-amber-300">-1.0°C</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Boutons floraux</span>
                <strong className="text-orange-400">-2.0°C</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Pleine floraison</span>
                <strong className="text-rose-400">-2.5°C</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3 : Degrés-Jours de Croissance (GDD) & Maladies Fongiques & Portance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Carte Somme de Températures GDD */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase">
            <Calendar className="h-4 w-4" />
            <span>Degrés-Jours de Croissance (GDD)</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300 font-bold">Base 0°C (Céréales / Blé) :</span>
              <span className="font-black text-amber-300 font-mono">+{gddBase0} DJ</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300 font-bold">Base 6°C (Prairies / Colza) :</span>
              <span className="font-black text-emerald-300 font-mono">+{gddBase6} DJ</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300 font-bold">Base 10°C (Maïs / Vigne) :</span>
              <span className="font-black text-cyan-300 font-mono">+{gddBase10} DJ</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Cumul thermique quotidien utilisé pour prévoir les stades phénologiques et les dates de floraison.
          </p>
        </div>

        {/* Carte Humectation & Risques Maladies Fongiques */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase">
            <Bug className="h-4 w-4" />
            <span>Humectation &amp; Pression Maladies</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300 font-bold">Humectation foliaire :</span>
              <span className="font-black text-blue-300">{leafWetnessHours} h / jour</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300 font-bold">Risque Mildiou :</span>
              <span className="font-black text-amber-300">{mildewRisk}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300 font-bold">Risque Oïdium / Rouille :</span>
              <span className="font-black text-slate-200">{oidiumRisk}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Calcul basé sur la règle des 3 dix (T &gt; 10°C, pluie &gt; 10 mm) et la durée de mouillure des feuilles.
          </p>
        </div>

        {/* Carte Portance des Terres & Travaux de Récolte */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase">
            <Tractor className="h-4 w-4" />
            <span>Portance des Parcelles &amp; Chantiers</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-bold block">Praticabilité engins lourds :</span>
            <span className="text-xs font-black text-white block">
              {soilTrafficability}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Fenaison / Fauche (Prévision 4 jours) :</span>
            <span className="text-xs font-bold text-emerald-400">
              {daily.slice(0, 3).every(d => (d.precipitationSumMm ?? 0) < 1.0) ? 'Fenêtre de fauchage continue favorable' : 'Averses intermittentes : séchage lent'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
