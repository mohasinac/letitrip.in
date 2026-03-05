"use client";

import React from "react";
import { Card, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";

export interface StatItem {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  colorClass?: string;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnsClass: Record<2 | 3 | 4, string> = {
  2: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2",
  3: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3",
  4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4",
};

export function StatsGrid({
  stats,
  columns = 3,
  className,
}: StatsGridProps) {
  const { spacing: sp, flex: fl, themed } = THEME_CONSTANTS;

  return (
    <div className={classNames(columnsClass[columns], sp.gap.md, className)}>
      {stats.map((stat, i) => (
        <Card key={`${stat.label}-${i}`} className={sp.cardPadding}>
          <div className={fl.between}>
            <div>
              <Text className={classNames("text-sm font-medium", themed.textSecondary)}>
                {stat.label}
              </Text>
              <Text className="text-3xl font-bold mt-1">{stat.value}</Text>
            </div>
            {stat.icon && (
              <div className={classNames(stat.colorClass ?? "text-gray-400 dark:text-gray-500")}>
                {stat.icon}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
