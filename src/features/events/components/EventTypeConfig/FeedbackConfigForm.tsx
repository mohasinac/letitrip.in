"use client";

import { FormGroup } from "@mohasinac/appkit/ui";
import { useTranslations } from "next-intl";
import { SurveyFieldBuilder } from "../SurveyFieldBuilder";
import type { FeedbackConfig } from "@/db/schema";
import { Checkbox } from "@mohasinac/appkit/ui";

interface FeedbackConfigFormProps {
  value: Partial<FeedbackConfig>;
  onChange: (v: Partial<FeedbackConfig>) => void;
}

export function FeedbackConfigForm({
  value,
  onChange,
}: FeedbackConfigFormProps) {
  const t = useTranslations("feedbackConfig");
  return (
    <FormGroup>
      <Checkbox
        id="allowAnonymous"
        checked={value.anonymous ?? false}
        onChange={(e) => onChange({ ...value, anonymous: e.target.checked })}
        label={t("allowAnonymousLabel")}
      />
      <SurveyFieldBuilder
        fields={value.formFields ?? []}
        onChange={(fields) => onChange({ ...value, formFields: fields })}
      />
    </FormGroup>
  );
}

