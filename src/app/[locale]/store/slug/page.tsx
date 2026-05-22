"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Div,
  Heading,
  Input,
  Row,
  Stack,
  Text,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

type CheckState = "idle" | "checking" | "available" | "taken" | "invalid";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
const SITE_BASE = "letitrip.in/store/";

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

export default function Page() {
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(API_ROUTES.STORE.STOREFRONT)
      .then((r) => r.json())
      .then((res) => {
        const slug = (res as any)?.data?.store?.storeSlug ?? null;
        if (slug) {
          setCurrentSlug(String(slug));
          setNewSlug(String(slug));
        }
      })
      .catch(() => setLoadError(true));
  }, []);

  const runCheck = useCallback((value: string) => {
    if (!value || value === currentSlug) {
      setCheckState("idle");
      setCheckMessage(null);
      return;
    }
    if (!SLUG_RE.test(value)) {
      setCheckState("invalid");
      setCheckMessage("3–50 characters, lowercase letters, numbers and hyphens only. Must start and end with a letter or number.");
      return;
    }
    setCheckState("checking");
    setCheckMessage(null);
    fetch(API_ROUTES.STORE.SLUG_CHECK(value))
      .then((r) => r.json())
      .then((res) => {
        const available = (res as any)?.data?.available;
        const reason = (res as any)?.data?.reason;
        setCheckState(available ? "available" : "taken");
        setCheckMessage(reason ?? null);
      })
      .catch(() => {
        setCheckState("idle");
        setCheckMessage("Could not check availability. Try again.");
      });
  }, [currentSlug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = slugify(e.target.value);
    setNewSlug(raw);
    setSaveError(null);
    setSaveSuccess(false);
    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(() => runCheck(raw), 600);
  };

  const handleSave = async () => {
    if (!newSlug || checkState === "taken" || checkState === "invalid") return;
    if (newSlug === currentSlug) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(API_ROUTES.STORE.PROFILE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug: newSlug }),
      });
      const json = (await res.json()) as any;
      if (!res.ok) {
        setSaveError(json?.error?.message ?? "Failed to update slug. Please try again.");
        return;
      }
      setCurrentSlug(newSlug);
      setSaveSuccess(true);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isUnchanged = newSlug === currentSlug;
  const canSave = !isUnchanged && checkState === "available" && !saving;
  const checkColor =
    checkState === "available"
      ? "text-success"
      : checkState === "taken" || checkState === "invalid"
      ? "text-error"
      : "text-zinc-400 dark:text-zinc-400";

  return (
    <Div className="mx-auto max-w-2xl">
      <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
        Store URL / Slug
      </Heading>
      <Text variant="secondary" className="text-sm mb-6">
        Your store's public URL. Changing it will break any existing links to your store.
      </Text>

      {loadError && (
        <Div className="mb-4 rounded-lg border border-error/20 bg-error-surface px-4 py-3 text-sm text-error">
          Could not load your current store slug. Please refresh the page.
        </Div>
      )}

      <Stack gap="md" surface="card" padding="md">
        {renderCurrentUrl(currentSlug)}
        {renderSlugInput({ newSlug, checkState, checkMessage, checkColor, handleSlugChange })}
        {renderFeedbackBanners({ saveError, saveSuccess, currentSlug })}

        <Div className="rounded-lg border border-warning/20 bg-warning-surface px-3 py-2 text-xs text-warning">
          Changing your slug will update your store URL immediately. Any saved links or bookmarks to the old URL will stop working.
        </Div>

        <Row justify="end">
          {isUnchanged ? (
            <Button variant="primary" size="sm" disabled>No Changes</Button>
          ) : (
            <Button size="sm" isLoading={saving} disabled={!canSave} onClick={handleSave} action={ACTIONS.STORE["update-slug"]} />
          )}
        </Row>
      </Stack>
    </Div>
  );
}

function renderCurrentUrl(currentSlug: string | null) {
  return (
    <Div>
      <Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Current URL</Text>
      <Text className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
        {SITE_BASE}<span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentSlug ?? "—"}</span>
      </Text>
    </Div>
  );
}

function renderSlugInput({ newSlug, checkState, checkMessage, checkColor, handleSlugChange }: {
  newSlug: string;
  checkState: CheckState;
  checkMessage: string | null;
  checkColor: string;
  handleSlugChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Div>
      <Input
        id="store-slug"
        label="New Store Slug"
        value={newSlug}
        onChange={handleSlugChange}
        placeholder="e.g. pokemon-palace"
        autoComplete="off"
        spellCheck={false}
        helperText={`${SITE_BASE}${newSlug || "your-store-slug"}`}
      />
      {checkMessage && (
        <Text className={`mt-1 text-xs ${checkColor}`}>
          {checkState === "checking" ? "Checking availability…" : checkMessage}
        </Text>
      )}
      {checkState === "checking" && !checkMessage && (
        <Text className="mt-1 text-xs text-zinc-400 dark:text-zinc-400">Checking availability…</Text>
      )}
      {checkState === "available" && !checkMessage && (
        <Text className="mt-1 text-xs text-success">This slug is available.</Text>
      )}
    </Div>
  );
}

function renderFeedbackBanners({ saveError, saveSuccess, currentSlug }: {
  saveError: string | null;
  saveSuccess: boolean;
  currentSlug: string | null;
}) {
  return (
    <>
      {saveError && (
        <Div className="rounded-lg border border-error/20 bg-error-surface px-3 py-2 text-sm text-error">
          {saveError}
        </Div>
      )}
      {saveSuccess && (
        <Div className="rounded-lg border border-success/20 bg-success-surface px-3 py-2 text-sm text-success">
          Store slug updated successfully. Your new store URL is{" "}
          <span className="font-mono font-semibold">{SITE_BASE}{currentSlug}</span>.
        </Div>
      )}
    </>
  );
}
