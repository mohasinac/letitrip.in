"use client";

import { useApiMutation } from "@/hooks";
import { sendContactAction, type SendContactInput } from "@/actions";

/**
 * useContactSubmit
 * Wraps `sendContactAction` (Server Action) as a `useApiMutation` for the ContactForm.
 */
export function useContactSubmit() {
  return useApiMutation<{ sent: boolean }, SendContactInput>({
    mutationFn: (data) => sendContactAction(data),
  });
}
