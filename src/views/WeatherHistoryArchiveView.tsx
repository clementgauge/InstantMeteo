import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Calendar, 
  Search, 
  Sun, 
  CloudRain, 
  Wind, 
  Snowflake, 
  Zap, 
  Thermometer, 
  Droplets, 
  Clock, 
  Bookmark, 
  Trash2, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Loader2,
  TrendingUp,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { getWeatherDescription } from '../services/openMeteoService';

interface WeatherHistoryArchiveViewProps {
  station: LocationPoint;
  weather?: CurrentWeather | null;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  onOpenSearchModal?: () => void;
  onBackToMain?: () => void;
}

export type WeatherMainCondition = 
  | 'SOLEIL' 
  | 'ECLAIRCIES' 
  | 'NUAGEUX' 
  | 'PLUIE' 
  | 'ORAGE' 
  | 'NEIGE' 
  | 'BROUILLARD'
  | 'VENT';

export interface StoredDailyWeatherLog {
  id: string;
  dateStr: string; // YYYY-MM-DD
  cityName: string;
  department: string;
  latitude: number;
  longitude: number;
  tempMax: number;
  tempMin: number;
  tempMean: number;
  precipitationMm: number;
  windSpeedMax: number;
  windGustsMax: number;
  weatherCode: number;
  weatherDesc: string;
  conditionType: WeatherMainCondition;
  userNotes?: string;
  timestampSaved: number;
}

export interface DayArchiveResult {
  dateStr: string;
  tempMax: number;
  tempMin: number;
  tempMean: number;
  precipitationMm: number;
  snowfallCm: number;
  windMaxKmH: number;
  windGustsMaxKmH: number;
  solarRadiationMj: number;
  weatherCode: number;
  weatherDesc: string;
  mainCondition: WeatherMainCondition;
  mainConditionLabel: string;
  mainConditionSummary: string;
  hourly: {
    time: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
  }[];
}

const LOCAL_STORAGE_KEY = 'instant_meteo_daily_weather_journal';

export const WeatherHistoryArchiveView: React.FC<WeatherHistoryArchiveViewProps> = ({
  station,
  weather,
  seniorMode = false,
  tempUnit = 'C',
  onOpenSearchModal,
  onBackToMain
}) => {
  // Date Picker state (defaults to yesterday)
  const defaultYesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(defaultYesterday);
  const [archiveResult, setArchiveResult] = useState<DayArchiveResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userJournalNote, setUserJournalNote] = useState<string>('');
  const [savedLogs, setSavedLogs] = useState<StoredDailyWeatherLog[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error loading weather journal:', e);
    }
    return [];
  });

  // Fetch Historical Weather for selected Date and Station via Open-Meteo Archive API
  const fetchHistoricalWeather = async (targetDate: string, targetStation: LocationPoint) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const lat = targetStation.latitude || 48.8566;
      const lon = targetStation.longitude || 2.3522;
      
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${targetDate}&end_date=${targetDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,rain_sum,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,shortwave_radiation_sum,weather_code&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok && !(res.status >= 200 && res.status < 400)) throw new Error(`Erreur API Archive Météo (${res.status})`);
      const data = await res.json();

      if (!data.daily || !data.daily.temperature_2m_max || data.daily.temperature_2m_max.length === 0) {
        throw new Error('Aucune archive météorologique disponible pour cette date précise.');
      }

      const d = data.daily;
      const h = data.hourly || { time: [], temperature_2m: [] };

      const hourlyList = (h.time || []).map((tStr: string, idx: number) => {
        const hourLabel = tStr.includes('T') ? tStr.split('T')[1].slice(0, 5) : `${idx}h`;
        return {
          time: hourLabel,
          temperature: Number((h.temperature_2m?.[idx] ?? 15).toFixed(1)),
          feelsLike: Number((h.apparent_temperature?.[idx] ?? h.temperature_2m?.[idx] ?? 15).toFixed(1)),
          humidity: Math.round(h.relative_humidity_2m?.[idx] ?? 65),
          precipitation: Number((h.precipitation?.[idx] ?? 0).toFixed(1)),
          windSpeed: Math.round(h.wind_speed_10m?.[idx] ?? 15),
          weatherCode: h.weather_code?.[idx] ?? 0
        };
      });

      const weatherCode = d.weather_code?.[0] ?? 0;
      const weatherDescObj = getWeatherDescription(weatherCode);
      const precipSum = Number((d.precipitation_sum?.[0] ?? 0).toFixed(1));
      const snowSum = Number((d.snowfall_sum?.[0] ?? 0).toFixed(1));
      const windGusts = Math.round(d.wind_gusts_10m_max?.[0] ?? 35);
      const tempMaxVal = Number((d.temperature_2m_max?.[0] ?? 20).toFixed(1));
      const tempMinVal = Number((d.temperature_2m_min?.[0] ?? 10).toFixed(1));

      // Determine main weather condition
      let mainCondition: WeatherMainCondition = 'SOLEIL';
      let mainConditionLabel = '☀️ Beau Temps & Grand Soleil';
      let mainConditionSummary = 'Journée lumineuse et très ensoleillée avec un ciel totalement dégagé.';

      if (weatherCode >= 95) {
        mainCondition = 'ORAGE';
        mainConditionLabel = '⛈️ Activité Orageuse & Électrique';
        mainConditionSummary = `Journée marquée par des orages, des rafales de vent (${windGusts} km/h) et des averses convectives.`;
      } else if (weatherCode >= 71 || snowSum > 0) {
        mainCondition = 'NEIGE';
        mainConditionLabel = '🌨️ Chutes de Neige & Froid Hivernal';
        mainConditionSummary = `Journée hivernale avec précipitations sous forme de neige (${snowSum} cm) et températures froides.`;
      } else if (weatherCode >= 51 || precipSum >= 1.0) {
        mainCondition = 'PLUIE';
        mainConditionLabel = '🌧️ Temps Pluvieux & Averses';
        mainConditionSummary = `Journée humide et arrosée avec un cumul de ${precipSum} mm mesuré sur l'ensemble des 24 heures.`;
      } else if (weatherCode === 45 || weatherCode === 48) {
        mainCondition = 'BROUILLARD';
        mainConditionLabel = '🌫️ Brumes & Brouillard Dense';
        mainConditionSummary = 'Journée marquée par des bancs de brouillard et une visibilité réduite.';
      } else if (weatherCode === 3) {
        mainCondition = 'NUAGEUX';
        mainConditionLabel = '☁️ Ciel Très Nuageux à Couvert';
        mainConditionSummary = 'Journée sans soleil dominant, ciel gris et compact avec peu d\'éclaircies.';
      } else if (weatherCode === 2) {
        mainCondition = 'ECLAIRCIES';
        mainConditionLabel = '🌤️ Belles Éclaircies & Passages Nuageux';
        mainConditionSummary = 'Temps agréable et lumineux avec alternance de soleil et de nuages inoffensifs.';
      } else {
        mainCondition = 'SOLEIL';
        mainConditionLabel = '☀️ Plein Soleil & Ciel Bleu';
        mainConditionSummary = `Excellentes conditions anticycloniques, ensoleillement continu et ciel pur (${tempMaxVal}°C au plus chaud).`;
      }

      const parsedResult: DayArchiveResult = {
        dateStr: targetDate,
        tempMax: tempMaxVal,
        tempMin: tempMinVal,
        tempMean: Number((d.temperature_2m_mean?.[0] ?? 15).toFixed(1)),
        precipitationMm: precipSum,
        snowfallCm: snowSum,
        windMaxKmH: Math.round(d.wind_speed_10m_max?.[0] ?? 20),
        windGustsMaxKmH: windGusts,
        solarRadiationMj: Number((d.shortwave_radiation_sum?.[0] ?? 15).toFixed(1)),
        weatherCode,
        weatherDesc: weatherDescObj.label,
        mainCondition,
        mainConditionLabel,
        mainConditionSummary,
        hourly: hourlyList
      };

      setArchiveResult(parsedResult);
    } catch (err: any) {
      console.warn('Historical archive fetch error:', err);
      setErrorMessage(err.message || 'Impossible de récupérer les archives pour cette date.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalWeather(selectedDate, station);
  }, [selectedDate, station.id]);

  // Auto-log or save day to personal local meteorological journal
  const handleSaveToLocalJournal = () => {
    if (!archiveResult) return;

    let conditionType: StoredDailyWeatherLog['conditionType'] = 'SOLEIL';
    if (archiveResult.weatherCode >= 95) conditionType = 'ORAGE';
    else if (archiveResult.weatherCode >= 71 || archiveResult.snowfallCm > 0) conditionType = 'NEIGE';
    else if (archiveResult.precipitationMm > 1.0) conditionType = 'PLUIE';
    else if (archiveResult.windGustsMaxKmH > 65) conditionType = 'VENT';
    else if (archiveResult.weatherCode >= 3) conditionType = 'NUAGEUX';

    const newLog: StoredDailyWeatherLog = {
      id: `${station.name}-${archiveResult.dateStr}-${Date.now()}`,
      dateStr: archiveResult.dateStr,
      cityName: station.name,
      department: station.department || 'France',
      latitude: station.latitude || 48.8566,
      longitude: station.longitude || 2.3522,
      tempMax: archiveResult.tempMax,
      tempMin: archiveResult.tempMin,
      tempMean: archiveResult.tempMean,
      precipitationMm: archiveResult.precipitationMm,
      windSpeedMax: archiveResult.windMaxKmH,
      windGustsMax: archiveResult.windGustsMaxKmH,
      weatherCode: archiveResult.weatherCode,
      weatherDesc: archiveResult.weatherDesc,
      conditionType,
      userNotes: userJournalNote.trim() || undefined,
      timestampSaved: Date.now()
    };

    const updated = [newLog, ...savedLogs.filter(l => !(l.dateStr === newLog.dateStr && l.cityName === newLog.cityName))];
    setSavedLogs(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving to localStorage:', e);
    }
    setUserJournalNote('');
  };

  const handleDeleteLog = (id: string) => {
    const updated = savedLogs.filter(l => l.id !== id);
    setSavedLogs(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  return (
    <div id="weather-history-archive-page" className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <History className="h-4 w-4 text-amber-400" />
              <span>Archives climatologiques et carnet d'observations</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-2xl'}`}>
              Historique météo et recherche par date
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Consultez les conditions météorologiques enregistrées dans le passé (températures, précipitations, vent) pour n'importe quelle date et consignez vos observations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 text-xs border border-slate-700 transition cursor-pointer"
                title="Retourner à la météo en direct"
              >
                <span>← Retour au direct</span>
              </button>
            )}

            {onOpenSearchModal && (
              <button
                onClick={onOpenSearchModal}
                className="flex items-center gap-1.5 rounded-md bg-[#0284C7] hover:bg-sky-600 text-white font-semibold px-3 py-2 text-xs border border-sky-500 transition cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Changer de ville ({station.name})</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Selector Form */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="history-date-input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Date consultée :</span>
            </label>
            <input
              id="history-date-input"
              type="date"
              value={selectedDate}
              max={defaultYesterday}
              min="1950-01-01"
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition cursor-pointer"
            >
              ← Retourner au direct
            </button>
          )}
        </div>
      </div>

      {/* 2. Loading or Error State */}
      {isLoading && (
        <div className="p-8 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
          <p className="text-xs text-slate-300">Extraction des archives météo en cours pour {station.name}...</p>
        </div>
      )}

      {errorMessage && !isLoading && (
        <div className="p-4 rounded-lg border border-rose-900 bg-rose-950/40 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Detailed Weather Card for Selected Date */}
      {archiveResult && !isLoading && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-amber-400">
                  Journée du {new Date(archiveResult.dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {station.name} ({station.department})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Temps observé : <span className="text-slate-200 font-medium">{archiveResult.weatherDesc}</span>
                </p>
              </div>

              {/* Action to Save in Journal */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="Note (ex: orage fort, fête...)"
                  value={userJournalNote}
                  onChange={(e) => setUserJournalNote(e.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleSaveToLocalJournal}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition cursor-pointer whitespace-nowrap"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Enregistrer dans mon carnet</span>
                </button>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4">
              <div className="p-3 rounded-md bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Temp. maximale</div>
                <div className="text-xl font-bold text-rose-400 mt-0.5 tabular-nums">
                  {formatTemp(archiveResult.tempMax)}
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Temp. minimale</div>
                <div className="text-xl font-bold text-blue-400 mt-0.5 tabular-nums">
                  {formatTemp(archiveResult.tempMin)}
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Temp. moyenne</div>
                <div className="text-xl font-bold text-slate-200 mt-0.5 tabular-nums">
                  {formatTemp(archiveResult.tempMean)}
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Précipitations</div>
                <div className="text-xl font-bold text-cyan-300 mt-0.5 tabular-nums">
                  {archiveResult.precipitationMm} mm
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Rafale maximale</div>
                <div className="text-xl font-bold text-teal-300 mt-0.5 tabular-nums">
                  {archiveResult.windGustsMaxKmH} km/h
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Rayonnement solaire</div>
                <div className="text-xl font-bold text-amber-300 mt-0.5 tabular-nums">
                  {archiveResult.solarRadiationMj} MJ
                </div>
              </div>
            </div>

            {/* Weather Condition Diagnostic */}
            <div className="mt-4 p-4 rounded-md border border-slate-800 bg-slate-950">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl shrink-0 p-2 rounded-md bg-slate-900 border border-slate-800">
                    {archiveResult.mainCondition === 'SOLEIL' && '☀️'}
                    {archiveResult.mainCondition === 'ECLAIRCIES' && '🌤️'}
                    {archiveResult.mainCondition === 'NUAGEUX' && '☁️'}
                    {archiveResult.mainCondition === 'PLUIE' && '🌧️'}
                    {archiveResult.mainCondition === 'ORAGE' && '⛈️'}
                    {archiveResult.mainCondition === 'NEIGE' && '🌨️'}
                    {archiveResult.mainCondition === 'BROUILLARD' && '🌫️'}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-amber-400">
                      Diagnostic de la journée
                    </div>
                    <h4 className="text-lg font-bold text-white mt-0.5">
                      {archiveResult.mainConditionLabel}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {archiveResult.mainConditionSummary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    archiveResult.precipitationMm > 0 
                      ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    {archiveResult.precipitationMm > 0 ? `${archiveResult.precipitationMm} mm de pluie` : 'Temps sec (0 mm)'}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-900 border-slate-800 text-slate-300">
                    {archiveResult.tempMax >= 30 ? 'Fortes chaleurs' : archiveResult.tempMin <= 0 ? 'Gelée matinale' : 'Températures de saison'}
                  </span>
                </div>
              </div>

              {/* 4 Periods of Day Breakdown: Matin, Midi, Après-midi, Soirée */}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Nuit / Matin */}
                <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Matinée (06h - 11h)</div>
                  <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                    <span>{archiveResult.hourly[8]?.precipitation > 0 ? '🌧️ Pluvieux' : archiveResult.hourly[8]?.weatherCode <= 1 ? '☀️ Ensoleillé' : '🌤️ Éclaircies'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ~{archiveResult.hourly[8]?.temperature ?? archiveResult.tempMin}°C
                  </div>
                </div>

                {/* Après-midi */}
                <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Après-Midi (12h - 17h)</div>
                  <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                    <span>{archiveResult.hourly[15]?.precipitation > 0 ? '🌧️ Averses' : archiveResult.hourly[15]?.weatherCode <= 1 ? '☀️ Soleil' : '⛅ Ciel variable'}</span>
                  </div>
                  <div className="text-[11px] text-rose-400 mt-0.5">
                    ~{archiveResult.hourly[15]?.temperature ?? archiveResult.tempMax}°C
                  </div>
                </div>

                {/* Soirée */}
                <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Soirée (18h - 22h)</div>
                  <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                    <span>{archiveResult.hourly[20]?.precipitation > 0 ? '🌧️ Humide' : archiveResult.hourly[20]?.weatherCode <= 1 ? 'Ciel clair' : '☁️ Nuageux'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ~{archiveResult.hourly[20]?.temperature ?? 18}°C
                  </div>
                </div>

                {/* Nuit */}
                <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Nuit (23h - 05h)</div>
                  <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                    <span>{archiveResult.hourly[2]?.precipitation > 0 ? '🌧️ Pluvieux' : 'Ciel dégagé'}</span>
                  </div>
                  <div className="text-[11px] text-blue-400 mt-0.5">
                    ~{archiveResult.hourly[4]?.temperature ?? archiveResult.tempMin}°C
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Curve for Selected Day */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Profil horaire de 00h à 23h ({archiveResult.dateStr})</span>
              </h4>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={archiveResult.hourly}>
                    <defs>
                      <linearGradient id="archiveTempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} unit="°C" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '6px', color: '#fff' }}
                      formatter={(val: any) => [`${val}°C`, 'Température']}
                    />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#archiveTempGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. Personal Stored Weather Journal List */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Mon carnet météo ({savedLogs.length} date{savedLogs.length > 1 ? 's' : ''})</h3>
              </div>
            </div>

            {savedLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aucune journée enregistrée pour l'instant. Choisissez une date ci-dessus et cliquez sur « Enregistrer dans mon carnet ».
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {savedLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-400">{log.dateStr}</span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Supprimer cette entrée"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-white mt-0.5">
                        {log.cityName} ({log.department})
                      </div>

                      <div className="text-xs text-slate-400 mt-0.5">
                        {log.weatherDesc}
                      </div>

                      {log.userNotes && (
                        <div className="mt-2 text-xs italic text-slate-300 bg-slate-900 p-2 rounded-md border border-slate-800">
                          « {log.userNotes} »
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-rose-400">Max: {log.tempMax}°C</span>
                      <span className="text-blue-400">Min: {log.tempMin}°C</span>
                      <span className="text-cyan-300">{log.precipitationMm} mm</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
