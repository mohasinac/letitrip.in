"use client";
import { Stack, normalizeError } from "@mohasinac/appkit/client";
import { useState, use, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  useToast,
  useOrder,
  ROUTES,
  Div,
  RefundRequestView,
  ORDER_RETURN_WINDOW_DAYS,
} from "@mohasinac/appkit/client";
import type { RefundRequestSubmission } from "@mohasinac/appkit/client";
import { requestReturnAction } from "@/actions/order.actions";
import { Heading, Span, Text } from "@mohasinac/appkit/client";

const __P = {
  p5: "p-[var(--appkit-space-5)]",
} as const;

/*
 * Mirrors `assertReturnWindowOpen` (appkit/_internal/server/features/orders/
 * service.ts), which is what the server actually enforces: delivered, and
 * within ORDER_RETURN_WINDOW_DAYS of the delivery date.
 *
 * Duplicated here only to decide what to RENDER — never as the gate. A buyer
 * who reaches this page some other way still hits the server check.
 */
function isWithinReturnWindow(
  orderStatus: string,
  deliveryDate: string | Date | null | undefined,
): boolean {
  if (orderStatus !== "delivered") return false;
  if (!deliveryDate) return false;
  const delivered = new Date(deliveryDate).getTime();
  if (Number.isNaN(delivered)) return false;
  return Date.now() - delivered <= ORDER_RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function PageInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { order, isLoading } = useOrder(id);
  const [isPending, setIsPending] = useState(false);

  /*
   * Rethrows rather than toasting. `RefundRequestView` catches, maps the code
   * through `toUserMessage`, and puts the message on the reason field — which
   * is the control the buyer has to change. A toast here would ALSO fire and
   * then disappear, leaving the form looking untouched.
   */
  const handleSubmit = async (submission: RefundRequestSubmission) => {
    setIsPending(true);
    try {
      const result = await requestReturnAction(
        id,
        submission.reasonCode,
        submission.reasonNote,
      );
      if (!result.ok) {
        throw Object.assign(new Error(result.error ?? "Failed to request a return."), {
          code: result.code,
        });
      }
      showToast("Return requested. The seller has been notified.", "success");
      router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
    } catch (err) {
      void normalizeError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <Stack className="w-full max-w-lg animate-pulse" gap="md">
        <Div className="h-6 w-1/2" surface="subtle" rounded="default" />
        <Div className="h-4 w-3/4" surface="subtle" rounded="default" />
        <Div className="h-24" surface="subtle" rounded="default" />
      </Stack>
    );
  }

  if (!order) {
    return <Text size="sm" color="muted">Order not found.</Text>;
  }

  const returnable = isWithinReturnWindow(order.orderStatus, order.deliveryDate);

  return (
    <Stack className="w-full max-w-lg" gap="lg">
      <>
        <Heading level={1} size="2xl" weight="bold" color="primary">Return this order</Heading>
        <Text className="mt-1" color="muted" size="sm">Order #{id}</Text>
      </>

      {!returnable ? (
        <Stack className={`border border-warning/20 ${__P.p5}`} surface="warning-surface" gap="3" rounded="xl">
          <Text className="text-warning" size="sm" weight="medium">
            {order.orderStatus !== "delivered" ? (
              <>
                This order can&rsquo;t be returned yet because it is{" "}
                <Span weight="bold">{order.orderStatus.toLowerCase()}</Span>. Returns open
                once it has been delivered.
              </>
            ) : (
              <>
                The {ORDER_RETURN_WINDOW_DAYS}-day return window for this order has closed.
              </>
            )}
          </Text>
          <Link
            href={String(ROUTES.USER.ORDER_DETAIL(id))}
            className="inline-block text-[length:var(--appkit-text-sm)] font-medium text-primary hover:underline"
          >
            ← Back to order
          </Link>
        </Stack>
      ) : (
        <RefundRequestView
          order={order}
          onSubmitRequest={handleSubmit}
          isLoading={isPending}
        />
      )}
    </Stack>
  );
}

/*
 * Page-level Suspense — same reasoning as the sibling cancel page: the client
 * tree reaches useSearchParams(), which throws during prerender without a
 * boundary (Root Cause #17b). Never `export const dynamic` (Root Cause #89,
 * blocked by audit-no-force-dynamic).
 */
export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <PageInner {...props} />
    </Suspense>
  );
}
