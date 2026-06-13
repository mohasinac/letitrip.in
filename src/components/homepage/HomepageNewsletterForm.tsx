"use client";

import { useState } from "react";
import { THEME_CONSTANTS, API_ROUTES } from "@/constants";
import { Text, Div, Button, Form, FieldInput } from "@mohasinac/appkit/ui";
import { useToast } from "@mohasinac/appkit/client";

export function HomepageNewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(API_ROUTES.NEWSLETTER.SUBSCRIBE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          source: "homepage",
        }),
      });

      if (!response.ok) {
        throw new Error("Could not subscribe right now. Please try again.");
      }

      setSuccess("Thanks for subscribing. Check your inbox for updates.");
      showToast("Thanks for subscribing! Check your inbox for updates.", "success");
      setEmail("");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Could not subscribe right now. Please try again.";
      setError(message);
      showToast(message, "error");
    } finally {
      setPending(false);
    }
  }

  return (
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
        <Button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending ? "Subscribing..." : "Subscribe"}
        </Button>
      </Div>
      {error ? (
        <Text size="sm" className="text-error" role="alert">
          {error}
        </Text>
      ) : null}
      {success ? (
        <Text size="sm" className={`${THEME_CONSTANTS.themed.textSuccess}`} role="status">
          {success}
        </Text>
      ) : null}
    </Form>
  );
}
