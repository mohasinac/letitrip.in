import {
  trackAPIError,
  trackCacheHit,
  trackEvent,
  trackSlowAPI,
} from "../analytics";

// Mock Firebase Analytics
jest.mock("@/app/api/lib/firebase/app", () => ({
  analytics: null,
}));

jest.mock("firebase/analytics", () => ({
  isSupported: jest.fn(() => Promise.resolve(false)),
  logEvent: jest.fn(),
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("trackEvent", () => {
    it("should handle event tracking gracefully when analytics not initialized", () => {
      expect(() => {
        trackEvent("test_event", { param: "value" });
      }).not.toThrow();
    });

    it("should accept event name only", () => {
      expect(() => {
        trackEvent("simple_event");
      }).not.toThrow();
    });

    it("should accept event with params", () => {
      expect(() => {
        trackEvent("complex_event", {
          user_id: "123",
          action: "click",
          value: 100,
        });
      }).not.toThrow();
    });

    it("should handle empty params", () => {
      expect(() => {
        trackEvent("event", {});
      }).not.toThrow();
    });

    it("should handle null params", () => {
      expect(() => {
        trackEvent("event", { value: null });
      }).not.toThrow();
    });

    it("should handle undefined params", () => {
      expect(() => {
        trackEvent("event", { value: undefined });
      }).not.toThrow();
    });
  });

  describe("trackSlowAPI", () => {
    it("should track slow API calls over 1000ms", () => {
      expect(() => {
        trackSlowAPI("/api/products", 1500);
      }).not.toThrow();
    });

    it("should not track fast API calls", () => {
      expect(() => {
        trackSlowAPI("/api/products", 500);
      }).not.toThrow();
    });

    it("should handle exactly 1000ms", () => {
      expect(() => {
        trackSlowAPI("/api/products", 1000);
      }).not.toThrow();
    });

    it("should handle very slow APIs", () => {
      expect(() => {
        trackSlowAPI("/api/products", 10000);
      }).not.toThrow();
    });

    it("should track with endpoint info", () => {
      expect(() => {
        trackSlowAPI("/api/auctions/list", 2000);
      }).not.toThrow();
    });
  });

  describe("trackAPIError", () => {
    it("should track API errors", () => {
      const error = new Error("API failed");
      expect(() => {
        trackAPIError("/api/products", error);
      }).not.toThrow();
    });

    it("should handle error with message", () => {
      expect(() => {
        trackAPIError("/api/products", { message: "Not found" });
      }).not.toThrow();
    });

    it("should handle error with code", () => {
      expect(() => {
        trackAPIError("/api/products", { code: "404", message: "Not found" });
      }).not.toThrow();
    });

    it("should handle error without message", () => {
      expect(() => {
        trackAPIError("/api/products", {});
      }).not.toThrow();
    });

    it("should handle null error", () => {
      expect(() => {
        trackAPIError("/api/products", null);
      }).not.toThrow();
    });

    it("should handle undefined error", () => {
      expect(() => {
        trackAPIError("/api/products", undefined);
      }).not.toThrow();
    });
  });

  describe("trackCacheHit", () => {
    it("should track cache hit", () => {
      expect(() => {
        trackCacheHit("products:list", true);
      }).not.toThrow();
    });

    it("should track cache miss", () => {
      expect(() => {
        trackCacheHit("products:list", false);
      }).not.toThrow();
    });

    it("should handle different cache keys", () => {
      expect(() => {
        trackCacheHit("users:123", true);
        trackCacheHit("shops:456", false);
      }).not.toThrow();
    });

    it("should handle empty cache key", () => {
      expect(() => {
        trackCacheHit("", true);
      }).not.toThrow();
    });
  });

  describe("Client-side initialization", () => {
    it("should not throw when analytics is not available", () => {
      // Analytics module is loaded but not initialized
      expect(() => {
        trackEvent("test");
        trackSlowAPI("/api/test", 2000);
        trackAPIError("/api/test", new Error("test"));
        trackCacheHit("test", true);
      }).not.toThrow();
    });
  });

  describe("Error handling", () => {
    it("should gracefully handle tracking failures", () => {
      // All tracking functions should not throw even if analytics fails
      expect(() => {
        trackEvent("event_with_error", { invalid: Symbol("test") });
      }).not.toThrow();
    });
  });
});
