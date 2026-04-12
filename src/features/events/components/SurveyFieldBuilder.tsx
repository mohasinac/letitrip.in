"use client";

import { Label, Text, Button, Row } from "@mohasinac/appkit/ui";
import { Checkbox, Input, Select } from "@/components";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { FORM_FIELD_TYPE_VALUES } from "../constants/FORM_FIELD_TYPE_OPTIONS";
import type { SurveyFormField, FormFieldType } from "@/db/schema";

interface SurveyFieldBuilderProps {
  fields: SurveyFormField[];
  onChange: (fields: SurveyFormField[]) => void;
}

function generateId() {
  return crypto.randomUUID();
}

function emptyField(order: number): SurveyFormField {
  return {
    id: generateId(),
    label: "",
    type: "text",
    required: false,
    order,
  };
}

export function SurveyFieldBuilder({
  fields,
  onChange,
}: SurveyFieldBuilderProps) {
  const t = useTranslations("adminEvents");
  const tActions = useTranslations("actions");
  const tFieldTypes = useTranslations("formFieldTypes");
  const { flex, themed } = THEME_CONSTANTS;
  const addField = () => onChange([...fields, emptyField(fields.length)]);

  const updateField = (id: string, patch: Partial<SurveyFormField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const removeField = (id: string) =>
    onChange(fields.filter((f) => f.id !== id));

  const moveField = (index: number, direction: "up" | "down") => {
    const next = [...fields];
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className={flex.between}>
        <Label>{t("formFieldsLabel")}</Label>
        <Button variant="outline" size="sm" onClick={addField} type="button">
          {t("addField")}
        </Button>
      </div>

      {fields.length === 0 && (
        <Text size="sm" variant="muted" className="italic">
          {t("noFieldsYet")}
        </Text>
      )}

      {fields.map((field, idx) => (
        <div
          key={field.id}
          className={`border ${themed.border} rounded-lg p-3 space-y-3`}
        >
          <Row gap="sm">
            <div className="flex-1">
              <Label className="mb-0.5">{t("fieldLabel")}</Label>
              <Input
                type="text"
                value={field.label}
                onChange={(e) =>
                  updateField(field.id, { label: e.target.value })
                }
                placeholder={t("fieldLabelPlaceholder")}
              />
            </div>
            <div className="shrink-0 mt-4">
              <Select
                value={field.type}
                onChange={(e) =>
                  updateField(field.id, {
                    type: e.target.value as FormFieldType,
                  })
                }
                options={FORM_FIELD_TYPE_VALUES.map((value) => ({
                  value,
                  label: tFieldTypes(value),
                }))}
              />
            </div>
          </Row>

          {(field.type === "select" ||
            field.type === "multiselect" ||
            field.type === "radio") && (
            <div>
              <Label className="mb-0.5">{t("optionsLabel")}</Label>
              <Input
                type="text"
                value={(field.options ?? []).join(", ")}
                onChange={(e) =>
                  updateField(field.id, {
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={t("optionsPlaceholder")}
              />
            </div>
          )}

          <div className={flex.between}>
            <Checkbox
              checked={field.required ?? false}
              onChange={(e) =>
                updateField(field.id, { required: e.target.checked })
              }
              label="Required"
            />
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveField(idx, "up")}
                disabled={idx === 0}
                type="button"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveField(idx, "down")}
                disabled={idx === fields.length - 1}
                type="button"
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 dark:text-red-400"
                onClick={() => removeField(field.id)}
                type="button"
              >
                {tActions("delete")}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
