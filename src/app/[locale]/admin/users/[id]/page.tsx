"use client";

import { Button, Code, Container, Divider, Heading, Row, Section, Span, Stack, Tabs, TabsList, TabsTrigger, Text } from "@mohasinac/appkit/client";
import type { JsonValue } from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { getAdminUser } from "@/lib/api/admin-client";
import { useEffect, useState } from "react";
import { ADMIN_USER_DETAIL_TABS, API_ROUTES, type AdminUserDetailTabId } from "@/constants";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [tab, setTab] = useState<AdminUserDetailTabId>("overview");
  const [user, setUser] = useState<Record<string, JsonValue> | null>(null);
  useEffect(() => {
    getAdminUser(API_ROUTES.ADMIN.USER_BY_ID(id))
      .then((r) => r.json())
      .then((j) => setUser(j?.data ?? null))
      .catch(() => setUser(null));
  }, [id]);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Stack gap="xs">
            <Heading level={1}>
              {(user?.displayName as string) ?? id}
            </Heading>
            <Text size="xs" color="muted">
              {(user?.email as string) ?? "—"} · role {(user?.role as string) ?? "user"} · uid{" "}
              <Code className="font-mono">{id}</Code>
            </Text>
          </Stack>
          <Divider />
          <Tabs value={tab} onChange={(k: string) => setTab(k as AdminUserDetailTabId)}>
            <TabsList>
              {ADMIN_USER_DETAIL_TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {tab === "overview" && user && (
            <Stack textSize="sm" gap="sm">
              <Text>
                <Span weight="bold">Email:</Span> {(user.email as string) ?? "—"}
              </Text>
              <Text>
                <Span weight="bold">Phone:</Span> {(user.phoneNumber as string) ?? "—"}
              </Text>
              <Text>
                <Span weight="bold">Created:</Span>{" "}
                {user.createdAt
                  ? new Date(user.createdAt as string).toLocaleString()
                  : "—"}
              </Text>
            </Stack>
          )}
          {tab === "orders" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/orders?buyerId=${id}`}>Open Orders filtered by buyer</Link>
              </Button>
            </Row>
          )}
          {tab === "store" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/stores?ownerId=${id}`}>Open Stores filtered by owner</Link>
              </Button>
            </Row>
          )}
          {tab === "reviews" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/reviews?buyerId=${id}`}>Open Reviews filtered by buyer</Link>
              </Button>
            </Row>
          )}
          {tab === "sessions" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/sessions?userId=${id}`}>Open Sessions filtered by user</Link>
              </Button>
            </Row>
          )}
          {tab === "bids" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/bids?bidderId=${id}`}>Open Bids filtered by bidder</Link>
              </Button>
            </Row>
          )}
          {tab === "reports" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/reports?reporterId=${id}`}>Reports filed by user</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/admin/reports?entityId=${id}&entityType=user`}>Reports against user</Link>
              </Button>
            </Row>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
