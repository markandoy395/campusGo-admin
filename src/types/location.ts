export type LocationType = 'room' | 'office' | 'department' | 'facility' | 'entrance';
export type AccessType = 'internal' | 'external' | 'restricted';
export type LocationCategory = 'academic' | 'administrative' | 'facility' | 'service' | 'entrance';

export interface Location {
  id: string;
  name: string;
  building: string;
  connected_path: string[];
  type: LocationType;
  floor: string;
  category: LocationCategory;
  access_type: AccessType;
  dual_pathways: boolean;
  description: string;
  image_urls?: string[];
  latitude: number;
  longitude: number;
  coordinates: [number, number];
  created_at?: string;
  updated_at?: string;
}

export interface Pathway {
  name: string;
  coordinates: [number, number][];
}

export interface PathwaysMap {
  [key: string]: Pathway;
}

export interface FormData {
  locationName: string;
  building: string;
  locationType: LocationType;
  floor: string;
  category: LocationCategory;
  accessType: AccessType;
  description: string;
  routeCount: number;
  connectedPath: string[];
  dualPathways: boolean;
  latitude?: number;
  longitude?: number;
  images: string[];
}
