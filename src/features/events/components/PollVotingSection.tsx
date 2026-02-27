"use client";

import { useState, useCallback } from "react";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useMessage, useAuth } from "@/hooks";
import { usePollVote } from "../hooks/usePollVote";
import type { PollConfig } from "@/db/schema";

interface PollVotingSectionProps {
  eventId: string;
  pollConfig: PollConfig;
  /** IDs already voted by the current user (pre-fetched server-side) */
  existingVotes?: string[];
}

export function PollVotingSection({
  eventId,
  pollConfig,
  existingVotes = [],
}: PollVotingSectionProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const tEvents = useTranslations("events");
  const tLoading = useTranslations("loading");

  const [selected, setSelected] = useState<string[]>(existingVotes);
  const [comment, setComment] = useState("");
  const [voted, setVoted] = useState(existingVotes.length > 0);

  const mutation = usePollVote(eventId, {
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.EVENT.VOTE_SUBMITTED);
      setVoted(true);
    },
    onError: () => {
      showError(ERROR_MESSAGES.EVENT.ALREADY_ENTERED);
    },
  });

  const handleToggle = (id: string) => {
    if (voted) return;
    if (pollConfig.allowMultiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
      );
    } else {
      setSelected([id]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    await mutation.mutate({
      pollVotes: selected,
      pollComment: pollConfig.allowComment && comment ? comment : undefined,
    });
  };

  if (voted) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          ✓ {tEvents("alreadyVoted")}
        </p>
        <div className="space-y-2">
          {pollConfig.options.map((opt) => {
            const isSelected =
              existingVotes.includes(opt.id) || selected.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="text-sm flex-1">{opt.label}</span>
                {isSelected && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Your vote
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {pollConfig.allowMultiSelect
          ? "Select all that apply"
          : "Select one option"}
      </p>

      <div className="space-y-2">
        {pollConfig.options.map((opt) => {
          const isChecked = selected.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                isChecked
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type={pollConfig.allowMultiSelect ? "checkbox" : "radio"}
                checked={isChecked}
                onChange={() => handleToggle(opt.id)}
                className="h-4 w-4"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {pollConfig.allowComment && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          rows={3}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0 || mutation.isLoading}
        className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
      >
        {mutation.isLoading ? tLoading("default") : tEvents("vote")}
      </button>
    </div>
  );
}
