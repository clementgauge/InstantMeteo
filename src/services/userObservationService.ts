import { LocationPoint, CurrentWeather } from '../types/weather';
import { secureSave, secureLoad, secureRemove } from '../utils/securityCrypto';
import { loadPlayerProfile, savePlayerProfile } from './competitiveGameService';

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
  userPseudo?: string;

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

export interface AdminSignalementItem {
  id: string;
  timestamp: string;
  isoTimestamp: string;
  stationId: string;
  stationName: string;
  department: string;
  observedTemperature: number;
  observedWeatherCondition: string;
  appDisplayedTemperature: number;
  appDisplayedWeather: string;
  tempDiff: number;
  discrepancyType: string;
  userComments: string;
  userEmail?: string;
  userPseudo?: string;
  status: 'EN_ATTENTE' | 'VALIDE_OUI' | 'REJETE_NON';
  decidedAt?: string;
  decidedBy?: string;
}

export interface RecalibrationState {
  isActive: boolean;
  stationId: string;
  stationName: string;
  startTimeIso: string;
  expiresTimeIso: string;
  tempOffset: number;
  exactTemperature?: number;
  weatherOverride?: string;
  activeReportId?: string;
  approvedBy?: string;
}

const STORAGE_KEY_REPORTS = 'climafrance_user_observation_reports';
const STORAGE_KEY_CALIBRATION = 'climafrance_active_recalibration';
const STORAGE_KEY_ADMIN_SIGNALEMENTS = 'instant_meteo_admin_signalements_queue_v1';

export function getSavedUserReports(): UserObservationReport[] {
  try {
    return secureLoad<UserObservationReport[]>(STORAGE_KEY_REPORTS, []);
  } catch (e) {
    console.warn('Failed to load user observation reports:', e);
    return [];
  }
}

export function saveUserReport(report: UserObservationReport): void {
  try {
    const existing = getSavedUserReports();
    const updated = [report, ...existing.filter(r => r.id !== report.id)].slice(0, 30);
    secureSave(STORAGE_KEY_REPORTS, updated);
  } catch (e) {
    console.warn('Failed to save user report:', e);
  }
}

// === GESTION DES SIGNALEMENTS ADMIN (Validation OUI / NON) ===

export function getAdminSignalements(): AdminSignalementItem[] {
  try {
    return secureLoad<AdminSignalementItem[]>(STORAGE_KEY_ADMIN_SIGNALEMENTS, []);
  } catch (e) {
    console.warn('Erreur lecture signalements admin:', e);
    return [];
  }
}

export function saveAdminSignalement(item: AdminSignalementItem): void {
  try {
    const list = getAdminSignalements();
    const updated = [item, ...list.filter(s => s.id !== item.id)];
    secureSave(STORAGE_KEY_ADMIN_SIGNALEMENTS, updated);
    window.dispatchEvent(new CustomEvent('instant_meteo_admin_signalements_updated', { detail: updated }));
  } catch (e) {
    console.warn('Erreur sauvegarde signalement admin:', e);
  }
}

/**
 * Validation par l'administrateur : Bouton OUI
 * Applique immédiatement la température et la météo observées par l'utilisateur à l'application.
 */
export function approveSignalement(
  reportId: string, 
  adminPseudo: string
): { success: boolean; recalibration: RecalibrationState | null; message: string } {
  const list = getAdminSignalements();
  const target = list.find(s => s.id === reportId);
  if (!target) {
    return { success: false, recalibration: null, message: 'Signalement introuvable.' };
  }

  const offset = Number((target.observedTemperature - target.appDisplayedTemperature).toFixed(1));
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 heure de validité

  const recalibration: RecalibrationState = {
    isActive: true,
    stationId: target.stationId,
    stationName: target.stationName,
    startTimeIso: nowIso,
    expiresTimeIso: expiresIso,
    tempOffset: offset,
    exactTemperature: target.observedTemperature,
    weatherOverride: target.observedWeatherCondition,
    activeReportId: target.id,
    approvedBy: adminPseudo || 'Administrateur Instant Météo'
  };

  // 1. Sauvegarde de la recalibration active
  setActiveRecalibration(recalibration);

  // 2. Mise à jour du statut du signalement dans la liste admin
  const updatedList = list.map(s => {
    if (s.id === reportId) {
      return {
        ...s,
        status: 'VALIDE_OUI' as const,
        decidedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        decidedBy: adminPseudo || 'Administrateur'
      };
    }
    return s;
  });
  secureSave(STORAGE_KEY_ADMIN_SIGNALEMENTS, updatedList);

  // 3. Attribution éventuelle de points bonus à l'observateur s'il a un profil
  try {
    const profile = loadPlayerProfile();
    if (profile && (profile.pseudo === target.userPseudo || profile.pseudo === target.userEmail)) {
      const updatedProfile = {
        ...profile,
        totalPoints: profile.totalPoints + 200,
        communityReportsCount: (profile.communityReportsCount || 0) + 1
      };
      savePlayerProfile(updatedProfile);
    }
  } catch (e) {
    console.warn('Erreur crédit points après validation signalement:', e);
  }

  // 4. Notification immédiate à toute l'application pour modifier la météo en direct
  window.dispatchEvent(new CustomEvent('instant_meteo_admin_signalements_updated', { detail: updatedList }));
  window.dispatchEvent(new CustomEvent('instant_meteo_recalibration_changed', { detail: recalibration }));

  return {
    success: true,
    recalibration,
    message: `Signalement validé avec succès ! La météo de ${target.stationName} est désormais recalibrée sur ${target.observedTemperature}°C (${target.observedWeatherCondition}).`
  };
}

/**
 * Rejet par l'administrateur : Bouton NON
 * Rejette le signalement sans modifier les données météorologiques de l'application.
 */
export function rejectSignalement(
  reportId: string, 
  adminPseudo: string
): { success: boolean; message: string } {
  const list = getAdminSignalements();
  const target = list.find(s => s.id === reportId);
  if (!target) {
    return { success: false, message: 'Signalement introuvable.' };
  }

  // Si une recalibration était active pour ce signalement, on la retire
  const curRecalib = getActiveRecalibration();
  if (curRecalib && curRecalib.activeReportId === reportId) {
    clearActiveRecalibration();
    window.dispatchEvent(new CustomEvent('instant_meteo_recalibration_changed', { detail: null }));
  }

  const updatedList = list.map(s => {
    if (s.id === reportId) {
      return {
        ...s,
        status: 'REJETE_NON' as const,
        decidedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        decidedBy: adminPseudo || 'Administrateur'
      };
    }
    return s;
  });

  secureSave(STORAGE_KEY_ADMIN_SIGNALEMENTS, updatedList);
  window.dispatchEvent(new CustomEvent('instant_meteo_admin_signalements_updated', { detail: updatedList }));

  return {
    success: true,
    message: `Le signalement pour ${target.stationName} a été rejeté. Les données officielles de l'application sont conservées.`
  };
}

/**
 * Révocation manuelle d'une correction météo active
 */
export function revokeStationRecalibration(stationId?: string): void {
  const active = getActiveRecalibration();
  if (!active) return;
  if (!stationId || active.stationId === stationId) {
    clearActiveRecalibration();
    window.dispatchEvent(new CustomEvent('instant_meteo_recalibration_changed', { detail: null }));
  }
}

export function deleteSignalement(reportId: string): void {
  const list = getAdminSignalements();
  const filtered = list.filter(s => s.id !== reportId);
  secureSave(STORAGE_KEY_ADMIN_SIGNALEMENTS, filtered);
  window.dispatchEvent(new CustomEvent('instant_meteo_admin_signalements_updated', { detail: filtered }));
}

// === FIN GESTION SIGNALEMENTS ADMIN ===

export function getActiveRecalibration(): RecalibrationState | null {
  try {
    const parsed = secureLoad<RecalibrationState | null>(STORAGE_KEY_CALIBRATION, null);
    if (!parsed) return null;
    const now = new Date().getTime();
    const expires = new Date(parsed.expiresTimeIso).getTime();
    if (now > expires) {
      secureRemove(STORAGE_KEY_CALIBRATION);
      return null;
    }
    return { ...parsed, isActive: true };
  } catch (e) {
    return null;
  }
}

export function setActiveRecalibration(state: RecalibrationState): void {
  try {
    secureSave(STORAGE_KEY_CALIBRATION, state);
  } catch (e) {
    console.warn('Failed to save recalibration state:', e);
  }
}

export function clearActiveRecalibration(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CALIBRATION);
  } catch (e) {
    console.warn('Failed to clear recalibration state:', e);
  }
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
    userPseudo?: string;
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
    userPseudo?: string;
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
    userPseudo: userInput.userPseudo,
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
      recalibrationApplied: `Signalement expédié à la messagerie (${REPORT_CONTACT_EMAIL}) et placé dans la file d'attente Administrateur.`
    }
  };

  saveUserReport(report);

  // Enregistrement dans la file des signalements Administrateur pour arbitrage Oui / Non
  const adminItem: AdminSignalementItem = {
    id: reportId,
    timestamp: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
    isoTimestamp: nowIso,
    stationId: station.id,
    stationName: station.name,
    department: station.department,
    observedTemperature: userInput.observedTemperature,
    observedWeatherCondition: userInput.observedWeatherCondition,
    appDisplayedTemperature: currentAppWeather.temperature,
    appDisplayedWeather: currentAppWeather.weatherDescription,
    tempDiff,
    discrepancyType: userInput.discrepancyType,
    userComments: userInput.userComments,
    userEmail: userInput.userEmail,
    userPseudo: userInput.userPseudo,
    status: 'EN_ATTENTE'
  };
  saveAdminSignalement(adminItem);

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

