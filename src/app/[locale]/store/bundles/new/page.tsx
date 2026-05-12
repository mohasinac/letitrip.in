"use client";
/**
 * Store bundle create page — SB3-G.
 *
 * Wraps SellerBundleCreateView and POSTs to /api/bundles.
 */
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ROUTES, SellerBundleCreateView } from "@mohasinac/appkit";
import type { BundleFormValue } from "@mohasinac/appkit";
import { Container, Section, Text } from "@mohasinac/appkit/client";

export default function Page() {
  const router = useRouter();
  const [store, setStore] = useState<{ id: string; storeName: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => setStore(r?.data?.store ?? r?.store ?? null))
      .catch(() => setError("Could not load your store."));
  }, []);

  if (error) {
    return (
      <Section>
        <Container>
          <Text>{error}</Text>
        </Container>
      </Section>
    );
  }
  if (!store) {
    return (
      <Section>
        <Container>
          <Text>Loading your store…</Text>
        </Container>
      </Section>
    );
  }

  const handleSubmit = async (value: BundleFormValue) => {
    const res = await fetch("/api/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? "Failed to create bundle");
    }
    router.push(String(ROUTES.STORE.BUNDLES));
  };

  return (
    <SellerBundleCreateView
      storeId={store.id}
      storeName={store.storeName ?? store.id}
      onSubmit={handleSubmit}
      onCancel={() => router.push(String(ROUTES.STORE.BUNDLES))}
    />
  );
}
