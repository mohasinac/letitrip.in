"use client";

import { useApiMutation } from "@/hooks";
import {
  subscribeNewsletterAction,
  type SubscribeNewsletterInput,
} from "@/actions";

/**
 * useNewsletter
 * Wraps `subscribeNewsletterAction` (Server Action) as a `useApiMutation` for
 * newsletter subscription forms (footer, homepage popup, checkout opt-in, etc.).
 */
export function useNewsletter() {
  return useApiMutation<{ subscribed: boolean }, SubscribeNewsletterInput>({
    mutationFn: (data) => subscribeNewsletterAction(data),
  });
}
