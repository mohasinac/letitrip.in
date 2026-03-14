"use client";

import { useTranslations } from "next-intl";
import { useAuth, useRCBalance } from "@/hooks";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Span, Text, TextLink } from "@/components";

const { themed } = THEME_CONSTANTS;

interface RCBalanceChipProps {
  /** If provided, shows a warning when the balance is below this value. */
  minimumRequired?: number;
  className?: string;
  /** "chip" = compact inline pill; "panel" = full card with warning text */
  variant?: "chip" | "panel";
}

export function RCBalanceChip({
  minimumRequired,
  className = "",
  variant = "chip",
}: RCBalanceChipProps) {
  const { user } = useAuth();
  const t = useTranslations("auctions");
  const { data, isLoading } = useRCBalance(!!user);

  if (!user || isLoading) return null;

  const balance = data?.rcBalance ?? 0;
  const isInsufficient =
    minimumRequired !== undefined && balance < minimumRequired;

  if (variant === "chip") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
          isInsufficient
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700"
            : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700"
        } ${className}`}
      >
        🪙 <Span weight="semibold">{balance.toLocaleString("en-IN")}</Span>
        <Span className="hidden sm:inline opacity-70">{t("rcUnit")}</Span>
        <TextLink
          href={ROUTES.USER.RC_PURCHASE}
          className="ml-1 underline underline-offset-2 font-semibold hover:no-underline"
        >
          {t("topUpRC")}
        </TextLink>
      </div>
    );
  }

  // Panel variant — used in AuctionDetailView sidebar and PlaceBidForm
  return (
    <div
      className={`rounded-xl border p-3 ${
        isInsufficient
          ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700"
          : "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-700"
      } ${className}`}
    >
      <div className={`${THEME_CONSTANTS.flex.between} gap-2`}>
        <div className="flex items-center gap-2 min-w-0">
          <Span className="text-base shrink-0">🪙</Span>
          <div className="min-w-0">
            <Text size="xs" variant="secondary">
              {t("rcBalanceLabel")}
            </Text>
            <Text
              size="sm"
              weight="semibold"
              className={
                isInsufficient
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-indigo-700 dark:text-indigo-400"
              }
            >
              {balance.toLocaleString("en-IN")}{" "}
              <Span className="font-normal opacity-70">{t("rcUnit")}</Span>
            </Text>
          </div>
        </div>
        <TextLink
          href={ROUTES.USER.RC_PURCHASE}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 whitespace-nowrap"
        >
          {t("topUpRC")} →
        </TextLink>
      </div>
      {isInsufficient && minimumRequired !== undefined && (
        <Text size="xs" className="mt-2 text-amber-600 dark:text-amber-400">
          {t("rcNeeded", { count: minimumRequired - balance })}
        </Text>
      )}
    </div>
  );
}
