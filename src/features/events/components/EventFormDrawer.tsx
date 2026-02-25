"use client";

import { useState, useEffect } from "react";
import { SideDrawer, Button, FormField, Alert } from "@/components";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useMessage } from "@/hooks";
import { useCreateEvent, useUpdateEvent } from "../hooks/useEventMutations";
import { EVENT_TYPE_OPTIONS } from "../constants/EVENT_TYPE_OPTIONS";
import { SaleConfigForm } from "./EventTypeConfig/SaleConfigForm";
import { OfferConfigForm } from "./EventTypeConfig/OfferConfigForm";
import { PollConfigForm } from "./EventTypeConfig/PollConfigForm";
import { SurveyConfigForm } from "./EventTypeConfig/SurveyConfigForm";
import { FeedbackConfigForm } from "./EventTypeConfig/FeedbackConfigForm";
import type {
  EventDocument,
  EventType,
  SaleConfig,
  OfferConfig,
  PollConfig,
  SurveyConfig,
  FeedbackConfig,
} from "@/db/schema";

interface EventFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTarget?: EventDocument | null;
}

interface FormState {
  title: string;
  description: string;
  type: EventType;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  maxEntriesPerUser: string;
  bannerImageUrl: string;
  badgeImageUrl: string;
  // Type-specific configs
  saleConfig: Partial<SaleConfig>;
  offerConfig: Partial<OfferConfig>;
  pollConfig: Partial<PollConfig>;
  surveyConfig: Partial<SurveyConfig>;
  feedbackConfig: Partial<FeedbackConfig>;
}

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    type: "poll",
    startsAt: "",
    endsAt: "",
    isActive: false,
    maxEntriesPerUser: "1",
    bannerImageUrl: "",
    badgeImageUrl: "",
    saleConfig: {},
    offerConfig: {},
    pollConfig: {
      options: [],
      allowMultiSelect: false,
      allowComment: false,
      resultsVisibility: "always",
    },
    surveyConfig: {
      formFields: [],
      entryReviewRequired: false,
      hasLeaderboard: false,
      requireLogin: false,
      maxEntriesPerUser: 1,
      hasPointSystem: false,
    },
    feedbackConfig: { formFields: [], anonymous: false },
  };
}

function eventToForm(e: EventDocument): FormState {
  const toIso = (ts: unknown) => {
    if (!ts) return "";
    try {
      const d =
        ts instanceof Date
          ? ts
          : new Date(
              (ts as { toDate?: () => Date }).toDate?.() ??
                (ts as string | number),
            );
      return d.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };
  return {
    title: e.title ?? "",
    description: e.description ?? "",
    type: e.type,
    startsAt: toIso(e.startsAt),
    endsAt: toIso(e.endsAt),
    isActive: e.status === "active",
    maxEntriesPerUser: String(
      (e.surveyConfig as SurveyConfig | undefined)?.maxEntriesPerUser ?? 1,
    ),
    bannerImageUrl: e.coverImageUrl ?? "",
    badgeImageUrl: "",
    saleConfig: e.saleConfig ?? {},
    offerConfig: e.offerConfig ?? {},
    pollConfig: e.pollConfig ?? {},
    surveyConfig: e.surveyConfig ?? {},
    feedbackConfig: e.feedbackConfig ?? {},
  };
}

export function EventFormDrawer({
  isOpen,
  onClose,
  onSuccess,
  editTarget,
}: EventFormDrawerProps) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("adminEvents");
  const tActions = useTranslations("actions");

  // Reset/populate form on open
  useEffect(() => {
    if (isOpen) {
      setForm(editTarget ? eventToForm(editTarget) : emptyForm());
      setFormError(null);
    }
  }, [isOpen, editTarget]);

  const isDirty = form.title !== "";

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const createMutation = useCreateEvent((e) => {
    showSuccess(SUCCESS_MESSAGES.EVENT.CREATED);
    onSuccess();
    onClose();
  });

  const updateMutation = useUpdateEvent((e) => {
    showSuccess(SUCCESS_MESSAGES.EVENT.UPDATED);
    onSuccess();
    onClose();
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setFormError(null);

    const typeConfigKey = `${form.type}Config`;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      status: form.isActive ? ("active" as const) : ("draft" as const),
      startsAt: form.startsAt ? new Date(form.startsAt) : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt) : undefined,
      coverImageUrl: form.bannerImageUrl || undefined,
      [typeConfigKey]: (form as unknown as Record<string, unknown>)[
        typeConfigKey
      ],
    };

    try {
      if (isEdit && editTarget) {
        await updateMutation.mutate({
          id: editTarget.id,
          data: payload as never,
        });
      } else {
        await createMutation.mutate(payload as never);
      }
    } catch {
      setFormError(
        isEdit
          ? ERROR_MESSAGES.EVENT.UPDATE_FAILED
          : ERROR_MESSAGES.EVENT.CREATE_FAILED,
      );
    }
  };

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  const typeConfigNode = () => {
    switch (form.type) {
      case "sale":
        return (
          <SaleConfigForm
            value={form.saleConfig}
            onChange={(v) => set("saleConfig", v)}
          />
        );
      case "offer":
        return (
          <OfferConfigForm
            value={form.offerConfig}
            onChange={(v) => set("offerConfig", v)}
          />
        );
      case "poll":
        return (
          <PollConfigForm
            value={form.pollConfig}
            onChange={(v) => set("pollConfig", v)}
          />
        );
      case "survey":
        return (
          <SurveyConfigForm
            value={form.surveyConfig}
            onChange={(v) => set("surveyConfig", v)}
          />
        );
      case "feedback":
        return (
          <FeedbackConfigForm
            value={form.feedbackConfig}
            onChange={(v) => set("feedbackConfig", v)}
          />
        );
    }
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t("edit") : t("newEvent")}
      mode={isEdit ? "edit" : "create"}
      isDirty={isDirty}
      footer={
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSubmit} isLoading={isSaving}>
            {isEdit ? tActions("save") : tActions("create")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {tActions("cancel")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 p-1">
        {formError && <Alert variant="error">{formError}</Alert>}

        {/* Basic info */}
        <FormField
          label="Title"
          name="title"
          type="text"
          value={form.title}
          onChange={(v) => set("title", v)}
          placeholder="Event title"
          required
        />
        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={form.description}
          onChange={(v) => set("description", v)}
          placeholder="Optional description"
          rows={2}
        />

        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Event Type</label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value as EventType)}
            disabled={isEdit}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm disabled:opacity-50"
          >
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">
              Event type cannot be changed after creation.
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Starts At</label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ends At</label>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <FormField
          label="Max Entries Per User"
          name="maxEntriesPerUser"
          type="number"
          value={form.maxEntriesPerUser}
          onChange={(v) => set("maxEntriesPerUser", v)}
          placeholder="1"
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Banner Image URL
          </label>
          <input
            type="url"
            value={form.bannerImageUrl}
            onChange={(e) => set("bannerImageUrl", e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
          />
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm font-semibold mb-3 capitalize">
            {form.type} Configuration
          </p>
          {typeConfigNode()}
        </div>
      </div>
    </SideDrawer>
  );
}
