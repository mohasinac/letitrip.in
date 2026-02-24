"use client";

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
        <label htmlFor="entryReview" className="text-sm">
          Require admin review for each entry
        </label>
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
        <label htmlFor="hasLeaderboard" className="text-sm">
          Enable leaderboard
        </label>
      </div>
      <SurveyFieldBuilder
        fields={value.formFields ?? []}
        onChange={(fields) => onChange({ ...value, formFields: fields })}
      />
    </div>
  );
}
