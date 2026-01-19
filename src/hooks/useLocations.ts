import { useState, useCallback } from 'react';
import type { Location } from '../types/location';
import {
  loadLocationsFromSupabase,
  saveLocationToSupabase,
  updateLocationInSupabase,
  deleteLocationFromSupabase,
} from '../services/supabaseService';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadLocationsFromSupabase();
      setLocations(data);
      console.log(`✅ [SUCCESS] Loaded ${data.length} locations`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load locations';
      setError(message);
      console.error('❌ [ERROR]', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLocation = useCallback(
    async (location: Location) => {
      setError(null);
      try {
        const success = await saveLocationToSupabase(location);
        if (success) {
          setLocations((prev) => [location, ...prev]);
          console.log('✅ [SUCCESS] Location added');
          return true;
        }
        throw new Error('Failed to save location');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add location';
        setError(message);
        console.error('❌ [ERROR]', message);
        return false;
      }
    },
    []
  );

  const updateLocation = useCallback(
    async (id: string, updates: Partial<Location>) => {
      setError(null);
      try {
        const success = await updateLocationInSupabase(id, updates);
        if (success) {
          setLocations((prev) =>
            prev.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
          );
          console.log('✅ [SUCCESS] Location updated');
          return true;
        }
        throw new Error('Failed to update location');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update location';
        setError(message);
        console.error('❌ [ERROR]', message);
        return false;
      }
    },
    []
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const success = await deleteLocationFromSupabase(id);
        if (success) {
          setLocations((prev) => prev.filter((loc) => loc.id !== id));
          console.log('✅ [SUCCESS] Location deleted');
          return true;
        }
        throw new Error('Failed to delete location');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete location';
        setError(message);
        console.error('❌ [ERROR]', message);
        return false;
      }
    },
    []
  );

  return {
    locations,
    loading,
    error,
    fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
  };
}
