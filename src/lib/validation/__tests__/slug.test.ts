/**
 * Unit Tests for slug validation hooks
 *
 * Tests remote validation with debouncing, abort handling,
 * shop/product/coupon slug validation, and error states
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useCouponCodeValidation,
  useProductSlugValidation,
  useRemoteValidation,
  useShopSlugValidation,
} from "../slug";

// Mock fetch
global.fetch = jest.fn();

describe("useRemoteValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Validation", () => {
    it("should initialize with null state", () => {
      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "",
          endpoint: "/api/validate",
        })
      );

      expect(result.current.checking).toBe(false);
      expect(result.current.available).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it("should not validate empty value", () => {
      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.available).toBe(null);
    });

    it("should not validate value below minimum length", () => {
      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "ab",
          endpoint: "/api/validate",
          minLength: 3,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.available).toBe(null);
    });

    it("should validate value at minimum length", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true }),
      });

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "abc",
          endpoint: "/api/validate",
          minLength: 3,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.checking).toBe(false);
      });

      expect(fetch).toHaveBeenCalled();
      expect(result.current.available).toBe(true);
    });
  });

  describe("Debouncing", () => {
    it("should debounce validation requests", () => {
      const { rerender } = renderHook(
        ({ value }) =>
          useRemoteValidation({
            value,
            endpoint: "/api/validate",
            debounceMs: 400,
          }),
        { initialProps: { value: "test" } }
      );

      // Change value multiple times rapidly
      rerender({ value: "test1" });
      rerender({ value: "test12" });
      rerender({ value: "test123" });

      // Advance less than debounce time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not have called fetch yet
      expect(fetch).not.toHaveBeenCalled();

      // Advance past debounce time
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should have called fetch once with final value
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test123"),
        expect.any(Object)
      );
    });

    it("should use custom debounce time", () => {
      renderHook(() =>
        useRemoteValidation({
          value: "test",
          endpoint: "/api/validate",
          debounceMs: 1000,
        })
      );

      act(() => {
        jest.advanceTimersByTime(900);
      });

      expect(fetch).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(fetch).toHaveBeenCalled();
    });
  });

  describe("Successful Validation", () => {
    it("should set available to true when slug is available", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true }),
      });

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "available-slug",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.available).toBe(true);
      });

      expect(result.current.checking).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should set available to false when slug is taken", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: false }),
      });

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "taken-slug",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.available).toBe(false);
      });

      expect(result.current.error).toBe(null);
    });

    it("should show checking state during validation", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (fetch as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.checking).toBe(true);
      });

      act(() => {
        resolvePromise!({
          ok: true,
          json: async () => ({ success: true, available: true }),
        });
      });

      await waitFor(() => {
        expect(result.current.checking).toBe(false);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle validation failure with error message", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, error: "Invalid slug format" }),
      });

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "invalid@slug",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Invalid slug format");
      });

      expect(result.current.available).toBe(null);
    });

    it("should handle validation failure without error message", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ success: false }),
      });

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Validation failed");
      });
    });

    it("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
      });

      expect(result.current.available).toBe(null);
    });

    it("should ignore aborted requests", async () => {
      const abortError = new Error("AbortError");
      abortError.name = "AbortError";
      (fetch as jest.Mock).mockRejectedValue(abortError);

      const { result } = renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.checking).toBe(false);
      });

      // Should not set error for aborted requests
      expect(result.current.error).toBe(null);
    });
  });

  describe("Request Cancellation", () => {
    it("should abort previous request when value changes", async () => {
      const abortSpy = jest.fn();
      const mockAbortController = {
        abort: abortSpy,
        signal: {} as AbortSignal,
      };

      global.AbortController = jest.fn(() => mockAbortController) as any;

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true }),
      });

      const { rerender } = renderHook(
        ({ value }) =>
          useRemoteValidation({
            value,
            endpoint: "/api/validate",
          }),
        { initialProps: { value: "test1" } }
      );

      act(() => {
        jest.runAllTimers();
      });

      // Change value
      rerender({ value: "test2" });

      // Should have aborted previous request
      expect(abortSpy).toHaveBeenCalled();
    });

    it("should cleanup on unmount", async () => {
      const abortSpy = jest.fn();
      const mockAbortController = {
        abort: abortSpy,
        signal: {} as AbortSignal,
      };

      global.AbortController = jest.fn(() => mockAbortController) as any;

      const { unmount } = renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
          debounceMs: 100,
        })
      );

      // Wait for debounce timer to complete and request to start
      await act(async () => {
        jest.advanceTimersByTime(150);
        await Promise.resolve();
      });

      unmount();

      expect(abortSpy).toHaveBeenCalled();
    });
  });

  describe("Extra Parameters", () => {
    it("should include extra params in request", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true }),
      });

      renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
          extraParams: {
            exclude_id: "shop-123",
            shop_slug: "my-shop",
          },
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const callUrl = (fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain("exclude_id=shop-123");
      expect(callUrl).toContain("shop_slug=my-shop");
    });

    it("should ignore undefined extra params", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true }),
      });

      renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
          extraParams: {
            exclude_id: undefined,
            shop_slug: "my-shop",
          },
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const callUrl = (fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).not.toContain("exclude_id");
      expect(callUrl).toContain("shop_slug=my-shop");
    });

    it("should use custom param name", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true }),
      });

      renderHook(() =>
        useRemoteValidation({
          value: "TEST123",
          endpoint: "/api/validate",
          paramName: "code",
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const callUrl = (fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain("code=TEST123");
      expect(callUrl).not.toContain("slug=");
    });
  });

  describe("Skip Flag", () => {
    it("should skip validation when skip is true", () => {
      renderHook(() =>
        useRemoteValidation({
          value: "test-slug",
          endpoint: "/api/validate",
          skip: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it("should validate when skip changes to false", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true }),
      });

      const { rerender } = renderHook(
        ({ skip }) =>
          useRemoteValidation({
            value: "test-slug",
            endpoint: "/api/validate",
            skip,
          }),
        { initialProps: { skip: true } }
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(fetch).not.toHaveBeenCalled();

      rerender({ skip: false });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });
  });
});

describe("useShopSlugValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should validate shop slug", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, available: true }),
    });

    renderHook(() => useShopSlugValidation("my-shop"));

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect((fetch as jest.Mock).mock.calls[0][0]).toContain(
      "/api/shops/validate-slug"
    );
  });

  it("should include exclude_id when provided", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, available: true }),
    });

    renderHook(() => useShopSlugValidation("my-shop", "shop-123"));

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const callUrl = (fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain("exclude_id=shop-123");
  });
});

describe("useProductSlugValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should validate product slug", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, available: true }),
    });

    renderHook(() => useProductSlugValidation("my-product", "my-shop"));

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect((fetch as jest.Mock).mock.calls[0][0]).toContain(
      "/api/products/validate-slug"
    );
  });

  it("should skip validation when shop slug is undefined", () => {
    renderHook(() => useProductSlugValidation("my-product", undefined));

    act(() => {
      jest.runAllTimers();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("should include shop_slug and exclude_id", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, available: true }),
    });

    renderHook(() =>
      useProductSlugValidation("my-product", "my-shop", "product-123")
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const callUrl = (fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain("shop_slug=my-shop");
    expect(callUrl).toContain("exclude_id=product-123");
  });
});

describe("useCouponCodeValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should validate coupon code", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, available: true }),
    });

    renderHook(() => useCouponCodeValidation("SAVE20", "my-shop"));

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect((fetch as jest.Mock).mock.calls[0][0]).toContain(
      "/api/coupons/validate-code"
    );
  });

  it("should convert code to uppercase", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, available: true }),
    });

    renderHook(() => useCouponCodeValidation("save20", "my-shop"));

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const callUrl = (fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain("code=SAVE20");
  });

  it("should use code param instead of slug", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, available: true }),
    });

    renderHook(() => useCouponCodeValidation("SAVE20", "my-shop"));

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const callUrl = (fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain("code=SAVE20");
    expect(callUrl).toContain("shop_slug=my-shop");
    // Verify it's using "code=" not "slug=" as the coupon identifier
    expect(callUrl).toMatch(/[?&]code=/);
    expect(callUrl).not.toMatch(/[?&]slug=/);
  });

  it("should skip validation when shop slug is undefined", () => {
    renderHook(() => useCouponCodeValidation("SAVE20", undefined));

    act(() => {
      jest.runAllTimers();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("should use minimum length of 2", () => {
    renderHook(() => useCouponCodeValidation("S", "my-shop"));

    act(() => {
      jest.runAllTimers();
    });

    // Should not validate with length 1
    expect(fetch).not.toHaveBeenCalled();
  });
});
