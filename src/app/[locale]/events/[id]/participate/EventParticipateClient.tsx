"use client";

import { useState } from "react";
import { Div, Heading, Text } from "@mohasinac/appkit/ui";
import { EventParticipateView } from "@mohasinac/appkit/features/events";
import { API_ROUTES } from "@/constants/api";
import type { EventDocument } from "@mohasinac/appkit";

interface Props {
  event: EventDocument;
}

export function EventParticipateClient({ event }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [pollComment, setPollComment] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (event.type === "poll" && selectedVotes.length > 0) {
        body.pollVotes = selectedVotes;
        if (pollComment) body.pollComment = pollComment;
      }
      const res = await fetch(API_ROUTES.EVENTS.ENTRIES(event.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as Record<string, string>)?.error ?? "Failed to submit entry");
      }
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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

  return (
    <EventParticipateView
      isLoading={isLoading}
      isSubmitted={isSubmitted}
      renderEventInfo={() => (
        <Div className="space-y-1">
          <Heading level={2} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Participate in {event.title}
          </Heading>
          {event.description ? (
            <Text className="text-zinc-600 dark:text-zinc-400">{event.description}</Text>
          ) : null}
          {event.endsAt ? (
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">
              Ends at: {new Date(event.endsAt).toLocaleDateString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </Text>
          ) : null}
        </Div>
      )}
      renderForm={
        pollConfig?.options?.length
          ? () => (
              <Div className="space-y-3">
                <Text className="font-medium text-zinc-800 dark:text-zinc-200">
                  {isMultiSelect ? "Select all that apply:" : "Choose one:"}
                </Text>
                {pollConfig.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <input
                      type={isMultiSelect ? "checkbox" : "radio"}
                      name="poll-option"
                      value={opt.id}
                      checked={selectedVotes.includes(opt.id)}
                      onChange={() => toggleVote(opt.id)}
                      className="accent-primary"
                    />
                    <Text className="text-zinc-700 dark:text-zinc-300">{opt.label}</Text>
                  </label>
                ))}
                {pollConfig.allowComment ? (
                  <textarea
                    value={pollComment}
                    onChange={(e) => setPollComment(e.target.value)}
                    placeholder="Add a comment (optional)"
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : null}
              </Div>
            )
          : undefined
      }
      renderAction={() => (
        <Div className="space-y-2">
          {error ? (
            <Text className="text-red-500 text-sm">{error}</Text>
          ) : null}
          {pollConfig?.options?.length && !isMultiSelect && selectedVotes.length === 0 ? (
            <Text className="text-sm text-zinc-500">Please select an option above.</Text>
          ) : null}
          <button
            type="button"
            disabled={
              isLoading ||
              (!!pollConfig?.options?.length && !isMultiSelect && selectedVotes.length === 0)
            }
            onClick={handleSubmit}
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {isLoading ? "Submitting…" : "Submit Participation"}
          </button>
        </Div>
      )}
      renderSuccess={() => (
        <Div className="text-center space-y-2 py-10">
          <Heading level={2} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            You&apos;re in!
          </Heading>
          <Text className="text-zinc-500 dark:text-zinc-400">
            Your entry has been recorded successfully.
          </Text>
        </Div>
      )}
    />
  );
}
