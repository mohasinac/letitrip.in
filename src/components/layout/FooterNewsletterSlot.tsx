"use client";

import { useCallback, useState } from "react";
import { Button, FieldInput, Form, Row, Text } from "@mohasinac/appkit/ui";
import {
  useApiMutation,
  useToast,
  apiClient,
  useFormShellState,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { newsletterSubscribeSchema } from "@mohasinac/appkit/client";
import { FormErrorSummary } from "@mohasinac/appkit/client";

export function FooterNewsletterSlot() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { showToast } = useToast();

  /*
   * `<Form schema={…}>` was passed here before but nothing ever ran it — the
   * only guard was `!email.trim()`, so `not-an-email` round-tripped to the
   * server and came back as a toast instead of an inline field error. Sharing
   * one `useFormShellState` with the form is what makes `validate()` reachable
   * from the submit handler.
   */
  const form = useFormShellState(newsletterSubscribeSchema);

  const subscribeMutation = useApiMutation({
    errorMessage: "Could not subscribe. Please try again.",
    mutationFn: (payload: { email: string }) =>
      apiClient.post(API_ROUTES.NEWSLETTER.SUBSCRIBE, {
        ...payload,
        source: "footer",
      }),
    onSuccess: () => {
      setDone(true);
      setEmail("");
      showToast("Subscribed! Check your inbox.", "success");
    },
  });

  const submit = useCallback(() => {
    if (subscribeMutation.isPending) return;
    form.clearErrors();
    // The schema now owns both "required" and "must be an email" — the old
    // `!email.trim()` guard was the only check and it accepted "abc".
    const parsed = form.validate<{ email: string }>({ email: email.trim() });
    if (!parsed) return;
    subscribeMutation.mutate(parsed);
  }, [email, form, subscribeMutation]);

  if (done) {
    return (
      <Text size="sm" className="text-[color:var(--appkit-color-primary)]" weight="medium">
        Thanks for subscribing!
      </Text>
    );
  }

  return (
    <Form
      shellCtx={form.shellCtx}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-[var(--appkit-space-2)] w-full"
    >
      <FormErrorSummary />
      <Text size="xs" weight="medium" color="muted">
        Get deals &amp; drops in your inbox
      </Text>
      <Row gap="sm" className="w-full">
        <FieldInput
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={subscribeMutation.isPending}
          className="flex-1 min-w-0"
        />
        {/* No onClick — the native submit path now serves both Enter and click. */}
        <Button
          type="submit"
          variant="primary"
          disabled={subscribeMutation.isPending}
          className="flex-shrink-0"
        >
          {subscribeMutation.isPending ? "…" : "Subscribe"}
        </Button>
      </Row>
    </Form>
  );
}
