"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useApiQuery, useAuth, useApiMutation, useMessage } from "@/hooks";
import { eventService } from "@/services";
import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
import { Card, Spinner, Alert, FormField, Button, Input } from "@/components";
import { formatDate } from "@/utils";
import type { EventDocument, SurveyFormField } from "@/db/schema";

interface EventParticipateViewProps {
  id: string;
}

const { themed, spacing, typography } = THEME_CONSTANTS;

export function EventParticipateView({ id }: EventParticipateViewProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("events");
  const tLoading = useTranslations("loading");

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
    return <Alert variant="warning">{t("notSurveyEvent")}</Alert>;
  }

  if (event.status !== "active") {
    return <Alert variant="info">{t("entriesClosed")}</Alert>;
  }

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto p-8 text-center">
        <h2 className={`${typography.h3} ${themed.textPrimary} mb-2`}>
          {t("thankYouTitle")}
        </h2>
        <p className={themed.textSecondary}>{t("thankYouDesc")}</p>
      </Card>
    );
  }

  const fields: SurveyFormField[] = event.surveyConfig.formFields ?? [];

  const handleChange = (fieldId: string, value: string) =>
    setResponses((prev) => ({ ...prev, [fieldId]: value }));

  const handleSubmit = async () => {
    const missing = fields
      .filter((f) => f.required && !responses[f.id]?.trim())
      .map((f) => f.label);
    if (missing.length > 0) {
      showError(t("fillInRequired", { fields: missing.join(", ") }));
      return;
    }
    await mutation.mutate({ formResponses: responses });
  };

  const renderField = (field: SurveyFormField) => {
    const value = responses[field.id] ?? "";
    const onChange = (val: string) => handleChange(field.id, val);

    if (field.type === "textarea") {
      return (
        <FormField
          key={field.id}
          name={field.id}
          type="textarea"
          label={field.label}
          required={field.required}
          placeholder={field.placeholder}
          value={value}
          onChange={onChange}
          rows={4}
        />
      );
    }

    if (field.type === "select" || field.type === "radio") {
      const options = [
        { value: "", label: t("selectOption") },
        ...(field.options?.map((opt) => ({ value: opt, label: opt })) ?? []),
      ];
      return (
        <FormField
          key={field.id}
          name={field.id}
          type="select"
          label={field.label}
          required={field.required}
          value={value}
          onChange={onChange}
          options={options}
        />
      );
    }

    if (field.type === "rating") {
      return (
        <div key={field.id} className="mb-4">
          <label
            htmlFor={`field-${field.id}`}
            className={`block text-sm font-medium ${themed.textSecondary} mb-1`}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Input
            id={`field-${field.id}`}
            name={field.id}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            min={1}
            max={5}
          />
        </div>
      );
    }

    if (field.type === "date") {
      return (
        <div key={field.id} className="mb-4">
          <label
            htmlFor={`field-${field.id}`}
            className={`block text-sm font-medium ${themed.textSecondary} mb-1`}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Input
            id={`field-${field.id}`}
            name={field.id}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }

    // default: text
    return (
      <FormField
        key={field.id}
        name={field.id}
        type="text"
        label={field.label}
        required={field.required}
        placeholder={field.placeholder}
        value={value}
        onChange={onChange}
      />
    );
  };

  return (
    <div className={`max-w-2xl mx-auto ${spacing.stack}`}>
      <div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {event.title}
        </h1>
        {event.endsAt && (
          <p className={`text-sm mt-1 ${themed.textSecondary}`}>
            {t("endsIn")}: {formatDate(event.endsAt as unknown as string)}
          </p>
        )}
        <p className={`mt-2 ${themed.textSecondary}`}>{event.description}</p>
      </div>

      <Card className="p-6 space-y-5">
        {fields.map((field) => renderField(field))}

        <Button
          onClick={handleSubmit}
          isLoading={mutation.isLoading}
          disabled={mutation.isLoading}
          className="w-full"
        >
          {mutation.isLoading ? tLoading("default") : t("submit")}
        </Button>
      </Card>
    </div>
  );
}
