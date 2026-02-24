import { UI_LABELS } from "@/constants";

export const FORM_FIELD_TYPE_OPTIONS = [
  { value: "text", label: UI_LABELS.FORM_FIELD_TYPES.TEXT },
  { value: "textarea", label: UI_LABELS.FORM_FIELD_TYPES.TEXTAREA },
  { value: "email", label: UI_LABELS.FORM_FIELD_TYPES.EMAIL },
  { value: "phone", label: UI_LABELS.FORM_FIELD_TYPES.PHONE },
  { value: "number", label: UI_LABELS.FORM_FIELD_TYPES.NUMBER },
  { value: "select", label: UI_LABELS.FORM_FIELD_TYPES.SELECT },
  { value: "multiselect", label: UI_LABELS.FORM_FIELD_TYPES.MULTISELECT },
  { value: "checkbox", label: UI_LABELS.FORM_FIELD_TYPES.CHECKBOX },
  { value: "radio", label: UI_LABELS.FORM_FIELD_TYPES.RADIO },
  { value: "date", label: UI_LABELS.FORM_FIELD_TYPES.DATE },
  { value: "rating", label: UI_LABELS.FORM_FIELD_TYPES.RATING },
  { value: "file", label: UI_LABELS.FORM_FIELD_TYPES.FILE },
] as const;
