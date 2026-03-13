"use client";

import {
  Package,
  MessageSquare,
  Bell,
  MapPin,
  Zap,
  Settings,
  ChevronRight,
  ArrowRight,
  Store,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AvatarDisplay, Button, Heading, Spinner, Text } from "@/components";
import { RoleBadge } from "@/components";
import { StatusBadge } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useAuth } from "@/hooks";
import { useUserOrders } from "../hooks";
import { useRCBalance } from "@/hooks";
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
  countKey?: string;
}

const QUICK_NAV_ITEMS: QuickNavItem[] = [
  {
    href: ROUTES.USER.ORDERS,
    labelKey: "myOrders",
    icon: Package,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
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
    href: ROUTES.USER.RC,
    labelKey: "myRC",
    icon: Zap,
    iconBg: "bg-primary-500/10",
    iconColor: "text-primary-600 dark:text-primary-400",
  },
  {
    href: ROUTES.USER.SETTINGS,
    labelKey: "settings",
    icon: Settings,
    iconBg: "bg-zinc-500/10",
    iconColor: "text-zinc-600 dark:text-zinc-400",
  },
];

/**
 * UserAccountHub
 *
 * Landing page for the /user route — spatial orientation for users with:
 * 1. Profile header (avatar, name, role badge, RC balance)
 * 2. Quick nav grid (2×3 cards)
 * 3. Recent orders (last 3)
 */
export function UserAccountHub() {
  const { user, loading } = useAuth();
  const t = useTranslations("userHub");
  const tNav = useTranslations("nav");
  const { data: rcData } = useRCBalance();
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
    <div className="space-y-8 pb-8">
      {/* ── Profile header ────────────────────────────────────────────── */}
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
              <Heading
                level={2}
                className="text-xl font-bold text-zinc-900 dark:text-white"
              >
                {user.displayName ?? user.email}
              </Heading>
              <RoleBadge role={user.role} />
            </div>
            <Text size="sm" variant="secondary" className="mb-3">
              {user.email}
            </Text>
            {/* Quick stats row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary-500" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {rcData?.rcBalance ?? 0} RC
                </span>
              </div>
              {user.role === "user" && (
                <Link
                  href={ROUTES.USER.BECOME_SELLER}
                  className="flex items-center gap-1.5 rounded-full bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 px-3 py-1 text-xs font-semibold hover:bg-cobalt-500/20 transition-colors"
                >
                  <Store className="h-3.5 w-3.5" />
                  {t("becomeSellerCta")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick nav grid ─────────────────────────────────────────────── */}
      <div>
        <Heading
          level={3}
          className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-4"
        >
          {t("quickNav")}
        </Heading>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6 gap-4">
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
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {tNav(item.labelKey)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent orders ──────────────────────────────────────────────── */}
      <div>
        <div className={`${THEME_CONSTANTS.flex.between} mb-4`}>
          <Heading
            level={3}
            className="text-base font-semibold text-zinc-700 dark:text-zinc-300"
          >
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
        <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden">
          {ordersLoading ? (
            <div className={`${THEME_CONSTANTS.flex.center} py-10`}>
              <Spinner size="md" />
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
            <div className="divide-y divide-zinc-100 dark:divide-slate-800">
              {orders.slice(0, 3).map((order) => (
                <Link
                  key={order.id}
                  href={ROUTES.USER.ORDER_DETAIL(order.id)}
                  className={`${THEME_CONSTANTS.flex.between} px-4 py-3 hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition-colors group`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(order.orderDate)} ·{" "}
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <StatusBadge
                      status={ORDER_STATUS_MAP[order.status] ?? "pending"}
                    />
                    <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
