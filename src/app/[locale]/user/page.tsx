"use client";
import {
  UserAccountHubView,
  useAuth,
  useOrders,
  OrdersList,
  ROUTES,
} from "@mohasinac/appkit/client";
import Link from "next/link";

const NAV_LINKS = [
  { label: "My Orders", href: ROUTES.USER.ORDERS },
  { label: "Wishlist", href: ROUTES.USER.WISHLIST },
  { label: "Addresses", href: ROUTES.USER.ADDRESSES },
  { label: "Settings", href: ROUTES.USER.SETTINGS },
  { label: "Messages", href: ROUTES.USER.MESSAGES },
  { label: "Notifications", href: ROUTES.USER.NOTIFICATIONS },
];

export default function Page() {
  const { user, loading: userLoading } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders({ page: 1, perPage: 3 });

  return (
    <UserAccountHubView
      labels={{ title: "My Account" }}
      renderProfile={() =>
        userLoading ? null : user ? (
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? ""}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold text-neutral-900 dark:text-zinc-100">
                {user.displayName ?? "My Account"}
              </div>
              {user.email && (
                <div className="text-sm text-neutral-500 dark:text-zinc-400">{user.email}</div>
              )}
            </div>
          </div>
        ) : null
      }
      renderNav={() => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={String(href)}
              className="rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-medium text-neutral-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
      renderRecentOrders={() =>
        orders.length > 0 || ordersLoading ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-700 dark:text-zinc-300">
                Recent Orders
              </span>
              <Link
                href={String(ROUTES.USER.ORDERS)}
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <OrdersList orders={orders} isLoading={ordersLoading} emptyLabel="No orders yet" />
          </div>
        ) : null
      }
    />
  );
}
