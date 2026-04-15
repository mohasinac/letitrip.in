"use client";

import { useMutation } from "@tanstack/react-query";
import { sendContactAction, type SendContactInput } from "@/actions";

/**
 * useContactSubmit
 * Wraps `sendContactAction` (Server Action) as a `useApiMutation` for the ContactForm.
 */
export function useContactSubmit() {
  return useMutation<{ sent: boolean }, Error, SendContactInput>({
    mutationFn: (data) => sendContactAction(data),
  });
}

