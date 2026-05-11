"use client";
import { use } from "react";
import Link from "next/link";
import { useOrder, ROUTES } from "@mohasinac/appkit/client";

function paise(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n / 100);
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { order, isLoading } = useOrder(id, { endpoint: `/api/user/orders/${id}` });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-400">
        Loading invoice…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-400">
        Order not found.{" "}
        <Link href={String(ROUTES.USER.ORDERS)} className="ml-2 underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const a = order.address;

  return (
    <>
      {/* action bar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-700">
        <Link
          href={String(ROUTES.USER.ORDER_DETAIL(id))}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to order
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--appkit-color-primary)" }}
        >
          Print / Save as PDF
        </button>
      </div>

      {/* invoice body */}
      <div className="max-w-2xl mx-auto px-6 py-10 print:px-0 print:py-0 print:max-w-none">
        {/* header */}
        <div className="flex items-start justify-between mb-8 print:mb-6">
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
              LetItRip
            </p>
            <p className="text-xs text-zinc-500 print:text-gray-500 mt-0.5">letitrip.in</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
              Invoice
            </p>
            <p className="text-xs text-zinc-500 print:text-gray-500 mt-0.5">
              #{order.id.slice(-8).toUpperCase()}
            </p>
            {orderDate && (
              <p className="text-xs text-zinc-500 print:text-gray-500">{orderDate}</p>
            )}
          </div>
        </div>

        {/* delivery address */}
        {a && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 print:text-gray-500 mb-1">
              Delivered to
            </p>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 print:text-black">{a.line1}</p>
            {a.line2 && (
              <p className="text-sm text-zinc-800 dark:text-zinc-200 print:text-black">{a.line2}</p>
            )}
            <p className="text-sm text-zinc-800 dark:text-zinc-200 print:text-black">
              {[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
            </p>
            {a.country && (
              <p className="text-sm text-zinc-500 print:text-gray-500">{a.country}</p>
            )}
          </div>
        )}

        {/* items */}
        <table className="w-full text-sm mb-6 border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 print:border-gray-300">
              <th className="text-left py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 print:text-gray-500">
                Item
              </th>
              <th className="text-center py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 print:text-gray-500">
                Qty
              </th>
              <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 print:text-gray-500">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map(
              (item: NonNullable<typeof order>["items"][number], i: number) => (
                <tr key={i} className="border-b border-zinc-100 print:border-gray-200">
                  <td className="py-2.5 text-zinc-800 dark:text-zinc-200 print:text-black">
                    {item.title}
                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                      <span className="ml-1.5 text-zinc-400 print:text-gray-500 text-xs">
                        ({Object.entries(item.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-center text-zinc-600 dark:text-zinc-300 print:text-black">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 text-right text-zinc-800 dark:text-zinc-200 print:text-black">
                    {paise(item.price * item.quantity, item.currency)}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        {/* totals */}
        <div className="ml-auto max-w-xs space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 print:text-gray-500">Subtotal</span>
            <span className="text-zinc-800 dark:text-zinc-200 print:text-black">
              {paise(order.subtotal, order.currency)}
            </span>
          </div>
          {order.shippingCost !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 print:text-gray-500">Shipping</span>
              <span className="text-zinc-800 dark:text-zinc-200 print:text-black">
                {order.shippingCost === 0 ? "Free" : paise(order.shippingCost, order.currency)}
              </span>
            </div>
          )}
          {order.discount !== undefined && order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 print:text-gray-500">
                Discount{order.couponCode ? ` (${order.couponCode})` : ""}
              </span>
              <span className="text-green-600 print:text-black">
                −{paise(order.discount, order.currency)}
              </span>
            </div>
          )}
          {order.tax !== undefined && order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 print:text-gray-500">Tax (GST)</span>
              <span className="text-zinc-800 dark:text-zinc-200 print:text-black">
                {paise(order.tax, order.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold border-t border-zinc-200 print:border-gray-300 pt-2 mt-1">
            <span className="text-zinc-900 dark:text-zinc-100 print:text-black">Total</span>
            <span className="text-zinc-900 dark:text-zinc-100 print:text-black">
              {paise(order.total, order.currency)}
            </span>
          </div>
        </div>

        {/* footer */}
        <p className="mt-12 text-center text-xs text-zinc-400 print:text-gray-400 print:mt-8">
          Thank you for shopping with LetItRip · letitrip.in
        </p>
      </div>
    </>
  );
}
