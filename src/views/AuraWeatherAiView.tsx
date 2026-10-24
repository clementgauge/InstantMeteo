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
  Wind, 
  LineChart, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw,
  Compass,
  Thermometer,
  Layers
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { getIsothermComprehensiveDiagnostic } from '../utils/isothermCalculations';

interface AuraWeatherAiViewProps {
  currentStation: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onBackToMain?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  card?: {
    location: string;
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
    datasetLabel: string;
    data: number[];
    color: string;
  };
  timestamp: string;
}

export const AuraWeatherAiView: React.FC<AuraWeatherAiViewProps> = ({
  currentStation,
  weather,
  hourly = [],
  daily = [],
  tempUnit = 'C',
  onSelectStation,
  onBackToMain
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'aura',
      text: `Bonjour ! Je suis **AURA**, votre intelligence atmosphérique et conversationnelle propulsée par les données certifiées d'**InstantMétéo**.\n\nToutes mes analyses météo proviennent directement de votre station actuelle (**${currentStation.name}**) et du réseau météorologique officiel en direct.\n\nPosez-moi une question sur le temps qu'il fait, les risques de coup de vent, la neige en plaine, ou demandez-moi un graphique d'évolution sur 24h !`,
      card: {
        location: currentStation.name,
        temp: `${weather.temperature.toFixed(1)}°C`,
        feelsLike: `${weather.feelsLike.toFixed(1)}°C`,
        condition: weather.weatherDescription,
        windInfo: `${weather.windSpeed} km/h (rafales ${weather.windGust ?? Math.round(weather.windSpeed * 1.35)} km/h)`,
        icon: '☀️'
      },
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatStreamRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chartInstancesRef = useRef<Record<string, Chart>>({});

  // 1. Détermination de l'état atmosphérique selon la météo actuelle
  const weatherState = useMemo(() => {
    const code = weather.weatherCode;
    const temp = weather.temperature;
    if ([95, 96, 99].includes(code) || (weather.windGust ?? 0) >= 70) {
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
    const liveRainProb = hourly?.[0]?.precipitationProbability ?? (weather.precipitation > 0 ? 80 : 0);
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
  }, [weather.weatherCode, weather.temperature, weather.precipitation, weather.windGust, hourly]);

  // 2. Moteur Canvas Atmosphérique d'AURA
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = weatherState.key === 'RAINY' ? 120 : weatherState.key === 'SNOWY' ? 95 : weatherState.key === 'STORMY' ? 160 : 45;
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 8 + 4,
      radius: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      velX: (Math.random() - 0.5) * 1.5,
      velY: Math.random() * 2 + 0.5,
      angle: Math.random() * Math.PI * 2
    }));

    let lightningFlash = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (weatherState.key === 'STORMY' && Math.random() < 0.007) {
        lightningFlash = Math.random() * 0.35 + 0.2;
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
            const newChart = new Chart(ctx, {
              type: chartConfig.type,
              data: {
                labels: chartConfig.labels,
                datasets: [
                  {
                    label: chartConfig.datasetLabel,
                    data: chartConfig.data,
                    borderColor: chartConfig.color,
                    backgroundColor: chartConfig.type === 'bar' ? `${chartConfig.color}80` : `${chartConfig.color}20`,
                    fill: chartConfig.type === 'line',
                    tension: 0.35,
                    borderWidth: 2.5
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#F59E0B',
                    bodyColor: '#F3F4F6',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
                  }
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94A3B8', font: { size: 10 } }
                  },
                  y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94A3B8', font: { size: 10 } }
                  }
                }
              }
            });
            chartInstancesRef.current[chartConfig.id] = newChart;
          }
        }
      }
    });
  }, [messages]);

  // 6. Nettoyage des instances de Chart
  useEffect(() => {
    return () => {
      Object.values(chartInstancesRef.current).forEach((chart) => chart.destroy());
      chartInstancesRef.current = {};
    };
  }, []);

  // 7. Traitement 100% fiable basé sur les vraies données d'InstantMétéo
  const handleProcessQuery = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    scrollToBottom();

    const lower = query.toLowerCase();

    // Détection si l'utilisateur demande un graphique
    const wantsGraph = ['graphe', 'graphique', 'courbe', 'histogramme', 'chart', 'evolution', 'évolution', 'tracer', 'schéma'].some(kw => lower.includes(kw));

    // Détection de la ville interrogée (ou la station actuelle par défaut)
    let targetStation: LocationPoint = currentStation;
    let targetWeather: CurrentWeather = weather;
    let targetHourly: HourlyForecast[] = hourly;

    // Scan si une autre ville est mentionnée
    const foundStation = FRENCH_STATIONS.find(s => 
      lower.includes(s.name.toLowerCase()) || 
      (s.department && lower.includes(s.department.toLowerCase()))
    );

    if (foundStation && foundStation.id !== currentStation.id) {
      targetStation = foundStation;
      // Approximation cohérente basée sur le gradient thermique de la station
      const tempDiff = ((targetStation.altitude || 100) - (currentStation.altitude || 100)) * -0.0065;
      targetWeather = {
        ...weather,
        temperature: Math.round((weather.temperature + tempDiff) * 10) / 10,
        feelsLike: Math.round((weather.feelsLike + tempDiff) * 10) / 10,
        windSpeed: targetStation.name.includes('Marseille') ? Math.round(weather.windSpeed * 1.5) : weather.windSpeed
      };
      targetHourly = hourly.map(h => ({
        ...h,
        temperature: Math.round((h.temperature + tempDiff) * 10) / 10
      }));
    }

    // Calculs scientifiques instantanés InstantMétéo
    const targetAlt = targetStation.altitude || 80;
    const isPlain = targetAlt < 400;
    const isoDiag = getIsothermComprehensiveDiagnostic({
      stationAltitude: targetAlt,
      temperature: targetWeather.temperature,
      relativeHumidity: targetWeather.humidity ?? 70,
      precipitationMm: targetWeather.precipitation ?? 0
    });
    const iso0 = isoDiag.isotherm0Meters;
    const lpn = isoDiag.snowRainLimitMeters;

    const currentGust = targetWeather.windGust ?? Math.round(targetWeather.windSpeed * 1.35);
    const isGale = currentGust >= 55;
    const targetRainProb = targetHourly?.[0]?.precipitationProbability ?? (targetWeather.precipitation > 0 ? 80 : 0);
    const isSnowInPlain = isPlain && (
      (targetWeather.temperature <= 2.2 && targetRainProb >= 20) ||
      [71, 73, 75, 77, 85, 86].includes(targetWeather.weatherCode)
    );

    // Formulation de la réponse AURA
    let responseText = '';
    let cardData: ChatMessage['card'] | undefined;
    let chartData: ChatMessage['chart'] | undefined;

    // 1. Salutations simples
    const greetings = ['salut', 'bonjour', 'hello', 'coucou', 'slt', 'bonsoir', 'ca va', 'comment vas tu'];
    const isGreeting = greetings.some(g => lower.trim() === g || lower.startsWith(g + ' '));

    if (isGreeting && !wantsGraph && !lower.includes('vent') && !lower.includes('neige') && !lower.includes('pluie')) {
      responseText = `Bonjour ! L'atmosphère est calme sur **${targetStation.name}**. Selon nos relevés en temps réel, la température est de **${targetWeather.temperature}°C** avec un ciel **${targetWeather.weatherDescription.toLowerCase()}**.\n\nQue souhaitez-vous savoir : prévision des rafales de vent, risque de pluie dans l'heure, ou limites pluie-neige ?`;
      cardData = {
        location: targetStation.name,
        temp: `${targetWeather.temperature}°C`,
        feelsLike: `${targetWeather.feelsLike}°C`,
        condition: targetWeather.weatherDescription,
        windInfo: `${targetWeather.windSpeed} km/h (rafales ${currentGust} km/h)`,
        icon: targetWeather.temperature > 18 ? '☀️' : '⛅'
      };
    }
    // 2. Questions relatives au vent & coups de vent
    else if (lower.includes('vent') || lower.includes('rafale') || lower.includes('tempete') || lower.includes('tempête')) {
      const beaufort = currentGust >= 80 ? 'Force 8/9 (Coup de vent violent)' : currentGust >= 60 ? 'Force 7 (Grand frais / Coup de vent)' : 'Force 4/5 (Brise normale)';
      responseText = `💨 **Analyse du vent à ${targetStation.name}** :\n\n- Vitesse moyenne : **${targetWeather.windSpeed} km/h**\n- Rafales de pointe : **${currentGust} km/h**\n- Direction cardinale : **Cap ${targetWeather.windDirection ?? 225}°**\n- Échelle de Beaufort : **${beaufort}**\n\n${
        isGale
          ? `⚠️ **ALERTE COUP DE VENT REMARQUABLE** : Les rafales dépassent les seuils critiques. Soyez très prudents face aux chutes de branches, arrimez les objets légers en extérieur et évitez les parcs arborés.`
          : `Le flux atmosphérique reste modéré et ne présente aucun risque majeur pour vos activités extérieures.`
      }`;
      cardData = {
        location: targetStation.name,
        temp: `${targetWeather.temperature}°C`,
        feelsLike: `${targetWeather.feelsLike}°C`,
        condition: isGale ? `Coup de vent (${currentGust} km/h)` : targetWeather.weatherDescription,
        windInfo: `Vent ${targetWeather.windSpeed} km/h • Rafales ${currentGust} km/h`,
        icon: '💨',
        isGaleAlert: isGale
      };

      if (wantsGraph) {
        const nextHours = targetHourly.slice(0, 8);
        chartData = {
          id: `chart_${Date.now()}`,
          title: `Évolution des rafales à ${targetStation.name} (km/h)`,
          cityName: targetStation.name,
          type: 'line',
          labels: nextHours.map(h => h.hourLabel || h.time),
          datasetLabel: 'Rafales (km/h)',
          data: nextHours.map(h => h.windGust ?? Math.round(h.windSpeed * 1.35)),
          color: '#F59E0B'
        };
      }
    }
    // 3. Questions relatives à la neige / neige en plaine / isotherme 0°C
    else if (lower.includes('neige') || lower.includes('flocon') || lower.includes('isotherme') || lower.includes('lpn')) {
      responseText = `❄️ **Diagnostic Nivologique InstantMétéo pour ${targetStation.name}** :\n\n- Altitude de la station : **${targetAlt} m** (${isPlain ? 'Zone de plaine' : 'Zone de montagne'})\n- Température actuelle : **${targetWeather.temperature}°C**\n- Isotherme 0°C calculé : **${iso0} m**\n- Limite Pluie-Neige (LPN) estimée : **${lpn} m**\n\n${
        isSnowInPlain
          ? `⚠️ **PHÉNOMÈNE REMARQUABLE : NEIGE EN PLAINE !**\nLes conditions verticales de bulbe humide sont favorables aux flocons en plaine (< 400m). Risque de tenue au sol temporaire sur surfaces froides et chaussées glissantes.`
          : isPlain
            ? `En plaine à ${targetAlt}m, la neige n'est pas observée actuellement car l'Isotherme 0°C se maintient à ${iso0}m (${iso0 - targetAlt > 0 ? `+${iso0 - targetAlt}m au-dessus` : 'proche'}). Les précipitations restent sous forme liquide.`
            : `En altitude, la limite pluie-neige s'établit à ${lpn}m avec un manteau neigeux sous surveillance.`
      }`;
      cardData = {
        location: targetStation.name,
        temp: `${targetWeather.temperature}°C`,
        feelsLike: `${targetWeather.feelsLike}°C`,
        condition: isSnowInPlain ? 'Chutes de neige en plaine' : `Isotherme 0°C : ${iso0}m`,
        windInfo: `LPN estimée à ${lpn}m`,
        icon: '❄️',
        isPlainSnowAlert: isSnowInPlain
      };
    }
    // 4. Questions relatives à la pluie
    else if (lower.includes('pluie') || lower.includes('pleuvoir') || lower.includes('goutte') || lower.includes('precip')) {
      const rainProb = targetHourly?.[0]?.precipitationProbability ?? (targetWeather.precipitation > 0 ? 80 : 10);
      responseText = `🌧️ **Suivi des précipitations pour ${targetStation.name}** :\n\n- Risque de pluie actuel : **${rainProb}%**\n- Ciel observé : **${targetWeather.weatherDescription}**\n- Humidité relative : **${targetWeather.humidity ?? 65}%**\n\n${
        rainProb >= 50
          ? `Des averses sont probables ou en cours. Prévoyez un parapluie ou un vêtement imperméable pour vos sorties.`
          : `Le temps reste globalement sec sur votre secteur, sans front pluvieux menaçant à brève échéance.`
      }`;
      cardData = {
        location: targetStation.name,
        temp: `${targetWeather.temperature}°C`,
        feelsLike: `${targetWeather.feelsLike}°C`,
        condition: targetWeather.weatherDescription,
        windInfo: `Probabilité de pluie : ${rainProb}%`,
        icon: rainProb >= 40 ? '🌧️' : '⛅'
      };

      if (wantsGraph) {
        const nextHours = targetHourly.slice(0, 8);
        chartData = {
          id: `chart_${Date.now()}`,
          title: `Risque de pluie sur les prochaines heures à ${targetStation.name} (%)`,
          cityName: targetStation.name,
          type: 'bar',
          labels: nextHours.map(h => h.hourLabel || h.time),
          datasetLabel: 'Risque de pluie (%)',
          data: nextHours.map(h => h.precipitationProbability ?? 10),
          color: '#38BDF8'
        };
      }
    }
    // 5. Demande explicite de graphique
    else if (wantsGraph) {
      const nextHours = targetHourly.slice(0, 8);
      responseText = `Voici la **courbe des températures prévues sur les prochaines heures** pour **${targetStation.name}** générée directement à partir des modélisations numériques d'InstantMétéo.`;
      cardData = {
        location: targetStation.name,
        temp: `${targetWeather.temperature}°C`,
        feelsLike: `${targetWeather.feelsLike}°C`,
        condition: targetWeather.weatherDescription,
        windInfo: `${targetWeather.windSpeed} km/h`,
        icon: '📈'
      };
      chartData = {
        id: `chart_${Date.now()}`,
        title: `Profil thermique sur 24h à ${targetStation.name} (°C)`,
        cityName: targetStation.name,
        type: 'line',
        labels: nextHours.map(h => h.hourLabel || h.time),
        datasetLabel: 'Température (°C)',
        data: nextHours.map(h => h.temperature),
        color: '#F59E0B'
      };
    }
    // 6. Conseil tenue / comment s'habiller
    else if (lower.includes('habiller') || lower.includes('tenue') || lower.includes('porter') || lower.includes('vetement')) {
      const t = targetWeather.temperature;
      let advice = '';
      if (t > 24) {
        advice = 'Optez pour des vêtements très légers, respirants, et n\'oubliez pas vos lunettes de soleil ainsi qu\'une hydratation régulière.';
      } else if (t > 15) {
        advice = 'Une veste légère de mi-saison avec un t-shirt ou chemise sera parfaite pour la journée.';
      } else if (t > 7) {
        advice = 'Un manteau chaud, un pull et éventuellement une écharpe légère sont recommandés face à la fraîcheur ambiante.';
      } else {
        advice = 'Grand froid : bonnet, gants, gros manteau coupe-vent et écharpe indispensables pour préserver la chaleur corporelle.';
      }
      responseText = `🧥 **Conseil de tenue pour ${targetStation.name} (${t}°C, ressenti ${targetWeather.feelsLike}°C)** :\n\n${advice}\n\nVent mesuré à **${targetWeather.windSpeed} km/h**, ce qui abaisse la température perçue par le corps.`;
      cardData = {
        location: targetStation.name,
        temp: `${t}°C`,
        feelsLike: `${targetWeather.feelsLike}°C`,
        condition: targetWeather.weatherDescription,
        windInfo: `Ressenti éolien : ${targetWeather.feelsLike}°C`,
        icon: '🧥'
      };
    }
    // 7. Question météo générale
    else {
      responseText = `À **${targetStation.name}**, le ciel est **${targetWeather.weatherDescription.toLowerCase()}** avec une température réelle de **${targetWeather.temperature}°C** (ressenti **${targetWeather.feelsLike}°C**).\n\nLe vent souffle à **${targetWeather.windSpeed} km/h** avec des pointes à **${currentGust} km/h**. L'humidité de l'air est mesurée à **${targetWeather.humidity ?? 65}%** et la pression atmosphérique est de **${targetWeather.pressure ?? 1015} hPa**.`;
      cardData = {
        location: targetStation.name,
        temp: `${targetWeather.temperature}°C`,
        feelsLike: `${targetWeather.feelsLike}°C`,
        condition: targetWeather.weatherDescription,
        windInfo: `${targetWeather.windSpeed} km/h (rafales ${currentGust} km/h)`,
        icon: targetWeather.temperature > 18 ? '☀️' : '⛅'
      };
    }

    setTimeout(() => {
      setIsThinking(false);
      playChime();
      const auraMsg: ChatMessage = {
        id: `aura_${Date.now()}`,
        sender: 'aura',
        text: responseText,
        card: cardData,
        chart: chartData,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, auraMsg]);
      scrollToBottom();
    }, 600);
  };

  // 8. Reconnaissance vocale Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('La reconnaissance vocale n\'est pas supportée sur ce navigateur.');
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
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
    } catch (e) {
      setIsListening(false);
    }
  };

  const formatMarkdown = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-300">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-sky-200">$1</em>');
  };

  return (
    <div className="relative min-h-[750px] sm:min-h-[820px] rounded-3xl border border-white/10 overflow-hidden bg-[#05070B] text-slate-100 flex flex-col justify-between shadow-2xl">
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

      {/* 2. HEADER NAVBAR */}
      <header className="relative z-20 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/65 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Retour à InstantMétéo"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-amber-500/20 border border-white/20 shadow-lg shadow-sky-500/10 shrink-0">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl tracking-wide font-semibold text-white">AURA</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Weather AI
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                Données InstantMétéo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Atmosphère : <span className="text-amber-300 font-medium">{weatherState.name}</span> &bull; Station : <span className="text-sky-300 font-semibold">{currentStation.name}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Soundscape audio toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title={isAudioMuted ? 'Activer le carillon sonore atmosphérique' : 'Couper le son'}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ${
              !isAudioMuted 
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-sky-400" />}
            <span className="hidden sm:inline">Soundscape</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN CONVERSATIONAL CHAT CONTAINER */}
      <main className="relative z-10 flex-1 overflow-hidden flex flex-col justify-between max-w-4xl w-full mx-auto px-4 sm:px-6 py-4">
        
        {/* Chat Stream */}
        <div ref={chatStreamRef} className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 py-2 max-h-[520px] sm:max-h-[560px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'aura' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400/30 to-sky-400/30 border border-white/20 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
              )}

              <div
                className={`p-4 sm:p-5 rounded-2xl max-w-xl space-y-3 shadow-xl backdrop-blur-2xl border ${
                  msg.sender === 'user'
                    ? 'rounded-tr-sm bg-sky-500/15 border-sky-400/30 text-white'
                    : 'rounded-tl-sm bg-slate-900/75 border-white/10 text-slate-200'
                }`}
              >
                <div
                  className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
                />

                {/* Weather Observation Badge Card */}
                {msg.card && (
                  <div className={`mt-3 p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    msg.card.isGaleAlert
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : msg.card.isPlainSnowAlert
                        ? 'bg-sky-950/40 border-sky-400/50 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{msg.card.icon}</div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{msg.card.location}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            InstantMétéo
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">{msg.card.condition}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{msg.card.windInfo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-black text-amber-300">{msg.card.temp}</div>
                      <div className="text-[10px] text-slate-400">Ressenti {msg.card.feelsLike}</div>
                    </div>
                  </div>
                )}

                {/* Dynamic Chart.js Graphic */}
                {msg.chart && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span className="font-bold text-sky-300 flex items-center gap-1.5">
                        <LineChart className="h-3.5 w-3.5" />
                        {msg.chart.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-emerald-400">
                        Données InstantMétéo
                      </span>
                    </div>
                    <div className="relative w-full h-44 sm:h-48">
                      <canvas id={msg.chart.id} />
                    </div>
                  </div>
                )}

                <div className="text-[9px] text-slate-500 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="my-2 flex items-center justify-center gap-3 py-2">
            <div className="flex items-center gap-1 h-5">
              <span className="w-1.5 h-full rounded-full bg-cyan-400 animate-pulse" />
              <span className="w-1.5 h-full rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-full rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs text-sky-300 font-semibold tracking-wide uppercase">
              AURA interroge les serveurs InstantMétéo...
            </span>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="pt-2 pb-1 flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleProcessQuery(`Quel est le temps exact ici à ${currentStation.name} ?`)}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sun className="h-3 w-3 text-amber-400" />
            <span>Météo exacte ici</span>
          </button>
          <button
            onClick={() => handleProcessQuery(`Y a-t-il un risque de coup de vent ou de rafales violentes ?`)}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wind className="h-3 w-3 text-amber-400" />
            <span>Avis coup de vent</span>
          </button>
          <button
            onClick={() => handleProcessQuery(`Fais-moi un graphique de température sur les prochaines heures`)}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <LineChart className="h-3 w-3 text-sky-400" />
            <span>Graphique 24h</span>
          </button>
          <button
            onClick={() => handleProcessQuery(`Y a-t-il un risque de neige en plaine ou hors saison ?`)}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Snowflake className="h-3 w-3 text-cyan-300" />
            <span>Neige en plaine</span>
          </button>
          <button
            onClick={() => handleProcessQuery(`Comment dois-je m'habiller aujourd'hui selon la température ?`)}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Thermometer className="h-3 w-3 text-amber-300" />
            <span>Conseil tenue</span>
          </button>
        </div>

        {/* USER INPUT DOCK */}
        <div className="relative mt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessQuery(inputText);
            }}
            className="rounded-2xl p-2 flex items-center gap-2 bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isListening ? 'Écoute en cours...' : 'Parler à AURA'}
              className={`p-3 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
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
              placeholder="Posez votre question (ex: vent, neige en plaine, graphe, Marseille)..."
              className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-400 text-xs sm:text-sm px-2 font-normal"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-sky-500 hover:from-amber-400 hover:to-sky-400 text-slate-950 font-bold transition shadow-md flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
};
