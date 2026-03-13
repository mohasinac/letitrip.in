"use client";

import { AlertTriangle, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Stack } from "@/components";
import { ROUTES } from "@/constants";

interface AdminPriorityAlertsProps {
  pendingPayouts?: number;
  disputedOrders?: number;
  unverifiedSellers?: number;
}

interface AlertCardProps {
  count: number;
  message: string;
  actionLabel: string;
  href: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

function AlertCard({
  count,
  message,
  actionLabel,
  href,
  borderColor,
  bgColor,
  textColor,
  icon: Icon,
}: AlertCardProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl p-4 border-l-4 ${borderColor} ${bgColor}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${textColor}`}
          strokeWidth={1.5}
        />
        <span className={`text-sm font-medium ${textColor} truncate`}>
          {message.replace("{count}", String(count))}
        </span>
      </div>
      <Link
        href={href}
        className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 ml-3 ${textColor} hover:opacity-75 transition-opacity`}
      >
        {actionLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/**
 * AdminPriorityAlerts
 *
 * Contextual alert section shown at the top of the admin dashboard.
 * Only renders when one or more alert counts are > 0.
 */
export function AdminPriorityAlerts({
  pendingPayouts = 0,
  disputedOrders = 0,
  unverifiedSellers = 0,
}: AdminPriorityAlertsProps) {
  const t = useTranslations("adminAlerts");

  const hasAlerts =
    pendingPayouts > 0 || disputedOrders > 0 || unverifiedSellers > 0;

  if (!hasAlerts) return null;

  return (
    <Stack gap="3">
      {pendingPayouts > 0 && (
        <AlertCard
          count={pendingPayouts}
          message={t("pendingPayouts", { count: pendingPayouts })}
          actionLabel={t("pendingPayoutsAction")}
          href={ROUTES.ADMIN.PAYOUTS}
          borderColor="border-l-amber-500"
          bgColor="bg-amber-50 dark:bg-amber-900/10"
          textColor="text-amber-700 dark:text-amber-400"
          icon={Clock}
        />
      )}
      {disputedOrders > 0 && (
        <AlertCard
          count={disputedOrders}
          message={t("disputedOrders", { count: disputedOrders })}
          actionLabel={t("disputedOrdersAction")}
          href={ROUTES.ADMIN.ORDERS}
          borderColor="border-l-rose-500"
          bgColor="bg-rose-50 dark:bg-rose-900/10"
          textColor="text-rose-700 dark:text-rose-400"
          icon={AlertCircle}
        />
      )}
      {unverifiedSellers > 0 && (
        <AlertCard
          count={unverifiedSellers}
          message={t("unverifiedSellers", { count: unverifiedSellers })}
          actionLabel={t("unverifiedSellersAction")}
          href={ROUTES.ADMIN.STORES}
          borderColor="border-l-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-900/10"
          textColor="text-orange-700 dark:text-orange-400"
          icon={AlertTriangle}
        />
      )}
    </Stack>
  );
}
