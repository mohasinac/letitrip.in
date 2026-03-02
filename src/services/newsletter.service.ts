/**
 * Newsletter Service
 * Pure async functions for the newsletter subscribe API call.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type { NewsletterSubscriberSource } from "@/db/schema";

export const newsletterService = {
  /** Subscribe an email to the newsletter */
  subscribe: (data: { email: string; source?: NewsletterSubscriberSource }) =>
    apiClient.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, data),
};
