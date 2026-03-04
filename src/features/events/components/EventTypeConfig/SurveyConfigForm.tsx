"use client";

import { Checkbox } from "@/components";
import { SurveyFieldBuilder } from "../SurveyFieldBuilder";
import type { SurveyConfig } from "@/db/schema";

interface SurveyConfigFormProps {
  value: Partial<SurveyConfig>;
  onChange: (v: Partial<SurveyConfig>) => void;
}

export function SurveyConfigForm({ value, onChange }: SurveyConfigFormProps) {
  return (
    <div className="space-y-4">
      <Checkbox
        id="entryReview"
        checked={value.entryReviewRequired ?? false}
        onChange={(e) =>
          onChange({ ...value, entryReviewRequired: e.target.checked })
        }
        label="Require admin review for each entry"
      />
      <Checkbox
        id="hasLeaderboard"
        checked={value.hasLeaderboard ?? false}
        onChange={(e) =>
          onChange({ ...value, hasLeaderboard: e.target.checked })
        }
        label="Enable leaderboard"
      />
      <SurveyFieldBuilder
        fields={value.formFields ?? []}
        onChange={(fields) => onChange({ ...value, formFields: fields })}
      />
    </div>
  );
}
