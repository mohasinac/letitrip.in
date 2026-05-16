"use client";

import { useRouter } from "@/i18n/navigation";
import { Button, Div, Heading, Input, Row, Stack, Text } from "@mohasinac/appkit/client";
import { useState } from "react";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Bundle name is required."); return; }
    router.push(String(ROUTES.STORE.BUNDLES));
  };

  return (
    <Div className="mx-auto max-w-2xl px-4 py-6">
      <Heading level={1} className="mb-6 text-2xl font-semibold">New Bundle</Heading>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && <Text color="danger">{error}</Text>}
          <Input
            name="name"
            label="Bundle Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starter Pack"
            required
          />
          <Row gap="sm" justify="end">
            <Button type="button" variant="outline" onClick={() => router.push(String(ROUTES.STORE.BUNDLES))}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">Create Bundle</Button>
          </Row>
        </Stack>
      </form>
    </Div>
  );
}
