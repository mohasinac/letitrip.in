/**
 * Example Usage of New API Architecture
 *
 * This file demonstrates how to use the new API services
 * in your components and contexts.
 */

// ============================================
// 1. CART OPERATIONS
// ============================================

import { CartService } from "@/lib/api/services/cart.service";
import { useCart } from "@/contexts/CartContext";

// Example: Add to Cart Button Component
export function AddToCartButton({ product }: { product: any }) {
  const { addItem } = useCart(); // Context handles API calls internally

  const handleAddToCart = () => {
    // Context's addItem will call CartService.addItem internally
    addItem(product, 1);
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}

// Example: Direct Service Usage (Advanced)
export async function directCartOperations() {
  try {
    // Get cart
    const cart = await CartService.getCart();
    console.log("Cart items:", cart.items);

    // Add item
    const newCart = await CartService.addItem({
      id: "cart_123",
      productId: "prod_456",
      name: "Product Name",
      price: 1000,
      quantity: 1,
      stock: 10,
      sellerId: "seller_123",
      sellerName: "Seller Name",
      image: "/images/product.jpg",
    });
    console.log("Cart after adding:", newCart);

    // Sync cart (update prices & availability)
    const syncResult = await CartService.syncCart();
    if (syncResult.changes.length > 0) {
      console.log("Cart changes:", syncResult.changes);
    }

    // Clear cart
    await CartService.clearCart();
    console.log("Cart cleared");
  } catch (error) {
    console.error("Cart operation failed:", error);
  }
}

// ============================================
// 2. WISHLIST OPERATIONS
// ============================================

import { WishlistService } from "@/lib/api/services/wishlist.service";
import { useWishlist } from "@/contexts/WishlistContext";

// Example: Add to Wishlist Button Component
export function AddToWishlistButton({ product }: { product: any }) {
  const { addItem, isInWishlist } = useWishlist(); // Context handles API

  const inWishlist = isInWishlist(product.id);

  const handleAddToWishlist = () => {
    // Context's addItem will call WishlistService.addItem internally
    addItem(product);
  };

  return (
    <button onClick={handleAddToWishlist} disabled={inWishlist}>
      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
    </button>
  );
}

// Example: Direct Service Usage (Advanced)
export async function directWishlistOperations() {
  try {
    // Get wishlist
    const wishlist = await WishlistService.getWishlist();
    console.log("Wishlist items:", wishlist.items);

    // Add item
    const newWishlist = await WishlistService.addItem({
      id: "wish_123",
      productId: "prod_456",
      name: "Product Name",
      price: 1000,
      image: "/images/product.jpg",
      addedAt: new Date().toISOString(),
    });
    console.log("Wishlist after adding:", newWishlist);

    // Check if product is in wishlist
    const exists = await WishlistService.isInWishlist("prod_456");
    console.log("In wishlist:", exists);

    // Remove item
    await WishlistService.removeItem("wish_123");
    console.log("Item removed");

    // Clear wishlist
    await WishlistService.clearWishlist();
    console.log("Wishlist cleared");
  } catch (error) {
    console.error("Wishlist operation failed:", error);
  }
}

// ============================================
// 3. USING API CLIENT DIRECTLY
// ============================================

import { apiClient } from "@/lib/api/client";

// Example: Custom API Call
export async function customApiCall() {
  try {
    // GET request (with caching)
    const products = await apiClient.get("/api/products", {
      category: "electronics",
      limit: 20,
    });

    // POST request (invalidates cache)
    const result = await apiClient.post("/api/custom-endpoint", {
      data: "some data",
    });

    // PUT request
    const updated = await apiClient.put("/api/resource/123", {
      field: "updated value",
    });

    // DELETE request
    await apiClient.delete("/api/resource/123");

    // Upload file
    const formData = new FormData();
    formData.append("file", fileBlob);
    const uploadResult = await apiClient.upload("/api/upload", formData);

    // Skip cache for specific request
    const freshData = await apiClient.get("/api/data", {}, { skipCache: true });
  } catch (error) {
    console.error("API call failed:", error);
  }
}

// ============================================
// 4. ERROR HANDLING PATTERNS
// ============================================

import toast from "react-hot-toast";

// Example: With User Feedback
export async function operationWithFeedback() {
  try {
    const result = await CartService.addItem(item);
    toast.success("Item added to cart");
    return result;
  } catch (error: any) {
    if (error.response?.status === 401) {
      toast.error("Please login to add items to cart");
    } else if (error.response?.status === 400) {
      toast.error(error.response.data.error || "Invalid request");
    } else {
      toast.error("Failed to add item to cart");
    }
    throw error;
  }
}

// Example: With Fallback
export async function operationWithFallback() {
  try {
    // Try API first
    return await CartService.getCart();
  } catch (error) {
    console.error("API failed, using fallback:", error);
    // Fallback to localStorage
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    return { items, subtotal: 0, itemCount: items.length };
  }
}

// ============================================
// 5. CONTEXT USAGE (Recommended)
// ============================================

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

export function ShoppingComponents() {
  const cart = useCart();
  const wishlist = useWishlist();

  return (
    <div>
      {/* Cart Info */}
      <div>
        Cart Items: {cart.itemCount}
        Subtotal: ₹{cart.subtotal}
      </div>

      {/* Wishlist Info */}
      <div>Wishlist Items: {wishlist.itemCount}</div>

      {/* Cart Actions */}
      <button onClick={() => cart.addItem(product, 1)}>Add to Cart</button>
      <button onClick={() => cart.removeItem(itemId)}>Remove from Cart</button>
      <button onClick={() => cart.clearCart()}>Clear Cart</button>

      {/* Wishlist Actions */}
      <button onClick={() => wishlist.addItem(product)}>Add to Wishlist</button>
      <button onClick={() => wishlist.removeItem(itemId)}>
        Remove from Wishlist
      </button>
      <button onClick={() => wishlist.moveToCart(itemId)}>Move to Cart</button>
    </div>
  );
}

// ============================================
// 6. ADVANCED: CACHE MANAGEMENT
// ============================================

import { apiClient } from "@/lib/api/client";

export function CacheManagement() {
  // Clear all cache
  const clearAllCache = () => {
    apiClient.clearCache();
    console.log("Cache cleared");
  };

  // Force refresh data (skip cache)
  const forceRefresh = async () => {
    const freshData = await apiClient.get(
      "/api/products",
      {},
      { skipCache: true }
    );
    console.log("Fresh data:", freshData);
  };

  return (
    <div>
      <button onClick={clearAllCache}>Clear Cache</button>
      <button onClick={forceRefresh}>Force Refresh</button>
    </div>
  );
}

// ============================================
// 7. TESTING EXAMPLE
// ============================================

// Example: Jest/Vitest test
describe("Cart Service", () => {
  it("should add item to cart", async () => {
    const item = {
      id: "cart_123",
      productId: "prod_456",
      name: "Test Product",
      price: 1000,
      quantity: 1,
      stock: 10,
      sellerId: "seller_123",
      sellerName: "Test Seller",
      image: "/test.jpg",
    };

    const result = await CartService.addItem(item);

    expect(result).toBeDefined();
    expect(result.items).toContain(item);
  });
});

export default {
  // Export all examples for easy access
  AddToCartButton,
  AddToWishlistButton,
  directCartOperations,
  directWishlistOperations,
  customApiCall,
  operationWithFeedback,
  operationWithFallback,
  ShoppingComponents,
  CacheManagement,
};
