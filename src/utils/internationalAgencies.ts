/**
 * Official Meteorological Services and High-Resolution Models Catalog Worldwide
 * Grounded in World Meteorological Organization (WMO / OMM) standard networks.
 */

export interface MeteorologicalAgencyInfo {
  countryCode: string;
  countryName: string;
  agencyName: string;
  agencyShort: string;
  flag: string;
  officialModels: string[];
  radarNetworkName: string;
  sourceType: 'SYNOP_WMO_CERTIFIED' | 'NATIONAL_WEATHER_SERVICE' | 'ICAO_METAR_SYNOP';
}

export const OFFICIAL_METEOROLOGICAL_AGENCIES: Record<string, MeteorologicalAgencyInfo> = {
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    agencyName: 'Météo-France',
    agencyShort: 'Météo-France',
    flag: '🇫🇷',
    officialModels: ['AROME 1.3km HD', 'ARPEGE 0.1°', 'ECMWF IFS 9km'],
    radarNetworkName: 'Réseau Radar Doppler ARAMIS (33 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  US: {
    countryCode: 'US',
    countryName: 'États-Unis',
    agencyName: 'National Oceanic and Atmospheric Administration (NOAA / NWS)',
    agencyShort: 'NOAA / NWS',
    flag: '🇺🇸',
    officialModels: ['HRRR 3km Convective', 'GFS 13km', 'NAM 12km', 'ECMWF IFS'],
    radarNetworkName: 'NEXRAD WSR-88D Doppler Dual-Pol (160 stations)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Allemagne',
    agencyName: 'Deutscher Wetterdienst (DWD)',
    agencyShort: 'DWD',
    flag: '🇩🇪',
    officialModels: ['ICON-D2 2.2km', 'ICON-EU 6.5km', 'ECMWF IFS'],
    radarNetworkName: 'DWD Radarverbund Doppler (17 stations)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  GB: {
    countryCode: 'GB',
    countryName: 'Royaume-Uni',
    agencyName: 'Met Office (Royaume-Uni)',
    agencyShort: 'Met Office',
    flag: '🇬🇧',
    officialModels: ['UKV 1.5km HD', 'Met Office Global 10km', 'ECMWF IFS'],
    radarNetworkName: 'Met Office Weather Radar Network (18 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  ES: {
    countryCode: 'ES',
    countryName: 'Espagne',
    agencyName: 'Agencia Estatal de Meteorología (AEMET)',
    agencyShort: 'AEMET',
    flag: '🇪🇸',
    officialModels: ['HARMONIE-AROME 2.5km', 'ECMWF IFS 9km', 'GFS'],
    radarNetworkName: 'Red de Radares AEMET (15 radars C-band)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  IT: {
    countryCode: 'IT',
    countryName: 'Italie',
    agencyName: 'Servizio Meteorologico dell\'Aeronautica Militare',
    agencyShort: 'Servizio Met Aeronautica',
    flag: '🇮🇹',
    officialModels: ['COSMO-2I 2.2km', 'COSMO-5M', 'ECMWF IFS'],
    radarNetworkName: 'Rete Radar Nazionale DPC / Aeronautica (24 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  CH: {
    countryCode: 'CH',
    countryName: 'Suisse',
    agencyName: 'Office Fédéral de Météorologie et Climatologie (MétéoSuisse)',
    agencyShort: 'MétéoSuisse',
    flag: '🇨🇭',
    officialModels: ['COSMO-1E 1.1km Alpin', 'ICON-CH1-EPS', 'ECMWF IFS'],
    radarNetworkName: 'Réseau Radars Alpins MétéoSuisse (5 radars Doppler C-band)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  BE: {
    countryCode: 'BE',
    countryName: 'Belgique',
    agencyName: 'Institut Royal Météorologique de Belgique (IRM / KMI)',
    agencyShort: 'IRM / KMI',
    flag: '🇧🇪',
    officialModels: ['ALARO-0 4km', 'AROME 1.3km', 'ECMWF IFS'],
    radarNetworkName: 'Radars Doppler Wideumont, Jabbeke & Herten',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    agencyName: 'Environnement et Changement Climatique Canada (ECCC)',
    agencyShort: 'ECCC Météo Canada',
    flag: '🇨🇦',
    officialModels: ['HRDPS 2.5km', 'RDPS 10km', 'GDPS GEM 15km'],
    radarNetworkName: 'Réseau Canadien de Radars Météorologiques (31 radars S-band)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  JP: {
    countryCode: 'JP',
    countryName: 'Japon',
    agencyName: 'Japan Meteorological Agency (JMA 気象庁)',
    agencyShort: 'JMA 気象庁',
    flag: '🇯🇵',
    officialModels: ['MSM Meso-Scale 5km', 'LFM Local 2km', 'GSM Global 13km'],
    radarNetworkName: 'JMA Doppler Radar & X-Band MP-Radar Network (46 stations)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australie',
    agencyName: 'Bureau of Meteorology (BOM Australia)',
    agencyShort: 'BOM Australia',
    flag: '🇦🇺',
    officialModels: ['ACCESS-C 1.5km City', 'ACCESS-G 12km', 'ECMWF IFS'],
    radarNetworkName: 'BOM National Doppler Radar Network (64 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brésil',
    agencyName: 'Instituto Nacional de Meteorologia (INMET / CPTEC)',
    agencyShort: 'INMET Brasil',
    flag: '🇧🇷',
    officialModels: ['CPTEC BRAMS 5km', 'GFS 13km', 'ECMWF IFS'],
    radarNetworkName: 'Rede de Radares Meteorológicos CEMADEN / REDEMET',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  MA: {
    countryCode: 'MA',
    countryName: 'Maroc',
    agencyName: 'Direction Générale de la Météorologie (DGM Maroc)',
    agencyShort: 'DGM Maroc',
    flag: '🇲🇦',
    officialModels: ['AL BACHIR 2.5km', 'ARPEGE', 'ECMWF IFS'],
    radarNetworkName: 'Réseau National de Radars Doppler DGM (6 stations)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  SE: {
    countryCode: 'SE',
    countryName: 'Suède',
    agencyName: 'Sveriges Meteorologiska och Hydrologiska Institut (SMHI)',
    agencyShort: 'SMHI Suède',
    flag: '🇸🇪',
    officialModels: ['Harmonie-Arome 2.5km Nordic', 'ECMWF IFS'],
    radarNetworkName: 'SMHI Nordic Weather Radar Network',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  NO: {
    countryCode: 'NO',
    countryName: 'Norvège',
    agencyName: 'Meteorologisk Institutt (MET Norway / Yr)',
    agencyShort: 'MET Norway (Yr)',
    flag: '🇳🇴',
    officialModels: ['MEPS 2.5km Nordic', 'ECMWF IFS'],
    radarNetworkName: 'Nasjonalt Værradarnettverk MET Norway (12 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  PT: {
    countryCode: 'PT',
    countryName: 'Portugal',
    agencyName: 'Instituto Português do Mar e da Atmosfera (IPMA)',
    agencyShort: 'IPMA Portugal',
    flag: '🇵🇹',
    officialModels: ['AROME-Portugal 2.5km', 'ECMWF IFS'],
    radarNetworkName: 'Rede de Radares Meteorológicos IPMA (Coruche, Cruz do Leão)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  NL: {
    countryCode: 'NL',
    countryName: 'Pays-Bas',
    agencyName: 'Koninklijk Nederlands Meteorologisch Instituut (KNMI)',
    agencyShort: 'KNMI Pays-Bas',
    flag: '🇳🇱',
    officialModels: ['Harmonie-Arome 2.5km', 'ECMWF IFS'],
    radarNetworkName: 'KNMI Dual-Pol Radars (De Bilt & Den Helder)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  AT: {
    countryCode: 'AT',
    countryName: 'Autriche',
    agencyName: 'GeoSphere Austria (ZAMG)',
    agencyShort: 'GeoSphere Austria',
    flag: '🇦🇹',
    officialModels: ['AROME-Autriche 1.2km', 'INCA Nowcasting', 'ECMWF IFS'],
    radarNetworkName: 'Austro Control Wetterradar Netzwerk (5 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  ZA: {
    countryCode: 'ZA',
    countryName: 'Afrique du Sud',
    agencyName: 'South African Weather Service (SAWS)',
    agencyShort: 'SAWS Météo',
    flag: '🇿🇦',
    officialModels: ['Unified Model SA 4.4km', 'ECMWF IFS', 'GFS'],
    radarNetworkName: 'SAWS National S-Band Doppler Network',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  IN: {
    countryCode: 'IN',
    countryName: 'Inde',
    agencyName: 'India Meteorological Department (IMD / MoES)',
    agencyShort: 'IMD India',
    flag: '🇮🇳',
    officialModels: ['NCUM 12km', 'WRF-IMD 3km', 'ECMWF IFS'],
    radarNetworkName: 'IMD Doppler Weather Radar Network (DWR 37 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  CN: {
    countryCode: 'CN',
    countryName: 'Chine',
    agencyName: 'China Meteorological Administration (CMA 中国气象局)',
    agencyShort: 'CMA 中国气象局',
    flag: '🇨🇳',
    officialModels: ['CMA-GFS 10km', 'CMA-MESO 3km', 'ECMWF IFS'],
    radarNetworkName: 'CINRAD New Generation Weather Radar Network (216 radars)',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  AR: {
    countryCode: 'AR',
    countryName: 'Argentine',
    agencyName: 'Servicio Meteorológico Nacional (SMN Argentina)',
    agencyShort: 'SMN Argentina',
    flag: '🇦🇷',
    officialModels: ['WRF-SMN 4km', 'GFS', 'ECMWF IFS'],
    radarNetworkName: 'SINARAME Sistema Nacional de Radares Meteorológicos',
    sourceType: 'NATIONAL_WEATHER_SERVICE'
  },
  AQ: {
    countryCode: 'AQ',
    countryName: 'Antarctique',
    agencyName: 'Organisation Météorologique Mondiale & Traité sur l\'Antarctique (SCAR)',
    agencyShort: 'OMM / SCAR Polaire',
    flag: '🇦🇶',
    officialModels: ['AMPS Antarctic Mesoscale 4km', 'ECMWF IFS', 'GFS'],
    radarNetworkName: 'Stations SYNOP Polaires Automatiques (AWS USAP / BAS)',
    sourceType: 'SYNOP_WMO_CERTIFIED'
  }
};

export function getOfficialAgencyForLocation(countryCode?: string, countryName?: string): MeteorologicalAgencyInfo {
  if (countryCode && OFFICIAL_METEOROLOGICAL_AGENCIES[countryCode.toUpperCase()]) {
    return OFFICIAL_METEOROLOGICAL_AGENCIES[countryCode.toUpperCase()];
  }
  
  if (countryName) {
    const norm = countryName.toLowerCase();
    for (const key of Object.keys(OFFICIAL_METEOROLOGICAL_AGENCIES)) {
      const ag = OFFICIAL_METEOROLOGICAL_AGENCIES[key];
      if (ag.countryName.toLowerCase().includes(norm) || norm.includes(ag.countryName.toLowerCase())) {
        return ag;
      }
    }
  }

  // Global WMO Fallback
  return {
    countryCode: 'WMO',
    countryName: countryName || 'International',
    agencyName: 'Organisation Météorologique Mondiale (OMM / WMO Synop Network)',
    agencyShort: 'OMM / WMO Synop',
    flag: '🌍',
    officialModels: ['ECMWF IFS 9km (Centre Européen)', 'NOAA GFS 13km (Mondial)', 'DWD ICON 13km'],
    radarNetworkName: 'Réseau International de Télédétection & Radars Nationaux WMO',
    sourceType: 'SYNOP_WMO_CERTIFIED'
  };
}
