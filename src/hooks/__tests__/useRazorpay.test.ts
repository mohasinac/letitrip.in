/**
 * useRazorpay Tests — Phase 18.5
 *
 * - isLoading=false when window.Razorpay is already defined
 * - isLoading=true when window.Razorpay is not defined
 * - Script injected into document.body when not loaded
 * - No duplicate script injection when script already in DOM
 * - openRazorpay creates Razorpay instance and calls .open()
 */

import { renderHook, act } from "@testing-library/react";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

describe("useRazorpay", () => {
  afterEach(() => {
    // Clean up any injected script tags
    const scripts = document.querySelectorAll(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );
    scripts.forEach((s) => s.parentNode?.removeChild(s));
    // Clean up window.Razorpay

    delete (window as any).Razorpay;
  });

  it("starts with isLoading=false when window.Razorpay is already defined", async () => {
    (window as any).Razorpay = jest.fn(() => ({
      open: jest.fn(),
      close: jest.fn(),
    }));
    const { useRazorpay } = await import("../useRazorpay");
    const { result } = renderHook(() => useRazorpay());
    expect(result.current.isLoading).toBe(false);
  });

  it("starts with isLoading=true when window.Razorpay is not defined", async () => {
    const { useRazorpay } = await import("../useRazorpay");
    const { result } = renderHook(() => useRazorpay());
    expect(result.current.isLoading).toBe(true);
  });

  it("appends a script tag to document.body when Razorpay is not loaded", async () => {
    const { useRazorpay } = await import("../useRazorpay");
    renderHook(() => useRazorpay());
    const script = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );
    expect(script).not.toBeNull();
  });

  it("does not inject a duplicate script when one already exists in DOM", async () => {
    // Pre-inject a script
    const existing = document.createElement("script");
    existing.src = RAZORPAY_SCRIPT_URL;
    document.head.appendChild(existing);

    const { useRazorpay } = await import("../useRazorpay");
    renderHook(() => useRazorpay());

    const scripts = document.querySelectorAll(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );
    // Should still only be 1 (the pre-existing one)
    expect(scripts.length).toBe(1);
  });

  it("openRazorpay creates a Razorpay instance and calls open()", async () => {
    const mockOpen = jest.fn();

    (window as any).Razorpay = jest.fn(() => ({
      open: mockOpen,
      close: jest.fn(),
    }));

    const { useRazorpay } = await import("../useRazorpay");
    const { result } = renderHook(() => useRazorpay());

    const options = {
      key: "rzp_test_key",
      amount: 50000,
      currency: "INR",
      order_id: "order_test_123",
      handler: jest.fn(),
    };

    act(() => {
      result.current.openRazorpay(options).catch(() => {
        // The promise might not resolve in the test since handler is never called
      });
    });

    expect(mockOpen).toHaveBeenCalled();
  });

  it("openRazorpay rejects with error when script not loaded", async () => {
    const { useRazorpay } = await import("../useRazorpay");
    const { result } = renderHook(() => useRazorpay());

    await expect(
      result.current.openRazorpay({
        key: "rzp_test_key",
        amount: 50000,
        currency: "INR",
        order_id: "order_test_123",
        handler: jest.fn(),
      }),
    ).rejects.toThrow("Razorpay script not loaded");
  });
});
