import { SpatialFieldKey, WeatherLayerMode } from '../services/radarGridService';

export interface ColorStop {
  value: number;
  rgba: [number, number, number, number];
}

export interface ColorScaleSpec {
  mode: WeatherLayerMode;
  field: SpatialFieldKey;
  title: string;
  unit: string;
  min: number;
  max: number;
  clampMinZero?: boolean;
  isolineStep?: number;
  isolineMajorStep?: number;
  isolineLabelUnit?: string;
  stops: ColorStop[];
  ticks: { value: number; label: string }[];
  lut: Uint8ClampedArray; // 256 * 4 bytes
}

function buildLut(stops: ColorStop[], min: number, max: number): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 4);
  const range = Math.max(1e-6, max - min);

  for (let i = 0; i < 256; i++) {
    const v = min + (i / 255) * range;
    let s0 = stops[0];
    let s1 = stops[stops.length - 1];

    if (v <= s0.value) {
      s0 = s1 = stops[0];
    } else if (v >= s1.value) {
      s0 = s1 = stops[stops.length - 1];
    } else {
      for (let k = 0; k < stops.length - 1; k++) {
        if (v >= stops[k].value && v <= stops[k + 1].value) {
          s0 = stops[k];
          s1 = stops[k + 1];
          break;
        }
      }
    }

    const span = Math.max(1e-6, s1.value - s0.value);
    const t = s0 === s1 ? 0 : Math.max(0, Math.min(1, (v - s0.value) / span));

    lut[i * 4] = Math.round(s0.rgba[0] + (s1.rgba[0] - s0.rgba[0]) * t);
    lut[i * 4 + 1] = Math.round(s0.rgba[1] + (s1.rgba[1] - s0.rgba[1]) * t);
    lut[i * 4 + 2] = Math.round(s0.rgba[2] + (s1.rgba[2] - s0.rgba[2]) * t);
    lut[i * 4 + 3] = Math.round(s0.rgba[3] + (s1.rgba[3] - s0.rgba[3]) * t);
  }

  return lut;
}

function createSpec(raw: Omit<ColorScaleSpec, 'lut'>): ColorScaleSpec {
  return {
    ...raw,
    lut: buildLut(raw.stops, raw.min, raw.max)
  };
}

// Meteociel / Météo60 High-Resolution Precipitation Color Scale (mm/h)
const PRECIP_SCALE = createSpec({
  mode: 'radar',
  field: 'precip',
  title: 'Précipitations & Réflectivité Radar',
  unit: 'mm/h',
  min: 0,
  max: 35,
  clampMinZero: true,
  isolineStep: 2,
  isolineLabelUnit: '',
  stops: [
    { value: 0.0, rgba: [0, 0, 0, 0] },
    { value: 0.08, rgba: [56, 189, 248, 0] },
    { value: 0.15, rgba: [56, 189, 248, 175] },
    { value: 0.5, rgba: [14, 165, 233, 210] },
    { value: 1.2, rgba: [37, 99, 235, 225] },
    { value: 2.5, rgba: [34, 197, 94, 230] },
    { value: 5.0, rgba: [163, 230, 53, 235] },
    { value: 8.5, rgba: [250, 204, 21, 240] },
    { value: 13.0, rgba: [249, 115, 22, 245] },
    { value: 20.0, rgba: [220, 38, 38, 250] },
    { value: 28.0, rgba: [217, 70, 239, 252] },
    { value: 35.0, rgba: [107, 33, 168, 255] }
  ],
  ticks: [
    { value: 0.1, label: '0.1' },
    { value: 0.5, label: '0.5' },
    { value: 1, label: '1' },
    { value: 2.5, label: '2.5' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20' },
    { value: 30, label: '30+' }
  ]
});

// Meteociel / ECMWF 2m Temperature Color Scale (°C)
const TEMP_2M_SCALE = createSpec({
  mode: 'temperatures',
  field: 'temp2m',
  title: 'Températures à 2 m & Isothermes',
  unit: '°C',
  min: -24,
  max: 42,
  isolineStep: 2,
  isolineMajorStep: 4,
  isolineLabelUnit: '°',
  stops: [
    { value: -24, rgba: [109, 40, 217, 235] },
    { value: -16, rgba: [67, 56, 202, 230] },
    { value: -8, rgba: [37, 99, 235, 225] },
    { value: -2, rgba: [14, 165, 233, 220] },
    { value: 2, rgba: [34, 211, 238, 215] },
    { value: 6, rgba: [16, 185, 129, 210] },
    { value: 11, rgba: [132, 204, 22, 215] },
    { value: 16, rgba: [234, 179, 8, 220] },
    { value: 22, rgba: [249, 115, 22, 228] },
    { value: 28, rgba: [239, 68, 68, 235] },
    { value: 35, rgba: [185, 28, 28, 240] },
    { value: 42, rgba: [131, 24, 67, 245] }
  ],
  ticks: [
    { value: -20, label: '-20' },
    { value: -12, label: '-12' },
    { value: -4, label: '-4' },
    { value: 0, label: '0°' },
    { value: 4, label: '4' },
    { value: 8, label: '8' },
    { value: 12, label: '12' },
    { value: 16, label: '16' },
    { value: 20, label: '20' },
    { value: 26, label: '26' },
    { value: 32, label: '32' },
    { value: 40, label: '40°C' }
  ]
});

// Meteociel / ECMWF 850 hPa Air Mass Temperature Color Scale (°C)
const TEMP_850_SCALE = createSpec({
  mode: 'temp850',
  field: 'temp850',
  title: 'Masse d’Air 850 hPa (~1500 m)',
  unit: '°C',
  min: -22,
  max: 26,
  isolineStep: 2,
  isolineMajorStep: 4,
  isolineLabelUnit: '°',
  stops: [
    { value: -22, rgba: [126, 34, 206, 235] },
    { value: -14, rgba: [59, 130, 246, 230] },
    { value: -8, rgba: [6, 182, 212, 220] },
    { value: -4, rgba: [20, 184, 166, 215] },
    { value: 0, rgba: [74, 222, 128, 215] },
    { value: 4, rgba: [190, 242, 100, 218] },
    { value: 8, rgba: [250, 204, 21, 225] },
    { value: 12, rgba: [249, 115, 22, 232] },
    { value: 18, rgba: [220, 38, 38, 240] },
    { value: 26, rgba: [157, 23, 77, 248] }
  ],
  ticks: [
    { value: -20, label: '-20' },
    { value: -12, label: '-12' },
    { value: -8, label: '-8' },
    { value: -4, label: '-4' },
    { value: 0, label: '0°' },
    { value: 4, label: '4' },
    { value: 8, label: '8' },
    { value: 12, label: '12' },
    { value: 16, label: '16' },
    { value: 24, label: '24°C' }
  ]
});

// Wind Speed & Streamlines Color Scale (km/h)
const WIND_SCALE = createSpec({
  mode: 'wind',
  field: 'windSpeed',
  title: 'Champ de Vent 10m & Lignes de Flux',
  unit: 'km/h',
  min: 0,
  max: 130,
  clampMinZero: true,
  isolineStep: 15,
  isolineLabelUnit: '',
  stops: [
    { value: 0, rgba: [30, 58, 138, 80] },
    { value: 12, rgba: [14, 165, 233, 155] },
    { value: 25, rgba: [20, 184, 166, 195] },
    { value: 40, rgba: [34, 197, 94, 215] },
    { value: 55, rgba: [234, 179, 8, 228] },
    { value: 75, rgba: [249, 115, 22, 238] },
    { value: 95, rgba: [220, 38, 38, 245] },
    { value: 115, rgba: [217, 70, 239, 250] },
    { value: 130, rgba: [126, 34, 206, 252] }
  ],
  ticks: [
    { value: 0, label: '0' },
    { value: 20, label: '20' },
    { value: 40, label: '40' },
    { value: 60, label: '60' },
    { value: 80, label: '80' },
    { value: 100, label: '100' },
    { value: 120, label: '120+ km/h' }
  ]
});

// Synoptic Mean Sea Level Pressure & Isobars (hPa)
const PRESSURE_SCALE = createSpec({
  mode: 'pressure',
  field: 'pressure',
  title: 'Pression Atmosphérique & Isobares (MSLP)',
  unit: 'hPa',
  min: 965,
  max: 1045,
  isolineStep: 4,
  isolineMajorStep: 8,
  isolineLabelUnit: '',
  stops: [
    { value: 965, rgba: [147, 51, 234, 225] },
    { value: 980, rgba: [59, 130, 246, 215] },
    { value: 995, rgba: [6, 182, 212, 200] },
    { value: 1008, rgba: [45, 212, 191, 180] },
    { value: 1015, rgba: [163, 230, 53, 175] },
    { value: 1024, rgba: [250, 204, 21, 190] },
    { value: 1034, rgba: [249, 115, 22, 210] },
    { value: 1045, rgba: [220, 38, 38, 225] }
  ],
  ticks: [
    { value: 970, label: '970' },
    { value: 985, label: '985' },
    { value: 1000, label: '1000' },
    { value: 1013, label: '1013' },
    { value: 1020, label: '1020' },
    { value: 1030, label: '1030' },
    { value: 1040, label: '1040 hPa' }
  ]
});

// Convective CAPE Instability & Storm Potential (J/kg)
const CAPE_SCALE = createSpec({
  mode: 'lightning',
  field: 'cape',
  title: 'Instabilité Convective CAPE & Foudre',
  unit: 'J/kg',
  min: 0,
  max: 3500,
  clampMinZero: true,
  isolineStep: 500,
  isolineLabelUnit: '',
  stops: [
    { value: 0, rgba: [0, 0, 0, 0] },
    { value: 80, rgba: [34, 197, 94, 0] },
    { value: 250, rgba: [74, 222, 128, 165] },
    { value: 600, rgba: [250, 204, 21, 205] },
    { value: 1100, rgba: [249, 115, 22, 225] },
    { value: 1800, rgba: [239, 68, 68, 240] },
    { value: 2600, rgba: [217, 70, 239, 245] },
    { value: 3500, rgba: [126, 34, 206, 252] }
  ],
  ticks: [
    { value: 100, label: '100' },
    { value: 300, label: '300' },
    { value: 600, label: '600' },
    { value: 1000, label: '1000' },
    { value: 1500, label: '1500' },
    { value: 2500, label: '2500' },
    { value: 3500, label: '3500 J/kg' }
  ]
});

// Snowfall Rate (cm/h)
const SNOW_SCALE = createSpec({
  mode: 'snow',
  field: 'snow',
  title: 'Chutes de Neige & Massifs',
  unit: 'cm/h',
  min: 0,
  max: 12,
  clampMinZero: true,
  stops: [
    { value: 0, rgba: [0, 0, 0, 0] },
    { value: 0.05, rgba: [165, 243, 252, 0] },
    { value: 0.2, rgba: [103, 232, 249, 180] },
    { value: 0.8, rgba: [56, 189, 248, 210] },
    { value: 2.0, rgba: [59, 130, 246, 225] },
    { value: 4.5, rgba: [139, 92, 246, 235] },
    { value: 8.0, rgba: [217, 70, 239, 245] },
    { value: 12.0, rgba: [244, 63, 94, 250] }
  ],
  ticks: [
    { value: 0.1, label: '0.1' },
    { value: 0.5, label: '0.5' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 4, label: '4' },
    { value: 8, label: '8' },
    { value: 12, label: '12+ cm/h' }
  ]
});

// Cloud Cover Percentage (%)
const CLOUDS_SCALE = createSpec({
  mode: 'satellite',
  field: 'clouds',
  title: 'Nébulosité Totale & Satellite',
  unit: '%',
  min: 0,
  max: 100,
  clampMinZero: true,
  stops: [
    { value: 0, rgba: [0, 0, 0, 0] },
    { value: 12, rgba: [148, 163, 184, 0] },
    { value: 35, rgba: [186, 200, 216, 110] },
    { value: 65, rgba: [226, 232, 240, 170] },
    { value: 90, rgba: [248, 250, 252, 215] },
    { value: 100, rgba: [255, 255, 255, 235] }
  ],
  ticks: [
    { value: 0, label: '0%' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' }
  ]
});

export const COLOR_SCALES: Record<WeatherLayerMode, ColorScaleSpec> = {
  radar: PRECIP_SCALE,
  temperatures: TEMP_2M_SCALE,
  temp850: TEMP_850_SCALE,
  wind: WIND_SCALE,
  pressure: PRESSURE_SCALE,
  lightning: CAPE_SCALE,
  snow: SNOW_SCALE,
  satellite: CLOUDS_SCALE
};

/**
 * Generates CSS linear-gradient string for the Meteociel-style continuous colorbar legend.
 */
export function getScaleCssGradient(spec: ColorScaleSpec): string {
  const range = Math.max(1e-6, spec.max - spec.min);
  const parts = spec.stops.map((st) => {
    const pct = Math.max(0, Math.min(100, ((st.value - spec.min) / range) * 100));
    const alpha = Math.max(0.2, st.rgba[3] / 255);
    return `rgba(${st.rgba[0]}, ${st.rgba[1]}, ${st.rgba[2]}, ${alpha.toFixed(2)}) ${pct.toFixed(1)}%`;
  });
  return `linear-gradient(90deg, ${parts.join(', ')})`;
}
