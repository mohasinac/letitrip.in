"use client";
/**
 * Store bundle edit page — SB3-G.
 */
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ROUTES, SellerBundleEditView } from "@mohasinac/appkit";
import type { BundleDocument, BundleFormValue } from "@mohasinac/appkit";
import { Container, Section, Text } from "@mohasinac/appkit/client";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const [bundle, setBundle] = useState<BundleDocument | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch(`/api/bundles/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/store/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([bRes, sRes]) => {
        if (!mounted) return;
        setBundle(bRes?.data?.bundle ?? bRes?.bundle ?? null);
        setStoreName(sRes?.data?.store?.storeName ?? sRes?.store?.storeName ?? "");
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Section>
        <Container>
          <Text>Loading bundle…</Text>
        </Container>
      </Section>
    );
  }
  if (!bundle) {
    return (
      <Section>
        <Container>
          <Text>Bundle not found.</Text>
        </Container>
      </Section>
    );
  }

  const handleSubmit = async (value: BundleFormValue) => {
    const res = await fetch(`/api/bundles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? "Failed to save bundle");
    }
    router.push(String(ROUTES.STORE.BUNDLES));
  };

  return (
    <SellerBundleEditView
      bundle={bundle}
      storeName={storeName || bundle.storeName}
      onSubmit={handleSubmit}
      onCancel={() => router.push(String(ROUTES.STORE.BUNDLES))}
    />
  );
}
