import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Layers, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { 
  ALL_PAGE_DEFINITIONS, 
  getDisplayPreferences, 
  saveDisplayPreferences, 
  getDefaultDisplayPreferences,
  DisplayPreferences 
} from '../services/displayPreferencesService';

interface PageBlockCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChanged?: (prefs: DisplayPreferences) => void;
}

export const PageBlockCustomizerModal: React.FC<PageBlockCustomizerModalProps> = ({
  isOpen,
  onClose,
  onPreferencesChanged
}) => {
  const [preferences, setPreferences] = useState<DisplayPreferences>(getDefaultDisplayPreferences());
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({ realtime: true });
  const [activeSubTab, setActiveSubTab] = useState<'pages' | 'blocks'>('pages');

  useEffect(() => {
    if (isOpen) {
      setPreferences(getDisplayPreferences());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePageVisibility = (pageId: string) => {
    const currentVal = preferences.visiblePages[pageId] !== false;
    const nextVal = !currentVal;

    // Ne pas autoriser à tout masquer
    const activeCount = Object.values(preferences.visiblePages).filter(Boolean).length;
    if (currentVal && activeCount <= 1) return;

    const updated: DisplayPreferences = {
      ...preferences,
      visiblePages: {
        ...preferences.visiblePages,
        [pageId]: nextVal
      }
    };
    setPreferences(updated);
    saveDisplayPreferences(updated);
    if (onPreferencesChanged) onPreferencesChanged(updated);
  };

  const toggleBlockVisibility = (pageId: string, blockId: string) => {
    const key = `${pageId}:${blockId}`;
    const currentVal = preferences.visibleBlocks[key] !== false;
    const nextVal = !currentVal;

    const updated: DisplayPreferences = {
      ...preferences,
      visibleBlocks: {
        ...preferences.visibleBlocks,
        [key]: nextVal
      }
    };
    setPreferences(updated);
    saveDisplayPreferences(updated);
    if (onPreferencesChanged) onPreferencesChanged(updated);
  };

  const toggleExpand = (pageId: string) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const handleReset = () => {
    const defaults = getDefaultDisplayPreferences();
    setPreferences(defaults);
    saveDisplayPreferences(defaults);
    if (onPreferencesChanged) onPreferencesChanged(defaults);
  };

  const handleShowAll = () => {
    const updated: DisplayPreferences = { visiblePages: {}, visibleBlocks: {} };
    ALL_PAGE_DEFINITIONS.forEach(p => {
      updated.visiblePages[p.id] = true;
      p.blocks.forEach(b => {
        updated.visibleBlocks[`${p.id}:${b.id}`] = true;
      });
    });
    setPreferences(updated);
    saveDisplayPreferences(updated);
    if (onPreferencesChanged) onPreferencesChanged(updated);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-customizer-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900/98 p-5 sm:p-6 shadow-2xl text-slate-100 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900/98 z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h2 id="page-customizer-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Choix des Pages &amp; des Blocs
              </h2>
              <p className="text-xs text-slate-400">
                Personnalisez précisément les modules et sections affichés selon vos besoins
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveSubTab('pages')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'pages'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Visibilité des Pages ({ALL_PAGE_DEFINITIONS.filter(p => preferences.visiblePages[p.id] !== false).length}/13)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('blocks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'blocks'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Détail des Blocs par Page
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShowAll}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Tout afficher
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* SUBTAB 1: PAGES VISIBILITY LIST */}
        {activeSubTab === 'pages' && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-400 px-1">
              Activez ou désactivez les pages que vous souhaitez voir dans la barre de navigation et dans les menus :
            </p>

            <div className="space-y-2 mt-2">
              {ALL_PAGE_DEFINITIONS.map((page) => {
                const isVisible = preferences.visiblePages[page.id] !== false;
                return (
                  <div
                    key={page.id}
                    className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isVisible
                        ? 'bg-slate-950/70 border-slate-800 text-white'
                        : 'bg-slate-950/30 border-slate-800/40 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs sm:text-sm text-white">
                          {page.label}
                        </span>
                        {!isVisible && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 uppercase font-bold">
                            Masquée
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {page.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePageVisibility(page.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                        isVisible
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isVisible ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Masquée</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 2: BLOCKS BY PAGE */}
        {activeSubTab === 'blocks' && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-400 px-1">
              Personnalisez les sections et blocs à l'intérieur de chaque page :
            </p>

            <div className="space-y-3">
              {ALL_PAGE_DEFINITIONS.map((page) => {
                const isExpanded = !!expandedPages[page.id];
                const isPageActive = preferences.visiblePages[page.id] !== false;

                return (
                  <div 
                    key={page.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden"
                  >
                    {/* Header bar of page */}
                    <div 
                      onClick={() => toggleExpand(page.id)}
                      className="p-3 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{page.label}</span>
                        <span className="text-[10px] text-slate-400">
                          ({page.blocks.filter(b => preferences.visibleBlocks[`${page.id}:${b.id}`] !== false).length}/{page.blocks.length} blocs actifs)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Blocks list */}
                    {isExpanded && (
                      <div className="p-3 space-y-2 border-t border-slate-800 bg-slate-950/40">
                        {page.blocks.map((block) => {
                          const blockKey = `${page.id}:${block.id}`;
                          const isBlockActive = preferences.visibleBlocks[blockKey] !== false;

                          return (
                            <div
                              key={block.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                                isBlockActive
                                  ? 'bg-slate-900 border-slate-800 text-white'
                                  : 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-200">
                                  {block.label}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                  {block.description}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleBlockVisibility(page.id, block.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                                  isBlockActive
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                }`}
                              >
                                {isBlockActive ? 'Affiché' : 'Masqué'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Préférences enregistrées automatiquement
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition cursor-pointer"
          >
            Fermer &amp; Appliquer
          </button>
        </div>

      </div>
    </div>
  );
};
