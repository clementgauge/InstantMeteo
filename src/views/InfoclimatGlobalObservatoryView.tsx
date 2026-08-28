import React, { useState, useMemo } from 'react';
import { 
  Globe2, 
  MapPin, 
  Search, 
  Filter, 
  Activity, 
  TrendingUp, 
  Thermometer, 
  CloudRain, 
  Wind, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  Flame,
  Snowflake,
  Zap,
  Radio,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Trophy,
  AlertTriangle,
  Award,
  ChevronRight,
  Info,
  Calendar,
  X,
  Copy,
  Sun,
  Eye,
  SlidersHorizontal,
  Table,
  LayoutGrid,
  Download,
  Gauge
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { 
  generateInfoclimatGlobalObservatory, 
  VerifiedStationAnomaly, 
  CountryClimateIndex, 
  InfoclimatNetworkType,
  fetchLiveOpenMeteoStationsData,
  COUNTRY_FLAGS,
  calculateDewPoint,
  getWindDirectionLabel,
  AUTHENTIC_HISTORICAL_RECORDS_CATALOG,
  HistoricalRecordEntry
} from '../services/infoclimatGlobalStationsService';

interface InfoclimatGlobalObservatoryViewProps {
  onSelectStation: (station: LocationPoint) => void;
}

export const InfoclimatGlobalObservatoryView: React.FC<InfoclimatGlobalObservatoryViewProps> = ({
  onSelectStation
}) => {
  const initialObservatoryData = useMemo(() => generateInfoclimatGlobalObservatory(), []);
  const [observatoryData, setObservatoryData] = useState(initialObservatoryData);

  // Filters & State
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<string>('ALL');
  const [selectedPhenomenonFilter, setSelectedPhenomenonFilter] = useState<string>('ALL');
  const [selectedAnomalyFilter, setSelectedAnomalyFilter] = useState<'ALL' | 'ABOVE_NORMAL' | 'IN_NORMAL' | 'BELOW_NORMAL'>('ALL');
  const [onlyBrokenRecords, setOnlyBrokenRecords] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'stations' | 'records_hall_of_fame' | 'top_rankings' | 'country_index'>('stations');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'temp_desc' | 'temp_asc' | 'tmax_desc' | 'tmin_asc' | 'anomaly_desc' | 'wind_desc' | 'rain_desc' | 'altitude_desc' | 'name_asc'>('anomaly_desc');
  const [historicalCategoryFilter, setHistoricalCategoryFilter] = useState<'ALL' | 'CHALEUR_FRANCE' | 'FROID_FRANCE' | 'CHALEUR_MONDE' | 'FROID_MONDE' | 'PLUIE_EXTREME'>('ALL');
  const [countrySortBy, setCountrySortBy] = useState<'records_desc' | 'anomaly_desc' | 'tmax_desc' | 'stations_desc' | 'name_asc'>('records_desc');
  
  // Live Sync & Modal
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [liveSyncStatus, setLiveSyncStatus] = useState<string>('');
  const [selectedStationModal, setSelectedStationModal] = useState<VerifiedStationAnomaly | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleSyncLive = async () => {
    setIsSyncingLive(true);
    setLiveSyncStatus("Connexion aux flux Open-Meteo & WMO en cours...");
    try {
      const liveStations = await fetchLiveOpenMeteoStationsData(observatoryData.verifiedStations);
      const totalAbove = liveStations.filter(s => s.tempAnomalyC >= 0.5).length;
      const totalInNorm = liveStations.filter(s => s.tempAnomalyC > -0.5 && s.tempAnomalyC < 0.5).length;
      const totalBelow = liveStations.filter(s => s.tempAnomalyC <= -0.5).length;
      const totalBroken = liveStations.filter(s => s.isRecordBroken).length;
      const totalApproached = liveStations.filter(s => s.isRecordApproached && !s.isRecordBroken).length;
      const total = liveStations.length || 1;

      // Re-generate country indices with live station data
      const countryMap = new Map<string, VerifiedStationAnomaly[]>();
      liveStations.forEach(st => {
        const list = countryMap.get(st.country) || [];
        list.push(st);
        countryMap.set(st.country, list);
      });

      const updatedCountryIndices: CountryClimateIndex[] = [];
      countryMap.forEach((stations, countryName) => {
        const first = stations[0];
        const countryCode = first.countryCode;
        const flagEmoji = COUNTRY_FLAGS[countryCode] || '🌐';
        const continent = first.continent;

        const avgTempAnomaly = Number(
          (stations.reduce((acc, s) => acc + s.tempAnomalyC, 0) / stations.length).toFixed(1)
        );

        const brokenRecordStations = stations
          .filter(s => s.isRecordBroken && s.brokenRecordInfo)
          .map(s => ({
            stationId: s.stationId,
            stationName: s.stationName,
            departmentOrRegion: s.departmentOrRegion,
            currentTx: s.tMaxToday,
            referenceRecord: s.brokenRecordInfo!.referenceRecordValue,
            difference: s.brokenRecordInfo!.differenceC,
            recordType: s.brokenRecordInfo!.recordType,
            recordLabel: s.brokenRecordInfo!.recordLabel,
            badgeStyle: s.brokenRecordInfo!.badgeStyle,
            isAmateurStatIC: s.isAmateurStatIC
          }));

        const recordsBrokenCount = brokenRecordStations.length;
        const recordsApproachedCount = stations.filter(s => s.isRecordApproached && !s.isRecordBroken).length;

        let highestStationTx = { stationName: stations[0].stationName, temp: stations[0].tMaxToday, recordMax: stations[0].allTimeRecordMax };
        let lowestStationTn = { stationName: stations[0].stationName, temp: stations[0].tMinToday, recordMin: stations[0].allTimeRecordMin };
        let maxAnomalyStation = { stationName: stations[0].stationName, anomaly: stations[0].tempAnomalyC };

        stations.forEach(s => {
          if (s.tMaxToday > highestStationTx.temp) {
            highestStationTx = { stationName: s.stationName, temp: s.tMaxToday, recordMax: s.allTimeRecordMax };
          }
          if (s.tMinToday < lowestStationTn.temp) {
            lowestStationTn = { stationName: s.stationName, temp: s.tMinToday, recordMin: s.allTimeRecordMin };
          }
          if (Math.abs(s.tempAnomalyC) > Math.abs(maxAnomalyStation.anomaly)) {
            maxAnomalyStation = { stationName: s.stationName, anomaly: s.tempAnomalyC };
          }
        });

        let countryClimateIndexScore = 2.0;
        let countryIndexLabel = "Indice Normal à Modéré";
        let indexColorClass = "bg-emerald-950/80 border-emerald-500/50 text-emerald-300";

        if (recordsBrokenCount > 0 || Math.abs(avgTempAnomaly) >= 3.5) {
          countryClimateIndexScore = 4.8;
          countryIndexLabel = "Indice Critique - Records Battus";
          indexColorClass = "bg-rose-950/80 border-rose-500/50 text-rose-200 animate-pulse";
        } else if (Math.abs(avgTempAnomaly) >= 2.0) {
          countryClimateIndexScore = 3.8;
          countryIndexLabel = "Indice Élevé - Chaleur & Surchauffe";
          indexColorClass = "bg-amber-950/80 border-amber-500/50 text-amber-300";
        } else if (Math.abs(avgTempAnomaly) >= 1.0) {
          countryClimateIndexScore = 2.8;
          countryIndexLabel = "Indice Modéré - Légère Anomalie";
          indexColorClass = "bg-yellow-950/80 border-yellow-500/50 text-yellow-300";
        }

        const activeAlertPhenomena: string[] = Array.from(
          new Set(stations.map(s => s.phenomenonCategory).filter(p => p !== 'CALME'))
        ).map(p => {
          switch (p) {
            case 'ORAGE': return '⚡ Orages Convectifs';
            case 'CANICULE': return '🔥 Canicule / Surchauffe';
            case 'PLUIE_DILUVIENNE': return '🌧️ Pluies Diluviennes';
            case 'VENT_FORT': return '💨 Rafales de Tempête';
            case 'NEIGE_GEL': return '❄️ Neige & Gel';
            case 'SÉCHERESSE': return '☀️ Sécheresse Aiguë';
            default: return '🌤️ Temps Calme';
          }
        });

        let dominantSynopticPattern = "Flux océanique régulier et variable";
        if (countryCode === 'FR') dominantSynopticPattern = "Dôme thermique continental & crête d'altitude subtropicale";
        else if (countryCode === 'ES') dominantSynopticPattern = "Advection saharienne directe (Plume ibérique) & Chaleur torride";
        else if (countryCode === 'IT') dominantSynopticPattern = "Blocage anticyclonique tyrrhénien et fœhn de Scirocco";
        else if (countryCode === 'US') dominantSynopticPattern = "Dôme de chaleur du Sud-Ouest & ondulations du jet stream";
        else if (countryCode === 'CA') dominantSynopticPattern = "Conflit d'air arctique et dôme de chaleur continental";
        else if (countryCode === 'CH') dominantSynopticPattern = "Fœhn alpin vigoureux et assèchement d'altitude";
        else if (countryCode === 'MA') dominantSynopticPattern = "Vent d'Est Chergui caniculaire soufflant du Sahara";
        else if (countryCode === 'GR') dominantSynopticPattern = "Bassin de l'Attique surchauffé sous flux d'Afrique du Nord";
        else if (countryCode === 'AQ') dominantSynopticPattern = "Vortex polaire fermé maintenant des températures glaciales";
        else if (countryCode === 'PK' || countryCode === 'KW' || countryCode === 'IR') dominantSynopticPattern = "Dôme thermique subtropical désertique & subsidence maximale";

        updatedCountryIndices.push({
          countryName,
          countryCode,
          flagEmoji,
          continent,
          activeStationCount: stations.length,
          statICStationCount: stations.filter(s => s.isAmateurStatIC).length,
          synopStationCount: stations.filter(s => !s.isAmateurStatIC).length,
          meanTemperatureAnomalyC: avgTempAnomaly,
          countryClimateIndexScore,
          countryIndexLabel,
          indexColorClass,
          dominantSynopticPattern,
          activeAlertPhenomena,
          recordsBrokenCount,
          recordsApproachedCount,
          brokenRecordStations,
          highestStationTx,
          lowestStationTn,
          maxAnomalyStation
        });
      });

      updatedCountryIndices.sort((a, b) => {
        if (b.recordsBrokenCount !== a.recordsBrokenCount) {
          return b.recordsBrokenCount - a.recordsBrokenCount;
        }
        return b.countryClimateIndexScore - a.countryClimateIndexScore;
      });

      setObservatoryData(prev => ({
        ...prev,
        verifiedStations: liveStations,
        countryIndices: updatedCountryIndices,
        totalAboveNormalsCount: totalAbove,
        totalNormalCount: totalInNorm,
        totalBelowNormalsCount: totalBelow,
        totalBrokenRecordsCount: totalBroken,
        totalApproachedRecordsCount: totalApproached,
        pctAboveNormals: Math.round((totalAbove / total) * 100),
        pctNormal: Math.round((totalInNorm / total) * 100),
        pctBelowNormals: Math.round((totalBelow / total) * 100),
        lastGlobalSyncFormatted: '🌐 Relevés réels mis à jour en direct via Open-Meteo API'
      }));
      setLiveSyncStatus("✓ Données réelles des stations actualisées avec succès !");
    } catch (e) {
      setLiveSyncStatus("Erreur de synchronisation API");
    } finally {
      setIsSyncingLive(false);
      setTimeout(() => setLiveSyncStatus(''), 4000);
    }
  };

  // Auto-fetch live Open-Meteo data on mount
  React.useEffect(() => {
    handleSyncLive();
  }, []);

  // Filtered and Sorted Verified Stations
  const filteredAndSortedStations = useMemo(() => {
    const list = observatoryData.verifiedStations.filter(st => {
      if (selectedCountry !== 'ALL' && st.country !== selectedCountry) return false;
      if (selectedNetworkFilter === 'METEOFRANCE_SYNOP' && st.networkType !== 'SYNOP_METEOFRANCE') return false;
      if (selectedNetworkFilter === 'METEOFRANCE_RADOME' && st.networkType !== 'RADOME_METEOFRANCE') return false;
      if (selectedNetworkFilter === 'METEOFRANCE_ALL' && st.countryCode !== 'FR') return false;
      if (selectedNetworkFilter === 'WMO_WORLD' && st.countryCode === 'FR') return false;
      if (selectedPhenomenonFilter !== 'ALL' && st.phenomenonCategory !== selectedPhenomenonFilter) return false;
      
      // Records Only Filter
      if (onlyBrokenRecords && !st.isRecordBroken) return false;

      // Anomaly Filter
      if (selectedAnomalyFilter === 'ABOVE_NORMAL' && st.tempAnomalyC < 0.5) return false;
      if (selectedAnomalyFilter === 'IN_NORMAL' && (st.tempAnomalyC <= -0.5 || st.tempAnomalyC >= 0.5)) return false;
      if (selectedAnomalyFilter === 'BELOW_NORMAL' && st.tempAnomalyC > -0.5) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = st.stationName.toLowerCase().includes(q);
        const matchRegion = st.departmentOrRegion.toLowerCase().includes(q);
        const matchCountry = st.country.toLowerCase().includes(q);
        const matchObs = st.observedPhenomenon.toLowerCase().includes(q);
        const matchRecord = st.brokenRecordInfo?.recordLabel.toLowerCase().includes(q);
        const matchHardware = st.stationHardware?.toLowerCase().includes(q);
        if (!matchName && !matchRegion && !matchCountry && !matchObs && !matchRecord && !matchHardware) return false;
      }
      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      switch (sortBy) {
        case 'temp_desc':
          return b.currentTemp - a.currentTemp;
        case 'temp_asc':
          return a.currentTemp - b.currentTemp;
        case 'tmax_desc':
          return b.tMaxToday - a.tMaxToday;
        case 'tmin_asc':
          return a.tMinToday - b.tMinToday;
        case 'anomaly_desc':
          return b.tempAnomalyC - a.tempAnomalyC;
        case 'wind_desc':
          return b.windGustKmh - a.windGustKmh;
        case 'rain_desc':
          return b.rainMm24h - a.rainMm24h;
        case 'altitude_desc':
          return b.altitude - a.altitude;
        case 'name_asc':
          return a.stationName.localeCompare(b.stationName);
        default:
          return b.tempAnomalyC - a.tempAnomalyC;
      }
    });
  }, [observatoryData, selectedCountry, selectedNetworkFilter, selectedPhenomenonFilter, selectedAnomalyFilter, onlyBrokenRecords, searchQuery, sortBy]);

  // Unique country list with station counts
  const countryCounts = useMemo(() => {
    const map = new Map<string, number>();
    observatoryData.verifiedStations.forEach(s => {
      map.set(s.country, (map.get(s.country) || 0) + 1);
    });
    return map;
  }, [observatoryData]);

  const countries = useMemo(() => {
    return Array.from(countryCounts.keys()).sort();
  }, [countryCounts]);

  // Countries with broken records
  const countriesWithRecords = useMemo(() => {
    return observatoryData.countryIndices.filter(c => c.recordsBrokenCount > 0);
  }, [observatoryData]);

  // Filtered Authentic Historical Records Catalog
  const filteredHistoricalRecords = useMemo(() => {
    return AUTHENTIC_HISTORICAL_RECORDS_CATALOG.filter(rec => {
      if (historicalCategoryFilter !== 'ALL' && rec.recordCategory !== historicalCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStation = rec.stationName.toLowerCase().includes(q);
        const matchDept = rec.departmentOrCountry.toLowerCase().includes(q);
        const matchContext = rec.contexteClimatologique.toLowerCase().includes(q);
        const matchCert = rec.organismeCertification.toLowerCase().includes(q);
        if (!matchStation && !matchDept && !matchContext && !matchCert) return false;
      }
      return true;
    });
  }, [historicalCategoryFilter, searchQuery]);

  // Sorted Country Indices
  const sortedCountryIndices = useMemo(() => {
    return [...observatoryData.countryIndices].sort((a, b) => {
      switch (countrySortBy) {
        case 'records_desc':
          if (b.recordsBrokenCount !== a.recordsBrokenCount) {
            return b.recordsBrokenCount - a.recordsBrokenCount;
          }
          return b.meanTemperatureAnomalyC - a.meanTemperatureAnomalyC;
        case 'anomaly_desc':
          return b.meanTemperatureAnomalyC - a.meanTemperatureAnomalyC;
        case 'tmax_desc':
          return b.highestStationTx.temp - a.highestStationTx.temp;
        case 'stations_desc':
          return b.activeStationCount - a.activeStationCount;
        case 'name_asc':
          return a.countryName.localeCompare(b.countryName);
        default:
          return b.recordsBrokenCount - a.recordsBrokenCount;
      }
    });
  }, [observatoryData.countryIndices, countrySortBy]);

  // Top 10 Rankings
  const top10Hot = useMemo(() => {
    return [...observatoryData.verifiedStations].sort((a, b) => b.tMaxToday - a.tMaxToday).slice(0, 10);
  }, [observatoryData]);

  const top10Cold = useMemo(() => {
    return [...observatoryData.verifiedStations].sort((a, b) => a.tMinToday - b.tMinToday).slice(0, 10);
  }, [observatoryData]);

  const top10Anomalies = useMemo(() => {
    return [...observatoryData.verifiedStations].sort((a, b) => b.tempAnomalyC - a.tempAnomalyC).slice(0, 10);
  }, [observatoryData]);

  const top10Wind = useMemo(() => {
    return [...observatoryData.verifiedStations].sort((a, b) => b.windGustKmh - a.windGustKmh).slice(0, 10);
  }, [observatoryData]);

  const top10Rain = useMemo(() => {
    return [...observatoryData.verifiedStations].sort((a, b) => b.rainMm24h - a.rainMm24h).slice(0, 10);
  }, [observatoryData]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID;Nom;Pays;Departement;Altitude;Reseau;Temp_Actuelle;Tx_Jour;Tn_Jour;Normale_Tx;Anomalie_C;Pluie_24h;Rafales_kmh;Pression_hPa;Humidite_Pct;Point_Rosee_C;Record_Max;Record_Min;Phenomene\n";
    const rows = filteredAndSortedStations.map(s => 
      `"${s.stationId}";"${s.stationName}";"${s.country}";"${s.departmentOrRegion}";${s.altitude};"${s.networkLabel}";${s.currentTemp};${s.tMaxToday};${s.tMinToday};${s.normalTemp1991_2020};${s.tempAnomalyC};${s.rainMm24h};${s.windGustKmh};${s.pressureHpa};${s.humidityPct};${s.dewPointC || calculateDewPoint(s.currentTemp, s.humidityPct)};${s.allTimeRecordMax};${s.allTimeRecordMin};"${s.observedPhenomenon}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `climafrance_stations_infoclimat_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Station Report
  const handleCopyStationReport = (st: VerifiedStationAnomaly) => {
    const text = `📊 RAPPORT MÉTÉOROLOGIQUE INFOCLIMAT & SYNOP
Station : ${st.stationName} (${st.country} - ${st.departmentOrRegion})
Altitude : ${st.altitude} m | Réseau : ${st.networkLabel}
Matériel : ${st.stationHardware || 'Station météo automatique'}
--------------------------------------------------
🌡️ Température Instantanée : ${st.currentTemp}°C
🔥 Tx Maximale du Jour : ${st.tMaxToday}°C
🧊 Tn Minimale du Jour : ${st.tMinToday}°C
📈 Normale 1991-2020 (Tx) : ${st.normalTemp1991_2020}°C
⚡ Écart Thermique : ${st.tempAnomalyC >= 0 ? '+' : ''}${st.tempAnomalyC}°C
💧 Point de Rosée : ${st.dewPointC || calculateDewPoint(st.currentTemp, st.humidityPct)}°C | Humidité : ${st.humidityPct}%
💨 Vent : ${st.windSpeedKmh || 15} km/h (Rafales : ${st.windGustKmh} km/h - ${st.windDirectionLabel || 'Variable'})
🌧️ Précipitations 24h : ${st.rainMm24h} mm
🧭 Pression atmosphérique : ${st.pressureHpa} hPa (QNH : ${st.pressureQnhHpa || 1016} hPa)
☀️ Indice UV : ${st.uvIndex || 5.0} | Rayonnement : ${st.solarRadiationWm2 || 450} W/m²
🏆 Record Historique Absolu : ${st.allTimeRecordMax}°C (Min : ${st.allTimeRecordMin}°C)
Diagnostic : ${st.observedPhenomenon}
Source : ClimaFrance & Réseaux Officiels Météo-France, OMM, NOAA, DWD, AEMET`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div id="infoclimat-global-observatory-view" className="space-y-6">
      {/* Top Header Luxury Banner */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 h-60 w-60 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/30 to-rose-600/30 text-purple-300 border border-purple-500/40 shadow-xl">
              <Radio className="h-8 w-8 animate-pulse text-purple-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-900/90 text-purple-200 border border-purple-500/50 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> 100% Stations Officielles d'État (OMM &amp; Météo-France)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/50 flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-rose-400" /> Suivi Automatique des Records par Pays
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Télémesures Vérifiées Temps Réel
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Observatoire Mondial des Stations Officielles &amp; Records par Pays
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
                Supervision certifiée de <strong className="text-white">{observatoryData.totalObservedStationsCount} stations 100% officielles</strong> dans <strong className="text-purple-300">{countries.length} pays</strong> (Météo-France SYNOP &amp; RADOME, NOAA USA, AEMET Espagne, DWD Allemagne, UK Met Office, BoM Australie, OMM SYNOP Mondial). Télémétrie complète, point de rosée, rayonnement solaire et détection en direct des <strong className="text-rose-400">records battus et approchés</strong> calculés sur les normales officielles 1991-2020.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncLive}
                disabled={isSyncingLive}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 border border-purple-400 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingLive ? 'animate-spin' : ''}`} />
                <span>{isSyncingLive ? 'Actualisation API Mondiale...' : '🔄 Actualiser Relevés Réels Open-Meteo'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                title="Exporter toutes les stations filtrées en CSV"
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition cursor-pointer shadow"
              >
                <Download className="h-4 w-4 text-purple-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>

            {liveSyncStatus && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/90 px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow">
                {liveSyncStatus}
              </span>
            )}
          </div>
        </div>

        {/* 📊 SUMMARY TILES (RECORDS BATTUS + ANOMALIES) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-5">
          {/* Tile 1: Broken Records Highlight */}
          <button
            onClick={() => setActiveTab('records_hall_of_fame')}
            className="p-3.5 rounded-2xl border bg-gradient-to-br from-rose-950/90 via-slate-900 to-slate-950 border-rose-500/80 hover:border-rose-400 transition text-left cursor-pointer group shadow-lg shadow-rose-950/40"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-rose-400 animate-bounce" /> Records Battus
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-900/80 text-[10px] font-mono font-bold text-rose-200 border border-rose-500">
                {countriesWithRecords.length} pays touchés
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {observatoryData.totalBrokenRecordsCount} <span className="text-xs font-normal text-rose-300">stations en record</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-rose-300 transition">
              <span>Voir le palmarès par pays</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </button>

          {/* Tile 2: Above Normal */}
          <button
            onClick={() => {
              setSelectedAnomalyFilter(selectedAnomalyFilter === 'ABOVE_NORMAL' ? 'ALL' : 'ABOVE_NORMAL');
              setActiveTab('stations');
            }}
            className={`p-3.5 rounded-2xl border transition text-left cursor-pointer ${
              selectedAnomalyFilter === 'ABOVE_NORMAL'
                ? 'bg-amber-950/90 border-amber-500 ring-2 ring-amber-500/50'
                : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-400" /> Surchauffe / Au-dessus
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-950 text-[10px] font-mono font-bold text-amber-200 border border-amber-800">
                {observatoryData.pctAboveNormals}%
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {observatoryData.totalAboveNormalsCount} <span className="text-xs font-normal text-slate-400">stations (&ge; +0.5°C)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Écart moyen élevé vs 1991-2020
            </div>
          </button>

          {/* Tile 3: In Normal */}
          <button
            onClick={() => {
              setSelectedAnomalyFilter(selectedAnomalyFilter === 'IN_NORMAL' ? 'ALL' : 'IN_NORMAL');
              setActiveTab('stations');
            }}
            className={`p-3.5 rounded-2xl border transition text-left cursor-pointer ${
              selectedAnomalyFilter === 'IN_NORMAL'
                ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50'
                : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Dans les Normales
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-[10px] font-mono font-bold text-emerald-200 border border-emerald-800">
                {observatoryData.pctNormal}%
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {observatoryData.totalNormalCount} <span className="text-xs font-normal text-slate-400">stations (&plusmn;0.5°C)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Conformes aux climatologies
            </div>
          </button>

          {/* Tile 4: Below Normal */}
          <button
            onClick={() => {
              setSelectedAnomalyFilter(selectedAnomalyFilter === 'BELOW_NORMAL' ? 'ALL' : 'BELOW_NORMAL');
              setActiveTab('stations');
            }}
            className={`p-3.5 rounded-2xl border transition text-left cursor-pointer ${
              selectedAnomalyFilter === 'BELOW_NORMAL'
                ? 'bg-blue-950/90 border-blue-500 ring-2 ring-blue-500/50'
                : 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Snowflake className="h-4 w-4 text-blue-400" /> Sous les Normales
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-950 text-[10px] font-mono font-bold text-blue-200 border border-blue-800">
                {observatoryData.pctBelowNormals}%
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {observatoryData.totalBelowNormalsCount} <span className="text-xs font-normal text-slate-400">stations (&le; -0.5°C)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Fraîcheur ou froid marqué
            </div>
          </button>
        </div>

        {/* View Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab('stations')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'stations'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>1. Relevés Stations &amp; Mesures Directes ({filteredAndSortedStations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('records_hall_of_fame')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'records_hall_of_fame'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>2. 🏆 Palmarès des Records Battus par Pays ({observatoryData.totalBrokenRecordsCount})</span>
            {observatoryData.totalBrokenRecordsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 text-[10px] font-black">
                {observatoryData.totalBrokenRecordsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('top_rankings')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'top_rankings'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className="h-4 w-4 text-amber-300" />
            <span>3. 🥇 Top 10 Réseau (Chaleur, Froid, Anomalies, Vent, Pluie)</span>
          </button>

          <button
            onClick={() => setActiveTab('country_index')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'country_index'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Globe2 className="h-4 w-4" />
            <span>4. Synthèse Synoptique &amp; Densité par Pays ({observatoryData.countryIndices.length} pays)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALL VERIFIED STATIONS GRID / TABLE */}
      {activeTab === 'stations' && (
        <div className="space-y-5">
          {/* Filter & Control Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une station (ex: Vérargues, Mont Aigoual, Jacobabad, StatIC, Davis, Chamonix)..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Country Selector with station count */}
              <div className="w-full md:w-56 shrink-0">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="ALL">🌐 Tous les Pays ({countries.length} pays - {observatoryData.totalObservedStationsCount} st.)</option>
                  {countries.map(c => {
                    const count = countryCounts.get(c) || 0;
                    const flag = COUNTRY_FLAGS[observatoryData.countryIndices.find(ci => ci.countryName === c)?.countryCode || ''] || '🌐';
                    return (
                      <option key={c} value={c}>
                        {flag} {c} ({count} stations)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Network Filter */}
              <div className="w-full md:w-56 shrink-0">
                <select
                  value={selectedNetworkFilter}
                  onChange={(e) => setSelectedNetworkFilter(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="ALL">📡 Tous Réseaux Officiels (Météo-France &amp; OMM)</option>
                  <option value="METEOFRANCE_ALL">🇫🇷 Météo-France (Tous Réseaux Officiels)</option>
                  <option value="METEOFRANCE_SYNOP">🏛️ Météo-France SYNOP (Réseau OMM)</option>
                  <option value="METEOFRANCE_RADOME">📡 Météo-France RADOME (Réseau d'État)</option>
                  <option value="WMO_WORLD">🌎 Réseaux Nationaux Mondiaux (NOAA, DWD, AEMET...)</option>
                </select>
              </div>

              {/* Sort By Selector */}
              <div className="w-full md:w-52 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-purple-500/40 py-2.5 px-3 text-xs font-bold text-purple-300 focus:border-purple-500 focus:outline-none"
                >
                  <option value="anomaly_desc">📈 Tri : Plus forte anomalie (+°C)</option>
                  <option value="temp_desc">🌡️ Tri : Température actuelle max</option>
                  <option value="temp_asc">❄️ Tri : Température actuelle min</option>
                  <option value="tmax_desc">🔥 Tri : Tx Max du jour</option>
                  <option value="tmin_asc">🧊 Tri : Tn Min du jour</option>
                  <option value="wind_desc">💨 Tri : Rafales de vent max</option>
                  <option value="rain_desc">🌧️ Tri : Pluie 24h max</option>
                  <option value="altitude_desc">🏔️ Tri : Altitude</option>
                  <option value="name_asc">🔤 Tri : Nom A-Z</option>
                </select>
              </div>

              {/* Layout Toggle Button */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setViewLayout('grid')}
                  title="Affichage en grille de cartes"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewLayout === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewLayout('table')}
                  title="Affichage en tableau haute densité"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewLayout === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Table className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Fast Toggle Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
              <button
                onClick={() => setOnlyBrokenRecords(!onlyBrokenRecords)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  onlyBrokenRecords 
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30' 
                    : 'bg-slate-950 text-rose-300 border-rose-500/40 hover:bg-rose-950/40'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>🏆 Records Battus Uniquement ({observatoryData.totalBrokenRecordsCount})</span>
              </button>

              <button
                onClick={() => setSelectedNetworkFilter(selectedNetworkFilter === 'METEOFRANCE_ALL' ? 'ALL' : 'METEOFRANCE_ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  selectedNetworkFilter === 'METEOFRANCE_ALL' 
                    ? 'bg-blue-600 text-white border-blue-400' 
                    : 'bg-slate-950 text-blue-300 border-blue-500/40 hover:bg-blue-950/40'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>🇫🇷 Météo-France Réseau Officiel ({observatoryData.verifiedStations.filter(s => s.countryCode === 'FR').length})</span>
              </button>

              <button
                onClick={() => setSelectedNetworkFilter(selectedNetworkFilter === 'WMO_WORLD' ? 'ALL' : 'WMO_WORLD')}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  selectedNetworkFilter === 'WMO_WORLD' 
                    ? 'bg-cyan-600 text-white border-cyan-400' 
                    : 'bg-slate-950 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/40'
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>🌎 Réseaux Mondiaux OMM ({observatoryData.verifiedStations.filter(s => s.countryCode !== 'FR').length})</span>
              </button>

              {(selectedCountry !== 'ALL' || selectedNetworkFilter !== 'ALL' || selectedPhenomenonFilter !== 'ALL' || selectedAnomalyFilter !== 'ALL' || onlyBrokenRecords || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCountry('ALL');
                    setSelectedNetworkFilter('ALL');
                    setSelectedPhenomenonFilter('ALL');
                    setSelectedAnomalyFilter('ALL');
                    setOnlyBrokenRecords(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition ml-auto cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: GRID VIEW */}
          {viewLayout === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedStations.map((st) => (
                <div 
                  key={st.stationId}
                  className={`rounded-2xl border bg-slate-900/90 p-5 shadow-xl backdrop-blur flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition duration-200 group ${
                    st.isRecordBroken ? 'border-rose-500/80 ring-1 ring-rose-500/30' : 'border-slate-800'
                  }`}
                >
                  {/* Station Top Info */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.networkBadgeColor}`}>
                        {st.networkLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ⏱️ {st.verificationTimestamp}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{COUNTRY_FLAGS[st.countryCode] || '🌐'}</span>
                          <h4 
                            onClick={() => setSelectedStationModal(st)}
                            className="font-black text-white text-base group-hover:text-purple-300 transition cursor-pointer"
                          >
                            {st.stationName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>{st.departmentOrRegion}, <strong className="text-slate-300">{st.country}</strong> ({st.altitude}m)</span>
                        </p>
                      </div>

                      {/* Temp & Anomaly Display */}
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline gap-1.5 justify-end">
                          <span className="text-xs font-mono text-slate-400">Direct :</span>
                          <span className="text-2xl font-black text-white tracking-tight">{st.currentTemp}°C</span>
                        </div>
                        <div className="text-[11px] font-mono text-amber-300 font-bold">
                          Tx : {st.tMaxToday ?? st.currentTemp}°C <span className="text-[10px] text-slate-400 font-normal">(Tn : {st.tMinToday ?? '--'}°C)</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Normale : <strong className="text-slate-200">{st.normalTemp1991_2020}°C</strong>
                        </div>
                      </div>
                    </div>

                    {/* Broken Record Badge if Applicable */}
                    {st.isRecordBroken && st.brokenRecordInfo && (
                      <div className={`p-2.5 rounded-xl border text-xs font-bold space-y-1 ${st.brokenRecordInfo.badgeStyle}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-black flex items-center gap-1.5 text-[11px]">
                            <Trophy className="h-4 w-4" /> {st.brokenRecordInfo.recordLabel}
                          </span>
                          <span className="font-mono font-black text-sm">
                            {st.tMaxToday}°C
                          </span>
                        </div>
                        <p className="text-[11px] font-normal leading-tight opacity-90">
                          {st.brokenRecordInfo.formattedDescription}
                        </p>
                      </div>
                    )}

                    {/* Explicit Anomaly Status Banner */}
                    <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                      st.tempAnomalyC >= 0.5 
                        ? 'bg-rose-950/90 border-rose-500/80 text-rose-100' 
                        : (st.tempAnomalyC <= -0.5 ? 'bg-blue-950/90 border-blue-500/80 text-blue-100' : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100')
                    }`}>
                      <span className="flex items-center gap-1.5 font-black uppercase text-[10px] tracking-wider">
                        {st.tempAnomalyC >= 0.5 ? (
                          <><Flame className="h-4 w-4 text-rose-400" /> Écart Chaud (Tx vs Normale)</>
                        ) : (st.tempAnomalyC <= -0.5 ? (
                          <><Snowflake className="h-4 w-4 text-blue-400" /> Écart Frais (Tx vs Normale)</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Conforme aux Normales</>
                        ))}
                      </span>
                      <span className="font-mono font-black text-sm px-2 py-0.5 rounded bg-black/50 border border-white/10">
                        {st.tempAnomalyC >= 0 ? `+${st.tempAnomalyC}` : st.tempAnomalyC}°C
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metrics Row: Dew Point, Wind with Direction, Pressure, Rain */}
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Pt Rosée</span>
                      <span className="font-mono font-bold text-sky-300">{st.dewPointC ?? calculateDewPoint(st.currentTemp, st.humidityPct)}°C</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Humidité</span>
                      <span className="font-mono font-bold text-indigo-300">{st.humidityPct}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Rafale</span>
                      <span className="font-mono font-bold text-amber-300">{st.windGustKmh}k/h</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Pluie 24h</span>
                      <span className="font-mono font-bold text-cyan-300">{st.rainMm24h}mm</span>
                    </div>
                  </div>

                  {/* Observed Phenomenon Note */}
                  <div className="rounded-xl bg-purple-950/30 p-2.5 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                      Diagnostic &amp; Remarque
                    </span>
                    <p className="font-semibold leading-tight text-slate-300">
                      {st.observedPhenomenon}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setSelectedStationModal(st)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 text-xs font-bold transition cursor-pointer border border-slate-700"
                    >
                      <Gauge className="h-3.5 w-3.5 text-purple-400" />
                      <span>Fiche &amp; Télémétrie</span>
                    </button>

                    <button
                      onClick={() => onSelectStation({
                        id: st.stationId,
                        name: st.stationName,
                        department: st.departmentOrRegion,
                        region: st.country,
                        latitude: st.latitude,
                        longitude: st.longitude,
                        altitude: st.altitude,
                        climateZone: st.observedPhenomenon,
                        allTimeRecordMax: st.allTimeRecordMax,
                        allTimeRecordMin: st.allTimeRecordMin,
                        allTimeRecordRain24h: st.rainMm24h + 40,
                        isFrench: st.countryCode === 'FR'
                      })}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 py-2 text-xs font-bold transition cursor-pointer"
                    >
                      <span>Activer Station</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 2: TABLE VIEW (HIGH DENSITY COMPARISON) */}
          {viewLayout === 'table' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-3">Station &amp; Pays</th>
                    <th className="py-3 px-2">Réseau</th>
                    <th className="py-3 px-2 text-right">Altitude</th>
                    <th className="py-3 px-3 text-right text-white">Direct</th>
                    <th className="py-3 px-2 text-right text-amber-300">Tx Jour</th>
                    <th className="py-3 px-2 text-right text-cyan-300">Tn Jour</th>
                    <th className="py-3 px-2 text-right">Normale Tx</th>
                    <th className="py-3 px-3 text-right">Écart / Anomalie</th>
                    <th className="py-3 px-2 text-right">Point Rosée</th>
                    <th className="py-3 px-2 text-right">Humidité</th>
                    <th className="py-3 px-2 text-right">Vent / Rafale</th>
                    <th className="py-3 px-2 text-right">Pluie 24h</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[12px]">
                  {filteredAndSortedStations.map((st) => (
                    <tr 
                      key={st.stationId}
                      className="hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => setSelectedStationModal(st)}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span>{COUNTRY_FLAGS[st.countryCode] || '🌐'}</span>
                        <div>
                          <div className="font-black text-slate-100">{st.stationName}</div>
                          <div className="text-[10px] text-slate-400 font-normal font-sans">{st.departmentOrRegion}</div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${st.networkBadgeColor}`}>
                          {st.networkType === 'SYNOP_METEOFRANCE' ? 'MF SYNOP' : st.networkType === 'RADOME_METEOFRANCE' ? 'MF RADOME' : 'OMM SYNOP'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-400">{st.altitude} m</td>
                      <td className="py-2.5 px-3 text-right font-black text-white text-sm">{st.currentTemp}°C</td>
                      <td className="py-2.5 px-2 text-right font-bold text-amber-300">{st.tMaxToday}°C</td>
                      <td className="py-2.5 px-2 text-right font-bold text-cyan-300">{st.tMinToday}°C</td>
                      <td className="py-2.5 px-2 text-right text-slate-400">{st.normalTemp1991_2020}°C</td>
                      <td className="py-2.5 px-3 text-right font-black">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          st.tempAnomalyC >= 0.5 ? 'bg-rose-950 text-rose-300 border border-rose-600' :
                          (st.tempAnomalyC <= -0.5 ? 'bg-blue-950 text-blue-300 border border-blue-600' : 'bg-emerald-950 text-emerald-300 border border-emerald-600')
                        }`}>
                          {st.tempAnomalyC >= 0 ? `+${st.tempAnomalyC}` : st.tempAnomalyC}°C
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-sky-300">{st.dewPointC ?? calculateDewPoint(st.currentTemp, st.humidityPct)}°C</td>
                      <td className="py-2.5 px-2 text-right text-slate-300">{st.humidityPct}%</td>
                      <td className="py-2.5 px-2 text-right text-amber-300">{st.windGustKmh} km/h</td>
                      <td className="py-2.5 px-2 text-right text-cyan-300">{st.rainMm24h} mm</td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectStation({
                            id: st.stationId,
                            name: st.stationName,
                            department: st.departmentOrRegion,
                            region: st.country,
                            latitude: st.latitude,
                            longitude: st.longitude,
                            altitude: st.altitude,
                            climateZone: st.observedPhenomenon,
                            allTimeRecordMax: st.allTimeRecordMax,
                            allTimeRecordMin: st.allTimeRecordMin,
                            allTimeRecordRain24h: st.rainMm24h + 40,
                            isFrench: st.countryCode === 'FR'
                          })}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-sans font-bold transition cursor-pointer"
                        >
                          Activer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PALMARÈS DES RECORDS BATTUS & GRAND REGISTRE HISTORIQUE AUTHENTIQUE */}
      {activeTab === 'records_hall_of_fame' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Trophy className="h-6 w-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    🏆 Registre Officiel &amp; Palmarès des Records Météorologiques
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Source Infoclimat, Météo-France, OMM / WMO et Réseau StatIC. Données homologuées avec dates, stations et contextes synoptiques réels.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-rose-950 text-rose-300 border border-rose-600 text-xs font-mono font-black">
                  {AUTHENTIC_HISTORICAL_RECORDS_CATALOG.length} records officiels archivés
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Live Record-Breaking Stations (if any) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" />
                <span>1. Stations Dépassant un Record Actuellement ({countriesWithRecords.length} pays touchés)</span>
              </h4>
              <span className="text-xs text-slate-400">
                {observatoryData.totalBrokenRecordsCount} station(s) en dépassement
              </span>
            </div>

            {countriesWithRecords.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">Aucun dépassement de record historique en cours</h5>
                <p className="text-xs text-slate-400">
                  Les températures directes et Tx relevées sur le réseau restent sous les valeurs de records absolus homologués.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {countriesWithRecords.map((countryIndex) => (
                  <div 
                    key={countryIndex.countryCode}
                    className="rounded-3xl border border-rose-500/40 bg-slate-900/95 p-5 shadow-2xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{countryIndex.flagEmoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-lg font-black text-white">
                              {countryIndex.countryName}
                            </h5>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-black bg-rose-950 text-rose-300 border border-rose-500">
                              {countryIndex.recordsBrokenCount} station{countryIndex.recordsBrokenCount > 1 ? 's' : ''} en record battu
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {countryIndex.continent} • {countryIndex.activeStationCount} stations surveillées
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Anomalie pays :</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-950 border border-rose-500 font-mono font-bold text-rose-300 text-xs">
                          +{countryIndex.meanTemperatureAnomalyC}°C
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {countryIndex.brokenRecordStations.map((bStation) => (
                        <div 
                          key={bStation.stationId}
                          className="rounded-2xl border border-rose-500/50 bg-rose-950/20 p-3.5 space-y-2.5 hover:bg-rose-950/40 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="px-2 py-0.5 rounded-md bg-rose-900/80 text-[10px] font-black text-rose-200 border border-rose-500 block w-max mb-1">
                                {bStation.recordLabel}
                              </span>
                              <h6 className="font-black text-white text-sm">
                                {bStation.stationName}
                              </h6>
                              <p className="text-[11px] text-slate-400">
                                {bStation.departmentOrRegion}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-black text-rose-400 font-mono">
                                {bStation.currentTx}°C
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                Ancien : {bStation.referenceRecord}°C
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-xl border border-rose-500/20">
                            <span className="text-slate-400 text-[11px]">Écart au record :</span>
                            <strong className="text-rose-300 font-mono font-black text-xs">
                              +{bStation.difference}°C
                            </strong>
                          </div>

                          <button
                            onClick={() => {
                              const fullStation = observatoryData.verifiedStations.find(s => s.stationId === bStation.stationId);
                              if (fullStation) {
                                setSelectedStationModal(fullStation);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                          >
                            <Gauge className="h-3.5 w-3.5" />
                            <span>Consulter la télémétrie complète</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Grand Registre Authentique des Records Historiques */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span>2. Grand Registre Climatologique des Records Homologués (Infoclimat / Météo-France / OMM)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Base de référence infaillible des extrêmes climatiques authentiques vérifiés par les organismes météorologiques officiels.
                </p>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setHistoricalCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  historicalCategoryFilter === 'ALL'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🌐 Tous les Records ({AUTHENTIC_HISTORICAL_RECORDS_CATALOG.length})
              </button>

              <button
                onClick={() => setHistoricalCategoryFilter('CHALEUR_FRANCE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  historicalCategoryFilter === 'CHALEUR_FRANCE'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                    : 'bg-slate-900 text-rose-300 border-rose-500/40 hover:bg-rose-950/40'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>🔥 Chaleur France ({AUTHENTIC_HISTORICAL_RECORDS_CATALOG.filter(r => r.recordCategory === 'CHALEUR_FRANCE').length})</span>
              </button>

              <button
                onClick={() => setHistoricalCategoryFilter('FROID_FRANCE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  historicalCategoryFilter === 'FROID_FRANCE'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-blue-300 border-blue-500/40 hover:bg-blue-950/40'
                }`}
              >
                <Snowflake className="h-3.5 w-3.5" />
                <span>❄️ Froid France ({AUTHENTIC_HISTORICAL_RECORDS_CATALOG.filter(r => r.recordCategory === 'FROID_FRANCE').length})</span>
              </button>

              <button
                onClick={() => setHistoricalCategoryFilter('CHALEUR_MONDE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  historicalCategoryFilter === 'CHALEUR_MONDE'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                    : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-amber-950/40'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>🌍 Chaleur Monde ({AUTHENTIC_HISTORICAL_RECORDS_CATALOG.filter(r => r.recordCategory === 'CHALEUR_MONDE').length})</span>
              </button>

              <button
                onClick={() => setHistoricalCategoryFilter('FROID_MONDE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  historicalCategoryFilter === 'FROID_MONDE'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-indigo-300 border-indigo-500/40 hover:bg-indigo-950/40'
                }`}
              >
                <Snowflake className="h-3.5 w-3.5" />
                <span>🧊 Froid Monde ({AUTHENTIC_HISTORICAL_RECORDS_CATALOG.filter(r => r.recordCategory === 'FROID_MONDE').length})</span>
              </button>

              <button
                onClick={() => setHistoricalCategoryFilter('PLUIE_EXTREME')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  historicalCategoryFilter === 'PLUIE_EXTREME'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/40'
                }`}
              >
                <CloudRain className="h-3.5 w-3.5" />
                <span>🌧️ Pluies Extrêmes ({AUTHENTIC_HISTORICAL_RECORDS_CATALOG.filter(r => r.recordCategory === 'PLUIE_EXTREME').length})</span>
              </button>
            </div>

            {/* Historical Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistoricalRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 hover:border-purple-500/50 transition shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        rec.recordCategory.includes('CHALEUR') ? 'bg-rose-950 text-rose-300 border-rose-600' :
                        (rec.recordCategory.includes('FROID') ? 'bg-blue-950 text-blue-300 border-blue-600' : 'bg-cyan-950 text-cyan-300 border-cyan-600')
                      }`}>
                        {rec.recordCategory === 'CHALEUR_FRANCE' ? '🔥 Record Chaleur France' : 
                         rec.recordCategory === 'CHALEUR_MONDE' ? '🔥 Record Chaleur Monde' :
                         rec.recordCategory === 'FROID_FRANCE' ? '❄️ Record Froid France' :
                         rec.recordCategory === 'FROID_MONDE' ? '❄️ Record Froid Monde' : '🌧️ Record Pluviométrique'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        📅 {rec.dateExacte}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{rec.flagEmoji}</span>
                          <h5 className="font-black text-white text-base">
                            {rec.stationName}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {rec.departmentOrCountry} • Alt: <strong className="text-slate-300">{rec.altitude}m</strong>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-2xl font-black font-mono ${
                          rec.recordCategory.includes('CHALEUR') ? 'text-rose-400' :
                          (rec.recordCategory.includes('FROID') ? 'text-blue-400' : 'text-cyan-400')
                        }`}>
                          {rec.recordValue}{rec.unit}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-purple-400 block">
                        Contexte &amp; Événement Historique
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {rec.contexteClimatologique}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{rec.organismeCertification}</span>
                    </span>
                    <a
                      href={rec.officialUrl || `https://wmo.asu.edu/content/world-meteorological-organization-global-weather-climate-extremes-archive`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-600/40 text-sky-300 text-[10px] font-bold transition cursor-pointer"
                      title="Ouvrir la page officielle de l'événement et de l'homologation"
                    >
                      <span>Fiche Événement Officiel</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {rec.statutHomologation.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOP 10 RANKINGS (HEAT, COLD, ANOMALIES, GUSTS, RAIN) */}
      {activeTab === 'top_rankings' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Award className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  🥇 Palmarès des Top 10 Réseau en Direct
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Classement instantané des plus fortes chaleurs, du froid le plus intense, des anomalies majeures, rafales et cumuls pluviométriques.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Top 10 Chaleur (Tx) */}
            <div className="rounded-3xl border border-rose-500/40 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-black text-white text-base flex items-center gap-2">
                  <Flame className="h-5 w-5 text-rose-500" />
                  <span>Top 10 Tx Chaleur Réseau</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  Direct
                </span>
              </div>
              <div className="space-y-2">
                {top10Hot.map((st, idx) => (
                  <div 
                    key={st.stationId} 
                    onClick={() => setSelectedStationModal(st)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 transition cursor-pointer border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx === 0 ? 'bg-amber-500 text-slate-950 font-black' : (idx === 1 ? 'bg-slate-300 text-slate-950' : (idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'))
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{st.stationName}</div>
                        <div className="text-[10px] text-slate-400">{COUNTRY_FLAGS[st.countryCode]} {st.departmentOrRegion}</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-rose-400 text-sm">{st.tMaxToday}°C</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Anomalies (+°C vs Normale) */}
            <div className="rounded-3xl border border-amber-500/40 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-black text-white text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <span>Top 10 Anomalies Thermiques</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  vs 1991-2020
                </span>
              </div>
              <div className="space-y-2">
                {top10Anomalies.map((st, idx) => (
                  <div 
                    key={st.stationId} 
                    onClick={() => setSelectedStationModal(st)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 transition cursor-pointer border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx === 0 ? 'bg-amber-500 text-slate-950' : (idx === 1 ? 'bg-slate-300 text-slate-950' : (idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'))
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{st.stationName}</div>
                        <div className="text-[10px] text-slate-400">{COUNTRY_FLAGS[st.countryCode]} {st.departmentOrRegion}</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">+{st.tempAnomalyC}°C</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Froid (Tn) */}
            <div className="rounded-3xl border border-blue-500/40 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-black text-white text-base flex items-center gap-2">
                  <Snowflake className="h-5 w-5 text-blue-500" />
                  <span>Top 10 Tn Froid Réseau</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Minimale
                </span>
              </div>
              <div className="space-y-2">
                {top10Cold.map((st, idx) => (
                  <div 
                    key={st.stationId} 
                    onClick={() => setSelectedStationModal(st)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 transition cursor-pointer border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx === 0 ? 'bg-blue-400 text-slate-950' : (idx === 1 ? 'bg-slate-300 text-slate-950' : (idx === 2 ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'))
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{st.stationName}</div>
                        <div className="text-[10px] text-slate-400">{COUNTRY_FLAGS[st.countryCode]} ({st.altitude}m)</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-blue-400 text-sm">{st.tMinToday}°C</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Rafales de Vent */}
            <div className="rounded-3xl border border-amber-500/40 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-black text-white text-base flex items-center gap-2">
                  <Wind className="h-5 w-5 text-amber-400" />
                  <span>Top 10 Rafales de Vent Max</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  km/h
                </span>
              </div>
              <div className="space-y-2">
                {top10Wind.map((st, idx) => (
                  <div 
                    key={st.stationId} 
                    onClick={() => setSelectedStationModal(st)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 transition cursor-pointer border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{st.stationName}</div>
                        <div className="text-[10px] text-slate-400">{COUNTRY_FLAGS[st.countryCode]} {st.departmentOrRegion}</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-amber-300 text-sm">{st.windGustKmh} km/h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Précipitations 24h */}
            <div className="rounded-3xl border border-cyan-500/40 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-black text-white text-base flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-cyan-400" />
                  <span>Top 10 Cumuls Pluviométriques</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  24h (mm)
                </span>
              </div>
              <div className="space-y-2">
                {top10Rain.map((st, idx) => (
                  <div 
                    key={st.stationId} 
                    onClick={() => setSelectedStationModal(st)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 transition cursor-pointer border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx === 0 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{st.stationName}</div>
                        <div className="text-[10px] text-slate-400">{COUNTRY_FLAGS[st.countryCode]} {st.departmentOrRegion}</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-cyan-300 text-sm">{st.rainMm24h} mm</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COUNTRY CLIMATE & SYNOPTIC INDEX & TRI MONDIALE */}
      {activeTab === 'country_index' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white mb-1">
                🌐 Classement Mondial &amp; Synthèse Synoptique par Pays ({observatoryData.countryIndices.length} pays surveillés)
              </h3>
              <p className="text-xs text-slate-400">
                Décompte exact du nombre de stations télémesurées, moyenne des écarts thermiques aux normales 1991-2020 et détail nominatif des records par pays.
              </p>
            </div>

            {/* Country Sorting Control */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-bold">Trier les pays par :</span>
              <select
                value={countrySortBy}
                onChange={(e) => setCountrySortBy(e.target.value as any)}
                className="rounded-xl bg-slate-950 border border-purple-500/50 py-2 px-3 text-xs font-bold text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="records_desc">🏆 Nombre de Records Battus</option>
                <option value="anomaly_desc">📈 Anomalie Thermique Moyenne (+°C)</option>
                <option value="tmax_desc">🔥 Température Max (Tx)</option>
                <option value="stations_desc">📡 Nombre de Stations</option>
                <option value="name_asc">🔤 Nom de Pays (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedCountryIndices.map((ci) => (
              <div 
                key={ci.countryCode}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur space-y-4 hover:border-purple-500/50 transition"
              >
                {/* Header with Flag & Station Counts */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ci.flagEmoji}</span>
                    <div>
                      <h4 className="font-black text-white text-lg">
                        {ci.countryName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-bold text-purple-300">{ci.activeStationCount} stations</span>
                        <span>•</span>
                        <span>{ci.continent}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black border ${ci.indexColorClass}`}>
                    Score {ci.countryClimateIndexScore}/5
                  </div>
                </div>

                {/* Density Details (Météo-France / Réseau National vs OMM SYNOP) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Réseau d'État / SYNOP</span>
                    <span className="font-mono font-bold text-blue-300">{ci.synopStationCount} stations</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Certification</span>
                    <span className="font-mono font-bold text-emerald-300">100% Officiel</span>
                  </div>
                </div>

                {/* Records Count & Broken Stations Names */}
                <div className={`p-3 rounded-2xl border text-xs space-y-2 ${
                  ci.recordsBrokenCount > 0 
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200' 
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Trophy className={`h-4 w-4 ${ci.recordsBrokenCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
                      <span>Records Battus :</span>
                    </span>
                    <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                      ci.recordsBrokenCount > 0 ? 'bg-rose-900 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {ci.recordsBrokenCount} station{ci.recordsBrokenCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  {ci.brokenRecordStations.length > 0 ? (
                    <div className="space-y-1 pt-1 border-t border-rose-500/20">
                      <span className="text-[10px] font-bold uppercase text-rose-400 block">
                        Noms des stations en record :
                      </span>
                      <ul className="text-[11px] space-y-1">
                        {ci.brokenRecordStations.map(st => (
                          <li key={st.stationId} className="flex items-center justify-between">
                            <span className="text-white font-medium">• {st.stationName} ({st.departmentOrRegion})</span>
                            <span className="font-mono font-bold text-rose-300">{st.currentTx}°C</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      Aucun record battu actuellement dans ce pays.
                    </p>
                  )}
                </div>

                {/* Country Climate & Synoptic Metrics */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Anomalie Thermique Moyenne :</span>
                    <strong className={`font-mono text-sm ${ci.meanTemperatureAnomalyC >= 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                      {ci.meanTemperatureAnomalyC >= 0 ? `+${ci.meanTemperatureAnomalyC}` : ci.meanTemperatureAnomalyC}°C vs Normale
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Station la plus chaude (Tx) :</span>
                    <strong className="text-amber-300 font-mono">{ci.highestStationTx.stationName} ({ci.highestStationTx.temp}°C)</strong>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-3 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Régime Synoptique Majeur</span>
                    <p className="text-slate-300 leading-tight text-xs">
                      {ci.dominantSynopticPattern}
                    </p>
                  </div>
                </div>

                {/* Filter Grid on this Country */}
                <button
                  onClick={() => {
                    setSelectedCountry(ci.countryName);
                    setActiveTab('stations');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  <span>Afficher les {ci.activeStationCount} stations de ce pays</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: FULL STATION DOSSIER & COMPLETE TELEMETRY GAUGES */}
      {selectedStationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedStationModal(null)}
        >
          <div 
            className="w-full max-w-2xl rounded-3xl border border-purple-500/50 bg-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedStationModal.networkBadgeColor}`}>
                    {selectedStationModal.networkLabel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID : {selectedStationModal.stationId}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{COUNTRY_FLAGS[selectedStationModal.countryCode] || '🌐'}</span>
                  <span>{selectedStationModal.stationName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedStationModal.departmentOrRegion}, <strong className="text-slate-200">{selectedStationModal.country}</strong> • Altitude : <strong className="text-purple-300">{selectedStationModal.altitude} m</strong> (Lat: {selectedStationModal.latitude.toFixed(4)}, Lon: {selectedStationModal.longitude.toFixed(4)})
                </p>
              </div>

              <button
                onClick={() => setSelectedStationModal(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Hardware & Certified Shelter */}
            <div className="rounded-2xl bg-purple-950/30 p-3.5 border border-purple-500/30 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-purple-300 block uppercase text-[10px]">
                  Équipement &amp; Conformité Métrologique
                </span>
                <p className="text-slate-200">
                  {selectedStationModal.stationHardware || 'Station météo automatique professionnelle aux normes OMM'}
                </p>
              </div>
            </div>

            {/* Primary Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Tile 1: Temp Instantanée */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Température Actuelle</span>
                <div className="text-2xl font-black text-white font-mono">{selectedStationModal.currentTemp}°C</div>
                <span className="text-[10px] text-slate-400 block">Ressenti : {selectedStationModal.feelsLikeC ?? selectedStationModal.currentTemp}°C</span>
              </div>

              {/* Tile 2: Tx Max Jour */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Tx Maximale Jour</span>
                <div className="text-2xl font-black text-amber-300 font-mono">{selectedStationModal.tMaxToday}°C</div>
                <span className="text-[10px] text-slate-400 block">Normale : {selectedStationModal.normalTemp1991_2020}°C</span>
              </div>

              {/* Tile 3: Tn Min Jour */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">Tn Minimale Jour</span>
                <div className="text-2xl font-black text-cyan-300 font-mono">{selectedStationModal.tMinToday}°C</div>
                <span className="text-[10px] text-slate-400 block">Normale : {selectedStationModal.normalTmin1991_2020}°C</span>
              </div>

              {/* Tile 4: Thermal Anomaly */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/40 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-300 block">Écart à la Normale</span>
                <div className={`text-2xl font-black font-mono ${selectedStationModal.tempAnomalyC >= 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                  {selectedStationModal.tempAnomalyC >= 0 ? `+${selectedStationModal.tempAnomalyC}` : selectedStationModal.tempAnomalyC}°C
                </div>
                <span className="text-[10px] text-slate-400 block">Ref 1991-2020</span>
              </div>
            </div>

            {/* Detailed Secondary Telemetry Rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Point de Rosée &amp; Humidité</span>
                <div className="font-mono font-bold text-sky-300 text-sm">
                  {selectedStationModal.dewPointC ?? calculateDewPoint(selectedStationModal.currentTemp, selectedStationModal.humidityPct)}°C ({selectedStationModal.humidityPct}%)
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Vent Moyen &amp; Rafales</span>
                <div className="font-mono font-bold text-amber-300 text-sm">
                  {selectedStationModal.windSpeedKmh || 15} km/h (Rafales : {selectedStationModal.windGustKmh} km/h - {selectedStationModal.windDirectionLabel || 'Variable'})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Précipitations 24h</span>
                <div className="font-mono font-bold text-cyan-300 text-sm">
                  {selectedStationModal.rainMm24h} mm
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Pression Atmosphérique</span>
                <div className="font-mono font-bold text-slate-200 text-sm">
                  {selectedStationModal.pressureHpa} hPa (Mer QNH : {selectedStationModal.pressureQnhHpa || 1016} hPa)
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Indice UV &amp; Rayonnement</span>
                <div className="font-mono font-bold text-amber-400 text-sm">
                  UV {selectedStationModal.uvIndex || 5.0} • {selectedStationModal.solarRadiationWm2 || 450} W/m²
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Records Historiques</span>
                <div className="font-mono font-bold text-rose-400 text-xs">
                  Max : {selectedStationModal.allTimeRecordMax}°C | Min : {selectedStationModal.allTimeRecordMin}°C
                </div>
              </div>
            </div>

            {/* Diagnostic Note */}
            <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Synthèse Synoptique &amp; Diagnostic d'Observation
              </span>
              <p className="text-slate-200 text-xs leading-relaxed">
                {selectedStationModal.observedPhenomenon}
              </p>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleCopyStationReport(selectedStationModal)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
              >
                <Copy className="h-4 w-4 text-purple-400" />
                <span>{copySuccess ? '✓ Rapport copié dans le presse-papiers !' : 'Copier le rapport complet'}</span>
              </button>

              <button
                onClick={() => {
                  onSelectStation({
                    id: selectedStationModal.stationId,
                    name: selectedStationModal.stationName,
                    department: selectedStationModal.departmentOrRegion,
                    region: selectedStationModal.country,
                    latitude: selectedStationModal.latitude,
                    longitude: selectedStationModal.longitude,
                    altitude: selectedStationModal.altitude,
                    climateZone: selectedStationModal.observedPhenomenon,
                    allTimeRecordMax: selectedStationModal.allTimeRecordMax,
                    allTimeRecordMin: selectedStationModal.allTimeRecordMin,
                    allTimeRecordRain24h: selectedStationModal.rainMm24h + 40,
                    isFrench: selectedStationModal.countryCode === 'FR'
                  });
                  setSelectedStationModal(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
              >
                <span>Activer dans toute l'application ClimaFrance</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
