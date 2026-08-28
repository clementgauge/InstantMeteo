import React from 'react';
import { X, Printer, FileText, CheckCircle2, CloudRain, Thermometer, Wind, AlertTriangle } from 'lucide-react';
import { LocationPoint, CurrentWeather, ClimateAnomaly, AiDiagnostic } from '../types/weather';

interface DossierExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LocationPoint;
  weather: CurrentWeather;
  anomaly: ClimateAnomaly;
  diagnostic?: AiDiagnostic | null;
  seniorMode: boolean;
}

export const DossierExportModal: React.FC<DossierExportModalProps> = ({
  isOpen,
  onClose,
  station,
  weather,
  anomaly,
  diagnostic,
  seniorMode
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        id="dossier-export-modal"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          aria-label="Fermer"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dossier Météorologique & Climatique</h2>
            <p className="text-xs text-slate-400">Édition officielle générée pour la station de {station.name}</p>
          </div>
        </div>

        {/* Printable Area */}
        <div className="mt-6 space-y-6 rounded-2xl bg-slate-950 p-6 border border-slate-800 text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-2xl font-black text-white">{station.name}</h3>
              <p className="text-sm text-slate-400">{station.department} • Région {station.region}</p>
              <p className="text-xs text-slate-500">Altitude : {station.altitude}m • Climat : {station.climateZone}</p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-blue-900/60 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-700">
                Bulletin du {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <p className="mt-1 text-xs text-slate-400">Relevé à {weather.timestamp}</p>
            </div>
          </div>

          {/* Current Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="text-xs text-slate-400">Température</span>
              <p className="text-2xl font-black text-white">{weather.temperature}°C</p>
              <span className="text-xs text-slate-500">Ressenti : {weather.feelsLike}°C</span>
            </div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="text-xs text-slate-400">Écart Normale 1991-20</span>
              <p className={`text-2xl font-black ${anomaly.isWarmAnomaly ? 'text-amber-400' : 'text-blue-400'}`}>
                {anomaly.tempAnomaly > 0 ? `+${anomaly.tempAnomaly}` : anomaly.tempAnomaly}°C
              </p>
              <span className="text-xs text-slate-500">Moyenne : {anomaly.normalTemp}°C</span>
            </div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="text-xs text-slate-400">Vent & Rafales</span>
              <p className="text-2xl font-black text-white">{weather.windSpeed} <span className="text-sm font-normal text-slate-400">km/h</span></p>
              <span className="text-xs text-slate-500">Rafales : {weather.windGust} km/h</span>
            </div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="text-xs text-slate-400">Qualité de l'Air</span>
              <p className="text-2xl font-black text-emerald-400">AQI {weather.airQualityAqi}</p>
              <span className="text-xs text-slate-500">{weather.airQualityLabel}</span>
            </div>
          </div>

          {/* Historical context */}
          <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800">
            <h4 className="text-sm font-bold text-slate-300 mb-2">Repères Historiques de la Station :</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
              <p>🔥 Record de chaleur absolu : <strong className="text-rose-400">{station.allTimeRecordMax}°C</strong></p>
              <p>❄️ Record de froid absolu : <strong className="text-cyan-400">{station.allTimeRecordMin}°C</strong></p>
              <p>🌧️ Record pluie 24h : <strong className="text-blue-400">{station.allTimeRecordRain24h} mm</strong></p>
            </div>
          </div>

          {/* AI Diagnostic in Report */}
          {diagnostic && (
            <div className="rounded-xl bg-slate-900 p-4 border border-indigo-500/30 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                Diagnostic Climatologique & Consignes Santé :
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed italic">{diagnostic.summary}</p>
              <div className="space-y-1 pt-1">
                {(diagnostic.healthAdvice || [diagnostic.healthAdviceSenior || "Restez bien hydraté."]).map((advice: string, i: number) => (
                  <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{advice}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2.5 font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <Printer className="h-5 w-5" />
            <span>Imprimer le Dossier Météo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
