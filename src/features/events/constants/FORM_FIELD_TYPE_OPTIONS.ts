/**
 * Form field type values for use with useTranslations("formFieldTypes").
 * Keys in the `formFieldTypes` namespace match these values exactly.
 * Consumers must call t(value) to get the translated label.
 */
export const FORM_FIELD_TYPE_VALUES = [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "select",
  "multiselect",
  "checkbox",
  "radio",
  "date",
  "rating",
  "file",
] as const;

export type FormFieldTypeValue = (typeof FORM_FIELD_TYPE_VALUES)[number];

