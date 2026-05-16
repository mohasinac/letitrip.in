"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-04: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-04) */

import React, { useState } from "react";

const CLS_LABEL = "block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1";
import { useRouter } from "next/navigation";
import { Heading, ROUTES, Text } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants/api";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(API_ROUTES.STORE.SUBLISTING_CATEGORIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          itemCode: itemCode.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as any)?.error?.message ?? "Failed to create category");
        return;
      }
      router.push(String(ROUTES.STORE.SUBLISTING_CATEGORIES));
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          New Sub-listing Category
        </Heading>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Group listings of the same real-world collectible across grades, conditions, or prices.
          Example: &ldquo;Base Set Charizard 108/120&rdquo; groups PSA 10, PSA 9, raw copies, etc.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <>
          <label className={CLS_LABEL}>
            Category name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            placeholder="e.g. Base Set Charizard 108/120"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
          />
        </>

        <>
          <label className={CLS_LABEL}>
            Item code
          </label>
          <input
            type="text"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            maxLength={40}
            placeholder="e.g. PSA 10, 108/120, WOTC, STH"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
          />
          <Text className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Grade, card number, set code, or series. Optional but helps buyers find matches.
          </Text>
        </>

        <>
          <label className={CLS_LABEL}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Brief description shown on the public category page…"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)] resize-none"
          />
        </>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="rounded-lg bg-[var(--appkit-color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create category"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
