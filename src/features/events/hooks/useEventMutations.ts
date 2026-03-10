"use client";

import { useMutation } from "@tanstack/react-query";
import { eventService } from "@/services";
import type {
  EventDocument,
  EventCreateInput,
  EventUpdateInput,
  EventStatus,
} from "@/db/schema";

// --- Create ---
export function useCreateEvent(onSuccess?: (event: EventDocument) => void) {
  return useMutation<EventDocument, Error, EventCreateInput>({
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
  return useMutation<EventDocument, Error, UpdateEventVars>({
    mutationFn: ({ id, data }) => eventService.adminUpdate(id, data),
    onSuccess,
  });
}

// --- Delete ---
export function useDeleteEvent(onSuccess?: () => void) {
  return useMutation<void, Error, string>({
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
  return useMutation<EventDocument, Error, ChangeStatusVars>({
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
  return useMutation<void, Error, ReviewEntryVars>({
    mutationFn: ({ eventId, entryId, reviewStatus, reviewNote }) =>
      eventService.adminUpdateEntry(eventId, entryId, {
        reviewStatus,
        reviewNote,
      }),
    onSuccess,
  });
}

// --- Participate (survey entry) ---

export function useEventEnter(
  eventId: string,
  onSuccess?: () => void,
  onError?: () => void,
) {
  return useMutation<void, Error, Record<string, unknown>>({
    mutationFn: (data) => eventService.enter(eventId, data),
    onSuccess,
    onError,
  });
}
