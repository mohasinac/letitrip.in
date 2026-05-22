"use client";

import { useState } from "react";
import { THEME_CONSTANTS, API_ROUTES } from "@/constants";
import { Text, Label, Div, Input, Button } from "@mohasinac/appkit/ui";
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
    <form onSubmit={onSubmit} className={`mx-auto flex w-full max-w-xl flex-col ${THEME_CONSTANTS.spacing.gap.xs}`}>
      <Label htmlFor="homepage-newsletter-email" className="sr-only">
        Email address
      </Label>
      <Div className={`flex w-full flex-col ${THEME_CONSTANTS.spacing.gap.xs} sm:flex-row`} data-section="homepagenewsletterform-div-9">
        <Input
          id="homepage-newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={pending}
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <Button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
    </form>
  );
}
