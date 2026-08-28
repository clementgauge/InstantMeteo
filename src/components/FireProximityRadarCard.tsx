import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  PhoneCall, 
  MapPin, 
  Compass, 
  Clock, 
  Users, 
  Truck, 
  Plane, 
  Info, 
  ExternalLink,
  Sparkles,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { LocationPoint, CurrentWeather, DailyForecast, HourlyForecast } from '../types/weather';
import { computeFireRiskAssessment, FireRiskAssessment, ActiveFireIncident } from '../services/fireRiskService';

interface FireProximityRadarCardProps {
  station: LocationPoint;
  weather?: CurrentWeather | null;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  seniorMode?: boolean;
  onOpenRadar?: () => void;
}

export const FireProximityRadarCard: React.FC<FireProximityRadarCardProps> = ({
  station,
  weather,
  hourly,
  daily,
  seniorMode = false,
  onOpenRadar
}) => {
  const assessment: FireRiskAssessment = useMemo(() => {
    return computeFireRiskAssessment(station, weather, hourly, daily);
  }, [station, weather, hourly, daily]);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    assessment.firesWithin10Km[0]?.id || null
  );
  const [showAllInstructions, setShowAllInstructions] = useState<boolean>(false);

  const selectedIncident: ActiveFireIncident | undefined = assessment.firesWithin10Km.find(
    f => f.id === selectedIncidentId
  ) || assessment.firesWithin10Km[0];

  const getFwiBadge = (cat: string) => {
    switch (cat) {
      case 'EXTRÊME':
        return {
          bg: 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-rose-950/50',
          badge: 'bg-rose-600 text-white font-black animate-pulse',
          dot: 'bg-rose-500 animate-ping'
        };
      case 'TRÈS ÉLEVÉ':
        return {
          bg: 'bg-orange-950/80 border-orange-500 text-orange-200 shadow-orange-950/50',
          badge: 'bg-orange-600 text-white font-black',
          dot: 'bg-orange-500'
        };
      case 'ÉLEVÉ':
        return {
          bg: 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-amber-950/40',
          badge: 'bg-amber-500 text-slate-950 font-black',
          dot: 'bg-amber-400'
        };
      case 'MODÉRÉ':
        return {
          bg: 'bg-yellow-950/60 border-yellow-500/60 text-yellow-200',
          badge: 'bg-yellow-400 text-slate-950 font-bold',
          dot: 'bg-yellow-400'
        };
      case 'FAIBLE':
      case 'TRÈS FAIBLE':
      default:
        return {
          bg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300',
          badge: 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold',
          dot: 'bg-emerald-400'
        };
    }
  };

  const fwiStyle = getFwiBadge(assessment.fwiCategory);

  return (
    <div id="fire-proximity-radar-card" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-5 sm:p-6 shadow-2xl backdrop-blur space-y-6">
      {/* 1. CARD HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-orange-600/20 p-3 text-orange-400 border border-orange-500/30 shadow-inner shrink-0">
            <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
              <Radio className="h-3.5 w-3.5" />
              <span>Surveillance Incendies &amp; Indice Météo Forêt (FWI)</span>
              <span>•</span>
              <span className="text-slate-400">Rayon Immédiat 10 KM</span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Radar Feux de Forêt &amp; Risque Végétation dans les 10 km
            </h3>
          </div>
        </div>

        {/* FWI Top Pill */}
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border ${fwiStyle.bg}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${fwiStyle.dot}`} />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Indice FWI</span>
              <span className="text-xs font-black text-white">{assessment.fwiIndex} / 65</span>
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${fwiStyle.badge}`}>
              {assessment.fwiCategory}
            </span>
          </div>
        </div>
      </div>

      {/* 2. LIVE 10 KM FIRE INCIDENT ALERT BANNER */}
      {assessment.hasFireWithin10Km ? (
        <div className="rounded-2xl border-2 border-rose-500/80 bg-gradient-to-r from-rose-950/90 via-slate-900 to-orange-950/80 p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center text-white text-xl font-black shrink-0 animate-bounce">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white tracking-wider animate-pulse">
                    ALERTE RAPPROCHÉE (&lt; 10 KM)
                  </span>
                  <span className="text-xs text-rose-300 font-bold">
                    {assessment.firesWithin10Km.length} foyer(s) détecté(s)
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Foyer d'incendie actif à <span className="text-rose-400 underline">{assessment.closestFireDistanceKm} km</span> de {station.name}
                </h4>
              </div>
            </div>

            {/* Quick Emergency Call Pill */}
            <div className="flex items-center gap-2">
              <a
                href="tel:18"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/40 transition active:scale-95 cursor-pointer"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Urgence 18 / 112</span>
              </a>
            </div>
          </div>

          {/* List of nearby fires selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {assessment.firesWithin10Km.map((fire) => {
              const isSelected = fire.id === selectedIncident?.id;
              return (
                <div
                  key={fire.id}
                  onClick={() => setSelectedIncidentId(fire.id)}
                  className={`rounded-xl p-3 border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-rose-400 ring-2 ring-rose-500/50 shadow-lg'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{fire.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-950 border border-rose-500/50 text-rose-300">
                        {fire.intensity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-2">
                      <span className="font-bold text-orange-400">📍 {fire.distanceKm} km ({fire.bearingCompass})</span>
                      <span>•</span>
                      <span className="text-slate-400">Surface : ~{fire.surfaceHectares} ha</span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] font-bold text-slate-400">
                    <div>{fire.reportedMinutesAgo} min</div>
                    <span className="text-emerald-400">{fire.containmentPercent}% contenu</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Fire Incident Detailed Tactical Sheet */}
          {selectedIncident && (
            <div className="rounded-xl bg-slate-950/90 border border-rose-500/40 p-4 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-400" />
                  <span className="font-black text-white text-sm">
                    Fiche Tactique SDIS : {selectedIncident.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Type : <strong className="text-white">{selectedIncident.fireType}</strong>
                </div>
              </div>

              {/* Tactical Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Distance &amp; Cap</div>
                  <div className="text-xs font-black text-rose-400 mt-0.5">
                    {selectedIncident.distanceKm} km • {selectedIncident.bearingCompass}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Impact Fumées</div>
                  <div className={`text-xs font-black mt-0.5 ${
                    selectedIncident.smokeImpactOnStation === 'DIRECT' ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                  }`}>
                    {selectedIncident.smokeImpactOnStation}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Moyens Engagés</div>
                  <div className="text-xs font-black text-white mt-0.5 flex items-center justify-center gap-1.5">
                    <span>👨‍🚒 {selectedIncident.forcesDeployed.firefighters}</span>
                    <span>🚒 {selectedIncident.forcesDeployed.vehicles}</span>
                    {selectedIncident.forcesDeployed.airTankers > 0 && (
                      <span>✈️ {selectedIncident.forcesDeployed.airTankers}</span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rayon Évacuation</div>
                  <div className="text-xs font-black text-amber-400 mt-0.5">
                    {selectedIncident.evacuationRadiusKm} km
                  </div>
                </div>
              </div>

              {/* Immediate Safety Instructions for this fire */}
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 space-y-1.5">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  <span>Consignes Immédiates pour les Résidents dans les 10 km :</span>
                </div>
                <ul className="space-y-1 pl-4 text-slate-200 list-disc">
                  {selectedIncident.safetyAdvice.map((adv, idx) => (
                    <li key={idx} className="leading-relaxed">{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Fire Within 10 Km Status Banner */
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl font-bold shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  PÉRIMÈTRE 10 KM SÉCURISÉ
                </span>
                <span className="text-xs text-slate-400">Aucun départ de feu actif</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                Aucun incendie en cours dans un rayon de 10 km autour de {station.name}
              </h4>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
            <span>Surveillance satellite MODIS / VIIRS &amp; SDIS active en continu</span>
          </div>
        </div>
      )}

      {/* 3. METEOROLOGICAL PROPAGATION & VULNERABILITY FACTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Factor 1: Propagation Speed */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px]">
            <span className="flex items-center gap-1">
              <Wind className="h-3.5 w-3.5 text-cyan-400" />
              Vitesse de Propagation
            </span>
            <span className="text-cyan-300 font-mono">Modèle Rothermel</span>
          </div>
          <div className="text-lg font-black text-white">
            ~{assessment.propagationSpeedIndexKmH} km/h
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Vitesse estimée d'avancée du front de flammes sous le vent moyen actuel.
          </p>
        </div>

        {/* Factor 2: Fuel Dryness */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px]">
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-amber-400" />
              Dessèchement Végétation
            </span>
            <span className="text-amber-300 font-mono">{assessment.fuelDrynessPercent}%</span>
          </div>
          <div className="text-lg font-black text-amber-400">
            {assessment.droughtLevel}
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Teneur en eau des litières de feuilles et brindilles sous-bois.
          </p>
        </div>

        {/* Factor 3: Wind Alignment */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px]">
            <span className="flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-blue-400" />
              Vent &amp; Sautes de Feu
            </span>
            <span className="text-blue-300 font-mono">{weather?.windSpeed || 15} km/h</span>
          </div>
          <div className="text-sm font-black text-slate-200">
            {assessment.windAlignmentRisk}
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Sensibilité aux flammèches portées à distance au-delà des coupures de combustible.
          </p>
        </div>

        {/* Factor 4: Pyroconvective Threat */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px]">
            <span className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-rose-400" />
              Pyrocumulus &amp; Convection
            </span>
            <span className="text-rose-300 font-mono">{assessment.pyroconvectiveThreat ? 'ACTIF' : 'NON'}</span>
          </div>
          <div className={`text-sm font-black ${assessment.pyroconvectiveThreat ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {assessment.pyroconvectiveThreat ? 'Risque Pyrocumulonimbus' : 'Comportement Stable'}
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            {assessment.pyroconvectiveThreat 
              ? 'Chaleur extrême capable de créer son propre système orageux de feu.' 
              : 'Absence d\'instabilité atmosphérique explosive.'}
          </p>
        </div>
      </div>

      {/* 4. OFFICIAL SAFETY PROTOCOL & EMERGENCY DIRECTIVES */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-orange-400" />
            <span>Guide Officiel de Sécurité &amp; Prévention Feux de Forêt (Sécurité Civile)</span>
          </h4>
          <button
            onClick={() => setShowAllInstructions(!showAllInstructions)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>{showAllInstructions ? 'Réduire' : 'Développer les 5 règles d\'or'}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllInstructions ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          {assessment.consignesSecurite10km.slice(0, showAllInstructions ? 5 : 2).map((inst, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="flex h-5 w-5 rounded-full bg-orange-600/20 border border-orange-500/40 items-center justify-center text-orange-300 font-bold shrink-0 text-[10px]">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{inst}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
