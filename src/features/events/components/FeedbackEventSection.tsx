"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Input,
  Label,
  Span,
  Text,
  Textarea,
} from "@/components";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
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
    await mutation.mutate({ formResponses: responses });
  };

  return (
    <div className="space-y-4">
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
        disabled={mutation.isLoading}
        isLoading={mutation.isLoading}
        className="w-full"
      >
        {tEvents("submit")}
      </Button>
    </div>
  );
}
