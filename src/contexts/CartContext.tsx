"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cookieStorage } from "@/lib/storage/cookieStorage";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_ITEM"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_ERROR"; payload: string | null };

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, "id" | "addedAt">) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ITEMS":
      const items = action.payload;
      return {
        ...state,
        items,
        loading: false,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    case "ADD_ITEM":
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );
      let newItems;

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    case "UPDATE_ITEM":
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    case "REMOVE_ITEM":
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
      );
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: filteredItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null,
    totalItems: 0,
    totalPrice: 0,
  });

  const { user } = useAuth();

  // Load cart from localStorage (for guest users) or API (for authenticated users)
  const loadCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      if (user) {
        // Load cart from API for authenticated users
        const response = await fetch("/api/cart", {
          credentials: "include",
        });

        if (response.ok) {
          const cartData = await response.json();
          dispatch({ type: "SET_ITEMS", payload: cartData.items || [] });
        } else {
          dispatch({ type: "SET_ITEMS", payload: [] });
        }
      } else {
        // Load cart from cookies for guest users
        const guestCart = cookieStorage.getCartData<CartItem[]>();
        if (guestCart) {
          try {
            dispatch({
              type: "SET_ITEMS",
              payload: guestCart.map((item: any) => ({
                ...item,
                addedAt: new Date(item.addedAt),
              })),
            });
          } catch (error) {
            console.error("Error parsing guest cart:", error);
            cookieStorage.removeCartData();
            dispatch({ type: "SET_ITEMS", payload: [] });
          }
        } else {
          dispatch({ type: "SET_ITEMS", payload: [] });
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load cart" });
    }
  };

  // Save cart to cookies (for guest users)
  const saveGuestCart = (items: CartItem[]) => {
    cookieStorage.setCartData(items);
  };

  // Sync guest cart to user cart when user logs in
  const syncCart = async () => {
    if (!user) return;

    try {
      const guestCart = cookieStorage.getCartData<CartItem[]>();
      if (guestCart && guestCart.length > 0) {
        // Add guest cart items to user cart
        for (const item of guestCart) {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity,
            }),
          });
        }

        // Clear guest cart
        cookieStorage.removeCartData();

        // Reload cart from API
        loadCart();
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  // Add item to cart
  const addToCart = async (item: Omit<CartItem, "id" | "addedAt">) => {
    try {
      const cartItem: CartItem = {
        ...item,
        id: `${item.productId}_${Date.now()}`,
        addedAt: new Date(),
      };

      if (user) {
        // Add to user cart via API
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });

        if (response.ok) {
          dispatch({ type: "ADD_ITEM", payload: cartItem });
        } else {
          throw new Error("Failed to add item to cart");
        }
      } else {
        // Add to guest cart in localStorage
        dispatch({ type: "ADD_ITEM", payload: cartItem });
        saveGuestCart([...state.items, cartItem]);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add item to cart" });
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      if (user) {
        // Update via API
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            itemId,
            quantity,
          }),
        });

        if (response.ok) {
          dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, quantity } });
        } else {
          throw new Error("Failed to update cart item");
        }
      } else {
        // Update guest cart
        dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, quantity } });
        const updatedItems = state.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        saveGuestCart(updatedItems);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update cart item" });
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      if (user) {
        // Remove via API
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ itemId }),
        });

        if (response.ok) {
          dispatch({ type: "REMOVE_ITEM", payload: itemId });
        } else {
          throw new Error("Failed to remove cart item");
        }
      } else {
        // Remove from guest cart
        dispatch({ type: "REMOVE_ITEM", payload: itemId });
        const updatedItems = state.items.filter((item) => item.id !== itemId);
        saveGuestCart(updatedItems);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to remove cart item" });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (user) {
        // Clear via API
        const response = await fetch("/api/cart", {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          dispatch({ type: "CLEAR_CART" });
        } else {
          throw new Error("Failed to clear cart");
        }
      } else {
        // Clear guest cart
        dispatch({ type: "CLEAR_CART" });
        cookieStorage.removeCartData();
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to clear cart" });
    }
  };

  // Load cart when component mounts or user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // Sync guest cart when user logs in
  useEffect(() => {
    if (user) {
      syncCart();
    }
  }, [user]);

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
