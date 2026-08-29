import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  Search, 
  Layers, 
  Settings, 
  ListTree, 
  HelpCircle,
  Award,
  Compass,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Sun
} from 'lucide-react';

interface InteractiveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabId: string) => void;
  onOpenSettingsSidebar?: () => void;
  onCloseSettingsSidebar?: () => void;
  onOpenSearchModal?: () => void;
}

interface TutorialScriptStep {
  stepNumber: number;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  speechBubble: string;
  detailedText: string;
  targetElementId?: string;
  actionHint?: string;
}

const SCRIPT_STEPS: TutorialScriptStep[] = [
  {
    stepNumber: 1,
    title: 'Le Sommaire & la Navigation dans la Page',
    badge: 'Étape 1 / 4 • Navigation des Titres',
    icon: ListTree,
    accentColor: 'from-blue-500 to-indigo-500',
    speechBubble: 'Voici le Sommaire ! Il vous permet de naviguer instantanément à travers les grands titres et sections de la page.',
    detailedText: 'En cliquant sur le bouton Sommaire (sur le côté de votre écran), vous ouvrez le panneau qui recense tous les grands titres de la page actuelle pour y accéder immédiatement en un seul clic sans avoir à faire défiler tout l’écran.',
    targetElementId: 'page-sidebar-rail',
    actionHint: '💡 Le sommaire liste tous les blocs de données météo de la page en cours.'
  },
  {
    stepNumber: 2,
    title: 'La Barre du Bas & Toutes les Pages du Site',
    badge: 'Étape 2 / 4 • Centre de Pages & Dock',
    icon: Layers,
    accentColor: 'from-amber-500 to-orange-500',
    speechBubble: 'C’est ici que se trouvent toutes les pages du site ! Pour voir toutes les pages d’un seul coup, cliquez sur le bouton « 20 pages » (Centre de Pages).',
    detailedText: 'La barre de navigation située tout en bas de votre écran vous donne accès à l’ensemble des fonctionnalités météo (Direct, Nuages, Vigilances, 14 Jours, Radar, 8 Mois, Trajets, Monde, Archives...). Cliquez sur l’icône « Pages » ou « 20 pages » pour déployer la mosaïque complète de toutes les rubriques.',
    targetElementId: 'bottom-navigation-dock',
    actionHint: '💡 Vous pouvez également glisser votre doigt vers la gauche ou la droite sur mobile pour changer d’onglet.'
  },
  {
    stepNumber: 3,
    title: 'La Recherche de Lieu (Haut de Page)',
    badge: 'Étape 3 / 4 • Recherche & Communes',
    icon: Search,
    accentColor: 'from-emerald-500 to-teal-500',
    speechBubble: 'La barre de recherche en haut vous permet de chercher instantanément le lieu de votre choix parmi 35 000 communes de France et dans le monde !',
    detailedText: 'Entrez un nom de ville, de village, de département, un sommet de montagne ou une grande capitale internationale pour charger immédiatement toutes ses prévisions au dixième de degré près.',
    targetElementId: 'open-locality-search-btn',
    actionHint: '💡 Vous pouvez également cliquer sur « Ma Position GPS » pour géolocaliser automatiquement votre commune.'
  },
  {
    stepNumber: 4,
    title: 'Les Paramètres & la Sidebar Droite (Écrou)',
    badge: 'Étape 4 / 4 • Préférences & Options',
    icon: Settings,
    accentColor: 'from-purple-500 to-pink-500',
    speechBubble: 'Cliquez sur le bouton écrou des paramètres : la sidebar droite apparaît pour configurer toutes vos préférences !',
    detailedText: 'Ce panneau vous permet de basculer entre Celsius (°C) et Fahrenheit (°F), d’activer le Mode Senior à très haute lisibilité, d’ajuster l’intervalle de rafraîchissement automatique et de configurer vos alertes météo.',
    targetElementId: 'open-settings-sidebar-button',
    actionHint: '💡 L’icône écrou ⚙️ en haut à droite reste accessible à tout moment pour modifier vos réglages.'
  }
];

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenSettingsSidebar,
  onCloseSettingsSidebar,
  onOpenSearchModal
}) => {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setIsCompleted(false);
      if (onCloseSettingsSidebar) {
        onCloseSettingsSidebar();
      }
    }
  }, [isOpen, onCloseSettingsSidebar]);

  if (!isOpen) return null;

  const currentStep = SCRIPT_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === SCRIPT_STEPS.length - 1;
  const StepIcon = currentStep ? currentStep.icon : Check;

  const handleNext = () => {
    if (stepIndex < SCRIPT_STEPS.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);

      // Trigger interactive UI changes matching the user's scenario
      if (nextIdx === 3 && onOpenSettingsSidebar) {
        onOpenSettingsSidebar();
      } else if (onCloseSettingsSidebar) {
        onCloseSettingsSidebar();
      }
    } else {
      // Finish tutorial
      if (onCloseSettingsSidebar) {
        onCloseSettingsSidebar();
      }
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      setStepIndex(prevIdx);
      if (prevIdx === 3 && onOpenSettingsSidebar) {
        onOpenSettingsSidebar();
      } else if (onCloseSettingsSidebar) {
        onCloseSettingsSidebar();
      }
    }
  };

  const handleFinish = () => {
    if (onCloseSettingsSidebar) {
      onCloseSettingsSidebar();
    }
    onClose();
  };

  return (
    <div 
      id="interactive-tutorial-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tuto-title"
    >
      {/* Celebration Completed Screen */}
      {isCompleted ? (
        <div className="relative w-full max-w-lg rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-scaleUp">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Tutoriel Terminé avec Succès
            </span>
            <h3 id="tuto-title" className="text-2xl font-black text-white">
              Vous êtes prêt à explorer Instant Météo !
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Toutes les rubriques, le sommaire, la barre de recherche et les paramètres sont maintenant à votre disposition.
            </p>
          </div>

          <button
            id="tuto-final-close-btn"
            onClick={handleFinish}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
          >
            <span>C’est parti, commencer à naviguer</span>
            <ChevronRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      ) : (
        /* Active Interactive Step Card */
        <div className="relative w-full max-w-xl rounded-3xl border border-amber-500/30 bg-slate-900/98 p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            title="Fermer le tutoriel"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header Step Info */}
          <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
            <div className={`rounded-2xl bg-gradient-to-br ${currentStep.accentColor} p-3 text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0`}>
              <StepIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{currentStep.badge}</span>
              </div>
              <h3 id="tuto-title" className="text-lg sm:text-xl font-black text-white mt-0.5">
                {currentStep.title}
              </h3>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {SCRIPT_STEPS.map((step, idx) => (
                <button
                  key={step.stepNumber}
                  onClick={() => {
                    setStepIndex(idx);
                    if (idx === 3 && onOpenSettingsSidebar) {
                      onOpenSettingsSidebar();
                    } else if (onCloseSettingsSidebar) {
                      onCloseSettingsSidebar();
                    }
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === stepIndex
                      ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/40'
                      : idx < stepIndex
                      ? 'w-2.5 bg-emerald-400'
                      : 'w-2.5 bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={`Étape ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400">
              Étape {stepIndex + 1} / {SCRIPT_STEPS.length}
            </span>
          </div>

          {/* Core Speech / Scenario Bubble */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-4 space-y-2">
            <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Guide d'utilisation :</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
              « {currentStep.speechBubble} »
            </p>
          </div>

          {/* Detailed explanation & tips */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>{currentStep.detailedText}</p>
            {currentStep.actionHint && (
              <div className="pt-2 border-t border-slate-800/80 text-xs font-medium text-amber-300/90">
                {currentStep.actionHint}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleFinish}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Passer le tuto
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Précédent</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
              >
                <span>{isLast ? 'Terminer le Tuto' : 'Suivant'}</span>
                {isLast ? <Check className="h-4 w-4 stroke-[3]" /> : <ChevronRight className="h-4 w-4 stroke-[3]" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
