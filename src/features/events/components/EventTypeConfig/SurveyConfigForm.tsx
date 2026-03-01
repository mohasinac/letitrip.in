"use client";

import { Label } from "@/components";
import { SurveyFieldBuilder } from "../SurveyFieldBuilder";
import type { SurveyConfig } from "@/db/schema";

interface SurveyConfigFormProps {
  value: Partial<SurveyConfig>;
  onChange: (v: Partial<SurveyConfig>) => void;
}

export function SurveyConfigForm({ value, onChange }: SurveyConfigFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="entryReview"
          checked={value.entryReviewRequired ?? false}
          onChange={(e) =>
            onChange({ ...value, entryReviewRequired: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="entryReview">Require admin review for each entry</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasLeaderboard"
          checked={value.hasLeaderboard ?? false}
          onChange={(e) =>
            onChange({ ...value, hasLeaderboard: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="hasLeaderboard">Enable leaderboard</Label>
      </div>
      <SurveyFieldBuilder
        fields={value.formFields ?? []}
        onChange={(fields) => onChange({ ...value, formFields: fields })}
      />
    </div>
  );
}
