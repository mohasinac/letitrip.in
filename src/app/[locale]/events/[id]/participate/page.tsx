"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useAuth, useApiMutation, useMessage } from "@/hooks";
import { eventService } from "@/features/events";
import {
  ROUTES,
  UI_LABELS,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { Card, Spinner, Alert } from "@/components";
import { formatDate } from "@/utils";
import type { EventDocument, SurveyFormField } from "@/db/schema";

interface Props {
  params: Promise<{ id: string }>;
}

const { themed, spacing, typography } = THEME_CONSTANTS;

export default function EventParticipatePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: event, isLoading: eventLoading } = useApiQuery<EventDocument>({
    queryKey: ["public-event-participate", id],
    queryFn: () => eventService.getById(id),
    enabled: !authLoading,
  });

  const mutation = useApiMutation<void, Record<string, unknown>>({
    mutationFn: (data) => eventService.enter(id, data),
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.EVENT.ENTRY_SUBMITTED);
      setSubmitted(true);
    },
    onError: () => showError(ERROR_MESSAGES.EVENT.ALREADY_ENTERED),
  });

  // Auth redirect
  if (!authLoading && !user) {
    router.replace(
      `${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(ROUTES.PUBLIC.EVENT_PARTICIPATE(id))}`,
    );
    return null;
  }

  if (authLoading || eventLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!event || event.type !== "survey" || !event.surveyConfig) {
    return (
      <Alert variant="warning">
        This event does not have a participation form.
      </Alert>
    );
  }

  if (event.status !== "active") {
    return <Alert variant="info">{UI_LABELS.EVENTS.ENTRIES_CLOSED}</Alert>;
  }

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto p-8 text-center">
        <h2 className={`${typography.h3} ${themed.textPrimary} mb-2`}>
          {UI_LABELS.EVENTS.THANK_YOU_TITLE}
        </h2>
        <p className={`${themed.textSecondary}`}>
          {UI_LABELS.EVENTS.THANK_YOU_DESC}
        </p>
      </Card>
    );
  }

  const fields: SurveyFormField[] = event.surveyConfig.formFields ?? [];

  const handleSubmit = async () => {
    const missing = fields
      .filter((f) => f.required && !responses[f.id]?.trim())
      .map((f) => f.label);
    if (missing.length > 0) {
      showError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    await mutation.mutate({ formResponses: responses });
  };

  return (
    <div className={`max-w-2xl mx-auto ${spacing.stack}`}>
      <div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {event.title}
        </h1>
        {event.endsAt && (
          <p className={`text-sm mt-1 ${themed.textSecondary}`}>
            {UI_LABELS.EVENTS.ENDS_IN}:{" "}
            {formatDate(event.endsAt as unknown as string)}
          </p>
        )}
        <p className={`mt-2 ${themed.textSecondary}`}>{event.description}</p>
      </div>

      <Card className="p-6 space-y-5">
        {fields.map((field) => (
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
            ) : field.type === "select" || field.type === "radio" ? (
              <select
                value={responses[field.id] ?? ""}
                onChange={(e) =>
                  setResponses((r) => ({ ...r, [field.id]: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={
                  field.type === "rating"
                    ? "number"
                    : field.type === "date"
                      ? "date"
                      : "text"
                }
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
          className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium transition-colors"
        >
          {mutation.isLoading
            ? UI_LABELS.LOADING.DEFAULT
            : UI_LABELS.EVENTS.SUBMIT}
        </button>
      </Card>
    </div>
  );
}
