"use client";

import { useMutation } from "@tanstack/react-query";
import { eventService } from "@/services";

export interface PollVotePayload {
  pollVotes: string[];
  pollComment?: string;
}

/**
 * usePollVote
 * Wraps `eventService.enter(eventId, data)` mutation for poll voting.
 * The component's `onSuccess` / `onError` callbacks are forwarded via options
 * so state updates and toasts remain in the component.
 */
export function usePollVote(
  eventId: string,
  options?: {
    onSuccess?: () => void;
    onError?: () => void;
  },
) {
  return useMutation<void, Error, PollVotePayload>({
    mutationFn: (data) => eventService.enter(eventId, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
