import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Users, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  Filter, 
  Send, 
  Crosshair, 
  Clock, 
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  CommunityWeatherReport, 
  getCommunityReports, 
  addCommunityReport, 
  confirmCommunityReport, 
  PHENOMENA_OPTIONS 
} from '../services/communityWeatherReportsService';
import { 
  loadPlayerProfile, 
  rewardCommunityReport 
} from '../services/competitiveGameService';
import {
  isD1Configured,
  fetchCommunityReportsFromD1,
  postCommunityReportToD1,
  confirmReportInD1
} from '../services/cloudflareD1Service';
import { LocationPoint } from '../types/weather';

interface CommunityWeatherMapProps {
  currentStation: LocationPoint;
  seniorMode?: boolean;
  onPointsAwarded?: (points: number, reason: string) => void;
}

export const CommunityWeatherMap: React.FC<CommunityWeatherMapProps> = ({
  currentStation,
  seniorMode = false,
  onPointsAwarded
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [reports, setReports] = useState<CommunityWeatherReport[]>(() => getCommunityReports());
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Form inputs
  const playerProfile = loadPlayerProfile();
  const [pseudoInput, setPseudoInput] = useState<string>(playerProfile?.pseudo || '');
  const [cityInput, setCityInput] = useState<string>(currentStation.name || '');
  const [latInput, setLatInput] = useState<number>(currentStation.latitude || 46.6);
  const [lonInput, setLonInput] = useState<number>(currentStation.longitude || 1.88);
  const [selectedPhenomenon, setSelectedPhenomenon] = useState<string>('storm');
  const [tempInput, setTempInput] = useState<string>('18');
  const [intensityInput, setIntensityInput] = useState<'FAIBLE' | 'MODÉRÉE' | 'FORTE' | 'EXTRÊME'>('FORTE');
  const [commentInput, setCommentInput] = useState<string>('');

  // Load remote reports from Cloudflare D1 if configured
  useEffect(() => {
    if (isD1Configured()) {
      fetchCommunityReportsFromD1().then(remoteReports => {
        if (remoteReports) {
          setReports(remoteReports);
        }
      });
    }

    const interval = setInterval(() => {
      setReports(getCommunityReports());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 1. Initialize Map with pure OpenStreetMap basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentStation.latitude || 46.6033, currentStation.longitude || 1.8883],
      zoom: 6,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false
    });

    // Fond cartographique Satellite HD identique à Radar Précipitations & Vents HD
    const baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 18,
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '© Esri, Maxar, Earthstar Geographics'
    });

    // Suppress any tile error spam
    baseLayer.on('tileerror', () => {});
    baseLayer.addTo(map);

    const markersGroup = L.layerGroup();
    markersGroup.addTo(map);
    markersLayerGroupRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const filtered = selectedFilter === 'ALL' 
      ? reports 
      : reports.filter(r => r.weatherCode === selectedFilter);

    filtered.forEach(report => {
      const option = PHENOMENA_OPTIONS.find(p => p.code === report.weatherCode);
      const rawColor = option?.color || '#3b82f6';
      const color = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : '#3b82f6';

      const iconWrap = document.createElement('div');
      iconWrap.style.position = 'relative';
      iconWrap.style.display = 'flex';
      iconWrap.style.alignItems = 'center';
      iconWrap.style.justifyContent = 'center';
      iconWrap.style.background = 'rgba(15, 23, 42, 0.95)';
      iconWrap.style.border = `2px solid ${color}`;
      iconWrap.style.borderRadius = '9999px';
      iconWrap.style.padding = '4px 8px';
      iconWrap.style.boxShadow = `0 4px 14px rgba(0,0,0,0.5), 0 0 12px ${color}88`;
      iconWrap.style.cursor = 'pointer';
      iconWrap.style.whiteSpace = 'nowrap';
      iconWrap.style.transform = 'translate(-50%, -50%)';

      const emojiSpan = document.createElement('span');
      emojiSpan.style.fontSize = '16px';
      emojiSpan.style.marginRight = '4px';
      emojiSpan.textContent = String(report.emoji ?? '🌤️');

      const tempSpan = document.createElement('span');
      tempSpan.style.fontSize = '11px';
      tempSpan.style.fontWeight = '800';
      tempSpan.style.color = '#ffffff';
      tempSpan.style.fontFamily = 'sans-serif';
      tempSpan.textContent = `${report.temperature > 0 ? `+${report.temperature}` : report.temperature}°`;

      iconWrap.appendChild(emojiSpan);
      iconWrap.appendChild(tempSpan);

      const customIcon = L.divIcon({
        className: 'custom-community-report-marker',
        html: iconWrap,
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const relativeMinutes = Math.round((Date.now() - new Date(report.timestamp).getTime()) / (1000 * 60));
      const remainingMinutes = Math.max(1, 60 - relativeMinutes);

      const popupContent = document.createElement('div');
      popupContent.className = 'community-popup p-1 text-slate-900';

      const container = document.createElement('div');
      container.style.minWidth = '220px';
      container.style.fontFamily = 'system-ui, sans-serif';

      // Top row: city + intensity badge
      const headerRow = document.createElement('div');
      headerRow.style.display = 'flex';
      headerRow.style.alignItems = 'center';
      headerRow.style.justifyContent = 'space-between';
      headerRow.style.marginBottom = '6px';
      headerRow.style.borderBottom = '1px solid #e2e8f0';
      headerRow.style.paddingBottom = '4px';

      const cityEl = document.createElement('div');
      cityEl.style.fontWeight = '900';
      cityEl.style.fontSize = '13px';
      cityEl.style.color = '#0f172a';
      cityEl.textContent = `📍 ${report.city}`;

      const intensityEl = document.createElement('span');
      intensityEl.style.fontSize = '9px';
      intensityEl.style.fontWeight = '800';
      intensityEl.style.background = `${color}22`;
      intensityEl.style.color = color;
      intensityEl.style.border = `1px solid ${color}`;
      intensityEl.style.padding = '2px 6px';
      intensityEl.style.borderRadius = '6px';
      intensityEl.textContent = String(report.intensity ?? '');

      headerRow.appendChild(cityEl);
      headerRow.appendChild(intensityEl);
      container.appendChild(headerRow);

      // Middle row: phenomenon + temperature
      const middleRow = document.createElement('div');
      middleRow.style.display = 'flex';
      middleRow.style.alignItems = 'center';
      middleRow.style.gap = '8px';
      middleRow.style.marginBottom = '6px';

      const bigEmoji = document.createElement('span');
      bigEmoji.style.fontSize = '24px';
      bigEmoji.textContent = String(report.emoji ?? '🌤️');

      const weatherMeta = document.createElement('div');
      const labelEl = document.createElement('div');
      labelEl.style.fontWeight = '800';
      labelEl.style.fontSize = '12px';
      labelEl.style.color = '#1e293b';
      labelEl.textContent = String(report.weatherLabel ?? '');

      const tempTextEl = document.createElement('div');
      tempTextEl.style.fontSize = '14px';
      tempTextEl.style.fontWeight = '900';
      tempTextEl.style.color = '#0284c7';
      tempTextEl.textContent = `${report.temperature}°C`;

      weatherMeta.appendChild(labelEl);
      weatherMeta.appendChild(tempTextEl);
      middleRow.appendChild(bigEmoji);
      middleRow.appendChild(weatherMeta);
      container.appendChild(middleRow);

      // Optional comment (escaped cleanly via textContent)
      if (report.comment) {
        const commentEl = document.createElement('p');
        commentEl.style.fontSize = '11px';
        commentEl.style.color = '#475569';
        commentEl.style.margin = '4px 0 8px 0';
        commentEl.style.fontStyle = 'italic';
        commentEl.style.background = '#f8fafc';
        commentEl.style.padding = '6px';
        commentEl.style.borderRadius = '6px';
        commentEl.textContent = `"${report.comment}"`;
        container.appendChild(commentEl);
      }

      // Reporter & expiry row
      const metaRow = document.createElement('div');
      metaRow.style.display = 'flex';
      metaRow.style.alignItems = 'center';
      metaRow.style.justifyContent = 'space-between';
      metaRow.style.fontSize = '10px';
      metaRow.style.color = '#64748b';
      metaRow.style.marginTop = '6px';

      const bySpan = document.createElement('span');
      bySpan.textContent = 'Par ';
      const pseudoStrong = document.createElement('strong');
      pseudoStrong.textContent = String(report.reporterPseudo || 'Anonyme');
      bySpan.appendChild(pseudoStrong);

      const expirySpan = document.createElement('span');
      expirySpan.style.color = '#ea580c';
      expirySpan.style.fontWeight = '700';
      expirySpan.textContent = `⏱️ Expire dans ${remainingMinutes}m`;

      metaRow.appendChild(bySpan);
      metaRow.appendChild(expirySpan);
      container.appendChild(metaRow);

      // Footer confirmations & confirm button
      const footerRow = document.createElement('div');
      footerRow.style.marginTop = '8px';
      footerRow.style.paddingTop = '6px';
      footerRow.style.borderTop = '1px solid #f1f5f9';
      footerRow.style.display = 'flex';
      footerRow.style.alignItems = 'center';
      footerRow.style.justifyContent = 'space-between';

      const confirmCountEl = document.createElement('span');
      confirmCountEl.style.fontSize = '10px';
      confirmCountEl.style.color = '#059669';
      confirmCountEl.style.fontWeight = '700';
      confirmCountEl.textContent = `✅ ${report.confirmations} confirmations`;

      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.style.background = '#0284c7';
      confirmBtn.style.color = 'white';
      confirmBtn.style.border = 'none';
      confirmBtn.style.borderRadius = '6px';
      confirmBtn.style.padding = '4px 8px';
      confirmBtn.style.fontSize = '10px';
      confirmBtn.style.fontWeight = '700';
      confirmBtn.style.cursor = 'pointer';
      confirmBtn.textContent = '👍 Confirmer';
      confirmBtn.addEventListener('click', () => {
        const updated = confirmCommunityReport(report.id);
        setReports(updated);
        if (isD1Configured()) {
          confirmReportInD1(report.id);
        }
        confirmBtn.textContent = '✅ Confirmé !';
        confirmBtn.style.background = '#059669';
      });

      footerRow.appendChild(confirmCountEl);
      footerRow.appendChild(confirmBtn);
      container.appendChild(footerRow);

      popupContent.appendChild(container);

      marker.bindPopup(popupContent);
      marker.addTo(group);
    });
  }, [reports, selectedFilter]);

  // Geolocation quick auto-fill
  const handleUseMyPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatInput(pos.coords.latitude);
          setLonInput(pos.coords.longitude);
          setCityInput('Position GPS Utilisateur');
        },
        () => {
          setLatInput(currentStation.latitude);
          setLonInput(currentStation.longitude);
          setCityInput(currentStation.name);
        }
      );
    }
  };

  // Submit report handler
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim() || !pseudoInput.trim()) return;

    setIsSubmitting(true);
    const chosenOption = PHENOMENA_OPTIONS.find(p => p.code === selectedPhenomenon) || PHENOMENA_OPTIONS[0];

    const newRep = addCommunityReport({
      city: cityInput.trim(),
      latitude: latInput,
      longitude: lonInput,
      weatherCode: chosenOption.code,
      weatherLabel: chosenOption.label,
      emoji: chosenOption.emoji,
      temperature: parseFloat(tempInput) || 18,
      intensity: intensityInput,
      comment: commentInput.trim() || undefined,
      reporterPseudo: pseudoInput.trim()
    });

    // Reward points in competitive game
    const currentProfile = loadPlayerProfile();
    if (currentProfile) {
      rewardCommunityReport(currentProfile);
      if (onPointsAwarded) {
        onPointsAwarded(150, 'Signalement Météo Citoyen Validé !');
      }
    }

    // Submit to Cloudflare D1 if configured
    if (isD1Configured()) {
      postCommunityReportToD1(newRep);
    }

    setReports(prev => [newRep, ...prev]);
    setIsSubmitting(false);
    setIsFormOpen(false);
    setSubmissionSuccess(`Merci ${pseudoInput} ! Votre observation à ${cityInput} a été publiée sur la carte pour toute la communauté (+150 pts Chasse Météo).`);

    // Center map on new report
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latInput, lonInput], 10, { duration: 1.5 });
    }

    setTimeout(() => {
      setSubmissionSuccess(null);
    }, 6000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/70 to-slate-900 p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 shadow-inner">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Carte Collaborative des Utilisateurs
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse">
                  Direct Citoyen
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  🔄 Réinitialisation Quotidienne (00h)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-black flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Base Synchronisée
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Chaque utilisateur signale la météo observée en direct dans sa commune. Affichage instantané sur fond de carte OpenStreetMap. Réinitialisé chaque jour.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-5 py-3 text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Signaler la météo chez moi (+150 pts)</span>
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtrer par phénomène :</span>
          </div>

          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-white text-slate-950 font-black shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tous ({reports.length})
          </button>

          {PHENOMENA_OPTIONS.map(opt => {
            const count = reports.filter(r => r.weatherCode === opt.code).length;
            const isSelected = selectedFilter === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => setSelectedFilter(opt.code)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label.split('/')[0]}</span>
                {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification */}
      {submissionSuccess && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs sm:text-sm text-emerald-200 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="font-semibold">{submissionSuccess}</p>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative rounded-xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[540px] sm:h-[620px] z-0"
        />

        {/* Floating Legend / Quick Stats */}
        <div className="absolute top-3 right-3 z-[400] bg-slate-950/90 border border-slate-800/80 rounded-2xl p-2.5 shadow-xl backdrop-blur-md max-w-xs text-xs hidden sm:block">
          <div className="flex items-center gap-2 font-bold text-white mb-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Météo Enregistrée par la Communauté</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Cliquez sur un marqueur pour consulter l'intensité, le commentaire local et confirmer le signalement.
          </p>
        </div>

        {/* Empty state notice if no reports today yet */}
        {reports.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-slate-950/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs text-center max-w-md w-[92%] animate-in fade-in">
            <p className="font-black text-slate-100 text-sm">
              📍 Aucun signalement pour aujourd'hui
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              La carte se réinitialise chaque jour à 00h. Soyez le premier à signaler le temps observé chez vous !
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Signaler la météo dans ma commune (+150 pts)</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal / Slide-over Form to Submit a Report */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Signaler la Météo Constatée</h3>
                <p className="text-xs text-blue-300">Votre observation sera visible instantanément par tous les utilisateurs.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              {/* Pseudo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Votre Pseudo Chasseur Météo :
                </label>
                <input
                  type="text"
                  required
                  value={pseudoInput}
                  onChange={(e) => setPseudoInput(e.target.value)}
                  placeholder="Ex: ChasseurDuSud, OrageMaster..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* City & GPS Autofill */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Commune / Ville / Lieu-dit :
                  </label>
                  <button
                    type="button"
                    onClick={handleUseMyPosition}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Crosshair className="h-3 w-3" />
                    <span>Ma position GPS</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Ex: Lyon, Brest, Chamonix..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Phenomenon Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Phénomène Météorologique Constaté :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PHENOMENA_OPTIONS.map(opt => (
                    <button
                      type="button"
                      key={opt.code}
                      onClick={() => setSelectedPhenomenon(opt.code)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                        selectedPhenomenon === opt.code
                          ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span className="text-2xl mb-1">{opt.emoji}</span>
                      <span className="text-[11px] font-bold leading-tight">{opt.label.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature & Intensity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Température constatée (°C) :
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Intensité ressentie :
                  </label>
                  <select
                    value={intensityInput}
                    onChange={(e) => setIntensityInput(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="FAIBLE">Faible</option>
                    <option value="MODÉRÉE">Modérée</option>
                    <option value="FORTE">Forte</option>
                    <option value="EXTRÊME">Extrême</option>
                  </select>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Commentaire / Détails du phénomène (facultatif) :
                </label>
                <textarea
                  rows={2}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Ex: Grêlons de 1cm, chaussée inondée, vent tourbillonnant..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>Publier sur la carte (+150 pts)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
