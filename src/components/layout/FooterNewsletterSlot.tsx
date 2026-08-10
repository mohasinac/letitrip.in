"use client";

import { useState } from "react";
import { Button, FieldInput, Form, Row, Text } from "@mohasinac/appkit/ui";
import { useApiMutation, useToast, apiClient } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

export function FooterNewsletterSlot() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { showToast } = useToast();

  const subscribeMutation = useApiMutation({
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
    onError: () => {
      showToast("Could not subscribe. Please try again.", "error");
    },
  });

  if (done) {
    return (
      <Text size="sm" className="text-[color:var(--appkit-color-primary)]" weight="medium">
        Thanks for subscribing!
      </Text>
    );
  }

  return (
    <Form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-[var(--appkit-space-2)] w-full"
    >
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
        <Button
          type="submit"
          variant="primary"
          disabled={subscribeMutation.isPending}
          className="flex-shrink-0"
          onClick={() => {
            if (!email.trim() || subscribeMutation.isPending) return;
            subscribeMutation.mutate({ email: email.trim() });
          }}
        >
          {subscribeMutation.isPending ? "…" : "Subscribe"}
        </Button>
      </Row>
    </Form>
  );
}
