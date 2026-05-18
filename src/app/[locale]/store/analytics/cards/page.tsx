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
  Toggle,
  useToast,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";
import type { AnalyticsCardDocument } from "@mohasinac/appkit";

export default function Page() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AnalyticsCardDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(API_ROUTES.STORE.ANALYTICS_CARDS)
      .then((r) => r.json())
      .then((j) => setItems(j?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (id: string, current: boolean) => {
    const res = await fetch(API_ROUTES.STORE.ANALYTICS_CARD_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !current }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isVisible: !current } : it)),
      );
    } else {
      showToast("Toggle failed", "error");
    }
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Row className="items-center justify-between">
            <Heading level={1}>Analytics Cards</Heading>
            <Button variant="primary">New custom card</Button>
          </Row>
          <Text className="text-zinc-600 dark:text-slate-400">
            Built-in cards ship by default. Toggle visibility or add custom cards.
          </Text>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState title="No cards" description="Add a custom analytics card to your dashboard." />
          ) : (
            <Stack gap="sm">
              {items.map((c) => (
                <Row
                  key={c.id}
                  className="items-center justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs">
                    <Text className="font-medium">{c.title}</Text>
                    <Text className="text-xs text-zinc-500">
                      {c.type} · metric {c.metric}
                      {c.isBuiltIn ? " · built-in" : ""}
                    </Text>
                  </Stack>
                  <Toggle
                    checked={c.isVisible}
                    onChange={() => toggle(c.id, c.isVisible)}
                    label="Visible"
                  />
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
