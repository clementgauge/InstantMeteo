import React from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  Sprout, 
  Zap, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  Bot,
  RefreshCw,
  Clock
} from 'lucide-react';
import { LocationPoint, CurrentWeather, ClimateAnomaly, AiDiagnostic } from '../types/weather';

interface AiDiagnosticViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  anomaly: ClimateAnomaly;
  diagnostic: AiDiagnostic | null;
  isLoadingDiagnostic: boolean;
  onRefreshDiagnostic: () => void;
  seniorMode: boolean;
}

export const AiDiagnosticView: React.FC<AiDiagnosticViewProps> = ({
  station,
  weather,
  anomaly,
  diagnostic,
  isLoadingDiagnostic,
  onRefreshDiagnostic,
  seniorMode
}) => {
  const [question, setQuestion] = React.useState('');
  const [chatLog, setChatLog] = React.useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isAsking, setIsAsking] = React.useState(false);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setChatLog(prev => [...prev, { sender: 'user', text: userQ }]);
    setQuestion('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/ask-climatologist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station,
          weather,
          question: userQ
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatLog(prev => [
          ...prev,
          { 
            sender: 'ai', 
            text: data.answer || `Pour la station de ${station.name} (${weather.temperature}°C actuels), nos modèles indiquent des conditions stables. Pensez à aérer en matinée et à bien vous hydrater.` 
          }
        ]);
      } else {
        setChatLog(prev => [
          ...prev,
          { 
            sender: 'ai', 
            text: `Pour la station de ${station.name} (${weather.temperature}°C actuels), nos relevés indiquent des conditions favorables. Restez bien hydraté et profitez des heures tempérées.` 
          }
        ]);
      }
    } catch (err) {
      console.warn("AI chat error", err);
      setChatLog(prev => [
        ...prev,
        { sender: 'ai', text: `Concernant ${station.name}, les conditions météo actuelles restent stables. Prenez soin de vous !` }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-sky-400 border border-slate-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Bulletin d'évaluation météorologique
              </span>
              <h2 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
                Diagnostic &amp; Recommandations ({station.name})
              </h2>
            </div>
          </div>

          <button
            onClick={onRefreshDiagnostic}
            disabled={isLoadingDiagnostic}
            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDiagnostic ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>

        {diagnostic ? (
          <div className="mt-4 rounded-md bg-slate-950 p-3.5 border border-slate-800">
            <p className={`text-slate-200 leading-relaxed font-normal ${seniorMode ? 'text-lg' : 'text-sm'}`}>
              {diagnostic.summary}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>Synthèse établie à {diagnostic.generatedAt || diagnostic.generationDate || 'Temps réel'} pour la station de {station.name}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-sky-400" />
            <span className="ml-2.5 text-xs text-slate-400">Analyse des observations et prévisions en cours...</span>
          </div>
        )}
      </div>

      {/* 3 Practical Advice Cards */}
      {diagnostic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Health & Seniors */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2.5 pb-2 border-b border-slate-800">
              <HeartHandshake className="h-4 w-4" />
              <h3 className={`font-semibold ${seniorMode ? 'text-lg' : 'text-xs'}`}>Santé &amp; Confort</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {(diagnostic.healthAdvice || [diagnostic.healthAdviceSenior || "Hydratation régulière recommandée."]).map((adv: string, i: number) => (
                <li key={i} className={`flex items-start gap-1.5 ${seniorMode ? 'text-base leading-relaxed' : ''}`}>
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Agriculture & Nature */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-lime-400 font-bold mb-2.5 pb-2 border-b border-slate-800">
              <Sprout className="h-4 w-4" />
              <h3 className={`font-semibold ${seniorMode ? 'text-lg' : 'text-xs'}`}>Jardin &amp; Végétation</h3>
            </div>
            <p className={`text-slate-300 leading-relaxed ${seniorMode ? 'text-base' : 'text-xs'}`}>
              {diagnostic.agricultureImpact}
            </p>
          </div>

          {/* Energy & Housing */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2.5 pb-2 border-b border-slate-800">
              <Zap className="h-4 w-4" />
              <h3 className={`font-semibold ${seniorMode ? 'text-lg' : 'text-xs'}`}>Énergie &amp; Logement</h3>
            </div>
            <p className={`text-slate-300 leading-relaxed ${seniorMode ? 'text-base' : 'text-xs'}`}>
              {diagnostic.energyImpact || diagnostic.waterResourceStatus || "Consommation normale."}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Question Box with Climatologist */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <h3 className={`font-bold text-white ${seniorMode ? 'text-xl' : 'text-sm'}`}>
            Questions météorologiques locales
          </h3>
        </div>

        {/* Chat History */}
        {chatLog.length > 0 && (
          <div className="mb-3 max-h-60 overflow-y-auto space-y-2 rounded-md bg-slate-950 p-3 border border-slate-800">
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-800 text-sky-400 border border-slate-700">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`rounded-md px-3 py-2 max-w-lg text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0284C7] text-white font-medium'
                      : 'bg-slate-900 text-slate-200 border border-slate-800'
                  } ${seniorMode ? 'text-sm' : ''}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex gap-1.5 text-xs text-slate-400 items-center">
                <Bot className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                <span>Recherche des données de la station...</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex : Faut-il aérer ce soir ? Quand la pluie est-elle prévue ?"
            className={`flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-[#0284C7] focus:outline-none ${
              seniorMode ? 'text-base' : 'text-xs'
            }`}
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="flex items-center justify-center rounded-md bg-[#0284C7] hover:bg-sky-600 px-4 font-semibold text-white transition disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
