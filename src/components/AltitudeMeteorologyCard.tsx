import React, { useState } from 'react';
import { 
  Mountain, 
  Snowflake, 
  Sun, 
  Gauge, 
  Droplets, 
  Flame, 
  ShieldAlert, 
  Leaf, 
  ThermometerSnowflake, 
  Wind, 
  Compass,
  Layers,
  Activity,
  ArrowDownRight,
  TrendingDown,
  Info,
  Thermometer,
  CloudSun
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';

interface AltitudeMeteorologyCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  seniorMode: boolean;
}

export const AltitudeMeteorologyCard: React.FC<AltitudeMeteorologyCardProps> = ({
  weather,
  station,
  seniorMode
}) => {
  const [showVerticalProfile, setShowVerticalProfile] = useState<boolean>(true);

  const alt = weather.altitudeMetrics || {
    altitudeMeters: station.altitude ?? 0,
    bioclimaticStage: 'Plaine / Littoral',
    isotherm0Altitude: 2800,
    snowRainLimitAltitude: 2500,
    lapseRate: -0.65,
    qfePressure: weather.pressure,
    qnhPressure: weather.pressureMsl ?? 1016,
    uvElevationFactor: 1.0,
    uvSnowReflectanceIndex: 1.0,
    frostRiskLevel: 'AUCUN',
    dewPoint: 8.5,
    evapotranspirationEt0: 3.5,
    djuHeat: 0,
    djuCool: 0
  };

  const topo = weather.topographicAnalysis;

  const aqi = weather.airQualityDetails || {
    aqi: weather.airQualityAqi ?? 25,
    label: weather.airQualityLabel ?? "Bonne",
    color: "text-green-400",
    advice: "Air pur",
    pm25: 8.5,
    pm10: 15.0,
    no2: 12.0,
    o3: 45.0,
    so2: 2.0,
    uvIndex: weather.uvIndex
  };

  const isHighAltitude = alt.altitudeMeters >= 1500;
  const isMountain = alt.altitudeMeters >= 800;

  const frostBadgeColor = {
    'CRITIQUE': 'bg-red-950 text-red-300 border-red-800 ring-1 ring-red-500/50',
    'ÉLEVÉ': 'bg-orange-950 text-orange-300 border-orange-800',
    'MODÉRÉ': 'bg-yellow-950 text-yellow-300 border-yellow-800',
    'FAIBLE': 'bg-blue-950 text-blue-300 border-blue-800',
    'AUCUN': 'bg-emerald-950 text-emerald-300 border-emerald-800'
  }[alt.frostRiskLevel];

  return (
    <div className="space-y-4">
      {/* Top Banner: Altitude & Bioclimatic Stage */}
      <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
              isHighAltitude 
                ? 'border-purple-500/40 bg-purple-950/50 text-purple-300' 
                : isMountain 
                ? 'border-amber-500/40 bg-amber-950/50 text-amber-300' 
                : 'border-blue-500/40 bg-blue-950/50 text-blue-300'
            }`}>
              <Mountain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-white ${seniorMode ? 'text-xl' : 'text-lg'}`}>
                  Météo d'Altitude & Micro-Climats Topographiques
                </h3>
                <span className={`rounded-md px-2 py-0.5 text-xs font-black uppercase border ${
                  isHighAltitude 
                    ? 'bg-purple-900/40 text-purple-300 border-purple-700' 
                    : isMountain 
                    ? 'bg-amber-900/40 text-amber-300 border-amber-700' 
                    : 'bg-blue-900/40 text-blue-300 border-blue-700'
                }`}>
                  {alt.bioclimaticStage}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Altitude réelle : <strong className="text-white">{alt.altitudeMeters.toLocaleString('fr-FR')} mètres</strong> • Déclinaison barométrique & thermique locale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Risque de gelée :</span>
            <span className={`rounded-xl px-3 py-1 text-xs font-black uppercase border ${frostBadgeColor}`}>
              {alt.frostRiskLevel}
            </span>
          </div>
        </div>

        {/* Key Mountain & Physical Gauges */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Isotherme 0°C */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <ThermometerSnowflake className="h-4 w-4 text-cyan-400" />
              <span>Isotherme 0°C</span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-white">
              {alt.isotherm0Altitude.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">m</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {alt.isotherm0Altitude > alt.altitudeMeters 
                ? `+${alt.isotherm0Altitude - alt.altitudeMeters} m au-dessus de la station (Hors gel)` 
                : `Gel au sol (${alt.altitudeMeters - alt.isotherm0Altitude} m sous le 0°C)`}
            </p>
          </div>

          {/* Limite Pluie-Neige */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Snowflake className="h-4 w-4 text-blue-400" />
              <span>Limite Pluie-Neige</span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-blue-200">
              {alt.snowRainLimitAltitude.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">m</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {weather.temperature <= 1.5 ? "Précipitations sous forme de neige" : "Légère fonte sous l'isotherme"}
            </p>
          </div>

          {/* Pression Réelle QFE vs QNH */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Gauge className="h-4 w-4 text-indigo-400" />
              <span>Pression QFE (Locale)</span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-white">
              {alt.qfePressure} <span className="text-sm font-normal text-slate-400">hPa</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              QNH (mer) : <strong className="text-slate-300">{alt.qnhPressure} hPa</strong>
            </p>
          </div>

          {/* Indice UV Altitude */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>UV Corrigé Altitude</span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-amber-300">
              {weather.uvIndex} <span className="text-sm font-normal text-slate-400">/ 12</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              +{Math.round((alt.uvElevationFactor - 1) * 100)}% lié à l'altitude
            </p>
          </div>
        </div>
      </div>

      {/* Topographic Microclimate & Valley/Mountain Inversions Section */}
      {topo && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400 border border-purple-500/30">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Analyse Topographique Fine : Vallons, Versants & Effets de Relief
                </h4>
                <p className="text-[11px] text-slate-400">
                  Modélisation des gradients thermiques adiabatiques et du drainage d'air froid
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVerticalProfile(!showVerticalProfile)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              {showVerticalProfile ? "Masquer Profil Vertical" : "Afficher Profil Vertical"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valley Inversion */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-indigo-400">Inversion Thermique de Vallon</span>
                <span className={`text-[10px] font-black rounded-lg px-2 py-0.5 ${
                  topo.valleyInversion.isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {topo.valleyInversion.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{topo.valleyInversion.phenomenonDescription}</p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fond de vallée / Versant :</span>
                  <span className="font-bold text-indigo-300">{topo.valleyInversion.valleyBottomTemp}°C / {topo.valleyInversion.slopeTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risque de gel en cuvette :</span>
                  <span className={`font-bold ${topo.valleyInversion.riskFrostInDepressions ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {topo.valleyInversion.riskFrostInDepressions ? 'Élevé (fond froid)' : 'Faible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Adiabatic Lapse Rate */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-cyan-400">Gradient Adiabatique Réel</span>
                <span className="text-[10px] font-black rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5">
                  {topo.adiabaticLapseRates.actualLocalLapseRate}°C / 100m
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{topo.adiabaticLapseRates.lapseRateType}</p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gradient sec standard :</span>
                  <span className="font-bold text-slate-300">{topo.adiabaticLapseRates.dryLapseRate}°C / 100m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gradient humide saturé :</span>
                  <span className="font-bold text-slate-300">{topo.adiabaticLapseRates.saturatedLapseRate}°C / 100m</span>
                </div>
              </div>
            </div>

            {/* Foehn Effect */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-400">Effet de Foehn / Relief</span>
                <span className={`text-[10px] font-black rounded-lg px-2 py-0.5 ${
                  topo.orographicFoehnEffect.status.includes('Actif') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {topo.orographicFoehnEffect.status.includes('Actif') ? 'FOEHN ACTIF' : 'NEUTRE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{topo.orographicFoehnEffect.details}</p>
              {topo.orographicFoehnEffect.leewardSideFoehnWarmingC > 0 && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] flex justify-between">
                  <span className="text-slate-400">Surcroît thermique sous le vent :</span>
                  <span className="font-bold text-amber-300">+{topo.orographicFoehnEffect.leewardSideFoehnWarmingC}°C</span>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Profile Slices Table */}
          {showVerticalProfile && topo.verticalProfile && topo.verticalProfile.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-cyan-400" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Profil Vertical Échelonné de Température & Pression
                </h5>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2 font-bold">Étage & Altitude</th>
                      <th className="pb-2 font-bold">Température Réelle</th>
                      <th className="pb-2 font-bold">Ressenti (Windchill)</th>
                      <th className="pb-2 font-bold">Pression QFE</th>
                      <th className="pb-2 font-bold">Phase Précipitations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {topo.verticalProfile.map((slice, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-semibold text-slate-200">
                          {slice.label} ({slice.altitudeMeters} m)
                        </td>
                        <td className="py-2.5 font-bold text-cyan-300">
                          {slice.temperature > 0 ? `+${slice.temperature}` : slice.temperature}°C
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {slice.feelsLike > 0 ? `+${slice.feelsLike}` : slice.feelsLike}°C
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {slice.pressureQfe} hPa
                        </td>
                        <td className="py-2.5">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            slice.precipitationState.includes('Neige') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            slice.precipitationState.includes('mêlées') ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {slice.precipitationState}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid: Air Quality Breakdown & Bioclimatic Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Air Quality Pollutants */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="h-5 w-5 text-emerald-400" />
              <h4 className={`font-bold text-white ${seniorMode ? 'text-lg' : 'text-base'}`}>
                Qualité de l'Air & Polluants
              </h4>
            </div>
            <span className={`rounded-xl px-2.5 py-1 text-xs font-black uppercase border border-emerald-500/30 bg-emerald-950/30 ${aqi.color}`}>
              {aqi.label} (AQI {aqi.aqi})
            </span>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            {aqi.advice}
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">PM 2.5</span>
              <div className="text-base font-black text-white mt-0.5">{aqi.pm25} <span className="text-[10px] font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">PM 10</span>
              <div className="text-base font-black text-white mt-0.5">{aqi.pm10} <span className="text-[10px] font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Ozone O₃</span>
              <div className="text-base font-black text-white mt-0.5">{aqi.o3} <span className="text-[10px] font-normal text-slate-400">µg/m³</span></div>
            </div>
          </div>
        </div>

        {/* Agro-Climatic & Energy Indicators */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <Leaf className="h-5 w-5 text-green-400" />
            <h4 className={`font-bold text-white ${seniorMode ? 'text-lg' : 'text-base'}`}>
              Indices Agro-Climatiques & Énergie
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Évapotranspiration */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <Droplets className="h-4 w-4 text-cyan-400" />
                <span>Évapotranspiration (ETP)</span>
              </div>
              <div className="mt-1.5 text-xl font-black text-white">
                {alt.evapotranspirationEt0} <span className="text-xs font-normal text-slate-400">mm / jour</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Demande en eau des sols et cultures</p>
            </div>

            {/* Point de Rosée */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span>Point de Rosée</span>
              </div>
              <div className="mt-1.5 text-xl font-black text-white">
                {alt.dewPoint}°C
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Seuil de condensation et brouillard</p>
            </div>

            {/* DJU Chauffage */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <Flame className="h-4 w-4 text-orange-400" />
                <span>DJU Chauffage (18°C)</span>
              </div>
              <div className="mt-1.5 text-xl font-black text-white">
                {alt.djuHeat} <span className="text-xs font-normal text-slate-400">DJU</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Besoin énergétique de chauffage</p>
            </div>

            {/* DJU Climatisation */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <Sun className="h-4 w-4 text-amber-400" />
                <span>DJU Climatisation</span>
              </div>
              <div className="mt-1.5 text-xl font-black text-white">
                {alt.djuCool} <span className="text-xs font-normal text-slate-400">DJU</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Besoin de rafraîchissement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
