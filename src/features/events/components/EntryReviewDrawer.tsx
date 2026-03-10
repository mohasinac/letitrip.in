"use client";

import { useState } from "react";
import { SideDrawer, Button, FormField, Text, Caption } from "@/components";
import { SUCCESS_MESSAGES, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";

const { themed } = THEME_CONSTANTS;
import { useTranslations } from "next-intl";
import { useMessage } from "@/hooks";
import { useReviewEntry } from "../hooks/useEventMutations";
import type { EventEntryDocument } from "@/db/schema";

interface EntryReviewDrawerProps {
  entry: EventEntryDocument | null;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EntryReviewDrawer({
  entry,
  eventId,
  isOpen,
  onClose,
  onSuccess,
}: EntryReviewDrawerProps) {
  const [reviewNote, setReviewNote] = useState("");
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("adminEvents");
  const tActions = useTranslations("actions");
  const mutation = useReviewEntry(() => {
    showSuccess(SUCCESS_MESSAGES.EVENT.ENTRY_APPROVED);
    onSuccess();
    onClose();
  });

  const handleReview = async (reviewStatus: "approved" | "flagged") => {
    if (!entry) return;
    try {
      await mutation.mutateAsync({
        eventId,
        entryId: entry.id,
        reviewStatus,
        reviewNote,
      });
      showSuccess(
        reviewStatus === "approved"
          ? SUCCESS_MESSAGES.EVENT.ENTRY_APPROVED
          : SUCCESS_MESSAGES.EVENT.ENTRY_FLAGGED,
      );
      setReviewNote("");
      onSuccess();
      onClose();
    } catch {
      showError(ERROR_MESSAGES.EVENT.ENTRY_REVIEW_FAILED);
    }
  };

  if (!entry) return null;

  const formResponses = entry.formResponses ?? {};

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("reviewEntry")}
      mode="edit"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => handleReview("flagged")}
            isLoading={mutation.isPending}
          >
            {t("flag")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleReview("approved")}
            isLoading={mutation.isPending}
          >
            {t("approve")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {tActions("cancel")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 p-1">
        {/* Submitter info */}
        <div className={`rounded-lg border ${themed.border} p-4 space-y-1`}>
          <Text weight="medium" size="sm">
            Submitted by
          </Text>
          <Text size="sm">
            {entry.userDisplayName ?? entry.userId ?? "Anonymous"}
          </Text>
          {entry.userEmail && <Caption>{entry.userEmail}</Caption>}
        </div>

        {/* Form responses */}
        {Object.keys(formResponses).length > 0 && (
          <div className="space-y-3">
            <Text weight="medium" size="sm">
              Responses
            </Text>
            {Object.entries(formResponses).map(([key, val]) => (
              <div
                key={key}
                className="rounded border border-zinc-100 dark:border-slate-800 p-3"
              >
                <Caption className="mb-1">{key}</Caption>
                <Text size="sm">
                  {Array.isArray(val) ? val.join(", ") : String(val)}
                </Text>
              </div>
            ))}
          </div>
        )}

        {/* Poll votes */}
        {entry.pollVotes && entry.pollVotes.length > 0 && (
          <div className="space-y-2">
            <Text weight="medium" size="sm">
              Poll Votes
            </Text>
            <Text size="sm">{entry.pollVotes.join(", ")}</Text>
          </div>
        )}

        {/* Review note */}
        <FormField
          label="Review Note (optional)"
          name="reviewNote"
          type="textarea"
          value={reviewNote}
          onChange={(v) => setReviewNote(v)}
          placeholder="Add a note for this review decision..."
          rows={3}
        />
      </div>
    </SideDrawer>
  );
}
