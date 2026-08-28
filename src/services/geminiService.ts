import { GoogleGenAI } from '@google/genai';
import { CurrentWeather, LocationPoint, ClimateAnomaly, AiDiagnostic } from '../types/weather';

export async function generateClimateDiagnostic(
  station: LocationPoint,
  weather: CurrentWeather,
  anomaly: ClimateAnomaly
): Promise<AiDiagnostic> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY;

  if (!apiKey) {
    return generateLocalIntelligentDiagnostic(station, weather, anomaly);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Tu es un expert climatologue de Météo-France et du GIEC. 
Rédige une analyse synthétique, claire et bienveillante pour la station suivante en France :
- Station : ${station.name} (${station.department}, ${station.region})
- Climat régional : ${station.climateZone}
- Température actuelle : ${weather.temperature}°C (Ressentie : ${weather.feelsLike}°C, Min: ${weather.tempMin}°C, Max: ${weather.tempMax}°C)
- Normale de saison 1991-2020 : ${anomaly.normalTemp}°C
- Écart thermique (Anomalie) : ${anomaly.tempAnomaly > 0 ? '+' : ''}${anomaly.tempAnomaly}°C
- Humidité : ${weather.humidity}%, Vent : ${weather.windSpeed} km/h, Indice UV : ${weather.uvIndex}
- Qualité de l'air : AQI ${weather.airQualityAqi} (${weather.airQualityLabel})
- Conditions : ${weather.weatherDescription}
- Record historique de la station : Max ${station.allTimeRecordMax}°C / Min ${station.allTimeRecordMin}°C

Fournis une réponse au format JSON strict avec les clés suivantes :
{
  "summary": "Résumé concis de la situation météo-climatique (2 phrases claires sans jargon).",
  "healthAdvice": [
    "Conseil santé n°1 pratique et bienveillant (notamment pour les seniors/personnes sensibles)",
    "Conseil santé n°2 sur l'aération, l'hydratation ou les horaires de sortie",
    "Conseil santé n°3 sur l'exposition UV ou la qualité de l'air"
  ],
  "agricultureImpact": "Impact direct sur les cultures locales, les jardins, la végétation ou la réserve en eau du sol.",
  "energyImpact": "Conséquence sur la consommation électrique / chauffage ou climatisation.",
  "extremeRiskLevel": "FAIBLE" | "MODÉRÉ" | "ÉLEVÉ" | "EXTRÊME",
  "vigilanceMessage": "Consigne clé de vigilance ou message rassurant pour les prochaines 24 heures."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    return {
      summary: parsed.summary || "Diagnostic météorologique établi avec succès.",
      healthAdvice: Array.isArray(parsed.healthAdvice) ? parsed.healthAdvice : ["Restez bien hydraté tout au long de la journée."],
      agricultureImpact: parsed.agricultureImpact || "Conditions stables pour la végétation locale.",
      energyImpact: parsed.energyImpact || "Consommation énergétique modérée.",
      extremeRiskLevel: parsed.extremeRiskLevel || (anomaly.severity === 'CRITICAL' ? 'ÉLEVÉ' : 'FAIBLE'),
      vigilanceMessage: parsed.vigilanceMessage || "Aucune vigilance particulière requise à cette heure.",
      generatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    console.warn("Gemini API call skipped or fallback used:", err);
    return generateLocalIntelligentDiagnostic(station, weather, anomaly);
  }
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
