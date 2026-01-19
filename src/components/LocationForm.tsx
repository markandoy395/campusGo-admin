import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Save,
  Loader2,
  AlertCircle,
  X,
  Navigation,
} from 'lucide-react';
import { getPathwayOptions } from '../services/pathwaysService';
import { BUILDING_OPTIONS, FLOOR_OPTIONS, TYPE_OPTIONS, CATEGORY_OPTIONS, formatOptionLabel } from '../constants/buildings';
import { handleImageUpload, getCurrentLocation } from '../utils/imageService';
import { generateLocationId } from '../utils/imageService';
import type { Location, FormData as FormDataType, LocationType, LocationCategory, AccessType } from '../types/location';
import '../styles/form.css';

interface LocationFormProps {
  onSubmit: (location: Omit<Location, 'coordinates'> & { coordinates: [number, number] }) => Promise<void>;
  editingLocation?: Location | null;
  onClear?: () => void;
  onPathsChange?: (paths: string[]) => void;
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  onSubmit,
  editingLocation,
  onClear,
  onPathsChange,
  onCoordinatesChange,
}) => {
  const [formData, setFormData] = useState<FormDataType>({
    locationName: '',
    building: '',
    locationType: 'room',
    floor: 'Ground Floor',
    category: 'academic',
    accessType: 'internal',
    description: '',
    routeCount: 1,
    connectedPath: [''],
    dualPathways: false,
    images: [] as string[],
  });

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageCountRef = useRef<HTMLDivElement>(null);

  const pathwayOptions = getPathwayOptions();

  // Load existing location if editing
  useEffect(() => {
    if (editingLocation) {
      const coords = {
        lat: editingLocation.latitude,
        lng: editingLocation.longitude,
      };
      setFormData((prev) => ({
        ...prev,
        locationName: editingLocation.name,
        building: editingLocation.building,
        locationType: editingLocation.type,
        floor: editingLocation.floor,
        category: editingLocation.category,
        accessType: editingLocation.access_type,
        description: editingLocation.description,
        routeCount: editingLocation.connected_path.length,
        connectedPath: editingLocation.connected_path,
        dualPathways: editingLocation.dual_pathways,
        images: editingLocation.image_urls || [],
      }));
      setSelectedCoords(coords);
      onCoordinatesChange?.(coords);
    }
  }, [editingLocation, onCoordinatesChange]);

  const handleClear = () => {
    setFormData({
      locationName: '',
      building: '',
      locationType: 'room',
      floor: 'Ground Floor',
      category: 'academic',
      accessType: 'internal',
      description: '',
      routeCount: 1,
      connectedPath: [''],
      dualPathways: false,
      images: [],
    });
    setSelectedCoords(null);
    setError(null);
    onClear?.();
  };

  const handlePathChange = (index: number, value: string) => {
    const newPaths = [...formData.connectedPath];
    newPaths[index] = value;
    setFormData((prev) => ({
      ...prev,
      connectedPath: newPaths,
      dualPathways: newPaths.filter((p) => p).length > 1,
    }));
    // Notify parent about path changes to highlight on map
    const selectedPaths = newPaths.filter((p) => p);
    onPathsChange?.(selectedPaths);
  };

  const handleRouteCountChange = (count: number) => {
    const newPaths = Array(count)
      .fill('')
      .map((_, i) => formData.connectedPath[i] || '');
    setFormData((prev) => ({
      ...prev,
      routeCount: count,
      connectedPath: newPaths,
      dualPathways: newPaths.filter((p) => p).length > 1,
    }));
    // Notify parent about path changes
    const selectedPaths = newPaths.filter((p) => p);
    onPathsChange?.(selectedPaths);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    try {
      const newImages = await handleImageUpload(e.target.files, formData.images);
      setFormData((prev) => ({
        ...prev,
        images: newImages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUseLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await getCurrentLocation();
      const newCoords = {
        lat: pos.latitude,
        lng: pos.longitude,
      };
      setSelectedCoords(newCoords);
      onCoordinatesChange?.(newCoords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCoords) {
      setError('Select location');
      return;
    }

    const paths = formData.connectedPath.filter((p) => p);
    if (paths.length === 0) {
      setError('At least one pathway required');
      return;
    }

    setIsSubmitting(true);
    try {
      const locationData: Omit<Location, 'coordinates'> & { coordinates: [number, number] } = {
        id: editingLocation?.id || generateLocationId(),
        name: formData.locationName.trim() || 'Unnamed Location',
        building: formData.building.trim() || formData.category,
        connected_path: paths,
        type: formData.locationType,
        floor: formData.floor || 'Ground Floor',
        category: formData.category,
        access_type: formData.accessType,
        dual_pathways: paths.length > 1,
        description: formData.description.trim(),
        image_urls: formData.images.length > 0 ? formData.images : undefined,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        coordinates: [selectedCoords.lng, selectedCoords.lat],
      };

      await onSubmit(locationData);
      handleClear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    selectedCoords &&
    formData.locationName.trim() !== '' &&
    formData.connectedPath.filter((p) => p).length > 0 &&
    !isSubmitting;

  return (
    <form className="location-form" onSubmit={handleSubmit}>
      {editingLocation && (
        <div className="edit-mode-banner">
          <AlertCircle className="icon-sm" />
          Editing Mode - Update location details
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle className="icon-sm" />
          {error}
        </div>
      )}

      <div className="form-section">
        <h3>Location Details</h3>

        <div className="form-group">
          <label htmlFor="locationName">Location Name *</label>
          <input
            id="locationName"
            type="text"
            placeholder="e.g., Room 101"
            value={formData.locationName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, locationName: e.target.value }))
            }
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="building">Building *</label>
            <select
              id="building"
              value={formData.building}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, building: e.target.value }))
              }
              required
            >
              <option value="">Select Building</option>
              {BUILDING_OPTIONS.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="floor">Floor *</label>
            <select
              id="floor"
              value={formData.floor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, floor: e.target.value }))
              }
              required
            >
              <option value="">Select Floor</option>
              {FLOOR_OPTIONS.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="locationType">Type *</label>
            <select
              id="locationType"
              value={formData.locationType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  locationType: e.target.value as LocationType,
                }))
              }
              required
            >
              <option value="">Select Type</option>
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {formatOptionLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as LocationCategory,
                }))
              }
              required
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {formatOptionLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="accessType">Access Type</label>
          <select
            id="accessType"
            value={formData.accessType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                accessType: e.target.value as AccessType,
              }))
            }
          >
            <option value="internal">Internal</option>
            <option value="external">External</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Additional details..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Location Selection</h3>

        <div className="location-buttons">
          <button
            type="button"
            className="location-btn active"
            disabled
          >
            📍 Map
          </button>
          <button
            type="button"
            className="location-btn"
            onClick={handleUseLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <Loader2 className="icon-sm" style={{ animation: 'spin 1s linear infinite' }} />
                Locating...
              </>
            ) : (
              <>
                <Navigation className="icon-sm" />
                Location
              </>
            )}
          </button>
        </div>

        {selectedCoords && (
          <div className="coordinates-display">
            <p>
              <strong>Latitude:</strong> {selectedCoords.lat.toFixed(7)}
            </p>
            <p>
              <strong>Longitude:</strong> {selectedCoords.lng.toFixed(7)}
            </p>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Connected Pathways</h3>

        <div className="form-group">
          <label htmlFor="routeCount">Number of Routes</label>
          <select
            id="routeCount"
            value={formData.routeCount}
            onChange={(e) => handleRouteCountChange(parseInt(e.target.value))}
          >
            <option value="1">1 Route</option>
            <option value="2">2 Routes</option>
            <option value="3">3 Routes</option>
            <option value="4">4 Routes</option>
          </select>
        </div>

        {[0, 1, 2, 3].map(
          (index) =>
            index < formData.routeCount && (
              <div key={index} className="form-group">
                <label htmlFor={`connectedPath${index}`}>
                  Path {index + 1} {index === 0 ? '*' : ''}
                </label>
                <select
                  id={`connectedPath${index}`}
                  value={formData.connectedPath[index] || ''}
                  onChange={(e) => handlePathChange(index, e.target.value)}
                  required={index === 0}
                >
                  <option value="">Select Path</option>
                  {Object.entries(pathwayOptions).map(([group, options]) => (
                    <optgroup key={group} label={group}>
                      {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )
        )}
      </div>

      <div className="form-section">
        <h3>Images (Max 4)</h3>
        <div className="image-upload">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            disabled={formData.images.length >= 4}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={formData.images.length >= 4}
          >
            Upload Images
          </button>
          <span ref={imageCountRef} className="image-count">
            {formData.images.length}/4
          </span>
        </div>

        {formData.images.length > 0 && (
          <div className="image-preview">
            {formData.images.map((img, index) => (
              <div key={index} className="image-preview-item">
                <img src={img} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => removeImage(index)}
                >
                  <X className="icon-sm" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="submit-btn"
          disabled={!isFormValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="icon-sm" style={{ animation: 'spin 1s linear infinite' }} />
              {editingLocation ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              {editingLocation ? <Save className="icon-sm" /> : <Plus className="icon-sm" />}
              {editingLocation ? 'Update' : 'Add'} Location
            </>
          )}
        </button>
        <button type="button" className="clear-btn" onClick={handleClear}>
          Clear
        </button>
      </div>
    </form>
  );
};

export default LocationForm;
