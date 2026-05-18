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
import type { ListingTemplateDocument } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<ListingTemplateDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ROUTES.STORE.LISTING_TEMPLATES)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Row className="items-center justify-between">
            <Heading level={1}>Listing Templates</Heading>
            <Button
              variant="primary"
              onClick={() => router.push(String(ROUTES.STORE.LISTING_TEMPLATES_NEW))}
            >
              New template
            </Button>
          </Row>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState
              title="No templates yet"
              description="Templates pre-fill the create form with your defaults for each listing type."
            />
          ) : (
            <Stack gap="sm">
              {items.map((t) => (
                <Row
                  key={t.id}
                  className="items-center justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs">
                    <Text className="font-medium">{t.name}</Text>
                    <Text className="text-xs text-zinc-500">
                      {t.listingType} · used {t.usageCount}× ·{" "}
                      {t.isShared ? "Shared" : "Private"}
                    </Text>
                  </Stack>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(String(ROUTES.STORE.LISTING_TEMPLATES_EDIT(t.id)))
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
