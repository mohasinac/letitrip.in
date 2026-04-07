"use client";

import { Link } from "@/i18n/navigation";
import type { ElementType } from "react";

export interface DashboardStatsCardProps {
  label: string;
  value: number | string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: number };
  variant?: "dark";
  href?: string;
  className?: string;
}

export function DashboardStatsCard({
  label,
  value,
  icon: Icon,
  iconBg = "bg-gray-100 dark:bg-gray-800",
  iconColor = "text-gray-600 dark:text-gray-400",
  trend,
  variant,
  href,
  className = "",
}: DashboardStatsCardProps) {
  const isDark = variant === "dark";
  const card = (
    <div
      className={`rounded-xl p-4 flex items-center gap-4 ${
        isDark
          ? "bg-gray-900 text-white"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      } ${className}`}
    >
      {Icon && (
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {label}
        </p>
        <p className="text-xl font-semibold truncate">{value}</p>
        {trend !== undefined && (
          <p
            className={`text-xs font-medium ${
              trend.value >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}
