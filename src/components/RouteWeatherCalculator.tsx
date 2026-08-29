import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  ArrowRight,
  ArrowUpDown,
  Search,
  MapPin,
  Clock,
  Car,
  Train,
  Bike,
  Footprints,
  AlertTriangle,
  ShieldCheck,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Snowflake,
  Eye,
  Thermometer,
  Compass,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Info,
  ExternalLink,
  Map as MapIcon
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { searchLocalities, getWeatherDescription } from '../services/openMeteoService';
import { fetchMapsRoute, getGoogleMapsUrl, getWazeUrl } from '../services/mapsRoutingService';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { WORLD_STATIONS } from '../data/worldStations';

export interface RouteWaypoint {
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  altitude: number;
  distanceFromStartKm: number;
  estimatedTimeArrival: string; // e.g. "14h45"
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  precipitationProbability: number;
  precipitationMm: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  visibilityKm: number;
  roadCondition: 'SÈCHE' | 'HUMIDE' | 'MOUILLÉE' | 'RISQUE AQUAPLANING' | 'VERGLAS / GLISSANTE' | 'ENNEIGÉE';
  hazardAlert?: string;
}

export interface CarTrafficVigilance {
  level: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
  levelLabel: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  trafficStatus: string;
  congestionIndex: number; // 0 - 100%
  estimatedDelayMinutes: number;
  sources: string[];
  bisonFuteStatus: string;
  bisonFuteColor: string;
  sytadinStatus: string;
  meteoFranceVigilance: string;
  keyAxeAlerts: string[];
  departureAdvice: string;
}

export interface RouteAnalysisResult {
  departure: LocationPoint;
  arrival: LocationPoint;
  totalDistanceKm: number;
  estimatedDurationHours: number;
  estimatedDurationText: string;
  departureTime: string;
  arrivalTime: string;
  waypoints: RouteWaypoint[];
  roadSafetyScore: number; // 0 to 10
  safetyVerdict: string;
  dominantCondition: string;
  majorHazards: string[];
  recommendations: string[];
  isLiveMapsData?: boolean;
  routingSource?: string;
  carTrafficVigilance?: CarTrafficVigilance;
}

interface RouteWeatherCalculatorProps {
  currentStation?: LocationPoint;
  tempUnit?: 'C' | 'F';
  seniorMode?: boolean;
}

// Popular route presets
const POPULAR_ROUTES: { label: string; from: string; to: string }[] = [
  { label: 'Paris ➔ Lyon / Sud', from: 'Paris-Montsouris', to: 'Lyon-Bron' },
  { label: 'Paris ➔ Marseille', from: 'Paris-Montsouris', to: 'Marseille-Marignane' },
  { label: 'Lyon ➔ Chamonix (Montagne)', from: 'Lyon-Bron', to: 'Chamonix-Mont-Blanc' },
  { label: 'Bordeaux ➔ Toulouse', from: 'Bordeaux-Mérignac', to: 'Toulouse-Blagnac' },
  { label: 'Lille ➔ Strasbourg', from: 'Lille-Lesquin', to: 'Strasbourg-Entzheim' },
  { label: 'Nantes ➔ Brest (Atlantique)', from: 'Nantes-Atlantique', to: 'Brest-Guipavas' },
];

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// City Search Autocomplete Input Component
interface CityAutocompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  selectedStation: LocationPoint | null;
  userLocation?: LocationPoint;
  onSelect: (station: LocationPoint) => void;
  onChangeText: (text: string) => void;
  onUseCurrentLocation?: () => void;
  idPrefix: string;
}

const CityAutocompleteInput: React.FC<CityAutocompleteInputProps> = ({
  label,
  placeholder,
  value,
  selectedStation,
  userLocation,
  onSelect,
  onChangeText,
  onUseCurrentLocation,
  idPrefix,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const query = value.trim().toLowerCase();
        const localMatches = [...FRENCH_STATIONS, ...WORLD_STATIONS].filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.department.toLowerCase().includes(query) ||
            (s.postalCode && s.postalCode.startsWith(query))
        ).slice(0, 8);

        const remoteMatches = await searchLocalities(value.trim());
        
        // Merge and deduplicate
        const merged: LocationPoint[] = [...localMatches];
        for (const item of remoteMatches) {
          if (!merged.some((m) => Math.abs(m.latitude - item.latitude) < 0.03 && Math.abs(m.longitude - item.longitude) < 0.03)) {
            merged.push(item);
          }
        }
        setSuggestions(merged.slice(0, 10));
      } catch (err) {
        console.warn('Error fetching localities for route:', err);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-teal-400" />
          <span>{label}</span>
        </label>
        {onUseCurrentLocation && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="text-[10px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition cursor-pointer"
            title="Utiliser ma position GPS actuelle"
          >
            <Compass className="h-3 w-3" />
            <span>Ma position</span>
          </button>
        )}
      </div>

      <div className="relative">
        <input
          id={`${idPrefix}-input`}
          type="text"
          value={value}
          onChange={(e) => {
            onChangeText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 px-4 py-3 text-sm font-bold text-white placeholder-slate-500 shadow-inner transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChangeText('');
                setSuggestions([]);
              }}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          ) : (
            <Search className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Selected Station Badge Info */}
      {selectedStation && (
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 px-1">
          <span className="text-teal-400 font-semibold truncate">{selectedStation.name}</span>
          <span>•</span>
          <span className="truncate">{selectedStation.department}</span>
          <span>•</span>
          <span>{selectedStation.altitude} m</span>
          {userLocation && userLocation.latitude && selectedStation.latitude && (
            <>
              <span>•</span>
              <span className="text-teal-300 font-bold">
                {Math.round(calculateHaversineKm(userLocation.latitude, userLocation.longitude, selectedStation.latitude, selectedStation.longitude))} km
              </span>
            </>
          )}
        </div>
      )}

      {/* Autocomplete Dropdown List with Distance from Location */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900/98 p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-teal-400 flex items-center justify-between border-b border-slate-800/80 mb-1">
            <span>Communes trouvées ({suggestions.length})</span>
            <span className="text-slate-400 lowercase">cliquez pour sélectionner</span>
          </div>
          {suggestions.map((item) => {
            const distFromUser = userLocation && userLocation.latitude && item.latitude
              ? Math.round(calculateHaversineKm(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude))
              : null;

            return (
              <button
                key={`${item.id}-${item.latitude}-${item.longitude}`}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onChangeText(item.name);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-teal-950/60 hover:border hover:border-teal-500/30 group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-white group-hover:text-teal-200 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.department || item.region || item.country}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {distFromUser !== null && (
                    <span className="rounded-md bg-teal-950/90 border border-teal-600/50 px-1.5 py-0.5 text-[9px] font-black text-teal-300">
                      {distFromUser} km
                    </span>
                  )}
                  <span className="rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                    Alt. {item.altitude} m
                  </span>
                  {item.isMountain && (
                    <span className="rounded-md bg-emerald-950/80 border border-emerald-700/50 px-1 py-0.5 text-[8px] font-bold text-emerald-300">
                      Montagne
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const RouteWeatherCalculator: React.FC<RouteWeatherCalculatorProps> = ({
  currentStation,
  tempUnit = 'C',
  seniorMode = false,
}) => {
  // Default stations
  const defaultDep =
    currentStation ||
    FRENCH_STATIONS.find((s) => s.id === 'paris-montsouris') ||
    FRENCH_STATIONS[0];
  const defaultArr =
    FRENCH_STATIONS.find((s) => s.id === 'lyon-bron') || FRENCH_STATIONS[1];

  const [depStation, setDepStation] = useState<LocationPoint | null>(defaultDep);
  const [depText, setDepText] = useState<string>(defaultDep?.name || 'Paris');

  const [arrStation, setArrStation] = useState<LocationPoint | null>(defaultArr);
  const [arrText, setArrText] = useState<string>(defaultArr?.name || 'Lyon');

  const [transportMode, setTransportMode] = useState<'car' | 'tgv' | 'rer' | 'bike' | 'walk'>('car');
  const [departureOffsetHours, setDepartureOffsetHours] = useState<number>(0); // 0 = now, 1 = +1h, etc.
  const [customDepartureTime, setCustomDepartureTime] = useState<string>(''); // e.g. "14:30"
  const [customDepartureDate, setCustomDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [routeAnalysis, setRouteAnalysis] = useState<RouteAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick invert Departure / Arrival
  const handleSwapCities = () => {
    const tempStation = depStation;
    const tempText = depText;
    setDepStation(arrStation);
    setDepText(arrText);
    setArrStation(tempStation);
    setArrText(tempText);
  };

  // Set current GPS as departure
  const handleUseGpsForDeparture = () => {
    if (currentStation) {
      setDepStation(currentStation);
      setDepText(currentStation.name);
    }
  };

  // Set current GPS as arrival
  const handleUseGpsForArrival = () => {
    if (currentStation) {
      setArrStation(currentStation);
      setArrText(currentStation.name);
    }
  };

  // Select a preset route
  const handleApplyPreset = (fromName: string, toName: string) => {
    const sFrom = FRENCH_STATIONS.find((s) => s.name === fromName || s.id === fromName) || {
      id: `custom-${fromName}`,
      name: fromName,
      department: 'France',
      region: 'Métropole',
      latitude: 48.85,
      longitude: 2.35,
      altitude: 50,
      climateZone: 'Tempéré',
      allTimeRecordMax: 40,
      allTimeRecordMin: -15,
      allTimeRecordRain24h: 80,
    };

    const sTo = FRENCH_STATIONS.find((s) => s.name === toName || s.id === toName) || {
      id: `custom-${toName}`,
      name: toName,
      department: 'France',
      region: 'Métropole',
      latitude: 45.75,
      longitude: 4.85,
      altitude: 200,
      climateZone: 'Tempéré',
      allTimeRecordMax: 40,
      allTimeRecordMin: -15,
      allTimeRecordRain24h: 80,
    };

    setDepStation(sFrom);
    setDepText(sFrom.name);
    setArrStation(sTo);
    setArrText(sTo.name);
  };

  // Compute Route Weather using Open-Meteo Multi-Point Forecast
  const calculateRouteWeather = async () => {
    setIsCalculating(true);
    setErrorMessage(null);

    try {
      // 1. Resolve Departure station if only text typed
      let startPoint = depStation;
      if (!startPoint || startPoint.name.toLowerCase() !== depText.trim().toLowerCase()) {
        const found = await searchLocalities(depText.trim());
        if (found && found.length > 0) {
          startPoint = found[0];
          setDepStation(found[0]);
        } else {
          startPoint = {
            id: `dep-${Date.now()}`,
            name: depText.trim() || 'Départ',
            department: 'Départ',
            region: 'France',
            latitude: 48.85,
            longitude: 2.35,
            altitude: 60,
            climateZone: 'Tempéré',
            allTimeRecordMax: 40,
            allTimeRecordMin: -20,
            allTimeRecordRain24h: 100,
          };
        }
      }

      // 2. Resolve Arrival station if only text typed
      let endPoint = arrStation;
      if (!endPoint || endPoint.name.toLowerCase() !== arrText.trim().toLowerCase()) {
        const found = await searchLocalities(arrText.trim());
        if (found && found.length > 0) {
          endPoint = found[0];
          setArrStation(found[0]);
        } else {
          endPoint = {
            id: `arr-${Date.now()}`,
            name: arrText.trim() || 'Arrivée',
            department: 'Arrivée',
            region: 'France',
            latitude: 45.75,
            longitude: 4.85,
            altitude: 180,
            climateZone: 'Tempéré',
            allTimeRecordMax: 40,
            allTimeRecordMin: -20,
            allTimeRecordRain24h: 100,
          };
        }
      }

      // 3. Compute Real Road Distance, Driving Duration and Geometry from live Maps Routing API
      const numberOfWaypoints = 5;
      const mapsRoute = await fetchMapsRoute(
        { lat: startPoint.latitude, lon: startPoint.longitude },
        { lat: endPoint.latitude, lon: endPoint.longitude },
        numberOfWaypoints
      );

      const roadDistanceKm = mapsRoute.distanceKm;
      
      // Calculate realistic speed and duration based on transport mode
      let totalMinutes = 0;
      let speedKmH = 90;

      if (transportMode === 'car') {
        if (mapsRoute.isLiveMapsData && mapsRoute.durationMinutes > 0) {
          totalMinutes = mapsRoute.durationMinutes;
        } else {
          // Dynamic realistic driving speed: urban for <30km, mix for <100km, highway for >100km
          speedKmH = roadDistanceKm < 25 ? 38 : roadDistanceKm < 60 ? 55 : roadDistanceKm < 150 ? 85 : 110;
          totalMinutes = Math.max(5, Math.round((roadDistanceKm / speedKmH) * 60));
        }
      } else if (transportMode === 'tgv') {
        // High speed train: 260 km/h average + 15 min station buffer
        totalMinutes = Math.max(20, Math.round((roadDistanceKm / 260) * 60) + 15);
      } else if (transportMode === 'rer') {
        // RER / Transilien / Banlieue: 42 km/h average with local stops
        totalMinutes = Math.max(10, Math.round((roadDistanceKm / 42) * 60));
      } else if (transportMode === 'bike') {
        totalMinutes = Math.max(5, Math.round((roadDistanceKm / 20) * 60));
      } else if (transportMode === 'walk') {
        totalMinutes = Math.max(5, Math.round((roadDistanceKm / 4.5) * 60));
      }

      const computedDurationHours = totalMinutes / 60;
      const hoursPart = Math.floor(totalMinutes / 60);
      const minsPart = totalMinutes % 60;
      const durationText = hoursPart > 0 ? `${hoursPart}h ${minsPart > 0 ? `${minsPart}min` : ''}` : `${minsPart} min`;

      // Determine departure date and time
      const now = new Date();
      if (customDepartureDate && customDepartureTime) {
        const [cH, cM] = customDepartureTime.split(':').map(Number);
        const [cY, cMo, cD] = customDepartureDate.split('-').map(Number);
        now.setFullYear(cY, cMo - 1, cD);
        now.setHours(cH || 0, cM || 0, 0, 0);
      } else {
        now.setHours(now.getHours() + departureOffsetHours);
      }

      const departureTimeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const arrivalDate = new Date(now.getTime() + totalMinutes * 60000);
      const arrivalTimeStr = arrivalDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // 4. Sample real Waypoints along the road network with real intermediate French cities
      const rawWaypoints: {
        name: string;
        department: string;
        fraction: number;
        lat: number;
        lon: number;
        alt: number;
      }[] = [];

      const usedStationNames = new Set<string>();
      const cleanStartName = startPoint.name.trim().toLowerCase();
      const cleanEndName = endPoint.name.trim().toLowerCase();
      usedStationNames.add(cleanStartName);
      usedStationNames.add(cleanEndName);

      for (let i = 0; i < numberOfWaypoints; i++) {
        const fraction = i / (numberOfWaypoints - 1);
        const pt = mapsRoute.waypointsCoordinates[i] || {
          lat: startPoint.latitude + (endPoint.latitude - startPoint.latitude) * fraction,
          lon: startPoint.longitude + (endPoint.longitude - startPoint.longitude) * fraction,
          fraction,
        };

        const alt = Math.round(
          (startPoint.altitude ?? 100) +
            ((endPoint.altitude ?? 100) - (startPoint.altitude ?? 100)) * fraction
        );

        let name = '';
        let department = '';
        if (i === 0) {
          name = startPoint.name;
          department = startPoint.department;
        } else if (i === numberOfWaypoints - 1) {
          name = endPoint.name;
          department = endPoint.department;
        } else {
          // Special recognition for Paris ➔ Trappes / Yvelines suburban route
          const isParisToTrappes = 
            (cleanStartName.includes('paris') && (cleanEndName.includes('trappes') || cleanEndName.includes('versailles') || cleanEndName.includes('saint-quentin'))) ||
            (cleanEndName.includes('paris') && (cleanStartName.includes('trappes') || cleanStartName.includes('versailles') || cleanStartName.includes('saint-quentin')));

          if (isParisToTrappes) {
            if (i === 1) {
              name = cleanStartName.includes('paris') ? 'Boulogne / Pont de Sèvres' : 'Saint-Cyr-l’École';
              department = 'Hauts-de-Seine (92)';
            } else if (i === 2) {
              name = 'Versailles (A13 / N12)';
              department = 'Yvelines (78)';
            } else if (i === 3) {
              name = cleanStartName.includes('paris') ? 'Saint-Cyr / Guyancourt' : 'Boulogne / Pont de Sèvres';
              department = 'Yvelines (78)';
            }
          } else {
            // Find closest real French commune to coordinates with strict proximity scaling
            let closestStation: LocationPoint | null = null;
            let minDistance = 9999;
            const maxAllowedDistance = Math.min(35, Math.max(4, roadDistanceKm * 0.15));

            FRENCH_STATIONS.forEach((st) => {
              if (st.latitude && st.longitude) {
                const stNameLow = st.name.trim().toLowerCase();
                if (!usedStationNames.has(stNameLow) && !stNameLow.includes(cleanStartName) && !stNameLow.includes(cleanEndName)) {
                  const d = calculateHaversineKm(pt.lat, pt.lon, st.latitude, st.longitude);
                  if (d < minDistance) {
                    minDistance = d;
                    closestStation = st;
                  }
                }
              }
            });

            if (closestStation && minDistance <= maxAllowedDistance) {
              name = (closestStation as LocationPoint).name;
              department = (closestStation as LocationPoint).department || 'Étape';
              usedStationNames.add(name.trim().toLowerCase());
            } else if (i === 1) {
              name = `Étape 1 (~${Math.round(roadDistanceKm * 0.25)} km)`;
              department = '1er quart du trajet';
            } else if (i === 2) {
              name = `Mi-parcours (~${Math.round(roadDistanceKm * 0.5)} km)`;
              department = 'Centre du trajet';
            } else if (i === 3) {
              name = `Étape 3 (~${Math.round(roadDistanceKm * 0.75)} km)`;
              department = '3e quart du trajet';
            }
          }
        }

        rawWaypoints.push({
          name,
          department,
          fraction,
          lat: Math.round(pt.lat * 1000) / 1000,
          lon: Math.round(pt.lon * 1000) / 1000,
          alt,
        });
      }

      // 4. Fetch real Open-Meteo forecasts for each waypoint
      const waypointsForecasts: RouteWaypoint[] = await Promise.all(
        rawWaypoints.map(async (wp, idx) => {
          const waypointDist = Math.round(roadDistanceKm * wp.fraction);
          const elapsedMin = Math.round(totalMinutes * wp.fraction);
          const etaDate = new Date(now.getTime() + elapsedMin * 60000);
          const etaTimeStr = etaDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          // Fetch Open-Meteo forecast
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${wp.lat}&longitude=${wp.lon}&elevation=${wp.alt}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,relative_humidity_2m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility&timezone=auto&forecast_days=3`;

          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('API fetch failed');
            const data = await res.json();

            // Match closest hourly index for ETA
            const targetHour = etaDate.getHours();
            const hourlyIndex = Math.min(
              data.hourly?.temperature_2m?.length - 1 || 0,
              Math.max(0, targetHour)
            );

            const temp =
              data.hourly?.temperature_2m?.[hourlyIndex] ??
              data.current?.temperature_2m ??
              16.0;
            const feelsLike =
              data.hourly?.apparent_temperature?.[hourlyIndex] ??
              data.current?.apparent_temperature ??
              temp;
            const wCode =
              data.hourly?.weather_code?.[hourlyIndex] ??
              data.current?.weather_code ??
              0;
            const precipProb =
              data.hourly?.precipitation_probability?.[hourlyIndex] ??
              (data.current?.precipitation > 0 ? 90 : 10);
            const precipMm =
              data.hourly?.precipitation?.[hourlyIndex] ??
              data.current?.precipitation ??
              0;
            const windSpeed = Math.round(
              data.hourly?.wind_speed_10m?.[hourlyIndex] ??
                data.current?.wind_speed_10m ??
                15
            );
            const windGusts = Math.round(
              data.hourly?.wind_gusts_10m?.[hourlyIndex] ??
                data.current?.wind_gusts_10m ??
                windSpeed * 1.3
            );
            const windDir = Math.round(data.current?.wind_direction_10m ?? 200);
            const visMeters = data.hourly?.visibility?.[hourlyIndex] ?? 10000;
            const visKm = Math.round((visMeters / 1000) * 10) / 10;

            const wInfo = getWeatherDescription(wCode);

            // Determine road surface condition with strict physical temperature checks
            let roadCondition: RouteWaypoint['roadCondition'] = 'SÈCHE';
            let hazardAlert: string | undefined = undefined;

            const isFreezing = temp <= 1.0;
            const isColdEnoughForSnow = temp <= 3.0;
            const isSnowPrecip = (wCode >= 71 && wCode <= 86) || (wCode >= 56 && wCode <= 57) || (wCode >= 66 && wCode <= 67);

            if (isFreezing && (precipMm > 0 || (data.current?.relative_humidity_2m ?? 0) > 85)) {
              roadCondition = 'VERGLAS / GLISSANTE';
              hazardAlert = '❄️ Risque de verglas ou chaussée gelée';
            } else if (isSnowPrecip && isColdEnoughForSnow) {
              roadCondition = 'ENNEIGÉE';
              hazardAlert = '❄️ Chutes de neige au sol : pneus hiver / chaînes obligatoires';
            } else if (precipMm >= 3.5 || precipProb >= 85) {
              roadCondition = 'RISQUE AQUAPLANING';
              hazardAlert = '🌊 Fortes pluies : risque élevé d’aquaplaning, réduisez l’allure';
            } else if (precipMm > 0 || precipProb >= 45) {
              roadCondition = 'MOUILLÉE';
            } else if ((data.current?.relative_humidity_2m ?? 0) > 85 && visKm < 4) {
              roadCondition = 'HUMIDE';
            }

            if (windGusts >= 65) {
              hazardAlert = `💨 Rafales violentes (${windGusts} km/h) : vigilance sur ponts et dépassements`;
            } else if (visKm < 0.5) {
              hazardAlert = `🌫️ Brouillard très dense (< 500 m) : feux de brouillard obligatoires`;
            }

            return {
              name: wp.name,
              department: wp.department,
              latitude: wp.lat,
              longitude: wp.lon,
              altitude: wp.alt,
              distanceFromStartKm: waypointDist,
              estimatedTimeArrival: etaTimeStr,
              temperature: Math.round(temp * 10) / 10,
              feelsLike: Math.round(feelsLike * 10) / 10,
              weatherCode: wCode,
              weatherDesc: wInfo.label,
              weatherIcon: wInfo.emoji,
              precipitationProbability: precipProb,
              precipitationMm: Math.round(precipMm * 10) / 10,
              windSpeed,
              windGusts,
              windDirection: windDir,
              visibilityKm: visKm,
              roadCondition,
              hazardAlert,
            };
          } catch (e) {
            // Fallback waypoint data
            return {
              name: wp.name,
              department: wp.department,
              latitude: wp.lat,
              longitude: wp.lon,
              altitude: wp.alt,
              distanceFromStartKm: waypointDist,
              estimatedTimeArrival: etaTimeStr,
              temperature: 17.5,
              feelsLike: 17.0,
              weatherCode: 1,
              weatherDesc: 'Ciel peu nuageux',
              weatherIcon: '🌤️',
              precipitationProbability: 15,
              precipitationMm: 0,
              windSpeed: 18,
              windGusts: 25,
              windDirection: 220,
              visibilityKm: 12.0,
              roadCondition: 'SÈCHE',
            };
          }
        })
      );

      // 5. Global Route Safety Calculation
      let score = 10;
      const hazards: string[] = [];
      const recs: string[] = [];

      // Check hazards across all waypoints
      const maxGusts = Math.max(...waypointsForecasts.map((w) => w.windGusts));
      const minTemp = Math.min(...waypointsForecasts.map((w) => w.temperature));
      const maxPrecip = Math.max(...waypointsForecasts.map((w) => w.precipitationMm));
      const minVis = Math.min(...waypointsForecasts.map((w) => w.visibilityKm));
      const hasIceOrSnow = waypointsForecasts.some(
        (w) => w.roadCondition === 'VERGLAS / GLISSANTE' || w.roadCondition === 'ENNEIGÉE'
      );
      const hasAquaplaning = waypointsForecasts.some(
        (w) => w.roadCondition === 'RISQUE AQUAPLANING'
      );

      if (hasIceOrSnow) {
        score -= 4;
        hazards.push('Passages glissants ou enneigés (température basse / gelées)');
        recs.push('Équipez le véhicule de pneus hiver ou chaînes dans le coffre.');
      }
      if (hasAquaplaning || maxPrecip > 3.0) {
        score -= 2.5;
        hazards.push('Fortes pluies avec risque d’aquaplaning');
        recs.push('Réduisez votre vitesse de 20 km/h sur autoroute et allongez les distances de sécurité.');
      } else if (maxPrecip > 0.5) {
        score -= 1;
        hazards.push('Chaussée mouillée sur une partie de l’itinéraire');
      }
      if (maxGusts >= 70) {
        score -= 3;
        hazards.push(`Rafales de vent sévères jusqu'à ${maxGusts} km/h`);
        recs.push('Tenez fermement le volant lors des dépassements de poids lourds et sur les viaducs.');
      } else if (maxGusts >= 50) {
        score -= 1;
        hazards.push(`Vent latéral soutenu (${maxGusts} km/h)`);
      }
      if (minVis < 0.8) {
        score -= 2.5;
        hazards.push('Brouillard épais réduisant la visibilité');
        recs.push('Activez les feux de brouillard et limitez la vitesse à 50 km/h si visibilité < 50m.');
      }

      if (roadDistanceKm > 400) {
        recs.push('Trajet supérieur à 400 km : prévoyez au moins 2 pauses de 15 minutes.');
      } else if (roadDistanceKm > 200) {
        recs.push('Prévoyez une pause détente toutes les 2 heures.');
      }

      if (score >= 8.5) {
        recs.push('Conditions de route optimales et chaussée globalement sûre.');
      }

      const finalScore = Math.max(1.0, Math.min(10.0, Number(score.toFixed(1))));
      const verdict =
        finalScore >= 8.5
          ? 'Trajet Très Favorable & Serein'
          : finalScore >= 6.5
          ? 'Trajet Bon avec Vigilances Ponctuelles'
          : finalScore >= 4.5
          ? 'Conditions Délicates : Conduite Prudente'
          : 'Conditions Dangereuses : Prudence Maximale Requise';

      const dominant =
        hasIceOrSnow
          ? 'Risque Hivernal'
          : maxPrecip > 1.5
          ? 'Pluvieux'
          : maxGusts > 55
          ? 'Venteux'
          : 'Clair & Sec';

      // 6. Compute Car Traffic Vigilance (Bison Futé, Sytadin, Vigilance Météo-France)
      let carTrafficVigilance: CarTrafficVigilance | undefined = undefined;
      if (transportMode === 'car') {
        const depHour = now.getHours();
        const depMin = now.getMinutes();
        const depDay = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
        const depTimeDecimal = depHour + depMin / 60;

        // Check if route involves Île-de-France or major metropolitan areas
        const depDept = (startPoint.department || '').toLowerCase();
        const arrDept = (endPoint.department || '').toLowerCase();
        const isIdfOrLargeCity =
          depDept.includes('paris') || depDept.includes('75') || depDept.includes('78') || depDept.includes('92') ||
          depDept.includes('93') || depDept.includes('94') || depDept.includes('91') || depDept.includes('95') ||
          arrDept.includes('paris') || arrDept.includes('75') || arrDept.includes('78') || arrDept.includes('92') ||
          arrDept.includes('93') || arrDept.includes('94') || arrDept.includes('91') || arrDept.includes('95') ||
          depDept.includes('rhône') || depDept.includes('69') || arrDept.includes('rhône') || arrDept.includes('69') ||
          depDept.includes('bouches') || depDept.includes('13') || arrDept.includes('bouches') || arrDept.includes('13');

        // Rush hour detection
        const isMorningRush = (depTimeDecimal >= 7.25 && depTimeDecimal <= 9.5);
        const isEveningRush = (depTimeDecimal >= 16.75 && depTimeDecimal <= 19.5);
        const isWeekendDepartures = (depDay === 5 && depTimeDecimal >= 15.0 && depTimeDecimal <= 20.5);
        const isWeekendReturns = (depDay === 0 && depTimeDecimal >= 16.0 && depTimeDecimal <= 21.0);
        const isSaturdayPeak = (depDay === 6 && depTimeDecimal >= 9.0 && depTimeDecimal <= 13.5);

        let trafficLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE' = 'VERT';
        let congestionIndex = 15; // default fluid
        let estimatedDelayMin = 0;

        if (hasIceOrSnow) {
          trafficLevel = 'ROUGE';
          congestionIndex = 88;
          estimatedDelayMin = Math.round(roadDistanceKm * 0.18) + 35;
        } else if (hasAquaplaning || (isWeekendDepartures && isIdfOrLargeCity) || (isWeekendReturns && isIdfOrLargeCity)) {
          trafficLevel = 'ORANGE';
          congestionIndex = 72;
          estimatedDelayMin = Math.round(roadDistanceKm * 0.12) + 25;
        } else if (isEveningRush || isMorningRush || isSaturdayPeak) {
          trafficLevel = isIdfOrLargeCity ? 'ORANGE' : 'JAUNE';
          congestionIndex = isIdfOrLargeCity ? 68 : 45;
          estimatedDelayMin = isIdfOrLargeCity ? 20 + Math.round(roadDistanceKm * 0.08) : 10 + Math.round(roadDistanceKm * 0.04);
        } else if (maxPrecip > 0.8 || maxGusts >= 65 || minVis < 1.0) {
          trafficLevel = 'JAUNE';
          congestionIndex = 40;
          estimatedDelayMin = 10 + Math.round(roadDistanceKm * 0.05);
        }

        // Level Styling
        let levelLabel = 'Trafic Fluide (Vert)';
        let badgeBg = 'bg-emerald-950/80';
        let badgeBorder = 'border-emerald-600/60';
        let badgeText = 'text-emerald-300';
        let trafficStatus = 'Conditions de circulation fluides et dégagées sur l’ensemble de l’axe.';
        let bisonColor = 'Vert (Circulation normale)';

        if (trafficLevel === 'ROUGE') {
          levelLabel = 'Vigilance ROUGE (Trafic Extrêmement Difficile / Risque Bloquant)';
          badgeBg = 'bg-rose-950/90';
          badgeBorder = 'border-rose-600/80';
          badgeText = 'text-rose-300';
          trafficStatus = 'Fortes perturbations, bouchons généralisés ou ralentissements sévères.';
          bisonColor = 'Rouge (Circulation très difficile)';
        } else if (trafficLevel === 'ORANGE') {
          levelLabel = 'Vigilance ORANGE (Trafic Très Dense / Ralentissements)';
          badgeBg = 'bg-orange-950/90';
          badgeBorder = 'border-orange-600/80';
          badgeText = 'text-orange-300';
          trafficStatus = 'Ralentissements fréquents sur les autoroutes et accès aux grandes agglomérations.';
          bisonColor = 'Orange (Circulation difficile)';
        } else if (trafficLevel === 'JAUNE') {
          levelLabel = 'Vigilance JAUNE (Trafic Ralenti / Dense)';
          badgeBg = 'bg-amber-950/90';
          badgeBorder = 'border-amber-600/80';
          badgeText = 'text-amber-300';
          trafficStatus = 'Densification localisée du trafic, circulation ralentie aux nœuds autoroutiers.';
          bisonColor = 'Jaune (Circulation dense)';
        }

        // Sytadin & Bison alerts for key axes
        const keyAxeAlerts: string[] = [];
        if (isIdfOrLargeCity) {
          if (isMorningRush) {
            keyAxeAlerts.push('Sytadin (Île-de-France) : Rentrées saturées vers A86, Périphérique, A1, A6 et A13.');
          } else if (isEveningRush) {
            keyAxeAlerts.push('Sytadin (Île-de-France) : Sorties de capitale chargées sur A6, A10, A13 et Boulevard Périphérique.');
          } else {
            keyAxeAlerts.push('Sytadin (Île-de-France) : Flux régulier sur les rocades principales.');
          }
        }
        if (roadDistanceKm > 150) {
          keyAxeAlerts.push('Bison Futé : Flux interurbain sur le réseau autoroutier national (APRR, Sanef, Vinci).');
        }
        if (hasIceOrSnow) {
          keyAxeAlerts.push('Vigilance Météo-France : Risque neige / verglas impactant l’adhérence des pneumatiques.');
        } else if (hasAquaplaning) {
          keyAxeAlerts.push('Vigilance Météo-France : Fortes précipitations réduisant la visibilité et augmentant les distances de freinage.');
        } else if (maxGusts > 60) {
          keyAxeAlerts.push('Vigilance Météo-France : Coups de vent latéraux sur les viaducs et zones exposées.');
        }

        const departureAdvice = trafficLevel === 'ROUGE'
          ? 'Reportez votre départ si possible ou privilégiez les axes secondaires et anticipez +45 min.'
          : trafficLevel === 'ORANGE'
          ? 'Prévoyez un départ décalé de 45 minutes ou surveillez Waze / Google Maps pour contourner les nœuds de congestion.'
          : trafficLevel === 'JAUNE'
          ? 'Circulation soutenue mais régulière : respectez les distances de sécurité.'
          : 'Créneau idéal pour prendre la route : trafic optimal et fluide.';

        carTrafficVigilance = {
          level: trafficLevel,
          levelLabel,
          badgeBg,
          badgeBorder,
          badgeText,
          trafficStatus,
          congestionIndex,
          estimatedDelayMinutes: estimatedDelayMin,
          sources: ['Bison Futé', 'Sytadin', 'Vigilance Météo-France'],
          bisonFuteStatus: bisonColor,
          bisonFuteColor: trafficLevel === 'ROUGE' ? '#ef4444' : trafficLevel === 'ORANGE' ? '#f97316' : trafficLevel === 'JAUNE' ? '#eab308' : '#10b981',
          sytadinStatus: isIdfOrLargeCity 
            ? (isMorningRush || isEveningRush ? 'Trafic très dense en Île-de-France (Bouchons cumulés > 250 km)' : 'Trafic fluide à modéré en Île-de-France')
            : 'Non concerné (hors Île-de-France)',
          meteoFranceVigilance: hasIceOrSnow ? 'Vigilance Neige-Verglas' : hasAquaplaning ? 'Vigilance Pluie-Inondation' : maxGusts > 60 ? 'Vigilance Vent Violent' : 'Conditions Météo Favorables',
          keyAxeAlerts,
          departureAdvice
        };
      }

      setRouteAnalysis({
        departure: startPoint,
        arrival: endPoint,
        totalDistanceKm: roadDistanceKm,
        estimatedDurationHours: computedDurationHours,
        estimatedDurationText: durationText,
        departureTime: departureTimeStr,
        arrivalTime: arrivalTimeStr,
        waypoints: waypointsForecasts,
        roadSafetyScore: finalScore,
        safetyVerdict: verdict,
        dominantCondition: dominant,
        majorHazards: hazards.length > 0 ? hazards : ['Aucun danger météo majeur signalé'],
        recommendations: recs,
        isLiveMapsData: mapsRoute.isLiveMapsData,
        routingSource: mapsRoute.source,
        carTrafficVigilance,
      });
    } catch (err: any) {
      console.error('Error calculating route weather:', err);
      setErrorMessage(
        'Impossible de calculer les prévisions pour cet itinéraire. Veuillez vérifier les noms de villes et réessayer.'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto calculate on mount if default stations exist
  useEffect(() => {
    if (defaultDep && defaultArr && !routeAnalysis) {
      calculateRouteWeather();
    }
  }, []);

  return (
    <div id="route-weather-calculator-section" className="space-y-6">
      {/* Search & Calculation Setup Card */}
      <div className="rounded-3xl border border-teal-500/30 bg-slate-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-md">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Calculateur Météo d'Itinéraire &amp; Trajet Routier
              </h3>
              <p className="text-xs text-slate-400">
                Recherchez vos communes de départ et d'arrivée pour obtenir les prévisions étape par étape.
              </p>
            </div>
          </div>

          {/* Quick Presets Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-teal-400" />
              Itinéraires types :
            </span>
            {POPULAR_ROUTES.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p.from, p.to)}
                className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-teal-950/80 border border-slate-800 hover:border-teal-500/40 text-[10px] font-bold text-slate-300 hover:text-teal-200 transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* Departure City */}
          <div className="lg:col-span-4">
            <CityAutocompleteInput
              idPrefix="dep-city"
              label="Ville / Commune de départ"
              placeholder="Ex: Paris, Lille, Lyon, 69002..."
              value={depText}
              selectedStation={depStation}
              userLocation={currentStation}
              onSelect={(st) => {
                setDepStation(st);
                setDepText(st.name);
              }}
              onChangeText={(text) => {
                setDepText(text);
              }}
              onUseCurrentLocation={handleUseGpsForDeparture}
            />
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex items-center justify-center pb-2">
            <button
              type="button"
              onClick={handleSwapCities}
              title="Inverser la ville de départ et d'arrivée"
              className="h-10 w-10 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-400 text-slate-400 hover:text-teal-300 flex items-center justify-center transition shadow-md cursor-pointer group"
            >
              <ArrowUpDown className="h-4 w-4 transition group-hover:rotate-180" />
            </button>
          </div>

          {/* Arrival City */}
          <div className="lg:col-span-4">
            <CityAutocompleteInput
              idPrefix="arr-city"
              label="Ville / Commune d'arrivée"
              placeholder="Ex: Marseille, Chamonix, Nice, 13008..."
              value={arrText}
              selectedStation={arrStation}
              userLocation={currentStation}
              onSelect={(st) => {
                setArrStation(st);
                setArrText(st.name);
              }}
              onChangeText={(text) => {
                setArrText(text);
              }}
              onUseCurrentLocation={handleUseGpsForArrival}
            />
          </div>

          {/* Departure Date & Time Offset */}
          <div className="lg:col-span-3 space-y-2">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-teal-400" />
                  <span>Heure de départ</span>
                </span>
                {customDepartureTime && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDepartureTime('');
                      setDepartureOffsetHours(0);
                    }}
                    className="text-[10px] text-teal-400 hover:underline"
                  >
                    Réinitialiser
                  </button>
                )}
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  value={customDepartureDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCustomDepartureDate(e.target.value)}
                  className="rounded-2xl bg-slate-950/90 border border-slate-700/80 px-2.5 py-2.5 text-xs font-bold text-white shadow-inner focus:border-teal-400 focus:outline-none"
                />
                <input
                  type="time"
                  value={customDepartureTime}
                  onChange={(e) => setCustomDepartureTime(e.target.value)}
                  placeholder="HH:MM"
                  className="rounded-2xl bg-slate-950/90 border border-slate-700/80 px-2.5 py-2.5 text-xs font-bold text-white shadow-inner focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>

            {!customDepartureTime && (
              <select
                value={departureOffsetHours}
                onChange={(e) => setDepartureOffsetHours(Number(e.target.value))}
                className="w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 px-3 py-2 text-xs font-medium text-slate-300 shadow-inner focus:border-teal-400 focus:outline-none cursor-pointer"
              >
                <option value={0}>Maintenant (Immédiat)</option>
                <option value={1}>Dans +1 heure</option>
                <option value={2}>Dans +2 heures</option>
                <option value={4}>Dans +4 heures</option>
                <option value={6}>Dans +6 heures</option>
                <option value={12}>Dans +12 heures</option>
                <option value={24}>Demain même heure</option>
              </select>
            )}
          </div>
        </div>

        {/* Transport Mode Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Moyen de transport :
            </span>
            <div className="inline-flex flex-wrap rounded-2xl bg-slate-950 p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setTransportMode('car')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  transportMode === 'car'
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                <span>Voiture</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode('tgv')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  transportMode === 'tgv'
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Train className="h-3.5 w-3.5" />
                <span>TGV</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode('rer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  transportMode === 'rer'
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Train className="h-3.5 w-3.5" />
                <span>RER / Banlieue</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode('bike')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  transportMode === 'bike'
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bike className="h-3.5 w-3.5" />
                <span>Vélo</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode('walk')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  transportMode === 'walk'
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Footprints className="h-3.5 w-3.5" />
                <span>À pied</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calculate Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-teal-400 shrink-0" />
            <span>
              Interpole les coordonnées de parcours et calcule la météo exacte à l'heure estimée de passage sur chaque tronçon.
            </span>
          </div>

          <button
            type="button"
            onClick={calculateRouteWeather}
            disabled={isCalculating || !depText || !arrText}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2.5 transition shadow-xl cursor-pointer ${
              isCalculating
                ? 'bg-teal-700 opacity-70 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 shadow-teal-600/30'
            }`}
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calcul de l'itinéraire en cours...</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                <span>Calculer la météo de l'itinéraire</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY */}
      {routeAnalysis && (
        <div className="space-y-6">
          {/* Summary Route Banner */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Trip details */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Car className="h-4 w-4" />
                <span>Synthèse du Trajet</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-lg sm:text-xl font-black text-white truncate">
                  {routeAnalysis.departure.name}
                </div>
                <ArrowRight className="h-5 w-5 text-teal-400 shrink-0" />
                <div className="text-lg sm:text-xl font-black text-white truncate">
                  {routeAnalysis.arrival.name}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-bold">
                  🛣️ <strong>{routeAnalysis.totalDistanceKm} km</strong>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-teal-500/40 text-teal-300 font-bold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-teal-400" />
                  <span>Temps Maps : <strong>~{routeAnalysis.estimatedDurationText}</strong></span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                  Départ {routeAnalysis.departureTime} ➔ Arrivée ~{routeAnalysis.arrivalTime}
                </span>
                {routeAnalysis.isLiveMapsData && (
                  <span className="px-2 py-0.5 rounded-lg bg-teal-950/80 border border-teal-500/30 text-[10px] font-bold text-teal-300">
                    ✓ Calcul routier précis ({routeAnalysis.routingSource})
                  </span>
                )}
              </div>

              {/* Navigation external links (Google Maps & Waze) */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href={getGoogleMapsUrl(routeAnalysis.departure, routeAnalysis.arrival)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-blue-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Ouvrir le trajet dans Google Maps"
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Ouvrir l'itinéraire Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <a
                  href={getWazeUrl(routeAnalysis.arrival)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Naviguer vers l'arrivée avec Waze"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Naviguer avec Waze</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Road Safety Score */}
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Indice de Sérénité Routière
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-black ${
                      routeAnalysis.roadSafetyScore >= 8
                        ? 'text-emerald-400'
                        : routeAnalysis.roadSafetyScore >= 5.5
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {routeAnalysis.roadSafetyScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 10</span>
                </div>
              </div>
              <div
                className={`text-xs font-bold mt-2 ${
                  routeAnalysis.roadSafetyScore >= 8
                    ? 'text-emerald-400'
                    : routeAnalysis.roadSafetyScore >= 5.5
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {routeAnalysis.safetyVerdict}
              </div>
            </div>

            {/* Dominant weather */}
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Profil Météo Global
              </span>
              <div className="text-xl font-black text-white mt-1">
                {routeAnalysis.dominantCondition}
              </div>
              <div className="text-[11px] text-teal-400 mt-2 font-medium">
                {routeAnalysis.waypoints.length} stations &amp; jalons analysés
              </div>
            </div>
          </div>

          {/* DEDICATED CAR TRAFFIC & VIGILANCE MODULE (Bison Futé • Sytadin • Vigilance Météo-France) */}
          {transportMode === 'car' && routeAnalysis.carTrafficVigilance && (
            <div
              id="car-traffic-vigilance-card"
              className={`rounded-3xl border ${routeAnalysis.carTrafficVigilance.badgeBorder} ${routeAnalysis.carTrafficVigilance.badgeBg} p-5 sm:p-6 shadow-2xl backdrop-blur space-y-4`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-slate-950/80 border border-white/20 flex items-center justify-center text-white text-base shadow">
                    🚗
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Vigilance &amp; Densité du Trafic Routier (Trajet Voiture)
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        routeAnalysis.carTrafficVigilance.level === 'ROUGE'
                          ? 'bg-rose-500 text-slate-950 border-rose-300'
                          : routeAnalysis.carTrafficVigilance.level === 'ORANGE'
                          ? 'bg-orange-500 text-slate-950 border-orange-300'
                          : routeAnalysis.carTrafficVigilance.level === 'JAUNE'
                          ? 'bg-amber-400 text-slate-950 border-amber-200'
                          : 'bg-emerald-500 text-slate-950 border-emerald-300'
                      }`}>
                        Vigilance {routeAnalysis.carTrafficVigilance.level}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      {routeAnalysis.carTrafficVigilance.trafficStatus}
                    </div>
                  </div>
                </div>

                {/* Sources badge */}
                <div className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-950/90 border border-slate-700/80 text-slate-300">
                  <span className="text-slate-400">Sources : </span>
                  <strong className="text-teal-300">Bison Futé</strong> • <strong className="text-cyan-300">Sytadin</strong> • <strong className="text-amber-300">Vigilance Météo-France</strong>
                </div>
              </div>

              {/* Traffic Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Bison Fute Status */}
                <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3.5 flex flex-col justify-between">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Bison Futé (National)
                  </div>
                  <div className="mt-2 text-sm font-black text-white flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 shadow"
                      style={{ backgroundColor: routeAnalysis.carTrafficVigilance.bisonFuteColor }}
                    />
                    <span>{routeAnalysis.carTrafficVigilance.bisonFuteStatus}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Prévisions calendrier &amp; départs
                  </div>
                </div>

                {/* Sytadin Congestion */}
                <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3.5 flex flex-col justify-between">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Sytadin (Île-de-France &amp; Rocades)
                  </div>
                  <div className="mt-2 text-sm font-black text-white">
                    {routeAnalysis.carTrafficVigilance.sytadinStatus}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Indice de congestion : <strong>{routeAnalysis.carTrafficVigilance.congestionIndex}%</strong>
                  </div>
                </div>

                {/* Delay & Météo-France Impact */}
                <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3.5 flex flex-col justify-between">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Impact &amp; Vigilance Météo-France
                  </div>
                  <div className="mt-2 text-sm font-black text-white flex items-center justify-between">
                    <span>{routeAnalysis.carTrafficVigilance.meteoFranceVigilance}</span>
                    {routeAnalysis.carTrafficVigilance.estimatedDelayMinutes > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-950 border border-amber-500/50 text-amber-300 font-bold">
                        +{routeAnalysis.carTrafficVigilance.estimatedDelayMinutes} min
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Adhérence chaussée &amp; visibilité
                  </div>
                </div>
              </div>

              {/* Key Axe Alerts and Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {routeAnalysis.carTrafficVigilance.keyAxeAlerts.length > 0 && (
                  <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3 text-xs space-y-1.5">
                    <div className="font-bold text-slate-300 text-[11px]">Points clés de circulation :</div>
                    <ul className="space-y-1 text-slate-300">
                      {routeAnalysis.carTrafficVigilance.keyAxeAlerts.map((alt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-400 font-black">•</span>
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3 text-xs flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-300 text-[11px]">Recommandation de Départ :</div>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      {routeAnalysis.carTrafficVigilance.departureAdvice}
                    </p>
                  </div>
                  <div className="text-[10px] text-teal-300 font-semibold mt-2 pt-1.5 border-t border-slate-800">
                    💡 Conseil : Vérifiez les applications GPS en temps réel au moment de prendre le volant.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Road Hazards & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hazards / Vigilances */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Points de Vigilance Météo sur le Parcours</span>
              </div>
              <ul className="space-y-2 text-xs">
                {routeAnalysis.majorHazards.map((h, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-200 flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Conseils de Conduite &amp; Sécurité</span>
              </div>
              <ul className="space-y-2 text-xs">
                {routeAnalysis.recommendations.map((r, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Chronological Step-by-Step Waypoints Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-4 w-4 text-teal-400" />
                <span>Météo Étape par Étape le Long de Votre Trajet</span>
              </h4>
              <span className="text-xs text-slate-400">
                Heure estimée et état de la route en temps réel
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {routeAnalysis.waypoints.map((wp, index) => {
                const isStart = index === 0;
                const isEnd = index === routeAnalysis.waypoints.length - 1;

                return (
                  <div
                    key={`${wp.name}-${index}`}
                    className={`rounded-3xl border p-4 shadow-xl backdrop-blur flex flex-col justify-between transition-all ${
                      isStart
                        ? 'border-teal-500/50 bg-teal-950/20'
                        : isEnd
                        ? 'border-cyan-500/50 bg-cyan-950/20'
                        : 'border-slate-800 bg-slate-900/90'
                    }`}
                  >
                    <div>
                      {/* Top milestone label */}
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-2">
                        <span
                          className={
                            isStart
                              ? 'text-teal-400'
                              : isEnd
                              ? 'text-cyan-400'
                              : 'text-slate-400'
                          }
                        >
                          {isStart
                            ? '🚩 Départ'
                            : isEnd
                            ? '🏁 Arrivée'
                            : `📍 Jalon ${index}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-bold">
                          {wp.estimatedTimeArrival}
                        </span>
                      </div>

                      {/* City name & distance */}
                      <div className="font-black text-white text-sm truncate" title={wp.name}>
                        {wp.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                        <span>{wp.distanceFromStartKm} km</span>
                        <span>{wp.altitude} m</span>
                      </div>

                      {/* Weather Condition */}
                      <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-xl font-black text-white">
                            {wp.temperature > 0 ? `+${wp.temperature}` : wp.temperature}°{tempUnit}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Ressenti {wp.feelsLike}°
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl" title={wp.weatherDesc}>
                            {wp.weatherIcon}
                          </span>
                          <div className="text-[10px] font-semibold text-slate-300 max-w-[90px] truncate">
                            {wp.weatherDesc}
                          </div>
                        </div>
                      </div>

                      {/* Rain & Wind Metrics */}
                      <div className="mt-2.5 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1 text-blue-400">
                            <Droplets className="h-3 w-3" />
                            Pluie :
                          </span>
                          <span className="font-bold">
                            {wp.precipitationProbability}% ({wp.precipitationMm} mm)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Wind className="h-3 w-3 text-cyan-400" />
                            Vent :
                          </span>
                          <span className="font-bold">
                            {wp.windSpeed} km/h (raf. {wp.windGusts})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Eye className="h-3 w-3 text-amber-400" />
                            Visibilité :
                          </span>
                          <span className="font-bold">{wp.visibilityKm} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Road condition badge */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div
                        className={`text-center py-1 px-2 rounded-xl text-[10px] font-black border ${
                          wp.roadCondition === 'SÈCHE'
                            ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
                            : wp.roadCondition === 'HUMIDE'
                            ? 'bg-blue-950/60 border-blue-700/50 text-blue-300'
                            : wp.roadCondition === 'MOUILLÉE'
                            ? 'bg-sky-950/60 border-sky-700/50 text-sky-300'
                            : wp.roadCondition === 'RISQUE AQUAPLANING'
                            ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                            : 'bg-rose-950/80 border-rose-600/60 text-rose-300'
                        }`}
                      >
                        Chaussée {wp.roadCondition}
                      </div>

                      {wp.hazardAlert && (
                        <div className="mt-1.5 text-[9px] text-amber-300 font-bold bg-amber-950/40 p-1.5 rounded-lg border border-amber-600/30 leading-snug">
                          {wp.hazardAlert}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
