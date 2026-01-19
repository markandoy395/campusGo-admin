import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

const INITIAL_LAT = 8.6337;
const INITIAL_LNG = 126.0936;
const INITIAL_ZOOM = 18;

interface UseMapOptions {
  onMapReady?: (map: L.Map) => void;
}

export function useMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options?: UseMapOptions
) {
  const mapRef = useRef<L.Map | null>(null);
  const pathLayersRef = useRef<{ [key: string]: L.Polyline }>({});
  const initCompleteRef = useRef(false);

  useEffect(() => {
    // Always clean up any existing map instance before creating a new one

    // --- Bulletproof cleanup: forcibly remove any existing Leaflet map from the container ---
    if (containerRef.current) {
      // If the container has a _leaflet_id, forcibly remove the map
      const container = containerRef.current as unknown as Record<string, unknown>;
      if (container._leaflet_id) {
        try {
          // Find the map instance from the global Leaflet map registry
          const mapId = container._leaflet_id;
          // @ts-expect-error - _instances is a private Leaflet internal property
          const mapInstance = L && L.Map && L.Map._instances && L.Map._instances[mapId];
          if (mapInstance && typeof mapInstance.remove === 'function') {
            mapInstance.off();
            mapInstance.remove();
            console.log('🗑️ [DEBUG] Forcibly removed existing Leaflet map from container');
          }
        } catch (err) {
          console.warn('⚠️ [WARN] Failed to forcibly remove existing Leaflet map:', err);
        }
        // Remove the _leaflet_id property
        try {
          delete container._leaflet_id;
        } catch (err) {
          // Ignore errors when deleting property
          void err;
        }
      }
      // Also remove any _leaflet_map property
      if (container._leaflet_map) {
        try {
          (container._leaflet_map as L.Map).off();
          (container._leaflet_map as L.Map).remove();
        } catch (err) {
          // Ignore errors when removing map
          void err;
        }
        delete container._leaflet_map;
      }
    }

    if (!containerRef.current) {
      console.log('🔍 [DEBUG] Cannot initialize: containerRef.current is null');
      return;
    }

    console.log('🚀 [DEBUG] Starting map initialization...');
    console.log('  Container:', containerRef.current);
    console.log('  Container size:', containerRef.current.clientWidth, 'x', containerRef.current.clientHeight);

    try {
      // Attempt to create a new map
      console.log('📍 [DEBUG] Creating new Leaflet map...');
      const newMap = L.map(containerRef.current, {
        preferCanvas: true,
      });

      console.log('✅ [DEBUG] Map created, adding tile layer...');
      L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
        attribution: '© Stadia Maps | © OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(newMap);

      console.log('📍 [DEBUG] Setting view to', INITIAL_LAT, INITIAL_LNG);
      newMap.setView([INITIAL_LAT, INITIAL_LNG], INITIAL_ZOOM);
      
      // Store map reference immediately
      mapRef.current = newMap;
      console.log('💾 [DEBUG] Map stored in mapRef');
      
      // Force Leaflet to recalculate container size
      setTimeout(() => {
        console.log('🔄 [DEBUG] Calling invalidateSize...');
        newMap.invalidateSize();
        initCompleteRef.current = true;
        console.log('✅ [DEBUG] Map initialization complete - size invalidated');
        options?.onMapReady?.(newMap);
      }, 100);
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || String(err);
      console.error('❌ [ERROR] Map initialization failed:', errorMsg, err);
    }

    // Cleanup function: remove the map when the component unmounts
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
          mapRef.current = null;
          // Also clear from container to prevent stale reference
          const container = containerRef.current as unknown as Record<string, unknown>;
          if (container && (container._leaflet_map as L.Map | undefined)) {
            delete container._leaflet_map;
          }
          console.log('🗑️ [DEBUG] Map instance removed on cleanup');
        } catch (cleanupErr) {
          console.warn('⚠️ Warning during map cleanup:', cleanupErr);
        }
      }
    };
  }, []);

  const addMarker = useCallback(
    (lat: number, lng: number, color: string = '#3C9AFB'): L.Marker | null => {
      if (!mapRef.current) {
        console.warn('⚠️ [WARN] addMarker called but map not ready');
        return null;
      }

      console.log(`  ✅ Creating marker at [${lat}, ${lng}] with color ${color}`);
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      }).addTo(mapRef.current);

      return marker;
    },
    []
  );

  const addTemporaryMarker = useCallback(
    (lat: number, lng: number): L.Marker | null => {
      if (!mapRef.current) return null;

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: '<div style="background:#FFD523;width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(mapRef.current);

      return marker;
    },
    []
  );

  const removeMarker = useCallback((marker: L.Marker) => {
    if (mapRef.current && marker) {
      mapRef.current.removeLayer(marker);
    }
  }, []);

  const addPathway = useCallback(
    (pathId: string, coordinates: [number, number][]): L.Polyline | null => {
      if (!mapRef.current) {
        console.warn('⚠️ [WARN] addPathway called but map not ready');
        return null;
      }

      console.log(`  📍 Creating pathway ${pathId} with ${coordinates.length} points`);
      const latLngs = coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple);
      const layer = L.polyline(latLngs, {
        color: '#60A5FA',
        weight: 2,
        opacity: 0.3,
        dashArray: '5,5',
      }).addTo(mapRef.current);

      pathLayersRef.current[pathId] = layer;
      console.log(`  ✅ Pathway ${pathId} added. Total pathways: ${Object.keys(pathLayersRef.current).length}`);
      return layer;
    },
    []
  );

  const highlightPathway = useCallback((pathId: string) => {
    const layer = pathLayersRef.current[pathId];
    if (layer) {
      console.log(`  ⭐ Highlighting pathway ${pathId}`);
      layer.setStyle({
        color: '#FFD523',
        weight: 4,
        opacity: 1,
        dashArray: '',
      });
      layer.bringToFront();
    } else {
      console.warn(`  ⚠️ [WARN] Cannot highlight pathway ${pathId} - not found in pathLayersRef`);
    }
  }, []);

  const resetPathway = useCallback((pathId: string) => {
    const layer = pathLayersRef.current[pathId];
    if (layer) {
      console.log(`  🔄 Resetting pathway ${pathId}`);
      layer.setStyle({
        color: '#60A5FA',
        weight: 2,
        opacity: 0.3,
        dashArray: '5,5',
      });
    }
  }, []);

  const centerMap = useCallback((lat: number, lng: number, zoom: number = 19) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], zoom);
    }
  }, []);

  const fitBounds = useCallback((coordinates: [number, number][]) => {
    if (!mapRef.current || coordinates.length === 0) return;
    const bounds = L.latLngBounds(coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple));
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, []);

  return {
    map: mapRef,
    addMarker,
    addTemporaryMarker,
    removeMarker,
    addPathway,
    highlightPathway,
    resetPathway,
    centerMap,
    fitBounds,
  };
}
