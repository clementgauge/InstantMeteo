import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  MapPin, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Zap, 
  LineChart, 
  CheckCircle2, 
  RefreshCw,
  Compass,
  X,
  Camera,
  Table as TableIcon,
  Copy,
  Check,
  Square,
  Scale,
  BookOpen,
  HeartPulse,
  ExternalLink,
  Globe
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { getFallbackWeatherData } from '../services/openMeteoService';
import {
  AURA_CLIENT_ERROR_MESSAGE,
  AuraChatHistoryItem,
  AuraPersonaMode,
  AuraSource,
  streamAuraChat
} from '../services/geminiService';
import { AuraBotAvatar } from '../components/AuraBotAvatar';
import { Aura3DAtmosphericMap, Map3DMetric } from '../components/Aura3DAtmosphericMap';
import { AuraObservatorySnapshot } from '../components/AuraObservatorySnapshot';

interface AuraWeatherAiViewProps {
  currentStation: LocationPoint;
  weather: CurrentWeather | null;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onBackToMain?: () => void;
  onNavigateTab?: (tab: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export interface ChartDatasetItem {
  label: string;
  data: number[];
  color: string;
  fill?: boolean;
  type?: 'line' | 'bar';
}

// Clés localStorage pour persistance conversation & persona
const AURA_HISTORY_STORAGE_KEY = 'instant_meteo_aura_history_v2';
const AURA_PERSONA_STORAGE_KEY = 'instant_meteo_aura_persona_v1';

interface ChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  comparison?: {
    stationA: { name: string; temp: string; wind: string; condition: string; icon: string };
    stationB: { name: string; temp: string; wind: string; condition: string; icon: string };
    tempDiff: string;
    windDiff: string;
    summary: string;
  };
  card?: {
    location: string;
    stationId?: string;
    department?: string;
    temp: string;
    feelsLike: string;
    condition: string;
    windInfo: string;
    icon: string;
    isPlainSnowAlert?: boolean;
    isGaleAlert?: boolean;
  };
  chart?: {
    id: string;
    title: string;
    cityName: string;
    type: 'line' | 'bar';
    labels: string[];
    datasets?: ChartDatasetItem[];
    datasetLabel?: string;
    data?: number[];
    color?: string;
  };
  map3D?: {
    metric: Map3DMetric;
    title: string;
    focusCityName?: string;
  };
  snapshot?: {
    type: 'radar' | 'ensemble14d' | 'nephology' | 'radiation' | 'anomaly';
    stationName: string;
  };
  table?: {
    title: string;
    columns: string[];
    rows: (string | number)[][];
  };
  sources?: AuraSource[];
  verificationStatus?: 'verified' | 'corrected';
  isStreaming?: boolean;
  isError?: boolean;
  timestamp: string;
}

const buildWelcomeMessage = (station: LocationPoint, safeWeather: CurrentWeather): ChatMessage => ({
  id: 'welcome',
  sender: 'aura',
  text: `Bonjour ! Je suis **AURA**, votre assistante intelligente sur **Instant Météo**.\n\nJe réponds à **toutes** vos questions (météo en direct dans le monde, archives réelles, sciences, calculs, actualités, rédaction, cuisine...) et je peux générer graphiques, tableaux et cartes 3D :\n- 📍 **Météo & prévisions** : *"Quel temps à Brest ?"*, *"À 14h hier à Lyon ?"*\n- 📊 **Graphiques & Comparatifs** : *"Compare Paris et Nice sur un graphique"*\n- 🗺️ **Cartes 3D & Radar** : *"Carte 3D de la France"*, *"Capture du radar"*\n- 🧠 **Généraliste & Calculs** : *"Loi d'Ohm pour 230V et 1kΩ"*, *"Dernier match du PSG"*`,
  card: {
    location: station.name,
    stationId: station.id,
    department: station.department,
    temp: `${safeWeather.temperature.toFixed(1)}°C`,
    feelsLike: `${safeWeather.feelsLike.toFixed(1)}°C`,
    condition: safeWeather.weatherDescription,
    windInfo: `${safeWeather.windSpeed} km/h (rafales ${safeWeather.windGust ?? Math.round(safeWeather.windSpeed * 1.35)} km/h)`,
    icon: safeWeather.temperature >= 22 ? '☀️' : '⛅'
  },
  timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
});

export const AuraWeatherAiView: React.FC<AuraWeatherAiViewProps> = ({
  currentStation,
  weather,
  hourly = [],
  daily = [],
  tempUnit = 'C',
  onSelectStation,
  onBackToMain,
  onNavigateTab,
  isModal = false,
  onClose
}) => {
  const safeWeather: CurrentWeather = useMemo(() => {
    return weather ?? getFallbackWeatherData(currentStation).current;
  }, [weather, currentStation]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(AURA_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const restored = parsed
            .filter((m: any) => m && typeof m.id === 'string' && typeof m.text === 'string' && (m.sender === 'user' || m.sender === 'aura'))
            .map((m: any) => ({ ...m, isStreaming: false }));
          if (restored.length > 0) return restored;
        }
      }
    } catch {
      // ignore localStorage read error
    }
    return [buildWelcomeMessage(currentStation, safeWeather)];
  });

  const [personaMode, setPersonaMode] = useState<AuraPersonaMode>(() => {
    try {
      const saved = localStorage.getItem(AURA_PERSONA_STORAGE_KEY);
      if (saved === 'standard' || saved === 'expert' || saved === 'health' || saved === 'pedagogue') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'standard';
  });

  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [thinkingStatus, setThinkingStatus] = useState<string>('AURA réfléchit…');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const toSave = messages
        .filter((m) => !m.isStreaming)
        .slice(-40);
      localStorage.setItem(AURA_HISTORY_STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // ignore localStorage quota/privacy error
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(AURA_PERSONA_STORAGE_KEY, personaMode);
    } catch {
      // ignore
    }
  }, [personaMode]);

  const handleSpeakMessage = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/[#_\-`]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMessage = (id: string, text: string) => {
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanText).then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2200);
      }).catch(() => {});
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatStreamRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chartInstancesRef = useRef<Record<string, Chart>>({});

  // 1. Détermination de l'état atmosphérique selon la météo actuelle
  const weatherState = useMemo(() => {
    const code = safeWeather.weatherCode;
    const temp = safeWeather.temperature;
    if ([95, 96, 99].includes(code) || (safeWeather.windGust ?? 0) >= 70) {
      return {
        key: 'STORMY',
        name: 'Orageux & Coup de vent',
        icon: Zap,
        glow1: 'rgba(129, 140, 248, 0.25)',
        glow2: 'rgba(168, 85, 247, 0.2)'
      };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code) || temp <= 1.0) {
      return {
        key: 'SNOWY',
        name: 'Neige & Froid hivernal',
        icon: Snowflake,
        glow1: 'rgba(186, 230, 253, 0.25)',
        glow2: 'rgba(147, 197, 253, 0.15)'
      };
    }
    const liveRainProb = hourly?.[0]?.precipitationProbability ?? (safeWeather.precipitation > 0 ? 80 : 0);
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code) || liveRainProb >= 40) {
      return {
        key: 'RAINY',
        name: 'Averses & Précipitations',
        icon: CloudRain,
        glow1: 'rgba(56, 189, 248, 0.2)',
        glow2: 'rgba(99, 102, 241, 0.15)'
      };
    }
    return {
      key: 'SUNNY',
      name: 'Clair & Tempéré',
      icon: Sun,
      glow1: 'rgba(245, 158, 11, 0.2)',
      glow2: 'rgba(251, 146, 60, 0.15)'
    };
  }, [safeWeather, hourly]);

  // 2. Moteur Canvas Atmosphérique d'AURA
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = weatherState.key === 'RAINY' ? 70 : weatherState.key === 'SNOWY' ? 55 : 35;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 3 + 1.5,
      radius: Math.random() * 2 + 1,
      length: Math.random() * 14 + 8,
      opacity: Math.random() * 0.6 + 0.2,
      velX: (Math.random() - 0.5) * 1.5,
      velY: Math.random() * 1.5 + 0.8,
      angle: Math.random() * Math.PI * 2
    }));

    let lightningFlash = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (weatherState.key === 'STORMY' && Math.random() < 0.008) {
        lightningFlash = 0.35;
      }
      if (lightningFlash > 0) {
        ctx.fillStyle = `rgba(224, 231, 255, ${lightningFlash})`;
        ctx.fillRect(0, 0, width, height);
        lightningFlash -= 0.03;
      }

      particles.forEach((p) => {
        ctx.beginPath();
        if (weatherState.key === 'RAINY' || weatherState.key === 'STORMY') {
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.velX, p.y + p.length);
          ctx.stroke();
          p.y += p.speed;
          p.x += p.velX;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        } else if (weatherState.key === 'SNOWY') {
          ctx.fillStyle = `rgba(240, 249, 255, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.velY;
          p.x += Math.sin(p.angle) * 0.5;
          p.angle += 0.02;
          if (p.y > height) {
            p.y = -5;
            p.x = Math.random() * width;
          }
        } else {
          ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity * 0.45})`;
          ctx.arc(p.x, p.y, p.radius * 1.2, 0, Math.PI * 2);
          ctx.fill();
          p.y -= p.velY * 0.25;
          p.x += Math.cos(p.angle) * 0.3;
          if (p.y < 0) {
            p.y = height + 5;
            p.x = Math.random() * width;
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weatherState]);

  // 3. Audio Chime Synthesizer
  const playChime = () => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio fallback silent
    }
  };

  // 4. Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatStreamRef.current) {
        chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
      }
    }, 100);
  };

  // 5. Render Chart.js charts
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.chart && !chartInstancesRef.current[msg.chart.id]) {
        const canvasEl = document.getElementById(msg.chart.id) as HTMLCanvasElement | null;
        if (canvasEl) {
          const ctx = canvasEl.getContext('2d');
          if (ctx) {
            const chartConfig = msg.chart;
            const datasets = chartConfig.datasets && chartConfig.datasets.length > 0
              ? chartConfig.datasets.map(ds => ({
                  label: ds.label,
                  data: ds.data,
                  borderColor: ds.color,
                  backgroundColor: ds.type === 'bar' ? `${ds.color}80` : (ds.fill ? `${ds.color}25` : 'transparent'),
                  borderWidth: 2.5,
                  pointRadius: 4,
                  pointBackgroundColor: ds.color,
                  tension: 0.35,
                  fill: ds.fill ?? false
                }))
              : [
                  {
                    label: chartConfig.datasetLabel || 'Valeurs',
                    data: chartConfig.data || [],
                    borderColor: chartConfig.color || '#38BDF8',
                    backgroundColor: chartConfig.type === 'bar' 
                      ? `${chartConfig.color || '#38BDF8'}80` 
                      : `${chartConfig.color || '#38BDF8'}20`,
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointBackgroundColor: chartConfig.color || '#38BDF8',
                    tension: 0.35,
                    fill: chartConfig.type !== 'bar'
                  }
                ];

            chartInstancesRef.current[chartConfig.id] = new Chart(ctx, {
              type: chartConfig.type,
              data: {
                labels: chartConfig.labels,
                datasets: datasets as any
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: datasets.length > 1,
                    labels: {
                      color: '#94A3B8',
                      font: { size: 10, weight: 'bold' }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#F8FAFC',
                    bodyColor: '#38BDF8',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderWidth: 1,
                    padding: 8,
                    cornerRadius: 8
                  }
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94A3B8', font: { size: 10 } }
                  },
                  y: {
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    ticks: { color: '#94A3B8', font: { size: 10 } }
                  }
                }
              }
            });
          }
        }
      }
    });
  }, [messages]);

  // Cleanup Chart.js & ongoing requests on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      Object.values(chartInstancesRef.current).forEach((chart) => {
        try {
          chart.destroy();
        } catch {
          // ignore
        }
      });
      chartInstancesRef.current = {};
    };
  }, []);

  const handleNewConversation = () => {
    abortControllerRef.current?.abort();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    Object.values(chartInstancesRef.current).forEach((chart) => {
      try {
        chart.destroy();
      } catch {
        // ignore
      }
    });
    chartInstancesRef.current = {};
    setIsThinking(false);
    setThinkingStatus('AURA réfléchit…');
    const freshWelcome = [buildWelcomeMessage(currentStation, safeWeather)];
    setMessages(freshWelcome);
    try {
      localStorage.removeItem(AURA_HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // 6. MOTEUR IA CONVERSATIONNEL AURA (GEMINI ROUTER + OUTILS + AUTOCORRECTION + SSE)
  const handleProcessQuery = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || isThinking) return;

    const historyToSend: AuraChatHistoryItem[] = messages
      .filter((m) => m.id !== 'welcome' && !m.isError && !m.isStreaming && m.text.trim())
      .slice(-12)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: cleanQuery,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    const streamMsgId = `aura_${Date.now() + 1}`;
    let streamMessageCreated = false;

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    setThinkingStatus('AURA réfléchit…');
    scrollToBottom();

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamAuraChat(
      {
        message: cleanQuery,
        history: historyToSend,
        station: currentStation,
        weather: safeWeather,
        personaMode,
        signal: controller.signal
      },
      {
        onStatus: (_phase, label) => {
          setThinkingStatus(label || 'AURA réfléchit…');
        },
        onResetText: () => {
          if (streamMessageCreated) {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamMsgId ? { ...m, text: '' } : m))
            );
          }
        },
        onChunk: (delta) => {
          if (!streamMessageCreated) {
            streamMessageCreated = true;
            setMessages((prev) => [
              ...prev,
              {
                id: streamMsgId,
                sender: 'aura',
                text: delta,
                isStreaming: true,
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamMsgId ? { ...m, text: m.text + delta } : m))
            );
          }
          if (chatStreamRef.current) {
            chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
          }
        },
        onDone: (payload) => {
          setIsThinking(false);
          playChime();
          const finalTimestamp = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === streamMsgId);
            const completedMsg: ChatMessage = {
              id: streamMsgId,
              sender: 'aura',
              text: payload.text || 'Réponse générée.',
              card: payload.card,
              comparison: payload.comparison,
              chart: payload.chart,
              map3D: payload.map3D,
              snapshot: payload.snapshot,
              table: payload.table,
              sources: payload.sources,
              verificationStatus: payload.verificationStatus,
              isStreaming: false,
              timestamp: finalTimestamp
            };
            if (exists) {
              return prev.map((m) => (m.id === streamMsgId ? completedMsg : m));
            }
            return [...prev, completedMsg];
          });
          scrollToBottom();
        },
        onError: (errMsg) => {
          setIsThinking(false);
          const errorTimestamp = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          setMessages((prev) => {
            const cleaned = prev.filter((m) => m.id !== streamMsgId);
            return [
              ...cleaned,
              {
                id: `aura_err_${Date.now()}`,
                sender: 'aura',
                text: errMsg || AURA_CLIENT_ERROR_MESSAGE,
                isError: true,
                timestamp: errorTimestamp
              }
            ];
          });
          scrollToBottom();
        }
      }
    );
  };

  // 7. Voice input (Web Speech API)
  const handleToggleVoice = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputText(text);
          handleProcessQuery(text);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const formatMarkdown = (content: string) => {
    const safe = escapeHtml(content);
    return safe
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800/90 text-sky-300 font-mono text-[11px]">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-300">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-sky-200">$1</em>');
  };

  const isSafeExternalUrl = (rawUrl: string): boolean => {
    try {
      const parsed = new URL(rawUrl);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const renderViewContent = () => (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#05070B] text-slate-100 flex flex-col justify-between">
      {/* 1. ATMOSPHERIC CANVAS ENGINE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[130px] transition-all duration-1000 ease-out pointer-events-none"
          style={{ backgroundColor: weatherState.glow1 }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[160px] transition-all duration-1000 ease-out pointer-events-none"
          style={{ backgroundColor: weatherState.glow2 }}
        />
        {weatherState.key === 'SNOWY' && (
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(186,230,253,0.22)]" />
        )}
      </div>

      {/* 2. HEADER NAVBAR (Compact & ergonomique sur mobile) */}
      <header className="relative z-20 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer"
              title="Retour à Instant Météo"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {/* Logo AURA */}
          <AuraBotAvatar size="sm" glow={true} className="sm:hidden" />
          <AuraBotAvatar size="md" glow={true} className="hidden sm:flex" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-serif text-base sm:text-xl font-bold tracking-wide text-white">AURA</h1>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                Weather AI
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                Données Instant Météo
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[150px] sm:max-w-xs">
              <span className="text-sky-300 font-medium">{currentStation.name}</span> &bull; {safeWeather.temperature.toFixed(1)}°C
            </p>
          </div>
        </div>

        {/* Action Controls : Nouvelle conversation, audio & close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleNewConversation}
            title="Démarrer une nouvelle conversation"
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden sm:inline">Nouvelle</span>
          </button>

          {/* Soundscape audio toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title={isAudioMuted ? 'Activer le carillon sonore atmosphérique' : 'Couper le son'}
            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl border transition flex items-center justify-center cursor-pointer ${
              !isAudioMuted 
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-sky-300" />}
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center justify-center cursor-pointer"
              title="Fermer la boîte de dialogue AURA"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2b. SELECTEUR DE PERSONA AURA */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-2.5 sm:px-6 pt-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {(
            [
              { id: 'standard', label: 'Standard', icon: Sparkles },
              { id: 'expert', label: 'Expert météo', icon: Compass },
              { id: 'health', label: 'Santé & confort', icon: HeartPulse },
              { id: 'pedagogue', label: 'Pédagogue', icon: BookOpen }
            ] as const
          ).map((mode) => {
            const IconComp = mode.icon;
            const active = personaMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPersonaMode(mode.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  active
                    ? 'bg-sky-500/20 text-sky-200 border-sky-400/50 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <IconComp className={`h-3 w-3 ${active ? 'text-sky-300' : 'text-slate-400'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONVERSATIONAL CHAT CONTAINER */}
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col justify-between w-full max-w-4xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3">
        
        {/* Chat Stream (Flexible & scrollable sur mobile) */}
        <div ref={chatStreamRef} className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 sm:pr-2 overscroll-contain">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'aura' && (
                <AuraBotAvatar size="sm" glow={true} className="mt-1" />
              )}

              <div
                className={`p-3.5 sm:p-5 rounded-2xl max-w-[90%] sm:max-w-2xl space-y-2.5 shadow-xl backdrop-blur-2xl border ${
                  msg.sender === 'user'
                    ? 'rounded-tr-sm bg-sky-500/20 border-sky-400/35 text-white'
                    : 'rounded-tl-sm bg-slate-900/80 border-white/10 text-slate-200'
                }`}
              >
                <div
                  className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
                />

                {/* Weather Observation Badge Card */}
                {msg.card && (
                  <div className={`mt-2.5 p-3 rounded-xl border flex flex-col gap-2 ${
                    msg.card.isGaleAlert
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : msg.card.isPlainSnowAlert
                        ? 'bg-sky-950/40 border-sky-400/50 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="text-2xl shrink-0">{msg.card.icon}</div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{msg.card.location}</span>
                            {msg.card.department && (
                              <span className="text-[10px] text-slate-400 font-normal">({msg.card.department})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-300 truncate">{msg.card.condition}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{msg.card.windInfo}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base sm:text-xl font-black text-amber-300">{msg.card.temp}</div>
                        <div className="text-[10px] text-slate-400">Ressenti {msg.card.feelsLike}</div>
                      </div>
                    </div>

                    {/* Actions simplifiées sur la station météo */}
                    {msg.card.stationId && (
                      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {onSelectStation && (
                          <button
                            onClick={() => {
                              const st = FRENCH_STATIONS.find(s => s.id === msg.card?.stationId);
                              if (st) onSelectStation(st);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 text-sky-200 font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Régler Instant Météo sur cette station"
                          >
                            <MapPin className="h-3 w-3 text-sky-400" />
                            <span>Définir comme ville active</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleProcessQuery(`Donne-moi la température sur 7 jours à ${msg.card?.location}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                        >
                          <LineChart className="h-3 w-3 text-amber-400" />
                          <span>Graphe 7j</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Multi-City Comparison Card */}
                {msg.comparison && (
                  <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-amber-950/40 border border-sky-400/30 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-amber-400" />
                        Comparatif Direct
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold truncate max-w-[160px]">
                        {msg.comparison.summary}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {/* Station A */}
                      <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between">
                        <div className="text-xs font-bold text-sky-300 flex items-center justify-between">
                          <span className="truncate">{msg.comparison.stationA.name}</span>
                          <span className="text-base shrink-0">{msg.comparison.stationA.icon}</span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white mt-1">{msg.comparison.stationA.temp}</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 truncate">{msg.comparison.stationA.condition}</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1">💨 {msg.comparison.stationA.wind}</div>
                      </div>

                      {/* Station B */}
                      <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between">
                        <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                          <span className="truncate">{msg.comparison.stationB.name}</span>
                          <span className="text-base shrink-0">{msg.comparison.stationB.icon}</span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white mt-1">{msg.comparison.stationB.temp}</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 truncate">{msg.comparison.stationB.condition}</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1">💨 {msg.comparison.stationB.wind}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Chart.js Graphic */}
                {msg.chart && (
                  <div className="mt-3 p-3 sm:p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span className="font-bold text-sky-300 flex items-center gap-1.5 truncate">
                        <LineChart className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{msg.chart.title}</span>
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-mono text-emerald-400 shrink-0">
                        Instant Météo
                      </span>
                    </div>
                    <div className="relative w-full h-40 sm:h-52">
                      <canvas id={msg.chart.id} />
                    </div>
                  </div>
                )}

                {/* 3D Atmospheric Map of France */}
                {msg.map3D && (
                  <Aura3DAtmosphericMap
                    initialMetric={msg.map3D.metric}
                    currentStation={currentStation}
                    onSelectStation={onSelectStation}
                    title={msg.map3D.title}
                    focusCityName={msg.map3D.focusCityName}
                  />
                )}

                {/* Simulated Telemetry Snapshot */}
                {msg.snapshot && (
                  <AuraObservatorySnapshot
                    type={msg.snapshot.type}
                    stationName={msg.snapshot.stationName}
                    onNavigateModule={onNavigateTab}
                  />
                )}

                {/* Dynamic Data Table */}
                {msg.table && msg.table.columns.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 overflow-hidden">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                      <TableIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{msg.table.title}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-300">
                            {msg.table.columns.map((col, cIdx) => (
                              <th key={cIdx} className="py-1.5 px-2 font-semibold whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {msg.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/5">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="py-1.5 px-2 text-slate-200 whitespace-nowrap">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Web Search Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      <Globe className="h-3 w-3 text-sky-400" />
                      <span>Sources vérifiées</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources
                        .filter((s) => isSafeExternalUrl(s.url))
                        .map((src, sIdx) => (
                          <a
                            key={`${src.url}_${sIdx}`}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-sky-500/15 border border-white/10 hover:border-sky-400/40 text-[10px] text-sky-300 hover:text-sky-200 transition max-w-[220px]"
                            title={src.title}
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-80" />
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                {/* Aura Message Utility Bar (TTS Voice Reader + Copy + Verification Badge) */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 gap-2">
                  {msg.sender === 'aura' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 text-[10px] cursor-pointer font-medium ${
                          speakingMessageId === msg.id
                            ? 'bg-rose-500/25 text-rose-300 border-rose-400/50 animate-pulse'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                        }`}
                        title={speakingMessageId === msg.id ? "Arrêter la lecture" : "Écouter le bulletin"}
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <Square className="h-3 w-3 fill-rose-400" />
                            <span>Arrêter</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 text-sky-400" />
                            <span>Écouter</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1 text-[10px] cursor-pointer"
                        title="Copier le texte"
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-300">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-slate-400" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                    {msg.verificationStatus === 'verified' && (
                      <span
                        className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-sans text-[10px]"
                        title="Réponse relue et vérifiée par rapport aux données réelles"
                      >
                        ✓ vérifié
                      </span>
                    )}
                    {msg.verificationStatus === 'corrected' && (
                      <span
                        className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 font-sans text-[10px]"
                        title="Réponse autocorrigée après relecture"
                      >
                        ✎ corrigé
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Bulle de statut animée AURA (réflexion / consultation / vérification) */}
          {isThinking && (
            <div className="flex items-start gap-2.5 sm:gap-3 justify-start animate-fade-in py-1">
              <AuraBotAvatar size="sm" glow={true} className="mt-1 shrink-0" />
              <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-sm bg-slate-900/95 border border-sky-400/40 text-slate-200 shadow-2xl backdrop-blur-2xl flex items-center gap-3">
                <span className="text-xs text-sky-300 font-semibold tracking-wide">{thinkingStatus}</span>
                <div className="inline-flex items-center gap-1.5 px-1 py-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '180ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '360ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Simplified Quick Prompt Actions (4 essential buttons only) */}
        <div className="pt-2 pb-1 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => handleProcessQuery("Donne-moi la température sur 7 jours")}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-medium shrink-0 shadow-sm whitespace-nowrap active:scale-95"
            >
              <LineChart className="h-3.5 w-3.5 text-amber-400" />
              <span>📊 Prévision 7 jours</span>
            </button>
            <button
              onClick={() => handleProcessQuery("Génère une carte 3D de la France")}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-medium shrink-0 shadow-sm whitespace-nowrap active:scale-95"
            >
              <Compass className="h-3.5 w-3.5 text-purple-400" />
              <span>🗺️ Carte 3D France</span>
            </button>
            <button
              onClick={() => handleProcessQuery("Fais une capture du radar")}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-medium shrink-0 shadow-sm whitespace-nowrap active:scale-95"
            >
              <Camera className="h-3.5 w-3.5 text-sky-400" />
              <span>🌧️ Radar Pluie</span>
            </button>
            <button
              onClick={() => handleProcessQuery("Compare Paris et Marseille")}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-medium shrink-0 shadow-sm whitespace-nowrap active:scale-95"
            >
              <Scale className="h-3.5 w-3.5 text-emerald-400" />
              <span>⚖️ Paris vs Marseille</span>
            </button>
          </div>
        </div>

        {/* USER INPUT DOCK (Ergonomique sur mobile) */}
        <div className="relative mt-1 pb-safe shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessQuery(inputText);
            }}
            className="rounded-2xl p-1 sm:p-1.5 flex items-center gap-1.5 bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-xl"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isListening ? 'Écoute en cours...' : 'Parler à AURA'}
              className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'hover:bg-white/10 text-slate-400 hover:text-sky-300'
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Posez n'importe quelle question (météo, sciences, calcul, actu, carte 3D...)"
              className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-400 text-xs sm:text-sm px-1.5 sm:px-2 font-normal"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-r from-amber-500 to-sky-500 hover:from-amber-400 hover:to-sky-400 text-slate-950 font-bold transition shadow-md flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Envoyer la question"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-[100dvh] p-0 m-0 bg-[#05070B] overflow-hidden animate-in fade-in duration-200">
        {renderViewContent()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-[100dvh] p-0 m-0 bg-[#05070B] overflow-hidden">
      {renderViewContent()}
    </div>
  );
};
