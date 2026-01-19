import React from 'react';
import { Edit2, Trash2, MapPin, Route } from 'lucide-react';
import type { Location } from '../types/location';
import { PATHWAYS } from '../services/pathwaysService';
import '../styles/locationsList.css';

interface LocationsListProps {
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  onSelectPath?: (pathIds: string[]) => void;
}

export const LocationsList: React.FC<LocationsListProps> = ({
  locations,
  onEdit,
  onDelete,
  onSelectPath,
}) => {
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      onDelete(id);
    }
  };

  const handlePathHover = (paths: string[]) => {
    onSelectPath?.(paths);
  };

  const getPathDisplay = (paths: string[]): string => {
    return paths.map((p) => PATHWAYS[p]?.name || p).join(' + ');
  };

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      room: '#3C9AFB',
      office: '#0C1635',
      department: '#9B59B6',
      facility: '#F39C12',
      entrance: '#27AE60',
    };
    return colors[type] || '#3C9AFB';
  };

  if (locations.length === 0) {
    return (
      <div className="locations-list empty">
        <div className="empty-state">
          <MapPin className="icon-lg" />
          <p>No locations yet</p>
          <small>Click on the map or use Location to add a new location</small>
        </div>
      </div>
    );
  }

  return (
    <div className="locations-list">
      <div className="list-header">
        <h3>Locations ({locations.length})</h3>
      </div>

      <div className="locations-container">
        {locations.map((location) => (
          <div
            key={location.id}
            className="location-item"
            onMouseEnter={() => handlePathHover(location.connected_path)}
            onMouseLeave={() => handlePathHover([])}
          >
            <div className="location-item-header">
              <div className="location-info">
                <div className="location-title">
                  <MapPin className="icon-sm" style={{ color: getTypeColor(location.type) }} />
                  <h4>{location.name}</h4>
                </div>
                <div className="location-badges">
                  <span className="badge" style={{ background: getTypeColor(location.type) }}>
                    {location.type.toUpperCase()}
                  </span>
                  <span className="badge category">{location.category.toUpperCase()}</span>
                  <span className="badge access">{location.access_type.toUpperCase()}</span>
                </div>
              </div>
              <div className="location-actions">
                <button
                  className="btn-edit"
                  onClick={() => onEdit(location)}
                  title="Edit location"
                >
                  <Edit2 className="icon-sm" />
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(location.id)}
                  title="Delete location"
                >
                  <Trash2 className="icon-sm" />
                </button>
              </div>
            </div>

            <div className="location-details">
              <p>
                <strong>Building:</strong> {location.building} | <strong>Floor:</strong>{' '}
                {location.floor}
              </p>
              <p className="path-info">
                <Route className="icon-sm" />
                <strong>Path:</strong> {getPathDisplay(location.connected_path)}
              </p>

              {location.dual_pathways && (
                <p className="dual-pathways">
                  <Route className="icon-sm" /> Dual Pathways
                </p>
              )}

              {location.description && <p className="description">{location.description}</p>}
            </div>

            {location.image_urls && location.image_urls.length > 0 && (
              <div className="location-images">
                {location.image_urls.map((img, index) => (
                  <img key={index} src={img} alt={`${location.name} ${index + 1}`} />
                ))}
              </div>
            )}

            <p className="coordinates">
              <span className="coord-label">
                [Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}]
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationsList;
