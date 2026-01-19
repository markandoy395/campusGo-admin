import React from 'react';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import '../styles/header.css';

export const Header: React.FC<{ showMarkers: boolean; onToggleMarkers: () => void }> = ({
  showMarkers,
  onToggleMarkers,
}) => {
  return (
    <header className="campus-header">
      <div className="header-content">
        <h1>
          <MapPin className="icon-lg" />
          Campus Location Manager
        </h1>
        <p>Click on map or use Location • Select path to preview on map</p>
      </div>
      <button className="marker-toggle-btn" onClick={onToggleMarkers} title={showMarkers ? 'Hide Markers' : 'Show Markers'}>
        {showMarkers ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    </header>
  );
};

export default Header;
