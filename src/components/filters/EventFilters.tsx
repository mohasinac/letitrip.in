"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import { RangeFilter } from "./RangeFilter";
import type { UrlTable } from "./ProductFilters";

export const EVENT_SORT_OPTIONS = [
  { value: "title", label: "Title A–Z" },
  { value: "-title", label: "Title Z–A" },
  { value: "-startsAt", label: "Starts Latest" },
  { value: "startsAt", label: "Starts Soonest" },
  { value: "-endsAt", label: "Ends Latest" },
  { value: "endsAt", label: "Ends Soonest" },
  { value: "-stats.totalEntries", label: "Most Entries" },
  { value: "-createdAt", label: "Newest First" },
] as const;

export interface EventFiltersProps {
  table: UrlTable;
}

export function EventFilters({ table }: EventFiltersProps) {
  const t = useTranslations("filters");

  const typeOptions = [
    { value: "sale", label: t("eventTypeSale") },
    { value: "offer", label: t("eventTypeOffer") },
    { value: "poll", label: t("eventTypePoll") },
    { value: "survey", label: t("eventTypeSurvey") },
    { value: "feedback", label: t("eventTypeFeedback") },
  ];

  const statusOptions = [
    { value: "draft", label: t("eventStatusDraft") },
    { value: "active", label: t("eventStatusActive") },
    { value: "paused", label: t("eventStatusPaused") },
    { value: "ended", label: t("eventStatusEnded") },
  ];

  const selectedType = table.get("type") ? [table.get("type")] : [];
  const selectedStatus = table.get("status") ? [table.get("status")] : [];

  return (
    <div>
      <FilterFacetSection
        title={t("type")}
        options={typeOptions}
        selected={selectedType}
        onChange={(vals) => table.set("type", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("status")}
        options={statusOptions}
        selected={selectedStatus}
        onChange={(vals) => table.set("status", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <RangeFilter
        title={t("dateRange")}
        type="date"
        minValue={table.get("dateFrom")}
        maxValue={table.get("dateTo")}
        onMinChange={(v) => table.set("dateFrom", v)}
        onMaxChange={(v) => table.set("dateTo", v)}
        minPlaceholder={t("minDate")}
        maxPlaceholder={t("maxDate")}
        defaultCollapsed={true}
      />
    </div>
  );
}
