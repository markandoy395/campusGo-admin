import React, { useState } from 'react';
import { Route, ChevronDown } from 'lucide-react';
import { PATHWAY_GROUPS, PATHWAYS } from '../services/pathwaysService';
import '../styles/pathwaySelector.css';

interface PathwaySelectorProps {
  selectedPaths: string[];
  onSelectPath: (pathIds: string[]) => void;
}

export const PathwaySelector: React.FC<PathwaySelectorProps> = ({ selectedPaths, onSelectPath }) => {
  const [expanded, setExpanded] = useState(false);

  const handlePathClick = (pathId: string) => {
    if (selectedPaths.includes(pathId)) {
      onSelectPath(selectedPaths.filter((p) => p !== pathId));
    } else {
      onSelectPath([...selectedPaths, pathId]);
    }
  };

  const handleClear = () => {
    onSelectPath([]);
  };

  return (
    <div className="pathway-selector">
      <div className="selector-header">
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          <Route className="icon-sm" />
          <span>Routes</span>
          <ChevronDown className={`icon-sm chevron ${expanded ? 'expanded' : ''}`} />
        </button>
        {selectedPaths.length > 0 && (
          <button className="clear-btn" onClick={handleClear} title="Clear selection">
            Clear
          </button>
        )}
      </div>

      {expanded && (
        <div className="selector-content">
          {Object.entries(PATHWAY_GROUPS).map(([group, pathIds]) => (
            <div key={group} className="pathway-group">
              <h4 className="group-title">{group}</h4>
              <div className="group-items">
                {pathIds.map((pathId) => (
                  <label key={pathId} className="pathway-item">
                    <input
                      type="checkbox"
                      checked={selectedPaths.includes(pathId)}
                      onChange={() => handlePathClick(pathId)}
                    />
                    <span className="pathway-name">{PATHWAYS[pathId]?.name || pathId}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPaths.length > 0 && (
        <div className="selected-count">
          <span>{selectedPaths.length} route(s) highlighted</span>
        </div>
      )}
    </div>
  );
};

export default PathwaySelector;
