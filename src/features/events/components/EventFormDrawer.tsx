"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Label, TagInput, Text } from "@mohasinac/appkit/ui";
import { EventFormDrawer as AppkitEventFormDrawer } from "@mohasinac/appkit/features/events";
import {
  MediaUploadField,
  MediaUploadList,
  type MediaField,
} from "@mohasinac/appkit/features/media";
import {
  coerceMediaField,
  coerceMediaFieldArray,
  getMediaUrl,
} from "@mohasinac/appkit/utils";
import {
  SideDrawer,
  FormField,
  Alert,
  FormGroup,
  Input,
  Select,
} from "@/components";
import { SUCCESS_MESSAGES, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { resolveDate } from "@/utils";
import { useMediaAbort, useMediaUpload } from "@/hooks";

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
  coverImage: MediaField | null;
  eventImages: MediaField[];
  winnerImages: MediaField[];
  additionalImages: MediaField[];
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
    coverImage: null,
    eventImages: [],
    winnerImages: [],
    additionalImages: [],
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
    coverImage: coerceMediaField(e.coverImage ?? e.coverImageUrl),
    eventImages: coerceMediaFieldArray(e.eventImages),
    winnerImages: coerceMediaFieldArray(e.winnerImages),
    additionalImages: coerceMediaFieldArray(e.additionalImages),
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
  const { upload } = useMediaUpload();
  const onAbort = useMediaAbort();
  const t = useTranslations("adminEvents");
  const tActions = useTranslations("actions");
  const tEventTypes = useTranslations("eventTypes");
  const eventImageIndexRef = useRef(0);
  const winnerImageIndexRef = useRef(0);
  const additionalImageIndexRef = useRef(0);

  // Reset/populate form on open
  useEffect(() => {
    if (isOpen) {
      const nextForm = editTarget ? eventToForm(editTarget) : emptyForm();
      setForm(nextForm);
      eventImageIndexRef.current = nextForm.eventImages.length;
      winnerImageIndexRef.current = nextForm.winnerImages.length;
      additionalImageIndexRef.current = nextForm.additionalImages.length;
      setFormError(null);
    }
  }, [isOpen, editTarget]);

  const isDirty = form.title !== "";

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const buildEventUpload = (
    type: "event-cover" | "event-image" | "event-winner-image" | "event-additional-image",
    indexRef?: React.MutableRefObject<number>,
  ) => {
    return async (file: File): Promise<string> => {
      const nextIndex = type === "event-cover" ? 1 : (indexRef!.current += 1);

      return upload(file, "events", true, {
        type,
        title: form.title || "event",
        index: nextIndex,
      });
    };
  };

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
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      coverImage: form.coverImage,
      coverImageUrl: getMediaUrl(form.coverImage) || undefined,
      eventImages: form.eventImages,
      winnerImages: form.winnerImages,
      additionalImages: form.additionalImages,
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
      <AppkitEventFormDrawer
        isOpen={isOpen}
        onClose={onClose}
        renderHeader={() =>
          formError ? <Alert variant="error">{formError}</Alert> : null
        }
        renderTypeSelector={() => (
          <div>
            <Label htmlFor="event-type" className="mb-1.5">
              {t("form.typeLabel")}
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
        )}
        renderBaseFields={() => (
          <div className="space-y-5 p-1">
            <FormField
              label={t("form.titleLabel")}
              name="title"
              type="text"
              value={form.title}
              onChange={(v) => set("title", v)}
              placeholder={t("form.titlePlaceholder")}
              required
            />
            <FormField
              label={t("form.descriptionLabel")}
              name="description"
              type="textarea"
              value={form.description}
              onChange={(v) => set("description", v)}
              placeholder={t("form.descriptionPlaceholder")}
              rows={2}
            />

            <FormGroup columns={2}>
              <div>
                <Label htmlFor="event-starts-at" className="mb-1.5">
                  {t("form.startsAt")}
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
                  {t("form.endsAt")}
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
          </div>
        )}
        renderMediaFields={() => (
          <div className="space-y-5 p-1">
            <MediaUploadField
              label={t("formCoverImage")}
              value={getMediaUrl(form.coverImage) || ""}
              onChange={(url) =>
                set("coverImage", url ? { url, type: "image" } : null)
              }
              onChangeField={(media) => set("coverImage", media)}
              onUpload={buildEventUpload("event-cover")}
              onAbort={onAbort}
              accept="image/*"
              maxSizeMB={10}
              helperText={t("formCoverImageHelper")}
            />

            <MediaUploadList
              label={t("formEventImages")}
              value={form.eventImages}
              onChange={(media) => set("eventImages", media)}
              onUpload={buildEventUpload("event-image", eventImageIndexRef)}
              onAbort={onAbort}
              accept="image/*"
              maxItems={10}
              maxSizeMB={10}
              helperText={t("formEventImagesHelper")}
            />

            <MediaUploadList
              label={t("formWinnerImages")}
              value={form.winnerImages}
              onChange={(media) => set("winnerImages", media)}
              onUpload={buildEventUpload(
                "event-winner-image",
                winnerImageIndexRef,
              )}
              onAbort={onAbort}
              accept="image/*"
              maxItems={5}
              maxSizeMB={10}
              helperText={t("formWinnerImagesHelper")}
            />

            <MediaUploadList
              label={t("formAdditionalImages")}
              value={form.additionalImages}
              onChange={(media) => set("additionalImages", media)}
              onUpload={buildEventUpload(
                "event-additional-image",
                additionalImageIndexRef,
              )}
              onAbort={onAbort}
              accept="image/*"
              maxItems={10}
              maxSizeMB={10}
              helperText={t("formAdditionalImagesHelper")}
            />

            <TagInput
              label="Tags"
              value={form.tags}
              onChange={(tags) => set("tags", tags)}
              placeholder="Add a tag…"
            />
          </div>
        )}
        renderTypeConfig={() => (
          <div className={`border-t ${themed.border} pt-4 px-1`}>
            <Text weight="semibold" size="sm" className="mb-3 capitalize">
              {form.type} Configuration
            </Text>
            {typeConfigNode()}
          </div>
        )}
      />
    </SideDrawer>
  );
}
