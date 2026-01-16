/**
 * useCart Hook
 *
 * Framework-agnostic cart management hook with injectable services.
 * Supports both authenticated and guest carts.
 *
 * @example
 * ```tsx
 * const {
 *   cart,
 *   loading,
 *   addItem,
 *   removeItem,
 *   updateQuantity,
 *   clearCart,
 * } = useCart({
 *   user: currentUser,
 *   cartService: {
 *     get: () => cartApi.get(),
 *     addItem: (item) => cartApi.addItem(item),
 *     // ... other methods
 *   },
 * });
 * ```
 */

import { useCallback, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  quantity: number;
  variantId?: string | null;
  variantName?: string | null;
  image?: string;
  sku?: string;
  maxQuantity?: number;
  discount?: number;
  isAvailable?: boolean;
  [key: string]: any;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  [key: string]: any;
}

export interface CartService {
  get: () => Promise<Cart>;
  addItem: (item: Omit<CartItem, "id">) => Promise<Cart>;
  removeItem: (itemId: string) => Promise<Cart>;
  updateQuantity: (itemId: string, quantity: number) => Promise<Cart>;
  clear: () => Promise<void>;
}

export interface UseCartOptions {
  /** Current user (null for guest) */
  user: { id: string; [key: string]: any } | null;
  /** Injectable cart service */
  cartService: CartService;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Auto-load cart on mount */
  autoLoad?: boolean;
}

export interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<CartItem, "id">) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export function useCart(options: UseCartOptions): UseCartReturn {
  const { user, cartService, onError, autoLoad = true } = options;

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartService.get();
      setCart(data);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load cart";
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  }, [cartService, onError]);

  const addItem = useCallback(
    async (item: Omit<CartItem, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const updatedCart = await cartService.addItem(item);
        setCart(updatedCart);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to add item";
        setError(errorMsg);
        onError?.(err instanceof Error ? err : new Error(errorMsg));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cartService, onError]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        setLoading(true);
        setError(null);
        const updatedCart = await cartService.removeItem(itemId);
        setCart(updatedCart);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to remove item";
        setError(errorMsg);
        onError?.(err instanceof Error ? err : new Error(errorMsg));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cartService, onError]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        setLoading(true);
        setError(null);
        const updatedCart = await cartService.updateQuantity(itemId, quantity);
        setCart(updatedCart);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to update quantity";
        setError(errorMsg);
        onError?.(err instanceof Error ? err : new Error(errorMsg));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cartService, onError]
  );

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await cartService.clear();
      setCart(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to clear cart";
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cartService, onError]);

  // Auto-load cart on mount or when user changes
  useEffect(() => {
    if (autoLoad) {
      loadCart();
    }
  }, [user?.id, autoLoad, loadCart]);

  return {
    cart,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart: loadCart,
  };
}

export default useCart;
