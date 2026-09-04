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

    // Pure OpenStreetMap Basemap Layer
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    // Suppress any tile error spam
    osmLayer.on('tileerror', () => {});
    osmLayer.addTo(map);

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
      const color = option?.color || '#3b82f6';

      const customIcon = L.divIcon({
        className: 'custom-community-report-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, 0.95);
            border: 2px solid ${color};
            border-radius: 9999px;
            padding: 4px 8px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 12px ${color}88;
            cursor: pointer;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span style="font-size: 16px; margin-right: 4px;">${report.emoji}</span>
            <span style="font-size: 11px; font-weight: 800; color: #ffffff; font-family: sans-serif;">
              ${report.temperature > 0 ? `+${report.temperature}` : report.temperature}°
            </span>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const relativeMinutes = Math.round((Date.now() - new Date(report.timestamp).getTime()) / (1000 * 60));
      const timeStr = relativeMinutes < 60 
        ? `Il y a ${relativeMinutes} min` 
        : `Il y a ${Math.round(relativeMinutes / 60)}h`;

      const popupContent = document.createElement('div');
      popupContent.className = 'community-popup p-1 text-slate-900';
      popupContent.innerHTML = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            <div style="font-weight: 900; font-size: 13px; color: #0f172a;">📍 ${report.city}</div>
            <span style="font-size: 9px; font-weight: 800; background: ${color}22; color: ${color}; border: 1px solid ${color}; padding: 2px 6px; rounded: 6px; border-radius: 6px;">
              ${report.intensity}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 24px;">${report.emoji}</span>
            <div>
              <div style="font-weight: 800; font-size: 12px; color: #1e293b;">${report.weatherLabel}</div>
              <div style="font-size: 14px; font-weight: 900; color: #0284c7;">${report.temperature}°C</div>
            </div>
          </div>
          ${report.comment ? `<p style="font-size: 11px; color: #475569; margin: 4px 0 8px 0; font-style: italic; background: #f8fafc; padding: 6px; border-radius: 6px;">"${report.comment}"</p>` : ''}
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 6px;">
            <span>Par <strong>${report.reporterPseudo}</strong></span>
            <span>🕒 ${timeStr}</span>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #059669; font-weight: 700;">✅ ${report.confirmations} confirmations</span>
            <button id="btn-confirm-${report.id}" style="background: #0284c7; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer;">
              👍 Confirmer
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-confirm-${report.id}`);
        if (btn) {
          btn.onclick = () => {
            const updated = confirmCommunityReport(report.id);
            setReports(updated);
            if (isD1Configured()) {
              confirmReportInD1(report.id);
            }
            btn.innerText = '✅ Confirmé !';
            btn.style.background = '#059669';
          };
        }
      });

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
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/70 to-slate-900 p-5 sm:p-6 shadow-xl backdrop-blur-md">
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
      <div className="relative rounded-3xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
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
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
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
