import { UI_LABELS } from "@/constants";

export const EVENT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: UI_LABELS.EVENT_STATUS.DRAFT },
  { value: "active", label: UI_LABELS.EVENT_STATUS.ACTIVE },
  { value: "paused", label: UI_LABELS.EVENT_STATUS.PAUSED },
  { value: "ended", label: UI_LABELS.EVENT_STATUS.ENDED },
] as const;
