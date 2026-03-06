/**
 * useRealtimeEvent Tests
 *
 * Covers the generic RTDB event bridge hook:
 * - Initial IDLE state
 * - subscribe() → SUBSCRIBING → PENDING after token sign-in
 * - Snapshot status "success" → SUCCESS
 * - Snapshot status "failed" → FAILED (with server error message)
 * - Snapshot status "error" normalised → FAILED
 * - RTDB subscription error → FAILED
 * - signInWithCustomToken failure → FAILED (no onValue call)
 * - Timeout fires → TIMEOUT
 * - extractData populates data on success
 * - reset() returns to IDLE, clears error/data
 * - off() called on unmount
 */

import { renderHook, act } from "@testing-library/react";
import {
  useRealtimeEvent,
  RealtimeEventType,
  RealtimeEventStatus,
  type UseRealtimeEventConfig,
} from "../useRealtimeEvent";

// ─── Firebase mocks ──────────────────────────────────────────────────────────

let capturedValueCallback:
  | ((snapshot: { exists(): boolean; val(): unknown }) => void)
  | null = null;
let capturedValueErrorCallback: ((error: Error) => void) | null = null;

const mockOff = jest.fn();
const mockRef = jest.fn(() => ({ _path: "mock-ref" }));
const mockOnValue = jest.fn(
  (
    _ref: unknown,
    successCb: (snap: { exists(): boolean; val(): unknown }) => void,
    errorCb: (err: Error) => void,
  ) => {
    capturedValueCallback = successCb;
    capturedValueErrorCallback = errorCb;
    return mockOff;
  },
);

const mockSignInWithCustomToken = jest.fn().mockResolvedValue({ user: {} });
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockGetAuth = jest.fn().mockReturnValue({});

jest.mock("firebase/database", () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  onValue: (...args: unknown[]) => mockOnValue(...args),
  off: (...args: unknown[]) => mockOff(...args),
}));

jest.mock("firebase/auth", () => ({
  getAuth: (...args: unknown[]) => mockGetAuth(...args),
  signInWithCustomToken: (...args: unknown[]) =>
    mockSignInWithCustomToken(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock("@/lib/firebase/realtime", () => ({
  realtimeApp: { name: "letitrip-realtime" },
  chatRealtimeDb: { app: { name: "letitrip-realtime" } },
}));

jest.mock("@/classes", () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const baseConfig: UseRealtimeEventConfig = {
  type: RealtimeEventType.AUTH,
  rtdbPath: "test_events",
  timeoutMs: 5000,
};

function snap(val: unknown) {
  return { exists: () => val !== null, val: () => val };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useRealtimeEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedValueCallback = null;
    capturedValueErrorCallback = null;
  });

  it("starts in IDLE with null error and data", () => {
    const { result } = renderHook(() => useRealtimeEvent(baseConfig));
    expect(result.current.status).toBe(RealtimeEventStatus.IDLE);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("transitions to SUBSCRIBING immediately on subscribe()", () => {
    const { result } = renderHook(() => useRealtimeEvent(baseConfig));
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    expect(result.current.status).toBe(RealtimeEventStatus.SUBSCRIBING);
  });

  it("transitions to PENDING after signInWithCustomToken resolves", async () => {
    const { result } = renderHook(() => useRealtimeEvent(baseConfig));
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    expect(result.current.status).toBe(RealtimeEventStatus.PENDING);
    expect(mockOnValue).toHaveBeenCalledTimes(1);
    expect(mockRef).toHaveBeenCalledWith(expect.anything(), "test_events/ev-1");
  });

  it("transitions to SUCCESS when snapshot has status 'success'", async () => {
    const { result } = renderHook(() => useRealtimeEvent(baseConfig));
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      capturedValueCallback?.(snap({ status: "success" }));
    });
    expect(result.current.status).toBe(RealtimeEventStatus.SUCCESS);
    expect(result.current.error).toBeNull();
  });

  it("transitions to FAILED when snapshot has status 'failed'", async () => {
    const { result } = renderHook(() => useRealtimeEvent(baseConfig));
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      capturedValueCallback?.(snap({ status: "failed", error: "Rejected" }));
    });
    expect(result.current.status).toBe(RealtimeEventStatus.FAILED);
    expect(result.current.error).toBe("Rejected");
  });

  it("normalises raw status 'error' to FAILED", async () => {
    const { result } = renderHook(() => useRealtimeEvent(baseConfig));
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      capturedValueCallback?.(snap({ status: "error", error: "Server err" }));
    });
    expect(result.current.status).toBe(RealtimeEventStatus.FAILED);
    expect(result.current.error).toBe("Server err");
  });

  it("falls back to custom failure message when server provides none", async () => {
    const { result } = renderHook(() =>
      useRealtimeEvent({
        ...baseConfig,
        messages: { failure: "Custom fail msg" },
      }),
    );
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      capturedValueCallback?.(snap({ status: "failed" }));
    });
    expect(result.current.error).toBe("Custom fail msg");
  });

  it("transitions to FAILED when RTDB subscription itself errors", async () => {
    const { result } = renderHook(() =>
      useRealtimeEvent({
        ...baseConfig,
        messages: { connectionLost: "Conn lost" },
      }),
    );
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      capturedValueErrorCallback?.(new Error("RTDB error"));
    });
    expect(result.current.status).toBe(RealtimeEventStatus.FAILED);
    expect(result.current.error).toBe("Conn lost");
  });

  it("transitions to FAILED when signInWithCustomToken throws", async () => {
    mockSignInWithCustomToken.mockRejectedValueOnce(new Error("Bad token"));
    const { result } = renderHook(() =>
      useRealtimeEvent({
        ...baseConfig,
        messages: { tokenFailure: "Token failed" },
      }),
    );
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    expect(result.current.status).toBe(RealtimeEventStatus.FAILED);
    expect(result.current.error).toBe("Token failed");
    expect(mockOnValue).not.toHaveBeenCalled();
  });

  it("transitions to TIMEOUT when timer fires before any terminal snapshot", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useRealtimeEvent({
        ...baseConfig,
        timeoutMs: 1000,
        messages: { timedOut: "Timed out" },
      }),
    );
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.status).toBe(RealtimeEventStatus.TIMEOUT);
    expect(result.current.error).toBe("Timed out");
    jest.useRealTimers();
  });

  it("calls extractData and populates data on SUCCESS", async () => {
    const extractData = jest.fn().mockReturnValue(["order-1", "order-2"]);
    const { result } = renderHook(() =>
      useRealtimeEvent<string[]>({ ...baseConfig, extractData }),
    );
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      capturedValueCallback?.(
        snap({ status: "success", orderIds: ["order-1", "order-2"] }),
      );
    });
    expect(result.current.status).toBe(RealtimeEventStatus.SUCCESS);
    expect(result.current.data).toEqual(["order-1", "order-2"]);
    expect(extractData).toHaveBeenCalledTimes(1);
  });

  it("reset() returns to IDLE and clears error and data", async () => {
    const { result } = renderHook(() => useRealtimeEvent(baseConfig));
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    act(() => {
      capturedValueCallback?.(snap({ status: "failed", error: "err" }));
    });
    expect(result.current.status).toBe(RealtimeEventStatus.FAILED);

    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe(RealtimeEventStatus.IDLE);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("calls off() on unmount to remove the RTDB listener", async () => {
    const { result, unmount } = renderHook(() => useRealtimeEvent(baseConfig));
    act(() => {
      result.current.subscribe("ev-1", "tok-1");
    });
    await act(async () => {});
    expect(mockOnValue).toHaveBeenCalledTimes(1);
    unmount();
    expect(mockOff).toHaveBeenCalled();
  });
});
