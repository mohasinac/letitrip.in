/**
 * Recommendation Service
 *
 * Product recommendation engine with:
 * - Similar products based on category, tags, and attributes
 * - Frequently bought together suggestions
 * - Personalized recommendations based on user history
 * - Trending products
 * - Recently viewed products
 *
 * Task 12.3 (January 11, 2026):
 * - Similar products algorithm
 * - Frequently bought together
 * - Collaborative filtering basics
 */

import type { ProductFE } from "@/types/frontend/product.types";
import { logServiceError } from "@letitrip/react-library";
import { apiService } from "./api.service";

// ============================================================================
// TYPES
// ============================================================================

export interface RecommendationOptions {
  limit?: number;
  excludeProductIds?: string[];
  minSimilarityScore?: number;
}

export interface SimilarProductsOptions extends RecommendationOptions {
  categoryId?: string;
  tags?: string[];
  priceRange?: number; // Percentage range (e.g., 20 for ±20%)
}

export interface FrequentlyBoughtTogetherOptions extends RecommendationOptions {
  minPurchaseCount?: number;
  minConfidence?: number; // 0-1, association confidence
}

export interface PersonalizedRecommendationOptions
  extends RecommendationOptions {
  userId: string;
  includeViewed?: boolean;
  includeWishlisted?: boolean;
  includePurchased?: boolean;
}

export interface TrendingProductsOptions extends RecommendationOptions {
  period?: "day" | "week" | "month";
  categoryId?: string;
}

export interface RecommendationScore {
  productId: string;
  score: number;
  reasons: string[];
}

// ============================================================================
// RECOMMENDATION SERVICE
// ============================================================================

class RecommendationService {
  private recentlyViewed: Map<string, number> = new Map(); // productId -> timestamp
  private readonly MAX_RECENTLY_VIEWED = 50;
  private readonly RECENTLY_VIEWED_STORAGE_KEY = "recently_viewed_products";

  constructor() {
    // Load recently viewed from localStorage
    this.loadRecentlyViewed();
  }

  /**
   * Get similar products based on category, tags, and attributes
   */
  async getSimilarProducts(
    productId: string,
    options: SimilarProductsOptions = {},
  ): Promise<ProductFE[]> {
    const {
      limit = 10,
      excludeProductIds = [],
      categoryId,
      tags,
      priceRange = 30,
    } = options;

    try {
      const params = new URLSearchParams();
      params.append("productId", productId);
      params.append("limit", limit.toString());

      if (categoryId) {
        params.append("categoryId", categoryId);
      }
      if (tags && tags.length > 0) {
        params.append("tags", tags.join(","));
      }
      if (priceRange) {
        params.append("priceRange", priceRange.toString());
      }
      if (excludeProductIds.length > 0) {
        params.append("exclude", excludeProductIds.join(","));
      }

      const response = await apiService.get<ProductFE[]>(
        `/recommendations/similar?${params.toString()}`,
      );

      return response || [];
    } catch (error) {
      logServiceError(
        "RecommendationService",
        "getSimilarProducts",
        error as Error,
      );
      return [];
    }
  }

  /**
   * Get frequently bought together products
   */
  async getFrequentlyBoughtTogether(
    productId: string,
    options: FrequentlyBoughtTogetherOptions = {},
  ): Promise<ProductFE[]> {
    const {
      limit = 5,
      excludeProductIds = [],
      minPurchaseCount = 5,
      minConfidence = 0.3,
    } = options;

    try {
      const params = new URLSearchParams();
      params.append("productId", productId);
      params.append("limit", limit.toString());
      params.append("minPurchaseCount", minPurchaseCount.toString());
      params.append("minConfidence", minConfidence.toString());

      if (excludeProductIds.length > 0) {
        params.append("exclude", excludeProductIds.join(","));
      }

      const response = await apiService.get<ProductFE[]>(
        `/recommendations/bought-together?${params.toString()}`,
      );

      return response || [];
    } catch (error) {
      logServiceError(
        "RecommendationService",
        "getFrequentlyBoughtTogether",
        error as Error,
      );
      return [];
    }
  }

  /**
   * Get personalized recommendations based on user history
   */
  async getPersonalizedRecommendations(
    options: PersonalizedRecommendationOptions,
  ): Promise<ProductFE[]> {
    const {
      userId,
      limit = 20,
      excludeProductIds = [],
      includeViewed = true,
      includeWishlisted = true,
      includePurchased = true,
    } = options;

    try {
      const params = new URLSearchParams();
      params.append("userId", userId);
      params.append("limit", limit.toString());
      params.append("includeViewed", includeViewed.toString());
      params.append("includeWishlisted", includeWishlisted.toString());
      params.append("includePurchased", includePurchased.toString());

      if (excludeProductIds.length > 0) {
        params.append("exclude", excludeProductIds.join(","));
      }

      const response = await apiService.get<ProductFE[]>(
        `/recommendations/personalized?${params.toString()}`,
      );

      return response || [];
    } catch (error) {
      logServiceError(
        "RecommendationService",
        "getPersonalizedRecommendations",
        error as Error,
      );
      return [];
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(
    options: TrendingProductsOptions = {},
  ): Promise<ProductFE[]> {
    const {
      limit = 20,
      period = "week",
      categoryId,
      excludeProductIds = [],
    } = options;

    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("period", period);

      if (categoryId) {
        params.append("categoryId", categoryId);
      }
      if (excludeProductIds.length > 0) {
        params.append("exclude", excludeProductIds.join(","));
      }

      const response = await apiService.get<ProductFE[]>(
        `/recommendations/trending?${params.toString()}`,
      );

      return response || [];
    } catch (error) {
      logServiceError(
        "RecommendationService",
        "getTrendingProducts",
        error as Error,
      );
      return [];
    }
  }

  /**
   * Get recently viewed products
   */
  getRecentlyViewedProducts(limit: number = 10): string[] {
    // Sort by timestamp (most recent first)
    const sorted = Array.from(this.recentlyViewed.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId);

    return sorted;
  }

  /**
   * Add product to recently viewed
   */
  addToRecentlyViewed(productId: string): void {
    this.recentlyViewed.set(productId, Date.now());

    // Limit size
    if (this.recentlyViewed.size > this.MAX_RECENTLY_VIEWED) {
      // Remove oldest entry
      const oldest = Array.from(this.recentlyViewed.entries()).sort(
        (a, b) => a[1] - b[1],
      )[0];
      this.recentlyViewed.delete(oldest[0]);
    }

    this.saveRecentlyViewed();
  }

  /**
   * Clear recently viewed history
   */
  clearRecentlyViewed(): void {
    this.recentlyViewed.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.RECENTLY_VIEWED_STORAGE_KEY);
    }
  }

  /**
   * Get recommendations for home page
   * Combines trending, personalized, and category-based recommendations
   */
  async getHomePageRecommendations(userId?: string): Promise<{
    trending: ProductFE[];
    forYou: ProductFE[];
    newArrivals: ProductFE[];
  }> {
    try {
      const [trending, forYou, newArrivals] = await Promise.all([
        this.getTrendingProducts({ limit: 10 }),
        userId
          ? this.getPersonalizedRecommendations({ userId, limit: 10 })
          : this.getTrendingProducts({ limit: 10, period: "day" }),
        apiService.get<ProductFE[]>(
          "/products?sort=createdAt&order=desc&limit=10",
        ),
      ]);

      return {
        trending: trending || [],
        forYou: forYou || [],
        newArrivals: newArrivals || [],
      };
    } catch (error) {
      logServiceError(
        "RecommendationService",
        "getHomePageRecommendations",
        error as Error,
      );
      return {
        trending: [],
        forYou: [],
        newArrivals: [],
      };
    }
  }

  /**
   * Get complete bundle recommendations for a product
   * Includes similar products and frequently bought together
   */
  async getCompleteProductRecommendations(
    productId: string,
    userId?: string,
  ): Promise<{
    similar: ProductFE[];
    boughtTogether: ProductFE[];
    fromSameSeller: ProductFE[];
  }> {
    try {
      const [similar, boughtTogether, fromSameSeller] = await Promise.all([
        this.getSimilarProducts(productId, { limit: 8 }),
        this.getFrequentlyBoughtTogether(productId, { limit: 4 }),
        apiService.get<ProductFE[]>(
          `/products/${productId}/same-seller?limit=6`,
        ),
      ]);

      return {
        similar: similar || [],
        boughtTogether: boughtTogether || [],
        fromSameSeller: fromSameSeller || [],
      };
    } catch (error) {
      logServiceError(
        "RecommendationService",
        "getCompleteProductRecommendations",
        error as Error,
      );
      return {
        similar: [],
        boughtTogether: [],
        fromSameSeller: [],
      };
    }
  }

  /**
   * Calculate similarity score between two products (client-side fallback)
   * Used when server-side recommendations are unavailable
   */
  calculateSimilarityScore(product1: ProductFE, product2: ProductFE): number {
    let score = 0;

    // Category match (40% weight)
    if (product1.categoryId === product2.categoryId) {
      score += 0.4;
    }

    // Price similarity (20% weight)
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceScore = Math.max(0, 1 - priceDiff / avgPrice);
    score += priceScore * 0.2;

    // Tag overlap (30% weight)
    if (product1.tags && product2.tags) {
      const tags1 = new Set(product1.tags);
      const tags2 = new Set(product2.tags);
      const intersection = new Set([...tags1].filter((x) => tags2.has(x)));
      const union = new Set([...tags1, ...tags2]);
      const tagScore = intersection.size / union.size;
      score += tagScore * 0.3;
    }

    // Same seller (10% weight)
    if (product1.shopId === product2.shopId) {
      score += 0.1;
    }

    return score;
  }

  /**
   * Client-side similar products (fallback when API unavailable)
   */
  findSimilarProductsLocally(
    targetProduct: ProductFE,
    allProducts: ProductFE[],
    options: SimilarProductsOptions = {},
  ): ProductFE[] {
    const { limit = 10, excludeProductIds = [] } = options;

    const scores: RecommendationScore[] = allProducts
      .filter(
        (p) => p.id !== targetProduct.id && !excludeProductIds.includes(p.id),
      )
      .map((product) => ({
        productId: product.id,
        score: this.calculateSimilarityScore(targetProduct, product),
        reasons: this.getSimilarityReasons(targetProduct, product),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Map back to products
    return scores
      .map((s) => allProducts.find((p) => p.id === s.productId))
      .filter((p): p is ProductFE => p !== undefined);
  }

  /**
   * Get reasons why products are similar
   */
  private getSimilarityReasons(
    product1: ProductFE,
    product2: ProductFE,
  ): string[] {
    const reasons: string[] = [];

    if (product1.categoryId === product2.categoryId) {
      reasons.push("Same category");
    }

    if (product1.shopId === product2.shopId) {
      reasons.push("Same seller");
    }

    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    if (priceDiff / avgPrice < 0.2) {
      reasons.push("Similar price");
    }

    if (product1.tags && product2.tags) {
      const commonTags = product1.tags.filter((tag) =>
        product2.tags?.includes(tag),
      );
      if (commonTags.length > 0) {
        reasons.push(`Common tags: ${commonTags.slice(0, 2).join(", ")}`);
      }
    }

    return reasons;
  }

  /**
   * Load recently viewed from localStorage
   */
  private loadRecentlyViewed(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.RECENTLY_VIEWED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.recentlyViewed = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
      this.recentlyViewed = new Map();
    }
  }

  /**
   * Save recently viewed to localStorage
   */
  private saveRecentlyViewed(): void {
    if (typeof window === "undefined") return;

    try {
      const obj = Object.fromEntries(this.recentlyViewed);
      localStorage.setItem(
        this.RECENTLY_VIEWED_STORAGE_KEY,
        JSON.stringify(obj),
      );
    } catch (error) {
      console.error("Failed to save recently viewed:", error);
    }
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
