import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import Header from './components/Header';
import Map from './components/Map';
import LocationForm from './components/LocationForm';
import LocationsList from './components/LocationsList';
import { useLocations } from './hooks/useLocations';
import { useMap } from './hooks/useMap';
import { PATHWAYS, getPathwayCoordinates } from './services/pathwaysService';
import type { Location } from './types/location';
import './styles/globals.css';
import './App.css';

function App() {
  const { locations, fetchLocations, addLocation, updateLocation, deleteLocation } =
    useLocations();
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [highlightedPaths, setHighlightedPaths] = useState<string[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'view' | 'add'>('view');
  const [showMarkers, setShowMarkers] = useState(true);
  const [tempMarker, setTempMarker] = useState<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { map, addMarker, addTemporaryMarker, addPathway, highlightPathway, resetPathway, fitBounds } = useMap(
    mapContainerRef,
    {
      onMapReady: () => {
        console.log('✅ [DEBUG] Map ready - initializing pathways');
      },
    }
  );

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

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Load locations
      await fetchLocations();

      // Initialize pathways
      if (map.current) {
        Object.entries(PATHWAYS).forEach(([id]) => {
          const coords = getPathwayCoordinates(id);
          addPathway(id, coords);
        });
        console.log('✅ [DEBUG] Pathways initialized');
      }
    };

    init();
  }, [map, fetchLocations, addPathway]);

  // Add markers to map when locations load
  useEffect(() => {
    if (!map.current) {
      console.log('⏳ [DEBUG] Waiting for map to initialize...');
      return;
    }

    console.log('📍 [DEBUG] Adding markers for', locations.length, 'locations');

    // Clear existing markers before adding new ones
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current?.removeLayer(layer);
      }
    });

    // Only add markers if showMarkers is true
    if (showMarkers) {
      locations.forEach((loc) => {
        console.log(`  Adding marker: ${loc.name} at [${loc.latitude}, ${loc.longitude}]`);
        const color = getTypeColor(loc.type);
        const marker = addMarker(loc.latitude, loc.longitude, color);
        if (marker) {
        const pathDisplay = loc.connected_path
          .map((p) => PATHWAYS[p]?.name || p)
          .join(' + ');
        marker.bindPopup(
          `<b>${loc.name}</b><br>${loc.building}<br>${loc.floor}<br><i>${loc.access_type}</i><br><small>${pathDisplay}</small>`
        );
      }
      });
    }

    // Fit map to show all locations
    if (locations.length > 0) {
      const coordinates = locations.map((loc) => [loc.longitude, loc.latitude] as [number, number]);
      console.log('🗺️ [DEBUG] Fitting bounds to', coordinates.length, 'coordinates');
      fitBounds(coordinates);
    }
  }, [locations, map, addMarker, fitBounds, showMarkers]);

  // Update path highlighting
  useEffect(() => {
    if (!map.current) {
      console.log('⏳ [DEBUG] Cannot highlight paths - map not ready');
      return;
    }

    console.log('🔄 [DEBUG] Highlighting paths:', highlightedPaths);

    // Reset previously highlighted paths
    Object.keys(PATHWAYS).forEach((pathId) => {
      console.log(`  📍 Resetting pathway: ${pathId}`);
      resetPathway(pathId);
    });

    // Highlight new paths
    highlightedPaths.forEach((pathId) => {
      console.log(`  ⭐ Highlighting pathway: ${pathId}`);
      highlightPathway(pathId);
    });
  }, [highlightedPaths, map, highlightPathway, resetPathway]);

  const handleFormSubmit = async (locationData: Omit<Location, 'coordinates'> & { coordinates: [number, number] }) => {
    try {
      if (editingLocation) {
        const success = await updateLocation(editingLocation.id, locationData);
        if (success) {
          setEditingLocation(null);
          alert('✓ Location updated successfully!');
        }
      } else {
        const success = await addLocation({
          ...locationData,
          created_at: new Date().toISOString(),
        });
        if (success) {
          alert('✓ Location added successfully!');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLocation = async (id: string) => {
    const success = await deleteLocation(id);
    if (success) {
      alert('✓ Location deleted successfully!');
    }
  };

  const handlePathSelect = (pathIds: string[]) => {
    setHighlightedPaths(pathIds);
  };

  const handleCoordinatesChange = (coords: { lat: number; lng: number }) => {
    // Remove old temporary marker if exists
    if (tempMarker && map.current) {
      map.current.removeLayer(tempMarker);
    }
    
    // Add new temporary marker
    const newMarker = addTemporaryMarker(coords.lat, coords.lng);
    setTempMarker(newMarker);
    
    // Center map on the marker
    if (map.current) {
      map.current.setView([coords.lat, coords.lng], 19);
    }
  };

  return (
    <div className="app-container">
      <Header showMarkers={showMarkers} onToggleMarkers={() => setShowMarkers(!showMarkers)} />
      <div className="main-container">
        <div className="map-section">
          <Map ref={mapContainerRef} />
        </div>
        <div className="sidebar">
          <div className="sidebar-tabs">
            <button
              className={`tab-button ${sidebarTab === 'view' ? 'active' : ''}`}
              onClick={() => setSidebarTab('view')}
            >
              📋 View Locations
            </button>
            <button
              className={`tab-button ${sidebarTab === 'add' ? 'active' : ''}`}
              onClick={() => setSidebarTab('add')}
            >
              ➕ Add Location
            </button>
          </div>

          <div className="tab-content">
            {sidebarTab === 'view' ? (
              <LocationsList
                locations={locations}
                onEdit={(location) => {
                  handleEditLocation(location);
                  setSidebarTab('add');
                }}
                onDelete={handleDeleteLocation}
                onSelectPath={handlePathSelect}
              />
            ) : (
              <LocationForm
                onSubmit={handleFormSubmit}
                editingLocation={editingLocation}
                onClear={() => setEditingLocation(null)}
                onPathsChange={handlePathSelect}
                onCoordinatesChange={handleCoordinatesChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
