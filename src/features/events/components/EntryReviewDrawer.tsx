"use client";

import { useState } from "react";
import { SideDrawer, Button, FormField } from "@/components";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
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
      await mutation.mutate({
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
            isLoading={mutation.isLoading}
          >
            {t("flag")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleReview("approved")}
            isLoading={mutation.isLoading}
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
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-1">
          <p className="text-sm font-medium">Submitted by</p>
          <p className="text-sm">
            {entry.userDisplayName ?? entry.userId ?? "Anonymous"}
          </p>
          {entry.userEmail && (
            <p className="text-xs text-gray-500">{entry.userEmail}</p>
          )}
        </div>

        {/* Form responses */}
        {Object.keys(formResponses).length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Responses</p>
            {Object.entries(formResponses).map(([key, val]) => (
              <div
                key={key}
                className="rounded border border-gray-100 dark:border-gray-800 p-3"
              >
                <p className="text-xs text-gray-500 mb-1">{key}</p>
                <p className="text-sm">
                  {Array.isArray(val) ? val.join(", ") : String(val)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Poll votes */}
        {entry.pollVotes && entry.pollVotes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Poll Votes</p>
            <p className="text-sm">{entry.pollVotes.join(", ")}</p>
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
