import React, { useEffect, useState } from 'react';
import { Mountain, Waves, Flame, Droplets, MapPin } from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import { MountainWeatherView } from './MountainWeatherView';
import { BeachWeatherView } from './BeachWeatherView';
import { DroughtAndFireView } from './DroughtAndFireView';
import { WatercoursesView } from './WatercoursesView';
import { isBlockVisible } from '../services/displayPreferencesService';

export type TerritorySectionId = 'mountain' | 'beaches' | 'droughtFire' | 'watercourses';

interface TerritoriesAndNatureHubViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
  activeSection?: TerritorySectionId;
  onSectionChange?: (section: TerritorySectionId) => void;
}

interface TerritorySectionTab {
  id: TerritorySectionId;
  blockId: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  activeDarkClass: string;
  activeLightClass: string;
  iconDarkClass: string;
  iconLightClass: string;
}

const TERRITORY_SECTIONS: TerritorySectionTab[] = [
  {
    id: 'mountain',
    blockId: 'mountain_snow',
    label: 'Montagne & Neige',
    subtitle: 'BERA, altitude & nivologie',
    icon: Mountain,
    activeDarkClass: 'bg-sky-600 text-white border-sky-400/70 shadow-lg shadow-sky-900/40',
    activeLightClass: 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20',
    iconDarkClass: 'text-sky-400',
    iconLightClass: 'text-sky-600',
  },
  {
    id: 'beaches',
    blockId: 'beach_sea',
    label: 'Plage & Mer',
    subtitle: 'Marées SHOM, houle & eau',
    icon: Waves,
    activeDarkClass: 'bg-teal-600 text-white border-teal-400/70 shadow-lg shadow-teal-900/40',
    activeLightClass: 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20',
    iconDarkClass: 'text-teal-400',
    iconLightClass: 'text-teal-600',
  },
  {
    id: 'droughtFire',
    blockId: 'drought_fire',
    label: 'Sécheresse & Feux',
    subtitle: 'Forêts IFM & VigiEau',
    icon: Flame,
    activeDarkClass: 'bg-orange-600 text-white border-orange-400/70 shadow-lg shadow-orange-900/40',
    activeLightClass: 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20',
    iconDarkClass: 'text-orange-400',
    iconLightClass: 'text-orange-600',
  },
  {
    id: 'watercourses',
    blockId: 'watercourses',
    label: "Cours d'eau",
    subtitle: 'Vigicrues, débits & crues',
    icon: Droplets,
    activeDarkClass: 'bg-indigo-600 text-white border-indigo-400/70 shadow-lg shadow-indigo-900/40',
    activeLightClass: 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20',
    iconDarkClass: 'text-indigo-400',
    iconLightClass: 'text-indigo-600',
  },
];

export const TerritoriesAndNatureHubView: React.FC<TerritoriesAndNatureHubViewProps> = ({
  station,
  weather,
  isLightMode = false,
  activeSection = 'mountain',
  onSectionChange,
}) => {
  const [selectedSection, setSelectedSection] = useState<TerritorySectionId>(activeSection);
  const [, setPrefsTick] = useState(0);

  useEffect(() => {
    setSelectedSection(activeSection);
  }, [activeSection]);

  useEffect(() => {
    const onPrefsChanged = () => setPrefsTick((t) => t + 1);
    window.addEventListener('instant_meteo_display_preferences_updated', onPrefsChanged);
    return () => window.removeEventListener('instant_meteo_display_preferences_updated', onPrefsChanged);
  }, []);

  const visibleSections = TERRITORY_SECTIONS.filter((sec) =>
    isBlockVisible('natureTerritories', sec.blockId)
  );
  const availableSections = visibleSections.length > 0 ? visibleSections : TERRITORY_SECTIONS;

  const effectiveSection = availableSections.some((s) => s.id === selectedSection)
    ? selectedSection
    : availableSections[0].id;

  const handleSelectSection = (sectionId: TerritorySectionId) => {
    setSelectedSection(sectionId);
    onSectionChange?.(sectionId);
  };

  return (
    <div className="space-y-5">
      {/* En-tête unifié + sélecteur des 4 espaces regroupés */}
      <section
        aria-label="Sélection de l'espace naturel à consulter"
        className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-900/85 border-slate-800 text-slate-100 shadow-lg backdrop-blur-md'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="min-w-0">
            <h2
              className={`text-lg sm:text-xl font-black tracking-tight leading-snug ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              Montagne, Neige, Plage, Mer, Sécheresse &amp; Feux, Cours d&apos;eau
            </h2>
            <p
              className={`mt-1 text-xs sm:text-sm ${
                isLightMode ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Choisissez la vue souhaitée ci-dessous pour consulter les relevés dédiés en direct.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
              isLightMode ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            <MapPin className={`h-4 w-4 shrink-0 ${isLightMode ? 'text-blue-600' : 'text-sky-400'}`} />
            <span>
              {station.name}
              {station.department ? ` · ${station.department}` : ''}
            </span>
          </div>
        </div>

        {/* Sélecteur interactif des 4 sous-pages */}
        <div
          role="tablist"
          aria-label="Choix du module Montagne, Plage, Sécheresse ou Cours d'eau"
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5"
        >
          {availableSections.map((section) => {
            const Icon = section.icon;
            const isActive = effectiveSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`territory-tab-${section.id}`}
                aria-selected={isActive}
                onClick={() => handleSelectSection(section.id)}
                className={`min-h-[54px] flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer active:scale-[0.99] ${
                  isActive
                    ? isLightMode
                      ? section.activeLightClass
                      : section.activeDarkClass
                    : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isLightMode
                        ? 'bg-white border border-slate-200 shadow-xs'
                        : 'bg-slate-900 border border-slate-800'
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      isActive
                        ? 'text-white'
                        : isLightMode
                          ? section.iconLightClass
                          : section.iconDarkClass
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-extrabold leading-tight ${
                      isActive
                        ? 'text-white'
                        : isLightMode
                          ? 'text-slate-900'
                          : 'text-slate-100'
                    }`}
                  >
                    {section.label}
                  </div>
                  <div
                    className={`text-[11px] leading-tight mt-0.5 truncate ${
                      isActive
                        ? 'text-white/90'
                        : isLightMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                    }`}
                  >
                    {section.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Contenu du module sélectionné */}
      <div role="tabpanel" aria-labelledby={`territory-tab-${effectiveSection}`}>
        {effectiveSection === 'mountain' && (
          <MountainWeatherView
            station={station}
            weather={weather}
            isLightMode={isLightMode}
          />
        )}
        {effectiveSection === 'beaches' && (
          <BeachWeatherView
            station={station}
            weather={weather}
            isLightMode={isLightMode}
          />
        )}
        {effectiveSection === 'droughtFire' && (
          <DroughtAndFireView
            station={station}
            weather={weather}
            isLightMode={isLightMode}
          />
        )}
        {effectiveSection === 'watercourses' && (
          <WatercoursesView
            station={station}
            weather={weather}
            isLightMode={isLightMode}
          />
        )}
      </div>
    </div>
  );
};
