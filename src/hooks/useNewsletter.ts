"use client";

import { useApiMutation } from "@/hooks";
import { newsletterService } from "@/services";
import type { NewsletterSubscriberSource } from "@/db/schema";

interface NewsletterSubscribeData {
  email: string;
  source?: NewsletterSubscriberSource;
}

/**
 * useNewsletter
 * Wraps `newsletterService.subscribe()` as a `useApiMutation` for
 * newsletter subscription forms (footer, homepage popup, checkout opt-in, etc.).
 */
export function useNewsletter() {
  return useApiMutation<void, NewsletterSubscribeData>({
    mutationFn: (data) => newsletterService.subscribe(data),
  });
}
