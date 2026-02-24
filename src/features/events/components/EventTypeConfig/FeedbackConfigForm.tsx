"use client";

import { SurveyFieldBuilder } from "../SurveyFieldBuilder";
import type { FeedbackConfig } from "@/db/schema";

interface FeedbackConfigFormProps {
  value: Partial<FeedbackConfig>;
  onChange: (v: Partial<FeedbackConfig>) => void;
}

export function FeedbackConfigForm({
  value,
  onChange,
}: FeedbackConfigFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowAnonymous"
          checked={value.anonymous ?? false}
          onChange={(e) => onChange({ ...value, anonymous: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="allowAnonymous" className="text-sm">
          Allow anonymous submissions
        </label>
      </div>
      <SurveyFieldBuilder
        fields={value.formFields ?? []}
        onChange={(fields) => onChange({ ...value, formFields: fields })}
      />
    </div>
  );
}
