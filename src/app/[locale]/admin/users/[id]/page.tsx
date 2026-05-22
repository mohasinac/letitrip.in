"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Section,
  Row,
  Button,
  Divider,
  TabStrip,
} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// S-STORE-9B-E — User detail with tabs (Orders / Store / Reviews / Sessions / Bids / Reports).
// Each tab links to the admin listing filtered by this user's ID.

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "store", label: "Store" },
  { id: "reviews", label: "Reviews" },
  { id: "sessions", label: "Sessions" },
  { id: "bids", label: "Bids" },
  { id: "reports", label: "Reports" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [tab, setTab] = useState<TabId>("overview");
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((j) => setUser(j?.data ?? null))
      .catch(() => setUser(null));
  }, [id]);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Stack gap="xs">
            <Heading level={1}>
              {(user?.displayName as string) ?? id}
            </Heading>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {(user?.email as string) ?? "—"} · role {(user?.role as string) ?? "user"} · uid{" "}
              <code className="font-mono">{id}</code>
            </Text>
          </Stack>
          <Divider />
          <TabStrip
            tabs={TABS.map((t) => ({ key: t.id, label: t.label }))}
            activeKey={tab}
            onChange={(k: string) => setTab(k as TabId)}
          />
          {tab === "overview" && user && (
            <Stack gap="sm" className="text-sm">
              <Text>
                <strong>Email:</strong> {(user.email as string) ?? "—"}
              </Text>
              <Text>
                <strong>Phone:</strong> {(user.phoneNumber as string) ?? "—"}
              </Text>
              <Text>
                <strong>Created:</strong>{" "}
                {user.createdAt
                  ? new Date(user.createdAt as string).toLocaleString()
                  : "—"}
              </Text>
            </Stack>
          )}
          {tab === "orders" && (
            <Row className="gap-2">
              <Button asChild variant="outline">
                <Link href={`/admin/orders?buyerId=${id}`}>Open Orders filtered by buyer</Link>
              </Button>
            </Row>
          )}
          {tab === "store" && (
            <Row className="gap-2">
              <Button asChild variant="outline">
                <Link href={`/admin/stores?ownerId=${id}`}>Open Stores filtered by owner</Link>
              </Button>
            </Row>
          )}
          {tab === "reviews" && (
            <Row className="gap-2">
              <Button asChild variant="outline">
                <Link href={`/admin/reviews?buyerId=${id}`}>Open Reviews filtered by buyer</Link>
              </Button>
            </Row>
          )}
          {tab === "sessions" && (
            <Row className="gap-2">
              <Button asChild variant="outline">
                <Link href={`/admin/sessions?userId=${id}`}>Open Sessions filtered by user</Link>
              </Button>
            </Row>
          )}
          {tab === "bids" && (
            <Row className="gap-2">
              <Button asChild variant="outline">
                <Link href={`/admin/bids?bidderId=${id}`}>Open Bids filtered by bidder</Link>
              </Button>
            </Row>
          )}
          {tab === "reports" && (
            <Row className="gap-2">
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
