import { HistoricalYearData, ClimateProjection } from '../types/weather';

export const HISTORICAL_FRANCE_TEMPS: HistoricalYearData[] = [
  { year: 1900, meanTemp: 11.2, anomaly: -1.6, event: "Début du XXe siècle" },
  { year: 1910, meanTemp: 11.0, anomaly: -1.8, event: "Crue centennale de la Seine (1910)" },
  { year: 1920, meanTemp: 11.5, anomaly: -1.3 },
  { year: 1930, meanTemp: 11.7, anomaly: -1.1 },
  { year: 1940, meanTemp: 10.9, anomaly: -1.9, event: "Hiver 1940 très rigoureux" },
  { year: 1947, meanTemp: 12.6, anomaly: -0.2, event: "Été caniculaire historique 1947" },
  { year: 1950, meanTemp: 11.8, anomaly: -1.0 },
  { year: 1956, meanTemp: 10.5, anomaly: -2.3, event: "Vague de grand froid février 1956 (-20°C)" },
  { year: 1960, meanTemp: 11.7, anomaly: -1.1 },
  { year: 1970, meanTemp: 11.6, anomaly: -1.2 },
  { year: 1976, meanTemp: 12.7, anomaly: -0.1, event: "Sécheresse historique 1976" },
  { year: 1980, meanTemp: 11.9, anomaly: -0.9 },
  { year: 1985, meanTemp: 11.1, anomaly: -1.7, event: "Vague de froid janvier 1985" },
  { year: 1990, meanTemp: 13.1, anomaly: +0.3, event: "Début réchauffement net" },
  { year: 1995, meanTemp: 12.9, anomaly: +0.1 },
  { year: 2000, meanTemp: 13.4, anomaly: +0.6 },
  { year: 2003, meanTemp: 14.1, anomaly: +1.3, event: "Canicule historique août 2003" },
  { year: 2005, meanTemp: 13.1, anomaly: +0.3 },
  { year: 2010, meanTemp: 12.6, anomaly: -0.2 },
  { year: 2015, meanTemp: 13.9, anomaly: +1.1, event: "Accord de Paris COP21" },
  { year: 2018, meanTemp: 14.2, anomaly: +1.4, event: "Année très chaude" },
  { year: 2019, meanTemp: 14.0, anomaly: +1.2, event: "Record national 46.0°C à Vérargues" },
  { year: 2020, meanTemp: 14.3, anomaly: +1.5, event: "Année la plus chaude enregistrée à date" },
  { year: 2022, meanTemp: 14.7, anomaly: +1.9, event: "Année record absolu en France (+1.9°C)" },
  { year: 2023, meanTemp: 14.6, anomaly: +1.8, event: "2e année la plus chaude" },
  { year: 2024, meanTemp: 14.5, anomaly: +1.7, event: "Année marquée par des extrêmes de pluie" },
  { year: 2025, meanTemp: 14.8, anomaly: +2.0, event: "Nouvelle référence climatique" },
  { year: 2026, meanTemp: 14.9, anomaly: +2.1, event: "Année en cours" }
];

export const CLIMATE_PROJECTIONS_GIEC: ClimateProjection[] = [
  { year: 2020, rcp45Temp: 14.3, rcp85Temp: 14.3, rcp45Anomaly: 1.5, rcp85Anomaly: 1.5, rcp45HeatDays: 16, rcp85HeatDays: 16 },
  { year: 2030, rcp45Temp: 14.7, rcp85Temp: 15.0, rcp45Anomaly: 1.9, rcp85Anomaly: 2.2, rcp45HeatDays: 22, rcp85HeatDays: 26 },
  { year: 2040, rcp45Temp: 15.1, rcp85Temp: 15.8, rcp45Anomaly: 2.3, rcp85Anomaly: 3.0, rcp45HeatDays: 27, rcp85HeatDays: 34 },
  { year: 2050, rcp45Temp: 15.4, rcp85Temp: 16.5, rcp45Anomaly: 2.6, rcp85Anomaly: 3.7, rcp45HeatDays: 32, rcp85HeatDays: 45 },
  { year: 2060, rcp45Temp: 15.6, rcp85Temp: 17.3, rcp45Anomaly: 2.8, rcp85Anomaly: 4.5, rcp45HeatDays: 35, rcp85HeatDays: 56 },
  { year: 2070, rcp45Temp: 15.7, rcp85Temp: 18.0, rcp45Anomaly: 2.9, rcp85Anomaly: 5.2, rcp45HeatDays: 37, rcp85HeatDays: 68 },
  { year: 2080, rcp45Temp: 15.8, rcp85Temp: 18.7, rcp45Anomaly: 3.0, rcp85Anomaly: 5.9, rcp45HeatDays: 39, rcp85HeatDays: 78 },
  { year: 2090, rcp45Temp: 15.8, rcp85Temp: 19.3, rcp45Anomaly: 3.0, rcp85Anomaly: 6.5, rcp45HeatDays: 40, rcp85HeatDays: 88 },
  { year: 2100, rcp45Temp: 15.9, rcp85Temp: 19.8, rcp45Anomaly: 3.1, rcp85Anomaly: 7.0, rcp45HeatDays: 41, rcp85HeatDays: 98 }
];
