"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/utils/product";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number; // in INR
  quantity: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  sku?: string;
  slug?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  moveToWishlist: (itemId: string) => void;
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("shopping_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("shopping_cart", JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [items, isLoading]);

  const addItem = (product: any, quantity: number = 1) => {
    if (!product || !product.id) {
      toast.error("Invalid product");
      return;
    }

    // Check if item already exists in cart
    const existingItem = items.find((item) => item.productId === product.id);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check stock availability
      if (newQuantity > product.stock) {
        toast.error(`Only ${product.stock} items available`);
        return;
      }

      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      toast.success("Cart updated");
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `cart_${Date.now()}`,
        productId: product.id,
        name: product.name || product.title,
        image: getProductImageUrl(product, 0, ""),
        price: product.price,
        quantity,
        stock: product.stock || 0,
        sellerId: product.sellerId || "",
        sellerName: product.sellerName || "Unknown Seller",
        sku: product.sku,
        slug: product.slug,
      };

      setItems([...items, newItem]);
      toast.success("Added to cart");
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Check stock availability
    if (quantity > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }

    setItems(items.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    toast.success("Removed from cart");
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
  };

  const moveToWishlist = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Get wishlist from localStorage
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

      // Check if already in wishlist
      const existsInWishlist = wishlist.some(
        (w: any) => w.productId === item.productId
      );

      if (!existsInWishlist) {
        wishlist.push({
          id: `wish_${Date.now()}`,
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          slug: item.slug,
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        toast.success("Moved to wishlist");
      } else {
        toast("Already in wishlist", { icon: "ℹ️" });
      }

      // Remove from cart
      removeItem(itemId);
    } catch (error) {
      console.error("Failed to move to wishlist:", error);
      toast.error("Failed to move to wishlist");
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    moveToWishlist,
    subtotal,
    itemCount,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
