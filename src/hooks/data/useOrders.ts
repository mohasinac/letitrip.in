/**
 * Enhanced Orders Hook using new API services
 */

import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '@/lib/api/orders';
import type { Order, OrderFilters, PaginatedResponse, Address } from '@/types';
import type { CreateOrderRequest, OrderTrackingInfo } from '@/lib/api/orders';

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching and managing user orders
 */
export function useOrders(filters: OrderFilters = {}): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ordersAPI.getOrders({
        ...filters,
        page: pageNum,
      });

      if (append) {
        setOrders(prev => [...prev, ...response.items]);
      } else {
        setOrders(response.items);
      }

      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => fetchOrders(currentPage, false), [fetchOrders, currentPage]);
  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      return fetchOrders(currentPage + 1, true);
    }
    return Promise.resolve();
  }, [fetchOrders, currentPage, totalPages]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    refetch,
    loadMore,
    clearError,
  };
}

/**
 * Hook for fetching a single order
 */
export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const orderData = await ordersAPI.getOrder(id);
      setOrder(orderData);
    } catch (err) {
      console.error(`Failed to fetch order ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setOrder(null);
      setLoading(false);
    }
  }, [orderId, fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for creating orders
 */
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (orderData: CreateOrderRequest): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);

      const newOrder = await ordersAPI.createOrder(orderData);
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createOrder,
    loading,
    error,
    clearError,
  };
}

/**
 * Hook for order tracking
 */
export function useOrderTracking(orderId: string | null) {
  const [tracking, setTracking] = useState<OrderTrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const trackingData = await ordersAPI.trackOrder(id);
      setTracking(trackingData);
    } catch (err) {
      console.error(`Failed to track order ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to track order');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (orderId) {
      fetchTracking(orderId);
    }
  }, [orderId, fetchTracking]);

  useEffect(() => {
    if (orderId) {
      fetchTracking(orderId);
    } else {
      setTracking(null);
      setLoading(false);
    }
  }, [orderId, fetchTracking]);

  return {
    tracking,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for order actions (cancel, return, etc.)
 */
export function useOrderActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelOrder = useCallback(async (orderId: string, reason?: string): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);

      const updatedOrder = await ordersAPI.cancelOrder(orderId, reason);
      return updatedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestReturn = useCallback(async (
    orderId: string,
    returnData: {
      items: Array<{
        productId: string;
        quantity: number;
        reason: string;
      }>;
      returnType: 'return' | 'exchange' | 'refund';
      reason: string;
      comments?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ordersAPI.requestReturn(orderId, returnData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request return';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadInvoice = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const blob = await ordersAPI.downloadInvoice(orderId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cancelOrder,
    requestReturn,
    downloadInvoice,
    loading,
    error,
    clearError,
  };
}

/**
 * Hook for order returns
 */
export function useOrderReturns(orderId?: string) {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const returnsData = await ordersAPI.getReturns(orderId);
      setReturns(returnsData);
    } catch (err) {
      console.error('Failed to fetch returns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return {
    returns,
    loading,
    error,
    refetch: fetchReturns,
  };
}
