/**
 * Hook for loading arena configurations from the database
 */

import { useState, useEffect } from 'react';
import { ArenaConfig } from '@/types/arenaConfig';

export function useArenas() {
  const [arenas, setArenas] = useState<ArenaConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/arenas');
        const data = await response.json();

        if (data.success) {
          setArenas(data.data || []);
        } else {
          setError(data.message || 'Failed to load arenas');
        }
      } catch (err) {
        console.error('Error fetching arenas:', err);
        setError('Failed to load arenas');
      } finally {
        setLoading(false);
      }
    };

    fetchArenas();
  }, []);

  return { arenas, loading, error };
}
