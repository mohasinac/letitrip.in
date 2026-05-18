"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Row,
  Section,
  Input,
  useToast,
  Divider,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";
import type { StoreGoogleConfigDocument } from "@mohasinac/appkit";

export default function Page() {
  const { showToast } = useToast();
  const [doc, setDoc] = useState<Partial<StoreGoogleConfigDocument>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(API_ROUTES.STORE.GOOGLE_REVIEWS)
      .then((r) => r.json())
      .then((j) => setDoc(j?.data ?? {}))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch(API_ROUTES.STORE.GOOGLE_REVIEWS, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    setSaving(false);
    showToast(res.ok ? "Saved" : "Save failed", res.ok ? "success" : "error");
  };

  const sync = async () => {
    setSaving(true);
    const res = await fetch(API_ROUTES.STORE.GOOGLE_REVIEWS_SYNC, { method: "POST" });
    setSaving(false);
    showToast(res.ok ? "Sync queued" : "Sync failed", res.ok ? "success" : "error");
  };

  if (loading) return <Section><Container size="md"><Stack gap="md" className="py-6">Loading…</Stack></Container></Section>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Google Business Reviews</Heading>
          <Text className="text-zinc-600 dark:text-slate-400">
            Connect your Google Business profile to sync reviews to your storefront.
          </Text>
          <Stack gap="md">
            <Input
              label="Google Place ID"
              value={String(doc.placeId ?? "")}
              onChange={(e) => setDoc({ ...doc, placeId: e.target.value })}
              placeholder="ChIJ…"
            />
            <Input
              label="Business name"
              value={String(doc.businessName ?? "")}
              onChange={(e) => setDoc({ ...doc, businessName: e.target.value })}
            />
            <Row className="gap-4">
              <Text className="text-sm text-zinc-500">
                Avg rating: {doc.averageRating ?? "—"}
              </Text>
              <Text className="text-sm text-zinc-500">
                Reviews: {doc.totalReviews ?? "—"}
              </Text>
              <Text className="text-sm text-zinc-500">
                Last synced:{" "}
                {doc.lastSyncedAt
                  ? new Date(doc.lastSyncedAt).toLocaleString()
                  : "never"}
              </Text>
            </Row>
          </Stack>
          <Divider />
          <Row className="gap-2 justify-between">
            <Button variant="outline" onClick={sync} disabled={saving}>
              Sync now
            </Button>
            <Button variant="primary" onClick={save} disabled={saving} isLoading={saving}>
              Save
            </Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
