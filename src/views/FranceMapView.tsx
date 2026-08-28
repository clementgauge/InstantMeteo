import React from 'react';
import { LocationPoint } from '../types/weather';
import { FranceMapInteractive } from '../components/FranceMapInteractive';

interface FranceMapViewProps {
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  seniorMode: boolean;
  onOpenSearchModal?: () => void;
}

export const FranceMapView: React.FC<FranceMapViewProps> = ({
  currentStation,
  onSelectStation,
  seniorMode,
  onOpenSearchModal
}) => {
  return (
    <div className="space-y-6">
      <FranceMapInteractive
        currentStation={currentStation}
        onSelectStation={onSelectStation}
        seniorMode={seniorMode}
        onOpenSearchModal={onOpenSearchModal}
      />
    </div>
  );
};
