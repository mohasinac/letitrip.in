"use client";
/**
 * Admin bundles list page — SB3-G.
 *
 * Lists every bundle across every store. Admin can edit any of them via the
 * sibling edit page. Uses `?includeAll=true` so draft/archived statuses are
 * surfaced (the seller-facing list also does this for the seller's own).
 */
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@mohasinac/appkit";
import type { BundleDocument } from "@mohasinac/appkit";
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
  const [bundles, setBundles] = useState<BundleDocument[]>([]);
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
            <Heading level={1}>All bundles ({bundles.length})</Heading>
          </Row>
          {loading ? (
            <Text>Loading…</Text>
          ) : bundles.length === 0 ? (
            <Text>No bundles in the system yet.</Text>
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
                      <Text>{b.storeName}</Text>
                      <Text>{b.bundleItems?.length ?? 0} items</Text>
                      <Text>
                        ₹{((b.bundlePrice ?? 0) / 100).toLocaleString("en-IN")}
                      </Text>
                    </Row>
                  </Stack>
                  <Button asChild variant="ghost">
                    <Link href={String(ROUTES.ADMIN.BUNDLES_EDIT(b.id))}>
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
