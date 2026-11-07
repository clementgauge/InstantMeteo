import React, { useState, useRef } from 'react';
import { 
  X, 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Printer, 
  Sparkles, 
  Send, 
  Smartphone, 
  Radio, 
  CheckCircle2 
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { LocationPoint } from '../types/weather';

interface ShareAndQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation?: LocationPoint;
  currentTab?: string;
  initialTab?: 'share' | 'qrcode';
}

export const ShareAndQrCodeModal: React.FC<ShareAndQrCodeModalProps> = ({
  isOpen,
  onClose,
  currentStation,
  currentTab = 'realtime',
  initialTab = 'share'
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'qrcode'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [linkTarget, setLinkTarget] = useState<'current' | 'station' | 'radar' | 'bulletin' | 'home'>('current');
  const [customText, setCustomText] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const qrCanvasContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Compute canonical URL base
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://instantmeteo.instantmeteofr.workers.dev';
  
  // Station slug helper
  const stationSlug = currentStation 
    ? (currentStation.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    : '';

  // Get effective target URL
  let targetUrl = origin;
  if (useCustomUrl && customText.trim()) {
    targetUrl = customText.trim().startsWith('http') ? customText.trim() : `https://${customText.trim()}`;
  } else if (linkTarget === 'current') {
    targetUrl = typeof window !== 'undefined' ? window.location.href : origin;
  } else if (linkTarget === 'station' && stationSlug) {
    targetUrl = `${origin}/${stationSlug}`;
  } else if (linkTarget === 'radar') {
    targetUrl = `${origin}/radar`;
  } else if (linkTarget === 'bulletin') {
    targetUrl = `${origin}/bulletins`;
  } else {
    targetUrl = origin;
  }

  const shareTitle = currentStation 
    ? `Météo ${currentStation.name} en direct • Instant Météo`
    : `Instant Météo • Prévisions & Radar Pluie en Direct`;

  const shareDescription = `Consultez la météo en direct, le radar de pluie haute résolution et les prévisions fiables sans publicité sur Instant Météo.`;

  // Native navigator.share
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle} — ${shareDescription}`,
          url: targetUrl
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed, fallback to copy:', err);
        }
      }
    }
    // Fallback to copy link
    handleCopyLink();
  };

  // Copy to clipboard
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download QR Code as branded PNG
  const handleDownloadQrCode = () => {
    if (!qrCanvasContainerRef.current) return;
    const canvas = qrCanvasContainerRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      // Create high-res branded export canvas
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      const padding = 32;
      const bannerHeight = 84;
      const footerHeight = 44;
      const qrSize = canvas.width;
      
      exportCanvas.width = qrSize + (padding * 2);
      exportCanvas.height = qrSize + bannerHeight + footerHeight + (padding * 2);

      // Card background
      ctx.fillStyle = '#0b1329';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Subtle border
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, exportCanvas.width - 4, exportCanvas.height - 4);

      // Top Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INSTANT MÉTÉO', exportCanvas.width / 2, padding + 28);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      const subtitle = currentStation ? `Météo en Direct • ${currentStation.name}` : 'Radar & Prévisions 100% Gratuites';
      ctx.fillText(subtitle, exportCanvas.width / 2, padding + 54);

      // Draw white background plate for QR code
      const qrPlateX = padding;
      const qrPlateY = padding + bannerHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrPlateX, qrPlateY, qrSize, qrSize);

      // Draw QR Canvas image
      ctx.drawImage(canvas, qrPlateX, qrPlateY, qrSize, qrSize);

      // Bottom Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Scannez avec votre appareil photo pour ouvrir', exportCanvas.width / 2, exportCanvas.height - padding - 14);

      // Trigger download
      const pngUrl = exportCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const filename = currentStation 
        ? `instant-meteo-qr-${stationSlug}.png`
        : `instant-meteo-qrcode.png`;
      downloadLink.download = filename;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (e) {
      console.warn('QR code download failed:', e);
    }
  };

  // Print poster
  const handlePrintQrCode = () => {
    window.print();
  };

  // Social share URLs
  const encodedUrl = encodeURIComponent(targetUrl);
  const encodedTitle = encodeURIComponent(`${shareTitle} — Service météo sans pub`);
  
  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      bgColor: 'bg-emerald-600 hover:bg-emerald-500'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bgColor: 'bg-sky-600 hover:bg-sky-500'
    },
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bgColor: 'bg-slate-800 hover:bg-slate-700'
    },
    {
      name: 'Facebook',
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bgColor: 'bg-blue-600 hover:bg-blue-500'
    },
    {
      name: 'E-mail',
      icon: '✉️',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodedTitle}%0A%0A${encodedUrl}`,
      bgColor: 'bg-indigo-600 hover:bg-indigo-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md">
              {activeTab === 'share' ? <Share2 className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {activeTab === 'share' ? 'Partager Instant Météo' : 'QR Code d\'accès direct'}
              </h2>
              <p className="text-xs text-slate-400">
                100 % gratuit, sans publicité, accessible sur tous supports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Partager vs QR Code) */}
        <div className="grid grid-cols-2 p-1.5 mx-5 mt-4 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'share'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Partager le lien</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qrcode')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Créer un QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Target link selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cible du lien à partager ou encoder
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => { setLinkTarget('current'); setUseCustomUrl(false); }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-left transition cursor-pointer truncate ${
                  linkTarget === 'current' && !useCustomUrl
                    ? 'border-sky-400 bg-sky-950/60 text-sky-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                Page actuelle
              </button>

              {currentStation && (
                <button
                  type="button"
                  onClick={() => { setLinkTarget('station'); setUseCustomUrl(false); }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-left transition cursor-pointer truncate ${
                    linkTarget === 'station' && !useCustomUrl
                      ? 'border-sky-400 bg-sky-950/60 text-sky-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                  title={currentStation.name}
                >
                  📍 {currentStation.name}
                </button>
              )}

              <button
                type="button"
                onClick={() => { setLinkTarget('radar'); setUseCustomUrl(false); }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-left transition cursor-pointer truncate ${
                  linkTarget === 'radar' && !useCustomUrl
                    ? 'border-sky-400 bg-sky-950/60 text-sky-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                Radar HD
              </button>

              <button
                type="button"
                onClick={() => { setLinkTarget('home'); setUseCustomUrl(false); }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-left transition cursor-pointer truncate ${
                  linkTarget === 'home' && !useCustomUrl
                    ? 'border-sky-400 bg-sky-950/60 text-sky-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                Accueil site
              </button>
            </div>
          </div>

          {/* TAB 1: PARTAGER LE LIEN */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              {/* Native Share Button (Mobile & Desktop) */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-900/30 hover:opacity-95 transition active:scale-98 cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
                <span>Ouvrir le menu de partage (SMS, WhatsApp, AirDrop...)</span>
              </button>

              {/* Direct Link Preview & Copy */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold">Lien direct :</span>
                  {copied && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Copié !
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {/* Quick 1-Click Social Sharing Links */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Partager en 1 clic
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {shareLinks.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl ${item.bgColor} text-white font-bold text-xs transition active:scale-95 shadow-sm`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Site Value Props Summary */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3 flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Pourquoi partager Instant Météo ?</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Aucune publicité intrusive, données ouvertes Météo-France &amp; ECMWF gratuites pour tout le monde, radar de pluie en temps réel et prévisions pour 34 965 communes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRÉER UN QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="space-y-4">
              
              {/* Optional custom URL input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold uppercase tracking-wider">Lien encodé dans le QR Code</span>
                  <button
                    type="button"
                    onClick={() => setUseCustomUrl(!useCustomUrl)}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    {useCustomUrl ? 'Revenir au lien par défaut' : 'Personnaliser l\'URL'}
                  </button>
                </div>

                {useCustomUrl ? (
                  <input
                    type="text"
                    placeholder="https://..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-slate-950 border border-sky-500/50 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-xs text-slate-300 font-mono bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 truncate">
                    {targetUrl}
                  </div>
                )}
              </div>

              {/* QR Code Presentation Plate */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div 
                  ref={qrCanvasContainerRef}
                  className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                >
                  <QRCodeCanvas
                    value={targetUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                    fgColor="#0a1128"
                    bgColor="#ffffff"
                  />
                </div>

                <div className="mt-3 text-center">
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <span>📱</span>
                    <span>Scannez avec votre appareil photo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ouvre l'application directement dans le navigateur sans rien installer.
                  </p>
                </div>
              </div>

              {/* Action Buttons for QR Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadQrCode}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition active:scale-95 shadow-md cursor-pointer"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Téléchargé avec succès !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Télécharger le QR Code (PNG)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintQrCode}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition active:scale-95 border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer l'affiche</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                💡 Idéal pour afficher dans un commerce, gîte, club de randonnée, station de ski ou flyer.
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-5 py-3 bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Instant Météo • Open Data Météo-France</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
