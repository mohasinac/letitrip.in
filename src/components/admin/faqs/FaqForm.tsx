/**
 * FaqForm Component
 * Path: src/components/admin/faqs/FaqForm.tsx
 *
 * Drawer form for creating/editing FAQs in admin panel.
 * Includes RichTextEditor for answer, variable helper, category select, etc.
 */

"use client";

import { useState } from "react";
import { FormField, RichTextEditor } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { FAQ } from "./types";
import { FAQ_CATEGORIES, VARIABLE_PLACEHOLDERS } from "./types";

const { spacing, themed, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.ADMIN.FAQS;

interface FaqFormProps {
  faq: Partial<FAQ>;
  onChange: (updated: Partial<FAQ>) => void;
  isReadonly?: boolean;
}

export function FaqForm({ faq, onChange, isReadonly = false }: FaqFormProps) {
  const [showVariableHelper, setShowVariableHelper] = useState(false);

  const update = (partial: Partial<FAQ>) => {
    onChange({ ...faq, ...partial });
  };

  const insertVariable = (variable: string) => {
    const currentAnswer = faq.answer || "";
    update({ answer: currentAnswer + variable });
  };

  return (
    <div className={spacing.stack}>
      <FormField
        name="question"
        label={LABELS.QUESTION}
        type="text"
        value={faq.question || ""}
        onChange={(value) => update({ question: value })}
        disabled={isReadonly}
        placeholder="Enter FAQ question..."
      />

      {/* Answer with variable helper */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`block ${typography.label} mb-0`}>
            {LABELS.ANSWER}
          </label>
          {!isReadonly && (
            <button
              onClick={() => setShowVariableHelper(!showVariableHelper)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {showVariableHelper
                ? LABELS.HIDE_VARIABLES
                : LABELS.SHOW_VARIABLES}
            </button>
          )}
        </div>

        {showVariableHelper && !isReadonly && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
            <p className={`text-xs ${themed.textSecondary} mb-2`}>
              {LABELS.INSERT_VARIABLE_HELP}
            </p>
            <div className="flex flex-wrap gap-2">
              {VARIABLE_PLACEHOLDERS.map((v) => (
                <button
                  key={v.key}
                  onClick={() => insertVariable(v.key)}
                  className={`px-2 py-1 text-xs ${themed.bgPrimary} border ${themed.border} rounded ${themed.hover}`}
                  title={v.description}
                >
                  {v.key}
                </button>
              ))}
            </div>
          </div>
        )}

        {isReadonly ? (
          <div
            className={`${THEME_CONSTANTS.patterns.adminInput} opacity-60 min-h-[150px]`}
            dangerouslySetInnerHTML={{ __html: faq.answer || "" }}
          />
        ) : (
          <RichTextEditor
            content={faq.answer || ""}
            onChange={(content) => update({ answer: content })}
            placeholder="Enter FAQ answer (use rich text formatting)..."
            minHeight="200px"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="category"
          label={LABELS.CATEGORY}
          type="select"
          value={faq.category || "General"}
          onChange={(value) => update({ category: value })}
          disabled={isReadonly}
          options={FAQ_CATEGORIES.map((cat) => ({
            value: cat,
            label: cat,
          }))}
        />

        <div>
          <FormField
            name="priority"
            label={`${LABELS.PRIORITY} (1-10)`}
            type="number"
            value={String(faq.priority || 5)}
            onChange={(value) => update({ priority: parseInt(value) || 5 })}
            disabled={isReadonly}
          />
          <p className={`text-xs ${themed.textSecondary} mt-1`}>
            {LABELS.PRIORITY_HELP}
          </p>
        </div>
      </div>

      <FormField
        name="tags"
        label={LABELS.TAGS}
        type="text"
        value={(faq.tags || []).join(", ")}
        onChange={(value) =>
          update({
            tags: value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        disabled={isReadonly}
        placeholder={LABELS.TAGS_PLACEHOLDER}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FormField
            name="order"
            label="Order"
            type="number"
            value={String(faq.order || 0)}
            onChange={(value) => update({ order: parseInt(value) || 0 })}
            disabled={isReadonly}
          />
          <p className={`text-xs ${themed.textSecondary} mt-1`}>
            {LABELS.ORDER_HELP}
          </p>
        </div>

        <div className="flex items-center mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={faq.featured || false}
              onChange={(e) => update({ featured: e.target.checked })}
              disabled={isReadonly}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className={typography.label}>{LABELS.FEATURED_LABEL}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
