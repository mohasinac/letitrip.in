"use client";
import { normalizeError } from "@mohasinac/appkit";

import { useCallback, useState } from "react";
import { z } from "zod";
import { API_ROUTES } from "@/constants";
import { THEMED_TEXT_SUCCESS } from "@/constants";
import { Button, FieldInput, Form, Stack, Text } from "@mohasinac/appkit/ui";
import { useApiMutation, useToast } from "@mohasinac/appkit/client";
import { apiClient } from "@mohasinac/appkit/client";

const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export function HomepageNewsletterForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast();

  const subscribeMutation = useApiMutation({
    mutationFn: (payload: { email: string }) =>
      apiClient.post(API_ROUTES.NEWSLETTER.SUBSCRIBE, {
        ...payload,
        source: "homepage",
      }),
    onSuccess: () => {
      const message = "Thanks for subscribing. Check your inbox for updates.";
      setSuccess(message);
      showToast(message, "success");
      setEmail("");
    },
  });

  const handleSubscribe = useCallback(
    (
      setFieldError: (name: string, message: string) => void,
      clearErrors: () => void,
    ) =>
    async () => {
      setSuccess(null);
      clearErrors();
      const parsed = newsletterSchema.safeParse({ email: email.trim() });
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) =>
          setFieldError(String(issue.path[0]), issue.message),
        );
        return;
      }
      try {
        await subscribeMutation.mutateAsync(parsed.data);
      } catch (_err) {
        void normalizeError(_err);
        const message = "Could not subscribe right now. Please try again.";
        setFieldError("email", message);
        showToast(message, "error");
      }
    },
    [email, subscribeMutation, showToast],
  );

  return (
    <Form
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full max-w-xl flex-col gap-[var(--appkit-space-1)]"
    >
      {({ setFieldError, clearErrors }) => (
        <>
          <Stack direction="sm-row" className="w-full" gap="xs" data-section="homepagenewsletterform-div-9">
            <FieldInput
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={subscribeMutation.isPending}
              className="min-w-0 flex-1"
            />
            <Button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="w-full sm:w-auto"
              onClick={handleSubscribe(setFieldError, clearErrors)}
            >
              {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
            </Button>
          </Stack>
          {success ? (
            <Text size="sm" className={THEMED_TEXT_SUCCESS} role="status">
              {success}
            </Text>
          ) : null}
        </>
      )}
    </Form>
  );
}
