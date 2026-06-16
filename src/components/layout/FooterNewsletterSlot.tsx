"use client";

import { useState } from "react";
import { Button, Div, FieldInput, Form, Row, Text } from "@mohasinac/appkit/ui";
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
      <Text size="sm" className="text-[color:var(--appkit-color-primary)]" weight="medium">
        Thanks for subscribing!
      </Text>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
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
          disabled={pending}
          className="flex-1 min-w-0"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={pending}
          className="flex-shrink-0"
        >
          {pending ? "…" : "Subscribe"}
        </Button>
      </Row>
    </Form>
  );
}
