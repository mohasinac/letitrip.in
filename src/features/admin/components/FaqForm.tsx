"use client";

import { FormGroup } from "@mohasinac/appkit/ui";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label, Text, Button, Row } from "@mohasinac/appkit/ui";
import { Checkbox } from "@mohasinac/appkit/ui";
import { FormField } from "@/components";
import { TagInput } from "@mohasinac/appkit/ui";
import { THEME_CONSTANTS } from "@/constants";
import type { FAQ } from "./Faq.types";
import { FAQ_CATEGORIES, VARIABLE_PLACEHOLDERS } from "./Faq.types";

const { spacing, themed, typography, flex } = THEME_CONSTANTS;

interface FaqFormProps {
  faq: Partial<FAQ>;
  onChange: (updated: Partial<FAQ>) => void;
  isReadonly?: boolean;
}

export function FaqForm({ faq, onChange, isReadonly = false }: FaqFormProps) {
  const t = useTranslations("adminFaqs");
  const [showVariableHelper, setShowVariableHelper] = useState(false);
  const answerText = faq.answer?.text || "";

  const update = (partial: Partial<FAQ>) => {
    onChange({ ...faq, ...partial });
  };

  const insertVariable = (variable: string) => {
    update({
      answer: {
        text: `${answerText}${variable}`,
        format: faq.answer?.format || "plain",
      },
    });
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

      <div>
        <div className={`${flex.between} mb-2`}>
          <Label className={`block ${typography.label} mb-1.5`}>
            {t("answer")}
          </Label>
          {!isReadonly && (
            <Button
              onClick={() => setShowVariableHelper(!showVariableHelper)}
              aria-expanded={showVariableHelper}
              aria-controls="faq-variable-helper"
              className="text-sm text-primary hover:text-primary/80"
            >
              {showVariableHelper ? t("hideVariables") : t("showVariables")}
            </Button>
          )}
        </div>

        <div
          id="faq-variable-helper"
          hidden={!showVariableHelper || isReadonly}
          className="mb-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-md border border-primary/20 dark:border-primary/30"
        >
          <Text size="xs" variant="secondary" className="mb-2">
            {t("insertVariableHelp")}
          </Text>
          <Row wrap gap="sm" as="ul" className="list-none p-0 m-0">
            {VARIABLE_PLACEHOLDERS.map((v) => (
              <li key={v.key}>
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
              </li>
            ))}
          </Row>
        </div>

        <FormField
          name="answer"
          label=""
          type="textarea"
          value={answerText}
          onChange={(value) =>
            update({
              answer: {
                text: value,
                format: faq.answer?.format || "plain",
              },
            })
          }
          disabled={isReadonly}
          placeholder={t("answerPlaceholder")}
          rows={10}
        />
      </div>

      <FormGroup columns={2}>
        <FormField
          name="category"
          label={t("category")}
          type="select"
          value={faq.category || "general"}
          onChange={(value) => update({ category: value as FAQ["category"] })}
          disabled={isReadonly}
          options={FAQ_CATEGORIES.map((cat) => ({
            value: cat,
            label:
              cat === "orders_payment"
                ? t("categoryOrdersPayment")
                : cat === "shipping_delivery"
                  ? t("categoryShippingDelivery")
                  : cat === "returns_refunds"
                    ? t("categoryReturnsRefunds")
                    : cat === "product_information"
                      ? t("categoryProductInfo")
                      : cat === "account_security"
                        ? t("categoryAccountSecurity")
                        : cat === "technical_support"
                          ? t("categoryTechSupport")
                          : t("categoryGeneral"),
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
      </FormGroup>

      <TagInput
        label={t("tags")}
        value={faq.tags ?? []}
        onChange={(tags) => update({ tags })}
        disabled={isReadonly}
        placeholder={t("tagsPlaceholder")}
      />

      <FormGroup columns={2}>
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
            checked={faq.showOnHomepage || false}
            onChange={(e) => update({ showOnHomepage: e.target.checked })}
            disabled={isReadonly}
          />
        </div>

        <div className={`${flex.rowCenter} mt-6`}>
          <Checkbox
            label={t("filterStatusLabel")}
            checked={faq.isActive ?? true}
            onChange={(e) => update({ isActive: e.target.checked })}
            disabled={isReadonly}
          />
        </div>
      </FormGroup>
    </div>
  );
}

