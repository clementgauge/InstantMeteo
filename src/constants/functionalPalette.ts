/**
 * PALETTE FONCTIONNELLE STRICTE D'INSTANT MÉTÉO
 * 
 * Règle d'or ergonomique : 1 Couleur = 1 Signification univoque
 * - ROUGE / ROSE   : DANGER, ALERTE, VIGILANCE CRITIQUE (Orange/Rouge), RISQUE EXTRÊME
 * - BLEU / SKY     : INFORMATION MÉTÉOROLOGIQUE, ÉLÉMENT ACTIF / SÉLECTIONNÉ, DONNÉES SYNOPTIQUES
 * - VERT / EMERALD : STATUT POSITIF, FLUX EN DIRECT CONFORME, STATION EN LIGNE, GPS ACQUIS, VIGILANCE VERTE
 * - AMBRE / JAUNE  : AVERTISSEMENT MODÉRÉ, VIGILANCE JAUNE, RISQUE MOYEN, RAYONNEMENT SOLAIRE
 * - ARDOISE / GRIS : STRUCTURES NEUTRES, BORDURES, TEXTES SECONDAIRES, BOUTONS D'ACTION SECONDAIRES
 */

export const FUNCTIONAL_PALETTE = {
  // Danger / Alerte / Vigilance
  danger: {
    text: 'text-red-400',
    bg: 'bg-red-600',
    bgSubtle: 'bg-red-950/40',
    border: 'border-red-500/40',
    borderStrong: 'border-red-500',
    ring: 'ring-red-500/50',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    label: 'Danger / Vigilance Alerte'
  },
  
  // Information / Élément Actif
  infoActive: {
    text: 'text-sky-400',
    textActive: 'text-white',
    bg: 'bg-blue-600',
    bgSubtle: 'bg-blue-950/40',
    border: 'border-blue-500/40',
    borderStrong: 'border-blue-500',
    ring: 'ring-blue-500/50',
    label: 'Information / Actif'
  },

  // Statut Positif / En direct / Conforme
  positiveStatus: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-600',
    bgSubtle: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    borderStrong: 'border-emerald-500',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
    label: 'Statut Positif / En direct'
  },

  // Avertissement modéré / Vigilance Jaune
  warning: {
    text: 'text-amber-400',
    bg: 'bg-amber-600',
    bgSubtle: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    borderStrong: 'border-amber-500',
    label: 'Avertissement modéré'
  },

  // Neutre / Boutons secondaires discrets
  neutralSecondary: {
    text: 'text-slate-300',
    textMuted: 'text-slate-400',
    bg: 'bg-black/35 hover:bg-black/55',
    border: 'border-white/15 hover:border-white/25',
    pill: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/35 hover:bg-black/55 border border-white/15 text-[11px] font-medium text-slate-300 hover:text-white transition active:scale-95 cursor-pointer backdrop-blur-sm'
  }
} as const;
