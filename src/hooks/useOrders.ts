/**
 * useOrders Hook
 * React hook for fetching and managing order data
 * 
 * Usage:
 *   const { orders, loading, error } = useOrders({ status: 'pending' });
 */

import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '@/lib/api/services';
import type { Order, OrderFilters } from '@/types';
import type { PaginatedData } from '@/lib/api/responses';

export interface UseOrdersResult {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch list of orders
 */
export function useOrders(filters?: OrderFilters): UseOrdersResult {
  const [data, setData] = useState<PaginatedData<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ordersService.list(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch: fetchOrders,
  };
}

export interface UseOrderResult {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(id: string): UseOrderResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ordersService.getById(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
