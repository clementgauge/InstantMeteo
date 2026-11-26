import { LocationPoint } from '../types/weather';
import { MOUNTAIN_MASSIFS } from '../services/mountainWeatherService';
import { RAW_MOUNTAIN_VILLAGES } from './mountainVillagesRaw';

export const MOUNTAIN_VILLAGES_CATALOG: LocationPoint[] = [
  ...RAW_MOUNTAIN_VILLAGES.map((v): LocationPoint => {
    const isFrench = !v.country || v.country === 'France';
    return {
      id: v.id,
      name: v.name,
      department: v.dept,
      region: v.region,
      country: v.country || 'France',
      countryCode: v.countryCode || 'FR',
      latitude: v.lat,
      longitude: v.lon,
      altitude: v.alt,
      climateZone: `${v.massif} (${v.alt} m)`,
      allTimeRecordMax: v.alt >= 1800 ? 26.5 : v.alt >= 1200 ? 32.0 : 36.5,
      allTimeRecordMin: v.alt >= 1800 ? -32.0 : v.alt >= 1200 ? -27.5 : -23.0,
      allTimeRecordRain24h: 135,
      isFrench,
      isMountain: true,
      isHighAltitude: v.alt >= 1500,
      isWorldLocation: !isFrench,
      postalCode: v.postal
    };
  }),
  ...MOUNTAIN_MASSIFS.map((m): LocationPoint => {
    const isFrench = m.country === 'France';
    const avgAlt = Math.round((m.altitudeBase + m.altitudePeak) / 2);
    return {
      id: `massif-station-${m.id}`,
      name: m.name,
      department: m.department,
      region: m.range,
      country: m.country,
      countryCode: isFrench ? 'FR' : 'EUR',
      latitude: m.latitude,
      longitude: m.longitude,
      altitude: m.altitudeBase || avgAlt,
      climateZone: `${m.range} (Base ${m.altitudeBase}m • Sommet ${m.altitudePeak}m)`,
      allTimeRecordMax: 28.0,
      allTimeRecordMin: -31.0,
      allTimeRecordRain24h: 140,
      isFrench,
      isMountain: true,
      isHighAltitude: (m.altitudeBase || avgAlt) >= 1500,
      isWorldLocation: !isFrench
    };
  })
];
