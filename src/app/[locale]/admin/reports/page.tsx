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
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";
import type { ReportDocument } from "@mohasinac/appkit";

export default function Page() {
  const [items, setItems] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(API_ROUTES.ADMIN.REPORTS)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const action = async (id: string, status: ReportDocument["status"], resolution?: string) => {
    await fetch(API_ROUTES.ADMIN.REPORT_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolution, resolvedAt: status === "actioned" || status === "dismissed" ? new Date() : undefined }),
    });
    load();
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Reports</Heading>
          <Text className="text-zinc-600 dark:text-slate-400">
            Buyer-submitted reports against listings, stores, and users.
          </Text>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState title="No open reports" description="All caught up." />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id}
                  className="items-start justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs" className="flex-1">
                    <Text className="font-medium">
                      {r.reason} · {r.entityType} · {r.entityId}
                    </Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {r.detail}
                    </Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                      by {r.reporterId} · {new Date(r.createdAt).toLocaleString()}
                    </Text>
                  </Stack>
                  <Row className="gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => action(r.id, "under-review")}
                    >
                      Take
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        action(r.id, "actioned", prompt("Resolution note?") ?? "")
                      }
                    >
                      Action
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => action(r.id, "dismissed", "Dismissed")}
                    >
                      Dismiss
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
