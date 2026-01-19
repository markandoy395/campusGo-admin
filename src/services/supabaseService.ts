import { createClient } from '@supabase/supabase-js';
import type { Location, LocationType, LocationCategory, AccessType } from '../types/location';

const SUPABASE_URL = 'https://awjntdtvmhgacexuhwvy.supabase.co';
// cspell:disable-next-line
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3am50ZHR2bWhnYWNleHVod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzczNjIsImV4cCI6MjA3NjMxMzM2Mn0.ZfW2BORLTZO4a9bHfFzsMHUnR1VCy9ujptPDxC2tZ_0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function loadLocationsFromSupabase(): Promise<Location[]> {
  console.log('🔍 [DEBUG] loadLocationsFromSupabase() called');

  try {
    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [ERROR] Supabase query error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('⚠️  [WARN] No locations in database');
      return [];
    }

    console.log(`✅ [DEBUG] Received ${data.length} locations`);

    const locations: Location[] = data.map((loc: Record<string, unknown>) => ({
      id: String(loc.id),
      name: String(loc.name),
      building: String(loc.building),
      connected_path: Array.isArray(loc.connected_path)
        ? (loc.connected_path as string[])
        : [String(loc.connected_path)],
      type: loc.type as LocationType,
      floor: String(loc.floor),
      category: loc.category as LocationCategory,
      access_type: loc.access_type as AccessType,
      dual_pathways: Boolean(loc.dual_pathways) || false,
      description: String(loc.description) || '',
      image_urls: (Array.isArray(loc.image_urls) ? loc.image_urls : []) as string[],
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      coordinates: [Number(loc.longitude), Number(loc.latitude)] as [number, number],
      created_at: loc.created_at ? String(loc.created_at) : undefined,
      updated_at: loc.updated_at ? String(loc.updated_at) : undefined,
    }));

    console.log(`✅ [SUCCESS] Loaded ${locations.length} locations`);
    return locations;
  } catch (err) {
    console.error('❌ [ERROR] Exception in loadLocationsFromSupabase:', err);
    return [];
  }
}

export async function saveLocationToSupabase(location: Location): Promise<boolean> {
  console.log('💾 [DEBUG] Saving location:', location.name);

  try {
    const { error } = await supabase.from('campus_locations').insert({
      id: location.id,
      name: location.name,
      building: location.building,
      connected_path: location.connected_path,
      type: location.type,
      floor: location.floor,
      category: location.category,
      access_type: location.access_type,
      dual_pathways: location.dual_pathways,
      description: location.description,
      image_urls: location.image_urls || [],
      latitude: location.latitude,
      longitude: location.longitude,
    });

    if (error) {
      console.error('❌ [ERROR] Save failed:', error);
      return false;
    }

    console.log('✅ [SUCCESS] Location saved');
    return true;
  } catch (err) {
    console.error('❌ [ERROR] Exception in saveLocationToSupabase:', err);
    return false;
  }
}

export async function updateLocationInSupabase(
  id: string,
  updates: Partial<Location>
): Promise<boolean> {
  console.log('✏️  [DEBUG] Updating location:', id);

  try {
    const updateData: Record<string, unknown> = {
      name: updates.name,
      building: updates.building,
      connected_path: updates.connected_path,
      type: updates.type,
      floor: updates.floor,
      category: updates.category,
      access_type: updates.access_type,
      dual_pathways: updates.dual_pathways,
      description: updates.description,
      image_urls: updates.image_urls || [],
      latitude: updates.latitude,
      longitude: updates.longitude,
    };

    const { error } = await supabase
      .from('campus_locations')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('❌ [ERROR] Update failed:', error);
      return false;
    }

    console.log('✅ [SUCCESS] Location updated');
    return true;
  } catch (err) {
    console.error('❌ [ERROR] Exception in updateLocationInSupabase:', err);
    return false;
  }
}

export async function deleteLocationFromSupabase(id: string): Promise<boolean> {
  console.log('🗑️  [DEBUG] Deleting location:', id);

  try {
    const { error } = await supabase.from('campus_locations').delete().eq('id', id);

    if (error) {
      console.error('❌ [ERROR] Delete failed:', error);
      return false;
    }

    console.log('✅ [SUCCESS] Location deleted');
    return true;
  } catch (err) {
    console.error('❌ [ERROR] Exception in deleteLocationFromSupabase:', err);
    return false;
  }
}
