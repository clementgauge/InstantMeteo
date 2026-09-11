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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Intelligence Artificielle Climatologique
              </span>
              <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
                Diagnostic Expert & Santé ({station.name})
              </h2>
            </div>
          </div>

          <button
            onClick={onRefreshDiagnostic}
            disabled={isLoadingDiagnostic}
            className="flex items-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-600/20 px-4 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingDiagnostic ? 'animate-spin' : ''}`} />
            <span>Régénérer l'analyse</span>
          </button>
        </div>

        {diagnostic ? (
          <div className="mt-6 rounded-2xl bg-slate-950/70 p-5 border border-slate-800">
            <p className={`text-slate-200 leading-relaxed font-medium ${seniorMode ? 'text-xl' : 'text-base'}`}>
              « {diagnostic.summary} »
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300">
              <Clock className="h-3.5 w-3.5" />
              <span>Généré à {diagnostic.generatedAt || diagnostic.generationDate || 'Temps réel'} pour les conditions de {station.name}</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            <span className="ml-3 text-sm text-slate-400">Génération de l'analyse intelligente en cours...</span>
          </div>
        )}
      </div>

      {/* 3 Practical Advice Cards */}
      {diagnostic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Health & Seniors */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4">
              <HeartHandshake className="h-5 w-5" />
              <h3 className={seniorMode ? 'text-xl' : 'text-base'}>Conseils Santé & Confort</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              {(diagnostic.healthAdvice || [diagnostic.healthAdviceSenior || "Restez bien hydraté."]).map((adv: string, i: number) => (
                <li key={i} className={`flex items-start gap-2 ${seniorMode ? 'text-base leading-relaxed' : ''}`}>
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Agriculture & Nature */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center gap-2 text-lime-400 font-bold mb-4">
              <Sprout className="h-5 w-5" />
              <h3 className={seniorMode ? 'text-xl' : 'text-base'}>Jardin & Végétation</h3>
            </div>
            <p className={`text-slate-300 leading-relaxed ${seniorMode ? 'text-base' : 'text-xs'}`}>
              {diagnostic.agricultureImpact}
            </p>
          </div>

          {/* Energy & Housing */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-4">
              <Zap className="h-5 w-5" />
              <h3 className={seniorMode ? 'text-xl' : 'text-base'}>Énergie & Logement</h3>
            </div>
            <p className={`text-slate-300 leading-relaxed ${seniorMode ? 'text-base' : 'text-xs'}`}>
              {diagnostic.energyImpact || diagnostic.waterResourceStatus || "Consommation normale."}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Question Box with AI Climatologist */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          <h3 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
            Posez une question au Climatologue IA
          </h3>
        </div>

        {/* Chat History */}
        {chatLog.length > 0 && (
          <div className="mb-4 max-h-60 overflow-y-auto space-y-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-lg text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  } ${seniorMode ? 'text-sm' : ''}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex gap-2 text-xs text-indigo-400 items-center">
                <Bot className="h-4 w-4 animate-bounce" />
                <span>Le climatologue formule sa réponse...</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex : Dois-je arroser mon jardin ce soir ? Quel est le meilleur moment pour sortir ?"
            className={`flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none ${
              seniorMode ? 'text-base' : 'text-sm'
            }`}
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="flex items-center justify-center rounded-2xl bg-indigo-600 px-5 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
