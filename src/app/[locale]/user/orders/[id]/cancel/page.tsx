"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast, useOrder, ROUTES } from "@mohasinac/appkit/client";
import { cancelOrderAction } from "@/actions/order.actions";

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
      <div className="w-full max-w-lg space-y-4 animate-pulse">
        <div className="h-6 bg-zinc-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-24 bg-zinc-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  if (!order) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Order not found.</p>
    );
  }

  const cancellable = ["pending", "processing"].includes(order.orderStatus);

  return (
    <div className="w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cancel Order</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Order #{id}</p>
      </div>

      {!cancellable ? (
        <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-5 space-y-3">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            This order cannot be cancelled because it is already <strong>{order.orderStatus.toLowerCase()}</strong>.
          </p>
          <Link
            href={String(ROUTES.USER.ORDER_DETAIL(id))}
            className="inline-block text-sm font-medium text-primary hover:underline"
          >
            ← Back to order
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5"
        >
          <div className="space-y-1">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell us why you are cancelling this order…"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-right text-xs text-zinc-400">{reason.length}/500</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {isPending ? "Cancelling…" : "Cancel Order"}
            </button>
            <Link
              href={String(ROUTES.USER.ORDER_DETAIL(id))}
              className="rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
            >
              Keep Order
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
