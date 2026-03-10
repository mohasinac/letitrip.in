import React from "react";
import { Card, Spinner } from "@/components";
import { Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

const { enhancedCard, spacing, themed, flex } = THEME_CONSTANTS;

interface SellerStatCardProps {
  label: string;
  value: number | string;
  /** lucide-react icon element or any ReactNode */
  icon: React.ReactNode;
  /** THEME_CONSTANTS.enhancedCard.stat.* token (defaults to base) */
  cardClass?: string;
  /** Tailwind color class for the value number and icon */
  iconClass?: string;
  loading?: boolean;
}

export function SellerStatCard({
  label,
  value,
  icon,
  cardClass = enhancedCard.base,
  iconClass = "text-indigo-600 dark:text-indigo-400",
  loading,
}: SellerStatCardProps) {
  return (
    <div className={`${cardClass} hover:shadow-md transition-shadow p-4`}>
      <div className={flex.betweenStart}>
        <div className="flex-1">
          <Text
            size="sm"
            className="text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide mb-1"
          >
            {label}
          </Text>
          {loading ? (
            <div className="mt-2">
              <Spinner size="sm" variant="primary" />
            </div>
          ) : (
            <Text weight="bold" className={`mt-1 text-3xl ${iconClass}`}>
              {value}
            </Text>
          )}
        </div>
        <div
          className={`p-2 rounded-lg ${themed.bgSecondary} ${iconClass} flex-shrink-0`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
