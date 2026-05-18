"use client";

import { useRouter } from "@/i18n/navigation";
import { Button, Div, Heading, Input, Row, Stack, Text, ACTIONS } from "@mohasinac/appkit/client";
import { useState } from "react";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) { setError("Feature label is required."); return; }
    router.push(String(ROUTES.STORE.FEATURES));
  };

  return (
    <Div className="mx-auto max-w-2xl">
      <Heading level={1} className="mb-6 text-2xl font-semibold">New Feature Badge</Heading>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && <Text color="danger">{error}</Text>}
          <Input
            name="label"
            label="Feature Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Free Shipping"
            required
          />
          <Row gap="sm" justify="end">
            <Button type="button" onClick={() => router.push(String(ROUTES.STORE.FEATURES))} action={ACTIONS.STORE["cancel-form"]} />
            <Button type="submit" action={ACTIONS.STORE["create-feature"]} />
          </Row>
        </Stack>
      </form>
    </Div>
  );
}
