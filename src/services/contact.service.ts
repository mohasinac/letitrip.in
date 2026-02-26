/**
 * Contact Service
 * Pure async functions for the contact form API call.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const contactService = {
  /** Send a contact message */
  send: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => apiClient.post(API_ENDPOINTS.CONTACT.SEND, data),
};
