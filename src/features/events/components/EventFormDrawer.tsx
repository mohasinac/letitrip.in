"use client";

import { useState, useEffect } from "react";
import {
  SideDrawer,
  Button,
  FormField,
  Alert,
  FormGroup,
  Input,
  Label,
  Select,
  TagInput,
  Text,
} from "@/components";
import { SUCCESS_MESSAGES, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { resolveDate } from "@/utils";

const { themed } = THEME_CONSTANTS;
import { useTranslations } from "next-intl";
import { useMessage } from "@/hooks";
import { useCreateEvent, useUpdateEvent } from "../hooks/useEventMutations";
import { EVENT_TYPE_VALUES } from "../constants/EVENT_TYPE_OPTIONS";
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
  tags: string[];
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
    tags: [],
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
  const toIso = (ts: unknown): string => {
    const d = resolveDate(ts);
    return d ? d.toISOString().slice(0, 16) : "";
  };
  return {
    title: e.title ?? "",
    description: e.description ?? "",
    type: e.type,
    startsAt: toIso(e.startsAt),
    endsAt: toIso(e.endsAt),
    isActive: e.status === "active",
    tags: e.tags ?? [],
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
  const tEventTypes = useTranslations("eventTypes");

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
      setFormError(t("form.titleRequired"));
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
      tags: form.tags.length > 0 ? form.tags : undefined,
      [typeConfigKey]: (form as unknown as Record<string, unknown>)[
        typeConfigKey
      ],
    };

    try {
      if (isEdit && editTarget) {
        await updateMutation.mutateAsync({
          id: editTarget.id,
          data: payload as never,
        });
      } else {
        await createMutation.mutateAsync(payload as never);
      }
    } catch {
      setFormError(
        isEdit
          ? ERROR_MESSAGES.EVENT.UPDATE_FAILED
          : ERROR_MESSAGES.EVENT.CREATE_FAILED,
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
          <Label htmlFor="event-type" className="mb-1.5">
            Event Type
          </Label>
          <Select
            id="event-type"
            value={form.type}
            onChange={(e) => set("type", e.target.value as EventType)}
            disabled={isEdit}
            options={EVENT_TYPE_VALUES.map((value) => ({
              value,
              label: tEventTypes(value),
            }))}
          />
          {isEdit && (
            <Text size="xs" variant="secondary" className="mt-1">
              Event type cannot be changed after creation.
            </Text>
          )}
        </div>

        {/* Dates */}
        <FormGroup columns={2}>
          <div>
            <Label htmlFor="event-starts-at" className="mb-1.5">
              Starts At
            </Label>
            <Input
              id="event-starts-at"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="event-ends-at" className="mb-1.5">
              Ends At
            </Label>
            <Input
              id="event-ends-at"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
            />
          </div>
        </FormGroup>

        <FormField
          label="Max Entries Per User"
          name="maxEntriesPerUser"
          type="number"
          value={form.maxEntriesPerUser}
          onChange={(v) => set("maxEntriesPerUser", v)}
          placeholder="1"
        />

        <div>
          <Label htmlFor="event-banner-url" className="mb-1.5">
            Banner Image URL
          </Label>
          <Input
            id="event-banner-url"
            type="url"
            value={form.bannerImageUrl}
            onChange={(e) => set("bannerImageUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <TagInput
          label="Tags"
          value={form.tags}
          onChange={(tags) => set("tags", tags)}
          placeholder="Add a tag…"
        />

        <div className={`border-t ${themed.border} pt-4`}>
          <Text weight="semibold" size="sm" className="mb-3 capitalize">
            {form.type} Configuration
          </Text>
          {typeConfigNode()}
        </div>
      </div>
    </SideDrawer>
  );
}
