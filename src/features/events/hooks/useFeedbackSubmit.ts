"use client";

import { useApiMutation } from "@/hooks";
import { eventService } from "@/services";

/**
 * useFeedbackSubmit
 * Wraps `eventService.enter(eventId, data)` mutation for feedback/survey submission.
 * The component's `onSuccess` / `onError` callbacks are forwarded via options
 * so state updates and toasts remain in the component.
 */
export function useFeedbackSubmit(
  eventId: string,
  options?: {
    onSuccess?: () => void;
    onError?: () => void;
  },
) {
  return useApiMutation<void, Record<string, unknown>>({
    mutationFn: (data) => eventService.enter(eventId, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
