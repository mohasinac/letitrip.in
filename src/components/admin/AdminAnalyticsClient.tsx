"use client";
import { useState } from "react";
import { AdminAnalyticsView, Label, Input } from "@mohasinac/appkit/client";
import { AdminLiveOverviewCard } from "./analytics/AdminLiveOverviewCard";

import { Row } from "@mohasinac/appkit";
function today() {
  // eslint-disable-next-line lir/no-raw-date
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(n: number) {
  // eslint-disable-next-line lir/no-raw-date
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function AdminAnalyticsClient() {
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(today());

  const endpoint = `/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`;

  return (
    <>
      <AdminLiveOverviewCard />
      <AdminAnalyticsView
        endpoint={endpoint}
      renderDateRange={() => (
        <Row surface="muted" padding="inline" align="center" gap="3" wrap rounded="xl" border="default">
          <Label layout="flex" gap="md" color="muted" size="sm">
            From
            <Input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-[var(--appkit-space-2-5)] py-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text)] border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text)]"
            />
          </Label>
          <Label layout="flex" gap="md" color="muted" size="sm">
            To
            <Input
              type="date"
              value={endDate}
              min={startDate}
              max={today()}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-[var(--appkit-space-2-5)] py-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text)] border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text)]"
            />
          </Label>
        </Row>
      )}
      />
    </>
  );
}
