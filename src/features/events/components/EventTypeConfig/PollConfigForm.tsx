"use client";

import { useState } from "react";
import { Button, Label } from "@/components";
import { useTranslations } from "next-intl";
import type { PollConfig } from "@/db/schema";

interface PollConfigFormProps {
  value: Partial<PollConfig>;
  onChange: (v: Partial<PollConfig>) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

type PollOption = { id: string; label: string };

export function PollConfigForm({ value, onChange }: PollConfigFormProps) {
  const tActions = useTranslations("actions");
  const options: PollOption[] = value.options ?? [];

  const setField = <K extends keyof PollConfig>(k: K, v: PollConfig[K]) =>
    onChange({ ...value, [k]: v });

  const addOption = () => {
    setField("options", [...options, { id: generateId(), label: "" }]);
  };

  const updateOption = (id: string, label: string) => {
    setField(
      "options",
      options.map((o) => (o.id === id ? { ...o, label } : o)),
    );
  };

  const removeOption = (id: string) => {
    setField(
      "options",
      options.filter((o) => o.id !== id),
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Poll Options</Label>
        {options.map((opt, idx) => (
          <div key={opt.id} className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={opt.label}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 shrink-0"
              onClick={() => removeOption(opt.id)}
              type="button"
            >
              {tActions("delete")}
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addOption} type="button">
          + Add Option
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowMultiSelect"
          checked={value.allowMultiSelect ?? false}
          onChange={(e) => setField("allowMultiSelect", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="allowMultiSelect">Allow multiple selections</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowComment"
          checked={value.allowComment ?? false}
          onChange={(e) => setField("allowComment", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="allowComment">Allow comments</Label>
      </div>
      <div>
        <Label className="mb-1">Results Visibility</Label>
        <select
          value={value.resultsVisibility ?? "always"}
          onChange={(e) =>
            setField(
              "resultsVisibility",
              e.target.value as PollConfig["resultsVisibility"],
            )
          }
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
        >
          <option value="always">Always</option>
          <option value="after_vote">After voting</option>
          <option value="after_end">After event ends</option>
        </select>
      </div>
    </div>
  );
}
