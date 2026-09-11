import { CurrentWeather, LocationPoint, ClimateAnomaly, AiDiagnostic } from '../types/weather';

export async function generateClimateDiagnostic(
  station: LocationPoint,
  weather: CurrentWeather,
  anomaly: ClimateAnomaly
): Promise<AiDiagnostic> {
  try {
    const res = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station, weather, anomaly })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.diagnostic) {
        return {
          summary: data.diagnostic.summary || "Diagnostic météorologique établi avec succès.",
          healthAdvice: Array.isArray(data.diagnostic.healthAdvice) ? data.diagnostic.healthAdvice : ["Restez bien hydraté tout au long de la journée."],
          agricultureImpact: data.diagnostic.agricultureImpact || "Conditions stables pour la végétation locale.",
          energyImpact: data.diagnostic.energyImpact || "Consommation énergétique modérée.",
          extremeRiskLevel: data.diagnostic.extremeRiskLevel || (anomaly.severity === 'CRITICAL' ? 'ÉLEVÉ' : 'FAIBLE'),
          vigilanceMessage: data.diagnostic.vigilanceMessage || "Aucune vigilance particulière requise à cette heure.",
          generatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
      }
    }
  } catch (err) {
    console.warn('Utilisation du moteur de diagnostic local optimisé:', err);
  }

  return generateLocalIntelligentDiagnostic(station, weather, anomaly);
}

export function generateLocalIntelligentDiagnostic(
  station: LocationPoint,
  weather: CurrentWeather,
  anomaly: ClimateAnomaly
): AiDiagnostic {
  const isHot = weather.temperature >= 28 || anomaly.tempAnomaly >= 3;
  const isCold = weather.temperature <= 5 || anomaly.tempAnomaly <= -3;
  const isWet = weather.precipitation > 0 || weather.weatherCode >= 50;

  let summary = `À ${station.name}, la température observée est de ${weather.temperature}°C, soit ${anomaly.tempAnomaly > 0 ? '+' : ''}${anomaly.tempAnomaly}°C par rapport à la normale de saison (${anomaly.normalTemp}°C).`;
  if (isHot) {
    summary += " On constate un temps particulièrement chaud pour la région avec une pression thermique notable.";
  } else if (isCold) {
    summary += " Les températures sont plus fraîches que la moyenne trentenaire, invitant à bien se couvrir.";
  } else {
    summary += " Les conditions actuelles sont équilibrées et agréables pour la période.";
  }

  const healthAdvice: string[] = [];
  if (isHot) {
    healthAdvice.push("💧 Buvez régulièrement de l'eau fraîche sans attendre d'avoir soif (au moins 1,5L par jour).");
    healthAdvice.push("🪟 Fermez les volets et fenêtres pendant les heures les plus chaudes (12h - 18h) et aérez tôt le matin.");
    healthAdvice.push("👒 Privilégiez les promenades à l'ombre le matin et portez un chapeau et des vêtements légers.");
  } else if (isCold) {
    healthAdvice.push("🧣 Couvrez-vous par couches superposées et protégez les extrémités (tête, mains, pieds).");
    healthAdvice.push("🫖 Privilégiez les boissons chaudes (tisanes, soupes) et maintenez une pièce à 19°C.");
    healthAdvice.push("🚶‍♂️ Marchez avec prudence pour éviter les risques de glissade matinale.");
  } else {
    healthAdvice.push("🌤️ Conditions idéales pour une promenade extérieure ou des activités de plein air.");
    healthAdvice.push("🪟 Profitez-en pour aérer le logement pendant 15 minutes afin de renouveler l'air intérieur.");
    healthAdvice.push(`🧴 Indice UV à ${weather.uvIndex} : protection solaire légère recommandée en milieu de journée.`);
  }

  let agricultureImpact = "Les sols bénéficient d'un taux d'humidité stable, favorable aux jardins et cultures régionales.";
  if (isHot && anomaly.precipAnomalyPercentage < 0) {
    agricultureImpact = "Évaporation rapide de l'eau du sol : un arrosage régulier le soir est recommandé pour les plantations et potagers.";
  } else if (isWet) {
    agricultureImpact = "Apport pluviométrique bénéfique pour la recharge hydrique des nappes phréatiques superficielles.";
  }

  let energyImpact = "Besoin énergétique modéré. Aucun pic de surconsommation anticipé sur le réseau électrique.";
  if (isHot) {
    energyImpact = "Demande modérée à soutenue en ventilation et climatisation aux heures de pointe.";
  } else if (isCold) {
    energyImpact = "Consommation accrue de chauffage domestique pour maintenir le confort thermique.";
  }

  const extremeRiskLevel = anomaly.severity === 'CRITICAL' ? 'ÉLEVÉ' : anomaly.severity === 'SEVERE' ? 'MODÉRÉ' : 'FAIBLE';
  const vigilanceMessage = isHot 
    ? "Vigilance chaleur : veillez sur vos proches et restez au frais aux heures zénithales."
    : isCold 
    ? "Vigilance froid : attention aux baisses thermiques nocturnes."
    : "Situation météorologique calme sans vigilance particulière pour les 24 prochaines heures.";

  return {
    summary,
    healthAdvice,
    agricultureImpact,
    energyImpact,
    extremeRiskLevel,
    vigilanceMessage,
    generatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };
}
