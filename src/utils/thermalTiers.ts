import { ThermalTierDefinition, PrecipitationClarityDiagnostic } from '../types/weather';

export const THERMAL_TIERS: ThermalTierDefinition[] = [
  {
    tierId: 'DEEP_FREEZE',
    name: 'Grand Froid & Gel Sévère',
    tempRangeLabel: 'Inférieur à -5°C',
    minTemp: -50,
    maxTemp: -5.1,
    colorHex: '#6366f1',
    tailwindBg: 'bg-indigo-950/80',
    tailwindText: 'text-indigo-300',
    tailwindBorder: 'border-indigo-500/50',
    iconEmoji: '❄️',
    description: 'Gelée sévère en plaine ou montagne. Froid vif pénétrant.',
    clothingAdvice: 'Parka grand froid, sous-vêtements thermiques, bonnet couvrant les oreilles, gants étanches.',
    healthComfortNotice: 'Risque accru pour personnes vulnérables. Risque d\'engelures en cas de vent fort (refroidissement éolien).',
    agriculturalImpact: 'Risque de gel en profondeur, risque pour les canalisations non calorifugées et les cultures sensibles.'
  },
  {
    tierId: 'FROST',
    name: 'Gel Léger à Modéré',
    tempRangeLabel: '-5°C à 0°C',
    minTemp: -5.0,
    maxTemp: 0.0,
    colorHex: '#38bdf8',
    tailwindBg: 'bg-sky-950/80',
    tailwindText: 'text-sky-300',
    tailwindBorder: 'border-sky-500/50',
    iconEmoji: '🧊',
    description: 'Gelée sous abri. Formation fréquente de gelées blanches et de verglas matinal.',
    clothingAdvice: 'Manteau chaud d\'hiver, écharpe, gants et chaussures à semelles isolantes antidérapantes.',
    healthComfortNotice: 'Attention aux chutes sur les trottoirs et chaussées glissantes. Bien aérer son logement aux heures chaudes.',
    agriculturalImpact: 'Gelées blanches au sol. Risque de dégâts sur les bourgeons au printemps et les légumes d\'hiver.'
  },
  {
    tierId: 'VERY_COLD',
    name: 'Très Frais / Froid d\'Hiver',
    tempRangeLabel: '0.1°C à 7°C',
    minTemp: 0.1,
    maxTemp: 7.0,
    colorHex: '#0ea5e9',
    tailwindBg: 'bg-cyan-950/80',
    tailwindText: 'text-cyan-300',
    tailwindBorder: 'border-cyan-500/50',
    iconEmoji: '🧣',
    description: 'Froid positif. Ressenti piquant le matin avec humidité élevée ou bise.',
    clothingAdvice: 'Manteau d\'hiver ou anorak mi-saison doublé, pull en laine, coupe-vent.',
    healthComfortNotice: 'Période propice à la propagation des virus hivernaux. Conserver une température intérieure à 19°C.',
    agriculturalImpact: 'Végétation au repos hivernal. Faible évapotranspiration.'
  },
  {
    tierId: 'COOL',
    name: 'Frais de Mi-Saison',
    tempRangeLabel: '7.1°C à 13°C',
    minTemp: 7.1,
    maxTemp: 13.0,
    colorHex: '#14b8a6',
    tailwindBg: 'bg-teal-950/80',
    tailwindText: 'text-teal-300',
    tailwindBorder: 'border-teal-500/50',
    iconEmoji: '🧥',
    description: 'Fraîcheur printanière ou automnale. Température vivifiante pour les activités dynamiques.',
    clothingAdvice: 'Veste de mi-saison, pull léger ou sweat, pantalon classique.',
    healthComfortNotice: 'Conditions optimales pour les sports d\'endurance (course à pied, cyclisme, randonnée).',
    agriculturalImpact: 'Reprise progressive de la végétation printanière ou ralentissement automnal.'
  },
  {
    tierId: 'MILD',
    name: 'Doux & Tempéré',
    tempRangeLabel: '13.1°C à 19°C',
    minTemp: 13.1,
    maxTemp: 19.0,
    colorHex: '#10b981',
    tailwindBg: 'bg-emerald-950/80',
    tailwindText: 'text-emerald-300',
    tailwindBorder: 'border-emerald-500/50',
    iconEmoji: '⛅',
    description: 'Grande douceur. Confort thermique équilibré sans nécessité de chauffage intensif.',
    clothingAdvice: 'Vêtement léger avec gilet d\'appoint le matin ou en soirée.',
    healthComfortNotice: 'Excellent confort physiologique. Activités de plein air très agréables.',
    agriculturalImpact: 'Croissance active des cultures et des jardins. Arrosage modéré nécessaire.'
  },
  {
    tierId: 'COMFORT',
    name: 'Agréable / Confort Idéal',
    tempRangeLabel: '19.1°C à 24°C',
    minTemp: 19.1,
    maxTemp: 24.0,
    colorHex: '#84cc16',
    tailwindBg: 'bg-lime-950/80',
    tailwindText: 'text-lime-300',
    tailwindBorder: 'border-lime-500/50',
    iconEmoji: '☀️',
    description: 'Zone de confort thermique optimale pour le corps humain. Chaleur douce sans transpiration.',
    clothingAdvice: 'T-shirt, chemise en coton, vêtements légers d\'été.',
    healthComfortNotice: 'Bien-être maximal. Pensez à la protection solaire (chapeau, crème) si l\'indice UV est > 5.',
    agriculturalImpact: 'Activité photosynthétique maximale. Évapotranspiration soutenue.'
  },
  {
    tierId: 'WARM',
    name: 'Chaud / Chaleur Estivale',
    tempRangeLabel: '24.1°C à 29°C',
    minTemp: 24.1,
    maxTemp: 29.0,
    colorHex: '#f59e0b',
    tailwindBg: 'bg-amber-950/80',
    tailwindText: 'text-amber-300',
    tailwindBorder: 'border-amber-500/50',
    iconEmoji: '🌤️',
    description: 'Chaleur marquée. Ambiance estivale franche avec convection thermique dans les terres.',
    clothingAdvice: 'Vêtements très légers, amples et respirants. Lunettes de soleil et casquette.',
    healthComfortNotice: 'Boire régulièrement (1.5L à 2L d\'eau par jour). Éviter les efforts intenses en plein soleil entre 12h et 16h.',
    agriculturalImpact: 'Stress hydrique débutant pour les sols peu profonds. Arrosage recommandé le soir.'
  },
  {
    tierId: 'HOT',
    name: 'Très Chaud / Forte Chaleur',
    tempRangeLabel: '29.1°C à 34°C',
    minTemp: 29.1,
    maxTemp: 34.0,
    colorHex: '#f97316',
    tailwindBg: 'bg-orange-950/80',
    tailwindText: 'text-orange-300',
    tailwindBorder: 'border-orange-500/50',
    iconEmoji: '🌡️',
    description: 'Forte chaleur. Seuil d\'alerte biométéorologique et déclenchement possible de la vigilance canicule jaune/orange.',
    clothingAdvice: 'Vêtements clairs ultralégers, lin ou matières naturelles amples.',
    healthComfortNotice: 'Limiter les sorties aux heures les plus chaudes. Mouiller la peau, fermer les volets le jour et aérer la nuit.',
    agriculturalImpact: 'Forte évapotranspiration (> 5 mm/j). Risque d\'échaudage des cultures.'
  },
  {
    tierId: 'HEATWAVE',
    name: 'Canicule / Chaleur Extrême',
    tempRangeLabel: 'Supérieur à 34°C',
    minTemp: 34.1,
    maxTemp: 60,
    colorHex: '#ef4444',
    tailwindBg: 'bg-rose-950/80',
    tailwindText: 'text-rose-300',
    tailwindBorder: 'border-rose-500/60',
    iconEmoji: '🔥',
    description: 'Chaleur caniculaire extrême. Risque sanitaire sérieux pour l\'ensemble de la population.',
    clothingAdvice: 'Minimum de vêtements, matières amples et respirantes.',
    healthComfortNotice: 'Vigilance absolue : hydratation permanente, repos, rechercher les lieux climatisés ou ombragés.',
    agriculturalImpact: 'Stress hydrique critique. Risque majeur d\'incendie de forêt.'
  }
];

export function getThermalTierForTemp(temp: number): ThermalTierDefinition {
  if (temp <= -5.1) return THERMAL_TIERS[0];
  if (temp <= 0.0) return THERMAL_TIERS[1];
  if (temp <= 7.0) return THERMAL_TIERS[2];
  if (temp <= 13.0) return THERMAL_TIERS[3];
  if (temp <= 19.0) return THERMAL_TIERS[4];
  if (temp <= 24.0) return THERMAL_TIERS[5];
  if (temp <= 29.0) return THERMAL_TIERS[6];
  if (temp <= 34.0) return THERMAL_TIERS[7];
  return THERMAL_TIERS[8];
}

export function getCompassDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const sectors = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  const index = Math.round(normalized / 22.5) % 16;
  return sectors[index];
}

export function getRainIntensityDiagnostic(rainMmPerHour: number, proba: number = 50): {
  category: 'SEC' | 'BRUINE' | 'PLUIE_FAIBLE' | 'PLUIE_MODEREE' | 'FORTE_PLUIE' | 'ORAGE_TORRENTIEL';
  label: string;
  waterEquivalentLitersM2: number;
  groundStatus: string;
  guidance: string;
} {
  const mm = Number(rainMmPerHour.toFixed(1));
  if (mm <= 0.05) {
    return {
      category: 'SEC',
      label: 'Temps Sec (0.0 mm/h)',
      waterEquivalentLitersM2: 0,
      groundStatus: 'Sol sec ou en cours de séchage',
      guidance: 'Aucun équipement pluie requis. Activités extérieures idéales.'
    };
  }
  if (mm < 0.5) {
    return {
      category: 'BRUINE',
      label: `Bruine fine / Gouttes éparses (${mm} mm/h = ${mm} L/m²)`,
      waterEquivalentLitersM2: mm,
      groundStatus: 'Léger film humide en surface sans ruissellement',
      guidance: 'Sortie possible sans parapluie ou avec un simple coupe-vent déperlant.'
    };
  }
  if (mm < 1.5) {
    return {
      category: 'PLUIE_FAIBLE',
      label: `Pluie faible continue (${mm} mm/h = ${mm} L/m²)`,
      waterEquivalentLitersM2: mm,
      groundStatus: 'Chaussée mouillée, apparition de légères flaques',
      guidance: 'Parapluie ou capuche recommandés. Conduite sans difficulté majeure.'
    };
  }
  if (mm < 4.0) {
    return {
      category: 'PLUIE_MODEREE',
      label: `Pluie modérée régulière (${mm} mm/h = ${mm} L/m²)`,
      waterEquivalentLitersM2: mm,
      groundStatus: 'Flaques nettes et ruissellement modéré dans les caniveaux',
      guidance: 'Parapluie étanche et chaussures imperméables nécessaires.'
    };
  }
  if (mm < 8.0) {
    return {
      category: 'FORTE_PLUIE',
      label: `Forte pluie / Averse soutenue (${mm} mm/h = ${mm} L/m²)`,
      waterEquivalentLitersM2: mm,
      groundStatus: 'Ruissellement abondant, visibilité réduite en voiture',
      guidance: 'Imperméable indispensable. Réduire la vitesse sur route (risque aquaplaning).'
    };
  }
  return {
    category: 'ORAGE_TORRENTIEL',
    label: `Averse orageuse torrentielle (${mm} mm/h = ${mm} L/m²)`,
    waterEquivalentLitersM2: mm,
    groundStatus: 'Saturation rapide des sols et des évacuations pluviales',
    guidance: 'Vigilance accrue. Éviter les passages sous voies inondables et les activités de plein air.'
  };
}
