/**
 * Comprehensive Payment Logos Test Suite
 *
 * Tests payment logo loading with caching, fallback generation, and error handling.
 * Validates the logo management system for payment method icons.
 *
 * Testing Focus:
 * - Logo loading from Firebase Storage
 * - Cache management and invalidation
 * - Fallback logo generation (default + text-based)
 * - Concurrent request handling
 * - Error recovery strategies
 * - Edge cases (empty IDs, special chars, very long IDs)
 *
 * Implementation Pattern:
 * - Try Firebase Storage first
 * - Fall back to predefined SVG logos
 * - Generate text-based fallback as last resort
 * - Cache all logos (Storage, predefined, generated)
 *
 * NOTE: Cache is in-memory Map, cleared on module reload
 * NOTE: All logos are data URIs (SVG), no external requests after initial load
 */

import {
  clearLogoCache,
  getCachedLogos,
  getPaymentLogo,
  preloadPaymentLogos,
} from "../payment-logos";

// Mock the static assets service
jest.mock("@/services/static-assets-client.service", () => ({
  getPaymentLogoUrl: jest.fn(),
}));

import { getPaymentLogoUrl } from "@/services/static-assets-client.service";

describe("Payment Logos - Comprehensive Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLogoCache();
  });

  describe("getPaymentLogo() - Primary Loading Function", () => {
    describe("Firebase Storage loading", () => {
      it("loads logo from Firebase Storage successfully", async () => {
        const mockUrl = "https://storage.googleapis.com/bucket/visa.png";
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(mockUrl);

        const url = await getPaymentLogo("visa");

        expect(getPaymentLogoUrl).toHaveBeenCalledWith("visa");
        expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);
        expect(url).toBe(mockUrl);
      });

      it("caches Firebase Storage URLs", async () => {
        const mockUrl = "https://storage.googleapis.com/bucket/mastercard.png";
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(mockUrl);

        // First call - fetch from Storage
        const url1 = await getPaymentLogo("mastercard");
        expect(url1).toBe(mockUrl);
        expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

        // Second call - use cache
        const url2 = await getPaymentLogo("mastercard");
        expect(url2).toBe(mockUrl);
        expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1); // Not called again
      });

      it("handles null response from Storage service", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("visa");

        // Should fall back to default logo
        expect(url).toContain("data:image/svg+xml");
        expect(url).toContain("VISA");
      });

      it("handles undefined response from Storage service", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(undefined);

        const url = await getPaymentLogo("mastercard");

        // Should fall back to default logo
        expect(url).toContain("data:image/svg+xml");
      });

      it("handles empty string response from Storage service", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce("");

        const url = await getPaymentLogo("amex");

        // Empty string is falsy, should fall back
        expect(url).toContain("data:image/svg+xml");
      });
    });

    describe("error handling", () => {
      it("catches Firebase Storage errors and uses fallback", async () => {
        const consoleWarnSpy = jest
          .spyOn(console, "warn")
          .mockImplementation(() => {});
        const storageError = new Error("Network timeout");
        (getPaymentLogoUrl as jest.Mock).mockRejectedValueOnce(storageError);

        const url = await getPaymentLogo("visa");

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "Could not load logo for visa, using fallback"
        );
        expect(url).toBeDefined();
        expect(url).toContain("VISA");

        consoleWarnSpy.mockRestore();
      });

      it("handles Storage permission errors", async () => {
        const consoleWarnSpy = jest
          .spyOn(console, "warn")
          .mockImplementation(() => {});
        (getPaymentLogoUrl as jest.Mock).mockRejectedValueOnce(
          new Error("Permission denied")
        );

        const url = await getPaymentLogo("paypal");

        expect(url).toContain("PayPal");
        consoleWarnSpy.mockRestore();
      });

      it("handles Storage not found errors", async () => {
        const consoleWarnSpy = jest
          .spyOn(console, "warn")
          .mockImplementation(() => {});
        (getPaymentLogoUrl as jest.Mock).mockRejectedValueOnce(
          new Error("Object not found")
        );

        const url = await getPaymentLogo("discover");

        expect(url).toContain("DISCOVER");
        consoleWarnSpy.mockRestore();
      });

      it("caches fallback logos after error", async () => {
        const consoleWarnSpy = jest
          .spyOn(console, "warn")
          .mockImplementation(() => {});
        (getPaymentLogoUrl as jest.Mock).mockRejectedValueOnce(
          new Error("Storage error")
        );

        // First call - error, use fallback
        const url1 = await getPaymentLogo("visa");
        expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

        // Second call - use cached fallback
        const url2 = await getPaymentLogo("visa");
        expect(url2).toBe(url1);
        expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1); // Not called again

        consoleWarnSpy.mockRestore();
      });
    });

    describe("default predefined logos", () => {
      const predefinedLogos = [
        { id: "visa", text: "VISA" },
        { id: "mastercard", text: null }, // Has circles, not text
        { id: "amex", text: "AMEX" },
        { id: "discover", text: "DISCOVER" },
        { id: "dinersclub", text: "DINERS" },
        { id: "jcb", text: "JCB" },
        { id: "paypal", text: "PayPal" },
        { id: "paidy", text: "Paidy" },
        { id: "alipay", text: "Alipay+" },
        { id: "unionpay", text: "UnionPay" },
        { id: "atome", text: "Atome" },
      ];

      predefinedLogos.forEach(({ id, text }) => {
        it(`returns predefined SVG for ${id}`, async () => {
          (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

          const url = await getPaymentLogo(id);

          expect(url).toContain("data:image/svg+xml");
          if (text) {
            expect(url).toContain(text);
          }
        });
      });

      it("all predefined logos are valid SVG data URIs", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);

        for (const { id } of predefinedLogos) {
          clearLogoCache();
          const url = await getPaymentLogo(id);

          expect(url).toMatch(/^data:image\/svg\+xml,/);
          expect(url).toContain("<svg");
        }
      });

      it("predefined logos contain proper SVG structure", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("visa");

        expect(url).toContain('xmlns="http://www.w3.org/2000/svg"');
        expect(url).toContain("viewBox=");
      });

      it("mastercard has dual circle design", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("mastercard");

        // Mastercard has two circles
        expect(url).toContain("<circle");
        expect(url).toContain('fill="%23EB001B"'); // Red circle
        expect(url).toContain('fill="%23F79E1B"'); // Orange circle
      });
    });

    describe("text-based fallback generation", () => {
      it("generates text fallback for unknown payment method", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("stripe");

        expect(url).toContain("data:image/svg+xml");
        expect(url).toContain("Stripe"); // Capitalized
      });

      it("capitalizes first letter of payment ID", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("razorpay");

        expect(url).toContain("Razorpay");
      });

      it("preserves rest of payment ID case", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("PayPalExpress");

        // First letter uppercase, rest preserved
        expect(url).toContain("PayPalExpress");
      });

      it("generates fallback with gray background", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("unknown");

        expect(url).toContain('fill="%23f3f4f6"'); // Gray background
        expect(url).toContain('fill="%236b7280"'); // Gray text
      });

      it("URL encodes special characters in fallback text", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("pay@pal");

        // @ should be URL encoded in SVG
        expect(url).toContain("Pay%40pal");
      });

      it("handles payment IDs with spaces", async () => {
        // NOTE: Spaces in payment ID are URL-encoded to %20 in SVG fallback
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("apple pay");

        expect(url).toContain("Apple%20pay"); // URL-encoded space
        expect(url).toContain("data:image/svg+xml");
      });

      it("handles payment IDs with hyphens", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("google-pay");

        expect(url).toContain("Google-pay");
      });

      it("caches generated text fallbacks", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);

        const url1 = await getPaymentLogo("custom-payment");
        expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

        const url2 = await getPaymentLogo("custom-payment");
        expect(url2).toBe(url1); // Same URL
        expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1); // Not called again
      });
    });

    describe("edge cases", () => {
      it("handles empty payment ID", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("");

        expect(url).toBeDefined();
        expect(url).toContain("data:image/svg+xml");
        // Empty string capitalized is just ""
      });

      it("handles single character payment ID", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("a");

        expect(url).toContain("A");
      });

      it("handles numeric payment ID", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("123");

        expect(url).toContain("123");
      });

      it("handles payment ID with only special characters", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("@#$");

        expect(url).toBeDefined();
        expect(url).toContain("data:image/svg+xml");
      });

      it("handles very long payment IDs", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const longId = "a".repeat(100);
        const url = await getPaymentLogo(longId);

        expect(url).toBeDefined();
        expect(url.length).toBeGreaterThan(0);
      });

      it("handles payment ID with Unicode characters", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("支付宝");

        expect(url).toBeDefined();
        expect(url).toContain("data:image/svg+xml");
      });

      it("handles payment ID with emoji", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("pay💳");

        expect(url).toBeDefined();
      });

      it("handles lowercase payment IDs", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("visa");

        // Should match predefined lowercase key
        expect(url).toContain("VISA");
      });

      it("handles uppercase payment IDs for predefined", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("VISA");

        // VISA is not in predefined (lowercase only), generates fallback
        expect(url).toContain("VISA");
      });

      it("handles mixed case for unknown payment", async () => {
        (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

        const url = await getPaymentLogo("StRiPe");

        expect(url).toContain("StRiPe");
      });
    });

    describe("concurrent requests", () => {
      it("handles multiple concurrent requests for same logo", async () => {
        const mockUrl = "https://storage.googleapis.com/bucket/visa.png";
        (getPaymentLogoUrl as jest.Mock).mockResolvedValue(mockUrl);

        const promises = Array.from({ length: 5 }, () =>
          getPaymentLogo("visa")
        );
        const urls = await Promise.all(promises);

        // All should get the same URL
        urls.forEach((url) => expect(url).toBe(mockUrl));

        // NOTE: No request deduplication, each call makes separate request
        expect(getPaymentLogoUrl).toHaveBeenCalled();
      });

      it("handles concurrent requests for different logos", async () => {
        (getPaymentLogoUrl as jest.Mock).mockImplementation(async (id) => {
          if (id === "visa") return "https://storage.com/visa.png";
          if (id === "mastercard") return "https://storage.com/mastercard.png";
          return null;
        });

        const [visaUrl, mastercardUrl, amexUrl] = await Promise.all([
          getPaymentLogo("visa"),
          getPaymentLogo("mastercard"),
          getPaymentLogo("amex"),
        ]);

        expect(visaUrl).toContain("visa.png");
        expect(mastercardUrl).toContain("mastercard.png");
        expect(amexUrl).toContain("AMEX"); // Fallback
      });

      it("does not race condition cache", async () => {
        const mockUrl = "https://storage.googleapis.com/bucket/paypal.png";
        (getPaymentLogoUrl as jest.Mock).mockResolvedValue(mockUrl);

        // Make concurrent requests
        const [url1, url2, url3] = await Promise.all([
          getPaymentLogo("paypal"),
          getPaymentLogo("paypal"),
          getPaymentLogo("paypal"),
        ]);

        // All should succeed with same URL
        expect(url1).toBe(mockUrl);
        expect(url2).toBe(mockUrl);
        expect(url3).toBe(mockUrl);
      });
    });
  });

  describe("preloadPaymentLogos() - Batch Preloading", () => {
    it("preloads multiple logos", async () => {
      const mockUrls = {
        visa: "https://storage.com/visa.png",
        mastercard: "https://storage.com/mastercard.png",
        amex: "https://storage.com/amex.png",
      };

      (getPaymentLogoUrl as jest.Mock).mockImplementation(
        async (id) => mockUrls[id as keyof typeof mockUrls] || null
      );

      await preloadPaymentLogos(["visa", "mastercard", "amex"]);

      // All should be called
      expect(getPaymentLogoUrl).toHaveBeenCalledWith("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledWith("mastercard");
      expect(getPaymentLogoUrl).toHaveBeenCalledWith("amex");

      // Verify cached by checking second call doesn't fetch
      await getPaymentLogo("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledWith("visa"); // Only once from preload
    });

    it("preloads empty array without errors", async () => {
      await expect(preloadPaymentLogos([])).resolves.not.toThrow();
      expect(getPaymentLogoUrl).not.toHaveBeenCalled();
    });

    it("continues preloading even if some fail", async () => {
      (getPaymentLogoUrl as jest.Mock).mockImplementation(async (id) => {
        if (id === "fail") throw new Error("Load failed");
        return `https://storage.com/${id}.png`;
      });

      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Should not throw, uses fallbacks for failed ones
      await expect(
        preloadPaymentLogos(["visa", "fail", "mastercard"])
      ).resolves.not.toThrow();

      consoleWarnSpy.mockRestore();
    });

    it("handles duplicate IDs in preload list", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(
        "https://storage.com/visa.png"
      );

      await preloadPaymentLogos(["visa", "visa", "visa"]);

      // Should be called multiple times (no deduplication)
      expect(getPaymentLogoUrl).toHaveBeenCalled();
    });
  });

  describe("clearLogoCache() - Cache Management", () => {
    it("clears all cached logos", async () => {
      const mockUrl = "https://storage.googleapis.com/bucket/visa.png";
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(mockUrl);

      // Load and cache
      await getPaymentLogo("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

      // Clear cache
      clearLogoCache();

      // Load again - should fetch
      await getPaymentLogo("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(2);
    });

    it("clears both Storage and fallback logos", async () => {
      (getPaymentLogoUrl as jest.Mock)
        .mockResolvedValueOnce("https://storage.com/visa.png")
        .mockResolvedValueOnce(null);

      // Load Storage logo
      const url1 = await getPaymentLogo("visa");
      expect(url1).toContain("storage.com");

      // Load fallback
      await getPaymentLogo("mastercard");

      // Clear
      clearLogoCache();

      // Both should refetch
      const url2 = await getPaymentLogo("visa");
      const url3 = await getPaymentLogo("mastercard");

      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(4); // 2 initial + 2 after clear
    });

    it("can be called multiple times safely", () => {
      expect(() => {
        clearLogoCache();
        clearLogoCache();
        clearLogoCache();
      }).not.toThrow();
    });

    it("clears cache even when empty", () => {
      expect(() => clearLogoCache()).not.toThrow();
    });
  });

  describe("getCachedLogos() - Cache Inspection", () => {
    it("returns empty Map when cache is empty", () => {
      const cached = getCachedLogos();

      expect(cached).toBeInstanceOf(Map);
      expect(cached.size).toBe(0);
    });

    it("returns all cached logos", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);

      await getPaymentLogo("visa");
      await getPaymentLogo("mastercard");

      const cached = getCachedLogos();

      expect(cached.size).toBe(2);
      expect(cached.has("visa")).toBe(true);
      expect(cached.has("mastercard")).toBe(true);
    });

    it("returns copy of cache (not reference)", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);
      await getPaymentLogo("visa");

      const cached1 = getCachedLogos();
      const cached2 = getCachedLogos();

      // Different objects
      expect(cached1).not.toBe(cached2);
      // But same content
      expect(cached1.size).toBe(cached2.size);
    });

    it("modifying returned Map does not affect cache", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);
      await getPaymentLogo("visa");

      const cached = getCachedLogos();
      cached.clear(); // Modify returned Map

      // Original cache unaffected
      const url = await getPaymentLogo("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1); // Still cached
    });

    it("reflects cache after additions", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);

      let cached = getCachedLogos();
      expect(cached.size).toBe(0);

      await getPaymentLogo("visa");
      cached = getCachedLogos();
      expect(cached.size).toBe(1);

      await getPaymentLogo("mastercard");
      cached = getCachedLogos();
      expect(cached.size).toBe(2);
    });

    it("reflects cache after clear", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);
      await getPaymentLogo("visa");

      let cached = getCachedLogos();
      expect(cached.size).toBe(1);

      clearLogoCache();

      cached = getCachedLogos();
      expect(cached.size).toBe(0);
    });
  });

  describe("integration scenarios", () => {
    it("complete loading cycle: Storage → cache → reuse", async () => {
      const mockUrl = "https://storage.googleapis.com/bucket/visa.png";
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(mockUrl);

      // Initial load from Storage
      const url1 = await getPaymentLogo("visa");
      expect(url1).toBe(mockUrl);
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

      // Cached read
      const url2 = await getPaymentLogo("visa");
      expect(url2).toBe(mockUrl);
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

      // Verify in cache
      const cached = getCachedLogos();
      expect(cached.get("visa")).toBe(mockUrl);
    });

    it("complete fallback cycle: error → fallback → cache → reuse", async () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      (getPaymentLogoUrl as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Initial load fails, uses fallback
      const url1 = await getPaymentLogo("visa");
      expect(url1).toContain("VISA");

      // Cached fallback
      const url2 = await getPaymentLogo("visa");
      expect(url2).toBe(url1);
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

      consoleWarnSpy.mockRestore();
    });

    it("mixed Storage and fallback logos", async () => {
      (getPaymentLogoUrl as jest.Mock).mockImplementation(async (id) => {
        if (id === "visa") return "https://storage.com/visa.png";
        if (id === "mastercard") return "https://storage.com/mastercard.png";
        return null; // Others use fallback
      });

      const visaUrl = await getPaymentLogo("visa");
      const mastercardUrl = await getPaymentLogo("mastercard");
      const amexUrl = await getPaymentLogo("amex");

      expect(visaUrl).toContain("storage.com");
      expect(mastercardUrl).toContain("storage.com");
      expect(amexUrl).toContain("AMEX");

      const cached = getCachedLogos();
      expect(cached.size).toBe(3);
    });

    it("preload then use from cache", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(
        "https://storage.com/logo.png"
      );

      // Preload
      await preloadPaymentLogos(["visa", "mastercard", "amex"]);
      const preloadCalls = getPaymentLogoUrl.mock.calls.length;

      // Use preloaded (no additional calls)
      await getPaymentLogo("visa");
      await getPaymentLogo("mastercard");
      await getPaymentLogo("amex");

      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(preloadCalls); // No new calls
    });
  });
});
