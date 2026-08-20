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
  Skeleton,
  ACTIONS,
  ROUTES,
} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { getAdminItemRequests, updateAdminItemRequest } from "@/lib/api/admin-client";
import { useEffect, useState } from "react";
import type { ItemRequestDocument } from "@mohasinac/appkit/client";

export default function Page() {
  const [items, setItems] = useState<ItemRequestDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminItemRequests(API_ROUTES.ADMIN.ITEM_REQUESTS)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const action = async (id: string, status: ItemRequestDocument["status"]) => {
    await updateAdminItemRequest(API_ROUTES.ADMIN.ITEM_REQUEST_BY_ID(id), { status });
    load();
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Item Requests · Approval Queue</Heading>
          <Text color="muted">
            Buyer requests awaiting approval before going live on the community board.
          </Text>
          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
            </Stack>
          ) : items.length === 0 ? (
            <EmptyState
              title="Queue empty"
              description="No item requests pending approval."
            />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id} rounded="default" padding="md" border="default" align="start" justify="between">
                  <Stack gap="xs" className="flex-1">
                    <Text weight="medium">{r.title}</Text>
                    <Text className="line-clamp-2" color="muted" size="xs">
                      {r.description}
                    </Text>
                    <Text size="xs" color="muted">
                      by {r.opDisplayName} · status: {r.status}
                    </Text>
                  </Stack>
                  <Row gap="sm">
                    <Link
                      href={String(ROUTES.ADMIN.ITEM_REQUEST_DETAIL(r.id))}
                      className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline"
                    >
                      View
                    </Link>
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
