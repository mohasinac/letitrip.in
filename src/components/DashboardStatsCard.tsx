"use client";

import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Text } from "./typography";
import { THEME_CONSTANTS } from "@/constants";

export interface DashboardStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; suffix?: string };
  href?: string;
  variant?: "default" | "dark";
}

/**
 * DashboardStatsCard
 *
 * Reusable stat card used in admin, seller, and user portals.
 * Supports default (light) and dark variants, optional trend indicator,
 * and optional link href that makes the whole card a link.
 *
 * @example
 * ```tsx
 * <DashboardStatsCard
 *   label="Total Orders"
 *   value={stats.orders.total}
 *   icon={ShoppingCart}
 *   iconBg="bg-indigo-500/10"
 *   iconColor="text-indigo-600 dark:text-indigo-400"
 *   trend={{ value: 12 }}
 *   variant="dark"
 * />
 * ```
 */
export function DashboardStatsCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary-600 dark:text-primary-400",
  iconBg = "bg-primary-500/10 dark:bg-primary-500/20",
  trend,
  href,
  variant = "default",
}: DashboardStatsCardProps) {
  const containerClass =
    variant === "dark"
      ? "rounded-2xl p-5 bg-slate-900 border border-white/5 hover:border-white/10 transition-all duration-200"
      : "rounded-2xl p-5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200";

  const labelClass =
    variant === "dark"
      ? "text-xs font-medium uppercase tracking-wide text-zinc-400 mb-1"
      : "text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1";

  const valueClass =
    variant === "dark"
      ? "font-display text-3xl font-bold text-white truncate"
      : "font-display text-3xl font-bold text-zinc-900 dark:text-white truncate";

  const content = (
    <div className={containerClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Text className={labelClass}>{label}</Text>
          <Text className={valueClass}>{value}</Text>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1.5">
              {trend.value >= 0 ? (
                <TrendingUp
                  className="w-3.5 h-3.5 text-primary-500"
                  strokeWidth={1.5}
                />
              ) : (
                <TrendingDown
                  className="w-3.5 h-3.5 text-rose-400"
                  strokeWidth={1.5}
                />
              )}
              <span
                className={
                  trend.value >= 0
                    ? "text-xs font-medium text-primary-600 dark:text-primary-400"
                    : "text-xs font-medium text-rose-400"
                }
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}
                {trend.suffix ?? "%"}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${THEME_CONSTANTS.flex.center} flex-shrink-0 ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
