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
  ROUTES,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";
import type { ShippingConfigDocument } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<ShippingConfigDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ROUTES.STORE.SHIPPING_CONFIGS)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Row className="items-center justify-between">
            <Heading level={1}>Shipping Configurations</Heading>
            <Button
              variant="primary"
              onClick={() => router.push(String(ROUTES.STORE.SHIPPING_CONFIGS_NEW))}
            >
              New config
            </Button>
          </Row>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState
              title="No shipping configs"
              description="Define free, flat-rate, weight-based, or express shipping rules."
            />
          ) : (
            <Stack gap="sm">
              {items.map((m) => (
                <Row
                  key={m.id}
                  className="items-center justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs">
                    <Text className="font-medium">{m.label}</Text>
                    <Text className="text-xs text-zinc-500">
                      {m.method} {m.isDefault ? "· Default" : ""}{" "}
                      {m.estimatedDays ? `· ${m.estimatedDays}d` : ""}
                    </Text>
                  </Stack>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(String(ROUTES.STORE.SHIPPING_CONFIGS_EDIT(m.id)))
                    }
                  >
                    Edit
                  </Button>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
