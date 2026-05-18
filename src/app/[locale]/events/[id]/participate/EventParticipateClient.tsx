"use client";

import { useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { Button, Div, Heading, Input, RichText, Select, Span, Text, Textarea } from "@mohasinac/appkit/ui";
import { Label } from "@mohasinac/appkit/client";
import { EventParticipateView, useSession, useToast, ROUTES } from "@mohasinac/appkit/client";
import { SpinWheelView } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants";

type SpinPrize = { id: string; label: string; weight: number; isActive: boolean; couponId?: string };

// Shared className for the two info-row tiles rendered in the post-submit
// confirmation panel (leaderboard link + event-home link).
const CLS_PARTICIPATE_INFO_ROW = "rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 flex items-center justify-between gap-3";

type FormFieldType = "text" | "textarea" | "email" | "phone" | "number" | "select" | "multiselect" | "checkbox" | "radio" | "date" | "rating" | "file";

interface SurveyFormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: { minLength?: number; maxLength?: number; min?: number; max?: number; pattern?: string };
  order: number;
}

export interface ParticipateEventInput {
  id: string;
  title: string;
  description?: string;
  endsAt?: string | number | Date | null;
  type?: string;
  pollConfig?: {
    options: { id: string; label: string }[];
    allowMultiSelect: boolean;
    allowComment: boolean;
    requireLogin?: boolean;
  };
  surveyConfig?: {
    requireLogin: boolean;
    maxEntriesPerUser: number;
    hasLeaderboard: boolean;
    hasPointSystem: boolean;
    pointsLabel?: string;
    entryReviewRequired: boolean;
    formFields: SurveyFormField[];
  };
  feedbackConfig?: {
    anonymous: boolean;
    formFields: SurveyFormField[];
  };
  spinPrizes?: SpinPrize[];
  spinWindowStart?: string | null;
  spinWindowEnd?: string | null;
}

interface Props {
  event: ParticipateEventInput;
  hasLeaderboard?: boolean;
  /** When true, the event title/description block at the top is suppressed (the parent already renders it). */
  embedded?: boolean;
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderLoginRequired() {
  return (
    <Div className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-10 text-center space-y-3">
      <Heading level={2} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Login Required
      </Heading>
      <Text className="text-zinc-500 dark:text-zinc-400">
        Please log in to participate in this leaderboard event.
      </Text>
      <Link
        href={String(ROUTES.AUTH.LOGIN)}
        className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Log In
      </Link>
    </Div>
  );
}

function renderEventInfoBlock(event: ParticipateEventInput) {
  return (
    <Div className="space-y-1">
      <Heading level={2} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Participate in {event.title}
      </Heading>
      {event.description ? (
        <Div className="text-zinc-600 dark:text-zinc-400">
          <RichText html={event.description} />
        </Div>
      ) : null}
      {event.endsAt ? (
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Ends:{" "}
          {new Date(event.endsAt).toLocaleDateString("en-IN", {
            dateStyle: "medium",
          })}
        </Text>
      ) : null}
    </Div>
  );
}

function renderPollForm({
  pollConfig,
  isMultiSelect,
  selectedVotes,
  pollComment,
  toggleVote,
  setPollComment,
}: {
  pollConfig: NonNullable<ParticipateEventInput["pollConfig"]>;
  isMultiSelect: boolean;
  selectedVotes: string[];
  pollComment: string;
  toggleVote: (id: string) => void;
  setPollComment: (v: string) => void;
}) {
  return (
    <Div className="space-y-3">
      <Text className="font-medium text-zinc-800 dark:text-zinc-200">
        {isMultiSelect ? "Select all that apply:" : "Choose one:"}
      </Text>
      <Div className="space-y-2">
        {pollConfig.options.map((opt) => (
          <Label
            key={opt.id}
            className="flex items-center gap-3 cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {isMultiSelect ? (
              <input
                type="checkbox"
                name="poll-option"
                value={opt.id}
                checked={selectedVotes.includes(opt.id)}
                onChange={() => toggleVote(opt.id)}
                className="accent-primary"
              />
            ) : (
              <input
                type="radio"
                name="poll-option"
                value={opt.id}
                checked={selectedVotes.includes(opt.id)}
                onChange={() => toggleVote(opt.id)}
                className="accent-primary"
              />
            )}
            <Text className="text-zinc-700 dark:text-zinc-300">{opt.label}</Text>
          </Label>
        ))}
      </Div>
      {pollConfig.allowComment ? (
        <Textarea
          value={pollComment}
          onChange={(e) => setPollComment(e.target.value)}
          placeholder="Add a comment (optional)"
          rows={3}
        />
      ) : null}
    </Div>
  );
}

function renderSubmitAction({
  error,
  pollConfig,
  isMultiSelect,
  selectedVotes,
  canSubmit,
  isLoading,
  handleSubmit,
}: {
  error: string | null;
  pollConfig: ParticipateEventInput["pollConfig"];
  isMultiSelect: boolean;
  selectedVotes: string[];
  canSubmit: boolean;
  isLoading: boolean;
  handleSubmit: () => void;
}) {
  return (
    <Div className="space-y-2">
      {error ? (
        <Text className="text-red-500 dark:text-red-400 text-sm">{error}</Text>
      ) : null}
      {pollConfig?.options?.length && !isMultiSelect && selectedVotes.length === 0 ? (
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Please select an option above.
        </Text>
      ) : null}
      <Button
        type="button"
        variant="primary"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="w-full"
      >
        {isLoading ? "Submitting…" : "Submit Participation"}
      </Button>
    </Div>
  );
}

function renderSuccessState({
  eventId,
  eventTitle,
  hasLeaderboard,
}: {
  eventId: string;
  eventTitle: string;
  hasLeaderboard: boolean;
}) {
  return (
    <Div className="space-y-4 py-6">
      <Div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-5 space-y-2">
        <Div className="flex items-center gap-2">
          <Span className="inline-flex items-center rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
            Confirmed
          </Span>
          <Heading level={2} className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
            You&apos;re in!
          </Heading>
        </Div>
        <Text className="text-sm text-emerald-800 dark:text-emerald-200">
          Your entry for <strong>{eventTitle}</strong> has been recorded. We&apos;ll notify you of any updates here and over email.
        </Text>
      </Div>
      {hasLeaderboard && (
        <Div className={CLS_PARTICIPATE_INFO_ROW}>
          <Div>
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Track your standing
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              See where you rank against other participants.
            </Text>
          </Div>
          <Link
            href={String(ROUTES.PUBLIC.EVENT_LEADERBOARD?.(eventId) ?? ROUTES.PUBLIC.EVENT_DETAIL(eventId))}
            className="text-sm font-semibold text-primary hover:underline shrink-0"
          >
            View leaderboard →
          </Link>
        </Div>
      )}
      <Div className={CLS_PARTICIPATE_INFO_ROW}>
        <Text className="text-sm text-zinc-700 dark:text-zinc-300">
          Want to revisit event details, prize info or chat with other entrants?
        </Text>
        <Link
          href={String(ROUTES.PUBLIC.EVENT_DETAIL(eventId))}
          className="text-sm font-semibold text-primary hover:underline shrink-0"
        >
          Event home →
        </Link>
      </Div>
    </Div>
  );
}

// ─── Dynamic form field renderer ─────────────────────────────────────────────

function validateField(field: SurveyFormField, value: unknown): string | null {
  const v = field.validation;
  if (field.required && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) {
    return `${field.label || "This field"} is required.`;
  }
  if (typeof value === "string") {
    if (v?.minLength && value.length < v.minLength) return `Minimum ${v.minLength} characters required.`;
    if (v?.maxLength && value.length > v.maxLength) return `Maximum ${v.maxLength} characters allowed.`;
    if (v?.pattern) {
      try {
        if (!new RegExp(v.pattern).test(value)) return `Value does not match the required format.`;
      } catch { /* invalid pattern — skip */ }
    }
  }
  if (typeof value === "number" || (typeof value === "string" && field.type === "number")) {
    const num = Number(value);
    if (!isNaN(num)) {
      if (v?.min !== undefined && num < v.min) return `Minimum value is ${v.min}.`;
      if (v?.max !== undefined && num > v.max) return `Maximum value is ${v.max}.`;
    }
  }
  return null;
}

function renderDynamicField(
  field: SurveyFormField,
  value: unknown,
  onChange: (v: unknown) => void,
  error: string | null,
) {
  let control: React.ReactNode;

  if (field.type === "textarea") {
    control = (
      <Textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
      />
    );
  } else if (field.type === "select") {
    const selectOptions = [
      { label: "— Select —", value: "" },
      ...(field.options ?? []).map((opt) => ({ label: opt, value: opt })),
    ];
    control = (
      <Select
        value={String(value ?? "")}
        options={selectOptions}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else if (field.type === "multiselect" || field.type === "checkbox") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    control = (
      <div className="space-y-1">
        {(field.options ?? []).map((opt) => (
          <Label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() =>
                onChange(
                  selected.includes(opt)
                    ? selected.filter((s) => s !== opt)
                    : [...selected, opt],
                )
              }
              className="accent-primary"
            />
            <Text className="text-sm text-zinc-700 dark:text-zinc-300">{opt}</Text>
          </Label>
        ))}
      </div>
    );
  } else if (field.type === "radio") {
    control = (
      <div className="space-y-1">
        {(field.options ?? []).map((opt) => (
          <Label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field.id}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="accent-primary"
            />
            <Text className="text-sm text-zinc-700 dark:text-zinc-300">{opt}</Text>
          </Label>
        ))}
      </div>
    );
  } else if (field.type === "rating") {
    const rating = Number(value ?? 0);
    control = (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(star)}
            className={star <= rating ? "text-yellow-400 border-yellow-400" : ""}
            aria-label={`${star} star`}
          >
            ★
          </Button>
        ))}
      </div>
    );
  } else {
    const inputType =
      field.type === "email" ? "email"
      : field.type === "phone" ? "tel"
      : field.type === "number" ? "number"
      : field.type === "date" ? "date"
      : field.type === "file" ? "file"
      : "text";
    control = (
      <Input
        type={inputType}
        value={field.type === "file" ? undefined : String(value ?? "")}
        onChange={(e) =>
          onChange(field.type === "file" ? (e.target as HTMLInputElement).files?.[0]?.name ?? "" : e.target.value)
        }
        placeholder={field.placeholder}
        required={field.required}
        min={field.validation?.min}
        max={field.validation?.max}
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
        pattern={field.validation?.pattern}
      />
    );
  }

  return (
    <Div key={field.id} className="space-y-1">
      <Label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {field.label}
        {field.required && <Text as="span" className="text-red-500 ml-1">*</Text>}
      </Label>
      {control}
      {error && <Text className="text-xs text-red-500 dark:text-red-400">{error}</Text>}
    </Div>
  );
}

// ─── Spin-wheel handler ───────────────────────────────────────────────────────

function SpinWheelParticipate({ event }: { event: ParticipateEventInput }) {
  const onSpin = useCallback(async (eventId: string) => {
    const res = await fetch(`/api/events/${eventId}/spin`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({})) as {
      data?: { spinPrizeId?: string; spinPrizeTitle?: string; spinPrizeCouponCode?: string };
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Spin failed");
    return data.data ?? {};
  }, []);

  return (
    <SpinWheelView
      eventId={event.id}
      prizes={event.spinPrizes ?? []}
      windowStart={event.spinWindowStart ?? null}
      windowEnd={event.spinWindowEnd ?? null}
      onSpin={onSpin}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EventParticipateClient({ event, hasLeaderboard, embedded = false }: Props) {
  const { user } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [pollComment, setPollComment] = useState("");
  const [formResponses, setFormResponses] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isSurvey = event.type === "survey";
  const isFeedback = event.type === "feedback";
  const formFields = isSurvey
    ? (event.surveyConfig?.formFields ?? [])
    : isFeedback
      ? (event.feedbackConfig?.formFields ?? [])
      : [];
  const maxEntries = event.surveyConfig?.maxEntriesPerUser ?? 1;
  const atEntryLimit = submissionCount >= maxEntries;

  const requireLogin =
    (isSurvey && event.surveyConfig?.requireLogin !== false) ||
    (isFeedback && false) ||
    hasLeaderboard;

  if (requireLogin && !user) return renderLoginRequired();

  // Spin-wheel events get their own dedicated UI (not the generic form)
  if (event.type === "spin_wheel") {
    return (
      <>
        {!embedded && renderEventInfoBlock(event)}
        <SpinWheelParticipate event={event} />
      </>
    );
  }

  const setFieldValue = (fieldId: string, value: unknown) => {
    setFormResponses((prev) => ({ ...prev, [fieldId]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of formFields) {
      const err = validateField(field, formResponses[field.id]);
      if (err) errors[field.id] = err;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if ((isSurvey || isFeedback) && formFields.length > 0 && !validateAllFields()) return;

    setIsLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (event.type === "poll" && selectedVotes.length > 0) {
        body.pollVotes = selectedVotes;
        if (pollComment) body.pollComment = pollComment;
      }
      if ((isSurvey || isFeedback) && Object.keys(formResponses).length > 0) {
        body.formResponses = formResponses;
      }
      const res = await fetch(API_ROUTES.EVENTS.ENTRIES(event.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as Record<string, string>).error ?? "Failed to submit entry");
      }
      setIsSubmitted(true);
      setSubmissionCount((c) => c + 1);
      setFormResponses({});
      setFormErrors({});
      showToast("Your entry has been submitted!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const pollConfig = event.pollConfig;
  const isMultiSelect = pollConfig?.allowMultiSelect ?? false;

  const toggleVote = (optionId: string) => {
    if (isMultiSelect) {
      setSelectedVotes((prev) =>
        prev.includes(optionId) ? prev.filter((v) => v !== optionId) : [...prev, optionId],
      );
    } else {
      setSelectedVotes([optionId]);
    }
  };

  const canSubmit =
    !isLoading &&
    !atEntryLimit &&
    !(pollConfig?.options?.length && !isMultiSelect && selectedVotes.length === 0);

  const dynamicForm =
    (isSurvey || isFeedback) && formFields.length > 0 ? (
      <div className="space-y-4">
        {formFields
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((field) =>
            renderDynamicField(
              field,
              formResponses[field.id],
              (v) => setFieldValue(field.id, v),
              formErrors[field.id] ?? null,
            ),
          )}
      </div>
    ) : null;

  // After a successful submission allow re-submit if maxEntries > 1
  if (isSubmitted && !atEntryLimit) {
    return (
      <div className="space-y-4">
        <Div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-5 space-y-2">
          <Div className="flex items-center gap-2">
            <Span className="inline-flex items-center rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
              Confirmed
            </Span>
            <Heading level={2} className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Entry submitted
            </Heading>
          </Div>
          <Text className="text-sm text-emerald-800 dark:text-emerald-200">
            {submissionCount} of {maxEntries} {maxEntries === 1 ? "entry" : "entries"} recorded for <strong>{event.title}</strong>.
          </Text>
        </Div>
        <Button variant="primary" className="w-full" onClick={() => setIsSubmitted(false)}>
          Submit another entry
        </Button>
        {hasLeaderboard && (
          <Div className={CLS_PARTICIPATE_INFO_ROW}>
            <Text className="text-sm text-zinc-700 dark:text-zinc-300">
              See where you rank against other participants.
            </Text>
            <Link
              href={String(ROUTES.PUBLIC.EVENT_LEADERBOARD?.(event.id) ?? ROUTES.PUBLIC.EVENT_DETAIL(event.id))}
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              View leaderboard →
            </Link>
          </Div>
        )}
      </div>
    );
  }

  return (
    <EventParticipateView
      isLoading={isLoading}
      isSubmitted={isSubmitted && atEntryLimit}
      renderEventInfo={embedded ? undefined : () => renderEventInfoBlock(event)}
      renderForm={
        pollConfig?.options?.length
          ? () => renderPollForm({ pollConfig, isMultiSelect, selectedVotes, pollComment, toggleVote, setPollComment })
          : dynamicForm
            ? () => dynamicForm
            : undefined
      }
      renderAction={() =>
        atEntryLimit && !isSubmitted ? (
          <div className="text-center py-4">
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">
              You have reached the maximum of {maxEntries} {maxEntries === 1 ? "entry" : "entries"} for this event.
            </Text>
          </div>
        ) : (
          renderSubmitAction({ error, pollConfig, isMultiSelect, selectedVotes, canSubmit, isLoading, handleSubmit })
        )
      }
      renderSuccess={() =>
        renderSuccessState({
          eventId: event.id,
          eventTitle: event.title,
          hasLeaderboard: Boolean(hasLeaderboard),
        })
      }
    />
  );
}
