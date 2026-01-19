import React, { useEffect, useRef, forwardRef } from 'react';
import L from 'leaflet';
import { useMap } from '../hooks/useMap';
import '../styles/map.css';

interface MapProps {
  onMapReady?: (map: L.Map) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export const Map = forwardRef<HTMLDivElement, MapProps>(
  ({ onMapReady, onMapClick }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;
    const { map } = useMap(containerRef, { onMapReady });

    useEffect(() => {
      if (!map.current) return;

      const handleClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng; // cspell:disable-line
        onMapClick?.(lat, lng);
      };

      map.current.on('click', handleClick);

      return () => {
        map.current?.off('click', handleClick);
      };
    }, [map, onMapClick]);

    return (
      <div 
        ref={containerRef} 
        className="map-container"
        style={{ position: 'relative', flex: 1, width: '100%', height: '100%' }}
      />
    );
  }
);

Map.displayName = 'Map';

export default Map;
