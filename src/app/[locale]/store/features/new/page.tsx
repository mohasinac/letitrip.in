"use client";

import { useRouter } from "@/i18n/navigation";
import { Button, Div, Heading, Input, Row, Stack, Text } from "@mohasinac/appkit/client";
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
    <Div className="mx-auto max-w-2xl px-4 py-6">
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
            <Button type="button" variant="outline" onClick={() => router.push(String(ROUTES.STORE.FEATURES))}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">Create Feature</Button>
          </Row>
        </Stack>
      </form>
    </Div>
  );
}
