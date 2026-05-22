"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  EmptyState,
  Row,
  Section,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";
import type { ItemRequestDocument } from "@mohasinac/appkit";

export default function Page() {
  const [items, setItems] = useState<ItemRequestDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(API_ROUTES.ADMIN.ITEM_REQUESTS)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const action = async (id: string, status: ItemRequestDocument["status"]) => {
    await fetch(API_ROUTES.ADMIN.ITEM_REQUEST_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Item Requests · Approval Queue</Heading>
          <Text className="text-zinc-600 dark:text-slate-400">
            Buyer requests awaiting approval before going live on the community board.
          </Text>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState
              title="Queue empty"
              description="No item requests pending approval."
            />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id}
                  className="items-start justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs" className="flex-1">
                    <Text className="font-medium">{r.title}</Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {r.description}
                    </Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                      by {r.opDisplayName} · status: {r.status}
                    </Text>
                  </Stack>
                  <Row className="gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => action(r.id, "open")}
                    >
                      {ACTIONS.ADMIN["approve-product"].label}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => action(r.id, "rejected")}
                    >
                      {ACTIONS.ADMIN["reject-product"].label}
                    </Button>
                  </Row>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
