import React from 'react';
import { Gauge, ExternalLink, Sparkles, ShoppingBag, Layers } from 'lucide-react';
import { AMAZON_AFFILIATE_LINKS } from '../config/affiliateLinks';

interface AffiliateStoreFooterProps {
  seniorMode?: boolean;
}

export const AffiliateStoreFooter: React.FC<AffiliateStoreFooterProps> = ({
  seniorMode = false
}) => {
  return (
    <div id="amazon-affiliate-store-footer" className="w-full space-y-5 pt-4 pb-2">
      {/* Two-Column Modern Product Showcase */}
      <div className="mx-auto max-w-5xl px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Column 1: Weather Equipment */}
          <a
            id="affiliate-card-station-meteo"
            href={AMAZON_AFFILIATE_LINKS.QXMCOV_WEATHER_STATION}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900/95 via-blue-950/70 to-slate-900/95 p-4 sm:p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-blue-400/70 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
            title="Découvrir la Station Météo Sans Fil sur Amazon"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/25 transition-all pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-400/30 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-300">
                  <Sparkles className="h-3 w-3" />
                  <span>Colonne Équipement Météo</span>
                </div>
                <span className="text-[11px] font-bold text-blue-400/80 group-hover:text-blue-300 transition">
                  Amazon.fr
                </span>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 group-hover:scale-110 group-hover:bg-blue-500/30 group-hover:text-white transition shadow-inner">
                  <Gauge className="h-6 w-6" />
                </div>

                <div>
                  <p className={`font-bold text-slate-100 group-hover:text-white leading-snug ${seniorMode ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                    📊 Suivez le climat chez vous : Découvrez la Station Météo Intérieur/Extérieur Sans Fil à écran couleur.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    Température, hygrométrie et capteurs sans fil longue portée.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 group-hover:text-slate-300 font-medium">
                Voir les caractéristiques
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-transform group-hover:scale-105">
                <span>Voir l'offre</span>
                <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </a>

          {/* Column 2: Daily Comfort */}
          <a
            id="affiliate-card-dim-socks"
            href={AMAZON_AFFILIATE_LINKS.DIM_SOCKS_PACK}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/95 via-indigo-950/70 to-slate-900/95 p-4 sm:p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-400/70 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1"
            title="Profiter du lot de 5 chaussettes DIM sur Amazon"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/25 transition-all pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-400/30 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-indigo-300">
                  <ShoppingBag className="h-3 w-3" />
                  <span>Colonne Confort Quotidien</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-400/80 group-hover:text-indigo-300 transition">
                  Amazon.fr
                </span>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500/30 group-hover:text-white transition shadow-inner">
                  <Layers className="h-6 w-6" />
                </div>

                <div>
                  <p className={`font-bold text-slate-100 group-hover:text-white leading-snug ${seniorMode ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                    🧦 Confort au quotidien : Profitez de ce lot économique de 5 chaussettes DIM à talons renforcés.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    Coton respirant, pointes et talons renforcés pour un confort durable.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 group-hover:text-slate-300 font-medium">
                Lot de 5 paires économiques
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-transform group-hover:scale-105">
                <span>Voir sur Amazon</span>
                <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </a>

        </div>
      </div>

      {/* Mandatory Amazon Affiliate Disclosure */}
      <div className="text-center px-4">
        <p className="text-[11px] font-medium text-slate-400/80 leading-relaxed max-w-3xl mx-auto">
          En tant que Partenaire Amazon, ce site réalise un bénéfice sur les achats remplissant les conditions requises.
        </p>
      </div>
    </div>
  );
};
