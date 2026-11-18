import React, { useState } from 'react';

interface WorldDisastersViewProps {
  seniorMode?: boolean;
  simplifiedMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export type DisasterCategory =
  | 'all'
  | 'recent_24h'
  | 'fire'
  | 'tsunami'
  | 'cyclone'
  | 'cold_snow'
  | 'tornado'
  | 'heat'
  | 'flood';

export interface VerifiedDisasterEvent {
  id: string;
  type: 'cold_snow' | 'fire' | 'ice' | 'tornado' | 'cyclone' | 'heat' | 'flood' | 'tsunami';
  title: string;
  region: string;
  severity: 'Critique' | 'Extrême' | 'Majeur' | 'Élevé';
  badgeColor: string;
  metric: string;
  desc: string;
  updated: string;
  timestampUtc: string;
  verifiedWithin24h: boolean;
  categoryLabel: string;
  officialMeteoCentres: string[];
  verifiedMedia: string[];
  dataVerification: string;
  sourceUrl: string;
}

export const WorldDisastersView: React.FC<WorldDisastersViewProps> = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#070b13] m-0 p-0 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070b13] text-slate-300 pointer-events-none">
          <div className="h-9 w-9 rounded-full border-3 border-rose-500 border-t-transparent animate-spin mb-3" />
          <span className="text-xs font-semibold tracking-wide text-slate-400">
            Chargement de l&apos;Atlas des catastrophes…
          </span>
        </div>
      )}

      <iframe
        src="/assets/aistudio/carte-catastrophes_6__98caa0f3.html"
        title="Atlas des catastrophes"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{ width: '100%', height: '100%', border: 0 }}
        className="block bg-[#070b13]"
        allow="geolocation; fullscreen"
      />
    </div>
  );
};
