import { useState, useEffect } from "react";
import { BeybladeStats } from "@/types/beybladeStats";
import { GameService } from "@/lib/api";

export function useBeyblades() {
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBeyblades();
  }, []);

  const fetchBeyblades = async () => {
    try {
      setLoading(true);
      const data = await GameService.getBeyblades();
      setBeyblades(data as any || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching beyblades:", err);
      setError(err instanceof Error ? err.message : "Failed to load Beyblades");
      setBeyblades([]);
    } finally {
      setLoading(false);
    }
  };

  const getBeybladeById = (id: string): BeybladeStats | undefined => {
    return beyblades.find((b) => b.id === id);
  };

  const getBeybladesByType = (type: string): BeybladeStats[] => {
    return beyblades.filter((b) => b.type === type);
  };

  return {
    beyblades,
    loading,
    error,
    refetch: fetchBeyblades,
    getBeybladeById,
    getBeybladesByType,
  };
}
