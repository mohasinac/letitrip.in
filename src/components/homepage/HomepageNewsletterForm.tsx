"use client";

import { useState } from "react";
import { z } from "zod";
import { THEME_CONSTANTS, API_ROUTES } from "@/constants";
import { Text, Div, Button, Form, FieldInput } from "@mohasinac/appkit/ui";
import { FormShellContext, useFormShellState, useToast } from "@mohasinac/appkit/client";

const newsletterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export function HomepageNewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { shellCtx, setFieldError, clearErrors, validate } = useFormShellState(newsletterSchema as unknown as Parameters<typeof useFormShellState>[0]);
  const { showToast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    clearErrors();

    const parsed = validate<{ email: string }>({ email: email.trim() });
    if (!parsed) return;

    setPending(true);
    try {
      const response = await fetch(API_ROUTES.NEWSLETTER.SUBSCRIBE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.email, source: "homepage" }),
      });

      if (!response.ok) {
        const message = "Could not subscribe right now. Please try again.";
        setFieldError("email", message);
        showToast(message, "error");
        return;
      }

      const message = "Thanks for subscribing. Check your inbox for updates.";
      setSuccess(message);
      showToast(message, "success");
      setEmail("");
    } catch {
      const message = "Could not subscribe right now. Please try again.";
      setFieldError("email", message);
      showToast(message, "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <FormShellContext.Provider value={shellCtx}>
      <Form onSubmit={onSubmit} className={`mx-auto flex w-full max-w-xl flex-col ${THEME_CONSTANTS.spacing.gap.xs}`}>
        <Div className={`flex w-full flex-col ${THEME_CONSTANTS.spacing.gap.xs} sm:flex-row`} data-section="homepagenewsletterform-div-9">
          <FieldInput
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={pending}
            className="min-w-0 flex-1"
          />
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Subscribing..." : "Subscribe"}
          </Button>
        </Div>
        {success ? (
          <Text size="sm" className={`${THEME_CONSTANTS.themed.textSuccess}`} role="status">
            {success}
          </Text>
        ) : null}
      </Form>
    </FormShellContext.Provider>
  );
}
