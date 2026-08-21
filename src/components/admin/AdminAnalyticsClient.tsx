"use client";
import { useState } from "react";
import { AdminAnalyticsView, AdminPageViewsReportView, Label, Input } from "@mohasinac/appkit/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@mohasinac/appkit/ui";
import { AdminLiveOverviewCard } from "./analytics/AdminLiveOverviewCard";

import { Row } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
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

  const endpoint = `${API_ROUTES.ADMIN.ANALYTICS}?startDate=${startDate}&endDate=${endDate}`;

  const dateRangePicker = (
    <Row surface="muted" padding="inline" align="center" gap="3" wrap rounded="xl" border="default">
      <Label layout="flex" gap="md" color="muted" size="sm">
        From
        <Input
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border px-[var(--appkit-space-2-5)] py-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text)]"
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
          className="rounded-lg border px-[var(--appkit-space-2-5)] py-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text)]"
        />
      </Label>
    </Row>
  );

  return (
    <>
      <AdminLiveOverviewCard />
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="pageviews">Page Views</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <AdminAnalyticsView
            endpoint={endpoint}
            renderDateRange={() => dateRangePicker}
          />
        </TabsContent>
        <TabsContent value="pageviews">
          <AdminPageViewsReportView />
        </TabsContent>
      </Tabs>
    </>
  );
}
