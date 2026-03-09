/**
 * useRealtimeBids Tests
 *
 * The hook now uses EventSource (SSE) instead of Firebase RTDB client SDK.
 * - Opens an EventSource to /api/realtime/bids/{productId}
 * - Sets connected=true on "connected" and "update" messages
 * - Updates bid data on "update" messages
 * - Sets connected=false on "error" messages and onerror
 * - Closes EventSource on unmount
 * - Does nothing when productId is null
 */

import { renderHook, act } from "@testing-library/react";

// ── EventSource mock ────────────────────────────────────────────────────────
let capturedMessageHandler: ((event: MessageEvent) => void) | null = null;
let capturedErrorHandler: (() => void) | null = null;
const mockClose = jest.fn();
const MockEventSource = jest.fn().mockImplementation(() => ({
  set onmessage(handler: (event: MessageEvent) => void) {
    capturedMessageHandler = handler;
  },
  set onerror(handler: () => void) {
    capturedErrorHandler = handler;
  },
  close: mockClose,
}));

const emit = (data: unknown) =>
  act(() => {
    capturedMessageHandler?.({ data: JSON.stringify(data) } as MessageEvent);
  });

jest.mock("@/classes", () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

// Provide a minimal API_ENDPOINTS stub
jest.mock("@/constants", () => ({
  API_ENDPOINTS: {
    REALTIME: {
      BIDS_SSE: (id: string) => `/api/realtime/bids/${id}`,
    },
  },
}));

// Set EventSource as a global (JSDOM does not include it)
Object.defineProperty(global, "EventSource", {
  writable: true,
  value: MockEventSource,
});

import { useRealtimeBids } from "../useRealtimeBids";

const mockLogger = jest.requireMock("@/classes").logger;

describe("useRealtimeBids", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedMessageHandler = null;
    capturedErrorHandler = null;
  });

  it("returns null values initially before any message arrives", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));
    expect(result.current.currentBid).toBeNull();
    expect(result.current.bidCount).toBeNull();
    expect(result.current.lastBid).toBeNull();
    expect(result.current.updatedAt).toBeNull();
    expect(result.current.connected).toBe(false);
  });

  it("opens EventSource with the correct URL", () => {
    renderHook(() => useRealtimeBids("product-abc"));
    expect(MockEventSource).toHaveBeenCalledWith(
      "/api/realtime/bids/product-abc",
    );
  });

  it("sets connected=true on 'connected' message", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));
    emit({ type: "connected", productId: "product-123" });
    expect(result.current.connected).toBe(true);
  });

  it("updates state when 'update' message with data arrives", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));

    emit({
      type: "update",
      data: {
        currentBid: 1500,
        bidCount: 7,
        lastBid: { amount: 1500, bidderName: "Alice", timestamp: 1700000000 },
        updatedAt: 1700000001,
      },
    });

    expect(result.current.currentBid).toBe(1500);
    expect(result.current.bidCount).toBe(7);
    expect(result.current.lastBid?.bidderName).toBe("Alice");
    expect(result.current.updatedAt).toBe(1700000001);
    expect(result.current.connected).toBe(true);
  });

  it("handles 'update' with null data (no bids yet)", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));
    emit({ type: "update", data: null });
    expect(result.current.currentBid).toBeNull();
    expect(result.current.connected).toBe(true);
  });

  it("sets connected=false on 'error' message", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));
    emit({ type: "connected", productId: "product-123" }); // first connected
    emit({ type: "error", message: "Realtime connection lost" });
    expect(result.current.connected).toBe(false);
  });

  it("sets connected=false on onerror (network drop)", () => {
    const { result } = renderHook(() => useRealtimeBids("product-123"));
    emit({ type: "connected", productId: "product-123" });
    act(() => {
      capturedErrorHandler?.();
    });
    expect(result.current.connected).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "[useRealtimeBids] SSE connection error — will retry",
    );
  });

  it("calls EventSource.close() on unmount", () => {
    const { unmount } = renderHook(() => useRealtimeBids("product-123"));
    unmount();
    expect(mockClose).toHaveBeenCalled();
  });

  it("does not open EventSource when productId is null", () => {
    renderHook(() => useRealtimeBids(null));
    expect(MockEventSource).not.toHaveBeenCalled();
  });
});
