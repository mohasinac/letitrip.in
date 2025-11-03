"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/utils/product";
import { useAuth } from "@/contexts/AuthContext";
import { WishlistService } from "@/lib/api/services/wishlist.service";

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
  const { user } = useAuth();

  // Load wishlist on mount and when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);

        if (user) {
          // Logged-in user: load from database using API service
          const wishlistData = await WishlistService.getWishlist();
          setItems(wishlistData.items || []);
        } else {
          // Guest: load from localStorage
          const savedWishlist = localStorage.getItem("wishlist");
          if (savedWishlist) {
            const parsed = JSON.parse(savedWishlist);
            setItems(parsed);
          }
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
        // If API fails for logged-in user, fall back to localStorage
        if (user) {
          try {
            const savedWishlist = localStorage.getItem("wishlist");
            if (savedWishlist) {
              const parsed = JSON.parse(savedWishlist);
              setItems(parsed);
            }
          } catch (e) {
            console.error("Failed to load wishlist from localStorage:", e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  // Save wishlist to localStorage or API whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveWishlist = async () => {
        try {
          // Always save to localStorage for quick access
          localStorage.setItem("wishlist", JSON.stringify(items));

          // If user is logged in, also sync to database
          if (user) {
            // Note: The API will be called when adding/removing items
            // This is just for localStorage backup
          }
        } catch (error) {
          console.error("Failed to save wishlist to localStorage:", error);
        }
      };

      saveWishlist();
    }
  }, [items, isLoading, user]);

  const addItem = async (product: any) => {
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
      image: getProductImageUrl(product, 0, ""),
      price: product.price,
      slug: product.slug,
      addedAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setItems([...items, newItem]);
    toast.success("Added to wishlist");

    // Sync with API if user is logged in
    if (user) {
      try {
        await WishlistService.addItem(newItem);
      } catch (error) {
        console.error("Failed to sync wishlist with API:", error);
        // UI is already updated, so no need to revert
      }
    }
  };

  const removeItem = async (itemId: string) => {
    // Optimistically update UI
    setItems(items.filter((item) => item.id !== itemId));
    toast.success("Removed from wishlist");

    // Sync with API if user is logged in
    if (user) {
      try {
        await WishlistService.removeItem(itemId);
      } catch (error) {
        console.error("Failed to sync wishlist removal with API:", error);
        // UI is already updated, so no need to revert
      }
    }
  };

  const clearWishlist = async () => {
    // Optimistically update UI
    setItems([]);
    toast.success("Wishlist cleared");

    // Sync with API if user is logged in
    if (user) {
      try {
        await WishlistService.clearWishlist();
      } catch (error) {
        console.error("Failed to sync wishlist clear with API:", error);
        // UI is already updated, so no need to revert
      }
    }
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
