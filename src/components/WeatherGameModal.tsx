import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  X,
  Trophy,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Sparkles,
  Flame,
  Thermometer,
  HelpCircle,
  Upload,
  Maximize2,
  Minimize2,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  FolderArchive,
  Trash2
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import {
  loadPlayerProfile,
  savePlayerProfile,
  getMultiplier
} from '../services/competitiveGameService';
import { syncPlayerProfileToD1 } from '../services/cloudflareD1Service';

interface WeatherGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: LocationPoint;
  currentWeather?: CurrentWeather | null;
  onOpenCompetitiveTab?: () => void;
}

type GameModeTab = 'arcade' | 'duel' | 'quiz' | 'zip_player';

interface ArcadeEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'rain' | 'sun' | 'snow' | 'probe' | 'shield' | 'magnet' | 'lightning' | 'hail' | 'tornado';
  emoji: string;
  points: number;
  isHazard: boolean;
  hp: number;
  rotation: number;
}

interface LaserShot {
  x: number;
  y: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

const QUIZ_QUESTIONS = [
  {
    q: "Quel nuage est directement responsable des orages violents, de la foudre et de la grêle ?",
    options: ["Le Cirrus", "Le Cumulonimbus", "Le Stratus", "L'Altocumulus"],
    correct: 1,
    explanation: "Le Cumulonimbus (Cb) est le seul nuage à grand développement vertical capable de produire de la foudre, des rafales descendantes et de la grêle."
  },
  {
    q: "Quelle est la maille horizontale du modèle haute résolution AROME de Météo-France ?",
    options: ["1,3 km", "10 km", "25 km", "50 km"],
    correct: 0,
    explanation: "Le modèle AROME opère avec une maille ultra-fine de 1,3 km sur la France, idéale pour anticiper les orages et effets de relief."
  },
  {
    q: "Que signifie une Vigilance Rouge Météo-France ?",
    options: [
      "Un phénomène habituel mais fréquent",
      "Une vigilance absolue : phénomènes dangereux d'intensité exceptionnelle",
      "Une simple baisse de température",
      "Un ciel nuageux sans précipitations"
    ],
    correct: 1,
    explanation: "Le niveau Rouge est le niveau maximal (4/4) : il signale un phénomène d'intensité exceptionnelle menaçant directement la sécurité des biens et des personnes."
  },
  {
    q: "À quelle pression atmosphérique moyenne (au niveau de la mer) situe-t-on la limite entre dépression et anticyclone ?",
    options: ["950 hPa", "1013,25 hPa", "1050 hPa", "850 hPa"],
    correct: 1,
    explanation: "La pression atmosphérique standard au niveau de la mer est de 1013,25 hPa. Au-dessus, on parle généralement de conditions anticycloniques."
  },
  {
    q: "Comment appelle-t-on les précipitations intenses bloquées sur le relief des Cévennes à l'automne ?",
    options: ["Un effet de Foehn", "Un épisode cévenol", "Un mistral gagnant", "Une inversion thermique"],
    correct: 1,
    explanation: "L'épisode cévenol se produit lorsque de l'air chaud et humide méditerranéen est soulevé brusquement par le relief du Massif central."
  },
  {
    q: "De combien de degrés la température baisse-t-elle en moyenne tous les 1 000 mètres d'altitude dans la troposphère ?",
    options: ["Environ 1,5 °C", "Environ 6,5 °C", "Environ 15 °C", "Elle augmente de 4 °C"],
    correct: 1,
    explanation: "Le gradient thermique adiabatique moyen dans l'atmosphère standard est d'environ -6,5 °C par 1 000 mètres d'ascension."
  },
  {
    q: "Quel indicateur mesure l'énergie disponible pour le déclenchement des orages ?",
    options: ["L'indice UV", "L'énergie CAPE (J/kg)", "Le coefficient du SHOM", "Le point de givre"],
    correct: 1,
    explanation: "La CAPE (Convective Available Potential Energy), exprimée en J/kg, quantifie l'instabilité énergétique des masses d'air orageuses."
  },
  {
    q: "Sur un radar Doppler de précipitations, quelle couleur indique généralement les pluies les plus intenses ou la grêle ?",
    options: ["Bleu clair", "Vert pâle", "Rouge / Violet", "Gris clair"],
    correct: 2,
    explanation: "Les réflectivités radar supérieures à 50-55 dBZ (fortes averses et grêle) sont représentées en rouge vif, magenta ou violet."
  }
];

/**
 * Décompresse un fichier .zip directement dans le navigateur via DecompressionStream
 * et reconstruit une page HTML autonome exécutable dans un iframe.
 */
async function extractZipToRunnableHtml(file: File): Promise<{ html: string; title: string; fileCount: number }> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  const decoder = new TextDecoder('utf-8');

  const extractedTextFiles: Record<string, string> = {};
  const extractedBlobUrls: Record<string, string> = {};
  let fileCount = 0;

  // Parcourir les en-têtes locaux PK\x03\x04 (0x04034b50)
  let offset = 0;
  while (offset + 30 <= uint8.length) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) {
      offset++;
      continue;
    }

    const flags = view.getUint16(offset + 6, true);
    const compressionMethod = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const nameBytes = uint8.subarray(offset + 30, offset + 30 + nameLen);
    const rawFileName = decoder.decode(nameBytes);
    const dataStart = offset + 30 + nameLen + extraLen;

    // Si bit 3 de flags est actif et compressedSize === 0, chercher plus loin
    if ((flags & 0x08) !== 0 && compressedSize === 0) {
      offset = dataStart;
      continue;
    }

    const dataEnd = Math.min(uint8.length, dataStart + compressedSize);
    const compressedData = uint8.subarray(dataStart, dataEnd);

    if (!rawFileName.endsWith('/') && !rawFileName.includes('__MACOSX')) {
      let rawContent: Uint8Array | null = null;
      if (compressionMethod === 0) {
        rawContent = compressedData;
      } else if (compressionMethod === 8 && typeof DecompressionStream !== 'undefined') {
        try {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(compressedData).catch(() => {});
          writer.close().catch(() => {});
          const resBuf = await new Response(ds.readable).arrayBuffer();
          rawContent = new Uint8Array(resBuf);
        } catch {
          rawContent = null;
        }
      }

      if (rawContent) {
        fileCount++;
        const cleanName = rawFileName.replace(/^[^/]+\//, '');
        const lower = cleanName.toLowerCase();

        if (
          lower.endsWith('.html') ||
          lower.endsWith('.htm') ||
          lower.endsWith('.js') ||
          lower.endsWith('.css') ||
          lower.endsWith('.json') ||
          lower.endsWith('.svg')
        ) {
          const text = decoder.decode(rawContent);
          extractedTextFiles[cleanName] = text;
          extractedTextFiles[rawFileName] = text;
          const baseName = cleanName.split('/').pop() || cleanName;
          if (!extractedTextFiles[baseName]) {
            extractedTextFiles[baseName] = text;
          }
        } else {
          const ext = lower.split('.').pop() || '';
          const mimeMap: Record<string, string> = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            webp: 'image/webp',
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            ogg: 'audio/ogg',
            woff2: 'font/woff2',
            ttf: 'font/ttf'
          };
          const blob = new Blob([rawContent], { type: mimeMap[ext] || 'application/octet-stream' });
          const blobUrl = URL.createObjectURL(blob);
          extractedBlobUrls[cleanName] = blobUrl;
          extractedBlobUrls[rawFileName] = blobUrl;
          const baseName = cleanName.split('/').pop() || cleanName;
          if (!extractedBlobUrls[baseName]) {
            extractedBlobUrls[baseName] = blobUrl;
          }
        }
      }
    }

    offset = dataEnd;
  }

  // Trouver le fichier HTML principal
  const htmlKeys = Object.keys(extractedTextFiles).filter(
    k => k.toLowerCase().endsWith('.html') || k.toLowerCase().endsWith('.htm')
  );

  let mainHtmlKey =
    htmlKeys.find(k => k.toLowerCase() === 'index.html') ||
    htmlKeys.find(k => k.toLowerCase().endsWith('/index.html')) ||
    htmlKeys[0];

  let finalHtml = mainHtmlKey ? extractedTextFiles[mainHtmlKey] : '';

  if (!finalHtml) {
    // Si le zip contient uniquement du JS/CSS sans index.html, en générer un avec un canvas
    const jsContent = Object.entries(extractedTextFiles)
      .filter(([k]) => k.toLowerCase().endsWith('.js'))
      .map(([, v]) => v)
      .join('\n;\n');
    const cssContent = Object.entries(extractedTextFiles)
      .filter(([k]) => k.toLowerCase().endsWith('.css'))
      .map(([, v]) => v)
      .join('\n');

    finalHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Jeu Météo</title>
<style>
  body { margin: 0; background: #0f172a; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
  ${cssContent}
</style>
</head>
<body>
  <div id="game"></div>
  <div id="root"></div>
  <canvas id="canvas" width="800" height="600"></canvas>
  <script>${jsContent}</script>
</body>
</html>`;
  } else {
    // Injecter les fichiers CSS en ligne
    finalHtml = finalHtml.replace(
      /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,
      (match, href) => {
        const cleanHref = href.replace(/^\.\//, '');
        const css = extractedTextFiles[cleanHref] || extractedTextFiles[cleanHref.split('/').pop() || ''];
        return css ? `<style>\n${css}\n</style>` : match;
      }
    );

    // Injecter les fichiers JS en ligne
    finalHtml = finalHtml.replace(
      /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi,
      (match, src) => {
        const cleanSrc = src.replace(/^\.\//, '');
        const js = extractedTextFiles[cleanSrc] || extractedTextFiles[cleanSrc.split('/').pop() || ''];
        return js ? `<script>\n${js}\n</script>` : match;
      }
    );

    // Remplacer les références d'images/sons par leurs Blob URLs
    for (const [assetPath, blobUrl] of Object.entries(extractedBlobUrls)) {
      const escaped = assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      finalHtml = finalHtml.replace(new RegExp(`(["'(])(?:\\./)?${escaped}(["')])`, 'g'), `$1${blobUrl}$2`);
    }
  }

  return {
    html: finalHtml,
    title: file.name.replace(/\.zip$/i, ''),
    fileCount
  };
}

export const WeatherGameModal: React.FC<WeatherGameModalProps> = ({
  isOpen,
  onClose,
  currentStation,
  currentWeather,
  onOpenCompetitiveTab
}) => {
  const [activeTab, setActiveTab] = useState<GameModeTab>('arcade');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [totalSyncedPoints, setTotalSyncedPoints] = useState<number>(0);

  // =========================================================================
  // ÉTATS DU JEU 1 : ARCADE 2D CHASSEUR D'ORAGES & PLUIE (CANVAS 60 FPS)
  // =========================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingArcade, setIsPlayingArcade] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [arcadeScore, setArcadeScore] = useState<number>(0);
  const [arcadeHighScore, setArcadeHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('instant_meteo_arcade_highscore') || '0');
    } catch {
      return 0;
    }
  });
  const [arcadeLives, setArcadeLives] = useState<number>(3);
  const [arcadeCombo, setArcadeCombo] = useState<number>(1);
  const [arcadePhase, setArcadePhase] = useState<string>('Ciel Calme & Averses');
  const [autoFire, setAutoFire] = useState<boolean>(true);

  // Refs pour la boucle d'animation 60 FPS
  const gameStateRef = useRef<{
    playerX: number;
    targetX: number;
    playerWidth: number;
    score: number;
    lives: number;
    combo: number;
    shieldUntil: number;
    magnetUntil: number;
    lastSpawn: number;
    lastShot: number;
    entities: ArcadeEntity[];
    lasers: LaserShot[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    keys: { left: boolean; right: boolean; space: boolean };
    nextId: number;
  }>({
    playerX: 360,
    targetX: 360,
    playerWidth: 76,
    score: 0,
    lives: 3,
    combo: 1,
    shieldUntil: 0,
    magnetUntil: 0,
    lastSpawn: 0,
    lastShot: 0,
    entities: [],
    lasers: [],
    particles: [],
    floatingTexts: [],
    keys: { left: false, right: false, space: false },
    nextId: 1
  });

  // Synthétiseur audio Web Audio API (aucun fichier externe requis)
  const playBeep = useCallback(
    (freq: number, durationMs: number, type: OscillatorType = 'sine') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);
        setTimeout(() => ctx.close().catch(() => {}), durationMs + 50);
      } catch {
        // ignore audio errors
      }
    },
    [soundEnabled]
  );

  // Créditer les points gagnés au profil Chasseur Météo
  const awardPointsToProfile = useCallback((earnedPoints: number) => {
    if (earnedPoints <= 0) return;
    try {
      const profile = loadPlayerProfile();
      if (profile) {
        const { multiplier } = getMultiplier(profile.streakDays);
        const bonus = Math.max(5, Math.round(earnedPoints * 0.25 * multiplier));
        const updated = {
          ...profile,
          totalPoints: profile.totalPoints + bonus
        };
        savePlayerProfile(updated);
        syncPlayerProfileToD1(updated).catch(() => {});
        setTotalSyncedPoints(prev => prev + bonus);
        window.dispatchEvent(new CustomEvent('instant_meteo_score_updated', { detail: updated }));
      }
    } catch {
      // ignore
    }
  }, []);

  const startArcadeGame = () => {
    gameStateRef.current = {
      playerX: 360,
      targetX: 360,
      playerWidth: 76,
      score: 0,
      lives: 3,
      combo: 1,
      shieldUntil: 0,
      magnetUntil: 0,
      lastSpawn: performance.now(),
      lastShot: performance.now(),
      entities: [],
      lasers: [],
      particles: [],
      floatingTexts: [],
      keys: { left: false, right: false, space: false },
      nextId: 1
    };
    setArcadeScore(0);
    setArcadeLives(3);
    setArcadeCombo(1);
    setArcadePhase('Ciel Calme & Averses');
    setIsGameOver(false);
    setIsPlayingArcade(true);
    playBeep(520, 120, 'triangle');
  };

  // Gestion clavier pour le jeu Arcade
  useEffect(() => {
    if (!isOpen || activeTab !== 'arcade') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') {
        gameStateRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameStateRef.current.keys.right = true;
      }
      if (e.key === ' ') {
        gameStateRef.current.keys.space = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') {
        gameStateRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameStateRef.current.keys.right = false;
      }
      if (e.key === ' ') {
        gameStateRef.current.keys.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, activeTab]);

  // Boucle principale 60 FPS du jeu Arcade
  useEffect(() => {
    if (!isOpen || activeTab !== 'arcade' || !isPlayingArcade) return;

    let animId: number;
    const W = 720;
    const H = 440;

    const loop = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const st = gameStateRef.current;

      // Support manette matérielle (Gamepad API)
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const pads = navigator.getGamepads();
        const pad = pads && pads[0];
        if (pad) {
          const axisX = pad.axes[0] || 0;
          if (Math.abs(axisX) > 0.15) {
            st.playerX += axisX * 8;
            st.targetX = st.playerX;
          }
          if (pad.buttons[14]?.pressed) {
            st.playerX -= 7;
            st.targetX = st.playerX;
          }
          if (pad.buttons[15]?.pressed) {
            st.playerX += 7;
            st.targetX = st.playerX;
          }
        }
      }

      // Déplacement clavier ou fluide vers la souris/doigt
      if (st.keys.left) {
        st.playerX -= 7.5;
        st.targetX = st.playerX;
      } else if (st.keys.right) {
        st.playerX += 7.5;
        st.targetX = st.playerX;
      } else {
        st.playerX += (st.targetX - st.playerX) * 0.22;
      }

      st.playerX = Math.max(40, Math.min(W - 40, st.playerX));

      // Niveau de difficulté progressif selon le score
      const difficulty = 1 + Math.min(2.5, st.score / 1200);
      if (st.score >= 2500) setArcadePhase('🌪️ Alerte Rouge : Supercellule & Tornade EF4');
      else if (st.score >= 1200) setArcadePhase('⚡ Vigilance Orange : Orage Cévenol Intense');
      else if (st.score >= 500) setArcadePhase('❄️ Front Froid Actif & Giboulées');

      // Tir de sonde laser (automatique ou barre espace)
      if ((autoFire || st.keys.space) && now - st.lastShot > 360) {
        st.lasers.push({ x: st.playerX, y: H - 64, vy: -9.5 });
        st.lastShot = now;
      }

      // Apparition des éléments météo
      const spawnInterval = Math.max(260, 720 - st.score * 0.15);
      if (now - st.lastSpawn > spawnInterval) {
        st.lastSpawn = now;
        const roll = Math.random();
        let type: ArcadeEntity['type'] = 'rain';
        let emoji = '💧';
        let points = 20;
        let isHazard = false;
        let radius = 18;
        let hp = 1;
        let vy = (2.2 + Math.random() * 1.8) * difficulty;

        if (roll < 0.34) {
          type = 'rain';
          emoji = '💧';
          points = 20;
        } else if (roll < 0.52) {
          type = 'sun';
          emoji = '☀️';
          points = 35;
        } else if (roll < 0.64) {
          type = 'snow';
          emoji = '❄️';
          points = 45;
        } else if (roll < 0.71) {
          type = 'probe';
          emoji = '🛰️';
          points = 100;
          radius = 22;
        } else if (roll < 0.75) {
          type = 'shield';
          emoji = '🛡️';
          points = 50;
        } else if (roll < 0.79) {
          type = 'magnet';
          emoji = '🧲';
          points = 50;
        } else if (roll < 0.90) {
          type = 'lightning';
          emoji = '⚡';
          points = 60;
          isHazard = true;
          vy *= 1.2;
        } else if (roll < 0.96) {
          type = 'hail';
          emoji = '🧊';
          points = 80;
          isHazard = true;
          hp = 2;
        } else {
          type = 'tornado';
          emoji = '🌪️';
          points = 150;
          isHazard = true;
          radius = 24;
          hp = 3;
        }

        st.entities.push({
          id: st.nextId++,
          x: 36 + Math.random() * (W - 72),
          y: -25,
          vx: (Math.random() - 0.5) * (isHazard ? 2.2 : 1.0),
          vy,
          radius,
          type,
          emoji,
          points,
          isHazard,
          hp,
          rotation: 0
        });
      }

      // Dessin du fond atmosphérique
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      if (st.score >= 2500) {
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.6, '#31102f');
        skyGrad.addColorStop(1, '#090d16');
      } else if (st.score >= 1200) {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.6, '#1e293b');
        skyGrad.addColorStop(1, '#090d16');
      } else {
        skyGrad.addColorStop(0, '#0c2d48');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#090d16');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Grille radar Doppler subtile en fond
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 60) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 60) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Silhouette horizon France (Tour Eiffel + Mont Blanc stylisés)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H - 22);
      ctx.lineTo(120, H - 28);
      ctx.lineTo(135, H - 72);
      ctx.lineTo(140, H - 28);
      ctx.lineTo(320, H - 22);
      ctx.lineTo(440, H - 62);
      ctx.lineTo(520, H - 30);
      ctx.lineTo(W, H - 20);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      const hasShield = now < st.shieldUntil;
      const hasMagnet = now < st.magnetUntil;
      const playerY = H - 42;

      // Mise à jour des lasers (neutralisent les menaces ⚡🧊🌪️)
      for (let i = st.lasers.length - 1; i >= 0; i--) {
        const l = st.lasers[i];
        l.y += l.vy;
        if (l.y < -10) {
          st.lasers.splice(i, 1);
          continue;
        }
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(l.x - 2.5, l.y - 10, 5, 14, 2);
        ctx.fill();
      }

      // Mise à jour des entités
      for (let i = st.entities.length - 1; i >= 0; i--) {
        const ent = st.entities[i];

        // Effet Aimant Doppler sur les bonus météo
        if (hasMagnet && !ent.isHazard) {
          const dx = st.playerX - ent.x;
          const dy = playerY - ent.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 240 && dist > 1) {
            ent.x += (dx / dist) * 5.2;
            ent.y += (dy / dist) * 3.5;
          }
        }

        ent.x += ent.vx;
        ent.y += ent.vy;
        if (ent.x < 24 || ent.x > W - 24) ent.vx *= -1;

        // Collision laser <-> menace météo
        let destroyedByLaser = false;
        if (ent.isHazard) {
          for (let j = st.lasers.length - 1; j >= 0; j--) {
            const l = st.lasers[j];
            if (Math.hypot(l.x - ent.x, l.y - ent.y) < ent.radius + 8) {
              st.lasers.splice(j, 1);
              ent.hp -= 1;
              if (ent.hp <= 0) {
                destroyedByLaser = true;
                const gained = ent.points * st.combo;
                st.score += gained;
                setArcadeScore(st.score);
                st.floatingTexts.push({
                  x: ent.x,
                  y: ent.y,
                  text: `Neutralisé +${gained}`,
                  color: '#38bdf8',
                  alpha: 1,
                  vy: -1.4
                });
                for (let p = 0; p < 8; p++) {
                  st.particles.push({
                    x: ent.x,
                    y: ent.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: '#f59e0b',
                    alpha: 1,
                    size: 3.5
                  });
                }
                playBeep(680, 70, 'square');
              }
              break;
            }
          }
        }

        if (destroyedByLaser) {
          st.entities.splice(i, 1);
          continue;
        }

        // Collision avec la Sonde du joueur
        const distToPlayer = Math.hypot(ent.x - st.playerX, ent.y - playerY);
        if (distToPlayer < ent.radius + 28) {
          if (ent.isHazard) {
            if (hasShield) {
              st.score += 50;
              setArcadeScore(st.score);
              st.floatingTexts.push({
                x: ent.x,
                y: ent.y,
                text: '🛡️ Paratonnerre +50',
                color: '#34d399',
                alpha: 1,
                vy: -1.5
              });
              playBeep(440, 90, 'triangle');
            } else {
              st.lives -= 1;
              st.combo = 1;
              setArcadeLives(st.lives);
              setArcadeCombo(1);
              st.floatingTexts.push({
                x: st.playerX,
                y: playerY - 20,
                text: '💥 Impact Orageux ! -1 Vie',
                color: '#fb7185',
                alpha: 1,
                vy: -1.6
              });
              playBeep(150, 260, 'sawtooth');

              if (st.lives <= 0) {
                setIsPlayingArcade(false);
                setIsGameOver(true);
                if (st.score > arcadeHighScore) {
                  setArcadeHighScore(st.score);
                  try {
                    localStorage.setItem('instant_meteo_arcade_highscore', String(st.score));
                  } catch {}
                }
                awardPointsToProfile(st.score);
                return;
              }
            }
          } else {
            if (ent.type === 'shield') {
              st.shieldUntil = now + 8000;
              st.floatingTexts.push({
                x: ent.x,
                y: ent.y,
                text: '🛡️ Bouclier 8s !',
                color: '#34d399',
                alpha: 1,
                vy: -1.5
              });
              playBeep(740, 140, 'sine');
            } else if (ent.type === 'magnet') {
              st.magnetUntil = now + 8000;
              st.floatingTexts.push({
                x: ent.x,
                y: ent.y,
                text: '🧲 Aimant Doppler 8s !',
                color: '#a78bfa',
                alpha: 1,
                vy: -1.5
              });
              playBeep(780, 140, 'sine');
            } else {
              st.combo = Math.min(5, st.combo + (ent.type === 'probe' ? 1 : 0.25));
              const mult = Math.floor(st.combo);
              setArcadeCombo(mult);
              const pts = ent.points * mult;
              st.score += pts;
              setArcadeScore(st.score);
              st.floatingTexts.push({
                x: ent.x,
                y: ent.y,
                text: `+${pts}${mult > 1 ? ` (x${mult})` : ''}`,
                color: '#fde047',
                alpha: 1,
                vy: -1.4
              });
              playBeep(540 + mult * 60, 65, 'sine');
            }

            for (let p = 0; p < 6; p++) {
              st.particles.push({
                x: ent.x,
                y: ent.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#38bdf8',
                alpha: 1,
                size: 3
              });
            }
          }
          st.entities.splice(i, 1);
          continue;
        }

        if (ent.y > H + 30) {
          st.entities.splice(i, 1);
          continue;
        }

        // Rendu de l'entité
        ctx.save();
        ctx.beginPath();
        ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
        ctx.fillStyle = ent.isHazard
          ? 'rgba(225, 29, 72, 0.24)'
          : ent.type === 'probe'
          ? 'rgba(245, 158, 11, 0.25)'
          : 'rgba(14, 165, 233, 0.18)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = ent.isHazard ? 'rgba(251, 113, 133, 0.7)' : 'rgba(56, 189, 248, 0.5)';
        ctx.stroke();

        ctx.font = `${ent.radius + 4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ent.emoji, ent.x, ent.y + 1);
        ctx.restore();
      }

      // Dessin de la Sonde Météo du joueur
      ctx.save();
      if (hasShield) {
        ctx.beginPath();
        ctx.arc(st.playerX, playerY, 38, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#34d399';
        ctx.stroke();
      }
      if (hasMagnet) {
        ctx.beginPath();
        ctx.arc(st.playerX, playerY, 44, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#c084fc';
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Plateforme Sonde Doppler
      const grad = ctx.createLinearGradient(st.playerX - 36, playerY - 12, st.playerX + 36, playerY + 12);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(st.playerX - 36, playerY - 10, 72, 22, 11);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e0f2fe';
      ctx.stroke();

      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛸', st.playerX, playerY - 14);
      ctx.restore();

      // Particules
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
          st.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Textes flottants
      for (let i = st.floatingTexts.length - 1; i >= 0; i--) {
        const ft = st.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.022;
        if (ft.alpha <= 0) {
          st.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab, isPlayingArcade, autoFire, arcadeHighScore, awardPointsToProfile, playBeep]);

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    gameStateRef.current.targetX = (e.clientX - rect.left) * scaleX;
  };

  // =========================================================================
  // ÉTATS DU JEU 2 : DUEL THERMIQUE DES COMMUNES (PLUS CHAUD / PLUS FROID)
  // =========================================================================
  const [duelStreak, setDuelStreak] = useState<number>(0);
  const [duelBestStreak, setDuelBestStreak] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('instant_meteo_duel_best') || '0');
    } catch {
      return 0;
    }
  });
  const [duelPair, setDuelPair] = useState<{ left: LocationPoint; right: LocationPoint; leftTemp: number; rightTemp: number }>(() => {
    const s1 = FRENCH_STATIONS[0];
    const s2 = FRENCH_STATIONS[1] || FRENCH_STATIONS[0];
    return { left: s1, right: s2, leftTemp: 16.4, rightTemp: 19.2 };
  });
  const [duelRevealed, setDuelRevealed] = useState<boolean>(false);
  const [duelFeedback, setDuelFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const computeRealisticStationTemp = useCallback(
    (st: LocationPoint) => {
      const base = currentWeather?.temperature ?? 15;
      const latDiff = (46.5 - st.latitude) * 0.85;
      const altCooling = ((st.altitude || 50) / 1000) * 6.2;
      const seed = (st.name.charCodeAt(0) * 7 + (st.altitude || 10)) % 9 - 4;
      return Number((base + latDiff - altCooling + seed * 0.4).toFixed(1));
    },
    [currentWeather?.temperature]
  );

  const generateNextDuel = useCallback(() => {
    const pool = FRENCH_STATIONS.slice(0, 30);
    const idx1 = Math.floor(Math.random() * pool.length);
    let idx2 = Math.floor(Math.random() * pool.length);
    if (idx2 === idx1) idx2 = (idx1 + 1) % pool.length;
    const left = pool[idx1];
    const right = pool[idx2];
    const leftTemp = computeRealisticStationTemp(left);
    let rightTemp = computeRealisticStationTemp(right);
    if (leftTemp === rightTemp) rightTemp = Number((rightTemp + 0.8).toFixed(1));
    setDuelPair({ left, right, leftTemp, rightTemp });
    setDuelRevealed(false);
    setDuelFeedback(null);
  }, [computeRealisticStationTemp]);

  useEffect(() => {
    if (isOpen && activeTab === 'duel') {
      generateNextDuel();
    }
  }, [isOpen, activeTab, generateNextDuel]);

  const handleDuelGuess = (guessHigher: boolean) => {
    if (duelRevealed) return;
    setDuelRevealed(true);
    const isHigher = duelPair.rightTemp >= duelPair.leftTemp;
    const isCorrect = guessHigher === isHigher;

    if (isCorrect) {
      const nextStreak = duelStreak + 1;
      setDuelStreak(nextStreak);
      if (nextStreak > duelBestStreak) {
        setDuelBestStreak(nextStreak);
        try {
          localStorage.setItem('instant_meteo_duel_best', String(nextStreak));
        } catch {}
      }
      setDuelFeedback({
        ok: true,
        msg: `Exact ! ${duelPair.right.name} affiche ${duelPair.rightTemp}°C (${duelPair.right.altitude || 0}m). +40 pts !`
      });
      awardPointsToProfile(40);
      playBeep(640, 120, 'triangle');
    } else {
      setDuelStreak(0);
      setDuelFeedback({
        ok: false,
        msg: `Raté ! ${duelPair.right.name} est à ${duelPair.rightTemp}°C contre ${duelPair.leftTemp}°C à ${duelPair.left.name}.`
      });
      playBeep(200, 220, 'sawtooth');
    }
  };

  // =========================================================================
  // ÉTATS DU JEU 3 : QUIZ DU PRÉVISIONNISTE MÉTÉO
  // =========================================================================
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const handleSelectQuizOption = (idx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(idx);
    const currentQ = QUIZ_QUESTIONS[quizIdx];
    if (idx === currentQ.correct) {
      setQuizScore(s => s + 1);
      awardPointsToProfile(50);
      playBeep(660, 120, 'triangle');
    } else {
      playBeep(220, 200, 'sawtooth');
    }
  };

  const handleNextQuizQuestion = () => {
    setQuizSelected(null);
    setQuizIdx(prev => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  // =========================================================================
  // ÉTATS DU LECTEUR DE FICHIER .ZIP / .HTML DE JEU PERSONNALISÉ
  // =========================================================================
  const [customGameHtml, setCustomGameHtml] = useState<string | null>(() => {
    try {
      return localStorage.getItem('instant_meteo_custom_zip_game_html');
    } catch {
      return null;
    }
  });
  const [customGameTitle, setCustomGameTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('instant_meteo_custom_zip_game_title') || 'Mon Jeu Météo (.zip)';
    } catch {
      return 'Mon Jeu Météo (.zip)';
    }
  });
  const [zipLoading, setZipLoading] = useState<boolean>(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleZipOrHtmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipLoading(true);
    setZipError(null);

    try {
      if (file.name.toLowerCase().endsWith('.zip')) {
        const extracted = await extractZipToRunnableHtml(file);
        setCustomGameHtml(extracted.html);
        setCustomGameTitle(`${extracted.title} (${extracted.fileCount} fichiers)`);
        setActiveTab('zip_player');
        try {
          localStorage.setItem('instant_meteo_custom_zip_game_html', extracted.html);
          localStorage.setItem('instant_meteo_custom_zip_game_title', extracted.title);
        } catch {}
      } else if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
        const text = await file.text();
        setCustomGameHtml(text);
        setCustomGameTitle(file.name);
        setActiveTab('zip_player');
        try {
          localStorage.setItem('instant_meteo_custom_zip_game_html', text);
          localStorage.setItem('instant_meteo_custom_zip_game_title', file.name);
        } catch {}
      } else {
        setZipError('Veuillez sélectionner un fichier .zip ou .html contenant votre jeu.');
      }
    } catch (err: any) {
      setZipError(err?.message || 'Erreur lors de la lecture du fichier .zip.');
    } finally {
      setZipLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0b1324] text-white shadow-2xl transition-all ${
          isFullscreen ? 'w-screen h-screen rounded-none border-0' : 'w-full max-w-5xl max-h-[92vh]'
        }`}
      >
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-lg shadow-emerald-500/20">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  Arcade &amp; Jeux Météo France
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                  +Points Classement
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Station active : <strong className="text-sky-300">{currentStation.name}</strong> ({currentWeather ? `${Math.round(currentWeather.temperature)}°C` : 'Direct'})
                {totalSyncedPoints > 0 && (
                  <span className="ml-2 text-amber-300 font-bold">
                    • +{totalSyncedPoints} pts crédités au profil !
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Mode Tabs & Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('arcade')}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'arcade'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Chasseur d&apos;Orages 2D</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('duel')}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'duel'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Thermometer className="h-3.5 w-3.5" />
              <span>Duel Thermique</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Quiz Météo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('zip_player')}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'zip_player'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Charger ou jouer à votre jeu depuis un fichier .zip"
            >
              <FolderArchive className="h-3.5 w-3.5" />
              <span>Jeu .ZIP</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Couper le son' : 'Activer le son'}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Réduire la fenêtre' : 'Plein écran'}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Fermer le jeu"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-rose-600 hover:border-rose-500 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* ================================================================= */}
          {/* ONGLET 1 : JEU D'ARCADE 2D CHASSEUR D'ORAGES                      */}
          {/* ================================================================= */}
          {activeTab === 'arcade' && (
            <div className="space-y-3">
              {/* HUD Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-black text-amber-300 text-sm">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>Score : {arcadeScore}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="font-bold text-sky-300">
                    Record : {Math.max(arcadeScore, arcadeHighScore)}
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1 font-bold text-rose-400">
                    <span>Vies :</span>
                    <span>{'❤️'.repeat(Math.max(0, arcadeLives)) || '💀'}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="rounded-md bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 font-black text-emerald-300">
                    Combo x{arcadeCombo}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {arcadePhase}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoFire(!autoFire)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      autoFire
                        ? 'bg-sky-600/30 border-sky-400 text-sky-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Tir Laser : {autoFire ? 'AUTO' : 'MANUEL'}
                  </button>
                </div>
              </div>

              {/* Game Canvas Container */}
              <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={440}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerDown={handleCanvasPointerMove}
                  className="block w-full h-auto touch-none cursor-crosshair select-none"
                />

                {/* Start / Game Over Overlay */}
                {!isPlayingArcade && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-xl mb-3">
                      <Gamepad2 className="h-8 w-8" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {isGameOver ? `Partie Terminée — Score : ${arcadeScore} pts` : "Chasseur d'Orages & Sonde Doppler HD"}
                    </h3>

                    <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Pilotez la sonde météo avec la <strong>souris</strong>, le <strong>doigt</strong>, les <strong>flèches du clavier</strong> ou une <strong>manette</strong>. Récoltez les relevés (💧 ☀️ ❄️ 🛰️), activez les boucliers 🛡️ et neutralisez les éclairs ⚡ et tornades 🌪️ avec votre laser Doppler !
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
                      <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">💧 +20 pts</span>
                      <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">☀️ +35 pts</span>
                      <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">❄️ +45 pts</span>
                      <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">🛰️ +100 pts &amp; Combo</span>
                      <span className="rounded-lg bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 text-rose-300">⚡🧊🌪️ Menaces à détruire</span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={startArcadeGame}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>{isGameOver ? 'Rejouer une partie' : 'Lancer la Partie'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-950/50 hover:bg-purple-900/60 px-4 py-3 text-xs font-bold text-purple-200 transition cursor-pointer"
                      >
                        <Upload className="h-4 w-4 text-purple-300" />
                        <span>Charger un jeu (.zip)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 2 : DUEL THERMIQUE DES COMMUNES                            */}
          {/* ================================================================= */}
          {activeTab === 'duel' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Série actuelle : <strong className="text-amber-300">{duelStreak}</strong></span>
                </div>
                <div className="font-bold text-sky-300">
                  Meilleure série : {duelBestStreak}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Station A */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center space-y-2">
                  <span className="inline-block rounded-full bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 text-[10px] font-bold text-sky-300">
                    Station de référence
                  </span>
                  <h3 className="text-lg font-black text-white">{duelPair.left.name}</h3>
                  <p className="text-xs text-slate-400">
                    {duelPair.left.department || 'France'} • Alt. {duelPair.left.altitude || 0} m
                  </p>
                  <div className="pt-2 text-3xl font-black text-amber-300">
                    {duelPair.leftTemp}°C
                  </div>
                </div>

                {/* Station B */}
                <div className="rounded-2xl border border-sky-500/40 bg-slate-900/90 p-5 text-center space-y-2">
                  <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    À deviner
                  </span>
                  <h3 className="text-lg font-black text-white">{duelPair.right.name}</h3>
                  <p className="text-xs text-slate-400">
                    {duelPair.right.department || 'France'} • Alt. {duelPair.right.altitude || 0} m
                  </p>

                  {duelRevealed ? (
                    <div className="pt-2 text-3xl font-black text-emerald-300">
                      {duelPair.rightTemp}°C
                    </div>
                  ) : (
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDuelGuess(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-black text-white transition cursor-pointer"
                      >
                        <ArrowUp className="h-4 w-4" />
                        <span>Plus Chaud</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuelGuess(false)}
                        className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-black text-white transition cursor-pointer"
                      >
                        <ArrowDown className="h-4 w-4" />
                        <span>Plus Froid</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {duelFeedback && (
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs font-bold ${
                    duelFeedback.ok
                      ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
                      : 'border-rose-500/40 bg-rose-950/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {duelFeedback.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                    <span>{duelFeedback.msg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={generateNextDuel}
                    className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-slate-200 cursor-pointer"
                  >
                    Duel suivant →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 3 : QUIZ DU PRÉVISIONNISTE                                 */}
          {/* ================================================================= */}
          {activeTab === 'quiz' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs">
                <span className="font-bold text-slate-300">
                  Question {quizIdx + 1} / {QUIZ_QUESTIONS.length}
                </span>
                <span className="font-black text-amber-300">
                  Bonnes réponses : {quizScore} (+50 pts / réponse)
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {QUIZ_QUESTIONS[quizIdx].q}
                </h3>

                <div className="space-y-2">
                  {QUIZ_QUESTIONS[quizIdx].options.map((opt, idx) => {
                    const isCorrect = idx === QUIZ_QUESTIONS[quizIdx].correct;
                    const isPicked = quizSelected === idx;
                    let btnClass = 'border-slate-800 bg-slate-950/80 text-slate-200 hover:border-sky-500/50';
                    if (quizSelected !== null) {
                      if (isCorrect) btnClass = 'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold';
                      else if (isPicked) btnClass = 'border-rose-500 bg-rose-950/70 text-rose-200';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuizOption(idx)}
                        className={`w-full rounded-xl border p-3 text-left text-xs sm:text-sm transition cursor-pointer ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSelected !== null && (
                  <div className="rounded-xl border border-sky-500/30 bg-sky-950/40 p-3.5 text-xs text-sky-200 space-y-2">
                    <p>{QUIZ_QUESTIONS[quizIdx].explanation}</p>
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs font-black text-slate-950 transition cursor-pointer"
                    >
                      Question suivante →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ONGLET 4 : LECTEUR DE JEU .ZIP / .HTML PERSONNALISÉ               */}
          {/* ================================================================= */}
          {activeTab === 'zip_player' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <FolderArchive className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="font-bold text-purple-200">
                    {customGameHtml ? `Jeu chargé : ${customGameTitle}` : 'Importez votre fichier .zip ou .html de jeu météo'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={zipLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-black text-white transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{zipLoading ? 'Extraction...' : 'Sélectionner le fichier .zip'}</span>
                  </button>

                  {customGameHtml && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomGameHtml(null);
                        try {
                          localStorage.removeItem('instant_meteo_custom_zip_game_html');
                          localStorage.removeItem('instant_meteo_custom_zip_game_title');
                        } catch {}
                      }}
                      className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-950/50 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Effacer</span>
                    </button>
                  )}
                </div>
              </div>

              {zipError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200">
                  {zipError}
                </div>
              )}

              {customGameHtml ? (
                <div className="w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
                  <iframe
                    title={customGameTitle}
                    srcDoc={customGameHtml}
                    className="w-full h-[500px] sm:h-[560px] border-0"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                  />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 p-10 text-center cursor-pointer transition"
                >
                  <FolderArchive className="h-12 w-12 text-purple-400 mb-3" />
                  <p className="text-sm font-bold text-white">
                    Cliquez ici pour ouvrir votre fichier .zip de jeu météo
                  </p>
                  <p className="mt-1 text-xs text-slate-400 max-w-md">
                    Décompression automatique dans le navigateur (HTML5, Canvas, JS, CSS, sons et images) et sauvegarde immédiate pour jouer en un clic depuis l&apos;icône manette.
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.html,.htm"
            onChange={handleZipOrHtmlUpload}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950/90 px-4 py-2.5 text-xs text-slate-400">
          <span>
            🕹️ Contrôles : Souris, Tactile, Clavier (Flèches / Q-D / Espace) ou Manette USB/Bluetooth
          </span>
          {onOpenCompetitiveTab && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCompetitiveTab();
              }}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Voir le Classement National Chasseur Météo →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
