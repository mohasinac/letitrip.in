"use client";
import { Row, Stack, normalizeError } from "@mohasinac/appkit/client";
import { useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  useToast,
  useOrder,
  ROUTES,
  Div,
  Button,
  Checkbox,
  FieldTextarea,
  Form,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { cancelOrderAction } from "@/actions/order.actions";
import { Heading, Span, Text } from "@mohasinac/appkit/client";
import { orderCancelSchema, FormErrorSummary } from "@mohasinac/appkit/client";

const __P = {
  p5: "p-[var(--appkit-space-5)]",
} as const;

// Mirrors ORDER_CANCELLABLE_STATUSES (appkit/src/_internal/shared/features/orders/config.ts),
// the value cancelOrderForUser/cancelOrderItemsForUser actually enforce server-side.
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

function toggleItemSelection(
  current: Set<string> | null,
  allIds: string[],
  productId: string,
  checked: boolean,
): Set<string> {
  const next = new Set(current ?? allIds);
  if (checked) next.add(productId);
  else next.delete(productId);
  return next;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { order, isLoading } = useOrder(id);
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string> | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showToast("Please provide a reason for cancellation.", "error");
      return;
    }
    const activeItems = (order?.items ?? []).filter((i) => i.cancelledQuantity == null);
    const selected = selectedItemIds ?? new Set(activeItems.map((i) => i.productId));
    if (selected.size === 0) {
      showToast("Select at least one item to cancel.", "error");
      return;
    }
    const isWholeOrder = selected.size === activeItems.length;
    try {
      setIsPending(true);
      await cancelOrderAction(
        id,
        reason.trim(),
        isWholeOrder ? undefined : [...selected],
      );
      showToast(
        isWholeOrder ? "Order cancelled successfully." : "Selected items cancelled successfully.",
        "success",
      );
      router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : "Failed to cancel order.";
      showToast(msg, "error");
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
    return (
      <Text size="sm" color="muted">Order not found.</Text>
    );
  }

  const cancellable = CANCELLABLE_STATUSES.includes(order.orderStatus);
  const activeItems = order.items.filter((i) => i.cancelledQuantity == null);

  return (
    <Stack className="w-full max-w-lg" gap="lg">
      <>
        <Heading level={1} size="2xl" weight="bold" color="primary">Cancel Order</Heading>
        <Text className="mt-1" color="muted" size="sm">Order #{id}</Text>
      </>

      {!cancellable ? (
        <Stack className={`border border-warning/20 ${__P.p5}`} surface="warning-surface" gap="3" rounded="xl">
          <Text className="text-warning" size="sm" weight="medium">
            This order cannot be cancelled because it is already <Span weight="bold">{order.orderStatus.toLowerCase()}</Span>.
          </Text>
          <Link
            href={String(ROUTES.USER.ORDER_DETAIL(id))}
            className="inline-block text-[length:var(--appkit-text-sm)] font-medium text-primary hover:underline"
          >
            ← Back to order
          </Link>
        </Stack>
      ) : (
        <Form schema={orderCancelSchema}
          onSubmit={(e) => e.preventDefault()} rounded="xl" padding="lg" surface="default" border="default" spacing="md">
          <FormErrorSummary />
          {activeItems.length > 1 && (
            <Stack gap="xs">
              <Text size="sm" weight="medium" color="primary">Items to cancel</Text>
              <Text size="xs" color="muted">
                Leave all items checked to cancel the whole order, or uncheck items you want to keep.
              </Text>
              <Stack gap="xs" className="mt-1">
                {activeItems.map((item) => {
                  const checked = selectedItemIds ? selectedItemIds.has(item.productId) : true;
                  const activeIds = activeItems.map((i) => i.productId);
                  return (
                    <Checkbox
                      key={item.productId}
                      label={`${item.title} (x${item.quantity})`}
                      checked={checked}
                      onChange={(e) =>
                        setSelectedItemIds(
                          toggleItemSelection(selectedItemIds, activeIds, item.productId, e.target.checked),
                        )
                      }
                    />
                  );
                })}
              </Stack>
            </Stack>
          )}

          <FieldTextarea
            name="reason"
            label="Reason for cancellation"
            required
            value={reason}
            onChange={setReason}
            rows={4}
            maxLength={500}
            showCharCount
            placeholder="Tell us why you are cancelling this order…"
          />

          <Row gap="3">
            <Button
              action={ACTIONS.USER["cancel-order-items"]}
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              rounded="xl"
              paddingX="md" paddingY="sm" textSize="sm" weight="semibold"
              className="disabled:opacity-60 transition-colors"
            >
              {isPending ? "Cancelling…" : "Cancel Order"}
            </Button>
            <Link
              href={String(ROUTES.USER.ORDER_DETAIL(id))}
              className="rounded-xl border border-[var(--appkit-color-border)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text-muted)] hover:bg-zinc-50 hover:bg-[var(--appkit-color-surface-elevated)] transition-colors"
            >
              Keep Order
            </Link>
          </Row>
        </Form>
      )}
    </Stack>
  );
}
