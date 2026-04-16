"use client";

import { sendContactAction, type SendContactInput } from "@/actions";
import { useContactSubmit as useAppkitContactSubmit } from "@mohasinac/appkit/features/contact";

/**
 * useContactSubmit
 * Wraps `sendContactAction` (Server Action) as a `useApiMutation` for the ContactForm.
 */
export function useContactSubmit() {
  return useAppkitContactSubmit<SendContactInput, { sent: boolean }>({
    submit: (data) => sendContactAction(data),
  });
}

