"use client";

import { useState, useEffect, useRef } from "react";

export interface NavSuggestionRecord {
  objectID: string;
  type: "page" | "category" | "blog" | "event";
  title: string;
  subtitle?: string;
  url: string;
}

/**
 * Debounced hook for navigation suggestions.
 *
 * External search support was removed, so this hook currently returns empty results.
 *
 * @param query - The current search input string
 * @param debounceMs - How long to wait after the last keystroke (default 250 ms)
 */
export function useNavSuggestions(query: string, debounceMs = 250) {
  const [suggestions, setSuggestions] = useState<NavSuggestionRecord[]>([]);
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
        setSuggestions([]);
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
