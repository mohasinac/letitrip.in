"use client";

import { useState } from "react";
import { Div, Text } from "@mohasinac/appkit/ui";
import { useToast } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

export function FooterNewsletterSlot() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || pending) return;
    setPending(true);
    try {
      const res = await fetch(API_ROUTES.NEWSLETTER.SUBSCRIBE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      setEmail("");
      showToast("Subscribed! Check your inbox.", "success");
    } catch {
      showToast("Could not subscribe. Please try again.", "error");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <Text size="sm" className="text-[color:var(--appkit-color-primary)] font-medium">
        Thanks for subscribing!
      </Text>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
      <Text size="xs" className="font-medium text-zinc-700 dark:text-zinc-300">
        Get deals &amp; drops in your inbox
      </Text>
      <Div className="flex gap-2 w-full">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={pending}
          className="flex-1 min-w-0 rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[color:var(--appkit-color-primary)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex-shrink-0 rounded-lg bg-[color:var(--appkit-color-primary)] hover:opacity-90 px-4 py-2 text-sm font-medium text-white transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--appkit-color-primary)] focus:ring-offset-2 disabled:opacity-60"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </Div>
    </form>
  );
}
