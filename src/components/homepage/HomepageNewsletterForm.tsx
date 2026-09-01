"use client";
import { normalizeError } from "@mohasinac/appkit/client";

import { useCallback, useState } from "react";
import { API_ROUTES } from "@/constants";
import { THEMED_TEXT_SUCCESS } from "@/constants";
import { Button, FieldInput, Form, Stack, Text } from "@mohasinac/appkit/ui";
import { useApiMutation, useToast, useFormShellState } from "@mohasinac/appkit/client";
import { apiClient } from "@mohasinac/appkit/client";
// The local `newsletterSchema` this file used to declare was a third copy of
// the same one-field shape; all three newsletter boxes now share one.
import { newsletterSubscribeSchema } from "@mohasinac/appkit/client";
import { FormErrorSummary } from "@mohasinac/appkit/client";

export function HomepageNewsletterForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast();

  /*
   * State is hoisted to component scope and handed to `<Form shellCtx=…>`
   * rather than left to `<Form>`'s own internal instance.
   *
   * That is what lets the submit handler live outside the render prop, which
   * is what fixes the real bug: the Button carried `type="submit"` AND an
   * `onClick`, while `<Form onSubmit={e => e.preventDefault()}>` swallowed the
   * native submit — so pressing Enter in the email field fired `submit`, not
   * `click`, and nothing at all happened. Only the mouse worked.
   */
  const form = useFormShellState(newsletterSubscribeSchema);

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

  const submit = useCallback(async () => {
    if (subscribeMutation.isPending) return;
    setSuccess(null);
    form.clearErrors();
    // `validate` runs the schema AND pipes any issues to the inline field
    // errors itself, so there is no bare `safeParse` result to forget to use.
    const parsed = form.validate<{ email: string }>({ email: email.trim() });
    if (!parsed) return;
    try {
      await subscribeMutation.mutateAsync(parsed);
    } catch (err) {
      void normalizeError(err);
      // Inline on the field only — the mutation already toasted.
      form.setFieldError("email", "Could not subscribe right now. Please try again.");
    }
  }, [email, form, subscribeMutation]);

  return (
    <Form
      shellCtx={form.shellCtx}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex w-full max-w-xl flex-col gap-[var(--appkit-space-1)]"
    >
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
        {/* No onClick — the native submit path now serves both Enter and click. */}
        <Button
          type="submit"
          disabled={subscribeMutation.isPending}
          className="w-full sm:w-auto"
        >
          {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      </Stack>
      {success ? (
        <Text size="sm" className={THEMED_TEXT_SUCCESS} role="status">
          {success}
        </Text>
      ) : null}
    </Form>
  );
}
