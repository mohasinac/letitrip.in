"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { viewingHistoryService } from "@/services/viewing-history.service";
import {
  VIEWING_HISTORY_CONFIG,
  type ViewingHistoryItem,
} from "@/constants/navigation";

interface ViewingHistoryContextType {
  /** All history items */
  history: ViewingHistoryItem[];
  /** Recently viewed items (limited subset) */
  recentlyViewed: ViewingHistoryItem[];
  /** Add an item to history */
  addToHistory: (item: Omit<ViewingHistoryItem, "viewed_at">) => void;
  /** Remove an item from history */
  removeFromHistory: (itemId: string) => void;
  /** Clear all history */
  clearHistory: () => void;
  /** Check if item is in history */
  isInHistory: (itemId: string) => boolean;
  /** Number of items in history */
  count: number;
}

const ViewingHistoryContext = createContext<
  ViewingHistoryContextType | undefined
>(undefined);

interface ViewingHistoryProviderProps {
  children: React.ReactNode;
  recentlyViewedLimit?: number;
}

export function ViewingHistoryProvider({
  children,
  recentlyViewedLimit = 8,
}: ViewingHistoryProviderProps) {
  const [history, setHistory] = useState<ViewingHistoryItem[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    setHistory(viewingHistoryService.getHistory());
  }, []);

  // Listen for storage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VIEWING_HISTORY_CONFIG.STORAGE_KEY) {
        setHistory(viewingHistoryService.getHistory());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const recentlyViewed = useMemo(
    () => history.slice(0, recentlyViewedLimit),
    [history, recentlyViewedLimit],
  );

  const addToHistory = useCallback(
    (item: Omit<ViewingHistoryItem, "viewed_at">): void => {
      viewingHistoryService.addToHistory(item);
      setHistory(viewingHistoryService.getHistory());
    },
    [],
  );

  const removeFromHistory = useCallback((itemId: string): void => {
    viewingHistoryService.removeFromHistory(itemId);
    setHistory(viewingHistoryService.getHistory());
  }, []);

  const clearHistory = useCallback((): void => {
    viewingHistoryService.clearHistory();
    setHistory([]);
  }, []);

  const isInHistory = useCallback(
    (itemId: string): boolean => {
      return history.some((item) => item.id === itemId);
    },
    [history],
  );

  const count = history.length;

  const value = useMemo<ViewingHistoryContextType>(
    () => ({
      history,
      recentlyViewed,
      addToHistory,
      removeFromHistory,
      clearHistory,
      isInHistory,
      count,
    }),
    [
      history,
      recentlyViewed,
      addToHistory,
      removeFromHistory,
      clearHistory,
      isInHistory,
      count,
    ],
  );

  return (
    <ViewingHistoryContext.Provider value={value}>
      {children}
    </ViewingHistoryContext.Provider>
  );
}

/**
 * Hook to access viewing history context
 */
export function useViewingHistory(): ViewingHistoryContextType {
  const context = useContext(ViewingHistoryContext);
  if (context === undefined) {
    throw new Error(
      "useViewingHistory must be used within a ViewingHistoryProvider",
    );
  }
  return context;
}
