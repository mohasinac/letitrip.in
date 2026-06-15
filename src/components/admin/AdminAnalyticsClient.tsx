"use client";
import { useState } from "react";
import { AdminAnalyticsView, Div, Label, Input } from "@mohasinac/appkit/client";

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
    <AdminAnalyticsView
      endpoint={endpoint}
      renderDateRange={() => (
        <Row className="px-4" surface="muted" padding="y-sm" align="center" gap="3" wrap rounded="xl" border="default">
          <Label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400" size="sm">
            From
            <Input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </Label>
          <Label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400" size="sm">
            To
            <Input
              type="date"
              value={endDate}
              min={startDate}
              max={today()}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </Label>
        </Row>
      )}
    />
  );
}
