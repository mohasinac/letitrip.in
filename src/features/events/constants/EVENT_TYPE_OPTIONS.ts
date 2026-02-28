/**
 * Event type values for use with useTranslations("eventTypes").
 * Keys in the `eventTypes` namespace match these values exactly.
 * Consumers must call t(value) to get the translated label.
 */
export const EVENT_TYPE_VALUES = [
  "sale",
  "offer",
  "poll",
  "survey",
  "feedback",
] as const;

export type EventTypeValue = (typeof EVENT_TYPE_VALUES)[number];
