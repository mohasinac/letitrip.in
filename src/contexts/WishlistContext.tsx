"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  slug?: string;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: any) => void;
  removeItem: (itemId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (itemId: string) => void;
  itemCount: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("wishlist", JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save wishlist to localStorage:", error);
      }
    }
  }, [items, isLoading]);

  const addItem = (product: any) => {
    if (!product || !product.id) {
      toast.error("Invalid product");
      return;
    }

    // Check if item already exists in wishlist
    const exists = items.some((item) => item.productId === product.id);

    if (exists) {
      toast("Already in wishlist", { icon: "ℹ️" });
      return;
    }

    const newItem: WishlistItem = {
      id: `wish_${Date.now()}`,
      productId: product.id,
      name: product.name || product.title,
      image: product.images?.[0] || product.image || "",
      price: product.price,
      slug: product.slug,
      addedAt: new Date().toISOString(),
    };

    setItems([...items, newItem]);
    toast.success("Added to wishlist");
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    toast.success("Removed from wishlist");
  };

  const clearWishlist = () => {
    setItems([]);
    toast.success("Wishlist cleared");
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.productId === productId);
  };

  const moveToCart = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Get cart from localStorage
    try {
      const savedCart = localStorage.getItem("shopping_cart");
      const cart = savedCart ? JSON.parse(savedCart) : [];

      // Check if already in cart
      const existsInCart = cart.some(
        (c: any) => c.productId === item.productId
      );

      if (!existsInCart) {
        // Add to cart
        cart.push({
          id: `cart_${Date.now()}`,
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: 1,
          stock: 999, // Default stock, will be updated when fetching product details
          sellerId: "",
          sellerName: "Unknown Seller",
          slug: item.slug,
        });
        localStorage.setItem("shopping_cart", JSON.stringify(cart));
        toast.success("Moved to cart");

        // Trigger a storage event to update CartContext
        window.dispatchEvent(new Event("storage"));
      } else {
        toast("Already in cart", { icon: "ℹ️" });
      }

      // Remove from wishlist
      removeItem(itemId);
    } catch (error) {
      console.error("Failed to move to cart:", error);
      toast.error("Failed to move to cart");
    }
  };

  const itemCount = items.length;

  const value: WishlistContextType = {
    items,
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist,
    moveToCart,
    itemCount,
    isLoading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
