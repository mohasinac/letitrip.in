"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Div,
  Heading,
  Input,
  Row,
  SideDrawer,
  Stack,
  Text,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants/api";

interface TemplateRow {
  id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  condition?: string;
}

interface DraftTemplate {
  name: string;
  description: string;
  category: string;
  brand: string;
  condition: string;
}

const EMPTY_DRAFT: DraftTemplate = {
  name: "",
  description: "",
  category: "",
  brand: "",
  condition: "",
};

const CONDITION_OPTIONS = [
  { value: "", label: "Any condition" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "used", label: "Used" },
];

export default function Page() {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftTemplate>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(API_ROUTES.STORE.TEMPLATES)
      .then((r) => r.json())
      .then((res) => {
        const items: unknown[] = (res as any)?.data?.templates ?? [];
        setRows(
          items.map((item: any) => ({
            id: String(item.id ?? ""),
            name: String(item.name ?? ""),
            description: item.description ? String(item.description) : undefined,
            category: item.category ? String(item.category) : undefined,
            brand: item.brand ? String(item.brand) : undefined,
            condition: item.condition ? String(item.condition) : undefined,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  function openCreate() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setDrawerMode("create");
    setSavingError(null);
    setDrawerOpen(true);
  }

  function openEdit(row: TemplateRow) {
    setDraft({
      name: row.name,
      description: row.description ?? "",
      category: row.category ?? "",
      brand: row.brand ?? "",
      condition: row.condition ?? "",
    });
    setEditingId(row.id);
    setDrawerMode("edit");
    setSavingError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingId(null);
    setSavingError(null);
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setSavingError("Template name is required.");
      return;
    }
    setSaving(true);
    setSavingError(null);
    try {
      const body = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        category: draft.category.trim() || undefined,
        brand: draft.brand.trim() || undefined,
        condition: draft.condition || undefined,
      };
      const url =
        drawerMode === "edit" && editingId
          ? API_ROUTES.STORE.TEMPLATE_BY_ID(editingId)
          : API_ROUTES.STORE.TEMPLATES;
      const method = drawerMode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      closeDrawer();
      load();
    } catch {
      setSavingError("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(API_ROUTES.STORE.TEMPLATE_BY_ID(id), { method: "DELETE" });
      load();
    } catch {
      alert("Failed to delete template.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = search.trim()
    ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <>
      <Div className="mx-auto max-w-4xl px-4 py-6">
        <Row justify="between" align="start" className="mb-6" gap="md">
          <Div>
            <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Product Templates
            </Heading>
            <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Save common field sets as templates to pre-fill new listings faster.
            </Text>
          </Div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            + New Template
          </Button>
        </Row>

        <Input
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
          aria-label="Search templates"
        />

        {loading ? (
          <Div className="flex items-center justify-center py-16">
            <Text variant="secondary" className="text-sm">Loading…</Text>
          </Div>
        ) : filtered.length === 0 ? (
          <Div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 py-16 text-center">
            <Text className="text-3xl mb-2">📋</Text>
            <Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {search ? "No templates match your search" : "No templates yet"}
            </Text>
            <Text variant="secondary" className="mt-1 text-xs">
              {search
                ? "Try a different keyword"
                : "Create a template to pre-fill category, brand, condition and more when listing."}
            </Text>
            {!search && (
              <Button variant="primary" size="sm" className="mt-4" onClick={openCreate}>
                Create Template
              </Button>
            )}
          </Div>
        ) : (
          <Div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {filtered.map((t) => (
              <Row
                key={t.id}
                align="center"
                gap="md"
                className="bg-white dark:bg-zinc-900/60 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <Div className="flex-1 min-w-0">
                  <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {t.name}
                  </Text>
                  <Row gap="xs" className="mt-0.5 flex-wrap">
                    {t.category && (
                      <Text variant="secondary" className="text-xs">
                        {t.category}
                      </Text>
                    )}
                    {t.brand && (
                      <Text variant="secondary" className="text-xs">
                        · {t.brand}
                      </Text>
                    )}
                    {t.condition && (
                      <Text variant="secondary" className="text-xs capitalize">
                        · {t.condition.replace(/_/g, " ")}
                      </Text>
                    )}
                  </Row>
                </Div>
                <Row gap="xs" className="shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={deletingId === t.id}
                    onClick={() => handleDelete(t.id, t.name)}
                  >
                    Delete
                  </Button>
                </Row>
              </Row>
            ))}
          </Div>
        )}

        <Text variant="secondary" className="mt-3 text-xs">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </Text>
      </Div>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title={drawerMode === "create" ? "New Template" : "Edit Template"}
        mode={drawerMode}
        isDirty={draft.name !== "" || draft.category !== "" || draft.brand !== ""}
        footer={
          <Row gap="sm" justify="end">
            <Button variant="outline" size="sm" onClick={closeDrawer} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={saving} onClick={handleSave}>
              {drawerMode === "create" ? "Create Template" : "Save Changes"}
            </Button>
          </Row>
        }
      >
        <Stack gap="md">
          {savingError && (
            <Div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {savingError}
            </Div>
          )}

          <Input
            id="tpl-name"
            label="Template Name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="e.g. Pokémon Card Standard"
            required
            autoComplete="off"
          />

          <Input
            id="tpl-description"
            label="Description (optional)"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Short note about when to use this template"
            autoComplete="off"
          />

          <Input
            id="tpl-category"
            label="Category (optional)"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            placeholder="e.g. trading-cards"
            autoComplete="off"
          />

          <Input
            id="tpl-brand"
            label="Brand (optional)"
            value={draft.brand}
            onChange={(e) => setDraft((d) => ({ ...d, brand: e.target.value }))}
            placeholder="e.g. Pokémon Company"
            autoComplete="off"
          />

          <Div>
            <Text className="mb-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Condition (optional)
            </Text>
            <select
              value={draft.condition}
              onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value }))}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
              aria-label="Condition"
            >
              {CONDITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Div>
        </Stack>
      </SideDrawer>
    </>
  );
}
