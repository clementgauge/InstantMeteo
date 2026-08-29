import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Thermometer, 
  CloudRain, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  History, 
  Mail, 
  FileText, 
  Zap, 
  ShieldCheck, 
  MessageSquare,
  Info
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { 
  UserObservationReport, 
  RecalibrationState, 
  processUserObservationSubmission, 
  getSavedUserReports, 
  getActiveRecalibration, 
  clearActiveRecalibration 
} from '../services/userObservationService';

interface UserWeatherReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: LocationPoint;
  currentWeather: CurrentWeather | null;
  onRecalibrationUpdated: (recal: RecalibrationState | null) => void;
  activeRecalibration: RecalibrationState | null;
}

const COMMON_WEATHER_CONDITIONS = [
  '☀️ Ciel dégagé / Grand soleil',
  '⛅ Ciel voilé / Nuages épars',
  '☁️ Ciel couvert / Stratus',
  '🌧️ Pluie faible à modérée',
  '🌧️🌧️ Pluie forte / Averse torrentielle',
  '⚡ Orage / Éclairs / Tonnerre',
  '🧊 Grêle / Grêlons',
  '🌫️ Brouillard épais / Givre',
  '❄️ Neige / Verglas',
  '💨 Rafales de vent violentes'
];

const DISCREPANCY_TYPES = [
  { id: 'TEMP_DIFF', label: '🌡️ Température affichée inexacte (Écart °C)' },
  { id: 'WEATHER_MISMATCH', label: '🌧️ Temps en direct incorrect (Ex: pluie sur le terrain vs soleil affiché)' },
  { id: 'STORM_UNNOTICED', label: '⚡ Orage ou bourrasque de vent non détecté' },
  { id: 'DELAYED_TIMING', label: '⏱️ Décalage horaire dans l’arrivée de la pluie' },
  { id: 'OTHER', label: '💬 Autre précision ou phénomène local particulier' }
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
  const [responseChannel, setResponseChannel] = useState<'ai' | 'human'>('ai');

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
          discrepancyType: `${discrepancyType} [Canal: ${responseChannel === 'human' ? 'Humain instantmeteofr@gmail.com' : 'IA Instant Météo'}]`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
          <div className="rounded-2xl bg-cyan-600/20 p-3 text-cyan-400 border border-cyan-500/30">
            <AlertTriangle className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Signaler une Observation / Corriger la Météo</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800">
                Amélioration Participative
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Station : <strong className="text-slate-200">{currentStation.name} ({currentStation.department})</strong> • Transmettez vos relevés réels pour ajuster nos modèles en direct.
            </p>
          </div>
        </div>

        {/* Active Recalibration Alert Banner */}
        {activeRecalibration && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border border-amber-500/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400 animate-bounce" />
                Mode Recalibrage d'Urgence Météo Actif (30 min)
              </span>
              <button
                onClick={handleStopCalibration}
                className="text-[11px] font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 px-2.5 py-1 rounded-xl transition"
              >
                Réinitialiser la station
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vos observations sont actuellement appliquées à la station de <strong>{activeRecalibration.stationName}</strong> (Offset : {activeRecalibration.tempOffset > 0 ? '+' : ''}{activeRecalibration.tempOffset}°C). La fréquence d'actualisation des prévisions et du radar est poussée à son maximum.
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'form' 
                ? 'bg-cyan-500 text-slate-950 font-black shadow' 
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Nouveau Signalement</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-cyan-500 text-slate-950 font-black shadow' 
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Historique & Diagnostic IA ({pastReports.length})</span>
          </button>
        </div>

        {/* TAB 1: FORM */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current App Display Baseline */}
            {currentWeather && (
              <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Valeur actuellement affichée par l'application :</span>
                  <span className="font-black text-white text-sm">
                    {currentWeather.temperature}°C • {currentWeather.weatherDescription}
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-800">
                  Station {currentStation.name}
                </span>
              </div>
            )}

            {/* Inputs: Observed Temp & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Temperature Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-rose-400" />
                  <span>Température réelle observée (°C) *</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={observedTemp}
                    onChange={(e) => setObservedTemp(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white font-mono font-bold text-base focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3 text-sm font-bold text-slate-400">°C</span>
                </div>
              </div>

              {/* Weather Condition Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                  <CloudRain className="h-4 w-4 text-blue-400" />
                  <span>Temps réel observé sur place *</span>
                </label>
                <select
                  value={observedCondition}
                  onChange={(e) => setObservedCondition(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                >
                  {COMMON_WEATHER_CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discrepancy Category Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-400" />
                <span>Type de décalage ou d'erreur constatée *</span>
              </label>
              <select
                value={discrepancyType}
                onChange={(e) => setDiscrepancyType(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
              >
                {DISCREPANCY_TYPES.map((dt) => (
                  <option key={dt.id} value={dt.label}>{dt.label}</option>
                ))}
              </select>
            </div>

            {/* Choice: AI response vs Human response */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Mode de réponse souhaité *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResponseChannel('ai')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    responseChannel === 'ai'
                      ? 'border-cyan-400 bg-cyan-950/50 text-white ring-1 ring-cyan-400/50'
                      : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-xs text-cyan-300">
                    <span>🤖 Réponse Instantanée par IA</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Diagnostic météorologique immédiat, calibration synoptique en direct et explication physique.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setResponseChannel('human')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    responseChannel === 'human'
                      ? 'border-amber-400 bg-amber-950/50 text-white ring-1 ring-amber-400/50'
                      : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-xs text-amber-300">
                    <span>👨‍💻 Réponse par un Humain (Expert)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Étude par notre équipe météo à l'adresse : <strong className="text-amber-200 underline">instantmeteofr@gmail.com</strong>
                  </p>
                </button>
              </div>
            </div>

            {/* User Comments / Explanation */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-teal-400" />
                <span>Précisions & Détails de votre observation (Optionnel)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ex : 'Il pleut à verse dans le centre-ville depuis 15 minutes avec 28°C sur mon thermomètre de jardin, alors que la carte indique soleil...'"
                value={userComments}
                onChange={(e) => setUserComments(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none leading-relaxed"
              ></textarea>
            </div>

            {/* Optional Email Contact for Direct Response */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span>Votre adresse e-mail ({responseChannel === 'human' ? 'Recommandé pour recevoir la réponse de l\'équipe' : 'Optionnel'})</span>
              </label>
              <input
                type="email"
                placeholder="nom@exemple.fr"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Rate limit cooldown notice if active */}
            {remainingCooldownSeconds > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                <span>
                  <strong>Délai de sécurité anti-spam actif :</strong> Veuillez patienter encore{' '}
                  <strong className="text-amber-300">{Math.floor(remainingCooldownSeconds / 60)} min {remainingCooldownSeconds % 60} s</strong> avant de transmettre un nouveau signalement (limite de 15 minutes).
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || remainingCooldownSeconds > 0}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Traitement du signalement...</span>
                  </>
                ) : remainingCooldownSeconds > 0 ? (
                  <>
                    <Clock className="h-4 w-4 text-slate-950" />
                    <span>Patienter {Math.floor(remainingCooldownSeconds / 60)}m {remainingCooldownSeconds % 60}s</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-slate-950" />
                    <span>Envoyer mon observation ({responseChannel === 'human' ? 'Support Humain' : 'IA Instant Météo'})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: HISTORY & AI RESPONSE */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Show Last Submitted Report Prominently */}
            {lastSubmittedReport && (
              <div className="rounded-2xl border border-cyan-500/60 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-cyan-300 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Signalement Reçu • Analyse Météorologique Personnalisée</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{lastSubmittedReport.timestamp}</span>
                </div>

                {/* AI Explanation Paragraph */}
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-white">{lastSubmittedReport.aiResponse.title}</h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {lastSubmittedReport.aiResponse.meteorologicalExplanation}
                  </p>
                </div>

                {/* Recalibration & Personal Answer */}
                <div className="rounded-xl bg-cyan-950/60 border border-cyan-800 p-3.5 space-y-2 text-xs">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Ajustement Technique Immédiat :</span>
                  </div>
                  <p className="text-slate-200">{lastSubmittedReport.aiResponse.recalibrationApplied}</p>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-2 text-xs">
                  <div className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span>Message du Prévisionniste :</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{lastSubmittedReport.aiResponse.personalizedAnswer}</p>
                </div>
              </div>
            )}

            {/* List of Past Reports */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                <span>Tous vos signalements enregistrés sur cet appareil ({pastReports.length})</span>
              </h4>

              {pastReports.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Aucun signalement précédent. Vos futures contributions apparaîtront ici.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {pastReports.map((rep) => (
                    <div key={rep.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                        <span className="font-black text-white">📍 {rep.stationName} ({rep.department})</span>
                        <span className="text-[10px] text-slate-400 font-mono">{rep.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Affiché :</span>
                          <strong>{rep.appDisplayedTemperature}°C • {rep.appDisplayedWeather}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Votre relevé :</span>
                          <strong className="text-cyan-300">{rep.observedTemperature}°C • {rep.observedWeatherCondition}</strong>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        <span className="text-cyan-400 font-bold block mb-0.5">Analyse IA :</span>
                        {rep.aiResponse.meteorologicalExplanation}
                      </p>
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
