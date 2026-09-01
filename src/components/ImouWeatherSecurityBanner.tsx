import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Eye, 
  ExternalLink, 
  BatteryCharging, 
  CloudRain, 
  Sparkles, 
  CheckCircle2, 
  X,
  Radio,
  Wifi,
  Video
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';

interface ImouWeatherSecurityBannerProps {
  weather?: CurrentWeather | null;
  station?: LocationPoint;
  seniorMode?: boolean;
}

export const ImouWeatherSecurityBanner: React.FC<ImouWeatherSecurityBannerProps> = ({
  weather,
  station,
  seniorMode = false
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const affiliateUrl = "https://www.awin1.com/cread.php?awinmid=122426&awinaffid=3065659&campaign=Akureum&ued=https%3A%2F%2Fstore.imou.com%2Fproducts%2Faov-pt%3Fvariant%3D49871879373112";

  // Conditions are favorable when it's good weather, sunny, mild, or outdoor activity is high
  const isSunnyOrClear = !weather || (weather.precipitation === 0 && weather.temperature >= 12);
  const conditionBadge = isSunnyOrClear ? "Ensoleillé & Propice à l'énergie solaire" : "Protection toutes intempéries certifiée IP66";

  return (
    <div 
      id="imou-security-affiliate-banner"
      className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 p-5 sm:p-6 shadow-2xl backdrop-blur-xl transition group my-4"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        title="Fermer cette recommandation météo"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        {/* Left Side: Product Details & Weather Relevance */}
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Sélection Météo &amp; Sécurité Extérieure
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <Sun className="h-3 w-3 text-emerald-400" />
              {conditionBadge}
            </span>
          </div>

          <div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-xl' : 'text-lg sm:text-xl'} flex items-center gap-2`}>
              <span>Caméra de Surveillance Extérieure 4G &amp; Solaire IMOU AOV PT</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black">360° PTZ</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Autonomie totale grâce à son panneau solaire et batterie intégrée. Idéale pour surveiller votre jardin, résidence secondaire ou terrain même sans Wi-Fi ni prise électrique ({station ? `secteur ${station.name}` : 'extérieur'}). Résistance certifiée pluie, vent, gel et canicule (IP66).
            </p>
          </div>

          {/* Key specs pills */}
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold text-slate-200">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80">
              <BatteryCharging className="h-3.5 w-3.5 text-amber-400" />
              100% Sans Fil &amp; Panneau Solaire
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80">
              <Radio className="h-3.5 w-3.5 text-cyan-400" />
              Connexion 4G LTE &amp; Wi-Fi
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80">
              <Eye className="h-3.5 w-3.5 text-emerald-400" />
              Vision Nocturne Couleur 2K 360°
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80">
              <CloudRain className="h-3.5 w-3.5 text-blue-400" />
              Étanchéité IP66 Toutes Saisons
            </span>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition transform active:scale-95 cursor-pointer border border-amber-300"
          >
            <Video className="h-4 w-4" />
            <span>Découvrir l'Offre IMOU AOV PT</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <div className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
            Lien partenaire vérifié • Garantie constructeur
          </div>
        </div>
      </div>
    </div>
  );
};
