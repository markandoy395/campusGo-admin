import type { Location } from '../types/location';

export function exportLocationsAsGeoJSON(locations: Location[]): string {
  const geojson = {
    type: 'FeatureCollection',
    features: locations.map((loc) => ({
      type: 'Feature',
      properties: {
        id: loc.id,
        name: loc.name,
        building: loc.building,
        connected_path: loc.connected_path,
        type: loc.type,
        floor: loc.floor,
        category: loc.category,
        access_type: loc.access_type,
        ...(loc.dual_pathways && { dual_pathways: true }),
        ...(loc.description && { description: loc.description }),
        ...(loc.image_urls && loc.image_urls.length > 0 && { images: loc.image_urls }),
      },
      geometry: {
        type: 'Point',
        coordinates: [loc.coordinates[0], loc.coordinates[1]],
      },
    })),
  };

  return JSON.stringify(geojson, null, 2);
}

export function downloadGeoJSON(locations: Location[]): void {
  const geojson = exportLocationsAsGeoJSON(locations);
  const blob = new Blob([geojson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `campus_locations_${new Date().toISOString().split('T')[0]}.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
