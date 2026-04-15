"use client";

import {
  Package,
  MessageSquare,
  Bell,
  MapPin,
  Settings,
  ArrowRight,
  Store,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AvatarDisplay, RoleBadge } from "@/components";
import {
  Heading,
  Span,
  Text,
  StatusBadge,
  Spinner,
  Row,
} from "@mohasinac/appkit/ui";
import { UserAccountHubView } from "@mohasinac/appkit/features/account";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useAuth } from "@/hooks";
import { useUserOrders } from "../hooks";
import { formatCurrency, formatDate } from "@/utils";

const ORDER_STATUS_MAP: Record<
  string,
  "pending" | "info" | "active" | "success" | "danger" | "warning"
> = {
  placed: "pending",
  pending: "pending",
  confirmed: "info",
  processing: "info",
  shipped: "active",
  delivered: "success",
  cancelled: "danger",
  returned: "warning",
  refunded: "info",
};

interface QuickNavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconBg: string;
  iconColor: string;
}

const QUICK_NAV_ITEMS: QuickNavItem[] = [
  {
    href: ROUTES.USER.ORDERS,
    labelKey: "myOrders",
    icon: Package,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    href: ROUTES.USER.MESSAGES,
    labelKey: "myMessages",
    icon: MessageSquare,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    href: ROUTES.USER.NOTIFICATIONS,
    labelKey: "notifications",
    icon: Bell,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    href: ROUTES.USER.ADDRESSES,
    labelKey: "myAddresses",
    icon: MapPin,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    href: ROUTES.USER.SETTINGS,
    labelKey: "settings",
    icon: Settings,
    iconBg: "bg-zinc-500/10",
    iconColor: "text-zinc-600 dark:text-zinc-400",
  },
];

export function UserAccountHub() {
  const { user, loading } = useAuth();
  const t = useTranslations("userHub");
  const tNav = useTranslations("nav");
  const { orders, isLoading: ordersLoading } = useUserOrders();

  if (loading) {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-[400px]`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <UserAccountHubView
      isLoading={loading || ordersLoading}
      renderProfile={() => (
        <div className="rounded-2xl bg-gradient-to-br from-primary-50/50 via-white to-white dark:from-primary-950/10 dark:via-slate-900 dark:to-slate-900 border border-zinc-200 dark:border-slate-700 p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <AvatarDisplay
              cropData={
                user.photoURL
                  ? { url: user.photoURL, position: { x: 50, y: 50 }, zoom: 1 }
                  : null
              }
              displayName={user.displayName ?? user.email ?? ""}
              email={user.email ?? ""}
              size="xl"
              className="flex-shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <Heading level={2} className="text-xl font-bold">
                  {user.displayName ?? user.email}
                </Heading>
                <RoleBadge role={user.role} />
              </div>
              <Text size="sm" variant="secondary" className="mb-3">
                {user.email}
              </Text>
              {user.role === "user" && (
                <Link
                  href={ROUTES.USER.BECOME_SELLER}
                  className="flex items-center gap-1.5 rounded-full bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 px-3 py-1 text-xs font-semibold hover:bg-cobalt-500/20 transition-colors w-fit"
                >
                  <Store className="h-3.5 w-3.5" />
                  {t("becomeSellerCta")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      renderNav={() => (
        <div>
          <Heading level={3} className="text-base font-semibold mb-4">
            {t("quickNav")}
          </Heading>
          <div className={THEME_CONSTANTS.grid.navTiles}>
            {QUICK_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl p-5 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${THEME_CONSTANTS.flex.center} ${item.iconBg}`}
                >
                  <item.icon
                    className={`h-5 w-5 ${item.iconColor}`}
                    strokeWidth={1.5}
                  />
                </div>
                <Span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  {tNav(item.labelKey)}
                </Span>
              </Link>
            ))}
          </div>
        </div>
      )}
      renderRecentOrders={() => (
        <div>
          <div className={`${THEME_CONSTANTS.flex.between} mb-4`}>
            <Heading level={3} className="text-base font-semibold">
              {t("recentOrders")}
            </Heading>
            <Link
              href={ROUTES.USER.ORDERS}
              className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:opacity-75 transition-opacity"
            >
              {t("viewAllOrders")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {ordersLoading ? (
            <div className={`${THEME_CONSTANTS.flex.center} py-8`}>
              <Spinner size="sm" />
            </div>
          ) : !orders?.length ? (
            <div className="py-10 text-center">
              <Package
                className="h-10 w-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-600"
                strokeWidth={1}
              />
              <Text size="sm" variant="secondary">
                {t("noOrders")}
              </Text>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden divide-y divide-zinc-100 dark:divide-slate-800">
              {orders.slice(0, 3).map((order) => (
                <Link
                  key={order.id}
                  href={ROUTES.USER.ORDER_DETAIL(order.id)}
                  className={`${THEME_CONSTANTS.flex.between} px-4 py-3 hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition-colors group`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <Span className="text-sm font-medium truncate">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Span>
                    <Text size="xs" variant="secondary" as="span">
                      {formatDate(order.orderDate)} �{" "}
                      {formatCurrency(order.totalPrice)}
                    </Text>
                  </div>
                  <Row gap="sm" className="flex-shrink-0 ml-3">
                    <StatusBadge
                      status={ORDER_STATUS_MAP[order.status] ?? "pending"}
                    />
                    <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                  </Row>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    />
  );
}

