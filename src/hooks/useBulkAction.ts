"use client";

/**
 * useBulkAction
 *
 * Generic mutation hook for any `/bulk` endpoint.
 * Handles loading state, partial-success result tracking, optional confirmation
 * flow for destructive operations, and success/error callbacks.
 *
 * Pair with `useBulkSelection` and `BulkActionBar` for the full pattern.
 *
 * @example — simple action (no confirmation required)
 * ```tsx
 * const { showSuccess, showError } = useMessage();
 * const selection = useBulkSelection({ items, keyExtractor: (p) => p.id });
 *
 * const bulkPublish = useBulkAction({
 *   mutationFn: (payload) => adminService.bulkProducts(payload),
 *   onSuccess: (result) => {
 *     showSuccess(`${result.summary.succeeded} products published`);
 *     selection.clearSelection();
 *     refetch();
 *   },
 *   onError: (err) => showError(err.message),
 * });
 *
 * // Trigger:
 * <Button onClick={() =>
 *   bulkPublish.execute({ action: 'publish', ids: selection.selectedIds })
 * }>
 *   Publish
 * </Button>
 * ```
 *
 * @example — destructive action (requires confirmation modal)
 * ```tsx
 * const bulkDelete = useBulkAction({
 *   mutationFn: (payload) => adminService.bulkProducts(payload),
 *   requiresConfirm: true,
 *   onSuccess: (result) => {
 *     showSuccess(`${result.summary.succeeded} products deleted`);
 *     selection.clearSelection();
 *     refetch();
 *   },
 *   onError: (err) => showError(err.message),
 * });
 *
 * // Delete button — just calls execute(); the hook parks the payload:
 * <Button variant="danger" onClick={() =>
 *   bulkDelete.execute({ action: 'delete', ids: selection.selectedIds, confirm: true })
 * }>
 *   Delete selected
 * </Button>
 *
 * // Confirm modal wired to the confirmation flow:
 * <ConfirmDeleteModal
 *   isOpen={Boolean(bulkDelete.pendingPayload)}
 *   onClose={bulkDelete.cancelConfirm}
 *   onConfirm={bulkDelete.confirmAndExecute}
 *   isDeleting={bulkDelete.isLoading}
 *   title={`Delete ${bulkDelete.pendingPayload?.ids.length ?? 0} items?`}
 *   message="This cannot be undone."
 * />
 * ```
 */

import { useState, useCallback, useRef } from "react";
import { ApiClientError } from "@/lib/api-client";
import type { BulkActionResult, BulkActionPayload } from "@/types/api";

export interface UseBulkActionOptions<
  TPayload extends BulkActionPayload,
  TData = Record<string, unknown>,
> {
  /**
   * Service function that POSTs to the bulk endpoint.
   * Must return `Promise<BulkActionResult<TData>>`.
   *
   * @example
   * mutationFn: (p) => adminService.bulkProducts(p)
   */
  mutationFn: (payload: TPayload) => Promise<BulkActionResult<TData>>;
  /**
   * Called when `mutationFn` resolves successfully (even for partial failures).
   * Inspect `result.summary` to decide your feedback message.
   * Use to refetch data, clear selection, and show toasts.
   */
  onSuccess?: (
    result: BulkActionResult<TData>,
    payload: TPayload,
  ) => void | Promise<void>;
  /**
   * Called when `mutationFn` rejects with an `ApiClientError`
   * (e.g. 401, 403, 400 validation failures).
   * Use to show an error toast.
   */
  onError?: (error: ApiClientError, payload: TPayload) => void;
  /**
   * When `true`, calling `execute()` does NOT immediately invoke `mutationFn`.
   * Instead the payload is parked in `pendingPayload`. The caller renders a
   * `ConfirmDeleteModal` wired to `confirmAndExecute` / `cancelConfirm`.
   *
   * Use for ALL destructive actions (delete, bulk-cancel, hard-revoke).
   */
  requiresConfirm?: boolean;
}

export interface UseBulkActionReturn<
  TPayload extends BulkActionPayload,
  TData = Record<string, unknown>,
> {
  /**
   * Trigger the bulk action for the given payload.
   * - When `requiresConfirm` is `false` (default), runs the mutation immediately.
   * - When `requiresConfirm` is `true`, parks the payload in `pendingPayload`
   *   and waits for `confirmAndExecute` to be called.
   */
  execute: (payload: TPayload) => Promise<void>;
  /** `true` while the mutation is in flight. */
  isLoading: boolean;
  /**
   * The last `BulkActionResult` returned by the endpoint.
   * `null` before the first successful call or after `reset()`.
   * Inspect `result.summary` and `result.failed` to build feedback messages.
   */
  result: BulkActionResult<TData> | null;
  /**
   * The last `ApiClientError` if the mutation threw.
   * `null` on success or before the first call.
   */
  error: ApiClientError | null;
  /** Reset `result`, `error`, and `pendingPayload` back to their initial state. */
  reset: () => void;
  /**
   * The payload awaiting user confirmation.
   * Non-null only when `requiresConfirm` is `true` and `execute()` has been called.
   * Pass `pendingPayload.ids.length` to the confirm modal title/body.
   */
  pendingPayload: TPayload | null;
  /**
   * Call from the confirm modal's `onConfirm` prop.
   * Clears `pendingPayload` and runs the mutation with the parked payload.
   */
  confirmAndExecute: () => Promise<void>;
  /**
   * Call from the confirm modal's `onClose` / cancel prop.
   * Clears `pendingPayload` without running the mutation.
   */
  cancelConfirm: () => void;
}

export function useBulkAction<
  TPayload extends BulkActionPayload = BulkActionPayload,
  TData = Record<string, unknown>,
>(
  options: UseBulkActionOptions<TPayload, TData>,
): UseBulkActionReturn<TPayload, TData> {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkActionResult<TData> | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [pendingPayload, setPendingPayload] = useState<TPayload | null>(null);

  // Store options in a ref so callbacks stay current without needing to be
  // listed as dependencies of the stable `runMutation` callback.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const runMutation = useCallback(async (payload: TPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await optionsRef.current.mutationFn(payload);
      setResult(res);
      await optionsRef.current.onSuccess?.(res, payload);
    } catch (err) {
      const apiErr =
        err instanceof ApiClientError
          ? err
          : new ApiClientError(
              (err as Error)?.message ?? "Unexpected error",
              0,
            );
      setError(apiErr);
      optionsRef.current.onError?.(apiErr, payload);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const execute = useCallback(
    async (payload: TPayload) => {
      if (optionsRef.current.requiresConfirm) {
        setPendingPayload(payload);
        return;
      }
      await runMutation(payload);
    },
    [runMutation],
  );

  const confirmAndExecute = useCallback(async () => {
    if (!pendingPayload) return;
    const payload = pendingPayload;
    setPendingPayload(null);
    await runMutation(payload);
  }, [pendingPayload, runMutation]);

  const cancelConfirm = useCallback(() => setPendingPayload(null), []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setPendingPayload(null);
  }, []);

  return {
    execute,
    isLoading,
    result,
    error,
    reset,
    pendingPayload,
    confirmAndExecute,
    cancelConfirm,
  };
}
