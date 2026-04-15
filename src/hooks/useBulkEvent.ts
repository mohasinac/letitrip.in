"use client";

/**
 * useBulkEvent
 *
 * Client-side handler for the RTDB bulk-action result bridge.
 * Thin domain wrapper over `useRealtimeEvent` scoped to `bulk_events`.
 *
 * For long-running bulk operations the server can process items
 * asynchronously and write the final BulkActionResult to RTDB instead
 * of keeping the HTTP request open.  For small synchronous batches
 * the server may still use this channel: the HTTP route returns
 * { jobId, customToken } immediately, processes the items, and writes
 * the result node — the client picks it up from RTDB rather than
 * polling or blocking on a slow response.
 *
 * Flow:
 *  1. Client calls the bulk API route (e.g. POST /api/admin/products/bulk)
 *     → server creates /bulk_events/{jobId} { status:'pending' }
 *     → server returns { jobId, customToken } immediately.
 *  2. Caller calls `bulkEvent.subscribe(jobId, customToken)`.
 *  3. Hook subscribes read-only to /bulk_events/{jobId} via a scoped
 *     custom token (claim `{ bulkJobId: jobId }`).
 *  4. When processing completes the server writes the final
 *     BulkActionResult fields alongside `status: "success"`.
 *     On error it writes `{ status: "failed", error: "..." }`.
 *  5. `useBulkEvent` transitions to SUCCESS or FAILED and auto-cleans up.
 *
 * Timeout: 10 minutes — large batches (up to 100 items per API limit)
 * should complete well within this window.
 *
 * @example
 * ```tsx
 * const { showSuccess, showError } = useMessage();
 * const selection = useBulkSelection({ items, keyExtractor: (p) => p.id });
 * const bulkEvent = useBulkEvent();
 *
 * // 1. Trigger the async bulk job
 * const handleBulkPublish = async () => {
 *   try {
 *     const { jobId, customToken } = await adminService.bulkProductsAsync({
 *       action: 'publish',
 *       ids: selection.selectedIds,
 *     });
 *     bulkEvent.subscribe(jobId, customToken);
 *   } catch (err) {
 *     showError((err as Error).message);
 *   }
 * };
 *
 * // 2. React to terminal state
 * useEffect(() => {
 *   if (bulkEvent.status === RealtimeEventStatus.SUCCESS && bulkEvent.result) {
 *     const { summary } = bulkEvent.result;
 *     showSuccess(`${summary.succeeded} of ${summary.total} items published`);
 *     selection.clearSelection();
 *     refetch();
 *     bulkEvent.reset();
 *   }
 *   if (bulkEvent.status === RealtimeEventStatus.FAILED) {
 *     showError(bulkEvent.error ?? 'Bulk operation failed.');
 *     bulkEvent.reset();
 *   }
 * }, [bulkEvent.status]);
 * ```
 */

import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import {
  RealtimeEventType,
  RealtimeEventStatus,
  useRealtimeEvent,
  type RTDBEventPayload,
} from "@mohasinac/appkit/react";
import type {
  BulkActionResult,
  BulkActionSummary,
  BulkActionItemFailure,
} from "@mohasinac/appkit/react";
import { realtimeApp, chatRealtimeDb } from "@/lib/firebase/realtime";
import { logger } from "@mohasinac/appkit/core";

// Re-export status so callers don't need a separate import.
export type { RealtimeEventStatus as BulkEventStatus };

export interface UseBulkEventReturn<TData = Record<string, unknown>> {
  status: RealtimeEventStatus;
  /** Error or failure message; present when status is 'failed' or 'timeout'. */
  error: string | null;
  /**
   * The final BulkActionResult from the server.
   * Populated only when `status === RealtimeEventStatus.SUCCESS`.
   * Inspect `result.summary` and `result.failed` to build feedback messages.
   */
  result: BulkActionResult<TData> | null;
  /** Start the RTDB subscription using the jobId + custom token from the API. */
  subscribe: (jobId: string, customToken: string) => void;
  /** Reset back to IDLE state, clearing result and error. */
  reset: () => void;
}

/** 10 minutes — covers the largest allowed batch (100 items) with headroom. */
const BULK_EVENT_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Extract a BulkActionResult from the raw RTDB snapshot.
 * Returns `null` if the payload is missing required fields (defensive guard).
 */
function extractBulkResult(
  raw: RTDBEventPayload,
): BulkActionResult<unknown> | null {
  if (typeof raw.action !== "string" || !raw.summary) return null;
  const result: BulkActionResult<unknown> = {
    action: raw.action,
    summary: raw.summary as BulkActionSummary,
    succeeded: (raw.succeeded as string[] | undefined) ?? [],
    skipped: (raw.skipped as string[] | undefined) ?? [],
    failed: (raw.failed as BulkActionItemFailure[] | undefined) ?? [],
  };
  if (raw.data !== undefined) {
    result.data = raw.data;
  }
  return result;
}

export function useBulkEvent<
  TData = Record<string, unknown>,
>(): UseBulkEventReturn<TData> {
  const {
    status,
    error,
    data: result,
    subscribe,
    reset,
  } = useRealtimeEvent<BulkActionResult<TData>>({
    type: RealtimeEventType.BULK,
    rtdbPath: RTDB_PATHS.BULK_EVENTS,
    realtimeApp,
    realtimeDb: chatRealtimeDb,
    timeoutMs: BULK_EVENT_TIMEOUT_MS,
    onLogError: (message, err) => logger.error(message, err),
    extractData: extractBulkResult as (
      raw: RTDBEventPayload,
    ) => BulkActionResult<TData> | null,
    messages: {
      tokenFailure:
        "Failed to initialise bulk operation tracking. Please try again.",
      connectionLost:
        "Bulk operation tracking connection lost. Please check if the changes were applied.",
      timedOut:
        "Bulk operation timed out. Please check if the changes were applied.",
      failure: "The bulk operation did not complete. Please try again.",
    },
  });

  return { status, error, result, subscribe, reset };
}

