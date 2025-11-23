import { renderHook, act, waitFor } from "@testing-library/react";
import { useSlugValidation } from "./useSlugValidation";

// Mock fetch globally
global.fetch = jest.fn();

describe("useSlugValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("initialization", () => {
    it("initializes with default values", () => {
      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
        })
      );

      expect(result.current.slug).toBe("");
      expect(result.current.isAvailable).toBeNull();
      expect(result.current.isValidating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("initializes with initial slug", () => {
      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          initialSlug: "test-slug",
        })
      );

      expect(result.current.slug).toBe("test-slug");
    });

    it("validates initial slug on mount", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          initialSlug: "test-slug",
        })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/validate-slug?slug=test-slug")
        );
      });
    });
  });

  describe("validateSlug function", () => {
    it("validates slug and sets isAvailable to true when available", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("available-slug");
      });

      expect(result.current.slug).toBe("available-slug");

      // Fast-forward time to trigger debounce
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isAvailable).toBe(true);
      });
    });

    it("validates slug and sets isAvailable to false when unavailable", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: false }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("taken-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isAvailable).toBe(false);
      });
    });

    it("sets isValidating to true during validation", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ available: true }),
                }),
              50
            )
          )
      );

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isValidating).toBe(true);
      });
    });

    it("sets isValidating to false after validation completes", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });
    });

    it("does not validate empty slug", () => {
      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
        })
      );

      act(() => {
        result.current.validateSlug("");
      });

      expect(result.current.isAvailable).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("debounces validation calls", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 300,
        })
      );

      // Type multiple slugs quickly
      act(() => {
        result.current.validateSlug("slug1");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        result.current.validateSlug("slug2");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        result.current.validateSlug("slug3");
      });

      // Only the last one should be validated after full debounce time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("slug=slug3")
        );
      });
    });
  });

  describe("query parameters", () => {
    it("includes additional params in query string", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          params: { shop_slug: "my-shop" },
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("shop_slug=my-shop")
        );
      });
    });

    it("includes excludeId when provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          excludeId: "existing-id-123",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("exclude_id=existing-id-123")
        );
      });
    });

    it("uses 'code' param instead of 'slug' for coupon validation", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/coupons/validate-code",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("COUPON123");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(callUrl).toContain("code=COUPON123");
        expect(callUrl).not.toContain("slug=");
      });
    });
  });

  describe("error handling", () => {
    it("sets error when API request fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Validation failed" }),
      });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Validation failed");
        expect(result.current.isAvailable).toBeNull();
      });

      consoleErrorSpy.mockRestore();
    });

    it("handles network errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
        expect(result.current.isAvailable).toBeNull();
      });

      consoleErrorSpy.mockRestore();
    });

    it("clears error on successful validation", async () => {
      // First, fail validation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Validation failed" }),
      });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("bad-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Validation failed");
      });

      // Then, succeed validation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      act(() => {
        result.current.validateSlug("good-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.isAvailable).toBe(true);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("reset function", () => {
    it("resets all state to initial values", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 100,
        })
      );

      // First, set some state
      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isAvailable).toBe(true);
      });

      // Then reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.slug).toBe("");
      expect(result.current.isAvailable).toBeNull();
      expect(result.current.isValidating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("use cases", () => {
    it("works for shop slug validation", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/shops/validate-slug",
          excludeId: "shop-123",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("my-shop");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/shops/validate-slug")
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("slug=my-shop")
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("exclude_id=shop-123")
        );
      });
    });

    it("works for product slug validation per shop", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/products/validate-slug",
          params: { shop_slug: "my-shop" },
          excludeId: "product-456",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("my-product");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(callUrl).toContain("/api/products/validate-slug");
        expect(callUrl).toContain("slug=my-product");
        expect(callUrl).toContain("shop_slug=my-shop");
        expect(callUrl).toContain("exclude_id=product-456");
      });
    });

    it("works for coupon code validation per shop", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/coupons/validate-code",
          params: { shop_slug: "my-shop" },
          excludeId: "coupon-789",
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.validateSlug("SUMMER2024");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(callUrl).toContain("/api/coupons/validate-code");
        expect(callUrl).toContain("code=SUMMER2024");
        expect(callUrl).toContain("shop_slug=my-shop");
        expect(callUrl).toContain("exclude_id=coupon-789");
      });
    });
  });

  describe("edge cases", () => {
    it("handles rapid slug changes correctly", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          debounceMs: 200,
        })
      );

      // Rapidly change slug
      act(() => {
        result.current.validateSlug("a");
      });
      act(() => {
        jest.advanceTimersByTime(50);
      });
      act(() => {
        result.current.validateSlug("ab");
      });
      act(() => {
        jest.advanceTimersByTime(50);
      });
      act(() => {
        result.current.validateSlug("abc");
      });
      act(() => {
        jest.advanceTimersByTime(50);
      });
      act(() => {
        result.current.validateSlug("abcd");
      });

      // Complete debounce
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        // Should only validate once with the final value
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("slug=abcd")
        );
      });
    });

    it("handles clearing slug to empty string", () => {
      const { result } = renderHook(() =>
        useSlugValidation({
          endpoint: "/api/validate-slug",
          initialSlug: "test-slug",
        })
      );

      act(() => {
        result.current.validateSlug("");
      });

      expect(result.current.slug).toBe("");
      expect(result.current.isAvailable).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("updates validation when params change", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });

      const { result, rerender } = renderHook(
        ({ params }) =>
          useSlugValidation({
            endpoint: "/api/validate-slug",
            params,
            debounceMs: 100,
          }),
        {
          initialProps: { params: { shop_slug: "shop-1" } },
        }
      );

      act(() => {
        result.current.validateSlug("test-slug");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("shop_slug=shop-1")
        );
      });

      // Clear mock and change params
      (global.fetch as jest.Mock).mockClear();

      rerender({ params: { shop_slug: "shop-2" } });

      act(() => {
        result.current.validateSlug("test-slug-2");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("shop_slug=shop-2")
        );
      });
    });
  });

  // TODO: Consider adding loading state indicator for better UX
  // TODO: Consider adding retry mechanism for network failures
  // TODO: Add validation for slug format (e.g., no spaces, special characters)
  // TODO: Consider caching validation results to avoid redundant API calls
});
