"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-27: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-27) */
import {
  UserAccountHubView,
  useAuth,
  useOrders,
  OrdersList,
  ROUTES,
} from "@mohasinac/appkit/client";
import { ShoppingBag, Heart, MapPin, Settings, MessageCircle, Bell } from "lucide-react";
import Link from "next/link";

const BRAND_GRAD = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)";

const NAV_LINKS = [
  { label: "My Orders",    href: ROUTES.USER.ORDERS,        Icon: ShoppingBag },
  { label: "Wishlist",     href: ROUTES.USER.WISHLIST,       Icon: Heart },
  { label: "Addresses",    href: ROUTES.USER.ADDRESSES,      Icon: MapPin },
  { label: "Settings",     href: ROUTES.USER.SETTINGS,       Icon: Settings },
  { label: "Messages",     href: ROUTES.USER.MESSAGES,       Icon: MessageCircle },
  { label: "Notifications",href: ROUTES.USER.NOTIFICATIONS,  Icon: Bell },
];

export default function Page() {
  const { user, loading: userLoading } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders({ page: 1, perPage: 3 });

  return (
    <UserAccountHubView
      labels={{ title: "My Account" }}
      renderProfile={() =>
        userLoading ? null : user ? (
          <div className="relative flex items-center gap-4 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] overflow-hidden p-5 shadow-sm">
            {/* gradient top accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: BRAND_GRAD }} aria-hidden="true" />
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? ""}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--appkit-color-border)]"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-bold flex-shrink-0"
                style={{ background: BRAND_GRAD }}
              >
                {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-[var(--appkit-color-text)] truncate">
                {user.displayName ?? "My Account"}
              </div>
              {user.email && (
                <div className="text-sm text-[var(--appkit-color-text-muted)] truncate">{user.email}</div>
              )}
            </div>
          </div>
        ) : null
      }
      renderNav={() => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NAV_LINKS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={String(href)}
              className="group flex items-center gap-3 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3.5 text-sm font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ background: BRAND_GRAD }}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      )}
      renderRecentOrders={() =>
        orders.length > 0 || ordersLoading ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--appkit-color-text)]">
                Recent Orders
              </span>
              <Link
                href={String(ROUTES.USER.ORDERS)}
                className="text-xs text-[var(--appkit-color-primary)] hover:underline"
              >
                View all →
              </Link>
            </div>
            <OrdersList orders={orders} isLoading={ordersLoading} emptyLabel="No orders yet" />
          </div>
        ) : null
      }
    />
  );
}
