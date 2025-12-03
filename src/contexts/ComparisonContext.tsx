"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  comparisonService,
  type ComparisonProduct,
} from "@/services/comparison.service";
import { COMPARISON_CONFIG } from "@/constants/comparison";

interface ComparisonContextType {
  /** Products in comparison */
  products: ComparisonProduct[];
  /** Product IDs for quick lookup */
  productIds: string[];
  /** Add a product to comparison */
  addToComparison: (product: ComparisonProduct) => boolean;
  /** Remove a product from comparison */
  removeFromComparison: (productId: string) => void;
  /** Clear all products from comparison */
  clearComparison: () => void;
  /** Check if a product is in comparison */
  isInComparison: (productId: string) => boolean;
  /** Whether more products can be added */
  canAddMore: boolean;
  /** Whether comparison can be viewed (min products met) */
  canCompare: boolean;
  /** Number of products in comparison */
  count: number;
  /** Maximum products allowed */
  maxProducts: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(
  undefined,
);

interface ComparisonProviderProps {
  children: React.ReactNode;
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
  const [products, setProducts] = useState<ComparisonProduct[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    setProducts(comparisonService.getComparisonProducts());
  }, []);

  // Listen for storage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COMPARISON_CONFIG.STORAGE_KEY) {
        setProducts(comparisonService.getComparisonProducts());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const productIds = useMemo(() => products.map((p) => p.id), [products]);

  const addToComparison = useCallback((product: ComparisonProduct): boolean => {
    const success = comparisonService.addToComparison(product);
    if (success) {
      setProducts(comparisonService.getComparisonProducts());
    }
    return success;
  }, []);

  const removeFromComparison = useCallback((productId: string): void => {
    comparisonService.removeFromComparison(productId);
    setProducts(comparisonService.getComparisonProducts());
  }, []);

  const clearComparison = useCallback((): void => {
    comparisonService.clearComparison();
    setProducts([]);
  }, []);

  const isInComparison = useCallback(
    (productId: string): boolean => {
      return productIds.includes(productId);
    },
    [productIds],
  );

  const canAddMore = products.length < COMPARISON_CONFIG.MAX_PRODUCTS;
  const canCompare = products.length >= COMPARISON_CONFIG.MIN_PRODUCTS;
  const count = products.length;

  const value = useMemo<ComparisonContextType>(
    () => ({
      products,
      productIds,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      canAddMore,
      canCompare,
      count,
      maxProducts: COMPARISON_CONFIG.MAX_PRODUCTS,
    }),
    [
      products,
      productIds,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      canAddMore,
      canCompare,
      count,
    ],
  );

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

/**
 * Hook to access comparison context
 */
export function useComparison(): ComparisonContextType {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
