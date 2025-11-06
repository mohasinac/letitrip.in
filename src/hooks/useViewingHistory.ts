/**
 * useViewingHistory Hook
 * 
 * React hook for managing viewing history with:
 * - Automatic cleanup on mount
 * - State synchronization
 * - Easy API for components
 * 
 * Usage:
 * ```typescript
 * // In product detail page
 * const { addToHistory } = useViewingHistory();
 * 
 * useEffect(() => {
 *   addToHistory({
 *     id: product.id,
 *     type: "product",
 *     title: product.title,
 *     slug: product.slug,
 *     image: product.image,
 *     price: product.price,
 *     shop_id: product.shop_id,
 *     shop_name: product.shop_name
 *   });
 * }, [product]);
 * 
 * // In history page
 * const { history, products, auctions, clear } = useViewingHistory();
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ViewingHistory } from '@/lib/viewing-history';
import type { ViewingHistoryItem } from '@/constants/navigation';

interface UseViewingHistoryReturn {
  // All history items
  history: ViewingHistoryItem[];
  
  // Filtered by type
  products: ViewingHistoryItem[];
  auctions: ViewingHistoryItem[];
  
  // Actions
  addToHistory: (item: Omit<ViewingHistoryItem, 'viewed_at'>) => void;
  removeFromHistory: (id: string, type: 'product' | 'auction') => void;
  clearHistory: () => void;
  
  // Utilities
  hasInHistory: (id: string, type: 'product' | 'auction') => boolean;
  getRecent: (limit?: number) => ViewingHistoryItem[];
  getRecentByType: (type: 'product' | 'auction', limit?: number) => ViewingHistoryItem[];
  
  // Counts
  count: number;
  productCount: number;
  auctionCount: number;
}

export function useViewingHistory(): UseViewingHistoryReturn {
  const [history, setHistory] = useState<ViewingHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
    
    // Clean expired items
    ViewingHistory.cleanExpired();
  }, []);

  // Load history from storage
  const loadHistory = useCallback(() => {
    const items = ViewingHistory.getAll();
    setHistory(items);
  }, []);

  // Add item to history
  const addToHistory = useCallback((item: Omit<ViewingHistoryItem, 'viewed_at'>) => {
    ViewingHistory.add(item);
    loadHistory();
  }, [loadHistory]);

  // Remove item from history
  const removeFromHistory = useCallback((id: string, type: 'product' | 'auction') => {
    ViewingHistory.remove(id, type);
    loadHistory();
  }, [loadHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    ViewingHistory.clear();
    setHistory([]);
  }, []);

  // Check if item exists in history
  const hasInHistory = useCallback((id: string, type: 'product' | 'auction') => {
    return ViewingHistory.has(id, type);
  }, []);

  // Get recent items
  const getRecent = useCallback((limit: number = 10) => {
    return ViewingHistory.getRecent(limit);
  }, []);

  // Get recent by type
  const getRecentByType = useCallback((type: 'product' | 'auction', limit: number = 10) => {
    return ViewingHistory.getRecentByType(type, limit);
  }, []);

  // Computed values
  const products = history.filter(item => item.type === 'product');
  const auctions = history.filter(item => item.type === 'auction');
  const count = history.length;
  const productCount = products.length;
  const auctionCount = auctions.length;

  return {
    history,
    products,
    auctions,
    addToHistory,
    removeFromHistory,
    clearHistory,
    hasInHistory,
    getRecent,
    getRecentByType,
    count,
    productCount,
    auctionCount
  };
}
