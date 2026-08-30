import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Scale,
  Database,
  Lock,
  Eye,
  AlertTriangle,
  Mail,
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Server,
  Globe
} from 'lucide-react';

interface LegalAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'cgu' | 'mentions' | 'sources' | 'rgpd';
}

export const LegalAndPrivacyModal: React.FC<LegalAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'cgu' | 'mentions' | 'sources' | 'rgpd'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-lg font-black text-white">
                Centre de Conformité Légale, RGPD &amp; Confidentialité
              </h2>
              <p className="text-xs text-slate-400">
                Instant Météo • Conforme aux exigences Google Play Store &amp; RGPD Européen
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le centre légal"
            className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Politique de Confidentialité</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rgpd')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'rgpd'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Protection RGPD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cgu')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'cgu'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Conditions Générales (CGU)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'sources'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Attributions &amp; Open Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mentions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'mentions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>Mentions Légales &amp; Éditeur</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* TAB 1: PRIVACY POLICY (Politique de Confidentialité Play Store) */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                  Politique de Confidentialité (Privacy Policy)
                </h3>
                <p className="text-xs text-blue-200 mt-1">
                  Dernière mise à jour : 25 Août 2026 • Application « Instant Météo »
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-blue-400">
                  1. Engagement Général &amp; Respect de la Vie Privée
                </h4>
                <p>
                  L’application <strong>Instant Météo</strong> s'engage formellement à protéger la vie privée de ses utilisateurs. 
                  Nous n’effectuons <strong>aucune vente, aucun profilage publicitaire, ni aucun transfert de données personnelles</strong> à des tiers ou courtiers de données.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-blue-400">
                  2. Données de Géolocalisation (GPS)
                </h4>
                <p>
                  L’accès à la position GPS de l'appareil est <strong>strictement facultatif</strong>. Lorsqu’elle est autorisée par l'utilisateur, 
                  la géolocalisation est utilisée <strong>exclusivement en local</strong> au moment de la demande pour :
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-2">
                  <li>Identifier la station météorologique ou la commune française la plus proche.</li>
                  <li>Afficher les prévisions directes et les bulletins de vigilance correspondants.</li>
                </ul>
                <p className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                  <strong>Non-conservation :</strong> Vos coordonnées géographiques précises (latitude/longitude) ne sont jamais enregistrées sur nos serveurs distants, ne font l’objet d’aucun traçage en arrière-plan et ne sont jamais associées à une quelconque identité nominative.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-blue-400">
                  3. Stockage Local (LocalStorage) &amp; Absence de Cookies Tiers
                </h4>
                <p>
                  Instant Météo fonctionne selon le principe <em>« Privacy-First »</em>. Les données de préférences (ville favorite sélectionnée, thème d'atmosphère, affichage senior ou unité °C/°F) sont 
                  stockées <strong>uniquement sur votre appareil (LocalStorage du navigateur / WebAPK)</strong>. Aucune donnée n’est transmise à des régies publicitaires.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-blue-400">
                  4. Protection des Mineurs (Children's Online Privacy / COPPA)
                </h4>
                <p>
                  L'application Instant Météo est un service grand public d'information météorologique. Elle ne collecte sciemment aucune donnée personnelle auprès d'enfants ou de mineurs de moins de 16 ans.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-blue-400">
                  5. Sécurité des Échanges
                </h4>
                <p>
                  Toutes les communications entre l’application et les serveurs de prévisions météo (Open-Meteo, Copernicus, Météo-France Open Data) s’effectuent via le protocole sécurisé et chiffré <strong>HTTPS (TLS 1.3)</strong>.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-blue-400">
                  6. Contact Délégué à la Protection des Données (DPO)
                </h4>
                <p>
                  Pour toute question relative à cette politique ou pour exercer vos droits, vous pouvez contacter l'administrateur :
                </p>
                <div className="flex items-center gap-2 text-xs text-cyan-300 font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <Mail className="h-4 w-4" />
                  <span>instantmeteofr@gmail.com</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RGPD (Règlement Général sur la Protection des Données) */}
          {activeTab === 'rgpd' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Conformité RGPD (Règlement UE 2016/679)
                </h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Droits des citoyens européens &amp; traitement responsable des données
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong> en vigueur dans l'Union Européenne, 
                  vous disposez des droits fondamentaux suivants concernant vos données :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Droit d'accès (Art. 15 RGPD)
                    </div>
                    <p className="text-xs text-slate-400">
                      Vous avez le droit de savoir quelles données sont traitées (chez Instant Météo, aucune donnée nominative n'est conservée).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Droit à l'effacement (Art. 17 RGPD)
                    </div>
                    <p className="text-xs text-slate-400">
                      Vous pouvez à tout moment effacer vos préférences en vidant les données locales de votre navigateur ou de l'application mobile.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Droit d'opposition &amp; Retrait du consentement
                    </div>
                    <p className="text-xs text-slate-400">
                      Vous pouvez refuser ou révoquer l'autorisation GPS à tout moment dans les réglages de votre système Android / iOS.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Principe de Minimisation (Art. 5 RGPD)
                    </div>
                    <p className="text-xs text-slate-400">
                      Seules les données strictement indispensables au calcul météorologique sont sollicitées.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <strong>Réclamation CNIL :</strong> Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation auprès de l’autorité de contrôle française (CNIL - cnil.fr).
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CGU (Conditions Générales d'Utilisation) */}
          {activeTab === 'cgu' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Conditions Générales d'Utilisation (CGU)
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  Règles d'accès et d'utilisation de l'application Instant Météo
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400">
                  Article 1 : Objet &amp; Nature du Service
                </h4>
                <p>
                  L’application Instant Météo a pour vocation de fournir aux utilisateurs des informations, visualisations cartographiques, 
                  tendances saisonnières et prévisions météorologiques issues de modèles scientifiques publics.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Article 2 : Avertissement Majeur de Sécurité &amp; Vigilance Civile
                </h4>
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs leading-relaxed space-y-2">
                  <p>
                    <strong>IMPORTANT :</strong> Instant Météo est un service d'information météorologique indépendant. En cas d'événement météorologique dangereux (tempête, canicule, inondation, neige-verglas, feux de forêt, orages violents), 
                    <strong>les seules consignes et informations faisant foi pour la sécurité des personnes et des biens sont les bulletins officiels de Météo-France et des services de l'État (Préfectures, Sécurité Civile).</strong>
                  </p>
                  <p>
                    L’éditeur ne saurait être tenu responsable des décisions prises par les usagers (déplacements, activités nautiques, travaux agricoles, manifestations) sur la seule base des prévisions automatiques.
                  </p>
                </div>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400">
                  Article 3 : Disponibilité du Service
                </h4>
                <p>
                  Le service est accessible gratuitement 24h/24 et 7j/7. L'éditeur met en œuvre tous les moyens raisonnables pour assurer la disponibilité du service, mais ne garantit pas l'absence d'interruptions techniques ponctuelles liées aux réseaux ou aux fournisseurs d'API.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400">
                  Article 4 : Propriété Intellectuelle
                </h4>
                <p>
                  Les interfaces graphiques, logos, codes sources et algorithmes propres à Instant Météo sont protégés par le droit de la propriété intellectuelle. Les données météorologiques brutes demeurent soumises aux licences de leurs producteurs respectifs (Open Data).
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ATTRIBUTIONS & OPEN DATA */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  Sources Météorologiques &amp; Licences Open Data
                </h3>
                <p className="text-xs text-cyan-200 mt-1">
                  Attribution légale des données publiques selon les licences réutilisateurs
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-sm">Météo-France</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 border border-blue-700/50 text-blue-300">
                      Licence Ouverte v2.0 (Etalab)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Données publiques de vigilance départementale, modèles AROME haute résolution, ARPEGE et archives climatologiques nationales.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-sm">Copernicus ECMWF</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-300">
                      Creative Commons CC-BY 4.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Modèle global européen Integrated Forecasting System (IFS), réanalyses ERA5 et tendances saisonnières multi-mois.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-sm">Open-Meteo API</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-300">
                      Licence CC-BY 4.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Moteur de calcul de prévisions horaires, géocodage des 35 000 communes et interpolation multi-modèles (open-meteo.com).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-sm">Deutscher Wetterdienst (DWD) &amp; NOAA</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                      Open Data &amp; Domaine Public
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Modèles numériques ICON (DWD) et Global Forecast System GFS (NOAA/NCEP).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-sm">Cartographie OpenStreetMap &amp; Carto</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/50 text-amber-300">
                      ODbL / CC-BY 3.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Fonds de carte et tuiles géographiques © Contributeurs OpenStreetMap.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MENTIONS LÉGALES & ÉDITEUR */}
          {activeTab === 'mentions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-300" />
                  Mentions Légales &amp; Informations Éditeur
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Conformément à la Loi n°2004-575 pour la Confiance dans l'Économie Numérique (LCEN)
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                    Éditeur de l'application
                  </div>
                  <div className="text-sm font-bold text-white">Instant Météo France</div>
                  <div className="text-xs text-slate-300">
                    Contact et développement : <strong>instantmeteofr@gmail.com</strong>
                  </div>
                  <div className="text-xs text-slate-400">
                    Publication &amp; Conception technique : Augustin Peytavin
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-indigo-400">
                    Hébergement &amp; Infrastructure
                  </div>
                  <div className="text-sm font-bold text-white">Google Cloud Platform (GCP) / Cloud Run</div>
                  <div className="text-xs text-slate-300">
                    Région d'hébergement : <strong>Union Européenne (europe-west2 / europe-west1)</strong>
                  </div>
                  <div className="text-xs text-slate-400">
                    Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Application conforme aux exigences du Google Play Store &amp; RGPD 2026</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
