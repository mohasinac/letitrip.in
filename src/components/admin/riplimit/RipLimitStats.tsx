"use client";

import {
  Card,
  RipLimitStatsCards as LibraryRipLimitStatsCards,
  type RipLimitStats,
} from "@letitrip/react-library";
import { AlertTriangle, DollarSign, Users, Wallet } from "lucide-react";

interface RipLimitStatsProps {
  stats: RipLimitStats | null;
  loading: boolean;
}

export function RipLimitStatsCards({
  stats,
  loading,
}: Readonly<RipLimitStatsProps>) {
  const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
  const formatRL = (amount: number) => `${amount.toLocaleString("en-IN")} RL`;
  const formatQuantity = (value: number) => value.toLocaleString("en-IN");

  return (
    <LibraryRipLimitStatsCards
      stats={stats}
      loading={loading}
      icons={{
        wallet: Wallet,
        dollarSign: DollarSign,
        users: Users,
        alertTriangle: AlertTriangle,
      }}
      formatters={{
        formatINR,
        formatRL,
        formatQuantity,
      }}
      CardComponent={Card}
    />
  );
}
