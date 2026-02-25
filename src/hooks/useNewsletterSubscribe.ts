"use client";

import { useApiMutation } from "./useApiMutation";
import { newsletterService } from "@/services";

interface SubscribePayload {
  email: string;
  name?: string;
}

interface NewsletterSubscribeOptions {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

/**
 * useNewsletterSubscribe
 * Mutation hook for subscribing an email to the newsletter.
 * Used by NewsletterSection and any other subscribe form.
 *
 * @example
 * const { mutate, isLoading } = useNewsletterSubscribe({ onSuccess: () => setSubscribed(true) });
 * mutate({ email: 'user@example.com' });
 */
export function useNewsletterSubscribe(options?: NewsletterSubscribeOptions) {
  return useApiMutation<unknown, SubscribePayload>({
    mutationFn: (data) => newsletterService.subscribe(data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
