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
  Badge,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";
import type { AdminNotificationDocument } from "@mohasinac/appkit";

export default function Page() {
  const [items, setItems] = useState<AdminNotificationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(API_ROUTES.ADMIN.ADMIN_NOTIFICATIONS)
      .then((r) => r.json())
      .then((j) => setItems(j?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id: string) => {
    await fetch(`${API_ROUTES.ADMIN.ADMIN_NOTIFICATIONS}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true, readAt: new Date() }),
    });
    load();
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Admin Notifications</Heading>
          <Text className="text-zinc-600 dark:text-slate-400">
            System, security, moderation, payouts, fraud, and growth alerts surfaced for the admin team.
          </Text>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState title="Inbox zero" description="No unread admin notifications." />
          ) : (
            <Stack gap="sm">
              {items.map((n) => (
                <Row
                  key={n.id}
                  className="items-start justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs" className="flex-1">
                    <Row className="gap-2 items-center">
                      <Text className="font-medium">{n.title}</Text>
                      <Badge variant={n.severity === "error" ? "danger" : n.severity === "warning" ? "warning" : "info"}>
                        {n.severity}
                      </Badge>
                      <Badge variant="default">{n.category}</Badge>
                    </Row>
                    <Text className="text-sm text-zinc-500">{n.body}</Text>
                    <Text className="text-xs text-zinc-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </Text>
                  </Stack>
                  {!n.isRead && (
                    <Button variant="outline" size="sm" onClick={() => markRead(n.id)}>
                      Mark read
                    </Button>
                  )}
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
