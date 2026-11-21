import React, { useEffect, useMemo, useState } from 'react';
import {
  LocationPoint,
  DailyForecast,
  CurrentWeather
} from '../types/weather';
import {
  getRecordedAltitudeEntry,
  recordLocalityAltitude,
  resolveAndRecordLocalityAltitude
} from '../services/worldAltitudeService';

export interface FourteenDayDetailedTrendsCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentAnomaly?: number;
  dailyForecasts?: DailyForecast[];
  currentWeather?: CurrentWeather;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  simplifiedMode?: boolean;
}

export const FourteenDayDetailedTrendsCard: React.FC<FourteenDayDetailedTrendsCardProps> = ({
  station
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [resolvedAlt, setResolvedAlt] = useState<number | undefined>(() => {
    const rec = getRecordedAltitudeEntry(station.latitude, station.longitude, station.name, station.country);
    return rec?.alt ?? station.altitude;
  });

  useEffect(() => {
    let active = true;
    const rec = getRecordedAltitudeEntry(station.latitude, station.longitude, station.name, station.country);
    if (rec) {
      setResolvedAlt(rec.alt);
    } else {
      setResolvedAlt(station.altitude);
    }
    resolveAndRecordLocalityAltitude({
      lat: station.latitude,
      lon: station.longitude,
      name: station.name,
      country: station.country,
      knownAltitude: station.altitude
    })
      .then((entry) => {
        if (active && typeof entry.alt === 'number') {
          setResolvedAlt(entry.alt);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [station.latitude, station.longitude, station.name, station.country, station.altitude]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type === 'IM_ALTITUDE_RECORDED' && event.data.payload) {
        const p = event.data.payload;
        if (typeof p.lat === 'number' && typeof p.lon === 'number' && typeof p.alt === 'number') {
          recordLocalityAltitude({
            lat: p.lat,
            lon: p.lon,
            alt: p.alt,
            name: String(p.name || 'Localité'),
            country: p.country ? String(p.country) : undefined,
            coastal: typeof p.coastal === 'number' ? p.coastal : undefined,
            relief: typeof p.relief === 'number' ? p.relief : undefined,
            exposure: typeof p.exposure === 'number' ? p.exposure : undefined,
            source: 'dem_90m',
            syncBackend: true
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    params.set('lat', String(station.latitude));
    params.set('lon', String(station.longitude));
    if (typeof resolvedAlt === 'number' && !isNaN(resolvedAlt)) {
      params.set('alt', String(Math.round(resolvedAlt)));
    }
    if (station.name) params.set('name', station.name);
    if (station.department) params.set('admin', station.department);
    if (station.country) params.set('country', station.country);
    const cc = station.countryCode || (station.isFrench ? 'FR' : '');
    if (cc) params.set('cc', cc);
    if (reloadNonce > 0) params.set('r', String(reloadNonce));
    return `/assets/aistudio/tendances-14-jours__1__fde09a2a.html?${params.toString()}`;
  }, [
    station.latitude,
    station.longitude,
    resolvedAlt,
    station.name,
    station.department,
    station.country,
    station.countryCode,
    station.isFrench,
    reloadNonce
  ]);

  useEffect(() => {
    setIsLoaded(false);
    setLoadTimedOut(false);
    const timer = window.setTimeout(() => {
      setLoadTimedOut(true);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [iframeSrc]);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#eef3fa] m-0 p-0 overflow-hidden">
      {!isLoaded && !loadTimedOut && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#eef3fa] text-slate-700 pointer-events-none">
          <div className="h-9 w-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mb-3" />
          <span className="text-xs font-semibold tracking-wide text-slate-600">
            Chargement des tendances météo 14 jours — {station.name}…
          </span>
        </div>
      )}

      {!isLoaded && loadTimedOut && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-xl bg-white/95 border border-slate-300 px-3 py-2 shadow-lg text-xs text-slate-700">
          <span>Affichage lent détecté</span>
          <button
            type="button"
            onClick={() => setReloadNonce((n) => n + 1)}
            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 cursor-pointer"
          >
            Recharger
          </button>
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-300 hover:bg-slate-200"
          >
            Ouvrir
          </a>
        </div>
      )}

      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={`Tendances météo 14 jours — ${station.name}`}
        onLoad={() => {
          setIsLoaded(true);
          setLoadTimedOut(false);
        }}
        style={{ width: '100%', height: '100%', border: 0, display: 'block', backgroundColor: '#eef3fa' }}
        className="block bg-[#eef3fa]"
        allow="geolocation; fullscreen"
      />
    </div>
  );
};

