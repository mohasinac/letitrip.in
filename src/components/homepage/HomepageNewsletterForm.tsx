"use client";
import { normalizeError } from "@mohasinac/appkit/client";

import { useCallback, useState } from "react";
import { z } from "zod";
import { API_ROUTES } from "@/constants";
import { THEMED_TEXT_SUCCESS } from "@/constants";
import { Button, FieldInput, Form, Stack, Text } from "@mohasinac/appkit/ui";
import { useApiMutation, useToast } from "@mohasinac/appkit/client";
import { apiClient } from "@mohasinac/appkit/client";
// The local `newsletterSchema` this file used to declare was a third copy of
// the same one-field shape; all three newsletter boxes now share one.
import { newsletterSubscribeSchema } from "@mohasinac/appkit/client";
import { FormErrorSummary } from "@mohasinac/appkit/client";


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
      const parsed = newsletterSubscribeSchema.safeParse({ email: email.trim() });
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
        // Inline on the field only — the mutation already toasted.
        setFieldError("email", "Could not subscribe right now. Please try again.");
      }
    },
    [email, subscribeMutation, showToast],
  );

  return (
    <Form schema={newsletterSubscribeSchema}
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full max-w-xl flex-col gap-[var(--appkit-space-1)]"
    >
      {({ setFieldError, clearErrors }) => (
        <>
          <FormErrorSummary />
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
