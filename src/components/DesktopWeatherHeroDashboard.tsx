import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Gauge,
  MapPin,
  Navigation,
  Search,
  ChevronRight,
  TrendingUp,
  Leaf,
  Star,
  Thermometer,
  Flame,
  Check,
  Zap,
  AlertTriangle,
  Play,
  Heart,
  BarChart2,
  Cloud,
  CloudSun,
  CloudLightning,
  Compass,
  Calendar,
  Radio,
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { getClientGeographicBackdrop, fetchCityRealPhoto } from '../utils/geoBackdrops';
import { DynamicSkyHeroArt } from './DynamicSkyHeroArt';
import { UnifiedHourly48hTrend } from './UnifiedHourly48hTrend';

interface DesktopWeatherHeroDashboardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  anomaly: ClimateAnomaly;
  tempUnit: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onOpenSearchModal?: () => void;
  onOpenGigaRadar?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLocateGps?: () => void;
  onOpenContradictionModal?: () => void;
}

const QUICK_DESKTOP_CITIES = [
  { id: 'paris-montsouris', label: 'Paris', shortCode: '75' },
  { id: 'lyon-bron', label: 'Lyon', shortCode: '69' },
  { id: 'marseille-marignane', label: 'Marseille', shortCode: '13' },
  { id: 'lille-lesquin', label: 'Lille', shortCode: '59' },
  { id: 'toulouse-blagnac', label: 'Toulouse', shortCode: '31' },
];

function getCardinalWindDirection(deg?: number | string): string {
  if (typeof deg === 'string') return deg;
  if (deg === undefined || deg === null || isNaN(deg)) return 'NO';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return directions[Math.round(((deg % 360) < 0 ? deg + 360 : deg) / 45) % 8];
}

function getShortConditionLabel(code: number, description?: string): string {
  if (code === 0) return 'Ensoleillé';
  if (code === 1 || code === 2) return 'Partiellement Nuageux';
  if (code === 3) return 'Nuageux';
  if (code >= 45 && code <= 48) return 'Brouillard';
  if (code >= 51 && code <= 67) return 'Pluie';
  if (code >= 71 && code <= 77) return 'Neige';
  if (code >= 80 && code <= 82) return 'Averses';
  if (code >= 95) return 'Orages';
  return description || 'Ensoleillé';
}

export const DesktopWeatherHeroDashboard: React.FC<DesktopWeatherHeroDashboardProps> = ({
  station,
  weather,
  hourly,
  daily,
  anomaly,
  tempUnit,
  onSelectStation,
  onOpenSearchModal,
  onOpenGigaRadar,
  onNavigateTab,
  onLocateGps,
  onOpenContradictionModal,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');
  const [shortDateHeader, setShortDateHeader] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  const initialGeoBackdrop = getClientGeographicBackdrop(
    station.name,
    station.region,
    station.department,
    station.altitude
  );
  const [cityPhotoUrl, setCityPhotoUrl] = useState<string>(initialGeoBackdrop);

  useEffect(() => {
    let isMounted = true;
    const initialBg = getClientGeographicBackdrop(
      station.name,
      station.region,
      station.department,
      station.altitude
    );
    setCityPhotoUrl(initialBg);

    fetchCityRealPhoto(
      station.name,
      station.region,
      station.department,
      station.altitude
    )
      .then((resolvedPhoto) => {
        if (isMounted && resolvedPhoto) {
          setCityPhotoUrl(resolvedPhoto);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [station.name, station.region, station.department, station.altitude]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

      const day = now.toLocaleDateString('fr-FR', { weekday: 'long' });
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      const dateNum = now.getDate();
      const month = now.toLocaleDateString('fr-FR', { month: 'long' });
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      const year = now.getFullYear();
      setCurrentDateString(`${capitalizedDay} ${dateNum} ${month} ${year}`);
      setShortDateHeader(`${capitalizedDay} ${dateNum} ${capitalizedMonth}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°C`;
  };

  const formatSimpleDegree = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const todayMin = daily[0]?.tempMin ?? Math.round((weather.temperature - 4) * 10) / 10;
  const todayMax = daily[0]?.tempMax ?? Math.round((weather.temperature + 3) * 10) / 10;

  const shortStationCity = station.name.split('-')[0].trim();
  const windCardinal = getCardinalWindDirection(weather.windDirection);
  const uvVal = Math.round(weather.uvIndex ?? 6);
  const uvSeverityLabel = uvVal >= 8 ? 'Très Élevé' : uvVal >= 6 ? 'Élevé' : uvVal >= 3 ? 'Modéré' : 'Faible';

  // Quick cities list + dynamic search filtering
  const filteredStations = cityQuery.trim()
    ? FRENCH_STATIONS.filter((s) =>
        s.name.toLowerCase().includes(cityQuery.trim().toLowerCase()) ||
        (s.department && s.department.toLowerCase().includes(cityQuery.trim().toLowerCase()))
      ).slice(0, 5)
    : null;

  const handleSelectQuickCity = (stationId: string) => {
    const found = FRENCH_STATIONS.find((s) => s.id === stationId);
    if (found && onSelectStation) {
      onSelectStation(found);
      setCityQuery('');
    } else if (onOpenSearchModal) {
      onOpenSearchModal();
    }
  };

  // Next 3 days for "Prévisions à 3 Jours"
  const nextThreeDays = (daily && daily.length >= 4 ? daily.slice(1, 4) : daily.slice(0, 3)).map((d, idx) => {
    const dateObj = d?.date ? new Date(d.date) : new Date(Date.now() + (idx + 1) * 86400000);
    const weekday = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
    const formattedDay = idx === 0 || idx === 2
      ? weekday.toUpperCase()
      : weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return {
      dayName: formattedDay,
      tempMax: d?.tempMax ?? Math.round(weather.temperature + (idx === 1 ? 2 : -1)),
      tempMin: d?.tempMin ?? Math.round(weather.temperature - 6 + idx),
      weatherCode: d?.weatherCode ?? (idx === 0 ? 1 : idx === 1 ? 95 : 3),
      label: getShortConditionLabel(d?.weatherCode ?? (idx === 0 ? 1 : idx === 1 ? 95 : 3)),
    };
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="hidden sm:block space-y-5 mb-6 select-none">
      {/* ========================================================================= */}
      {/* TABLEAU DE BORD PC PRINCIPAL (Design exact de l'image de référence)       */}
      {/* ========================================================================= */}
      <div className="rounded-[28px] p-4 lg:p-5 bg-gradient-to-br from-[#2d6ec4]/90 via-[#4d8fda]/85 to-[#2b62b2]/90 border border-sky-300/40 shadow-2xl backdrop-blur-md space-y-4">
        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* ===================================================================== */}
          {/* COLONNE GAUCHE : RECHERCHE, VILLES, 7 JOURS, ACCÈS RAPIDES & VIGNETTE */}
          {/* ===================================================================== */}
          <div className="col-span-12 lg:col-span-3 rounded-[22px] bg-gradient-to-b from-[#cde0f5]/95 via-[#d9e9f9]/95 to-[#c1d8f0]/95 border border-white/80 p-3.5 shadow-xl flex flex-col justify-between gap-3 text-[#0f3460]">
            <div className="space-y-3">
              {/* Barre de recherche "Rechercher une ville..." */}
              <div className="relative">
                <div className="flex items-center gap-2 rounded-full bg-white/95 border border-[#b6d0ec] px-3.5 py-2 shadow-inner">
                  <Search className="h-4 w-4 text-[#2563eb] shrink-0" />
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredStations && filteredStations.length > 0 && onSelectStation) {
                        onSelectStation(filteredStations[0]);
                        setCityQuery('');
                      }
                    }}
                    placeholder="Rechercher une ville..."
                    className="w-full bg-transparent text-xs font-semibold text-[#0f3460] placeholder-[#5b7ba3] focus:outline-none"
                  />
                  {onOpenSearchModal && (
                    <button
                      type="button"
                      onClick={onOpenSearchModal}
                      title="Ouvrir la recherche complète des 35 000 communes"
                      className="text-[10px] font-bold text-[#1d63b8] hover:text-[#0f3460] transition shrink-0 cursor-pointer"
                    >
                      35k
                    </button>
                  )}
                </div>
              </div>

              {/* Liste des villes (Paris, Lyon, Marseille, Lille, Toulouse ou résultats filtrés) */}
              <div className="rounded-2xl bg-white/45 border border-white/70 overflow-hidden divide-y divide-[#bfd6ee]/80 shadow-sm">
                {filteredStations && filteredStations.length > 0 ? (
                  filteredStations.map((st) => {
                    const isCurrent = st.id === station.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          if (onSelectStation) onSelectStation(st);
                          setCityQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm font-bold transition cursor-pointer ${
                          isCurrent
                            ? 'bg-gradient-to-r from-[#1b62b8] to-[#2c7be0] text-white shadow-md'
                            : 'text-[#0f3460] hover:bg-white/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MapPin className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-white' : 'text-[#1d63b8]'}`} />
                          <span className="truncate">{st.name.split('-')[0]}</span>
                        </div>
                        <span className={`text-[10px] font-semibold ${isCurrent ? 'text-sky-100' : 'text-[#4c6ef5]'}`}>
                          {st.department?.split(' - ')[0]}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <>
                    {/* Si la station actuelle n'est pas dans les 5 grandes villes, l'afficher en tête */}
                    {!QUICK_DESKTOP_CITIES.some((c) => c.id === station.id) && (
                      <button
                        type="button"
                        onClick={onOpenSearchModal}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm font-bold bg-gradient-to-r from-[#1b62b8] to-[#2c7be0] text-white shadow-md cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MapPin className="h-4 w-4 shrink-0 text-white" />
                          <span className="truncate">{shortStationCity}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-sky-100">Actif</span>
                      </button>
                    )}

                    {QUICK_DESKTOP_CITIES.map((city) => {
                      const isCurrent = station.id === city.id || shortStationCity.toLowerCase() === city.label.toLowerCase();
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => handleSelectQuickCity(city.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm font-bold transition cursor-pointer ${
                            isCurrent
                              ? 'bg-gradient-to-r from-[#1b62b8] to-[#2c7be0] text-white shadow-md'
                              : 'text-[#0f3460] hover:bg-white/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-white' : 'text-[#1d63b8]'}`} />
                            <span>{city.label}</span>
                          </div>
                          {isCurrent && (
                            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-sm" />
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Bouton bleu "Prévisions à 7 jours" */}
              <button
                type="button"
                onClick={() => scrollToSection('realtime-forecast-week')}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2166c4] via-[#2e78db] to-[#3b87eb] hover:from-[#1b57ab] hover:to-[#2870d4] text-white font-bold text-xs sm:text-sm shadow-md border border-sky-300/40 transition active:scale-95 cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-sky-100 shrink-0" />
                <span>Prévisions à 7 jours</span>
              </button>

              {/* Bloc d'accès rapides : Alertes Météo, Radar Pluie, Infos Voyage */}
              <div className="rounded-2xl bg-white/80 border border-white/90 divide-y divide-[#d0e1f2] overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('vigilance') : null}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold text-[#0f3460] hover:bg-white transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded-lg bg-amber-500/15 text-amber-500">
                      <AlertTriangle className="h-4 w-4 fill-amber-400 text-amber-600" />
                    </span>
                    <span>Alertes Météo</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#6485ad] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold text-[#0f3460] hover:bg-white transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded-lg bg-blue-500/15 text-[#1d63b8]">
                      <CloudRain className="h-4 w-4" />
                    </span>
                    <span>Radar Pluie</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#6485ad] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('sportsActivities') : null}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold text-[#0f3460] hover:bg-white transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded-lg bg-sky-500/15 text-[#1d63b8]">
                      <Compass className="h-4 w-4" />
                    </span>
                    <span>Infos Voyage</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#6485ad] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Vignette Paysage & Station Météo en bas de la colonne gauche */}
            <div
              onClick={onLocateGps || onOpenContradictionModal}
              title="Cliquer pour localiser par GPS ou ajuster l'observation terrain"
              className="relative h-16 rounded-xl overflow-hidden border border-white/90 shadow-md cursor-pointer group bg-gradient-to-r from-[#5ca4e8] via-[#8ec5f5] to-[#b5e0a8]"
            >
              <svg viewBox="0 0 260 64" className="w-full h-full object-cover" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="skyGradLeft" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4f96e2" />
                    <stop offset="60%" stopColor="#9ed0f8" />
                    <stop offset="100%" stopColor="#fef0c2" />
                  </linearGradient>
                </defs>
                <rect width="260" height="64" fill="url(#skyGradLeft)" />
                {/* Collines verdoyantes */}
                <path d="M0 46 Q 70 24 150 42 T 260 34 L 260 64 L 0 64 Z" fill="#68b65c" />
                <path d="M50 52 Q 140 32 260 46 L 260 64 L 50 64 Z" fill="#4c9c44" />
                {/* Route */}
                <path d="M0 56 Q 90 48 190 64 L 0 64 Z" fill="#335c85" opacity="0.85" />
                {/* Véhicule / Station mobile */}
                <rect x="24" y="34" width="52" height="20" rx="6" fill="#184a8c" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="36" cy="54" r="5" fill="#0f294a" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="64" cy="54" r="5" fill="#0f294a" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="50" cy="44" r="4" fill="#e0f2fe" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f3460]/30 via-transparent to-transparent flex items-center justify-end px-3">
                <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#0f3460] text-[10px] font-black shadow-sm group-hover:bg-white transition">
                  📍 GPS / Terrain
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* COLONNE CENTRALE : CARTE BLEUE "ACTUELLEMENT À..." + CARTE & INFOS     */}
          {/* ===================================================================== */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
            {/* 1. GRANDE CARTE MÉTÉO PRINCIPALE BLEU AZUR */}
            <div className="relative overflow-hidden rounded-[24px] border border-sky-200/60 bg-gradient-to-b from-[#114b9e] via-[#1f67c7] to-[#4692eb] text-white shadow-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[340px]">
              {/* Image de fond de la ville en filigrane doux pour préserver le cachet local */}
              <img
                key={cityPhotoUrl}
                src={cityPhotoUrl}
                alt={`Panorama météo de ${station.name}`}
                referrerPolicy="no-referrer"
                onError={() => {
                  const fallback = getClientGeographicBackdrop(
                    station.name,
                    station.region,
                    station.department,
                    station.altitude
                  );
                  if (cityPhotoUrl !== fallback) {
                    setCityPhotoUrl(fallback);
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-20 mix-blend-luminosity pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0e4391]/85 via-[#1e66c6]/75 to-[#3d8ae5]/90 pointer-events-none" />

              {/* Nuages décoratifs doux sur les bords (style exact de l'image) */}
              <svg
                viewBox="0 0 500 320"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
                preserveAspectRatio="none"
              >
                <g fill="#ffffff" opacity="0.22">
                  <circle cx="430" cy="65" r="28" />
                  <circle cx="455" cy="60" r="35" />
                  <circle cx="485" cy="68" r="25" />
                  <circle cx="420" cy="195" r="38" />
                  <circle cx="460" cy="185" r="48" />
                  <circle cx="495" cy="195" r="36" />
                </g>
              </svg>

              {/* En-tête : "Actuellement à Paris" + Date + Actions & Horloge Direct */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-bold text-sky-100">
                      Actuellement à
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow">
                      {shortStationCity}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsFavorite(!isFavorite)}
                      title="Ajouter aux favoris"
                      className="p-1 rounded-full text-sky-100 hover:text-amber-300 transition cursor-pointer"
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm font-medium text-sky-100/95 mt-0.5">
                    {shortDateHeader || currentDateString}
                    <span className="mx-1.5 opacity-60">•</span>
                    <span className="text-xs text-sky-100/85">
                      {station.department || '75 - Paris'} ({station.altitude || 75} m)
                    </span>
                  </div>

                  {/* Boutons rapides : GPS, Changer de commune, Ajuster le direct */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {onLocateGps && (
                      <button
                        type="button"
                        onClick={onLocateGps}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-[10px] font-bold text-white transition cursor-pointer"
                      >
                        <Navigation className="h-3 w-3 text-emerald-300" />
                        <span>GPS</span>
                      </button>
                    )}
                    {onOpenSearchModal && (
                      <button
                        type="button"
                        onClick={onOpenSearchModal}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-[10px] font-bold text-white transition cursor-pointer"
                      >
                        <Search className="h-3 w-3 text-sky-200" />
                        <span>Changer de commune</span>
                      </button>
                    )}
                    {onOpenContradictionModal && (
                      <button
                        type="button"
                        onClick={onOpenContradictionModal}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 hover:bg-amber-400/35 border border-amber-300/40 text-[10px] font-bold text-amber-100 transition cursor-pointer"
                      >
                        <Zap className="h-3 w-3 text-amber-300" />
                        <span>Ajuster le direct</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Horloge temps réel & badge EN DIRECT */}
                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight drop-shadow">
                    {currentTime || '14:30'}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-400/40 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                      EN DIRECT
                    </span>
                  </div>
                </div>
              </div>

              {/* Centre : Grande illustration Soleil + Nuages & Température géante */}
              <div className="relative z-10 flex items-center justify-around gap-4 my-3 py-2">
                <div className="scale-110 sm:scale-125 transform transition-transform">
                  <DynamicSkyHeroArt
                    weatherCode={weather.weatherCode}
                    isDay={weather.isDay ?? true}
                    size="lg"
                  />
                </div>

                <div className="text-center sm:text-left">
                  <div className="text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-md leading-none tabular-nums">
                    {formatSimpleDegree(weather.temperature)}
                  </div>
                  <div className="text-lg sm:text-2xl font-extrabold text-white mt-1 drop-shadow-sm">
                    {getShortConditionLabel(weather.weatherCode, weather.weatherDescription)}
                  </div>
                  <div className="text-[11px] text-sky-100/90 mt-0.5 max-w-[210px] leading-tight">
                    {weather.weatherDescription}
                  </div>
                </div>
              </div>

              {/* Bas de la carte bleue : Grille 2x2 Ressenti, Vent, Humidité, UV Index + Min/Max/Pression */}
              <div className="relative z-10 pt-3 border-t border-white/25 space-y-2.5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm">
                  {/* Ressenti */}
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-white/15 text-sky-100">
                      <Thermometer className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sky-100">Ressenti :</span>
                    <span className="font-black text-white tabular-nums">
                      {formatSimpleDegree(weather.feelsLike)}
                    </span>
                  </div>

                  {/* Vent */}
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-white/15 text-sky-100">
                      <Wind className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sky-100">Vent :</span>
                    <span className="font-black text-white tabular-nums">
                      {Math.round(weather.windSpeed)} km/h {windCardinal}
                    </span>
                  </div>

                  {/* Humidité */}
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-white/15 text-sky-100">
                      <Droplets className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sky-100">Humidité :</span>
                    <span className="font-black text-white tabular-nums">
                      {Math.round(weather.humidity)}%
                    </span>
                  </div>

                  {/* UV Index */}
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-white/15 text-amber-300">
                      <Heart className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sky-100">UV Index :</span>
                    <span className="font-black text-amber-300 tabular-nums">
                      {uvVal} {uvSeverityLabel}
                    </span>
                  </div>
                </div>

                {/* Bandeau complémentaire Min / Max / Pression / Climat (pour ne rien supprimer) */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-white/15 text-[11px] text-sky-100">
                  <div className="flex items-center gap-3">
                    <span>
                      Min : <strong className="text-white">{formatTemp(todayMin)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Max : <strong className="text-amber-200">{formatTemp(todayMax)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Pression : <strong className="text-white">{Math.round(weather.pressure)} hPa</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-100/80 truncate max-w-[200px]">
                    {station.climateZone || 'Climat tempéré'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. RANGÉE INFÉRIEURE CENTRALE : CARTE MÉTÉO (Gauche) & INFOS EN DIRECT (Droite) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1">
              {/* Sous-carte gauche : Carte Météo */}
              <div
                onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
                className="sm:col-span-5 rounded-[22px] bg-gradient-to-b from-white/95 to-[#e3effb]/95 border border-white p-3.5 shadow-xl flex flex-col justify-between cursor-pointer group hover:shadow-2xl transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-[#0f3460]">Carte Météo</h3>
                  <Cloud className="h-4 w-4 text-[#8ab8e6] fill-[#d4e7fa]" />
                </div>

                {/* Mini Carte de France illustrée interactive */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#1a5fb4] to-[#0f3b78] h-36 border border-[#9ec5ec] shadow-inner">
                  <svg viewBox="0 0 200 150" className="w-full h-full">
                    {/* Fond marin et côtes */}
                    <rect width="200" height="150" fill="#18549e" />
                    {/* Silhouette stylisée de la France en vert relief */}
                    <path
                      d="M 88 14 L 112 18 L 138 32 L 160 45 L 154 75 L 164 102 L 152 124 L 122 132 L 95 140 L 58 132 L 48 100 L 28 65 L 32 45 L 62 38 L 74 22 Z"
                      fill="#7ec262"
                      stroke="#a7db87"
                      strokeWidth="2"
                    />
                    {/* Relief intérieur doux */}
                    <path
                      d="M 85 45 Q 115 55 135 85 Q 115 115 75 110 Q 55 85 85 45 Z"
                      fill="#9ad26b"
                      opacity="0.7"
                    />
                    {/* Soleil Ouest */}
                    <circle cx="66" cy="78" r="10" fill="#f59e0b" />
                    <circle cx="66" cy="78" r="14" fill="#fbbf24" opacity="0.35" />
                    {/* Soleil Est */}
                    <circle cx="132" cy="68" r="8" fill="#f59e0b" />
                    {/* Soleil Sud */}
                    <circle cx="88" cy="116" r="8" fill="#f59e0b" />
                    {/* Nuage + Soleil Centre */}
                    <circle cx="110" cy="88" r="9" fill="#fbbf24" />
                    <path
                      d="M 94 98 Q 94 88 104 88 Q 108 80 118 83 Q 126 85 126 94 Q 132 95 130 102 L 94 102 Z"
                      fill="#ffffff"
                    />
                  </svg>

                  <div className="absolute bottom-1.5 right-2 px-2 py-0.5 rounded-full bg-[#0f3460]/85 text-white text-[9px] font-bold group-hover:bg-[#1d63b8] transition">
                    Ouvrir Carte &amp; Radar →
                  </div>
                </div>
              </div>

              {/* Sous-carte droite : Infos en Direct */}
              <div className="sm:col-span-7 rounded-[22px] bg-gradient-to-b from-white/95 to-[#e6f1fc]/95 border border-white p-4 shadow-xl flex flex-col justify-between text-[#0f3460]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black text-[#0f3460]">Infos en Direct</h3>
                  <Cloud className="h-4 w-4 text-[#8ab8e6] fill-[#d4e7fa]" />
                </div>

                <div className="divide-y divide-[#cddff2] text-xs font-bold flex-1 flex flex-col justify-around">
                  <button
                    type="button"
                    onClick={() => onNavigateTab ? onNavigateTab('vigilance') : null}
                    className="w-full py-2 flex items-center gap-2.5 text-left hover:text-[#1d63b8] transition cursor-pointer"
                  >
                    <span className="h-5 w-5 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">
                      {weather.precipitation > 0
                        ? `Pluie en cours sur ${shortStationCity} (${weather.precipitation} mm)`
                        : `Vigilance & suivi orageux (${station.region || 'France'})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab ? onNavigateTab('radar') : null}
                    className="w-full py-2 flex items-center gap-2.5 text-left hover:text-[#1d63b8] transition cursor-pointer"
                  >
                    <span className="h-5 w-5 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <CloudRain className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">
                      {daily[1]?.precipitationSum && daily[1].precipitationSum > 2
                        ? `Pluies attendues demain (${daily[1].precipitationSum} mm)`
                        : `Évolution radar & précipitations demain`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('realtime-indicators')}
                    className="w-full py-2 flex items-center gap-2.5 text-left hover:text-[#1d63b8] transition cursor-pointer"
                  >
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">
                      {weather.temperature >= 28
                        ? 'Conseils pour la chaleur & hydratation'
                        : `Indice UV ${uvVal} (${uvSeverityLabel}) & confort thermique`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* COLONNE DROITE : PRÉVISIONS À 3 JOURS + TENDANCES & GRAPHIQUES + POLLEN */}
          {/* ===================================================================== */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* 1. Carte "Prévisions à 3 Jours" */}
            <div className="rounded-[22px] bg-gradient-to-b from-white/95 to-[#e3effb]/95 border border-white p-4 shadow-xl text-[#0f3460]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-[#0f3460]">Prévisions à 3 Jours</h3>
                <button
                  type="button"
                  onClick={() => scrollToSection('realtime-forecast-week')}
                  className="text-[10px] font-bold text-[#1d63b8] hover:underline cursor-pointer"
                >
                  7 jours →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {nextThreeDays.map((d, index) => {
                  const cardBg =
                    index === 0
                      ? 'bg-gradient-to-b from-[#2b7de0] to-[#1653a6]'
                      : index === 1
                        ? 'bg-gradient-to-b from-[#1d5499] to-[#102f5c]'
                        : 'bg-gradient-to-b from-[#1b3f6e] to-[#0e2340]';

                  const badgeBg =
                    index === 0
                      ? 'bg-emerald-500 text-white'
                      : index === 1
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white';

                  return (
                    <div
                      key={index}
                      onClick={() => scrollToSection('realtime-forecast-week')}
                      className={`relative rounded-2xl ${cardBg} p-3 pb-5 text-white text-center shadow-lg flex flex-col items-center justify-between min-h-[168px] cursor-pointer hover:scale-[1.02] transition`}
                    >
                      <div className="text-[11px] font-black tracking-wide truncate w-full">
                        {d.dayName}
                      </div>

                      <div className="my-1.5 flex items-center justify-center">
                        {d.weatherCode >= 95 ? (
                          <CloudLightning className="h-9 w-9 text-amber-300 drop-shadow" />
                        ) : d.weatherCode >= 51 ? (
                          <CloudRain className="h-9 w-9 text-sky-200 drop-shadow" />
                        ) : d.weatherCode <= 2 ? (
                          <CloudSun className="h-9 w-9 text-amber-300 drop-shadow" />
                        ) : (
                          <Cloud className="h-9 w-9 text-sky-100 drop-shadow" />
                        )}
                      </div>

                      <div className="flex items-baseline justify-center gap-1 tabular-nums">
                        <span className="text-lg font-black">{formatSimpleDegree(d.tempMax)}</span>
                        <span className="text-xs font-bold text-sky-200">{formatSimpleDegree(d.tempMin)}</span>
                      </div>

                      <div className="text-[10px] font-semibold text-sky-100 leading-tight line-clamp-2 mt-0.5">
                        {d.label}
                      </div>

                      {/* Pastille ronde en bas de chaque carte jour */}
                      <div
                        className={` -mb-7 mt-1 h-6 w-6 rounded-full ${badgeBg} border-2 border-white shadow flex items-center justify-center`}
                      >
                        {index === 0 ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : index === 1 ? (
                          <Zap className="h-3.5 w-3.5" />
                        ) : (
                          <Cloud className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Carte "Tendances & Graphiques" */}
            <div className="rounded-[22px] bg-gradient-to-b from-white/95 to-[#e5f0fc]/95 border border-white p-4 shadow-xl text-[#0f3460] flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-[#0f3460]">Tendances &amp; Graphiques</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-[#ea580c]">
                    <span className="h-2 w-2 rounded-full bg-[#ea580c]" /> Max
                  </span>
                  <span className="flex items-center gap-1 text-[#1d63b8]">
                    <span className="h-2 w-2 rounded-full bg-[#1d63b8]" /> Min
                  </span>
                </div>
              </div>

              {/* Graphique double courbe sur fond clair quadrillé (style exact de l'image) */}
              <div className="relative h-32 w-full">
                <svg viewBox="0 0 260 105" className="w-full h-full overflow-visible">
                  {/* Lignes de grille horizontales */}
                  <line x1="28" y1="15" x2="252" y2="15" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="28" y1="40" x2="252" y2="40" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="28" y1="65" x2="252" y2="65" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="28" y1="88" x2="252" y2="88" stroke="#94a3b8" strokeWidth="1" />

                  {/* Lignes verticales */}
                  <line x1="28" y1="10" x2="28" y2="88" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="84" y1="15" x2="84" y2="88" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="140" y1="15" x2="140" y2="88" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="196" y1="15" x2="196" y2="88" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="252" y1="15" x2="252" y2="88" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Étiquettes axe Y */}
                  <text x="2" y="18" fontSize="8" fontWeight="700" fill="#334155">
                    {formatSimpleDegree(todayMax + 4)}
                  </text>
                  <text x="2" y="43" fontSize="8" fontWeight="700" fill="#334155">
                    {formatSimpleDegree(todayMax)}
                  </text>
                  <text x="2" y="68" fontSize="8" fontWeight="700" fill="#334155">
                    {formatSimpleDegree(todayMin + 2)}
                  </text>
                  <text x="2" y="90" fontSize="8" fontWeight="700" fill="#334155">
                    {formatSimpleDegree(todayMin - 2)}
                  </text>

                  {/* Courbe Orange (Température / Max) */}
                  <polyline
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="2.5"
                    points="34,42 62,56 96,30 128,36 156,50 192,33 222,26 248,18"
                  />
                  {[
                    [62, 56],
                    [96, 30],
                    [156, 50],
                    [222, 26],
                  ].map(([cx, cy], idx) => (
                    <circle
                      key={`o-${idx}`}
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#f97316"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* Courbe Bleue (Ressenti / Min) */}
                  <polyline
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2.5"
                    points="34,68 62,76 96,58 128,53 156,67 192,52 222,41 248,44"
                  />
                  {[
                    [62, 76],
                    [128, 53],
                    [156, 67],
                    [222, 41],
                  ].map(([cx, cy], idx) => (
                    <circle
                      key={`b-${idx}`}
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#1d4ed8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* Étiquettes axe X */}
                  <text x="64" y="101" fontSize="9" fontWeight="800" fill="#0f3460">
                    Max
                  </text>
                  <text x="118" y="101" fontSize="9" fontWeight="800" fill="#0f3460">
                    Ressenti
                  </text>
                  <text x="175" y="101" fontSize="9" fontWeight="800" fill="#0f3460">
                    Moy
                  </text>
                  <text x="220" y="101" fontSize="9" fontWeight="800" fill="#0f3460">
                    Min
                  </text>
                </svg>
              </div>
            </div>

            {/* 3. Mini Carte "Pollen : Élevé" avec demi-jauge colorée */}
            <div className="rounded-[18px] bg-gradient-to-r from-white/95 via-[#f2f6fc]/95 to-[#f9eac3]/85 border border-white px-4 py-2.5 shadow-lg flex items-center justify-between text-[#0f3460]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div className="text-xs sm:text-sm font-black">
                  <span>Pollen : </span>
                  <span className="text-emerald-700">
                    {weather.uvIndex && weather.uvIndex >= 5 ? 'Élevé' : 'Modéré'}
                  </span>
                </div>
              </div>

              {/* Demi-cercle multicolore à droite */}
              <svg viewBox="0 0 80 40" className="w-16 h-8 overflow-visible">
                <path d="M 8 36 A 32 32 0 0 1 24 10" fill="none" stroke="#ef4444" strokeWidth="10" />
                <path d="M 24 10 A 32 32 0 0 1 46 8" fill="none" stroke="#f59e0b" strokeWidth="10" />
                <path d="M 46 8 A 32 32 0 0 1 62 18" fill="none" stroke="#eab308" strokeWidth="10" />
                <path d="M 62 18 A 32 32 0 0 1 72 36" fill="none" stroke="#2563eb" strokeWidth="10" />
              </svg>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* BANDEAU INFÉRIEUR PLEINE LARGEUR : BULLETIN MÉTÉO + POLLEN & QUALITÉ AIR */}
        {/* ======================================================================= */}
        <div className="rounded-[22px] overflow-hidden border border-white/80 shadow-xl grid grid-cols-12 items-stretch bg-white/90">
          {/* Partie gauche/centre bleue : Bulletin Météo Vidéo / Direct */}
          <div className="col-span-12 lg:col-span-7 bg-gradient-to-r from-[#124282] via-[#1f62b6] to-[#5696dc] p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab('bulletin') : null}
                title="Ouvrir le bulletin météo complet"
                className="h-12 w-12 rounded-full bg-[#092247] hover:bg-[#0f3166] border-2 border-[#67a8f0] flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer shrink-0"
              >
                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
              </button>
              <div>
                <div className="text-sm sm:text-base font-black tracking-wide text-white">
                  Bulletin Météo Vidéo &amp; Audio
                </div>
                <div className="mt-1.5 h-1.5 w-40 sm:w-52 rounded-full bg-white/25 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-sky-200" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('bulletin') : null}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-white/95 to-[#d9ebfb]/95 hover:from-white hover:to-white text-[#0f3460] font-extrabold text-xs shadow-md border border-white transition active:scale-95 cursor-pointer"
            >
              <Play className="h-3 w-3 text-[#1d63b8] fill-[#1d63b8]" />
              <span>Voir le dernier bulletin</span>
              <Cloud className="h-4 w-4 text-[#7eb3e6] fill-[#b9d8f7] ml-1" />
            </button>
          </div>

          {/* Partie droite claire : Pollen & Qualité de l'air */}
          <div className="col-span-12 lg:col-span-5 bg-gradient-to-r from-[#e6eff9] to-[#f5f9fd] p-3.5 sm:px-5 flex items-center justify-around gap-3 text-[#0f3460]">
            {/* Pollen */}
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#65b741] to-[#3f8f29] flex items-center justify-center text-white shadow-md shrink-0">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black">
                  <span>Pollen : </span>
                  <span className="text-[#3f8f29]">
                    {weather.uvIndex && weather.uvIndex >= 5 ? 'Élevé' : 'Modéré'}
                  </span>
                </div>
                <div className="mt-1 h-1 w-24 rounded-full bg-gradient-to-r from-[#3f8f29] to-amber-400" />
              </div>
            </div>

            <div className="h-8 w-px bg-[#cbdceb]" />

            {/* Qualité de l'air */}
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 60 36" className="w-12 h-8 shrink-0 overflow-visible">
                <path d="M 6 30 A 24 24 0 0 1 30 6" fill="none" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
                <path d="M 30 6 A 24 24 0 0 1 54 30" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
                <line x1="30" y1="30" x2="40" y2="14" stroke="#0f3460" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="30" cy="30" r="3.5" fill="#0f3460" />
              </svg>
              <div>
                <div className="text-[11px] font-bold text-[#33547a] leading-tight">
                  Qualité de l&apos;air :
                </div>
                <div className="text-xs sm:text-sm font-black text-[#0f3460] leading-tight">
                  {weather.airQualityLabel || 'Modérée'} ({weather.airQualityAqi || 42} IQA)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTIONS CONSERVÉES INTÉGRALEMENT (48H HEURE PAR HEURE, SOLEIL & LUNE...) */}
      {/* ========================================================================= */}
      <div className="w-full">
        <UnifiedHourly48hTrend
          station={station}
          currentWeather={weather}
          hourly={hourly}
          tempUnit={tempUnit}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* Rangée complémentaire conservée : Tendance horaire détaillée, Soleil & Lune, Indices */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Card 1: Tendance de la journée */}
        <div className="col-span-12 lg:col-span-5 rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-sky-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-white tracking-wide">
              Tendance de la journée (24h)
            </h3>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-7 relative h-36 flex flex-col justify-between">
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-slate-500 font-mono">
                <span>28°</span>
                <span>24°</span>
                <span>20°</span>
                <span>16°</span>
                <span>12°</span>
              </div>

              <div className="ml-6 mr-1 h-28 relative">
                <svg viewBox="0 0 200 90" className="w-full h-full overflow-visible">
                  <line x1="0" y1="10" x2="200" y2="10" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="30" x2="200" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="200" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="140" y1="0" x2="140" y2="85" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                  <path d="M 0 65 Q 40 60 70 45 T 140 25 T 200 40" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                  <path d="M 0 75 Q 40 70 70 55 T 140 35 T 200 50" fill="none" stroke="#0284c7" strokeWidth="2" />
                  <circle cx="140" cy="25" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="140" cy="35" r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                </svg>

                <div className="absolute -top-3 left-[62%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow">
                  Maintenant
                </div>
              </div>

              <div className="ml-6 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>00h</span>
                <span>03h</span>
                <span>06h</span>
                <span>09h</span>
                <span>12h</span>
                <span>15h</span>
                <span>18h</span>
                <span>21h</span>
              </div>
            </div>

            <div className="col-span-5 space-y-2 border-l border-slate-800/80 pl-3">
              <div>
                <div className="text-[10px] text-slate-400">Temp. actuelle</div>
                <div className="text-sm font-black text-white">{formatTemp(weather.temperature)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Ressenti</div>
                <div className="text-sm font-black text-sky-400">{formatTemp(weather.feelsLike)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] text-slate-400">Min</div>
                  <div className="text-xs font-black text-blue-400">{formatTemp(todayMin)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Max</div>
                  <div className="text-xs font-black text-amber-400">{formatTemp(todayMax)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Température (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Ressenti (°C)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Soleil & Lune */}
        <div className="col-span-12 lg:col-span-4 rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Sun className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-white tracking-wide">
              Soleil &amp; Lune
            </h3>
          </div>

          <div className="relative py-2">
            <div className="h-16 relative flex items-center justify-center">
              <svg viewBox="0 0 160 60" className="w-full h-full overflow-visible">
                <path
                  d="M 15 55 Q 80 -10 145 55"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx="110" cy="18" r="7" fill="#f59e0b" className="animate-pulse" />
                <circle cx="110" cy="18" r="12" fill="#f59e0b" opacity="0.25" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
              <div>
                <span className="text-slate-400 text-[9px] block">Lever</span>
                <span>07:54</span>
              </div>
              <div className="text-center px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] text-amber-300 font-bold">
                ☀️ 11h 19min
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[9px] block">Coucher</span>
                <span>19:13</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 shadow-md" />
              <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-slate-900" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">Lune : 20% illuminée</div>
              <div className="text-[10px] text-slate-400">Dernier quartier</div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>🌅 02:18</span>
                <span>🌄 16:43</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Indices & Qualité de l'air */}
        <div className="col-span-12 lg:col-span-3 rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Leaf className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-white tracking-wide">
              Indices &amp; Qualité de l&apos;air
            </h3>
          </div>

          <div className="flex items-center gap-3 py-1">
            <div className="relative w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 bg-emerald-950/20">
              <span className="text-xl font-black text-emerald-400">{weather.airQualityAqi || 42}</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400">Qualité de l&apos;air</div>
              <div className="text-sm font-black text-emerald-400 leading-tight">
                {weather.airQualityLabel || 'Bonne'}
              </div>
              <div className="text-[10px] text-slate-400 leading-snug">Peu de risque pour la santé</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 block">UV</span>
              <span className="text-xs font-black text-amber-300">{weather.uvIndex ?? 5.6}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 block">Rafales</span>
              <span className="text-xs font-black text-cyan-300">{Math.round(weather.windGust || weather.windSpeed)} km/h</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 block">Pluie</span>
              <span className="text-xs font-black text-sky-300">{weather.precipitation} mm</span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('sportsActivities') : null}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer"
            >
              Voir tous les indices →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
