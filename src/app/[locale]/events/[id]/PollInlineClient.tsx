"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSession, useToast, ROUTES, Div, Button, Label, Textarea, Text } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

interface PollOption {
  id: string;
  label: string;
}

interface PollConfig {
  options: PollOption[];
  allowMultiSelect: boolean;
  allowComment: boolean;
  requireLogin?: boolean;
}

interface Props {
  eventId: string;
  pollConfig: PollConfig;
  isActive: boolean;
}

export function PollInlineClient({ eventId, pollConfig, isActive }: Props) {
  const { user } = useSession();
  const { showToast } = useToast();
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresLogin = pollConfig.requireLogin === true;
  const isMultiSelect = pollConfig.allowMultiSelect;

  if (requiresLogin && !user) {
    return (
      <Div className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-8 text-center space-y-3">
        <Text className="font-semibold text-zinc-900 dark:text-zinc-100">Login required to vote</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Please log in to cast your vote in this poll.
        </Text>
        <Link
          href={String(ROUTES.AUTH.LOGIN)}
          className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Log In to Vote
        </Link>
      </Div>
    );
  }

  if (isSubmitted) {
    return (
      <Div className="rounded-xl border border-success/20 bg-success-surface px-6 py-8 text-center space-y-2">
        <Text className="text-lg font-semibold text-success">Vote recorded!</Text>
        <Text className="text-sm text-success">
          Thank you for participating. Results will be shown after the poll closes.
        </Text>
      </Div>
    );
  }

  if (!isActive) {
    return (
      <Div className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-6 text-center">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">This poll has ended.</Text>
      </Div>
    );
  }

  const toggleVote = (optionId: string) => {
    if (isMultiSelect) {
      setSelectedVotes((prev) =>
        prev.includes(optionId) ? prev.filter((v) => v !== optionId) : [...prev, optionId],
      );
    } else {
      setSelectedVotes([optionId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedVotes.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { pollVotes: selectedVotes };
      if (comment) body.pollComment = comment;
      const res = await fetch(API_ROUTES.EVENTS.ENTRIES(eventId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Failed to submit vote");
      }
      setIsSubmitted(true);
      showToast("Your vote has been recorded!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Div className="space-y-4">
      <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {isMultiSelect ? "Select all that apply:" : "Choose one:"}
      </Text>
      <Div className="space-y-2">
        {pollConfig.options.map((opt) => (
          <Label
            key={opt.id}
            className="flex items-center gap-3 cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            {isMultiSelect ? (
              // audit-raw-form-input-ok: native checkbox inside a Label wrapper — standard radio/checkbox group pattern
              <input
                type="checkbox"
                name="poll-inline"
                value={opt.id}
                checked={selectedVotes.includes(opt.id)}
                onChange={() => toggleVote(opt.id)}
                className="accent-primary h-4 w-4"
              />
            ) : (
              // audit-raw-form-input-ok: native radio inside a Label wrapper — standard radio group pattern
              <input
                type="radio"
                name="poll-inline"
                value={opt.id}
                checked={selectedVotes.includes(opt.id)}
                onChange={() => toggleVote(opt.id)}
                className="accent-primary h-4 w-4"
              />
            )}
            <Text as="span" className="text-sm text-zinc-800 dark:text-zinc-200">{opt.label}</Text>
          </Label>
        ))}
      </Div>
      {pollConfig.allowComment && (
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          rows={2}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
      {error && <Text className="text-sm text-error">{error}</Text>}
      <Button
        type="button"
        variant="primary"
        disabled={isLoading || selectedVotes.length === 0}
        onClick={handleSubmit}
        className="w-full rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60 transition-opacity"
      >
        {isLoading ? "Submitting…" : "Cast Vote"}
      </Button>
    </Div>
  );
}
