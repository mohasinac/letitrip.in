/**
 * Fallback Data Tests
 *
 * Tests for the fallback data system and utilities
 */

import {
  ENABLE_FALLBACK,
  FALLBACK_AUCTIONS,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_SHOPS,
  fetchWithFallback,
  getPaginatedFallback,
} from "@/lib/fallback-data";

describe("Fallback Data Constants", () => {
  describe("FALLBACK_PRODUCTS", () => {
    it("should have at least 5 products", () => {
      expect(FALLBACK_PRODUCTS.length).toBeGreaterThanOrEqual(5);
    });

    it("should have valid product structure", () => {
      const product = FALLBACK_PRODUCTS[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("slug");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("images");
      expect(product).toHaveProperty("rating");
      expect(product).toHaveProperty("stock");
      expect(product).toHaveProperty("status");
    });

    it("should have valid price values", () => {
      FALLBACK_PRODUCTS.forEach((product) => {
        expect(product.price).toBeGreaterThan(0);
        if (product.comparePrice) {
          expect(product.comparePrice).toBeGreaterThan(product.price);
        }
      });
    });

    it("should have valid ratings", () => {
      FALLBACK_PRODUCTS.forEach((product) => {
        expect(product.rating).toBeGreaterThanOrEqual(0);
        expect(product.rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe("FALLBACK_AUCTIONS", () => {
    it("should have valid auction structure", () => {
      expect(FALLBACK_AUCTIONS.length).toBeGreaterThan(0);
      const auction = FALLBACK_AUCTIONS[0];
      expect(auction).toHaveProperty("id");
      expect(auction).toHaveProperty("title");
      expect(auction).toHaveProperty("slug");
      expect(auction).toHaveProperty("startingBid");
      expect(auction).toHaveProperty("currentBid");
      expect(auction).toHaveProperty("endTime");
      expect(auction).toHaveProperty("status");
    });

    it("should have current bid >= starting bid", () => {
      FALLBACK_AUCTIONS.forEach((auction) => {
        expect(auction.currentBid).toBeGreaterThanOrEqual(auction.startingBid);
      });
    });
  });

  describe("FALLBACK_SHOPS", () => {
    it("should have valid shop structure", () => {
      expect(FALLBACK_SHOPS.length).toBeGreaterThan(0);
      const shop = FALLBACK_SHOPS[0];
      expect(shop).toHaveProperty("id");
      expect(shop).toHaveProperty("name");
      expect(shop).toHaveProperty("slug");
      expect(shop).toHaveProperty("rating");
      expect(shop).toHaveProperty("verified");
    });
  });

  describe("FALLBACK_CATEGORIES", () => {
    it("should have valid category structure", () => {
      expect(FALLBACK_CATEGORIES.length).toBeGreaterThan(0);
      const category = FALLBACK_CATEGORIES[0];
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("slug");
    });
  });
});

describe("fetchWithFallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return data from successful fetch", async () => {
    const mockData = { result: "success" };
    const fetchFn = jest.fn().mockResolvedValue(mockData);
    const fallback = { result: "fallback" };

    const result = await fetchWithFallback(fetchFn, fallback);

    expect(result).toEqual(mockData);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("should return fallback on empty array when enabled", async () => {
    const fetchFn = jest.fn().mockResolvedValue([]);
    const fallback = FALLBACK_PRODUCTS;

    const result = await fetchWithFallback(fetchFn, fallback);

    expect(result).toEqual(fallback);
  });

  it("should return fallback on null when enabled", async () => {
    const fetchFn = jest.fn().mockResolvedValue(null);
    const fallback = FALLBACK_PRODUCTS;

    const result = await fetchWithFallback(fetchFn, fallback);

    expect(result).toEqual(fallback);
  });

  it("should return fallback on error when enabled", async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error("API Error"));
    const fallback = FALLBACK_PRODUCTS;

    const result = await fetchWithFallback(fetchFn, fallback);

    expect(result).toEqual(fallback);
  });
});

describe("getPaginatedFallback", () => {
  it("should return first page correctly", () => {
    const result = getPaginatedFallback(FALLBACK_PRODUCTS, 1, 2);

    expect(result.data.length).toBe(2);
    expect(result.data[0]).toEqual(FALLBACK_PRODUCTS[0]);
    expect(result.data[1]).toEqual(FALLBACK_PRODUCTS[1]);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe("page-2");
  });

  it("should return second page correctly", () => {
    const result = getPaginatedFallback(FALLBACK_PRODUCTS, 2, 2);

    expect(result.data.length).toBe(2);
    expect(result.data[0]).toEqual(FALLBACK_PRODUCTS[2]);
    expect(result.data[1]).toEqual(FALLBACK_PRODUCTS[3]);
  });

  it("should return last page with no more data", () => {
    const totalItems = FALLBACK_PRODUCTS.length;
    const lastPage = Math.ceil(totalItems / 2);
    const result = getPaginatedFallback(FALLBACK_PRODUCTS, lastPage, 2);

    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBe(null);
  });

  it("should handle empty array", () => {
    const result = getPaginatedFallback([], 1, 10);

    expect(result.data).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBe(null);
  });
});

describe("ENABLE_FALLBACK flag", () => {
  it("should be enabled by default", () => {
    expect(ENABLE_FALLBACK).toBe(true);
  });
});
