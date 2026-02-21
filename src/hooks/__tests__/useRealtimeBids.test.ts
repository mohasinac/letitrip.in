/**
 * useRealtimeBids Tests — Phase 18.5
 *
 * - Returns null values before snapshot arrives
 * - Updates currentBid/bidCount/lastBid when snapshot arrives
 * - Sets connected=true on successful snapshot, false on error
 * - Calls off() on unmount (unsubscribes)
 * - Does nothing when productId is null
 */

import { renderHook, act } from "@testing-library/react";

// Capture onValue callbacks so we can trigger them in tests
let capturedSuccessCallback:
  | ((snapshot: { exists: () => boolean; val: () => unknown }) => void)
  | null = null;
let capturedErrorCallback: ((error: Error) => void) | null = null;

const mockOff = jest.fn();
const mockRef = jest.fn(() => ({ _path: "test-ref" }));
const mockOnValue = jest.fn(
  (
    ref: unknown,
    successCb: (snap: { exists: () => boolean; val: () => unknown }) => void,
    errorCb: (error: Error) => void,
  ) => {
    capturedSuccessCallback = successCb;
    capturedErrorCallback = errorCb;
    return mockOff;
  },
);

jest.mock("@/lib/firebase/config", () => ({
  realtimeDb: { app: {} }, // truthy value
}));

jest.mock("firebase/database", () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  onValue: (...args: unknown[]) => mockOnValue(...args),
  off: (...args: unknown[]) => mockOff(...args),
}));

import { useRealtimeBids } from "../useRealtimeBids";

describe("useRealtimeBids", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedSuccessCallback = null;
    capturedErrorCallback = null;
  });

  it("returns null values initially before any snapshot arrives", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));
    expect(result.current.currentBid).toBeNull();
    expect(result.current.bidCount).toBeNull();
    expect(result.current.lastBid).toBeNull();
    expect(result.current.updatedAt).toBeNull();
  });

  it("updates state when snapshot with data arrives", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));

    act(() => {
      capturedSuccessCallback?.({
        exists: () => true,
        val: () => ({
          currentBid: 1500,
          bidCount: 7,
          lastBid: { amount: 1500, bidderName: "Alice", timestamp: 1700000000 },
          updatedAt: 1700000001,
        }),
      });
    });

    expect(result.current.currentBid).toBe(1500);
    expect(result.current.bidCount).toBe(7);
    expect(result.current.lastBid?.bidderName).toBe("Alice");
    expect(result.current.updatedAt).toBe(1700000001);
  });

  it("sets connected=true after successful snapshot", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));

    act(() => {
      capturedSuccessCallback?.({
        exists: () => true,
        val: () => ({
          currentBid: 100,
          bidCount: 1,
          lastBid: null,
          updatedAt: 1,
        }),
      });
    });

    expect(result.current.connected).toBe(true);
  });

  it("handles null snapshot (no bids yet) — keeps data null but connected=true", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));

    act(() => {
      capturedSuccessCallback?.({
        exists: () => false,
        val: () => null,
      });
    });

    expect(result.current.currentBid).toBeNull();
    expect(result.current.connected).toBe(true);
  });

  it("sets connected=false on subscription error", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));

    act(() => {
      capturedErrorCallback?.(new Error("RTDB connection failed"));
    });

    expect(result.current.connected).toBe(false);
  });

  it("calls off() on unmount to unsubscribe", () => {
    const { unmount } = renderHook(() => useRealtimeBids("product-123"));
    unmount();
    expect(mockOff).toHaveBeenCalled();
  });

  it("does not subscribe when productId is null", () => {
    renderHook(() => useRealtimeBids(null));
    expect(mockOnValue).not.toHaveBeenCalled();
  });
});
