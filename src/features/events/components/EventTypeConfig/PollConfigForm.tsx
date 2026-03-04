"use client";

import { useState } from "react";
import { Button, Checkbox, Input, Label, Select } from "@/components";
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
              <Input
                type="text"
                value={opt.label}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                placeholder={`Option ${idx + 1}`}
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
      <Checkbox
        id="allowMultiSelect"
        checked={value.allowMultiSelect ?? false}
        onChange={(e) => setField("allowMultiSelect", e.target.checked)}
        label="Allow multiple selections"
      />
      <Checkbox
        id="allowComment"
        checked={value.allowComment ?? false}
        onChange={(e) => setField("allowComment", e.target.checked)}
        label="Allow comments"
      />
      <div>
        <Label className="mb-1">Results Visibility</Label>
        <Select
          value={value.resultsVisibility ?? "always"}
          onChange={(e) =>
            setField(
              "resultsVisibility",
              e.target.value as PollConfig["resultsVisibility"],
            )
          }
          options={[
            { value: "always", label: "Always" },
            { value: "after_vote", label: "After voting" },
            { value: "after_end", label: "After event ends" },
          ]}
        />
      </div>
    </div>
  );
}
