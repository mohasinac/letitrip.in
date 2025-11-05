/**
 * useGameData Hook
 * Loads beyblades and arenas from Firestore
 */

import { useState, useEffect } from "react";
import type { BeybladeData, ArenaData } from "@/lib/game/types";

export interface UseGameDataReturn {
  beyblades: BeybladeData[];
  arenas: ArenaData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Temporary mock data until Firestore is connected
const MOCK_BEYBLADES: BeybladeData[] = [
 
];

const MOCK_ARENAS: ArenaData[] = [
 
];

export function useGameData(): UseGameDataReturn {
  const [beyblades, setBeyblades] = useState<BeybladeData[]>([]);
  const [arenas, setArenas] = useState<ArenaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual Firestore queries
      // const beybladeSnapshot = await getDocs(collection(db, "beyblades"));
      // const arenaSnapshot = await getDocs(collection(db, "arenas"));
      
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setBeyblades(MOCK_BEYBLADES);
      setArenas(MOCK_ARENAS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game data");
      console.error("Failed to load game data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return {
    beyblades,
    arenas,
    loading,
    error,
    refetch: fetchData,
  };
}
