"use client";
/**
 * Admin bundle edit page — SB3-G.
 *
 * Loads the bundle via `/api/bundles/[id]` (open to authenticated users; the
 * route's owner-or-admin gate authorises the PUT). Renders the appkit
 * `AdminBundleEditorView` which carries the storeName / storeId header so
 * admins know whose bundle they're editing.
 */
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ROUTES, AdminBundleEditorView } from "@mohasinac/appkit";
import type { BundleDocument, BundleFormValue } from "@mohasinac/appkit";
import { Container, Section, Text } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

interface BundleDetailResponse {
  data?: { bundle?: BundleDocument };
  bundle?: BundleDocument;
}

interface BundleErrorResponse {
  error?: { message?: string };
}

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const [bundle, setBundle] = useState<BundleDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const bundlesListHref = String(ROUTES.ADMIN.BUNDLES);
  const bundleByIdHref = API_ROUTES.BUNDLES.BY_ID(id);

  useEffect(() => {
    let mounted = true;
    fetch(bundleByIdHref)
      .then(
        (r) => (r.ok ? (r.json() as Promise<BundleDetailResponse>) : null),
      )
      .then((res) => {
        if (!mounted) return;
        setBundle(res?.data?.bundle ?? res?.bundle ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [bundleByIdHref]);

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
    const res = await fetch(bundleByIdHref, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const err = (await res
        .json()
        .catch(() => ({}))) as BundleErrorResponse;
      throw new Error(err?.error?.message ?? "Failed to save bundle");
    }
    router.push(bundlesListHref);
  };

  return (
    <AdminBundleEditorView
      bundle={bundle}
      onSubmit={handleSubmit}
      onCancel={() => router.push(bundlesListHref)}
    />
  );
}
