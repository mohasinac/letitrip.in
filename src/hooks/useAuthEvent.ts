"use client";

/**
 * useAuthEvent
 *
 * Client-side handler for the RTDB OAuth popup bridge.
 * Thin domain wrapper over `useRealtimeEvent` scoped to `auth_events`.
 *
 * Flow recap (full detail in docs/AUTH.md §5):
 *  1. Server returns { eventId, customToken } from POST /api/auth/event/init.
 *  2. This hook subscribes to /auth_events/{eventId} using the custom token.
 *  3. On status "success" → caller calls router.refresh() to pick up the
 *     __session cookie the popup callback route already set.
 *
 * @example
 * ```tsx
 * const authEvent = useAuthEvent();
 *
 * const handleGoogleLogin = async () => {
 *   const { eventId, customToken } = await authEventService.initAuthEvent();
 *   window.open(`/api/auth/google/start?eventId=${eventId}`, 'oauth', 'width=500,height=600');
 *   authEvent.subscribe(eventId, customToken);
 * };
 *
 * useEffect(() => {
 *   if (authEvent.status === RealtimeEventStatus.SUCCESS) router.refresh();
 *   if (authEvent.status === RealtimeEventStatus.FAILED) showMessage(authEvent.error);
 * }, [authEvent.status]);
 * ```
 */

import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import {
  RealtimeEventType,
  RealtimeEventStatus,
  useRealtimeEvent,
} from "./useRealtimeEvent";
import { ERROR_MESSAGES } from "@/constants";

// Re-export so existing callers typed against AuthEventStatus continue to compile.
export type { RealtimeEventStatus as AuthEventStatus };

export interface UseAuthEventReturn {
  status: RealtimeEventStatus;
  /** Error message from the server, present when status === 'failed'. */
  error: string | null;
  subscribe: (eventId: string, customToken: string) => void;
  reset: () => void;
}

const AUTH_EVENT_TIMEOUT_MS = 2 * 60 * 1000;

export function useAuthEvent(): UseAuthEventReturn {
  const { status, error, subscribe, reset } = useRealtimeEvent<undefined>({
    type: RealtimeEventType.AUTH,
    rtdbPath: RTDB_PATHS.AUTH_EVENTS,
    timeoutMs: AUTH_EVENT_TIMEOUT_MS,
    messages: {
      tokenFailure: ERROR_MESSAGES.AUTH.SIGNIN_INIT_FAILED,
      connectionLost: ERROR_MESSAGES.AUTH.SIGNIN_CONNECTION_LOST,
      timedOut: ERROR_MESSAGES.AUTH.SIGNIN_TIMED_OUT,
      failure: ERROR_MESSAGES.AUTH.SIGN_IN_FAILED,
    },
  });

  return { status, error, subscribe, reset };
}
