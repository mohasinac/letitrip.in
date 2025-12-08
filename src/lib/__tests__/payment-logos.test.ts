/**
 * Payment Logos Utility Tests
 * Tests payment logo loading with cache and fallback
 */

import { clearLogoCache, getPaymentLogo } from "../payment-logos";

// Mock the static assets service
jest.mock("@/services/static-assets-client.service", () => ({
  getPaymentLogoUrl: jest.fn(),
}));

import { getPaymentLogoUrl } from "@/services/static-assets-client.service";

describe("Payment Logos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLogoCache();
  });

  describe("getPaymentLogo", () => {
    it("should return cached logo if available", async () => {
      const mockUrl = "https://example.com/visa.png";
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(mockUrl);

      // First call - should fetch
      const url1 = await getPaymentLogo("visa");
      expect(url1).toBe(mockUrl);
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const url2 = await getPaymentLogo("visa");
      expect(url2).toBe(mockUrl);
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1); // Not called again
    });

    it("should fetch logo from Firebase Storage", async () => {
      const mockUrl = "https://storage.example.com/mastercard.png";
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(mockUrl);

      const url = await getPaymentLogo("mastercard");

      expect(getPaymentLogoUrl).toHaveBeenCalledWith("mastercard");
      expect(url).toBe(mockUrl);
    });

    it("should use default fallback logo for known payment methods", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

      const url = await getPaymentLogo("visa");

      expect(url).toContain("data:image/svg+xml");
      expect(url).toContain("VISA");
    });

    it("should handle all supported payment methods with fallbacks", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);

      const paymentMethods = [
        "visa",
        "mastercard",
        "amex",
        "discover",
        "dinersclub",
        "jcb",
        "paypal",
        "paidy",
        "alipay",
        "unionpay",
        "atome",
      ];

      for (const method of paymentMethods) {
        clearLogoCache();
        const url = await getPaymentLogo(method);
        expect(url).toBeDefined();
        expect(url).toContain("data:image/svg+xml");
      }
    });

    it("should generate text fallback for unknown payment methods", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

      const url = await getPaymentLogo("unknown-payment");

      expect(url).toContain("data:image/svg+xml");
      expect(url).toContain("Unknown-payment"); // Text is capitalized with original case preserved
    });

    it("should handle Firebase Storage errors gracefully", async () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      (getPaymentLogoUrl as jest.Mock).mockRejectedValueOnce(
        new Error("Storage error")
      );

      const url = await getPaymentLogo("visa");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Could not load logo")
      );
      expect(url).toBeDefined();
      expect(url).toContain("VISA");

      consoleWarnSpy.mockRestore();
    });

    it("should cache fallback logos", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(null);

      // First call
      const url1 = await getPaymentLogo("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

      // Second call - should use cached fallback
      const url2 = await getPaymentLogo("visa");
      expect(url2).toBe(url1);
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1); // Not called again
    });

    it("should handle empty payment ID", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

      const url = await getPaymentLogo("");

      expect(url).toBeDefined();
      expect(url).toContain("data:image/svg+xml");
    });

    it("should clear cache when requested", async () => {
      const mockUrl = "https://example.com/visa.png";
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(mockUrl);

      // First call
      await getPaymentLogo("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(1);

      // Clear cache
      clearLogoCache();

      // Second call - should fetch again
      await getPaymentLogo("visa");
      expect(getPaymentLogoUrl).toHaveBeenCalledTimes(2);
    });

    it("should handle concurrent requests for same logo", async () => {
      const mockUrl = "https://example.com/visa.png";
      (getPaymentLogoUrl as jest.Mock).mockResolvedValue(mockUrl);

      // Make concurrent requests
      const [url1, url2, url3] = await Promise.all([
        getPaymentLogo("visa"),
        getPaymentLogo("visa"),
        getPaymentLogo("visa"),
      ]);

      expect(url1).toBe(mockUrl);
      expect(url2).toBe(mockUrl);
      expect(url3).toBe(mockUrl);
      // Should be called multiple times as no deduplication implemented
      expect(getPaymentLogoUrl).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in payment ID", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

      const url = await getPaymentLogo("payment-method@123");

      expect(url).toBeDefined();
      expect(url).toContain("data:image/svg+xml");
    });

    it("should handle very long payment IDs", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

      const longId = "a".repeat(100);
      const url = await getPaymentLogo(longId);

      expect(url).toBeDefined();
    });

    it("should preserve case sensitivity in fallback", async () => {
      (getPaymentLogoUrl as jest.Mock).mockResolvedValueOnce(null);

      const url = await getPaymentLogo("ViSa");

      expect(url).toContain("data:image/svg+xml");
      // Text is capitalized with first letter uppercase
      expect(url).toContain("ViSa"); // Original case preserved except first letter
    });
  });
});
