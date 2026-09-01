"use client";

import {useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { normalizeError } from "@mohasinac/appkit/client";
import {
  apiClient,
  Code,
  Container,
  Heading,
  ROUTES,
  Row,
  SELLER_ENDPOINTS,
  Section,
  SellerPayoutDetailContent,
  Stack,
  Text,
  useToast,
  type JsonValue,
} from "@mohasinac/appkit/client";



function PageInner() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { showToast } = useToast();
  const [payout, setPayout] = useState<Record<string, JsonValue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reminderPending, setReminderPending] = useState(false);

  const reload = () => {
    setIsLoading(true);
    apiClient
      .get<{ data?: Record<string, JsonValue> } | Record<string, JsonValue>>(SELLER_ENDPOINTS.PAYOUT_BY_ID(id))
      .then((res) => setPayout((res as { data?: Record<string, JsonValue> })?.data ?? (res as Record<string, JsonValue>)))
      .catch(() => setPayout(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (id) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleReminder = async (next: boolean) => {
    if (!payout) return;
    setReminderPending(true);
    try {
      await apiClient.patch(SELLER_ENDPOINTS.PAYOUT_BY_ID(id), { sellerReminderFlag: next });
      setPayout((prev) => (prev ? { ...prev, sellerReminderFlag: next } : prev));
      showToast(next ? "Reminder set." : "Reminder cleared.", "success");
    } catch (err) {
      void normalizeError(err);
      showToast("Failed to update reminder.", "error");
    } finally {
      setReminderPending(false);
    }
  };

  return (
    <Section>
      <Container size="lg">
        <Stack gap="lg" padding="y-lg">
          <Row className="mb-2" gap="sm">
            <Link
              href={String(ROUTES.STORE.PAYOUTS)}
              className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
            >
              ← Payouts
            </Link>
          </Row>

          {isLoading && !payout && <Text color="muted" size="sm">Loading payout…</Text>}
          {!isLoading && !payout && <Text color="muted" size="sm">Payout not found.</Text>}

          {payout && (
            <>
              <Heading level={1} size="lg">
                Payout <Code className="font-mono">{id}</Code>
              </Heading>
              <SellerPayoutDetailContent
                payout={payout as Record<string, unknown>}
                onToggleReminder={handleToggleReminder}
                reminderPending={reminderPending}
              />
            </>
          )}
        </Stack>
      </Container>
    </Section>
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
