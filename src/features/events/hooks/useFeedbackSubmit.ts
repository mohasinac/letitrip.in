"use client";

import { useMutation } from "@tanstack/react-query";
import { enterEventAction } from "@/actions";

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
  return useMutation<void, Error, Record<string, unknown>>({
    mutationFn: (data) =>
      enterEventAction(
        eventId,
        data as Parameters<typeof enterEventAction>[1],
      ) as unknown as Promise<void>,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

