"use client";

/**
 * DisputeClient — the buyer's dispute form, mounted.
 *
 * ## What was missing was only the mount
 *
 * `RaiseDisputeForm` is complete: it offers the two kinds with the server's own
 * gate applied, disables a kind it would be refused on *with the reason shown*
 * rather than hiding it, scopes the reason picker to the chosen kind, and
 * refetches the picker when the kind changes. It had **no mount site anywhere**
 * — the component, the model, the gate, the collection, the seed and the API
 * all landed and nothing rendered it (Root Cause #37).
 *
 * ## 🛑 The order is fetched, not reconstructed from search params
 *
 * The gate reads four dates off the order. Passing them in the URL would make
 * the affordance forgeable, which matters less than it sounds (the server
 * re-runs `checkDisputeGate` on the real order and is the authority) but would
 * also mean the page renders a *wrong* form for anyone who edits the URL — a
 * kind offered that the submit then refuses, which reads as the form being
 * broken rather than as the wrong choice. That is precisely the failure the
 * form's own header says the kind-first design exists to prevent.
 *
 * A failed order fetch therefore renders an ERROR, never an empty-but-usable
 * form: a gate computed from no dates would offer both kinds unconditionally.
 */

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Alert,
  Container,
  Heading,
  Section,
  Skeleton,
  Stack,
  Text,
  ROUTES,
} from "@mohasinac/appkit/client";
import { normalizeError } from "@mohasinac/appkit/client";
import { RaiseDisputeForm } from "@mohasinac/appkit/features/orders/components/RaiseDisputeForm";
import { getUserOrder, raiseOrderDispute } from "@/lib/api/user-client";
import { API_ROUTES } from "@/constants/api";

interface GateOrder {
  deliveryDate?: string | null;
  completedAt?: string | null;
  shippingDate?: string | null;
  estimatedDeliveryDate?: string | null;
}

export default function DisputeClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<GateOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getUserOrder(id);
        const json = (await res.json().catch(() => ({}))) as { data?: GateOrder };
        if (cancelled) return;
        if (!res.ok || !json.data) {
          setError("We couldn't load this order. Open it from your orders list and try again.");
          return;
        }
        setOrder(json.data);
      } catch (err) {
        void normalizeError(err);
        if (!cancelled) {
          setError("We couldn't load this order. Open it from your orders list and try again.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onSubmit = useCallback(
    async (input: { kind: string; reasonId: string; detail?: string }) => {
      const res = await raiseOrderDispute(id, input);
      /*
       * Throws on failure so the form's own catch surfaces the message. The
       * form is where the retry lives — bouncing the buyer to an error page
       * after they have written a description would lose the description.
       */
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? "We couldn't submit that. Please try again.");
      }
    },
    [id],
  );

  return (
    <Container>
      <Section>
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={1} size="xl" weight="semibold" color="primary">
              Report a problem
            </Heading>
            <Text size="sm" color="muted">
              Tell us what went wrong with this order. We read every report.
            </Text>
          </Stack>

          {error && (
            <Alert variant="error" title="Couldn't load this order">
              {error}
            </Alert>
          )}

          {!error && !order && <Skeleton className="h-64 w-full" />}

          {order && (
            <RaiseDisputeForm
              order={{
                deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : null,
                completedAt: order.completedAt ? new Date(order.completedAt) : null,
                shippingDate: order.shippingDate ? new Date(order.shippingDate) : null,
                estimatedDeliveryDate: order.estimatedDeliveryDate
                  ? new Date(order.estimatedDeliveryDate)
                  : null,
              }}
              /*
               * The endpoint is passed IN because appkit holds no consumer
               * routes — `RaiseDisputeForm` takes `reasonsEndpoint` as a prop
               * for exactly that reason, and `API_ROUTES.DISPUTE_REASONS` is
               * the one place the path is written.
               */
              reasonsEndpoint={API_ROUTES.DISPUTE_REASONS}
              onSubmit={onSubmit}
              onDone={() => router.push(String(ROUTES.USER.ORDER_DETAIL(id)))}
            />
          )}
        </Stack>
      </Section>
    </Container>
  );
}
