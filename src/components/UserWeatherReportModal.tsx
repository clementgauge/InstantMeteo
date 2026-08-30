import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Thermometer, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Mail, 
  MessageSquare, 
  Info, 
  RefreshCw, 
  Zap, 
  Clock,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { 
  processUserObservationSubmission, 
  getSavedUserReports, 
  clearActiveRecalibration,
  UserObservationReport,
  RecalibrationState,
  REPORT_CONTACT_EMAIL
} from '../services/userObservationService';

interface UserWeatherReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: LocationPoint;
  currentWeather: CurrentWeather | null;
  onRecalibrationUpdated: (recalibration: RecalibrationState | null) => void;
  activeRecalibration: RecalibrationState | null;
}

const COMMON_WEATHER_CONDITIONS = [
  'Ensoleillé / Ciel dégagé',
  'Éclaircies / Passages nuageux',
  'Ciel très nuageux / Couvert',
  'Brume / Brouillard dense',
  'Pluie faible / Bruine',
  'Pluie modérée continue',
  'Averses fortes',
  'Orage / Foudre et tonnerre',
  'Grêle',
  'Chutes de neige / Neige fondue',
  'Bourrasques / Coup de vent fort'
];

const DISCREPANCY_TYPES = [
  { id: 'temp_offset', label: 'Écart de température significatif (> 2°C)' },
  { id: 'rain_unpredicted', label: 'Pluie / Averses réelles non prévues sur l\'appli' },
  { id: 'sun_missing', label: 'Plein soleil alors que l\'appli annonce de la pluie' },
  { id: 'storm_active', label: 'Orage ou foudre en cours non détecté' },
  { id: 'fog_dense', label: 'Brouillard épais réduisant fortement la visibilité' },
  { id: 'snow_active', label: 'Neige au sol ou en cours de chute' },
  { id: 'wind_gusts', label: 'Rafales de vent violentes' },
  { id: 'other', label: 'Autre anomalie ou observation météorologique' }
];

export const UserWeatherReportModal: React.FC<UserWeatherReportModalProps> = ({
  isOpen,
  onClose,
  currentStation,
  currentWeather,
  onRecalibrationUpdated,
  activeRecalibration
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [observedTemp, setObservedTemp] = useState<number>(currentWeather ? currentWeather.temperature : 20);
  const [observedCondition, setObservedCondition] = useState<string>(COMMON_WEATHER_CONDITIONS[0]);
  const [discrepancyType, setDiscrepancyType] = useState<string>(DISCREPANCY_TYPES[0].label);
  const [userComments, setUserComments] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSubmittedReport, setLastSubmittedReport] = useState<UserObservationReport | null>(null);
  const [pastReports, setPastReports] = useState<UserObservationReport[]>([]);
  const [remainingCooldownSeconds, setRemainingCooldownSeconds] = useState<number>(0);

  // Check 15-min rate limit cooldown
  const checkRateLimit = () => {
    try {
      const lastTimeStr = localStorage.getItem('instant_meteo_last_report_timestamp');
      if (lastTimeStr) {
        const lastTime = parseInt(lastTimeStr, 10);
        const elapsed = (Date.now() - lastTime) / 1000;
        const cooldown = 15 * 60; // 15 minutes
        if (elapsed < cooldown) {
          setRemainingCooldownSeconds(Math.ceil(cooldown - elapsed));
          return Math.ceil(cooldown - elapsed);
        }
      }
    } catch (e) {}
    setRemainingCooldownSeconds(0);
    return 0;
  };

  useEffect(() => {
    if (currentWeather) {
      setObservedTemp(currentWeather.temperature);
    }
    setPastReports(getSavedUserReports());
    checkRateLimit();

    const interval = setInterval(() => {
      checkRateLimit();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentWeather, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWeather) return;

    const cooldownRemaining = checkRateLimit();
    if (cooldownRemaining > 0) {
      alert(`Veuillez patienter encore ${Math.floor(cooldownRemaining / 60)} min ${cooldownRemaining % 60} s avant d'envoyer un nouveau signalement (limite de sécurité de 15 minutes).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { report, recalibration } = await processUserObservationSubmission(
        currentStation,
        currentWeather,
        {
          observedTemperature: Number(observedTemp),
          observedWeatherCondition: observedCondition,
          discrepancyType,
          userComments: userComments.trim(),
          userEmail: userEmail.trim() || undefined
        }
      );

      // Record rate limit timestamp
      try {
        localStorage.setItem('instant_meteo_last_report_timestamp', Date.now().toString());
      } catch (e) {}

      setLastSubmittedReport(report);
      onRecalibrationUpdated(recalibration);
      setPastReports(getSavedUserReports());
      setActiveTab('history');
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopCalibration = () => {
    clearActiveRecalibration();
    onRecalibrationUpdated(null);
  };

  const handleCopyReport = (bodyText: string) => {
    try {
      navigator.clipboard.writeText(bodyText);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-sky-300/40 bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 pb-4">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 border border-sky-200">
            <Mail className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Signaler une Observation Météo</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Envoi Automatique Direct
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Station : <strong className="text-slate-900">{currentStation.name} ({currentStation.department})</strong> • Expédié automatiquement à <strong className="text-slate-900">{REPORT_CONTACT_EMAIL}</strong> sans action requise.
            </p>
          </div>
        </div>

        {/* Information Notice */}
        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-xs text-sky-900 flex items-center gap-2">
          <Mail className="h-4 w-4 text-sky-700 shrink-0" />
          <span>
            Les signalements sont directement transmis par e-mail à l'administrateur. Le site affiche toujours les relevés officiels et n'est pas modifié de manière automatisée sans validation humaine.
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'form' 
                ? 'bg-sky-600 text-white font-black shadow-sm' 
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Nouveau Signalement</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-sky-600 text-white font-black shadow-sm' 
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Signalements Envoyés ({pastReports.length})</span>
          </button>
        </div>

        {/* TAB 1: FORM */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current App Display Baseline */}
            {currentWeather && (
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Valeur actuellement affichée par l'application :</span>
                  <span className="font-black text-slate-900 text-sm">
                    {currentWeather.temperature}°C • {currentWeather.weatherDescription}
                  </span>
                </div>
                <span className="text-[11px] text-sky-800 font-mono bg-sky-100 px-2.5 py-1 rounded-xl border border-sky-300">
                  Station {currentStation.name}
                </span>
              </div>
            )}

            {/* Inputs: Observed Temp & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Temperature Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-rose-500" />
                  <span>Température réelle observée (°C) *</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={observedTemp}
                    onChange={(e) => setObservedTemp(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-900 font-mono font-bold text-base focus:border-sky-600 focus:outline-none shadow-sm"
                  />
                  <span className="absolute right-4 top-3 text-sm font-bold text-slate-400">°C</span>
                </div>
              </div>

              {/* Weather Condition Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <span>Temps réel observé sur place *</span>
                </label>
                <select
                  value={observedCondition}
                  onChange={(e) => setObservedCondition(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-900 text-xs font-bold focus:border-sky-600 focus:outline-none shadow-sm"
                >
                  {COMMON_WEATHER_CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discrepancy Category Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-500" />
                <span>Type d'anomalie constatée *</span>
              </label>
              <select
                value={discrepancyType}
                onChange={(e) => setDiscrepancyType(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-900 text-xs font-bold focus:border-sky-600 focus:outline-none shadow-sm"
              >
                {DISCREPANCY_TYPES.map((dt) => (
                  <option key={dt.id} value={dt.label}>{dt.label}</option>
                ))}
              </select>
            </div>

            {/* Direct Human Transmission Card */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2 font-black text-xs text-sky-900">
                <Mail className="h-4 w-4 text-sky-600" />
                <span>Transmission pour vérification humaine :</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Ce signalement est transmis directement à l'administrateur (<strong className="text-sky-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-sky-300">{REPORT_CONTACT_EMAIL}</strong>). Le site ne modifie pas ses données tout seul : l'administrateur humain vérifiera les relevés et effectuera les ajustements nécessaires.
              </p>
            </div>

            {/* User Comments / Explanation */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                <span>Précisions & Détails de votre observation (Optionnel)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ex : 'Pluie battante depuis 10 min dans le bourg alors que l'application indique grand soleil...'"
                value={userComments}
                onChange={(e) => setUserComments(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:outline-none leading-relaxed shadow-sm"
              ></textarea>
            </div>

            {/* Optional Email Contact for Reply */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-indigo-600" />
                <span>Votre adresse e-mail (Recommandé pour recevoir une confirmation)</span>
              </label>
              <input
                type="email"
                placeholder="votre-adresse@gmail.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:outline-none shadow-sm"
              />
            </div>

            {/* Rate limit cooldown notice if active */}
            {remainingCooldownSeconds > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
                <span>
                  <strong>Délai de sécurité anti-spam :</strong> Veuillez patienter encore{' '}
                  <strong className="text-amber-950">{Math.floor(remainingCooldownSeconds / 60)} min {remainingCooldownSeconds % 60} s</strong> avant un nouvel envoi.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || remainingCooldownSeconds > 0}
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Transmission du signalement...</span>
                  </>
                ) : remainingCooldownSeconds > 0 ? (
                  <>
                    <Clock className="h-4 w-4 text-white" />
                    <span>Patienter {Math.floor(remainingCooldownSeconds / 60)}m {remainingCooldownSeconds % 60}s</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-white" />
                    <span>Envoyer le signalement à l'équipe ({REPORT_CONTACT_EMAIL})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: HISTORY & DIRECT GMAIL ACTIONS */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Show Last Submitted Report Prominently */}
            {lastSubmittedReport && (
              <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-white to-sky-50/70 p-5 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Signalement Envoyé Automatiquement</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono">{lastSubmittedReport.timestamp}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">
                    Destinataire : <span className="font-mono text-sky-700">{REPORT_CONTACT_EMAIL}</span>
                  </p>
                  <p className="text-emerald-900 font-medium bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200">
                    ✓ Le signalement a été transmis directement au serveur et à <strong>{REPORT_CONTACT_EMAIL}</strong>. Aucune validation manuelle n'est requise.
                  </p>
                </div>

                {/* Quick actions: Gmail direct, Mailto, Copier, Fermer */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  {lastSubmittedReport.humanDispatch?.gmailComposeUrl && (
                    <a
                      href={lastSubmittedReport.humanDispatch.gmailComposeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Ouvrir & Envoyer dans Gmail</span>
                    </a>
                  )}

                  {lastSubmittedReport.humanDispatch?.mailtoUrl && (
                    <a
                      href={lastSubmittedReport.humanDispatch.mailtoUrl}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-2 transition"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Appli E-mail</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopyReport(lastSubmittedReport.humanDispatch.mailBody)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    {copiedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSuccess ? 'Résumé copié !' : 'Copier le récapitulatif'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer ml-auto"
                  >
                    <Check className="h-4 w-4" />
                    <span>Fermer</span>
                  </button>
                </div>

                {/* Important Activation Note for instantmeteofr@gmail.com */}
                <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 space-y-1.5 text-xs text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Info className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>💡 Comment recevoir les e-mails sur instantmeteofr@gmail.com :</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1">
                    <li>
                      <strong>Vérifiez vos Spams / Courrier indésirable</strong> : Lors du premier envoi, le service FormSubmit vous envoie un e-mail avec pour objet <em>« Action Required: Activate FormSubmit »</em>.
                    </li>
                    <li>
                      Cliquez une seule fois sur <strong>« Activate Form »</strong> dans cet e-mail pour autoriser l'arrivée directe de tous les futurs signalements.
                    </li>
                    <li>
                      Vous pouvez aussi utiliser le bouton rouge <strong>« Ouvrir & Envoyer dans Gmail »</strong> ci-dessus pour envoyer le signalement directement sans intermédiaire.
                    </li>
                  </ul>
                </div>

                {/* Confirmation Notice */}
                <div className="rounded-xl bg-sky-100/80 border border-sky-200 p-3 text-xs text-sky-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-700 shrink-0" />
                  <span>{lastSubmittedReport.humanDispatch.recalibrationApplied}</span>
                </div>
              </div>
            )}

            {/* List of Past Reports */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-500" />
                <span>Tous vos signalements transmis ({pastReports.length})</span>
              </h4>

              {pastReports.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  Aucun signalement précédent enregistré sur cet appareil.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {pastReports.map((rep) => (
                    <div key={rep.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-slate-900">
                      <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                        <span className="font-black text-slate-900">📍 {rep.stationName} ({rep.department})</span>
                        <span className="text-[10px] text-slate-500 font-mono">{rep.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Affiché sur l'application :</span>
                          <strong>{rep.appDisplayedTemperature}°C • {rep.appDisplayedWeather}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Votre relevé terrain :</span>
                          <strong className="text-sky-700">{rep.observedTemperature}°C • {rep.observedWeatherCondition}</strong>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span>Destinataire : <strong className="text-slate-900">{rep.humanDispatch?.targetEmail || REPORT_CONTACT_EMAIL}</strong></span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Envoyé</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
