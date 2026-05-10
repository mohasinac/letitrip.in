"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants/api";

interface CategoryRow {
  id: string;
  name: string;
  itemCode?: string;
  description?: string;
  productCount?: number;
  createdBy?: string;
}

export default function Page() {
  const router = useRouter();
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API_ROUTES.STORE.SUBLISTING_CATEGORIES}?pageSize=200&sorts=name`)
      .then((r) => r.json())
      .then((res) => {
        const items: unknown[] = (res as any)?.data?.items ?? [];
        setRows(
          items.map((item: any) => ({
            id: String(item.id ?? ""),
            name: String(item.name ?? ""),
            itemCode: item.itemCode ? String(item.itemCode) : undefined,
            description: item.description ? String(item.description) : undefined,
            productCount: typeof item.productCount === "number" ? item.productCount : 0,
            createdBy: item.createdBy ? String(item.createdBy) : undefined,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? All linked listings will be unlinked. This cannot be undone.`))
      return;
    setDeletingId(id);
    try {
      await fetch(API_ROUTES.STORE.SUBLISTING_CATEGORY_BY_ID(id), { method: "DELETE" });
      load();
    } catch {
      alert("Failed to delete. You may only delete categories you created.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = search.trim()
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.itemCode ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Sub-listing Categories
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Group your listings of the same collectible across conditions, grades, or prices.
            Buyers browsing one listing will see all others in the group.
          </p>
        </div>
        <Link
          href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW)}
          className="shrink-0 rounded-lg bg-[var(--appkit-color-primary,#6366f1)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          + New Category
        </Link>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search by name or item code…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary,#6366f1)]"
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-zinc-400">Loading…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 py-16 text-center">
          <span className="text-3xl mb-2">🏷️</span>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {search ? "No categories match your search" : "No sub-listing categories yet"}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {search
              ? "Try a different keyword"
              : "Create your first category to group listings of the same item."}
          </p>
          {!search && (
            <Link
              href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW)}
              className="mt-4 rounded-lg bg-[var(--appkit-color-primary,#6366f1)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Create Category
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 bg-white dark:bg-zinc-900/60 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {cat.name}
                  </span>
                  {cat.itemCode && (
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                      {cat.itemCode}
                    </span>
                  )}
                  {typeof cat.productCount === "number" && (
                    <span className="rounded-full bg-[var(--appkit-color-primary,#6366f1)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--appkit-color-primary,#6366f1)]">
                      {cat.productCount} listing{cat.productCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {cat.description && (
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {cat.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={String(ROUTES.PUBLIC.SUBLISTING_CATEGORY(cat.id))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => router.push(String(ROUTES.STORE.SUBLISTING_CATEGORIES_EDIT(cat.id)))}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:border-[var(--appkit-color-primary,#6366f1)] hover:text-[var(--appkit-color-primary,#6366f1)] transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  className="rounded-lg border border-red-200 dark:border-red-900/40 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === cat.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
        {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
        {search && ` matching "${search}"`}
        {" · "}You can edit or delete categories you created. Contact support to modify others.
      </p>
    </div>
  );
}
