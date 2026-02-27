"use client";

import { useApiMutation } from "@/hooks";
import { contactService } from "@/services";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * useContactSubmit
 * Wraps `contactService.send()` as a `useApiMutation` for the ContactForm.
 */
export function useContactSubmit() {
  return useApiMutation<void, ContactFormData>({
    mutationFn: (data) => contactService.send(data),
  });
}
