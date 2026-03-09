/**
 * FaqForm Component
 * Path: src/components/admin/faqs/FaqForm.tsx
 *
 * Drawer form for creating/editing FAQs in admin panel.
 * Includes RichTextEditor for answer, variable helper, category select, etc.
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Article,
  Button,
  Checkbox,
  FormField,
  Label,
  Li,
  Text,
  Ul,
} from "@/components";
import { RichTextEditor } from "./RichTextEditor";
import { THEME_CONSTANTS } from "@/constants";
import type { FAQ } from "./Faq.types";
import { FAQ_CATEGORIES, VARIABLE_PLACEHOLDERS } from "./Faq.types";

const { spacing, themed, typography, flex, grid } = THEME_CONSTANTS;

interface FaqFormProps {
  faq: Partial<FAQ>;
  onChange: (updated: Partial<FAQ>) => void;
  isReadonly?: boolean;
}

export function FaqForm({ faq, onChange, isReadonly = false }: FaqFormProps) {
  const t = useTranslations("adminFaqs");
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
        label={t("question")}
        type="text"
        value={faq.question || ""}
        onChange={(value) => update({ question: value })}
        disabled={isReadonly}
        placeholder={t("questionPlaceholder")}
      />

      {/* Answer with variable helper */}
      <div>
        <div className={`${flex.between} mb-2`}>
          <Label className={`block ${typography.label} mb-0`}>
            {t("answer")}
          </Label>
          {!isReadonly && (
            <Button
              onClick={() => setShowVariableHelper(!showVariableHelper)}
              aria-expanded={showVariableHelper}
              aria-controls="faq-variable-helper"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {showVariableHelper ? t("hideVariables") : t("showVariables")}
            </Button>
          )}
        </div>

        <div
          id="faq-variable-helper"
          hidden={!showVariableHelper || isReadonly}
          className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800"
        >
          <Text size="xs" variant="secondary" className="mb-2">
            {t("insertVariableHelp")}
          </Text>
          <Ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {VARIABLE_PLACEHOLDERS.map((v) => (
              <Li key={v.key}>
                <Button
                  onClick={() => insertVariable(v.key)}
                  className={`px-2 py-1 text-xs ${themed.bgPrimary} border ${themed.border} rounded ${themed.hover}`}
                  title={v.description}
                  aria-label={t("insertVariableAriaLabel", {
                    key: v.key,
                    description: v.description,
                  })}
                >
                  <code>{v.key}</code>
                </Button>
              </Li>
            ))}
          </Ul>
        </div>

        {isReadonly ? (
          <Article
            className={`${THEME_CONSTANTS.patterns.adminInput} opacity-60 min-h-[150px]`}
            dangerouslySetInnerHTML={{ __html: faq.answer || "" }}
          />
        ) : (
          <RichTextEditor
            content={faq.answer || ""}
            onChange={(content) => update({ answer: content })}
            placeholder={t("answerPlaceholder")}
            minHeight="200px"
          />
        )}
      </div>

      <div className={`${grid.cols2} ${spacing.gap.md}`}>
        <FormField
          name="category"
          label={t("category")}
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
            label={t("priorityLabel")}
            type="number"
            value={String(faq.priority || 5)}
            onChange={(value) => update({ priority: parseInt(value) || 5 })}
            disabled={isReadonly}
          />
          <Text size="xs" variant="secondary" className="mt-1">
            {t("priorityHelp")}
          </Text>
        </div>
      </div>

      <FormField
        name="tags"
        label={t("tags")}
        type="text"
        value={(faq.tags || []).join(", ")}
        onChange={(value) =>
          update({
            tags: value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          })
        }
        disabled={isReadonly}
        placeholder={t("tagsPlaceholder")}
      />

      <div className={`${grid.cols2} ${spacing.gap.md}`}>
        <div>
          <FormField
            name="order"
            label={t("order")}
            type="number"
            value={String(faq.order || 0)}
            onChange={(value) => update({ order: parseInt(value) || 0 })}
            disabled={isReadonly}
          />
          <Text size="xs" variant="secondary" className="mt-1">
            {t("orderHelp")}
          </Text>
        </div>

        <div className={`${flex.rowCenter} mt-6`}>
          <Checkbox
            label={t("featuredLabel")}
            checked={faq.featured || false}
            onChange={(e) => update({ featured: e.target.checked })}
            disabled={isReadonly}
          />
        </div>
      </div>
    </div>
  );
}
