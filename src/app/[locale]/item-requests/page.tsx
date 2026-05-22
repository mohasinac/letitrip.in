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
import { useEffect, useState } from "react";
import type { ItemRequestDocument } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<ItemRequestDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/item-requests")
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Row className="items-center justify-between">
            <Heading level={1}>Item Requests</Heading>
            <Button
              variant="primary"
              onClick={() => router.push(String(ROUTES.PUBLIC.ITEM_REQUESTS_NEW))}
            >
              Post a request
            </Button>
          </Row>
          <Text className="text-zinc-600 dark:text-slate-400">
            Looking for something specific? Post a request and sellers will reach out.
          </Text>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState
              title="No open requests yet"
              description="Be the first to post a buyer request."
            />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id}
                  className="items-start justify-between p-4 rounded border border-zinc-200 dark:border-slate-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-slate-800"
                  onClick={() =>
                    router.push(String(ROUTES.PUBLIC.ITEM_REQUEST_DETAIL(r.id)))
                  }
                >
                  <Stack gap="xs" className="flex-1">
                    <Text className="font-medium">{r.title}</Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {r.description}
                    </Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                      by {r.opDisplayName} · {r.replyCount} replies
                      {r.category ? ` · ${r.category}` : ""}
                    </Text>
                  </Stack>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
