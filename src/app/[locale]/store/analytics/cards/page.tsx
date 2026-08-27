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
  Skeleton,
  QuickFormDrawer,
  analyticsCardCreateSchema,
  ANALYTICS_CARD_TYPES,
  type FormValues,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import {
  getAnalyticsCards,
  updateAnalyticsCard,
  createAnalyticsCard,
} from "@/lib/api/store-client";
import { useEffect, useState } from "react";
import type { AnalyticsCardDocument } from "@mohasinac/appkit/client";

/**
 * Card types come from ANALYTICS_CARD_TYPES, which is derived from a
 * `Record<AnalyticsCardType, true>` — so a new card type cannot be omitted
 * here without failing to compile (Root Cause #61).
 */
const CARD_TYPE_OPTIONS = ANALYTICS_CARD_TYPES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export default function Page() {
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<AnalyticsCardDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAnalyticsCards(API_ROUTES.STORE.ANALYTICS_CARDS)
      .then((r) => r.json())
      .then((j) => setItems(j?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (id: string, current: boolean) => {
    const res = await updateAnalyticsCard(API_ROUTES.STORE.ANALYTICS_CARD_BY_ID(id), { isVisible: !current });
    if (res.ok) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isVisible: !current } : it)),
      );
    } else {
      showToast("Toggle failed", "error");
    }
  };

  /*
   * The button above had NO onClick — a dead CTA, while
   * `POST /api/store/analytics/cards` and `analyticsCardCreateSchema` both
   * existed and had no caller between them. Same shape as the W5
   * `/store/features/new` page that collected a field and never called an API.
   *
   * A drawer rather than a page: this is a short create on top of a list the
   * seller is already reading, which is exactly the quick-mode case.
   */
  const onCreate = async (values: FormValues) => {
    setSaving(true);
    const res = await createAnalyticsCard(
      API_ROUTES.STORE.ANALYTICS_CARDS,
      values as never,
    );
    setSaving(false);

    if (res.ok) {
      showToast("Card created.", "success");
      setCreating(false);
      load();
      return;
    }
    const body = (await res.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;
    showToast(body?.error ?? body?.message ?? "Could not create that card.", "error");
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Row justify="between">
            <Heading level={1}>Analytics Cards</Heading>
            <Button variant="primary" onClick={() => setCreating(true)}>
              New custom card
            </Button>
          </Row>
          <Text color="muted">
            Built-in cards ship by default. Toggle visibility or add custom cards.
          </Text>
          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
            </Stack>
          ) : items.length === 0 ? (
            <EmptyState title="No cards" description="Add a custom analytics card to your dashboard." />
          ) : (
            <Stack gap="sm">
              {items.map((c) => (
                <Row
                  key={c.id} rounded="default" padding="md" border="default" align="center" justify="between">
                  <Stack gap="xs">
                    <Text weight="medium">{c.title}</Text>
                    <Text size="xs" color="muted">
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

      <QuickFormDrawer
        isOpen={creating}
        onClose={() => setCreating(false)}
        title="New custom card"
        schema={analyticsCardCreateSchema}
        isLoading={saving}
        submitLabel="Create card"
        onSubmit={onCreate}
        defaultValues={{ type: "metric", isVisible: true }}
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            options: CARD_TYPE_OPTIONS,
          },
          {
            name: "metric",
            label: "Metric",
            type: "text",
            required: true,
            helperText: "The metric key this card reads, e.g. orders.total",
          },
          { name: "isVisible", label: "Visible on the dashboard", type: "toggle" },
        ]}
      />
    </Section>
  );
}
