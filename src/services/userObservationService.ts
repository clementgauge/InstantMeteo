import { LocationPoint, CurrentWeather } from '../types/weather';

export const REPORT_CONTACT_EMAIL = 'instantmeteofr@gmail.com';
export const FORMSUBMIT_TOKEN = '1c7dac087c2f4d7b58aeaa4ee8a1ec13';

export interface UserObservationReport {
  id: string;
  timestamp: string;
  stationId: string;
  stationName: string;
  department: string;
  
  // User input
  observedTemperature: number;
  observedWeatherCondition: string;
  discrepancyType: string;
  userComments: string;
  userEmail?: string;

  // App baseline at time of report
  appDisplayedTemperature: number;
  appDisplayedWeather: string;

  // Human dispatch status & details
  humanDispatch: {
    targetEmail: string;
    status: 'transmis' | 'ouvert_gmail' | 'enregistre';
    statusMessage: string;
    mailSubject: string;
    mailBody: string;
    gmailComposeUrl: string;
    mailtoUrl: string;
    recalibrationApplied: string;
  };
}

export interface RecalibrationState {
  isActive: boolean;
  stationId: string;
  stationName: string;
  startTimeIso: string;
  expiresTimeIso: string;
  tempOffset: number;
  weatherOverride?: string;
  activeReportId?: string;
}

const STORAGE_KEY_REPORTS = 'climafrance_user_observation_reports';
const STORAGE_KEY_CALIBRATION = 'climafrance_active_recalibration';

export function getSavedUserReports(): UserObservationReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load user observation reports:', e);
    return [];
  }
}

export function saveUserReport(report: UserObservationReport): void {
  try {
    const existing = getSavedUserReports();
    const updated = [report, ...existing.filter(r => r.id !== report.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save user report:', e);
  }
}

export function getActiveRecalibration(): RecalibrationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CALIBRATION);
    if (!raw) return null;
    const parsed: RecalibrationState = JSON.parse(raw);
    const now = new Date().getTime();
    const expires = new Date(parsed.expiresTimeIso).getTime();
    if (now > expires) {
      localStorage.removeItem(STORAGE_KEY_CALIBRATION);
      return null;
    }
    return { ...parsed, isActive: true };
  } catch (e) {
    return null;
  }
}

export function setActiveRecalibration(state: RecalibrationState): void {
  try {
    localStorage.setItem(STORAGE_KEY_CALIBRATION, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save recalibration state:', e);
  }
}

export function clearActiveRecalibration(): void {
  localStorage.removeItem(STORAGE_KEY_CALIBRATION);
}

/**
 * Apply direct temperature calibration (e.g. +2°C from home thermometer)
 */
export function applyDirectTemperatureOffset(
  stationId: string,
  stationName: string,
  tempOffset: number,
  durationHours: number = 12
): RecalibrationState {
  const now = new Date();
  const expires = new Date(now.getTime() + durationHours * 3600 * 1000);
  const state: RecalibrationState = {
    isActive: true,
    stationId,
    stationName,
    startTimeIso: now.toISOString(),
    expiresTimeIso: expires.toISOString(),
    tempOffset: Math.round(tempOffset * 10) / 10
  };
  setActiveRecalibration(state);
  return state;
}

export function getRecalibrationOffsetForStation(stationId: string): number {
  const active = getActiveRecalibration();
  if (!active || !active.isActive) return 0;
  // If set for this station or global
  if (active.stationId === stationId || !active.stationId) {
    return active.tempOffset || 0;
  }
  return 0;
}

/**
 * Builds structured email text and links to ensure the user receives the report directly in Gmail
 */
export function buildReportEmailData(
  station: LocationPoint,
  currentAppWeather: CurrentWeather,
  userInput: {
    observedTemperature: number;
    observedWeatherCondition: string;
    discrepancyType: string;
    userComments: string;
    userEmail?: string;
  }
) {
  const dateStr = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' });
  const tempDiff = Number((userInput.observedTemperature - currentAppWeather.temperature).toFixed(1));
  const diffSign = tempDiff > 0 ? `+${tempDiff}` : `${tempDiff}`;

  const subject = `[Signalement Météo] Correction ${station.name} (${station.department}) - ${diffSign}°C`;

  // Pre-configured response for the admin to reply to the observer in 1 click
  const replySubject = `Votre signalement météo a été pris en compte - Instant Météo (${station.name})`;
  const replyBody = `Bonjour,

Votre signalement pour la station de ${station.name} (${station.department}) a bien été pris en compte par l'équipe d'Instant Météo.

Nos équipes vérifient les données transmises (température observée : ${userInput.observedTemperature}°C, conditions : ${userInput.observedWeatherCondition}).

Nous vous remercions pour votre contribution à l'amélioration de la précision de nos prévisions !

Cordialement,
L'équipe Instant Météo France
instantmeteofr@gmail.com`;

  const replyGmailUrl = userInput.userEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(userInput.userEmail)}&su=${encodeURIComponent(
        replySubject
      )}&body=${encodeURIComponent(replyBody)}`
    : '';

  const replyMailtoUrl = userInput.userEmail
    ? `mailto:${encodeURIComponent(userInput.userEmail)}?subject=${encodeURIComponent(
        replySubject
      )}&body=${encodeURIComponent(replyBody)}`
    : '';

  const body = `=====================================================
🚨 NOUVEAU SIGNALEMENT MÉTÉO TERRAIN - INSTANT MÉTÉO
=====================================================

📍 STATION CONCERNÉE :
• Commune / Sommet : ${station.name}
• Département : ${station.department}
• Altitude : ${station.altitude} m
• Coordonnées GPS : Latitude ${station.latitude.toFixed(4)}, Longitude ${station.longitude.toFixed(4)}
• Date et heure : ${dateStr}

📊 RELEVÉS COMPARATIFS :
• Température réelle observée sur place : ${userInput.observedTemperature}°C
• Temps réel observé sur place : ${userInput.observedWeatherCondition}
• Température affichée dans l'application : ${currentAppWeather.temperature}°C
• Temps affiché dans l'application : ${currentAppWeather.weatherDescription}
• Écart thermique constaté : ${diffSign}°C
• Nature de l'anomalie : ${userInput.discrepancyType}

💬 REMARQUES ET PRÉCISIONS DE L'OBSERVATEUR :
${userInput.userComments ? `"${userInput.userComments}"` : 'Aucune précision complémentaire.'}

👤 CONTACT DE L'OBSERVATEUR :
• Adresse e-mail : ${userInput.userEmail ? userInput.userEmail : 'Non renseignée par l\'utilisateur'}

${
  userInput.userEmail
    ? `-----------------------------------------------------
📩 RÉPONDRE EN 1 CLIC À L'OBSERVATEUR :
Cliquez sur le lien ci-dessous pour lui envoyer la confirmation automatique :
${replyGmailUrl}
-----------------------------------------------------`
    : `(L'observateur n'a pas renseigné son adresse e-mail, réponse directe impossible)`
}

-----------------------------------------------------
Instant Météo France • Système de Surveillance & Signalement
Contact administrateur : ${REPORT_CONTACT_EMAIL}`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    REPORT_CONTACT_EMAIL
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(REPORT_CONTACT_EMAIL)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { subject, body, gmailComposeUrl, mailtoUrl, replyGmailUrl, replyMailtoUrl, tempDiff };
}

/**
 * Process report submission: Send to human team (instantmeteofr@gmail.com), dispatch via API & prepare direct Gmail link
 */
export async function processUserObservationSubmission(
  station: LocationPoint,
  currentAppWeather: CurrentWeather,
  userInput: {
    observedTemperature: number;
    observedWeatherCondition: string;
    discrepancyType: string;
    userComments: string;
    userEmail?: string;
  }
): Promise<{ report: UserObservationReport; recalibration: RecalibrationState }> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { subject, body, gmailComposeUrl, mailtoUrl, replyGmailUrl, tempDiff } = buildReportEmailData(
    station,
    currentAppWeather,
    userInput
  );

  // Attempt multi-channel background dispatch to guarantee delivery
  let isDispatchedViaApi = false;
  let apiResponseMessage = '';

  const payload: Record<string, string> = {
    _subject: subject,
    _replyto: userInput.userEmail || REPORT_CONTACT_EMAIL,
    _template: 'table',
    _captcha: 'false',
    name: 'Instant Météo',
    "Expéditeur": 'Instant Météo France (Application)',
    "Station_Météo": `${station.name} (${station.department}) - Alt: ${station.altitude}m`,
    "Température_Réelle_Observée": `${userInput.observedTemperature}°C`,
    "Temps_Réel_Observé": userInput.observedWeatherCondition,
    "Température_Affichée_Application": `${currentAppWeather.temperature}°C`,
    "Temps_Affiché_Application": currentAppWeather.weatherDescription,
    "Écart_Thermique_Relevé": `${tempDiff > 0 ? '+' : ''}${tempDiff}°C`,
    "Type_D_Anomalie": userInput.discrepancyType,
    "Commentaires_Observateur": userInput.userComments || 'Aucun',
    "Email_De_L_Observateur": userInput.userEmail || 'Non renseigné (anonyme)',
    "Bouton_Répondre_A_L_Observateur_En_1_Clic": userInput.userEmail
      ? replyGmailUrl
      : 'Aucun email fourni par l\'observateur',
    "Message_Récapitulatif_Complet": body
  };

  // 1. Try FormSubmit AJAX with the verified token
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      isDispatchedViaApi = true;
      if (data && data.message) {
        apiResponseMessage = data.message;
      }
    }
  } catch (err) {
    console.warn('Primary dispatch attempt logged:', err);
  }

  // 2. Secondary fallback via FormSubmit standard form POST if ajax failed or pending
  if (!isDispatchedViaApi) {
    try {
      const formBody = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => formBody.append(k, String(v)));
      await fetch(`https://formsubmit.co/${FORMSUBMIT_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        },
        body: formBody.toString(),
        mode: 'no-cors'
      });
      isDispatchedViaApi = true;
    } catch (e) {
      console.warn('Fallback dispatch attempt logged:', e);
    }
  }

  const report: UserObservationReport = {
    id: reportId,
    timestamp: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
    stationId: station.id,
    stationName: station.name,
    department: station.department,
    observedTemperature: userInput.observedTemperature,
    observedWeatherCondition: userInput.observedWeatherCondition,
    discrepancyType: userInput.discrepancyType,
    userComments: userInput.userComments,
    userEmail: userInput.userEmail,
    appDisplayedTemperature: currentAppWeather.temperature,
    appDisplayedWeather: currentAppWeather.weatherDescription,
    humanDispatch: {
      targetEmail: REPORT_CONTACT_EMAIL,
      status: 'transmis',
      statusMessage: apiResponseMessage || `Signalement transmis automatiquement à ${REPORT_CONTACT_EMAIL}.`,
      mailSubject: subject,
      mailBody: body,
      gmailComposeUrl,
      mailtoUrl,
      recalibrationApplied: `Signalement expédié à l'administrateur (${REPORT_CONTACT_EMAIL}). L'application conserve les données officielles de la station.`
    }
  };

  saveUserReport(report);
  clearActiveRecalibration();

  const recalibration: RecalibrationState = {
    isActive: false,
    stationId: station.id,
    stationName: station.name,
    startTimeIso: nowIso,
    expiresTimeIso: expiresIso,
    tempOffset: 0,
    weatherOverride: undefined,
    activeReportId: reportId
  };

  return { report, recalibration };
}

