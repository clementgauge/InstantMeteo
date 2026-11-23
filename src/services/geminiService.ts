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

export type AuraPersonaMode = 'standard' | 'expert' | 'health' | 'pedagogue';

export interface AuraSource {
  title: string;
  url: string;
}

export interface AuraChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface AuraChatResponsePayload {
  text: string;
  card?: any;
  comparison?: any;
  chart?: any;
  map3D?: any;
  snapshot?: any;
  table?: any;
  sources?: AuraSource[];
  verificationStatus?: 'verified' | 'corrected';
}

export interface AuraStreamCallbacks {
  onStatus?: (phase: string, label: string) => void;
  onChunk?: (delta: string) => void;
  onResetText?: () => void;
  onDone?: (payload: AuraChatResponsePayload) => void;
  onError?: (message: string) => void;
}

export const AURA_CLIENT_ERROR_MESSAGE =
  "Je n'arrive pas à joindre mon moteur, réessaie dans un instant";

export async function streamAuraChat(
  params: {
    message: string;
    history: AuraChatHistoryItem[];
    station: LocationPoint;
    weather: CurrentWeather;
    personaMode: AuraPersonaMode;
    signal?: AbortSignal;
  },
  callbacks: AuraStreamCallbacks
): Promise<void> {
  try {
    const response = await fetch('/api/aura/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        message: params.message,
        history: params.history.slice(-12),
        station: params.station,
        weather: params.weather,
        personaMode: params.personaMode,
      }),
      signal: params.signal,
    });

    if (!response.ok) {
      let errMsg = AURA_CLIENT_ERROR_MESSAGE;
      try {
        const errJson = await response.json();
        if (errJson?.error) errMsg = String(errJson.error);
      } catch {
        // ignore JSON parse failure
      }
      callbacks.onError?.(errMsg);
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/event-stream') || !response.body) {
      const data = await response.json();
      if (data?.success && (data.text || data.answer)) {
        const text = String(data.text || data.answer);
        callbacks.onChunk?.(text);
        callbacks.onDone?.({
          text,
          card: data.card,
          comparison: data.comparison,
          chart: data.chart,
          map3D: data.map3D,
          snapshot: data.snapshot,
          table: data.table,
          sources: Array.isArray(data.sources) ? data.sources : [],
          verificationStatus: data.verificationStatus,
        });
      } else {
        callbacks.onError?.(data?.error || AURA_CLIENT_ERROR_MESSAGE);
      }
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finished = false;

    const processBlock = (block: string) => {
      const lines = block.split(/\r?\n/);
      let eventName = 'message';
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }

      if (dataLines.length === 0) return;
      const rawData = dataLines.join('\n');
      let parsed: any;
      try {
        parsed = JSON.parse(rawData);
      } catch {
        return;
      }

      if (eventName === 'status') {
        callbacks.onStatus?.(String(parsed?.phase || 'thinking'), String(parsed?.label || 'AURA réfléchit…'));
      } else if (eventName === 'chunk') {
        if (typeof parsed?.delta === 'string' && parsed.delta) {
          callbacks.onChunk?.(parsed.delta);
        }
      } else if (eventName === 'reset') {
        callbacks.onResetText?.();
      } else if (eventName === 'done') {
        finished = true;
        callbacks.onDone?.({
          text: String(parsed?.text || ''),
          card: parsed?.card,
          comparison: parsed?.comparison,
          chart: parsed?.chart,
          map3D: parsed?.map3D,
          snapshot: parsed?.snapshot,
          table: parsed?.table,
          sources: Array.isArray(parsed?.sources) ? parsed.sources : [],
          verificationStatus: parsed?.verificationStatus,
        });
      } else if (eventName === 'error') {
        finished = true;
        callbacks.onError?.(String(parsed?.message || AURA_CLIENT_ERROR_MESSAGE));
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() || '';
      for (const part of parts) {
        if (part.trim()) processBlock(part);
      }
    }

    if (buffer.trim()) {
      processBlock(buffer);
    }

    if (!finished) {
      callbacks.onError?.(AURA_CLIENT_ERROR_MESSAGE);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    callbacks.onError?.(AURA_CLIENT_ERROR_MESSAGE);
  }
}

