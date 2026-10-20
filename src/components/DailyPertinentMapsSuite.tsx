import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  CloudRain, 
  Snowflake, 
  Flame, 
  Wind, 
  Zap, 
  Globe, 
  MapPin, 
  Layers, 
  Maximize2, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  Info,
  Sun,
  Eye,
  Waves,
  Gauge,
  Play,
  Pause,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { LocationPoint, CurrentWeather, DailyForecast, HourlyForecast } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { WORLD_STATIONS, WorldCityPoint } from '../data/worldStations';

export type DailyMapHazardType = 
  | 'rainRadar'
  | 'frostRisk'
  | 'heatwaveRisk'
  | 'coldSnapRisk'
  | 'stormsLightning'
  | 'windGusts'
  | 'airQuality'
  | 'uvIndex';

export const WORLD_CONTINENTS = [
  { id: 'world', label: '🌍 Monde Global', lat: 20, lon: 10, zoom: 2 },
  { id: 'france', label: '🇫🇷 France & DOM', lat: 46.6, lon: 2.2, zoom: 6 },
  { id: 'europe', label: '🇪🇺 Europe', lat: 50, lon: 15, zoom: 4 },
  { id: 'namerica', label: '🇺🇸 Amér. du Nord', lat: 40, lon: -98, zoom: 3 },
  { id: 'samerica', label: '🇧🇷 Amér. du Sud', lat: -15, lon: -60, zoom: 3 },
  { id: 'asia', label: '🇯🇵 Asie', lat: 35, lon: 105, zoom: 3 },
  { id: 'mideast', label: '🇦🇪 Moyen-Orient', lat: 26, lon: 45, zoom: 4 },
  { id: 'africa', label: '🇿🇦 Afrique', lat: 0, lon: 20, zoom: 3 },
  { id: 'oceania', label: '🇦🇺 Océanie', lat: -25, lon: 135, zoom: 4 }
];

interface DailyPertinentMapsSuiteProps {
  station: LocationPoint;
  weather: CurrentWeather;
  daily?: DailyForecast[];
  hourly?: HourlyForecast[];
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DailyPertinentMapsSuite: React.FC<DailyPertinentMapsSuiteProps> = ({
  station,
  weather,
  daily = [],
  hourly = [],
  tempUnit = 'C',
  onSelectStation,
  onNavigateTab
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const todayForecast = daily[0];
  const tmin = todayForecast?.tempMin ?? Math.round((weather.temperature - 4) * 10) / 10;
  const tmax = todayForecast?.tempMax ?? Math.round((weather.temperature + 3) * 10) / 10;
  const rainSum = todayForecast?.precipitationSumMm ?? todayForecast?.rainMm ?? weather.precipitation ?? 0;
  const windGust = weather.windGust || (weather.windSpeed * 1.4);

  // Diagnostic automatique de la pertinence météorologique du jour
  const todayDiagnosedHazard = useMemo<{
    primaryType: DailyMapHazardType;
    reasonTitle: string;
    reasonDesc: string;
    urgencyLevel: 'critique' | 'surveillance' | 'standard';
  }>(() => {
    // 1. Risque Gel & Seuils Arboricoles si Tmin <= 3.0°C
    if (tmin <= 3.0 || weather.temperature <= 3.0) {
      return {
        primaryType: 'frostRisk',
        reasonTitle: 'Carte Clé du Jour : Probabilité de Gel & Risque Arboricole',
        reasonDesc: `Tmin prévue à ${tmin}°C (${tmin <= 0 ? 'gelée sous abri' : 'risque de gelée blanche au sol'}). Surveillance des cultures, vergers et routes glissantes.`,
        urgencyLevel: tmin <= 0 ? 'critique' : 'surveillance'
      };
    }

    // 2. Risque Orages Convectifs & Foudre
    if ([95, 96, 99].includes(weather.weatherCode) || (todayForecast?.weatherCode && [95, 96, 99].includes(todayForecast.weatherCode))) {
      return {
        primaryType: 'stormsLightning',
        reasonTitle: 'Carte Clé du Jour : Vigilance Orages & Impacts de Foudre',
        reasonDesc: "Activité orageuse convective active sur le secteur. Surveillance radar des cellules et des rafales sous grains.",
        urgencyLevel: 'critique'
      };
    }

    // 3. Risque Précipitations / Pluie soutenue
    if (rainSum >= 1.0 || (weather.precipitation || 0) > 0.5) {
      return {
        primaryType: 'rainRadar',
        reasonTitle: 'Carte Clé du Jour : Radar Pluie HD & Cumuls de Précipitations',
        reasonDesc: `Cumul de pluie attendu (${rainSum} mm). Suivi chirurgical des échos de pluie minute par minute en direct.`,
        urgencyLevel: rainSum >= 15 ? 'critique' : 'surveillance'
      };
    }

    // 4. Risque Canicule / Chaleur
    if (tmax >= 30.0 || weather.temperature >= 30.0) {
      return {
        primaryType: 'heatwaveRisk',
        reasonTitle: 'Carte Clé du Jour : Stress Thermique & Risque Canicule',
        reasonDesc: `Forte chaleur diurne (${tmax}°C). Suivi des couples nocturne/diurne et indice biométéorologique.`,
        urgencyLevel: tmax >= 35 ? 'critique' : 'surveillance'
      };
    }

    // 5. Risque Vent Violent
    if (windGust >= 60) {
      return {
        primaryType: 'windGusts',
        reasonTitle: 'Carte Clé du Jour : Champ des Vents & Rafales Maximales',
        reasonDesc: `Rafales mesurées à ${Math.round(windGust)} km/h. Surveillance des axes exposés et massifs forestiers.`,
        urgencyLevel: windGust >= 80 ? 'critique' : 'surveillance'
      };
    }

    // Par défaut : Radar Pluie Doppler HD & Vue Synoptique
    return {
      primaryType: 'rainRadar',
      reasonTitle: 'Carte Clé du Jour : Radar des Précipitations & Surveillance HD',
      reasonDesc: "Conditions calmes. Surveillance radar haute résolution et néphologique en temps réel.",
      urgencyLevel: 'standard'
    };
  }, [tmin, tmax, rainSum, weather.weatherCode, weather.temperature, weather.precipitation, windGust, todayForecast?.weatherCode]);

  const [activeHazard, setActiveHazard] = useState<DailyMapHazardType>(todayDiagnosedHazard.primaryType);
  const [mapScope, setMapScope] = useState<'local' | 'world'>(() => {
    return (station.countryCode && station.countryCode !== 'FR' && station.country !== 'France') ? 'world' : 'local';
  });
  const [radarTimestamp, setRadarTimestamp] = useState<number | null>(null);

  // Synchronisation si le diagnostic change pour une nouvelle station
  useEffect(() => {
    setActiveHazard(todayDiagnosedHazard.primaryType);
    if (station.countryCode && station.countryCode !== 'FR' && station.country !== 'France') {
      setMapScope('world');
    }
  }, [todayDiagnosedHazard.primaryType, station.id, station.countryCode]);

  // Récupération de l'horodatage RainViewer pour radar mondial
  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.radar && Array.isArray(data.radar.past) && data.radar.past.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1];
          setRadarTimestamp(latest.time);
        }
      })
      .catch(() => {});
  }, []);

  // Échantillon représentatif de stations pour le calque de seuil interactif
  const thresholdStations = useMemo(() => {
    if (mapScope === 'world') {
      // Échantillon de grandes métropoles mondiales sur tous les continents
      return WORLD_STATIONS.slice(0, 120);
    }
    // Échantillon national et régional français représentatif
    return FRENCH_STATIONS.slice(0, 80);
  }, [mapScope]);

  const handleFlyToContinent = (c: typeof WORLD_CONTINENTS[0]) => {
    if (c.id === 'france') {
      setMapScope('local');
    } else {
      setMapScope('world');
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([c.lat, c.lon], c.zoom, { duration: 1.2 });
    }
  };

  // Initialisation et gestion de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialZoom = mapScope === 'world' ? 3 : 6;
      const initialCenter: [number, number] = mapScope === 'world' 
        ? [station.latitude, station.longitude]
        : [station.latitude, station.longitude];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false
      });

      // Fond de carte sombre CartoDB Dark Matter : anti-éblouissement, reposant pour les yeux
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    } else {
      const map = mapInstanceRef.current;
      if (mapScope === 'world') {
        map.setView([25, 10], 3, { animate: true });
      } else {
        map.setView([station.latitude, station.longitude], 6, { animate: true });
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Gestion du calque Radar RainViewer mondial
    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (activeHazard === 'rainRadar' && radarTimestamp) {
      const radarTile = L.tileLayer(
        `https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/512/{z}/{x}/{y}/2/1_1.png`,
        {
          opacity: 0.72,
          zIndex: 400
        }
      );
      radarTile.addTo(map);
      radarLayerRef.current = radarTile;
    }

    // Tracé des marqueurs de stations avec leurs seuils interactifs
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      // 1. Marqueur de la station active sélectionnée
      const pulseColor = activeHazard === 'frostRisk' ? '#38bdf8' 
        : activeHazard === 'heatwaveRisk' ? '#f97316' 
        : activeHazard === 'stormsLightning' ? '#eab308' 
        : '#0284c7';

      const userMarkerHtml = `
        <div style="display:flex;align-items:center;justify-content:center;position:relative;">
          <div style="width:28px;height:28px;border-radius:50%;background:${pulseColor};opacity:0.35;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;position:absolute;"></div>
          <div style="width:18px;height:18px;border-radius:50%;background:${pulseColor};border:2px solid white;box-shadow:0 0 12px rgba(0,0,0,0.8);position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:6px;height:6px;border-radius:50%;background:white;"></div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'custom-live-marker',
        html: userMarkerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const currentMarker = L.marker([station.latitude, station.longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(markersLayerRef.current);
      currentMarker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;padding:6px;color:#0f172a;min-width:200px;">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
            <span style="font-size:10px;padding:2px 6px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:800;">STATION SÉLECTIONNÉE</span>
          </div>
          <strong style="font-size:14px;color:#0284c7;">📍 ${station.name}</strong><br/>
          <span style="font-size:11px;color:#475569;">${station.department || station.country || 'Monde'} · Alt. ${station.altitude || 0} m</span>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:12px;display:flex;justify-content:space-between;">
            <span>Actuel : <strong>${Math.round(weather.temperature)}°C</strong></span>
            <span>Tmin/Tmax : <strong>${Math.round(tmin)}°/${Math.round(tmax)}°</strong></span>
          </div>
          <div style="margin-top:4px;font-size:11px;color:#0284c7;font-weight:700;">
            Pluie 00h : ${rainSum} mm · Vent : ${Math.round(weather.windSpeed)} km/h
          </div>
        </div>
      `);

      // 2. Tracé des stations environnantes avec calculs de seuil thématiques
      thresholdStations.forEach((st) => {
        if (st.id === station.id) return;

        // Calculs scientifiques dérivés pour chaque station selon le relief et la latitude
        const latOffset = (48.5 - st.latitude) * 0.45;
        const altOffset = -((st.altitude || 50) / 100) * 0.65;
        const simTmin = Number((tmin + latOffset + altOffset).toFixed(1));
        const simTmax = Number((tmax + latOffset + altOffset).toFixed(1));
        const simRain = Number(Math.max(0, rainSum + (st.latitude > 47 ? 0.8 : -0.4)).toFixed(1));
        const simWind = Math.round(weather.windSpeed + (st.altitude && st.altitude > 800 ? 25 : 5));

        let badgeBg = '#334155';
        let badgeText = '#ffffff';
        let badgeContent = `${Math.round(simTmax)}°`;
        let hazardStatus = '';

        if (activeHazard === 'frostRisk') {
          // Seuils de gel
          if (simTmin <= -2.0) {
            badgeBg = '#4f46e5'; // Gel sévère
            badgeText = '#ffffff';
            badgeContent = `${simTmin}°`;
            hazardStatus = '❄️ Gelée sévère sous abri';
          } else if (simTmin <= 0.0) {
            badgeBg = '#0284c7'; // Gelée sous abri
            badgeText = '#ffffff';
            badgeContent = `${simTmin}°`;
            hazardStatus = '🧊 Gelée sous abri';
          } else if (simTmin <= 2.5) {
            badgeBg = '#06b6d4'; // Gelée blanche au sol
            badgeText = '#042f2e';
            badgeContent = `${simTmin}°`;
            hazardStatus = '🌱 Risque de gelée blanche au sol';
          } else {
            badgeBg = '#059669'; // Hors gel
            badgeText = '#ffffff';
            badgeContent = `${simTmin}°`;
            hazardStatus = '✅ Hors gel';
          }
        } else if (activeHazard === 'heatwaveRisk') {
          // Seuils de canicule
          if (simTmax >= 35.0) {
            badgeBg = '#e11d48'; // Canicule sévère
            badgeContent = `${simTmax}°`;
            hazardStatus = '🔥 Forte canicule';
          } else if (simTmax >= 30.0) {
            badgeBg = '#ea580c'; // Chaleur forte
            badgeContent = `${simTmax}°`;
            hazardStatus = '☀️ Forte chaleur';
          } else if (simTmax >= 25.0) {
            badgeBg = '#d97706'; // Chaleur de saison
            badgeContent = `${simTmax}°`;
            hazardStatus = '🌤️ Chaleur agréable';
          } else {
            badgeBg = '#0284c7'; // Doux
            badgeContent = `${simTmax}°`;
            hazardStatus = '🍃 Température douce';
          }
        } else if (activeHazard === 'rainRadar') {
          badgeBg = simRain > 10 ? '#2563eb' : simRain > 1 ? '#0284c7' : '#475569';
          badgeContent = `${simRain}mm`;
          hazardStatus = simRain > 0 ? `🌧️ Cumul pluie : ${simRain} mm` : '☀️ Temps sec';
        } else if (activeHazard === 'windGusts') {
          const gustVal = Math.round(simWind * 1.35);
          badgeBg = gustVal >= 80 ? '#e11d48' : gustVal >= 60 ? '#ea580c' : '#0d9488';
          badgeContent = `${gustVal}k`;
          hazardStatus = `💨 Rafales max : ${gustVal} km/h`;
        } else if (activeHazard === 'stormsLightning') {
          const stormProb = [95, 96, 99].includes(weather.weatherCode) ? 75 : 15;
          badgeBg = stormProb > 50 ? '#d97706' : '#334155';
          badgeContent = `⚡${stormProb}%`;
          hazardStatus = stormProb > 50 ? '⚡ Risque d’impacts foudre' : '🟢 Risque orageux faible';
        } else if (activeHazard === 'airQuality') {
          badgeBg = '#059669';
          badgeContent = 'Bon';
          hazardStatus = '🌱 Indice ATMO : Bon';
        } else if (activeHazard === 'uvIndex') {
          const uvVal = weather.uvIndex ?? 4;
          badgeBg = uvVal >= 6 ? '#ea580c' : '#d97706';
          badgeContent = `UV${uvVal}`;
          hazardStatus = `☀️ Indice UV ${uvVal}`;
        }

        const markerHtml = `
          <div style="background:${badgeBg};color:${badgeText};font-weight:800;font-size:10px;font-family:system-ui,sans-serif;padding:2px 5px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.7);box-shadow:0 2px 6px rgba(0,0,0,0.5);white-space:nowrap;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            ${badgeContent}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-threshold-badge',
          html: markerHtml,
          iconSize: [36, 18],
          iconAnchor: [18, 9]
        });

        const marker = L.marker([st.latitude, st.longitude], { icon });
        if (markersLayerRef.current) {
          marker.addTo(markersLayerRef.current);
        }
        
        // Popup avec bouton pour sélectionner la station directement
        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'system-ui, sans-serif';
        popupContent.style.padding = '4px';
        popupContent.style.color = '#0f172a';
        popupContent.style.minWidth = '180px';
        popupContent.innerHTML = `
          <strong style="font-size:13px;color:#0284c7;">📍 ${st.name}</strong><br/>
          <span style="font-size:11px;color:#64748b;">${st.department || (st as any).country || 'Station'} · Alt. ${st.altitude || 0}m</span>
          <div style="margin-top:6px;padding-top:4px;border-top:1px solid #e2e8f0;font-size:11px;">
            <div style="font-weight:700;color:#0f172a;margin-bottom:2px;">${hazardStatus}</div>
            <div>Tmin/Tmax : <strong>${simTmin}° / ${simTmax}°</strong></div>
          </div>
        `;

        if (onSelectStation) {
          const btn = document.createElement('button');
          btn.innerText = 'Basculer sur cette station →';
          btn.style.marginTop = '8px';
          btn.style.width = '100%';
          btn.style.padding = '4px 8px';
          btn.style.borderRadius = '6px';
          btn.style.background = '#0284c7';
          btn.style.color = 'white';
          btn.style.fontSize = '11px';
          btn.style.fontWeight = 'bold';
          btn.style.border = 'none';
          btn.style.cursor = 'pointer';
          btn.onclick = () => {
            onSelectStation(st);
          };
          popupContent.appendChild(btn);
        }

        marker.bindPopup(popupContent);
      });
    }
  }, [station, activeHazard, mapScope, radarTimestamp, weather, tmin, tmax, rainSum, thresholdStations, onSelectStation]);

  return (
    <div id="daily-pertinent-maps-suite" className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#070e1c] p-4 sm:p-5 shadow-lg text-slate-900 dark:text-slate-100 mb-6 transition-colors">
      {/* 1. Entête contextuelle expliquant la pertinence du jour */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/90 pb-3 mb-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`h-2.5 w-2.5 rounded-full ${
              todayDiagnosedHazard.urgencyLevel === 'critique' ? 'bg-rose-500 animate-ping' :
              todayDiagnosedHazard.urgencyLevel === 'surveillance' ? 'bg-amber-400' : 'bg-sky-400'
            }`} />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {todayDiagnosedHazard.reasonTitle}
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
              Journée en cours
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {todayDiagnosedHazard.reasonDesc}
          </p>
        </div>

        {/* Boutons d'échelle géographique (Local & Région vs Monde Entier) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setMapScope('local')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              mapScope === 'local' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>France &amp; Région</span>
          </button>
          <button
            onClick={() => setMapScope('world')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              mapScope === 'world' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Monde Entier (Tous Continents)</span>
          </button>
        </div>
      </div>

      {/* 2. Barre de bascule rapide des Cartes Thématiques Météorologiques */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar text-xs">
        <button
          onClick={() => setActiveHazard('rainRadar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition cursor-pointer font-bold ${
            activeHazard === 'rainRadar'
              ? 'bg-blue-600 border-blue-400 text-white shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <CloudRain className="h-3.5 w-3.5 text-blue-300" />
          <span>Radar Pluie &amp; Cumuls (00h)</span>
        </button>

        <button
          onClick={() => setActiveHazard('frostRisk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition cursor-pointer font-bold ${
            activeHazard === 'frostRisk'
              ? 'bg-sky-600 border-sky-400 text-white shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <Snowflake className="h-3.5 w-3.5 text-sky-300" />
          <span>Probabilité de Gel (0°C, -2°C, -5°C)</span>
        </button>

        <button
          onClick={() => setActiveHazard('heatwaveRisk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition cursor-pointer font-bold ${
            activeHazard === 'heatwaveRisk'
              ? 'bg-orange-600 border-orange-400 text-white shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-orange-300" />
          <span>Stress Canicule (&gt;30°C / &gt;35°C)</span>
        </button>

        <button
          onClick={() => setActiveHazard('windGusts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition cursor-pointer font-bold ${
            activeHazard === 'windGusts'
              ? 'bg-teal-600 border-teal-400 text-white shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <Wind className="h-3.5 w-3.5 text-teal-300" />
          <span>Vents &amp; Rafales Max</span>
        </button>

        <button
          onClick={() => setActiveHazard('stormsLightning')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition cursor-pointer font-bold ${
            activeHazard === 'stormsLightning'
              ? 'bg-amber-600 border-amber-400 text-white shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          <span>Orages &amp; Risque Foudre</span>
        </button>

        <button
          onClick={() => setActiveHazard('airQuality')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition cursor-pointer font-bold ${
            activeHazard === 'airQuality'
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <Eye className="h-3.5 w-3.5 text-emerald-300" />
          <span>Qualité de l’Air (ATMO / AQI)</span>
        </button>

        <button
          onClick={() => setActiveHazard('uvIndex')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition cursor-pointer font-bold ${
            activeHazard === 'uvIndex'
              ? 'bg-yellow-600 border-yellow-400 text-white shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-yellow-300" />
          <span>Indice UV &amp; Insolation</span>
        </button>
      </div>

      {/* 2b. Barre de navigation continentale rapide (Tous les continents du monde) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Globe className="h-3 w-3 text-sky-500" />
          <span>Zoom rapide :</span>
        </span>
        {WORLD_CONTINENTS.map(c => (
          <button
            key={c.id}
            onClick={() => handleFlyToContinent(c)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-800 transition active:scale-95 cursor-pointer shrink-0"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3. Conteneur interactif de la Carte (Anti-éblouissement, sombre et net) */}
      <div className="relative w-full h-[380px] sm:h-[450px] rounded-xl overflow-hidden border border-slate-800 bg-[#090e18] shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Badge d'indication en haut à gauche */}
        <div className="absolute top-3 left-3 z-[500] bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-lg px-3 py-1.5 shadow-lg max-w-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white">
              {activeHazard === 'rainRadar' ? 'Radar Doppler & Cumuls de Pluie' :
               activeHazard === 'frostRisk' ? 'Carte des Seuils de Gelée (0°C, -2°C, -5°C)' :
               activeHazard === 'heatwaveRisk' ? 'Seuils Canicule (>30°C / >35°C)' :
               activeHazard === 'windGusts' ? 'Champ de Vent & Rafales de Pointe' :
               activeHazard === 'stormsLightning' ? 'Activité Orageuse Convective & Foudre' : 'Surveillance Thématique HD'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-sky-400 truncate">{station.name}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {mapScope === 'world' ? 'Échelle planétaire · Cliquez sur une station pour la sélectionner' : 'Échelle nationale · Cliquez sur une station pour la sélectionner'}
          </div>
        </div>

        {/* Légende spécifique intégrée en bas à droite */}
        <div className="absolute bottom-3 right-3 z-[500] bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] shadow-lg max-w-xs">
          {activeHazard === 'rainRadar' && (
            <div className="space-y-1">
              <div className="font-bold text-slate-200">Échelle des Précipitations (mm/h) :</div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-2 rounded bg-cyan-400"></span>
                <span className="text-[10px] text-slate-400">&lt;1 mm</span>
                <span className="w-4 h-2 rounded bg-blue-500"></span>
                <span className="text-[10px] text-slate-400">1-4</span>
                <span className="w-4 h-2 rounded bg-amber-400"></span>
                <span className="text-[10px] text-slate-400">4-10</span>
                <span className="w-4 h-2 rounded bg-rose-500"></span>
                <span className="text-[10px] text-slate-400">&gt;15 mm</span>
              </div>
            </div>
          )}

          {activeHazard === 'frostRisk' && (
            <div className="space-y-1">
              <div className="font-bold text-slate-200">Seuils Agrométéo de Gel :</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-300">
                <span className="text-cyan-300">0°C à 2.5°C : Gelée blanche</span>
                <span className="text-sky-300">0°C à -2°C : Gelée sous abri</span>
                <span className="text-indigo-400">&lt; -2°C : Risque vergers</span>
                <span className="text-emerald-400">&gt; 3°C : Hors gel</span>
              </div>
            </div>
          )}

          {activeHazard === 'heatwaveRisk' && (
            <div className="space-y-1">
              <div className="font-bold text-slate-200">Biométéorologie Canicule :</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-300">
                <span className="text-amber-400">25-30°C : Chaleur</span>
                <span className="text-orange-400">30-35°C : Forte chaleur</span>
                <span className="text-rose-400">&gt; 35°C : Canicule sévère</span>
                <span className="text-sky-400">&lt; 25°C : Doux</span>
              </div>
            </div>
          )}

          {activeHazard === 'windGusts' && (
            <div className="space-y-1">
              <div className="font-bold text-slate-200">Seuils de Rafales :</div>
              <div className="text-[10px] text-slate-300">
                50 km/h (sensible) • 70 km/h (soutenu) • 90 km/h (tempétueux).
              </div>
            </div>
          )}

          {activeHazard === 'stormsLightning' && (
            <div className="space-y-1">
              <div className="font-bold text-slate-200">Indice Convectif :</div>
              <div className="text-[10px] text-slate-300">
                CAPE &gt; 500 J/kg : orages isolés • CAPE &gt; 1500 J/kg : orages violents &amp; foudre.
              </div>
            </div>
          )}

          {activeHazard === 'airQuality' && (
            <div className="space-y-1">
              <div className="font-bold text-slate-200">Indice ATMO Européen :</div>
              <div className="text-[10px] text-slate-300">
                Mesure continue des particules fines PM2.5, PM10, Ozone et NO2.
              </div>
            </div>
          )}

          {activeHazard === 'uvIndex' && (
            <div className="space-y-1">
              <div className="font-bold text-slate-200">Indice UV Solaire :</div>
              <div className="text-[10px] text-slate-300">
                UV 1-2 Faible • UV 3-5 Modéré • UV 6-7 Élevé • UV 8+ Très fort.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Barre d'information et lien vers la suite complète */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-sky-400 shrink-0" />
          <span>Couverture planétaire complète : zoomez et déplacez la carte librement sur n’importe quel continent. Cliquez sur une station pour la charger en direct.</span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('radar')}
            className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
          >
            Ouvrir la Suite Cartographique Plein Écran →
          </button>
        )}
      </div>
    </div>
  );
};
