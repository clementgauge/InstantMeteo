export type TimeOfDay = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
export type AtmosphereMode = 'AUTO' | 'CUSTOM';

export interface AtmosphereThemeConfig {
  id: string;
  timeOfDay: TimeOfDay;
  season: Season;
  name: string;
  subtitle: string;
  skyToneLabel: string;
  iconName: 'Sun' | 'Moon' | 'Sunrise' | 'Sunset' | 'CloudSun' | 'Sparkles' | 'Snowflake' | 'Leaf' | 'CloudRain' | 'CloudLightning' | 'Cloud' | 'CloudFog';
  bgGradient: string;
  meshGlowPrimary: string;
  meshGlowSecondary: string;
  accentBorder: string;
  glowAccentColor: string;
  particleType: 'stars' | 'sunflare' | 'embers' | 'frost' | 'petals' | 'mist' | 'snowflakes' | 'rain' | 'thunder';
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
  };
  cardHighlightBorder: string;
  lightingIntensity: number; // 0 (darkest night) to 1 (brightest midday)
}

export interface EphemerisInfo {
  sunrise: string;
  solarNoon: string;
  sunset: string;
  civilDusk: string;
  dayLengthFormatted: string;
  sunElevationDeg: number;
}
