import { UI_LABELS } from "@/constants";

export const EVENT_TYPE_OPTIONS = [
  { value: "sale", label: UI_LABELS.EVENT_TYPES.SALE },
  { value: "offer", label: UI_LABELS.EVENT_TYPES.OFFER },
  { value: "poll", label: UI_LABELS.EVENT_TYPES.POLL },
  { value: "survey", label: UI_LABELS.EVENT_TYPES.SURVEY },
  { value: "feedback", label: UI_LABELS.EVENT_TYPES.FEEDBACK },
] as const;
