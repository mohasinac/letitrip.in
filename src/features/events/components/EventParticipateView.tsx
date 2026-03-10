"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth, useMessage } from "@/hooks";
import { useEventEnter } from "../hooks/useEventMutations";
import { usePublicEvent } from "../hooks/usePublicEvent";
import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
import {
  Alert,
  Button,
  Card,
  FormField,
  Heading,
  Input,
  Label,
  RadioGroup,
  Span,
  Spinner,
  Text,
} from "@/components";
import { formatDate } from "@/utils";
import type { EventDocument, SurveyFormField } from "@/db/schema";

interface EventParticipateViewProps {
  id: string;
}

const { themed, spacing } = THEME_CONSTANTS;

export function EventParticipateView({ id }: EventParticipateViewProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("events");
  const tLoading = useTranslations("loading");

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { event, isLoading: eventLoading } = usePublicEvent(id, {
    enabled: !authLoading,
  });

  const mutation = useEventEnter(
    id,
    () => {
      showSuccess(SUCCESS_MESSAGES.EVENT.ENTRY_SUBMITTED);
      setSubmitted(true);
    },
    () => showError(ERROR_MESSAGES.EVENT.ALREADY_ENTERED),
  );

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
        <Heading level={2} className="mb-2">
          {t("thankYouTitle")}
        </Heading>
        <Text variant="secondary">{t("thankYouDesc")}</Text>
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
      if (field.type === "radio") {
        return (
          <div key={field.id} className="mb-4">
            <Label className="block mb-2">
              {field.label}
              {field.required && <Span className="text-red-500 ml-1">*</Span>}
            </Label>
            <RadioGroup
              name={field.id}
              value={value}
              options={(field.options ?? []).map((opt) => ({
                value: opt,
                label: opt,
              }))}
              onChange={onChange}
              orientation="horizontal"
              variant="toggle"
            />
          </div>
        );
      }
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
          <Label htmlFor={`field-${field.id}`} className="mb-1">
            {field.label}
            {field.required && <Span className="text-red-500 ml-1">*</Span>}
          </Label>
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
          <Label htmlFor={`field-${field.id}`} className="mb-1">
            {field.label}
            {field.required && <Span className="text-red-500 ml-1">*</Span>}
          </Label>
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
        <Heading level={1}>{event.title}</Heading>
        {event.endsAt && (
          <Text size="sm" variant="secondary" className="mt-1">
            {t("endsIn")}: {formatDate(event.endsAt as unknown as string)}
          </Text>
        )}
        <Text variant="secondary" className="mt-2">
          {event.description}
        </Text>
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
