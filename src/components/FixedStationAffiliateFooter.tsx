import React from 'react';
import { Gauge, ExternalLink, Sparkles } from 'lucide-react';
import { AMAZON_AFFILIATE_LINKS } from '../config/affiliateLinks';

interface FixedStationAffiliateFooterProps {
  affiliateUrl?: string;
  seniorMode?: boolean;
}

export const FixedStationAffiliateFooter: React.FC<FixedStationAffiliateFooterProps> = ({
  affiliateUrl = AMAZON_AFFILIATE_LINKS.QXMCOV_WEATHER_STATION,
  seniorMode = false
}) => {
  return (
    <div id="amazon-affiliate-footer-section" className="w-full space-y-4 pt-4 pb-2">
      {/* Visual affiliate card */}
      <div className="mx-auto max-w-4xl px-3 sm:px-6">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group block relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-slate-900/90 via-blue-950/70 to-slate-900/90 p-4 sm:p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-0.5"
          title="Découvrir la Station Météo Sans Fil sur Amazon"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 group-hover:scale-105 group-hover:bg-blue-500/30 transition shadow-inner">
                <Gauge className="h-6 w-6 text-blue-300 group-hover:text-white transition" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Recommandation Équipement Météo</span>
                </div>
                <p className={`mt-0.5 font-bold text-slate-100 group-hover:text-white leading-relaxed ${seniorMode ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                  📊 Suivez le temps directement chez vous avec cette Station Météo Intérieur/Extérieur Sans Fil à écran couleur sur Amazon.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-transform group-hover:scale-105">
                <span>Voir sur Amazon</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Mandatory Amazon Affiliate Disclosure */}
      <div className="text-center px-4">
        <p className="text-[11px] font-medium text-slate-400/80 leading-relaxed max-w-2xl mx-auto">
          En tant que Partenaire Amazon, ce site réalise un bénéfice sur les achats remplissant les conditions requises.
        </p>
      </div>
    </div>
  );
};
