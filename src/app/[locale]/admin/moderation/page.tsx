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
import type { ModerationQueueDocument } from "@mohasinac/appkit";

export default function Page() {
  const [items, setItems] = useState<ModerationQueueDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(API_ROUTES.ADMIN.MODERATION_QUEUE)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const review = async (id: string, status: "approved" | "rejected", reason?: string) => {
    await fetch(API_ROUTES.ADMIN.MODERATION_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    load();
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Moderation Queue</Heading>
          <Text className="text-zinc-600 dark:text-slate-400">
            Pending media awaiting review. Approving releases the asset; rejecting blocks it.
          </Text>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState title="Inbox zero" description="No pending moderation." />
          ) : (
            <Stack gap="sm">
              {items.map((m) => (
                <Row
                  key={m.id}
                  className="items-start justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs" className="flex-1 min-w-0">
                    <Text className="font-medium">
                      {m.mediaType} · {m.entityType} · {m.entityId}
                    </Text>
                    <Text className="text-xs text-zinc-500">
                      Submitted by {m.ownerId} ·{" "}
                      {new Date(m.submittedAt).toLocaleString()}
                    </Text>
                    {m.mediaUrl ? (
                      <Text className="text-xs text-zinc-500 truncate">
                        {m.mediaUrl}
                      </Text>
                    ) : null}
                  </Stack>
                  <Row className="gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => review(m.id, "approved")}
                    >
                      {ACTIONS.ADMIN["approve-product"].label}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        review(m.id, "rejected", prompt("Reason?") ?? "")
                      }
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
