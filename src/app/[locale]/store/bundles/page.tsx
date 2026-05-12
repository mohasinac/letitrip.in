"use client";
/**
 * Store bundles list page — SB3-G.
 *
 * Client-rendered list view of the signed-in seller's bundles. Storeship is
 * resolved server-side by /api/bundles (which filters by the caller's
 * session) — this page just renders the result.
 */
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@mohasinac/appkit";
import {
  Badge,
  Button,
  Container,
  Heading,
  Row,
  Section,
  Stack,
  Text,
} from "@mohasinac/appkit/client";

export default function Page() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/bundles?includeAll=true")
      .then((r) => r.json())
      .then((r) => setBundles(r?.data?.items ?? r?.items ?? []))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Section>
      <Container>
        <Stack className="gap-6">
          <Row className="items-center justify-between">
            <Heading level={1}>Your bundles ({bundles.length})</Heading>
            <Button asChild variant="primary">
              <Link href={String(ROUTES.STORE.BUNDLES_NEW)}>+ New bundle</Link>
            </Button>
          </Row>
          {loading ? (
            <Text>Loading…</Text>
          ) : bundles.length === 0 ? (
            <Text>No bundles yet.</Text>
          ) : (
            <Stack className="gap-2">
              {bundles.map((b) => (
                <Row
                  key={b.id}
                  className="items-center justify-between rounded border border-zinc-200 dark:border-zinc-700 p-3"
                >
                  <Stack className="gap-1">
                    <Text className="font-medium">{b.title}</Text>
                    <Row className="gap-2 text-xs text-[var(--appkit-color-text-muted,#6b7280)]">
                      <Badge variant="secondary">{b.status}</Badge>
                      <Text>{b.bundleItems?.length ?? 0} items</Text>
                      <Text>
                        ₹{((b.bundlePrice ?? 0) / 100).toLocaleString("en-IN")}
                      </Text>
                    </Row>
                  </Stack>
                  <Button asChild variant="ghost">
                    <Link href={String(ROUTES.STORE.BUNDLES_EDIT(b.id))}>
                      Edit
                    </Link>
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
