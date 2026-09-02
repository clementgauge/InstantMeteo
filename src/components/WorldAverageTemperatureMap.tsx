import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe2, Search, Info, Thermometer, ShieldAlert, ArrowLeft } from 'lucide-react';

export interface CountryTemperatureData {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  lat: number;
  lon: number;
  avgTempC: number;
  minRecordC: number;
  maxRecordC: number;
  climateType: string;
  capital: string;
  continent: string;
}

export const WORLD_COUNTRIES_TEMPERATURES: CountryTemperatureData[] = [
  // Europe
  { id: 'fra', name: 'France', nativeName: 'France', flag: '🇫🇷', lat: 46.6033, lon: 1.8883, avgTempC: 11.5, minRecordC: -36.7, maxRecordC: 46.0, climateType: 'Tempéré océanique & semi-continental', capital: 'Paris', continent: 'Europe' },
  { id: 'esp', name: 'Espagne', nativeName: 'España', flag: '🇪🇸', lat: 40.4637, lon: -3.7492, avgTempC: 13.3, minRecordC: -32.0, maxRecordC: 47.6, climateType: 'Méditerranéen & semi-aride', capital: 'Madrid', continent: 'Europe' },
  { id: 'ita', name: 'Italie', nativeName: 'Italia', flag: '🇮🇹', lat: 41.8719, lon: 12.5674, avgTempC: 13.4, minRecordC: -29.0, maxRecordC: 48.8, climateType: 'Méditerranéen & alpin', capital: 'Rome', continent: 'Europe' },
  { id: 'deu', name: 'Allemagne', nativeName: 'Deutschland', flag: '🇩🇪', lat: 51.1657, lon: 10.4515, avgTempC: 8.5, minRecordC: -37.8, maxRecordC: 41.2, climateType: 'Tempéré semi-continental', capital: 'Berlin', continent: 'Europe' },
  { id: 'gbr', name: 'Royaume-Uni', nativeName: 'United Kingdom', flag: '🇬🇧', lat: 55.3781, lon: -3.4360, avgTempC: 8.5, minRecordC: -27.2, maxRecordC: 40.3, climateType: 'Océanique humide tempéré', capital: 'Londres', continent: 'Europe' },
  { id: 'nor', name: 'Norvège', nativeName: 'Norge', flag: '🇳🇴', lat: 60.4720, lon: 8.4689, avgTempC: 1.5, minRecordC: -51.4, maxRecordC: 35.6, climateType: 'Subarctique & océanique froid', capital: 'Oslo', continent: 'Europe' },
  { id: 'swe', name: 'Suède', nativeName: 'Sverige', flag: '🇸🇪', lat: 60.1282, lon: 18.6435, avgTempC: 2.1, minRecordC: -52.6, maxRecordC: 38.0, climateType: 'Boréal & subarctique', capital: 'Stockholm', continent: 'Europe' },
  { id: 'fin', name: 'Finlande', nativeName: 'Suomi', flag: '🇫🇮', lat: 61.9241, lon: 25.7482, avgTempC: 1.7, minRecordC: -51.5, maxRecordC: 37.2, climateType: 'Boréal subarctique continental', capital: 'Helsinki', continent: 'Europe' },
  { id: 'isl', name: 'Islande', nativeName: 'Ísland', flag: '🇮🇸', lat: 64.9631, lon: -19.0208, avgTempC: 1.7, minRecordC: -37.9, maxRecordC: 30.5, climateType: 'Subpolaire océanique froid', capital: 'Reykjavik', continent: 'Europe' },
  { id: 'che', name: 'Suisse', nativeName: 'Schweiz', flag: '🇨🇭', lat: 46.8182, lon: 8.2275, avgTempC: 5.5, minRecordC: -41.8, maxRecordC: 41.5, climateType: 'Alpin de haute montagne & tempéré', capital: 'Berne', continent: 'Europe' },
  { id: 'grc', name: 'Grèce', nativeName: 'Ελλάδα', flag: '🇬🇷', lat: 39.0742, lon: 21.8243, avgTempC: 15.4, minRecordC: -27.8, maxRecordC: 48.0, climateType: 'Méditerranéen chaud', capital: 'Athènes', continent: 'Europe' },
  { id: 'prt', name: 'Portugal', nativeName: 'Portugal', flag: '🇵🇹', lat: 39.3999, lon: -8.2245, avgTempC: 15.2, minRecordC: -16.0, maxRecordC: 47.3, climateType: 'Méditerranéen atlantique', capital: 'Lisbonne', continent: 'Europe' },
  { id: 'pol', name: 'Pologne', nativeName: 'Polska', flag: '🇵🇱', lat: 51.9194, lon: 19.1451, avgTempC: 7.9, minRecordC: -41.0, maxRecordC: 40.2, climateType: 'Continental modéré', capital: 'Varsovie', continent: 'Europe' },
  { id: 'ukr', name: 'Ukraine', nativeName: 'Україна', flag: '🇺🇦', lat: 48.3794, lon: 31.1656, avgTempC: 8.3, minRecordC: -42.0, maxRecordC: 42.0, climateType: 'Continental tempéré', capital: 'Kyiv', continent: 'Europe' },

  // Amériques
  { id: 'can', name: 'Canada', nativeName: 'Canada', flag: '🇨🇦', lat: 56.1304, lon: -106.3468, avgTempC: -5.3, minRecordC: -63.0, maxRecordC: 49.6, climateType: 'Subarctique, boréal & continental froid', capital: 'Ottawa', continent: 'Amérique du Nord' },
  { id: 'usa', name: 'États-Unis', nativeName: 'United States', flag: '🇺🇸', lat: 37.0902, lon: -95.7129, avgTempC: 8.5, minRecordC: -62.2, maxRecordC: 54.4, climateType: 'Continental, subtropical & aride', capital: 'Washington D.C.', continent: 'Amérique du Nord' },
  { id: 'grl', name: 'Groenland', nativeName: 'Kalaallit Nunaat', flag: '🇬🇱', lat: 71.7069, lon: -42.6043, avgTempC: -18.6, minRecordC: -69.6, maxRecordC: 25.9, climateType: 'Polaire inlandsis & toundra', capital: 'Nuuk', continent: 'Amérique du Nord' },
  { id: 'mex', name: 'Mexique', nativeName: 'México', flag: '🇲🇽', lat: 23.6345, lon: -102.5528, avgTempC: 21.0, minRecordC: -29.0, maxRecordC: 52.0, climateType: 'Aride, semi-aride & tropical', capital: 'Mexico', continent: 'Amérique du Nord' },
  { id: 'bra', name: 'Brésil', nativeName: 'Brasil', flag: '🇧🇷', lat: -14.2350, lon: -51.9253, avgTempC: 25.0, minRecordC: -14.0, maxRecordC: 44.8, climateType: 'Équatorial amazonien & tropical humide', capital: 'Brasília', continent: 'Amérique du Sud' },
  { id: 'arg', name: 'Argentine', nativeName: 'Argentina', flag: '🇦🇷', lat: -38.4161, lon: -63.6167, avgTempC: 14.8, minRecordC: -32.8, maxRecordC: 48.9, climateType: 'Tempéré pampéen & patagonien aride', capital: 'Buenos Aires', continent: 'Amérique du Sud' },
  { id: 'chl', name: 'Chili', nativeName: 'Chile', flag: '🇨🇱', lat: -35.6751, lon: -71.5430, avgTempC: 8.4, minRecordC: -28.5, maxRecordC: 42.2, climateType: 'Méditerranéen, désertique & subpolaire', capital: 'Santiago', continent: 'Amérique du Sud' },
  { id: 'col', name: 'Colombie', nativeName: 'Colombia', flag: '🇨🇴', lat: 4.5709, lon: -74.2973, avgTempC: 24.0, minRecordC: -11.0, maxRecordC: 45.0, climateType: 'Équatorial & étages andins', capital: 'Bogota', continent: 'Amérique du Sud' },

  // Asie & Russie
  { id: 'rus', name: 'Russie', nativeName: 'Россия', flag: '🇷🇺', lat: 61.5240, lon: 105.3188, avgTempC: -5.1, minRecordC: -67.8, maxRecordC: 45.4, climateType: 'Subarctique sibérien & boréal', capital: 'Moscou', continent: 'Asie' },
  { id: 'chn', name: 'Chine', nativeName: '中国', flag: '🇨🇳', lat: 35.8617, lon: 104.1954, avgTempC: 8.1, minRecordC: -53.0, maxRecordC: 52.2, climateType: 'Continental froid, subtropical & désertique', capital: 'Pékin', continent: 'Asie' },
  { id: 'ind', name: 'Inde', nativeName: 'भारत', flag: '🇮🇳', lat: 20.5937, lon: 78.9629, avgTempC: 24.0, minRecordC: -45.0, maxRecordC: 51.0, climateType: 'Tropical de mousson & aride', capital: 'New Delhi', continent: 'Asie' },
  { id: 'jpn', name: 'Japon', nativeName: '日本', flag: '🇯🇵', lat: 36.2048, lon: 138.2529, avgTempC: 11.2, minRecordC: -41.0, maxRecordC: 41.1, climateType: 'Tempéré insulaire & subtropical humide', capital: 'Tokyo', continent: 'Asie' },
  { id: 'mng', name: 'Mongolie', nativeName: 'Монгол', flag: '🇲🇳', lat: 46.8625, lon: 103.8467, avgTempC: -0.7, minRecordC: -55.3, maxRecordC: 44.0, climateType: 'Hyper-continental froid de steppe', capital: 'Oulan-Bator', continent: 'Asie' },
  { id: 'sau', name: 'Arabie Saoudite', nativeName: 'المملكة العربية السعودية', flag: '🇸🇦', lat: 23.8859, lon: 45.0792, avgTempC: 24.6, minRecordC: -12.0, maxRecordC: 53.0, climateType: 'Désertique hyper-aride chaud', capital: 'Riyad', continent: 'Asie' },
  { id: 'are', name: 'Émirats Arabes Unis', nativeName: 'الإمارات', flag: '🇦🇪', lat: 23.4241, lon: 53.8478, avgTempC: 27.0, minRecordC: -1.5, maxRecordC: 52.1, climateType: 'Désertique subtropical', capital: 'Abou Dabi', continent: 'Asie' },
  { id: 'tha', name: 'Thaïlande', nativeName: 'ประเทศไทย', flag: '🇹🇭', lat: 15.8700, lon: 100.9925, avgTempC: 26.3, minRecordC: -1.4, maxRecordC: 44.6, climateType: 'Tropical de savane & mousson', capital: 'Bangkok', continent: 'Asie' },
  { id: 'idn', name: 'Indonésie', nativeName: 'Indonesia', flag: '🇮🇩', lat: -0.7893, lon: 113.9213, avgTempC: 25.8, minRecordC: -4.0, maxRecordC: 40.1, climateType: 'Équatorial hyper-humide', capital: 'Jakarta', continent: 'Asie' },

  // Afrique
  { id: 'mli', name: 'Mali', nativeName: 'Mali', flag: '🇲🇱', lat: 17.5707, lon: -3.9962, avgTempC: 28.8, minRecordC: 3.0, maxRecordC: 48.5, climateType: 'Sahélien & désertique saharien (pays le plus chaud)', capital: 'Bamako', continent: 'Afrique' },
  { id: 'ner', name: 'Niger', nativeName: 'Niger', flag: '🇳🇪', lat: 17.6078, lon: 8.0817, avgTempC: 28.3, minRecordC: 2.0, maxRecordC: 49.5, climateType: 'Hyper-aride saharien & sahélien', capital: 'Niamey', continent: 'Afrique' },
  { id: 'tcd', name: 'Tchad', nativeName: 'Tchad', flag: '🇹🇩', lat: 15.4542, lon: 18.7322, avgTempC: 28.2, minRecordC: 4.5, maxRecordC: 47.6, climateType: 'Saharien & tropical sec', capital: "N'Djamena", continent: 'Afrique' },
  { id: 'dji', name: 'Djibouti', nativeName: 'Djibouti', flag: '🇩🇯', lat: 11.8251, lon: 42.5903, avgTempC: 29.8, minRecordC: 15.0, maxRecordC: 49.0, climateType: 'Aride côtier hyper-chaud', capital: 'Djibouti', continent: 'Afrique' },
  { id: 'sdn', name: 'Soudan', nativeName: 'السودان', flag: '🇸🇩', lat: 12.8628, lon: 30.2176, avgTempC: 26.8, minRecordC: 1.0, maxRecordC: 49.7, climateType: 'Désertique chaud', capital: 'Khartoum', continent: 'Afrique' },
  { id: 'mar', name: 'Maroc', nativeName: 'المغرب', flag: '🇲🇦', lat: 31.7917, lon: -7.0926, avgTempC: 17.5, minRecordC: -23.9, maxRecordC: 50.4, climateType: 'Méditerranéen & atlasique / saharien', capital: 'Rabat', continent: 'Afrique' },
  { id: 'dza', name: 'Algérie', nativeName: 'الجزائر', flag: '🇩🇿', lat: 28.0339, lon: 1.6596, avgTempC: 22.5, minRecordC: -13.0, maxRecordC: 51.3, climateType: 'Méditerranéen au nord, saharien au sud', capital: 'Alger', continent: 'Afrique' },
  { id: 'egy', name: 'Égypte', nativeName: 'مصر', flag: '🇪🇬', lat: 26.8206, lon: 30.8025, avgTempC: 22.1, minRecordC: -2.0, maxRecordC: 51.0, climateType: 'Désertique aride chaud', capital: 'Le Caire', continent: 'Afrique' },
  { id: 'sen', name: 'Sénégal', nativeName: 'Sénégal', flag: '🇸🇳', lat: 14.4974, lon: -14.4524, avgTempC: 28.0, minRecordC: 7.0, maxRecordC: 48.8, climateType: 'Sahélien & soudanien', capital: 'Dakar', continent: 'Afrique' },
  { id: 'zaf', name: 'Afrique du Sud', nativeName: 'South Africa', flag: '🇿🇦', lat: -30.5595, lon: 22.9375, avgTempC: 17.5, minRecordC: -20.1, maxRecordC: 50.0, climateType: 'Subtropical, méditerranéen & semi-aride', capital: 'Pretoria', continent: 'Afrique' },
  { id: 'mdg', name: 'Madagascar', nativeName: 'Madagasikara', flag: '🇲🇬', lat: -18.7669, lon: 46.8691, avgTempC: 22.6, minRecordC: -1.0, maxRecordC: 40.5, climateType: 'Tropical humide à l\'est, sec à l\'ouest', capital: 'Antananarivo', continent: 'Afrique' },

  // Océanie
  { id: 'aus', name: 'Australie', nativeName: 'Australia', flag: '🇦🇺', lat: -25.2744, lon: 133.7751, avgTempC: 21.6, minRecordC: -23.0, maxRecordC: 50.7, climateType: 'Désertique outback & subtropical', capital: 'Canberra', continent: 'Océanie' },
  { id: 'nzl', name: 'Nouvelle-Zélande', nativeName: 'New Zealand', flag: '🇳🇿', lat: -40.9006, lon: 174.8860, avgTempC: 10.5, minRecordC: -25.6, maxRecordC: 42.4, climateType: 'Océanique tempéré maritime', capital: 'Wellington', continent: 'Océanie' }
];

export function getTemperatureColor(tempC: number): { bg: string; border: string; text: string; label: string } {
  if (tempC < -10) return { bg: '#312e81', border: '#4338ca', text: '#ffffff', label: 'Glacial (< -10°C)' };
  if (tempC < -2) return { bg: '#1e3a8a', border: '#2563eb', text: '#ffffff', label: 'Très Froid (-10 à -2°C)' };
  if (tempC < 5) return { bg: '#0284c7', border: '#38bdf8', text: '#ffffff', label: 'Froid (0 à 5°C)' };
  if (tempC < 10) return { bg: '#0d9488', border: '#2dd4bf', text: '#ffffff', label: 'Frais (5 à 10°C)' };
  if (tempC < 15) return { bg: '#16a34a', border: '#4ade80', text: '#ffffff', label: 'Tempéré (10 à 15°C)' };
  if (tempC < 20) return { bg: '#d97706', border: '#fbbf24', text: '#000000', label: 'Doux (15 à 20°C)' };
  if (tempC < 25) return { bg: '#ea580c', border: '#fb923c', text: '#ffffff', label: 'Chaud (20 à 25°C)' };
  return { bg: '#dc2626', border: '#f87171', text: '#ffffff', label: 'Très Chaud (> 25°C)' };
}

interface WorldAverageTemperatureMapProps {
  onBackToRadar?: () => void;
  seniorMode?: boolean;
}

export const WorldAverageTemperatureMap: React.FC<WorldAverageTemperatureMapProps> = ({
  onBackToRadar,
  seniorMode = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryTemperatureData | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');

  // 1. Initialize Map with pure OpenStreetMap basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 10],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    // PURE OpenStreetMap Basemap Layer (as requested)
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    osm.on('tileerror', () => {});
    osm.addTo(map);

    const markersGroup = L.layerGroup();
    markersGroup.addTo(map);
    markersGroupRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Country Markers on pure OpenStreetMap
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const filtered = WORLD_COUNTRIES_TEMPERATURES.filter(c => {
      const matchSearch = searchQuery.trim() === '' || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.capital.toLowerCase().includes(searchQuery.toLowerCase());
      const matchContinent = selectedContinent === 'ALL' || c.continent === selectedContinent;
      return matchSearch && matchContinent;
    });

    filtered.forEach(country => {
      const color = getTemperatureColor(country.avgTempC);

      const markerHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          background: ${color.bg};
          border: 2px solid ${color.border};
          border-radius: 9999px;
          padding: 2px 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          cursor: pointer;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease;
        ">
          <span style="font-size: 14px;">${country.flag}</span>
          <span style="font-size: 11px; font-weight: 900; color: ${color.text}; font-family: system-ui, sans-serif;">
            ${country.avgTempC > 0 ? `+${country.avgTempC.toFixed(1)}` : country.avgTempC.toFixed(1)}°
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-world-temp-marker',
        html: markerHtml,
        iconSize: [60, 26],
        iconAnchor: [30, 13]
      });

      const marker = L.marker([country.lat, country.lon], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif; color: #0f172a;">
          <div style="display: flex; items-center; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="font-weight: 900; font-size: 14px;">${country.flag} ${country.name}</div>
            <span style="font-size: 9px; font-weight: 800; background: ${color.bg}; color: ${color.text}; padding: 2px 6px; border-radius: 6px;">
              ${country.continent}
            </span>
          </div>
          <div style="font-size: 20px; font-weight: 900; color: ${color.bg}; margin-bottom: 4px;">
            Moyenne : ${country.avgTempC > 0 ? `+${country.avgTempC}` : country.avgTempC}°C
            <span style="font-size: 11px; font-weight: normal; color: #64748b;">(${((country.avgTempC * 9/5) + 32).toFixed(1)}°F)</span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
            🏛️ <strong>Capitale :</strong> ${country.capital}<br/>
            🌍 <strong>Climat :</strong> ${country.climateType}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div>❄️ Record Froid : <strong style="color: #2563eb;">${country.minRecordC}°C</strong></div>
            <div>🔥 Record Chaud : <strong style="color: #dc2626;">${country.maxRecordC}°C</strong></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedCountry(country);
      });

      marker.addTo(group);
    });
  }, [searchQuery, selectedContinent]);

  const handleSelectCountry = (country: CountryTemperatureData) => {
    setSelectedCountry(country);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([country.lat, country.lon], 5, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/70 to-slate-900 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToRadar && (
              <button
                onClick={onBackToRadar}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour Radar</span>
              </button>
            )}
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Carte des Températures Moyennes par Pays du Monde
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
                  OpenStreetMap
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cartographie climatique mondiale des normales thermiques annuelles moyennes, records historiques et classifications biométriques.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un pays, capitale..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 pl-9 pr-3.5 py-2 text-xs font-semibold text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Continent Filter Badges */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Continents :</span>
          {['ALL', 'Europe', 'Amérique du Nord', 'Amérique du Sud', 'Asie', 'Afrique', 'Océanie'].map(cont => (
            <button
              key={cont}
              onClick={() => setSelectedContinent(cont)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedContinent === cont
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cont === 'ALL' ? 'Tous les pays' : cont}
            </button>
          ))}
        </div>
      </div>

      {/* Map Display */}
      <div className="relative rounded-3xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[520px] sm:h-[600px] z-0"
        />

        {/* Bottom Color Scale Legend */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-950/95 border border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Échelle des Températures Moyennes Annuelles Mondiales :</span>
            <span className="text-blue-300">Fond cartographique libre OpenStreetMap</span>
          </div>

          <div className="grid grid-cols-8 gap-1 text-center font-black text-[9px] sm:text-[10px] text-white">
            <div className="bg-[#312e81] py-1 px-0.5 rounded border border-[#4338ca]">
              &lt; -10°C
            </div>
            <div className="bg-[#1e3a8a] py-1 px-0.5 rounded border border-[#2563eb]">
              -10 à -2°C
            </div>
            <div className="bg-[#0284c7] py-1 px-0.5 rounded border border-[#38bdf8]">
              0 à 5°C
            </div>
            <div className="bg-[#0d9488] py-1 px-0.5 rounded border border-[#2dd4bf]">
              5 à 10°C
            </div>
            <div className="bg-[#16a34a] py-1 px-0.5 rounded border border-[#4ade80]">
              10 à 15°C
            </div>
            <div className="bg-[#d97706] text-slate-950 py-1 px-0.5 rounded border border-[#fbbf24]">
              15 à 20°C
            </div>
            <div className="bg-[#ea580c] py-1 px-0.5 rounded border border-[#fb923c]">
              20 à 25°C
            </div>
            <div className="bg-[#dc2626] py-1 px-0.5 rounded border border-[#f87171]">
              &gt; 25°C
            </div>
          </div>
        </div>

        {/* Selected Country Drawer Card */}
        {selectedCountry && (
          <div className="absolute top-3 left-3 z-[400] max-w-xs w-full bg-slate-950/95 border border-blue-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <div>
                  <h4 className="font-black text-sm text-white leading-tight">{selectedCountry.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedCountry.continent}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-400">Température Moyenne :</span>
                <span className="font-black text-amber-300 text-sm">
                  {selectedCountry.avgTempC > 0 ? `+${selectedCountry.avgTempC}` : selectedCountry.avgTempC}°C
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Capitale :</span>
                <span className="font-bold text-white">{selectedCountry.capital}</span>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Régime Climatique :</span>
                {selectedCountry.climateType}
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div className="bg-blue-950/60 border border-blue-900/60 p-1.5 rounded-lg">
                  <span className="text-blue-300 block font-semibold">❄️ Min absolu :</span>
                  <span className="font-black text-blue-200">{selectedCountry.minRecordC}°C</span>
                </div>
                <div className="bg-rose-950/60 border border-rose-900/60 p-1.5 rounded-lg">
                  <span className="text-rose-300 block font-semibold">🔥 Max absolu :</span>
                  <span className="font-black text-rose-200">{selectedCountry.maxRecordC}°C</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Selection Carousel */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-3 shadow-lg">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 block">
          Accès Rapide aux Nations Repères :
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {WORLD_COUNTRIES_TEMPERATURES.slice(0, 15).map(c => (
            <button
              key={c.id}
              onClick={() => handleSelectCountry(c)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-xs font-bold text-slate-200 shrink-0 transition cursor-pointer"
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
              <span className="text-cyan-300 font-mono text-[11px]">
                {c.avgTempC > 0 ? `+${c.avgTempC}` : c.avgTempC}°
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
