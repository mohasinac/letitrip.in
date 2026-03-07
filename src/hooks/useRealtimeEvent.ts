"use client";

/**
 * useRealtimeEvent — Generic RTDB Event Bridge Hook
 *
 * Shared plumbing for any pattern where the server writes the outcome of an
 * async operation to a Realtime Database node, and the client subscribes to
 * learn the result in real-time.
 *
 * Current bridges built on this hook:
 *  - OAuth popup bridge  → useAuthEvent   (auth_events/{id})
 *  - Razorpay payment    → usePaymentEvent (payment_events/{id})
 *
 * Lifecycle:
 *  1. Caller calls `subscribe(eventId, customToken)`.
 *  2. Hook signs the secondary `realtimeApp` in with the custom token
 *     (the token encodes a claim that scopes reads to exactly one RTDB node).
 *  3. Hook subscribes `onValue` to `{rtdbPath}/{eventId}`.
 *  4. On status "success" or "failed"/"error", cleans up and transitions to
 *     the matching terminal state.
 *  5. A hard timeout fires if no terminal state is reached within `timeoutMs`.
 *  6. Tear-down on unmount removes the listener and signs the secondary app out.
 *
 * Configuration is treated as static — changes after mount are ignored.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ref, onValue, type DatabaseReference } from "firebase/database";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
import { realtimeApp, chatRealtimeDb } from "@/lib/firebase/realtime";
import { logger } from "@/classes";
import { ERROR_MESSAGES } from "@/constants";

// ─── Event Type Enum ────────────────────────────────────────────────────────

/**
 * Identifies which RTDB event bridge a hook instance is handling.
 * Used as the `type` field in `UseRealtimeEventConfig` for logging and
 * any future dispatch/routing logic.
 */
export const RealtimeEventType = {
  AUTH: "auth",
  PAYMENT: "payment",
  CHAT: "chat",
  BID: "bid",
  BULK: "bulk",
} as const;

export type RealtimeEventType =
  (typeof RealtimeEventType)[keyof typeof RealtimeEventType];

// ─── Status Enum ────────────────────────────────────────────────────────────

/**
 * Unified status state machine for all RTDB event bridges.
 *
 * Transition graph:
 *   idle → subscribing → pending → success
 *                                ↘ failed
 *                      → timeout
 */
export const RealtimeEventStatus = {
  IDLE: "idle",
  SUBSCRIBING: "subscribing",
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  TIMEOUT: "timeout",
} as const;

export type RealtimeEventStatus =
  (typeof RealtimeEventStatus)[keyof typeof RealtimeEventStatus];

// ─── Shared Types ────────────────────────────────────────────────────────────

/** Raw payload shape expected from any RTDB event node. */
export interface RTDBEventPayload {
  /** Server-written outcome string. `"error"` is normalised to `"failed"`. */
  status: "pending" | "success" | "failed" | "error";
  /** Optional server error message. */
  error?: string;
  /** Any additional domain-specific fields (e.g. `orderIds`). */
  [key: string]: unknown;
}

export interface RealtimeEventMessages {
  /** Shown when `signInWithCustomToken` throws. */
  tokenFailure?: string;
  /** Shown when the RTDB `onValue` subscription itself errors. */
  connectionLost?: string;
  /** Shown when the timeout fires before a terminal status is reached. */
  timedOut?: string;
  /** Shown when the node transitions to `status === "failed"/"error"`. */
  failure?: string;
}

export interface UseRealtimeEventConfig<TData = undefined> {
  /** Identifies this bridge for logging — use `RealtimeEventType.*`. */
  type: RealtimeEventType;
  /** RTDB path prefix (e.g. `RTDB_PATHS.AUTH_EVENTS`). */
  rtdbPath: string;
  /** How long to wait before timing out in ms. Default: 3 minutes. */
  timeoutMs?: number;
  /**
   * Extract typed success data from the raw RTDB snapshot.
   * Return `null` for event types that carry no payload beyond `status`.
   * Omit entirely if TData is `undefined`.
   */
  extractData?: (raw: RTDBEventPayload) => TData | null;
  /** Override the default user-facing error messages. */
  messages?: RealtimeEventMessages;
}

export interface UseRealtimeEventReturn<TData = undefined> {
  status: RealtimeEventStatus;
  error: string | null;
  /** Populated only on `status === "success"` when `extractData` is provided. */
  data: TData | null;
  subscribe: (eventId: string, customToken: string) => void;
  reset: () => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 3 * 60 * 1000;

const DEFAULT_MESSAGES: Required<RealtimeEventMessages> = {
  tokenFailure: ERROR_MESSAGES.REALTIME.INIT_FAILED,
  connectionLost: ERROR_MESSAGES.REALTIME.CONNECTION_LOST,
  timedOut: ERROR_MESSAGES.REALTIME.TIMED_OUT,
  failure: ERROR_MESSAGES.REALTIME.OPERATION_FAILED,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Generic RTDB event bridge hook.
 *
 * @example
 * // Auth popup bridge (2-min timeout, no extra payload)
 * const { status, error, subscribe, reset } = useRealtimeEvent({
 *   type: RealtimeEventType.AUTH,
 *   rtdbPath: RTDB_PATHS.AUTH_EVENTS,
 *   timeoutMs: 2 * 60 * 1000,
 * });
 *
 * @example
 * // Payment bridge (5-min timeout, receives orderIds on success)
 * const { status, data: orderIds, subscribe, reset } = useRealtimeEvent<string[]>({
 *   type: RealtimeEventType.PAYMENT,
 *   rtdbPath: RTDB_PATHS.PAYMENT_EVENTS,
 *   timeoutMs: 5 * 60 * 1000,
 *   extractData: (raw) => (raw.orderIds as string[]) ?? null,
 * });
 */
export function useRealtimeEvent<TData = undefined>(
  config: UseRealtimeEventConfig<TData>,
): UseRealtimeEventReturn<TData> {
  // Capture config in a ref — treated as static after mount.
  const configRef = useRef(config);

  const [status, setStatus] = useState<RealtimeEventStatus>(
    RealtimeEventStatus.IDLE,
  );
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const dbRefRef = useRef<DatabaseReference | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventIdRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    dbRefRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    signOut(getAuth(realtimeApp)).catch(() => {});
  }, []);

  const subscribe = useCallback(
    (eventId: string, customToken: string) => {
      const {
        type,
        rtdbPath,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        extractData,
        messages = {},
      } = configRef.current;

      const msg: Required<RealtimeEventMessages> = {
        ...DEFAULT_MESSAGES,
        ...messages,
      };

      cleanup();
      eventIdRef.current = eventId;
      setStatus(RealtimeEventStatus.SUBSCRIBING);
      setError(null);
      setData(null);

      (async () => {
        try {
          await signInWithCustomToken(getAuth(realtimeApp), customToken);
        } catch (authErr) {
          logger.error(
            `useRealtimeEvent[${type}]: custom token sign-in failed`,
            authErr,
          );
          setError(msg.tokenFailure);
          setStatus(RealtimeEventStatus.FAILED);
          cleanup();
          return;
        }

        // Guard against a stale call superseded before sign-in finished.
        if (eventIdRef.current !== eventId) {
          cleanup();
          return;
        }

        setStatus(RealtimeEventStatus.PENDING);

        const dbRef = ref(chatRealtimeDb, `${rtdbPath}/${eventId}`);
        dbRefRef.current = dbRef;

        unsubscribeRef.current = onValue(
          dbRef,
          (snapshot) => {
            if (!snapshot.exists()) return;
            const raw = snapshot.val() as RTDBEventPayload | null;
            if (!raw) return;

            if (raw.status === "success") {
              cleanup();
              if (extractData) setData(extractData(raw));
              setStatus(RealtimeEventStatus.SUCCESS);
            } else if (raw.status === "failed" || raw.status === "error") {
              cleanup();
              setError(raw.error ?? msg.failure);
              setStatus(RealtimeEventStatus.FAILED);
            }
          },
          (rtdbErr) => {
            logger.error(
              `useRealtimeEvent[${type}]: RTDB subscription error`,
              rtdbErr,
            );
            cleanup();
            setError(msg.connectionLost);
            setStatus(RealtimeEventStatus.FAILED);
          },
        );

        timeoutRef.current = setTimeout(() => {
          cleanup();
          setStatus(RealtimeEventStatus.TIMEOUT);
          setError(msg.timedOut);
        }, timeoutMs);
      })();
    },
    [cleanup],
  );

  const reset = useCallback(() => {
    cleanup();
    eventIdRef.current = null;
    setStatus(RealtimeEventStatus.IDLE);
    setError(null);
    setData(null);
  }, [cleanup]);

  useEffect(
    () => () => {
      cleanup();
    },
    [cleanup],
  );

  return { status, error, data, subscribe, reset };
}
