"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Input,
  Label,
  RadioGroup,
  Span,
  Text,
  Textarea,
} from "@/components";
import { SUCCESS_MESSAGES, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";

const { spacing } = THEME_CONSTANTS;
import { useTranslations } from "next-intl";
import { useMessage } from "@/hooks";
import { useFeedbackSubmit } from "../hooks/useFeedbackSubmit";
import type { FeedbackConfig, SurveyFormField } from "@/db/schema";

interface FeedbackEventSectionProps {
  eventId: string;
  feedbackConfig: FeedbackConfig;
}

export function FeedbackEventSection({
  eventId,
  feedbackConfig,
}: FeedbackEventSectionProps) {
  const { showSuccess, showError } = useMessage();
  const tEvents = useTranslations("events");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = useFeedbackSubmit(eventId, {
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.EVENT.ENTRY_SUBMITTED);
      setSubmitted(true);
    },
    onError: () => showError(ERROR_MESSAGES.GENERIC.INTERNAL_ERROR),
  });

  if (submitted) {
    return (
      <Alert variant="success">
        <Text weight="medium">{tEvents("thankYouTitle")}</Text>
        <Text size="sm">{tEvents("thankYouDesc")}</Text>
      </Alert>
    );
  }

  const handleSubmit = async () => {
    // Validate required
    const missing = feedbackConfig.formFields
      .filter((f) => f.required && !responses[f.id]?.trim())
      .map((f) => f.label);
    if (missing.length > 0) {
      showError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    await mutation.mutateAsync({ formResponses: responses });
  };

  return (
    <div className={spacing.stack}>
      {feedbackConfig.formFields.map((field: SurveyFormField) => (
        <div key={field.id}>
          <Label className="block mb-1">
            {field.label}
            {field.required && <Span className="text-red-500 ml-1">*</Span>}
          </Label>
          {field.type === "textarea" ? (
            <Textarea
              value={responses[field.id] ?? ""}
              onChange={(e) =>
                setResponses((r) => ({ ...r, [field.id]: e.target.value }))
              }
              placeholder={field.placeholder}
              rows={4}
            />
          ) : field.type === "radio" ? (
            <RadioGroup
              name={field.id}
              value={responses[field.id] ?? ""}
              options={(field.options ?? []).map((opt) => ({
                value: opt,
                label: opt,
              }))}
              onChange={(val) =>
                setResponses((r) => ({ ...r, [field.id]: val }))
              }
              orientation="horizontal"
              variant="toggle"
            />
          ) : (
            <Input
              type={field.type === "rating" ? "number" : field.type}
              value={responses[field.id] ?? ""}
              onChange={(e) =>
                setResponses((r) => ({ ...r, [field.id]: e.target.value }))
              }
              placeholder={field.placeholder}
              min={field.type === "rating" ? 1 : undefined}
              max={field.type === "rating" ? 5 : undefined}
            />
          )}
        </div>
      ))}

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={mutation.isPending}
        isLoading={mutation.isPending}
        className="w-full"
      >
        {tEvents("submit")}
      </Button>
    </div>
  );
}
