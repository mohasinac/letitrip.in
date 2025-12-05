/**
 * @fileoverview React Component
 * @module src/contexts/ViewingHistoryContext
 * @description This file contains the ViewingHistoryContext component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * ViewingHistoryContextType interface
 * 
 * @interface
 * @description Defines the structure and contract for ViewingHistoryContextType
 */
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

/**
 * ViewingHistoryProviderProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ViewingHistoryProviderProps
 */
interface ViewingHistoryProviderProps {
  /** Children */
  children: React.ReactNode;
  /** Recently Viewed Limit */
  recentlyViewedLimit?: number;
}

/**
 * Function: Viewing History Provider
 */
/**
 * Performs viewing history provider operation
 *
 * @param {ViewingHistoryProviderProps} [{
  children,
  recentlyViewedLimit] - The {
  children,
  recently viewed limit
 *
 * @returns {any} The viewinghistoryprovider result
 *
 * @example
 * ViewingHistoryProvider({
  children,
  recentlyViewedLimit);
 */

/**
 * Performs viewing history provider operation
 *
 * @param {ViewingHistoryProviderProps} [{
  children,
  recentlyViewedLimit] - The {
  children,
  recently viewed limit
 *
 * @returns {any} The viewinghistoryprovider result
 *
 * @example
 * ViewingHistoryProvider({
  children,
  recentlyViewedLimit);
 */

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
    /**
     * Handles storage change event
     *
     * @param {StorageEvent} e - The e
     *
     * @returns {any} The handlestoragechange result
     */

    /**
     * Handles storage change event
     *
     * @param {StorageEvent} e - The e
     *
     * @returns {any} The handlestoragechange result
     */

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
/**
 * Custom React hook for viewing history
 *
 * @returns {any} The useviewinghistory result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useViewingHistory();
 */

/**
 * Custom React hook for viewing history
 *
 * @returns {any} The useviewinghistory result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useViewingHistory();
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
