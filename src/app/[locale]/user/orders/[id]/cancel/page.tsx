"use client";

import { useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useToast, useOrder, ROUTES, Div, Button, Label, Textarea } from "@mohasinac/appkit/client";
import { cancelOrderAction } from "@/actions/order.actions";
import { Heading, Span, Text } from "@mohasinac/appkit";

const __P = {
  p5: "p-5",
} as const;

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { order, isLoading } = useOrder(id);
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast("Please provide a reason for cancellation.", "error");
      return;
    }
    try {
      setIsPending(true);
      await cancelOrderAction(id, reason.trim());
      showToast("Order cancelled successfully.", "success");
      router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order.";
      showToast(msg, "error");
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <Div className="w-full max-w-lg space-y-4 animate-pulse">
        <Div className="h-6 bg-zinc-200 dark:bg-slate-700 rounded w-1/2" />
        <Div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
        <Div className="h-24 bg-zinc-200 dark:bg-slate-700 rounded" />
      </Div>
    );
  }

  if (!order) {
    return (
      <Text className="text-sm text-zinc-500 dark:text-zinc-400">Order not found.</Text>
    );
  }

  const cancellable = ["pending", "processing"].includes(order.orderStatus);

  return (
    <Div className="w-full max-w-lg space-y-6">
      <>
        <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cancel Order</Heading>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Order #{id}</Text>
      </>

      {!cancellable ? (
        <Div className={`rounded-xl border border-warning/20 bg-warning-surface ${__P.p5} space-y-3`}>
          <Text className="text-sm font-medium text-warning">
            This order cannot be cancelled because it is already <Span weight="bold">{order.orderStatus.toLowerCase()}</Span>.
          </Text>
          <Link
            href={String(ROUTES.USER.ORDER_DETAIL(id))}
            className="inline-block text-sm font-medium text-primary hover:underline"
          >
            ← Back to order
          </Link>
        </Div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5"
        >
          <Div className="space-y-1">
            <Label
              htmlFor="reason"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Reason for cancellation <Text as="span" className="text-error">*</Text>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell us why you are cancelling this order…"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <Text className="text-right text-xs text-zinc-400">{reason.length}/500</Text>
          </Div>

          <Div className="flex gap-3">
            <Button
              type="submit"
              variant="danger"
              disabled={isPending}
              className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {isPending ? "Cancelling…" : "Cancel Order"}
            </Button>
            <Link
              href={String(ROUTES.USER.ORDER_DETAIL(id))}
              className="rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
            >
              Keep Order
            </Link>
          </Div>
        </form>
      )}
    </Div>
  );
}
