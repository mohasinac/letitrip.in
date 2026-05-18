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
import type { StoreCategoryDocument } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<StoreCategoryDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ROUTES.STORE.STORE_CATEGORIES)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Row className="items-center justify-between">
            <Heading level={1}>Storefront Categories</Heading>
            <Button
              variant="primary"
              onClick={() => router.push(String(ROUTES.STORE.STORE_CATEGORIES_NEW))}
            >
              New category
            </Button>
          </Row>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState
              title="No storefront categories"
              description="Group products into storefront catalogue sections."
            />
          ) : (
            <Stack gap="sm">
              {items.map((c) => (
                <Row
                  key={c.id}
                  className="items-center justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs">
                    <Text className="font-medium">{c.label}</Text>
                    <Text className="text-xs text-zinc-500">
                      /{c.slug} · {c.productIds.length} products ·{" "}
                      {c.isActive ? "Active" : "Hidden"}
                    </Text>
                  </Stack>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(String(ROUTES.STORE.STORE_CATEGORIES_EDIT(c.id)))
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
