"use client";

import { useState } from "react";
import { Alert } from "@/components";
import { UI_LABELS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useMessage, useApiMutation } from "@/hooks";
import { eventService } from "../services/event.service";
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
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = useApiMutation<void, Record<string, unknown>>({
    mutationFn: (data) => eventService.enter(eventId, data),
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.EVENT.ENTRY_SUBMITTED);
      setSubmitted(true);
    },
    onError: () => showError(ERROR_MESSAGES.GENERIC.INTERNAL_ERROR),
  });

  if (submitted) {
    return (
      <Alert variant="success">
        <p className="font-medium">{UI_LABELS.EVENTS.THANK_YOU_TITLE}</p>
        <p className="text-sm">{UI_LABELS.EVENTS.THANK_YOU_DESC}</p>
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
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              value={responses[field.id] ?? ""}
              onChange={(e) =>
                setResponses((r) => ({ ...r, [field.id]: e.target.value }))
              }
              placeholder={field.placeholder}
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
            />
          ) : (
            <input
              type={field.type === "rating" ? "number" : field.type}
              value={responses[field.id] ?? ""}
              onChange={(e) =>
                setResponses((r) => ({ ...r, [field.id]: e.target.value }))
              }
              placeholder={field.placeholder}
              min={field.type === "rating" ? 1 : undefined}
              max={field.type === "rating" ? 5 : undefined}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={mutation.isLoading}
        className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
      >
        {mutation.isLoading
          ? UI_LABELS.LOADING.DEFAULT
          : UI_LABELS.EVENTS.SUBMIT}
      </button>
    </div>
  );
}
