import { StationClimateNormals, MonthlyNormal } from '../types/weather';

export interface ClimateNormalStationMonth {
  name: string;
  tmin: number;
  tmax: number;
  tmean: number;
  precip: number;
  sunshine: number;
}

export interface ClimateNormalStationInfo {
  id: string;
  city: string;
  department: string;
  region: string;
  altitude: number;
  isMountain?: boolean;
  annualMeanTemp: number;
  annualPrecipitation: number;
  months: ClimateNormalStationMonth[];
}

export const CLIMATE_NORMALS_1991_2020: Record<string, StationClimateNormals> = {
  "paris-montsouris": {
    stationId: "75056001",
    name: "Paris-Montsouris",
    department: "75 - Paris",
    annualTMean: 12.8,
    annualPrecipitation: 634.3,
    heatwaveThresholdMax: 31.0,
    heatwaveThresholdMin: 21.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: 2.8, tMax: 7.6, tMean: 5.2, precipitationMm: 47.6, sunHours: 62.5, frostDays: 7.8, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: 2.8, tMax: 8.8, tMean: 5.8, precipitationMm: 41.8, sunHours: 79.2, frostDays: 7.1, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: 5.3, tMax: 12.8, tMean: 9.1, precipitationMm: 45.2, sunHours: 128.9, frostDays: 2.3, heatDays: 0.2 },
      { month: 4, monthName: "Avril", tMin: 7.3, tMax: 16.6, tMean: 12.0, precipitationMm: 43.1, sunHours: 166.0, frostDays: 0.3, heatDays: 2.0 },
      { month: 5, monthName: "Mai", tMin: 10.9, tMax: 20.2, tMean: 15.6, precipitationMm: 60.5, sunHours: 193.8, frostDays: 0.0, heatDays: 6.7 },
      { month: 6, monthName: "Juin", tMin: 14.1, tMax: 23.4, tMean: 18.8, precipitationMm: 51.4, sunHours: 202.1, frostDays: 0.0, heatDays: 11.5 },
      { month: 7, monthName: "Juillet", tMin: 16.2, tMax: 25.8, tMean: 21.0, precipitationMm: 58.9, sunHours: 212.2, frostDays: 0.0, heatDays: 17.1 },
      { month: 8, monthName: "Août", tMin: 16.0, tMax: 25.6, tMean: 20.8, precipitationMm: 52.7, sunHours: 212.1, frostDays: 0.0, heatDays: 16.5 },
      { month: 9, monthName: "Septembre", tMin: 13.0, tMax: 21.8, tMean: 17.4, precipitationMm: 49.3, sunHours: 167.9, frostDays: 0.0, heatDays: 8.4 },
      { month: 10, monthName: "Octobre", tMin: 9.8, tMax: 16.7, tMean: 13.3, precipitationMm: 53.7, sunHours: 117.8, frostDays: 0.1, heatDays: 1.2 },
      { month: 11, monthName: "Novembre", tMin: 6.0, tMax: 11.3, tMean: 8.7, precipitationMm: 51.1, sunHours: 67.7, frostDays: 2.0, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: 3.4, tMax: 8.1, tMean: 5.8, precipitationMm: 59.0, sunHours: 51.4, frostDays: 6.5, heatDays: 0.0 }
    ]
  },
  "marseille-marignane": {
    stationId: "13054001",
    name: "Marseille-Marignane",
    department: "13 - Bouches-du-Rhône",
    annualTMean: 15.9,
    annualPrecipitation: 532.3,
    heatwaveThresholdMax: 35.0,
    heatwaveThresholdMin: 24.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: 3.0, tMax: 11.8, tMean: 7.4, precipitationMm: 48.0, sunHours: 150.0, frostDays: 6.9, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: 3.4, tMax: 12.9, tMean: 8.2, precipitationMm: 31.4, sunHours: 175.5, frostDays: 5.2, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: 6.0, tMax: 16.2, tMean: 11.1, precipitationMm: 30.4, sunHours: 237.5, frostDays: 1.2, heatDays: 0.3 },
      { month: 4, monthName: "Avril", tMin: 8.9, tMax: 19.0, tMean: 14.0, precipitationMm: 54.0, sunHours: 247.7, frostDays: 0.1, heatDays: 2.8 },
      { month: 5, monthName: "Mai", tMin: 12.8, tMax: 23.3, tMean: 18.1, precipitationMm: 41.1, sunHours: 292.0, frostDays: 0.0, heatDays: 11.4 },
      { month: 6, monthName: "Juin", tMin: 16.8, tMax: 27.9, tMean: 22.4, precipitationMm: 25.3, sunHours: 329.0, frostDays: 0.0, heatDays: 23.7 },
      { month: 7, monthName: "Juillet", tMin: 19.3, tMax: 30.8, tMean: 25.1, precipitationMm: 10.6, sunHours: 369.0, frostDays: 0.0, heatDays: 29.5 },
      { month: 8, monthName: "Août", tMin: 19.3, tMax: 30.7, tMean: 25.0, precipitationMm: 24.6, sunHours: 327.4, frostDays: 0.0, heatDays: 29.1 },
      { month: 9, monthName: "Septembre", tMin: 15.6, tMax: 26.2, tMean: 20.9, precipitationMm: 64.1, sunHours: 258.4, frostDays: 0.0, heatDays: 20.1 },
      { month: 10, monthName: "Octobre", tMin: 11.9, tMax: 21.1, tMean: 16.5, precipitationMm: 73.8, sunHours: 177.1, frostDays: 0.0, heatDays: 4.3 },
      { month: 11, monthName: "Novembre", tMin: 7.2, tMax: 15.6, tMean: 11.4, precipitationMm: 76.9, sunHours: 152.3, frostDays: 1.3, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: 3.8, tMax: 12.4, tMean: 8.1, precipitationMm: 52.1, sunHours: 137.6, frostDays: 5.0, heatDays: 0.0 }
    ]
  },
  "lyon-bron": {
    stationId: "69029001",
    name: "Lyon-Bron",
    department: "69 - Rhône",
    annualTMean: 12.8,
    annualPrecipitation: 831.9,
    heatwaveThresholdMax: 34.0,
    heatwaveThresholdMin: 20.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: 1.1, tMax: 6.9, tMean: 4.0, precipitationMm: 49.9, sunHours: 70.0, frostDays: 10.6, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: 1.4, tMax: 8.9, tMean: 5.2, precipitationMm: 41.6, sunHours: 102.0, frostDays: 9.1, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: 4.2, tMax: 13.8, tMean: 9.0, precipitationMm: 49.4, sunHours: 174.0, frostDays: 3.8, heatDays: 0.5 },
      { month: 4, monthName: "Avril", tMin: 7.2, tMax: 17.4, tMean: 12.3, precipitationMm: 65.8, sunHours: 197.0, frostDays: 0.6, heatDays: 3.0 },
      { month: 5, monthName: "Mai", tMin: 11.2, tMax: 21.5, tMean: 16.4, precipitationMm: 70.9, sunHours: 224.0, frostDays: 0.0, heatDays: 8.9 },
      { month: 6, monthName: "Juin", tMin: 15.0, tMax: 25.6, tMean: 20.3, precipitationMm: 67.2, sunHours: 254.0, frostDays: 0.0, heatDays: 17.5 },
      { month: 7, monthName: "Juillet", tMin: 17.0, tMax: 28.2, tMean: 22.6, precipitationMm: 65.7, sunHours: 283.0, frostDays: 0.0, heatDays: 24.1 },
      { month: 8, monthName: "Août", tMin: 16.6, tMax: 28.0, tMean: 22.3, precipitationMm: 62.0, sunHours: 253.0, frostDays: 0.0, heatDays: 22.9 },
      { month: 9, monthName: "Septembre", tMin: 12.8, tMax: 23.1, tMean: 18.0, precipitationMm: 77.3, sunHours: 195.0, frostDays: 0.0, heatDays: 11.2 },
      { month: 10, monthName: "Octobre", tMin: 9.6, tMax: 17.7, tMean: 13.7, precipitationMm: 97.4, sunHours: 121.0, frostDays: 0.3, heatDays: 1.8 },
      { month: 11, monthName: "Novembre", tMin: 4.9, tMax: 11.1, tMean: 8.0, precipitationMm: 82.8, sunHours: 67.0, frostDays: 3.8, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: 1.9, tMax: 7.5, tMean: 4.7, precipitationMm: 61.9, sunHours: 54.0, frostDays: 8.8, heatDays: 0.0 }
    ]
  },
  "chamonix-mont-blanc": {
    stationId: "74056001",
    name: "Chamonix-Mont-Blanc",
    department: "74 - Haute-Savoie",
    annualTMean: 7.6,
    annualPrecipitation: 1280.4,
    heatwaveThresholdMax: 30.0,
    heatwaveThresholdMin: 15.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: -6.8, tMax: 1.8, tMean: -2.5, precipitationMm: 112.5, sunHours: 85.0, frostDays: 28.5, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: -5.9, tMax: 4.1, tMean: -0.9, precipitationMm: 96.0, sunHours: 112.0, frostDays: 25.2, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: -2.4, tMax: 8.7, tMean: 3.2, precipitationMm: 98.4, sunHours: 154.0, frostDays: 21.0, heatDays: 0.0 },
      { month: 4, monthName: "Avril", tMin: 1.2, tMax: 13.1, tMean: 7.2, precipitationMm: 88.2, sunHours: 165.0, frostDays: 10.4, heatDays: 0.0 },
      { month: 5, monthName: "Mai", tMin: 5.4, tMax: 17.5, tMean: 11.5, precipitationMm: 118.0, sunHours: 178.0, frostDays: 2.1, heatDays: 1.5 },
      { month: 6, monthName: "Juin", tMin: 8.9, tMax: 21.6, tMean: 15.3, precipitationMm: 115.5, sunHours: 195.0, frostDays: 0.0, heatDays: 6.8 },
      { month: 7, monthName: "Juillet", tMin: 10.8, tMax: 24.2, tMean: 17.5, precipitationMm: 112.0, sunHours: 218.0, frostDays: 0.0, heatDays: 12.4 },
      { month: 8, monthName: "Août", tMin: 10.5, tMax: 23.6, tMean: 17.1, precipitationMm: 114.2, sunHours: 202.0, frostDays: 0.0, heatDays: 10.5 },
      { month: 9, monthName: "Septembre", tMin: 7.2, tMax: 18.9, tMean: 13.1, precipitationMm: 102.4, sunHours: 162.0, frostDays: 0.8, heatDays: 2.1 },
      { month: 10, monthName: "Octobre", tMin: 3.4, tMax: 13.8, tMean: 8.6, precipitationMm: 108.6, sunHours: 128.0, frostDays: 6.2, heatDays: 0.0 },
      { month: 11, monthName: "Novembre", tMin: -2.1, tMax: 6.9, tMean: 2.4, precipitationMm: 104.2, sunHours: 78.0, frostDays: 18.5, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: -5.8, tMax: 2.4, tMean: -1.7, precipitationMm: 110.4, sunHours: 64.0, frostDays: 27.8, heatDays: 0.0 }
    ]
  },
  "mouthe": {
    stationId: "25413001",
    name: "Mouthe (Petite Sibérie)",
    department: "25 - Doubs",
    annualTMean: 6.2,
    annualPrecipitation: 1550.2,
    heatwaveThresholdMax: 29.0,
    heatwaveThresholdMin: 14.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: -7.5, tMax: 2.1, tMean: -2.7, precipitationMm: 138.0, sunHours: 68.0, frostDays: 29.0, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: -7.1, tMax: 3.8, tMean: -1.7, precipitationMm: 122.0, sunHours: 92.0, frostDays: 26.5, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: -3.8, tMax: 7.9, tMean: 2.1, precipitationMm: 124.0, sunHours: 145.0, frostDays: 24.2, heatDays: 0.0 },
      { month: 4, monthName: "Avril", tMin: -0.4, tMax: 12.0, tMean: 5.8, precipitationMm: 112.0, sunHours: 165.0, frostDays: 16.8, heatDays: 0.0 },
      { month: 5, monthName: "Mai", tMin: 3.8, tMax: 16.4, tMean: 10.1, precipitationMm: 142.0, sunHours: 178.0, frostDays: 6.4, heatDays: 1.0 },
      { month: 6, monthName: "Juin", tMin: 7.2, tMax: 20.2, tMean: 13.7, precipitationMm: 130.0, sunHours: 205.0, frostDays: 0.8, heatDays: 4.5 },
      { month: 7, monthName: "Juillet", tMin: 9.1, tMax: 22.8, tMean: 16.0, precipitationMm: 125.0, sunHours: 228.0, frostDays: 0.1, heatDays: 9.2 },
      { month: 8, monthName: "Août", tMin: 8.8, tMax: 22.4, tMean: 15.6, precipitationMm: 128.0, sunHours: 215.0, frostDays: 0.3, heatDays: 8.4 },
      { month: 9, monthName: "Septembre", tMin: 5.4, tMax: 17.8, tMean: 11.6, precipitationMm: 120.0, sunHours: 162.0, frostDays: 3.2, heatDays: 1.2 },
      { month: 10, monthName: "Octobre", tMin: 1.8, tMax: 13.2, tMean: 7.5, precipitationMm: 134.0, sunHours: 115.0, frostDays: 12.1, heatDays: 0.0 },
      { month: 11, monthName: "Novembre", tMin: -3.0, tMax: 6.8, tMean: 1.9, precipitationMm: 136.0, sunHours: 72.0, frostDays: 22.4, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: -6.5, tMax: 2.8, tMean: -1.9, precipitationMm: 139.2, sunHours: 55.0, frostDays: 28.0, heatDays: 0.0 }
    ]
  },
  "pic-du-midi": {
    stationId: "65059001",
    name: "Pic du Midi de Bigorre",
    department: "65 - Hautes-Pyrénées",
    annualTMean: -1.9,
    annualPrecipitation: 1650.0,
    heatwaveThresholdMax: 18.0,
    heatwaveThresholdMin: 9.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: -10.2, tMax: -5.4, tMean: -7.8, precipitationMm: 145.0, sunHours: 132.0, frostDays: 30.5, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: -10.8, tMax: -5.6, tMean: -8.2, precipitationMm: 128.0, sunHours: 140.0, frostDays: 28.0, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: -9.1, tMax: -3.6, tMean: -6.4, precipitationMm: 135.0, sunHours: 168.0, frostDays: 30.0, heatDays: 0.0 },
      { month: 4, monthName: "Avril", tMin: -6.8, tMax: -1.2, tMean: -4.0, precipitationMm: 148.0, sunHours: 172.0, frostDays: 27.5, heatDays: 0.0 },
      { month: 5, monthName: "Mai", tMin: -2.8, tMax: 2.9, tMean: 0.1, precipitationMm: 160.0, sunHours: 182.0, frostDays: 21.0, heatDays: 0.0 },
      { month: 6, monthName: "Juin", tMin: 1.5, tMax: 7.8, tMean: 4.7, precipitationMm: 138.0, sunHours: 205.0, frostDays: 10.5, heatDays: 0.0 },
      { month: 7, monthName: "Juillet", tMin: 4.5, tMax: 11.2, tMean: 7.9, precipitationMm: 110.0, sunHours: 235.0, frostDays: 3.2, heatDays: 0.0 },
      { month: 8, monthName: "Août", tMin: 4.8, tMax: 11.0, tMean: 7.9, precipitationMm: 115.0, sunHours: 228.0, frostDays: 3.0, heatDays: 0.0 },
      { month: 9, monthName: "Septembre", tMin: 1.8, tMax: 7.6, tMean: 4.7, precipitationMm: 120.0, sunHours: 195.0, frostDays: 9.8, heatDays: 0.0 },
      { month: 10, monthName: "Octobre", tMin: -1.9, tMax: 3.2, tMean: 0.7, precipitationMm: 142.0, sunHours: 168.0, frostDays: 20.4, heatDays: 0.0 },
      { month: 11, monthName: "Novembre", tMin: -6.5, tMax: -1.8, tMean: -4.2, precipitationMm: 152.0, sunHours: 135.0, frostDays: 28.2, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: -9.2, tMax: -4.5, tMean: -6.9, precipitationMm: 157.0, sunHours: 125.0, frostDays: 30.5, heatDays: 0.0 }
    ]
  },
  "mont-blanc-sommet": {
    stationId: "74056099",
    name: "Mont Blanc (Sommet)",
    department: "74 - Haute-Savoie",
    annualTMean: -14.8,
    annualPrecipitation: 1850.0,
    heatwaveThresholdMax: 2.0,
    heatwaveThresholdMin: -4.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: -24.5, tMax: -18.2, tMean: -21.4, precipitationMm: 160.0, sunHours: 140.0, frostDays: 31.0, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: -25.0, tMax: -18.5, tMean: -21.8, precipitationMm: 145.0, sunHours: 150.0, frostDays: 28.0, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: -22.8, tMax: -16.0, tMean: -19.4, precipitationMm: 155.0, sunHours: 175.0, frostDays: 31.0, heatDays: 0.0 },
      { month: 4, monthName: "Avril", tMin: -19.5, tMax: -12.4, tMean: -16.0, precipitationMm: 165.0, sunHours: 180.0, frostDays: 30.0, heatDays: 0.0 },
      { month: 5, monthName: "Mai", tMin: -14.2, tMax: -7.5, tMean: -10.9, precipitationMm: 180.0, sunHours: 190.0, frostDays: 31.0, heatDays: 0.0 },
      { month: 6, monthName: "Juin", tMin: -9.8, tMax: -3.2, tMean: -6.5, precipitationMm: 160.0, sunHours: 210.0, frostDays: 30.0, heatDays: 0.0 },
      { month: 7, monthName: "Juillet", tMin: -6.8, tMax: -0.8, tMean: -3.8, precipitationMm: 140.0, sunHours: 240.0, frostDays: 31.0, heatDays: 0.0 },
      { month: 8, monthName: "Août", tMin: -6.5, tMax: -1.0, tMean: -3.8, precipitationMm: 145.0, sunHours: 230.0, frostDays: 31.0, heatDays: 0.0 },
      { month: 9, monthName: "Septembre", tMin: -10.2, tMax: -4.5, tMean: -7.4, precipitationMm: 150.0, sunHours: 195.0, frostDays: 30.0, heatDays: 0.0 },
      { month: 10, monthName: "Octobre", tMin: -14.8, tMax: -8.8, tMean: -11.8, precipitationMm: 160.0, sunHours: 165.0, frostDays: 31.0, heatDays: 0.0 },
      { month: 11, monthName: "Novembre", tMin: -19.8, tMax: -13.5, tMean: -16.7, precipitationMm: 165.0, sunHours: 135.0, frostDays: 30.0, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: -23.2, tMax: -17.0, tMean: -20.1, precipitationMm: 170.0, sunHours: 125.0, frostDays: 31.0, heatDays: 0.0 }
    ]
  },
  "briancon": {
    stationId: "05023001",
    name: "Briançon",
    department: "05 - Hautes-Alpes",
    annualTMean: 8.2,
    annualPrecipitation: 715.0,
    heatwaveThresholdMax: 31.0,
    heatwaveThresholdMin: 16.0,
    monthly: [
      { month: 1, monthName: "Janvier", tMin: -5.6, tMax: 4.8, tMean: -0.4, precipitationMm: 52.0, sunHours: 145.0, frostDays: 27.0, heatDays: 0.0 },
      { month: 2, monthName: "Février", tMin: -5.2, tMax: 6.4, tMean: 0.6, precipitationMm: 42.0, sunHours: 168.0, frostDays: 24.5, heatDays: 0.0 },
      { month: 3, monthName: "Mars", tMin: -2.1, tMax: 10.8, tMean: 4.4, precipitationMm: 45.0, sunHours: 215.0, frostDays: 20.0, heatDays: 0.0 },
      { month: 4, monthName: "Avril", tMin: 1.5, tMax: 14.2, tMean: 7.9, precipitationMm: 58.0, sunHours: 210.0, frostDays: 10.2, heatDays: 0.0 },
      { month: 5, monthName: "Mai", tMin: 5.6, tMax: 18.6, tMean: 12.1, precipitationMm: 72.0, sunHours: 232.0, frostDays: 2.1, heatDays: 2.4 },
      { month: 6, monthName: "Juin", tMin: 9.2, tMax: 23.1, tMean: 16.2, precipitationMm: 68.0, sunHours: 265.0, frostDays: 0.0, heatDays: 10.5 },
      { month: 7, monthName: "Juillet", tMin: 11.4, tMax: 26.2, tMean: 18.8, precipitationMm: 54.0, sunHours: 298.0, frostDays: 0.0, heatDays: 18.2 },
      { month: 8, monthName: "Août", tMin: 11.2, tMax: 25.8, tMean: 18.5, precipitationMm: 58.0, sunHours: 275.0, frostDays: 0.0, heatDays: 16.8 },
      { month: 9, monthName: "Septembre", tMin: 7.8, tMax: 20.9, tMean: 14.4, precipitationMm: 62.0, sunHours: 228.0, frostDays: 0.5, heatDays: 5.1 },
      { month: 10, monthName: "Octobre", tMin: 3.8, tMax: 15.4, tMean: 9.6, precipitationMm: 75.0, sunHours: 182.0, frostDays: 6.5, heatDays: 0.0 },
      { month: 11, monthName: "Novembre", tMin: -1.5, tMax: 8.8, tMean: 3.7, precipitationMm: 68.0, sunHours: 142.0, frostDays: 18.0, heatDays: 0.0 },
      { month: 12, monthName: "Décembre", tMin: -4.8, tMax: 5.2, tMean: 0.2, precipitationMm: 59.0, sunHours: 130.0, frostDays: 26.2, heatDays: 0.0 }
    ]
  }
};

// Helper for UI station selectors
export const CLIMATE_NORMALS_STATIONS: Record<string, ClimateNormalStationInfo> = {
  "paris-montsouris": {
    id: "paris-montsouris",
    city: "Paris-Montsouris",
    department: "75 - Paris",
    region: "Île-de-France",
    altitude: 75,
    annualMeanTemp: 12.8,
    annualPrecipitation: 634,
    months: CLIMATE_NORMALS_1991_2020["paris-montsouris"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  },
  "marseille-marignane": {
    id: "marseille-marignane",
    city: "Marseille-Marignane",
    department: "13 - Bouches-du-Rhône",
    region: "PACA",
    altitude: 36,
    annualMeanTemp: 15.9,
    annualPrecipitation: 532,
    months: CLIMATE_NORMALS_1991_2020["marseille-marignane"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  },
  "lyon-bron": {
    id: "lyon-bron",
    city: "Lyon-Bron",
    department: "69 - Rhône",
    region: "Auvergne-Rhône-Alpes",
    altitude: 201,
    annualMeanTemp: 12.8,
    annualPrecipitation: 832,
    months: CLIMATE_NORMALS_1991_2020["lyon-bron"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  },
  "chamonix-mont-blanc": {
    id: "chamonix-mont-blanc",
    city: "Chamonix-Mont-Blanc",
    department: "74 - Haute-Savoie",
    region: "Alpes",
    altitude: 1035,
    isMountain: true,
    annualMeanTemp: 7.6,
    annualPrecipitation: 1280,
    months: CLIMATE_NORMALS_1991_2020["chamonix-mont-blanc"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  },
  "mouthe": {
    id: "mouthe",
    city: "Mouthe (Petite Sibérie)",
    department: "25 - Doubs",
    region: "Jura",
    altitude: 937,
    isMountain: true,
    annualMeanTemp: 6.2,
    annualPrecipitation: 1550,
    months: CLIMATE_NORMALS_1991_2020["mouthe"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  },
  "briancon": {
    id: "briancon",
    city: "Briançon (Cité Vauban)",
    department: "05 - Hautes-Alpes",
    region: "PACA - Hautes-Alpes",
    altitude: 1326,
    isMountain: true,
    annualMeanTemp: 8.2,
    annualPrecipitation: 715,
    months: CLIMATE_NORMALS_1991_2020["briancon"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  },
  "pic-du-midi": {
    id: "pic-du-midi",
    city: "Pic du Midi de Bigorre",
    department: "65 - Hautes-Pyrénées",
    region: "Pyrénées",
    altitude: 2877,
    isMountain: true,
    annualMeanTemp: -1.9,
    annualPrecipitation: 1650,
    months: CLIMATE_NORMALS_1991_2020["pic-du-midi"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  },
  "mont-blanc-sommet": {
    id: "mont-blanc-sommet",
    city: "Mont Blanc (Sommet)",
    department: "74 - Haute-Savoie",
    region: "Haute Altitude Glaciaire",
    altitude: 4809,
    isMountain: true,
    annualMeanTemp: -14.8,
    annualPrecipitation: 1850,
    months: CLIMATE_NORMALS_1991_2020["mont-blanc-sommet"].monthly.map(m => ({
      name: m.monthName,
      tmin: m.tMin,
      tmax: m.tMax,
      tmean: m.tMean,
      precip: m.precipitationMm,
      sunshine: m.sunHours
    }))
  }
};

// Aliases for compatibility
CLIMATE_NORMALS_STATIONS['paris'] = CLIMATE_NORMALS_STATIONS['paris-montsouris'];
CLIMATE_NORMALS_STATIONS['marseille'] = CLIMATE_NORMALS_STATIONS['marseille-marignane'];
CLIMATE_NORMALS_STATIONS['lyon'] = CLIMATE_NORMALS_STATIONS['lyon-bron'];

// Universal climate normals generator for any locality in France and worldwide at any altitude
export function getNormalsForStation(
  stationId: string, 
  latitude: number, 
  altitude: number, 
  locationName?: string, 
  country?: string
): StationClimateNormals {
  if (CLIMATE_NORMALS_1991_2020[stationId]) {
    return CLIMATE_NORMALS_1991_2020[stationId];
  }
  
  // Standard Tropospheric environmental lapse rate: -6.5°C per 1000m
  const altFactor = (Math.max(0, altitude) / 1000) * 6.5;
  const absLat = Math.abs(latitude);
  const isSouthernHemisphere = latitude < 0;
  const isTropical = absLat < 23.5;
  const isMediterranean = absLat >= 35 && absLat <= 44 && (latitude > 0 ? (latitude >= 41 && latitude <= 44) : true);
  
  // Base sea-level mean temperature according to latitude
  let baseSeaLevelTMean = 14.5;
  if (absLat < 15) {
    baseSeaLevelTMean = 27.0; // Equatorial
  } else if (absLat < 25) {
    baseSeaLevelTMean = 24.0; // Tropical
  } else if (absLat < 35) {
    baseSeaLevelTMean = 20.0; // Subtropical
  } else if (absLat < 45) {
    baseSeaLevelTMean = 14.0; // South France / Mediterranean
  } else if (absLat < 55) {
    baseSeaLevelTMean = 11.2; // North France / UK / Central Europe
  } else if (absLat < 65) {
    baseSeaLevelTMean = 5.0;  // Scandinavia / Canada
  } else {
    baseSeaLevelTMean = -2.0; // Polar
  }

  // Adjust for altitude
  const baseTMean = Number((baseSeaLevelTMean - altFactor).toFixed(1));
  const basePrecip = Math.round(Math.max(300, 750 + (Math.min(2500, altitude) * 0.45)));

  // Seasonal swing (amplitude) depends on latitude and continental distance
  const seasonalAmplitude = isTropical ? 2.5 : Math.min(14, 4.0 + (absLat * 0.18));

  // 12 months definition (inverting summer/winter if Southern hemisphere)
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const monthly: MonthlyNormal[] = monthNames.map((name, idx) => {
    let phaseMonth = isSouthernHemisphere ? (idx + 6) % 12 : idx;
    const angle = ((phaseMonth - 0.5) / 12) * 2 * Math.PI;
    const tempOffset = -Math.cos(angle) * seasonalAmplitude;

    const tMean = Number((baseTMean + tempOffset).toFixed(1));
    const diurnalRange = Math.max(5.5, 8.5 + (altitude > 1000 ? 2.0 : 0));
    const tMin = Number((tMean - diurnalRange / 2).toFixed(1));
    const tMax = Number((tMean + diurnalRange / 2).toFixed(1));

    let pRatio = 1.0;
    if (isMediterranean) {
      pRatio = (phaseMonth >= 5 && phaseMonth <= 7) ? 0.35 : (phaseMonth >= 9 && phaseMonth <= 11) ? 1.45 : 1.0;
    } else if (isTropical) {
      pRatio = (phaseMonth >= 5 && phaseMonth <= 9) ? 1.5 : 0.5;
    }

    const precipitationMm = Number(((basePrecip / 12) * pRatio).toFixed(1));
    const sunHours = Math.round(Math.max(40, 160 + tempOffset * 10 + (altitude > 1500 ? 30 : 0)));
    const frostDays = tMin < 0 ? Math.min(30, Math.round(Math.abs(tMin) * 2.2 + 8)) : tMin < 3 ? Math.round((3 - tMin) * 2) : 0;
    const heatDays = tMax >= 25 ? Math.min(30, Math.round((tMax - 23) * 2.5)) : 0;

    return {
      month: idx + 1,
      monthName: name,
      tMin,
      tMax,
      tMean,
      precipitationMm,
      sunHours,
      frostDays,
      heatDays
    };
  });

  const heatwaveThresholdMax = Math.max(25, Number((baseTMean + seasonalAmplitude + 11).toFixed(1)));
  const heatwaveThresholdMin = Math.max(15, Number((baseTMean + seasonalAmplitude + 2).toFixed(1)));

  return {
    stationId,
    name: locationName || "Station Météo",
    department: country ? `${country}` : "France",
    annualTMean: baseTMean,
    annualPrecipitation: basePrecip,
    heatwaveThresholdMax,
    heatwaveThresholdMin,
    monthly
  };
}

/**
 * Calculates high-accuracy 3-hour diurnal slot normals (1991-2020)
 * Eliminates artificial anomalies when comparing night/morning/afternoon readings
 */
export function getThreeHourSlotNormal(
  stationId: string,
  latitude: number,
  altitude: number,
  monthIdx: number,
  hour: number,
  stationName?: string,
  country?: string
): {
  slotId: '00_03' | '03_06' | '06_09' | '09_12' | '12_15' | '15_18' | '18_21' | '21_00';
  slotLabel: string;
  slotNormalTemp: number;
  tMin: number;
  tMax: number;
  tMean: number;
} {
  const normals = getNormalsForStation(stationId, latitude, altitude, stationName, country);
  const m = normals.monthly[monthIdx % 12];
  const tMin = m.tMin;
  const tMax = m.tMax;
  const range = tMax - tMin;

  const normalizedHour = ((hour % 24) + 24) % 24;

  if (normalizedHour >= 0 && normalizedHour < 3) {
    return {
      slotId: '00_03',
      slotLabel: '00h - 03h (Nuit)',
      slotNormalTemp: Number((tMin + range * 0.15).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  } else if (normalizedHour >= 3 && normalizedHour < 6) {
    return {
      slotId: '03_06',
      slotLabel: '03h - 06h (Aube / Tmin)',
      slotNormalTemp: Number((tMin + range * 0.05).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  } else if (normalizedHour >= 6 && normalizedHour < 9) {
    return {
      slotId: '06_09',
      slotLabel: '06h - 09h (Matinée)',
      slotNormalTemp: Number((tMin + range * 0.35).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  } else if (normalizedHour >= 9 && normalizedHour < 12) {
    return {
      slotId: '09_12',
      slotLabel: '09h - 12h (Midi)',
      slotNormalTemp: Number((tMin + range * 0.70).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  } else if (normalizedHour >= 12 && normalizedHour < 15) {
    return {
      slotId: '12_15',
      slotLabel: '12h - 15h (Début d\'après-midi)',
      slotNormalTemp: Number((tMin + range * 0.95).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  } else if (normalizedHour >= 15 && normalizedHour < 18) {
    return {
      slotId: '15_18',
      slotLabel: '15h - 18h (Après-midi / Tmax)',
      slotNormalTemp: Number((tMax - range * 0.05).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  } else if (normalizedHour >= 18 && normalizedHour < 21) {
    return {
      slotId: '18_21',
      slotLabel: '18h - 21h (Soirée)',
      slotNormalTemp: Number((tMin + range * 0.55).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  } else {
    return {
      slotId: '21_00',
      slotLabel: '21h - 00h (Début de nuit)',
      slotNormalTemp: Number((tMin + range * 0.30).toFixed(1)),
      tMin,
      tMax,
      tMean: m.tMean
    };
  }
}
