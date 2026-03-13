"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  changeEventStatusAction,
  adminUpdateEventEntryAction,
  enterEventAction,
} from "@/actions";
import type {
  EventDocument,
  EventCreateInput,
  EventUpdateInput,
  EventStatus,
} from "@/db/schema";

// --- Create ---
export function useCreateEvent(onSuccess?: (event: EventDocument) => void) {
  return useMutation<EventDocument, Error, EventCreateInput>({
    mutationFn: (data) =>
      createEventAction(
        data as unknown as Parameters<typeof createEventAction>[0],
      ) as Promise<EventDocument>,
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
    mutationFn: ({ id, data }) =>
      updateEventAction(
        id,
        data as Parameters<typeof updateEventAction>[1],
      ) as Promise<EventDocument>,
    onSuccess,
  });
}

// --- Delete ---
export function useDeleteEvent(onSuccess?: () => void) {
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteEventAction(id),
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
    mutationFn: ({ id, status }) =>
      changeEventStatusAction({ id, status }) as Promise<EventDocument>,
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
      adminUpdateEventEntryAction({
        eventId,
        entryId,
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
    mutationFn: (data) =>
      enterEventAction(
        eventId,
        data as Parameters<typeof enterEventAction>[1],
      ) as unknown as Promise<void>,
    onSuccess,
    onError,
  });
}
