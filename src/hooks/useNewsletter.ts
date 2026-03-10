"use client";

import { useMutation } from "@tanstack/react-query";
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
  return useMutation<{ subscribed: boolean }, Error, SubscribeNewsletterInput>({
    mutationFn: (data) => subscribeNewsletterAction(data),
  });
}
