/**
 * useBulkEvent Tests
 *
 * Covers the RTDB bulk-action result bridge hook:
 * - Delegates to useRealtimeEvent with correct config (type, path, timeout)
 * - extractData correctly maps RTDBEventPayload to BulkActionResult
 * - extractData returns null for payloads missing required fields
 * - extractData handles optional `data` field
 * - result is populated from the useRealtimeEvent data field
 * - subscribe and reset are forwarded from useRealtimeEvent
 * - error is forwarded from useRealtimeEvent
 * - status is forwarded from useRealtimeEvent
 */

import { renderHook } from "@testing-library/react";
import { useBulkEvent, type UseBulkEventReturn } from "../useBulkEvent";
import {
  useRealtimeEvent,
  RealtimeEventType,
  RealtimeEventStatus,
  type UseRealtimeEventConfig,
  type RTDBEventPayload,
} from "../useRealtimeEvent";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import type { BulkActionResult } from "@/types/api";

// ─── Mock useRealtimeEvent ────────────────────────────────────────────────────

jest.mock("../useRealtimeEvent");

const mockSubscribe = jest.fn();
const mockReset = jest.fn();

function makeRealtimeReturn(
  overrides: Partial<{
    status: RealtimeEventStatus;
    error: string | null;
    data: BulkActionResult | null;
  }> = {},
) {
  return {
    status: (overrides.status ??
      RealtimeEventStatus.IDLE) as RealtimeEventStatus,
    error: overrides.error ?? null,
    data: overrides.data ?? null,
    subscribe: mockSubscribe,
    reset: mockReset,
  };
}

const mockedUseRealtimeEvent = jest.mocked(useRealtimeEvent);

// Capture the config that was passed to useRealtimeEvent
let capturedConfig: UseRealtimeEventConfig<BulkActionResult> | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  capturedConfig = null;
  mockedUseRealtimeEvent.mockImplementation((config) => {
    capturedConfig = config as UseRealtimeEventConfig<BulkActionResult>;
    return makeRealtimeReturn() as ReturnType<typeof useRealtimeEvent>;
  });
});

// ─── Config delegation ────────────────────────────────────────────────────────

describe("config delegation to useRealtimeEvent", () => {
  it("passes RealtimeEventType.BULK", () => {
    renderHook(() => useBulkEvent());
    expect(capturedConfig?.type).toBe(RealtimeEventType.BULK);
  });

  it("passes RTDB_PATHS.BULK_EVENTS as the rtdbPath", () => {
    renderHook(() => useBulkEvent());
    expect(capturedConfig?.rtdbPath).toBe(RTDB_PATHS.BULK_EVENTS);
  });

  it("sets timeoutMs to 10 minutes (600 000 ms)", () => {
    renderHook(() => useBulkEvent());
    expect(capturedConfig?.timeoutMs).toBe(10 * 60 * 1000);
  });

  it("provides an extractData function", () => {
    renderHook(() => useBulkEvent());
    expect(typeof capturedConfig?.extractData).toBe("function");
  });

  it("provides all four custom messages", () => {
    renderHook(() => useBulkEvent());
    const msgs = capturedConfig?.messages ?? {};
    expect(msgs.tokenFailure).toBeTruthy();
    expect(msgs.connectionLost).toBeTruthy();
    expect(msgs.timedOut).toBeTruthy();
    expect(msgs.failure).toBeTruthy();
  });
});

// ─── extractData ─────────────────────────────────────────────────────────────

describe("extractData", () => {
  function callExtract(raw: RTDBEventPayload): BulkActionResult | null {
    renderHook(() => useBulkEvent());
    // capturedConfig is set during the hook's first render
    return (capturedConfig?.extractData?.(raw) as BulkActionResult) ?? null;
  }

  it("maps a complete RTDBEventPayload to BulkActionResult", () => {
    const raw: RTDBEventPayload = {
      status: "success",
      action: "publish",
      summary: { total: 5, succeeded: 4, skipped: 1, failed: 0 },
      succeeded: ["a", "b", "c", "d"],
      skipped: ["e"],
      failed: [],
    };
    expect(callExtract(raw)).toEqual({
      action: "publish",
      summary: { total: 5, succeeded: 4, skipped: 1, failed: 0 },
      succeeded: ["a", "b", "c", "d"],
      skipped: ["e"],
      failed: [],
    });
  });

  it("defaults succeeded/skipped/failed to empty arrays when missing", () => {
    const raw: RTDBEventPayload = {
      status: "success",
      action: "delete",
      summary: { total: 2, succeeded: 2, skipped: 0, failed: 0 },
    };
    const result = callExtract(raw)!;
    expect(result.succeeded).toEqual([]);
    expect(result.skipped).toEqual([]);
    expect(result.failed).toEqual([]);
  });

  it("includes optional data field when present", () => {
    const raw: RTDBEventPayload = {
      status: "success",
      action: "export",
      summary: { total: 3, succeeded: 3, skipped: 0, failed: 0 },
      data: { downloadUrl: "https://example.com/file.csv" },
    };
    const result = callExtract(raw)!;
    expect(result.data).toEqual({
      downloadUrl: "https://example.com/file.csv",
    });
  });

  it("omits data field when not present", () => {
    const raw: RTDBEventPayload = {
      status: "success",
      action: "publish",
      summary: { total: 1, succeeded: 1, skipped: 0, failed: 0 },
    };
    const result = callExtract(raw)!;
    expect(Object.prototype.hasOwnProperty.call(result, "data")).toBe(false);
  });

  it("maps failed items correctly", () => {
    const raw: RTDBEventPayload = {
      status: "success",
      action: "delete",
      summary: { total: 3, succeeded: 2, skipped: 0, failed: 1 },
      succeeded: ["id1", "id2"],
      skipped: [],
      failed: [{ id: "id3", reason: "Record is locked" }],
    };
    expect(callExtract(raw)?.failed).toEqual([
      { id: "id3", reason: "Record is locked" },
    ]);
  });

  it("returns null when action field is missing", () => {
    const raw: RTDBEventPayload = {
      status: "success",
      summary: { total: 1, succeeded: 1, skipped: 0, failed: 0 },
    };
    expect(callExtract(raw)).toBeNull();
  });

  it("returns null when summary field is missing", () => {
    const raw: RTDBEventPayload = {
      status: "success",
      action: "publish",
    };
    expect(callExtract(raw)).toBeNull();
  });

  it("returns null for an empty snapshot", () => {
    const raw: RTDBEventPayload = { status: "pending" };
    expect(callExtract(raw)).toBeNull();
  });
});

// ─── Return shape ─────────────────────────────────────────────────────────────

describe("return shape", () => {
  it("returns IDLE status and null result in initial state", () => {
    const { result } = renderHook(() => useBulkEvent());
    const hook = result.current as UseBulkEventReturn;
    expect(hook.status).toBe(RealtimeEventStatus.IDLE);
    expect(hook.result).toBeNull();
    expect(hook.error).toBeNull();
  });

  it("surfaces SUCCESS status and result when underlying hook reaches success", () => {
    const mockResult: BulkActionResult = {
      action: "publish",
      summary: { total: 3, succeeded: 3, skipped: 0, failed: 0 },
      succeeded: ["x", "y", "z"],
      skipped: [],
      failed: [],
    };
    mockedUseRealtimeEvent.mockReturnValue(
      makeRealtimeReturn({
        status: RealtimeEventStatus.SUCCESS,
        data: mockResult,
      }) as ReturnType<typeof useRealtimeEvent>,
    );
    const { result } = renderHook(() => useBulkEvent());
    expect(result.current.status).toBe(RealtimeEventStatus.SUCCESS);
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it("surfaces FAILED status and error when underlying hook fails", () => {
    mockedUseRealtimeEvent.mockReturnValue(
      makeRealtimeReturn({
        status: RealtimeEventStatus.FAILED,
        error: "The bulk operation did not complete. Please try again.",
      }) as ReturnType<typeof useRealtimeEvent>,
    );
    const { result } = renderHook(() => useBulkEvent());
    expect(result.current.status).toBe(RealtimeEventStatus.FAILED);
    expect(result.current.error).toBe(
      "The bulk operation did not complete. Please try again.",
    );
    expect(result.current.result).toBeNull();
  });

  it("surfaces TIMEOUT status", () => {
    mockedUseRealtimeEvent.mockReturnValue(
      makeRealtimeReturn({ status: RealtimeEventStatus.TIMEOUT }) as ReturnType<
        typeof useRealtimeEvent
      >,
    );
    const { result } = renderHook(() => useBulkEvent());
    expect(result.current.status).toBe(RealtimeEventStatus.TIMEOUT);
  });

  it("forwards subscribe to useRealtimeEvent", () => {
    const { result } = renderHook(() => useBulkEvent());
    result.current.subscribe("job-abc", "token-xyz");
    expect(mockSubscribe).toHaveBeenCalledWith("job-abc", "token-xyz");
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it("forwards reset to useRealtimeEvent", () => {
    const { result } = renderHook(() => useBulkEvent());
    result.current.reset();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
