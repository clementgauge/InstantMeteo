/**
 * Service Météorologique de Haute Précision pour les Massifs Montagneux Français
 * 
 * Modélisation physique adaptée par massif :
 * 1. Évolution verticale des températures (Lapse rate dynamique & Inversions thermiques de combe)
 * 2. Surventes orographiques & Effet Venturi sur les crêtes et cols
 * 3. Limite Pluie-Neige (LPN) dynamique et abaissement par isothermie sous fortes intensités
 * 4. Paliers d'altitude continus (1000m à 3500m) pour chaque grand massif français
 */

export interface MassifPhysicalProfile {
  id: string;
  name: string;
  domain: 'Alpes du Nord' | 'Alpes du Sud' | 'Pyrénées' | 'Massif Central' | 'Jura' | 'Vosges' | 'Corse';
  representativePeak: string;
  peakAltitudeM: number;
  baseAltitudeM: number;
  combeInversionProne: boolean;
  combeMaxInversionDeltaC: number; // Ex: +6°C en altitude par rapport au fond de cuvette
  standardLapseRatePer100m: number; // -0.65°C / 100m en moyenne
  venturiCrestFactor: number;       // Multiplicateur vent crête vs plaine (ex: 2.2x)
  isothermySensitivity: 'TRÈS FORTE' | 'FORTE' | 'MODÉRÉE';
  foehnRiskAspect: 'S' | 'SW' | 'N' | 'SE' | 'W' | 'E' | 'NW' | 'NE';
  typicalWindName: string;
  topographicRegime: string;
}

export const FRENCH_MOUNTAIN_MASSIFS_PROFILES: MassifPhysicalProfile[] = [
  {
    id: 'alpes-nord-montblanc',
    name: 'Alpes du Nord (Mont-Blanc, Vanoise, Beaufortain)',
    domain: 'Alpes du Nord',
    representativePeak: 'Aiguille du Midi / Mont-Blanc',
    peakAltitudeM: 3842,
    baseAltitudeM: 1035,
    combeInversionProne: true,
    combeMaxInversionDeltaC: 7.5,
    standardLapseRatePer100m: 0.62,
    venturiCrestFactor: 2.4,
    isothermySensitivity: 'TRÈS FORTE',
    foehnRiskAspect: 'S',
    typicalWindName: 'La Bise / Foehn de Sud',
    topographicRegime: 'Massif Interne Glaciaire (Très forte isothermie en vallée encaissée)'
  },
  {
    id: 'alpes-nord-prealpes',
    name: 'Préalpes du Nord (Belledonne, Chartreuse, Vercors, Aravis)',
    domain: 'Alpes du Nord',
    representativePeak: 'Grand Pic de Belledonne',
    peakAltitudeM: 2977,
    baseAltitudeM: 800,
    combeInversionProne: true,
    combeMaxInversionDeltaC: 6.0,
    standardLapseRatePer100m: 0.65,
    venturiCrestFactor: 2.2,
    isothermySensitivity: 'TRÈS FORTE',
    foehnRiskAspect: 'S',
    typicalWindName: 'Vent de Sud en Vercors',
    topographicRegime: 'Préalpes Calcaires (Blocage orographique direct des flux d\'Ouest)'
  },
  {
    id: 'alpes-sud-ecrins-queyras',
    name: 'Alpes du Sud (Écrins, Queyras, Ubaye, Mercantour)',
    domain: 'Alpes du Sud',
    representativePeak: 'Barre des Écrins',
    peakAltitudeM: 4102,
    baseAltitudeM: 1200,
    combeInversionProne: true,
    combeMaxInversionDeltaC: 8.0,
    standardLapseRatePer100m: 0.68,
    venturiCrestFactor: 2.3,
    isothermySensitivity: 'FORTE',
    foehnRiskAspect: 'SE',
    typicalWindName: 'La Lombarde (Retour d\'Est)',
    topographicRegime: 'Climat Sud-Alpin Sec & Ensoleillé (Fort rayonnement et Lombarde)'
  },
  {
    id: 'pyrenees-centre-occidentales',
    name: 'Pyrénées (Aspe, Ossau, Bigorre, Luchonnais)',
    domain: 'Pyrénées',
    representativePeak: 'Pic du Midi de Bigorre / Vignemale',
    peakAltitudeM: 3298,
    baseAltitudeM: 900,
    combeInversionProne: true,
    combeMaxInversionDeltaC: 6.5,
    standardLapseRatePer100m: 0.64,
    venturiCrestFactor: 2.5,
    isothermySensitivity: 'FORTE',
    foehnRiskAspect: 'S',
    typicalWindName: 'Vent d\'Espagne (Foehn violent)',
    topographicRegime: 'Chaîne Barrière Frontière (Effet de Foehn spectaculaire au Nord)'
  },
  {
    id: 'massif-central-sancy-cantal',
    name: 'Massif Central (Sancy, Cantal, Mézenc, Forez)',
    domain: 'Massif Central',
    representativePeak: 'Puy de Sancy / Plomb du Cantal',
    peakAltitudeM: 1885,
    baseAltitudeM: 1000,
    combeInversionProne: true,
    combeMaxInversionDeltaC: 5.5,
    standardLapseRatePer100m: 0.66,
    venturiCrestFactor: 2.1,
    isothermySensitivity: 'MODÉRÉE',
    foehnRiskAspect: 'SW',
    typicalWindName: 'L\'Écir (Vent glacial avec poudrerie)',
    topographicRegime: 'Moyenne Montagne Océanique de Plateau (Givre et congères intenses)'
  },
  {
    id: 'jura-haut-jura',
    name: 'Massif du Jura (Crêt de la Neige, Reculet, Val de Mouthe)',
    domain: 'Jura',
    representativePeak: 'Crêt de la Neige / Mont Tendre',
    peakAltitudeM: 1720,
    baseAltitudeM: 950,
    combeInversionProne: true,
    combeMaxInversionDeltaC: 12.0, // Combes légendaires de Mouthe (-30°C possibles en inversion)
    standardLapseRatePer100m: 0.63,
    venturiCrestFactor: 2.0,
    isothermySensitivity: 'FORTE',
    foehnRiskAspect: 'SW',
    typicalWindName: 'La Bise Noire jurassienne',
    topographicRegime: 'Combes Synclinales Fermées (Pôles du froid d\'inversion radiative)'
  },
  {
    id: 'vosges-hautes-cretes',
    name: 'Vosges (Hohneck, Grand Ballon, Ballon d\'Alsace)',
    domain: 'Vosges',
    representativePeak: 'Grand Ballon / Hohneck',
    peakAltitudeM: 1424,
    baseAltitudeM: 700,
    combeInversionProne: false,
    combeMaxInversionDeltaC: 4.5,
    standardLapseRatePer100m: 0.65,
    venturiCrestFactor: 2.2,
    isothermySensitivity: 'MODÉRÉE',
    foehnRiskAspect: 'W',
    typicalWindName: 'Vent des Crêtes d\'Alsace',
    topographicRegime: 'Crêtes Granitiques Éventées (Fort contraste Ouest pluvieux / Est sec)'
  },
  {
    id: 'corse-monte-cinto',
    name: 'Montagne Corse (Monte Cinto, Rotondo, Renoso, Bavella)',
    domain: 'Corse',
    representativePeak: 'Monte Cinto',
    peakAltitudeM: 2706,
    baseAltitudeM: 600,
    combeInversionProne: true,
    combeMaxInversionDeltaC: 6.0,
    standardLapseRatePer100m: 0.69,
    venturiCrestFactor: 2.6,
    isothermySensitivity: 'FORTE',
    foehnRiskAspect: 'SW',
    typicalWindName: 'Le Libeccio violent',
    topographicRegime: 'Montagne Maritime Méditerranéenne (Tempêtes de crête et névés persistants)'
  }
];

export interface MountainAltitudeStageCalculation {
  altitudeM: number;
  stageLabel: string;
  temperatureC: number;
  windChillC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  precipPhase: 'Pluie liquide' | 'Pluie & Neige mêlées' | 'Neige humide lourde' | 'Neige froide sèche poudreuse' | 'Temps sec / Nuageux';
  snowRatePerHourCm: number;
  isAboveLpn: boolean;
  isAboveIso0: boolean;
  airDensityKgM3: number;
  microclimaticNote: string;
}

export interface MassifAdaptiveDiagnosis {
  massif: MassifPhysicalProfile;
  baseTempC: number;
  peakTempC: number;
  synopticIsoZeroM: number;
  wetBulbZeroM: number;
  effectiveLpnM: number;
  isothermyDropM: number;
  isothermyAlert: boolean;
  baseWindKmh: number;
  crestWindKmh: number;
  crestGustKmh: number;
  venturiAccelerationPct: number;
  verticalLapseRateCPer100m: number;
  isInversionActive: boolean;
  inversionDeltaC: number;
  foehnRiskActive: boolean;
  tacticalAdvice: string;
  altitudeStages: MountainAltitudeStageCalculation[];
}

/**
 * Calcule une simulation physique complète et adaptée pour un massif donné
 * à partir des prévisions de base du modèle (température plaine, vent de base, pluie, humidité).
 */
export function calculateAdaptiveMassifDiagnosis(
  massifId: string,
  baseStationTemp: number = 10.0,
  baseStationAltitude: number = 300,
  baseWindKmh: number = 20,
  baseHumidityPct: number = 75,
  precipitationMm: number = 2.0,
  isNight: boolean = false
): MassifAdaptiveDiagnosis {
  const massif = FRENCH_MOUNTAIN_MASSIFS_PROFILES.find(m => m.id === massifId) || FRENCH_MOUNTAIN_MASSIFS_PROFILES[0];

  // 1. Détection de l'inversion thermique nocturne de combe
  const isInversionActive = (isNight || new Date().getHours() < 9) && precipitationMm < 0.3 && baseWindKmh < 15;
  const inversionDeltaC = isInversionActive ? massif.combeMaxInversionDeltaC * 0.75 : 0;

  // 2. Gradient thermique vertical adapté (°C / 100m)
  // S'abaisse en atmosphère saturée de pluie (-0.55°C/100m) et monte en air sec (-0.75°C/100m)
  const isMoist = precipitationMm > 0.5 || baseHumidityPct > 80;
  const effectiveLapseRate = isMoist ? massif.standardLapseRatePer100m * 0.90 : massif.standardLapseRatePer100m * 1.10;

  // 3. Calcul de l'Isotherme 0°C et du thermomètre mouillé (Tw = 0°C)
  // Formule psychrométrique simplifiée de Stull pour Tw
  const tBase = baseStationTemp;
  const rh = baseHumidityPct;
  const wetBulbBase = tBase * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) + 
    Math.atan(tBase + rh) - Math.atan(rh - 1.676331) + 
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;

  const standardIsoZeroM = Math.round(baseStationAltitude + (Math.max(0, tBase) / (effectiveLapseRate / 100)));
  const wetBulbZeroM = Math.round(baseStationAltitude + (Math.max(0, wetBulbBase) / (effectiveLapseRate / 100)));

  // 4. Abaissement de la LPN par effet d'isothermie (chaleur latente de fusion des flocons)
  let isothermyDropM = 0;
  if (precipitationMm > 0.4) {
    if (massif.isothermySensitivity === 'TRÈS FORTE') {
      isothermyDropM = Math.min(450, Math.round(precipitationMm * 45 + 120));
    } else if (massif.isothermySensitivity === 'FORTE') {
      isothermyDropM = Math.min(350, Math.round(precipitationMm * 35 + 80));
    } else {
      isothermyDropM = Math.min(250, Math.round(precipitationMm * 25 + 50));
    }
  }

  // La LPN se situe en général ~250m sous l'isotherme 0°C en régime standard,
  // et s'effondre davantage sous forte intensité de précipitations (isothermie)
  const standardLpnM = Math.max(0, standardIsoZeroM - 280);
  const effectiveLpnM = Math.max(baseStationAltitude, standardLpnM - isothermyDropM);

  // 5. Survente éolienne et effet Venturi sur les crêtes
  const venturiAccelerationPct = Math.round((massif.venturiCrestFactor - 1) * 100);
  const crestWindKmh = Math.round(baseWindKmh * massif.venturiCrestFactor);
  const crestGustKmh = Math.round(crestWindKmh * 1.45 + 12);

  // 6. Température au sommet du massif
  const peakDeltaAlt = (massif.peakAltitudeM - baseStationAltitude) / 100;
  const peakTempC = Number((tBase - peakDeltaAlt * effectiveLapseRate + (isInversionActive ? 1.5 : 0)).toFixed(1));
  const baseTempC = Number(tBase.toFixed(1));

  // 7. Risque de Foehn (flux de sud rapide avec faible humidité relative)
  const foehnRiskActive = baseWindKmh > 35 && baseHumidityPct < 45;

  // 8. Calcul des étages altitudinaux remarquables (1000m, 1500m, 2000m, 2500m, 3000m)
  const targetAltitudes = [1000, 1500, 2000, 2500, 3000, massif.peakAltitudeM].filter((v, i, a) => a.indexOf(v) === i && v <= massif.peakAltitudeM);
  
  const altitudeStages: MountainAltitudeStageCalculation[] = targetAltitudes.map(alt => {
    const deltaH = (alt - baseStationAltitude) / 100;
    let tempAtAlt = tBase - deltaH * effectiveLapseRate;
    
    // Inversion de combe appliquée en basse couche
    if (isInversionActive && alt <= massif.baseAltitudeM + 400) {
      tempAtAlt += inversionDeltaC * (1 - (alt - baseStationAltitude) / 400);
    }
    tempAtAlt = Number(tempAtAlt.toFixed(1));

    // Facteur d'altitude sur le vent (progression vers la crête)
    const altRatio = Math.min(1.0, Math.max(0, (alt - baseStationAltitude) / (massif.peakAltitudeM - baseStationAltitude)));
    const stageWind = Math.round(baseWindKmh + (crestWindKmh - baseWindKmh) * altRatio);
    const stageGust = Math.round(stageWind * 1.4);

    // Température ressentie (Wind Chill Siple & Passel / JAG/TI)
    const windChill = stageWind > 5 
      ? Math.round(13.12 + 0.6215 * tempAtAlt - 11.37 * Math.pow(stageWind, 0.16) + 0.3965 * tempAtAlt * Math.pow(stageWind, 0.16))
      : Math.round(tempAtAlt);

    // Détermination de la phase des précipitations
    let phase: MountainAltitudeStageCalculation['precipPhase'] = 'Temps sec / Nuageux';
    let snowRate = 0;

    if (precipitationMm > 0.1) {
      if (alt < effectiveLpnM - 150) {
        phase = 'Pluie liquide';
      } else if (alt < effectiveLpnM + 100) {
        phase = 'Pluie & Neige mêlées';
        snowRate = Number((precipitationMm * 0.4).toFixed(1));
      } else if (tempAtAlt > -2.0) {
        phase = 'Neige humide lourde';
        snowRate = Number((precipitationMm * 0.9).toFixed(1));
      } else {
        phase = 'Neige froide sèche poudreuse';
        snowRate = Number((precipitationMm * 1.25).toFixed(1));
      }
    }

    let stageLabel = 'Moyenne montagne';
    if (alt >= 2800) stageLabel = 'Haute montagne nivale';
    else if (alt >= 2200) stageLabel = 'Étage alpin supérieur';
    else if (alt >= 1600) stageLabel = 'Étage subalpin forestier';
    else stageLabel = 'Étage montagnard inférieur';

    return {
      altitudeM: alt,
      stageLabel,
      temperatureC: tempAtAlt,
      windChillC: windChill,
      windSpeedKmh: stageWind,
      windGustKmh: stageGust,
      precipPhase: phase,
      snowRatePerHourCm: snowRate,
      isAboveLpn: alt >= effectiveLpnM,
      isAboveIso0: alt >= standardIsoZeroM,
      airDensityKgM3: Number((1.225 * Math.exp(-alt / 8400)).toFixed(3)),
      microclimaticNote: alt >= 2500 ? 'Exposition crête maximale, givrage sévère' : alt >= effectiveLpnM ? 'Accrétion neigeuse en cours' : 'Précipitations liquides en fond de vallée'
    };
  });

  // Synthèse tactique
  const isHeavyIsothermy = isothermyDropM >= 200;
  let tacticalAdvice = 'Conditions calmes et de saison sur le massif.';
  if (isHeavyIsothermy || (precipitationMm > 2.0 && effectiveLpnM < standardIsoZeroM - 300)) {
    tacticalAdvice = `⚠️ Isothermie marquée : la limite pluie-neige chute brutalement vers ${effectiveLpnM} m (soit -${isothermyDropM} m sous l'isotherme standard) sous les plus fortes averses dans les vallées abritées.`;
  } else if (crestGustKmh >= 80) {
    tacticalAdvice = `💨 Vent de crête tempétueux : effet Venturi puissant (+${venturiAccelerationPct} %) avec rafales atteignant ${crestGustKmh} km/h aux cols et sommets.`;
  } else if (foehnRiskActive) {
    tacticalAdvice = `🌪️ Foehn actif : réchauffement brusque et assèchement spectaculaire sur les versants sous le vent avec rafales dévalantes.`;
  } else if (isInversionActive) {
    tacticalAdvice = `🧊 Inversion thermique de combe : fond de vallée plus froid de +${inversionDeltaC.toFixed(1)}°C qu'à 1500 m d'altitude sous une mer de nuages.`;
  }

  return {
    massif,
    baseTempC,
    peakTempC,
    synopticIsoZeroM: standardIsoZeroM,
    wetBulbZeroM,
    effectiveLpnM,
    isothermyDropM,
    isothermyAlert: isothermyDropM >= 200,
    baseWindKmh,
    crestWindKmh,
    crestGustKmh,
    venturiAccelerationPct,
    verticalLapseRateCPer100m: Number(effectiveLapseRate.toFixed(2)),
    isInversionActive,
    inversionDeltaC: Number(inversionDeltaC.toFixed(1)),
    foehnRiskActive,
    tacticalAdvice,
    altitudeStages
  };
}
