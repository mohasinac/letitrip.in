"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants/api";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(API_ROUTES.STORE.SUBLISTING_CATEGORY_BY_ID(id))
      .then((r) => r.json())
      .then((res) => {
        const cat = (res as any)?.data?.category ?? (res as any)?.data;
        if (!cat) { setLoadError("Category not found"); return; }
        setName(String(cat.name ?? ""));
        setItemCode(String(cat.itemCode ?? ""));
        setDescription(String(cat.description ?? ""));
      })
      .catch(() => setLoadError("Failed to load category"));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(API_ROUTES.STORE.SUBLISTING_CATEGORY_BY_ID(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          itemCode: itemCode.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as any)?.error?.message ?? "Failed to save changes");
        return;
      }
      router.push(String(ROUTES.STORE.SUBLISTING_CATEGORIES));
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit Sub-listing Category
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Changes here affect all listings linked to this category.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
            Category name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary,#6366f1)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
            Item code
          </label>
          <input
            type="text"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            maxLength={40}
            placeholder="e.g. PSA 10, 108/120"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary,#6366f1)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary,#6366f1)] resize-none"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="rounded-lg bg-[var(--appkit-color-primary,#6366f1)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
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
