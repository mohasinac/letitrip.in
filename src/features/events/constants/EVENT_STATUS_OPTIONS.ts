/**
 * Event status filter values for use with useTranslations("eventStatus").
 * The empty string "" represents "All" — handle separately in consuming components.
 * Keys in the `eventStatus` namespace match the non-empty values exactly.
 */
export const EVENT_STATUS_VALUES = [
  "",
  "draft",
  "active",
  "paused",
  "ended",
] as const;

export type EventStatusFilterValue = (typeof EVENT_STATUS_VALUES)[number];

