"use client";

import { useApiMutation } from "@/hooks";
import { eventService } from "@/services";
import type {
  EventDocument,
  EventCreateInput,
  EventUpdateInput,
  EventStatus,
} from "@/db/schema";

// --- Create ---
export function useCreateEvent(onSuccess?: (event: EventDocument) => void) {
  return useApiMutation<EventDocument, EventCreateInput>({
    mutationFn: (data) => eventService.adminCreate(data),
    onSuccess,
  });
}

// --- Update ---
interface UpdateEventVars {
  id: string;
  data: EventUpdateInput;
}

export function useUpdateEvent(onSuccess?: (event: EventDocument) => void) {
  return useApiMutation<EventDocument, UpdateEventVars>({
    mutationFn: ({ id, data }) => eventService.adminUpdate(id, data),
    onSuccess,
  });
}

// --- Delete ---
export function useDeleteEvent(onSuccess?: () => void) {
  return useApiMutation<void, string>({
    mutationFn: (id) => eventService.adminDelete(id),
    onSuccess,
  });
}

// --- Change Status ---
interface ChangeStatusVars {
  id: string;
  status: EventStatus;
}

export function useChangeEventStatus(
  onSuccess?: (event: EventDocument) => void,
) {
  return useApiMutation<EventDocument, ChangeStatusVars>({
    mutationFn: ({ id, status }) => eventService.adminSetStatus(id, status),
    onSuccess,
  });
}

// --- Review Entry ---
interface ReviewEntryVars {
  eventId: string;
  entryId: string;
  reviewStatus: "approved" | "flagged";
  reviewNote?: string;
}

export function useReviewEntry(onSuccess?: () => void) {
  return useApiMutation<void, ReviewEntryVars>({
    mutationFn: ({ eventId, entryId, reviewStatus, reviewNote }) =>
      eventService.adminUpdateEntry(eventId, entryId, {
        reviewStatus,
        reviewNote,
      }),
    onSuccess,
  });
}
