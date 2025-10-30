import { useState, useEffect } from "react";
import { BeybladeStats } from "@/types/beybladeStats";

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
      const response = await fetch("/api/beyblades");
      if (!response.ok) {
        throw new Error("Failed to fetch Beyblades");
      }
      const data = await response.json();
      setBeyblades(data.beyblades || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching beyblades:", err);
      setError(err instanceof Error ? err.message : "Failed to load Beyblades");
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
