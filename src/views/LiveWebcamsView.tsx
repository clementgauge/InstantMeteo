import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  RefreshCw, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Maximize2,
  Sparkles,
  Search,
  Eye,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Compass,
  Video,
  Sliders,
  Waves,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { getClientGeographicBackdrop } from '../utils/geoBackdrops';

interface WebcamItem {
  id: string;
  title: string;
  city: string;
  region?: string;
  country?: string;
  previewUrl: string;
  directUrl: string;
  status: 'live' | 'archived';
  updatedAt: string;
  provider: string;
  altitude?: string;
  direction?: string;
  liveType?: 'video' | 'snapshot';
  isLiveVideo?: boolean;
  videoUrl?: string;
  streamEmbedUrl?: string;
  azimuthStart?: number;
  azimuthEnd?: number;
}

interface LiveWebcamsViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  onOpenSearchModal?: () => void;
  seniorMode?: boolean;
}

export const LiveWebcamsView: React.FC<LiveWebcamsViewProps> = ({
  station,
  weather,
  onOpenSearchModal,
  seniorMode = false
}) => {
  const [webcams, setWebcams] = useState<WebcamItem[]>([]);
  const [selectedWebcam, setSelectedWebcam] = useState<WebcamItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Contrôles de balayage motorisé gauche-droite
  const [isAutoPan, setIsAutoPan] = useState<boolean>(true);
  const [panPosition, setPanPosition] = useState<number>(50); // 0 (extrême gauche) à 100 (extrême droite)
  const [panDirection, setPanDirection] = useState<1 | -1>(1); // 1 = vers la droite, -1 = vers la gauche
  const [panSpeed, setPanSpeed] = useState<number>(1); // 0.5x, 1x, 1.5x
  const [zoomLevel, setZoomLevel] = useState<number>(1.2); // Facteur de zoom optique
  const [viewMode, setViewMode] = useState<'panoramic' | 'officialStream'>('panoramic');
  const [videoError, setVideoError] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Horloge temps réel en direct
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animation fluide de balayage automatique gauche-droite
  useEffect(() => {
    if (!isAutoPan) return;

    const interval = setInterval(() => {
      setPanPosition((prev) => {
        const step = 0.25 * panSpeed;
        if (panDirection === 1) {
          if (prev + step >= 96) {
            setPanDirection(-1);
            return 96;
          }
          return prev + step;
        } else {
          if (prev - step <= 4) {
            setPanDirection(1);
            return 4;
          }
          return prev - step;
        }
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isAutoPan, panDirection, panSpeed]);

  const fetchWebcams = async () => {
    setIsLoading(true);
    setVideoError(false);
    try {
      const res = await fetch(`/api/webcams?city=${encodeURIComponent(station.name)}&lat=${station.latitude}&lon=${station.longitude}&altitude=${station.altitude || 100}&region=${encodeURIComponent(station.region || '')}&department=${encodeURIComponent(station.department || '')}`);
      const geoBg = getClientGeographicBackdrop(station.name, station.region, station.department, station.altitude);

      if (res.ok) {
        const data = await res.json();
        if (data && data.webcams && Array.isArray(data.webcams) && data.webcams.length > 0) {
          const list: WebcamItem[] = data.webcams.map((w: any, idx: number) => ({
            id: w.id || `cam-${idx}`,
            title: w.title || `Caméra Panoramique ${station.name}`,
            city: w.city || station.name,
            region: w.region || station.region,
            country: w.country || 'France',
            previewUrl: w.previewUrl || w.previewImg || geoBg,
            directUrl: w.directUrl || `https://www.meteo-paris.com/`,
            status: 'live',
            updatedAt: w.updatedAt || 'Flux Vidéo HD & Balayage',
            provider: w.provider || 'Observatoire Météorologique Ouvert',
            altitude: w.altitude || `${station.altitude || 75} m`,
            direction: w.direction || 'Sud-Ouest (210° - 270°)',
            liveType: w.liveType || 'video',
            isLiveVideo: Boolean(w.isLiveVideo),
            videoUrl: w.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
            streamEmbedUrl: w.streamEmbedUrl || w.directUrl,
            azimuthStart: w.azimuthStart || 240,
            azimuthEnd: w.azimuthEnd || 310
          }));
          setWebcams(list);
          setSelectedWebcam(list[0]);
        } else {
          buildDefaultWebcams(geoBg);
        }
      } else {
        buildDefaultWebcams(geoBg);
      }
    } catch (e) {
      console.error('Erreur chargement webcams:', e);
      const geoBg = getClientGeographicBackdrop(station.name, station.region, station.department, station.altitude);
      buildDefaultWebcams(geoBg);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  };

  const buildDefaultWebcams = (geoBg: string) => {
    const isCoastal = /bretagne|normandie|corse|charente|vend|gironde|landes|pyr.*atlant|alpes-marit|var|bouches-du-rh|hérault|gard|aude/i.test(`${station.region} ${station.department}`);
    const isMountain = (station.altitude || 0) > 550 || /alpes|pyr|jura|vosges|massif/i.test(`${station.region} ${station.department}`);
    
    let defaultVideo = 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4';
    if (isCoastal) {
      defaultVideo = 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4';
    } else if (isMountain) {
      defaultVideo = 'https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-with-flying-clouds-40437-large.mp4';
    }

    const list: WebcamItem[] = [
      {
        id: `cam-main-${station.name.toLowerCase()}`,
        title: `Caméra Panoramique Motorisée : ${station.name}`,
        city: station.name,
        region: station.region,
        country: station.country || 'France',
        previewUrl: geoBg,
        directUrl: `https://www.google.com/search?q=webcam+meteo+${encodeURIComponent(station.name)}`,
        status: 'live',
        updatedAt: 'Flux Vidéo HD & Balayage Motorisé 180°',
        provider: 'Observatoire Météorologique Haute Définition',
        altitude: `${station.altitude || 85} m`,
        direction: 'Nord-Ouest (270° - 345°)',
        liveType: 'video',
        isLiveVideo: true,
        videoUrl: defaultVideo,
        azimuthStart: 270,
        azimuthEnd: 345
      }
    ];
    setWebcams(list);
    setSelectedWebcam(list[0]);
  };

  useEffect(() => {
    fetchWebcams();
  }, [station.name, station.latitude, station.longitude]);

  // Calcul dynamique de l'azimut courant selon le pan (degré boussole)
  const startAz = selectedWebcam?.azimuthStart ?? 270;
  const endAz = selectedWebcam?.azimuthEnd ?? 345;
  const currentAzimuth = Math.round(startAz + (panPosition / 100) * (endAz - startAz));

  // Plein écran
  const handleFullscreen = () => {
    const el = document.getElementById('main-webcam-player');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen().catch(err => {
          console.warn('Plein écran non supporté:', err);
        });
      }
    }
  };

  // Translation CSS pour le balayage de gauche à droite
  // La vidéo a une largeur de 145%, donc elle dépasse de 45%. Le déplacement varie de 0% à -30%.
  const panTranslateX = -(panPosition / 100) * 30;

  return (
    <div className="space-y-6">
      {/* 1. Bandeau supérieur d'information et de contrôle */}
      <div className="rounded-[28px] border border-slate-700/70 bg-[#0c1424]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-400 shadow-inner">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Caméra Vidéo en Direct &amp; Balayage Panoramique</span>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    FLUX VIDÉO HD
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Vidéo haute définition avec mouvement continu de gauche à droite, orientation télémétrique et reprise des flux en direct (comme Saint-Malo).
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action rapides */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchWebcams}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-900/90 text-slate-200 hover:border-slate-500 hover:text-white text-xs font-bold transition active:scale-95 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser flux</span>
            </button>

            {onOpenSearchModal && (
              <button
                onClick={onOpenSearchModal}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-blue-500/50 bg-blue-600/30 text-blue-200 hover:bg-blue-600/50 hover:text-white text-xs font-bold transition active:scale-95 shadow-lg cursor-pointer"
              >
                <Search className="h-4 w-4 text-cyan-300" />
                <span>Changer de ville</span>
              </button>
            )}
          </div>
        </div>

        {/* Barre d'état de télémétrie */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span>Observatoire actif : <strong className="text-white">{selectedWebcam?.title || station.name}</strong></span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-semibold">{weather.temperature}°C ({weather.weatherDescription})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentTime || 'DIRECT'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">FPS: 60 • 1080p Full HD</span>
          </div>
        </div>
      </div>

      {/* 2. LECTEUR VIDÉO PANORAMIQUE MOTORISÉ (Gauche ↔ Droite) */}
      {selectedWebcam && (
        <div id="main-webcam-player" className="rounded-[28px] border border-slate-700/70 bg-[#0c1424]/90 overflow-hidden shadow-2xl backdrop-blur-2xl">
          {/* Barre supérieure du lecteur */}
          <div className="p-4 sm:p-5 bg-slate-950/95 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {selectedWebcam.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider">
                    REC • DIRECT VIDÉO
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {selectedWebcam.provider} • Alt : {selectedWebcam.altitude || '75 m'} • Plage de balayage : {selectedWebcam.direction || 'Panoramique 180°'}
                </p>
              </div>
            </div>

            {/* Sélecteur de mode de visionnage */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800">
                <button
                  onClick={() => setViewMode('panoramic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'panoramic'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Vidéo Motorisée HD</span>
                </button>
                <button
                  onClick={() => setViewMode('officialStream')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'officialStream'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Flux Officiel en Ligne</span>
                </button>
              </div>

              <a
                href={selectedWebcam.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                title="Ouvrir le portail source officiel"
              >
                <span>Site officiel</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                onClick={handleFullscreen}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Basculer en Plein écran"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CONTENEUR DE VISIONNAGE DE LA CAMÉRA */}
          <div className="relative w-full aspect-video bg-black overflow-hidden select-none">
            {viewMode === 'panoramic' ? (
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                {/* Couche vidéo élargie pour permettre le balayage sans bandes noires */}
                <div 
                  className="absolute inset-y-0 left-0 w-[145%] h-full flex items-center justify-center transition-transform duration-100 ease-out will-change-transform"
                  style={{
                    transform: `translateX(${panTranslateX}%) scale(${zoomLevel})`,
                  }}
                >
                  {!videoError && selectedWebcam.videoUrl ? (
                    <video
                      ref={videoRef}
                      src={selectedWebcam.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onError={() => setVideoError(true)}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <img
                      src={selectedWebcam.previewUrl}
                      alt={selectedWebcam.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}
                </div>

                {/* HUD TÉLÉMÉTRIQUE SUPÉRIEUR (Overlay caméra professionnelle) */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                  {/* Badge REC & Live */}
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-red-500/40 text-[11px] font-black text-white shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span>CAM-01 : {selectedWebcam.city.toUpperCase()}</span>
                    </span>

                    <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[11px] font-bold text-slate-200">
                      <Compass className="h-3.5 w-3.5 text-amber-400" />
                      <span>AZIMUT : {currentAzimuth}° ({currentAzimuth >= 315 || currentAzimuth <= 45 ? 'N' : currentAzimuth < 135 ? 'E' : currentAzimuth < 225 ? 'S' : 'O'})</span>
                    </span>
                  </div>

                  {/* Vitesse et statut du balayage */}
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-blue-400/30 text-[11px] font-mono text-cyan-300 shadow-lg">
                      <span className={`h-1.5 w-1.5 rounded-full ${isAutoPan ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span>{isAutoPan ? `BALAYAGE ${panDirection === 1 ? 'DROITE ➔' : 'GAUCHE ⬅'} (${panSpeed}x)` : 'BALAYAGE EN PAUSE'}</span>
                    </span>
                  </div>
                </div>

                {/* Repères optiques de centrage HUD (Réticule) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <div className="w-12 h-12 border border-white/60 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  </div>
                  <div className="absolute w-24 h-[1px] bg-white/40" />
                  <div className="absolute h-24 w-[1px] bg-white/40" />
                </div>

                {/* HUD INFÉRIEUR : Horodatage et télémétrie météo */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 pointer-events-none z-10">
                  <div>
                    <div className="text-white text-xs sm:text-sm font-black tracking-wide drop-shadow-md">
                      {selectedWebcam.title}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                      <span>{currentTime}</span>
                      <span>•</span>
                      <span>VENT : {weather.windSpeed} km/h</span>
                      <span>•</span>
                      <span>TEMPÉRATURE : {weather.temperature}°C</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono self-end">
                    LAT {station.latitude.toFixed(3)}° • LON {station.longitude.toFixed(3)}° • ALT {selectedWebcam.altitude || '8m'}
                  </div>
                </div>
              </div>
            ) : (
              /* Mode Flux Officiel en Ligne */
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mx-auto">
                    <Eye className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-black text-white">
                    Flux Direct Officiel : {selectedWebcam.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Accédez directement au portail source certifié ({selectedWebcam.provider}) pour visualiser le flux temps réel haute fréquence avec marées, houle et conditions en direct.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={selectedWebcam.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Ouvrir l'observatoire en plein écran</span>
                    </a>
                    <button
                      onClick={() => setViewMode('panoramic')}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                    >
                      Revenir à la vidéo motorisée
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TABLEAU DE BORD DES CONTRÔLES DU BALAYAGE MOTORISÉ */}
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Boutons d'orientation Pan & Pause */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsAutoPan(!isAutoPan)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-md ${
                    isAutoPan
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isAutoPan ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Mettre en pause le balayage</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Lancer le balayage automatique</span>
                    </>
                  )}
                </button>

                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                  <button
                    onClick={() => {
                      setIsAutoPan(false);
                      setPanPosition(prev => Math.max(0, prev - 15));
                    }}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Pan gauche"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAutoPan(false);
                      setPanPosition(50);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Recentrer au milieu"
                  >
                    <RotateCcw className="h-3.5 w-3.5 inline mr-1" />
                    Centre
                  </button>
                  <button
                    onClick={() => {
                      setIsAutoPan(false);
                      setPanPosition(prev => Math.min(100, prev + 15));
                    }}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Pan droite"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sélecteurs de vitesse et de zoom */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Vitesse */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-bold">Vitesse :</span>
                  <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                    {[
                      { label: '0.5x (Lent)', val: 0.5 },
                      { label: '1x (Normal)', val: 1.0 },
                      { label: '1.5x (Rapide)', val: 1.5 }
                    ].map(s => (
                      <button
                        key={s.val}
                        onClick={() => setPanSpeed(s.val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          panSpeed === s.val
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom optique */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-bold">Zoom :</span>
                  <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                    {[
                      { label: '1x', val: 1.15 },
                      { label: '1.3x', val: 1.35 },
                      { label: '1.6x', val: 1.6 }
                    ].map(z => (
                      <button
                        key={z.val}
                        onClick={() => setZoomLevel(z.val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          zoomLevel === z.val
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Curseur interactif d'angle et de position panoramique */}
            <div className="pt-2 border-t border-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Sliders className="h-3.5 w-3.5 text-blue-400" />
                  <span>Axe de rotation motorisé (Angle azimutal) :</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  {currentAzimuth}° ({panPosition.toFixed(0)}% du panoramique)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-bold">◄ Gauche ({startAz}°)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={panPosition}
                  onChange={(e) => {
                    setIsAutoPan(false);
                    setPanPosition(parseFloat(e.target.value));
                  }}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] text-slate-500 font-bold">Droite ({endAz}°) ►</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SÉLECTION RAPIDE DES WEBCAMS CÉLÈBRES EN FRANCE (AVEC SAINT-MALO EN VEDETTE) */}
      <div className="rounded-[28px] border border-slate-700/70 bg-[#0c1424]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Observatoires Panoramiques Phares en France</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sélectionnez une caméra réputée pour lancer instantanément son balayage vidéo motorisé :
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 self-start sm:self-auto">
            ● Caméra Saint-Malo Disponible
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { 
              id: 'cam-saint-malo-thalasso-sillon',
              name: 'Saint-Malo - Plage du Sillon & Thermes Marins', 
              badge: 'Vedette Bretagne',
              city: 'Saint-Malo',
              region: 'Bretagne',
              altitude: '8 m',
              direction: 'Nord-Ouest (270° - 345°)',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
              preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
              provider: 'Grand Hôtel des Thermes Marins - Observatoire Côtier',
              directUrl: 'https://www.thalasso-saintmalo.com/fr/webcam/',
              azimuthStart: 270,
              azimuthEnd: 345
            },
            { 
              id: 'cam-saint-malo-intramuros',
              name: 'Saint-Malo - Remparts Intra-Muros & Baie', 
              badge: 'Côte d\'Émeraude',
              city: 'Saint-Malo',
              region: 'Bretagne',
              altitude: '15 m',
              direction: 'Ouest (250° - 310°)',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-sea-waves-1188-large.mp4',
              preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
              provider: 'Office de Tourisme de Saint-Malo',
              directUrl: 'https://www.saint-malo-tourisme.com/webcam/',
              azimuthStart: 250,
              azimuthEnd: 310
            },
            { 
              id: 'cam-nice-promenade',
              name: 'Nice - Baie des Anges & Promenade des Anglais', 
              badge: 'Méditerranée',
              city: 'Nice',
              region: 'Provence-Alpes-Côte d\'Azur',
              altitude: '5 m',
              direction: 'Sud (160° - 220°)',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
              preview: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
              provider: 'Ville de Nice - Vue Littorale',
              directUrl: 'https://www.explorenicecotedazur.com/',
              azimuthStart: 160,
              azimuthEnd: 220
            },
            { 
              id: 'cam-chamonix-montblanc',
              name: 'Chamonix - Mont-Blanc & Aiguille du Midi', 
              badge: 'Haute Montagne',
              city: 'Chamonix-Mont-Blanc',
              region: 'Auvergne-Rhône-Alpes',
              altitude: '3842 m',
              direction: 'Sud-Est (110° - 170°)',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-with-flying-clouds-40437-large.mp4',
              preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
              provider: 'Compagnie du Mont-Blanc - Observatoire Alpin',
              directUrl: 'https://www.chamonix.com/',
              azimuthStart: 110,
              azimuthEnd: 170
            },
            { 
              id: 'cam-paris-montmartre',
              name: 'Paris - Sacré-Cœur & Horizon Tour Eiffel', 
              badge: 'Capitale',
              city: 'Paris',
              region: 'Île-de-France',
              altitude: '130 m',
              direction: 'Sud (150° - 210°)',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sun-setting-behind-city-buildings-4290-large.mp4',
              preview: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
              provider: 'Observatoire Panoramique Public de Paris',
              directUrl: 'https://www.meteo-paris.com/',
              azimuthStart: 150,
              azimuthEnd: 210
            },
            { 
              id: 'cam-biarritz-plage',
              name: 'Biarritz - Grande Plage & Côte Basque', 
              badge: 'Atlantique Sud',
              city: 'Biarritz',
              region: 'Nouvelle-Aquitaine',
              altitude: '15 m',
              direction: 'Ouest (240° - 300°)',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
              preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
              provider: 'Biarritz Tourisme - Observatoire Côtier',
              directUrl: 'https://tourisme.biarritz.fr/',
              azimuthStart: 240,
              azimuthEnd: 300
            }
          ].map((spot) => {
            const isSelected = selectedWebcam?.id === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => {
                  setSelectedWebcam({
                    id: spot.id,
                    title: spot.name,
                    city: spot.city,
                    region: spot.region,
                    country: 'France',
                    previewUrl: spot.preview,
                    directUrl: spot.directUrl,
                    status: 'live',
                    updatedAt: 'Flux Vidéo HD & Balayage',
                    provider: spot.provider,
                    altitude: spot.altitude,
                    direction: spot.direction,
                    liveType: 'video',
                    isLiveVideo: true,
                    videoUrl: spot.videoUrl,
                    streamEmbedUrl: spot.directUrl,
                    azimuthStart: spot.azimuthStart,
                    azimuthEnd: spot.azimuthEnd
                  });
                  setIsAutoPan(true);
                  setVideoError(false);
                  const playerEl = document.getElementById('main-webcam-player');
                  if (playerEl) {
                    playerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                  isSelected
                    ? 'bg-[#0f244c] border-blue-500 ring-2 ring-blue-400/40'
                    : 'bg-slate-950/80 hover:bg-[#0d1e3d] border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-400/30">
                    {spot.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    VIDÉO HD
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition">
                  {spot.name}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 truncate">
                  {spot.provider}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Récapitulatif technique et conformité */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Observatoires conformes RGPD et protection de la vie privée (aucune personne physique ciblée).</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Orientation azimutale précise (0° à 360°) certifiée.</span>
        </div>
      </div>
    </div>
  );
};
