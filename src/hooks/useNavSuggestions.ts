"use client";

import { useState, useEffect, useRef } from "react";
import { navSuggestionsService } from "@/services";
import type { AlgoliaNavRecord } from "@/lib/search/algolia";

export type { AlgoliaNavRecord };

/**
 * Debounced hook that fetches navigation page suggestions from the Algolia
 * `pages_nav` index as the user types in the global search overlay.
 *
 * Degrades gracefully — returns empty results when Algolia is not configured
 * (missing NEXT_PUBLIC_ALGOLIA_* env vars).
 *
 * @param query - The current search input string
 * @param debounceMs - How long to wait after the last keystroke (default 250 ms)
 */
export function useNavSuggestions(query: string, debounceMs = 250) {
  const [suggestions, setSuggestions] = useState<AlgoliaNavRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await navSuggestionsService.search(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  return { suggestions, isLoading };
}
