"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button, Div, Heading, RichText, Text, Textarea } from "@mohasinac/appkit/ui";
import { Label } from "@mohasinac/appkit/client";
import { EventParticipateView, useSession, useToast, ROUTES } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

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

function renderSuccessState() {
  return (
    <Div className="text-center space-y-2 py-10">
      <Heading level={2} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        You&apos;re in!
      </Heading>
      <Text className="text-zinc-500 dark:text-zinc-400">
        Your entry has been recorded successfully.
      </Text>
    </Div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EventParticipateClient({ event, hasLeaderboard, embedded = false }: Props) {
  const { user } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [pollComment, setPollComment] = useState("");

  if (hasLeaderboard && !user) return renderLoginRequired();

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
        throw new Error((data as Record<string, string>).error ?? "Failed to submit entry");
      }
      setIsSubmitted(true);
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
    !(pollConfig?.options?.length && !isMultiSelect && selectedVotes.length === 0);

  return (
    <EventParticipateView
      isLoading={isLoading}
      isSubmitted={isSubmitted}
      renderEventInfo={embedded ? undefined : () => renderEventInfoBlock(event)}
      renderForm={
        pollConfig?.options?.length
          ? () => renderPollForm({ pollConfig, isMultiSelect, selectedVotes, pollComment, toggleVote, setPollComment })
          : undefined
      }
      renderAction={() => renderSubmitAction({ error, pollConfig, isMultiSelect, selectedVotes, canSubmit, isLoading, handleSubmit })}
      renderSuccess={renderSuccessState}
    />
  );
}
