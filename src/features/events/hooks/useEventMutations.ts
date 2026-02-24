"use client";

import { useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type {
  EventDocument,
  EventCreateInput,
  EventUpdateInput,
  EventStatus,
} from "@/db/schema";

// --- Create ---
export function useCreateEvent(onSuccess?: (event: EventDocument) => void) {
  return useApiMutation<EventDocument, EventCreateInput>({
    mutationFn: (data) =>
      apiClient.post<EventDocument>(API_ENDPOINTS.ADMIN.EVENTS.LIST, data),
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
    mutationFn: ({ id, data }) =>
      apiClient.put<EventDocument>(API_ENDPOINTS.ADMIN.EVENTS.DETAIL(id), data),
    onSuccess,
  });
}

// --- Delete ---
export function useDeleteEvent(onSuccess?: () => void) {
  return useApiMutation<void, string>({
    mutationFn: (id) =>
      apiClient.delete<void>(API_ENDPOINTS.ADMIN.EVENTS.DETAIL(id)),
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
    mutationFn: ({ id, status }) =>
      apiClient.patch<EventDocument>(API_ENDPOINTS.ADMIN.EVENTS.STATUS(id), {
        status,
      }),
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
      apiClient.patch<void>(
        API_ENDPOINTS.ADMIN.EVENTS.ENTRY(eventId, entryId),
        { reviewStatus, reviewNote },
      ),
    onSuccess,
  });
}
