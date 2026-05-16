"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Div,
  Heading,
  Input,
  Row,
  Select,
  SideDrawer,
  Stack,
  Text,
} from "@mohasinac/appkit/client";
import { useUrlTable } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

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

const SORT_OPTIONS = [
  { value: "name-az", label: "Name A–Z" },
  { value: "name-za", label: "Name Z–A" },
];

export default function Page() {
  const table = useUrlTable({ defaults: { sort: "name-az" } });
  const [searchInput, setSearchInput] = useState(table.get("q") || "");

  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftTemplate>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const q = table.get("q");
  const sort = table.get("sort") || "name-az";
  const condition = table.get("condition");

  const load = useCallback(() => {
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
  }, []);

  useEffect(load, [load]);

  const commitSearch = useCallback(() => {
    table.set("q", searchInput.trim());
  }, [searchInput, table]);

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
    // eslint-disable-next-line no-alert
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(API_ROUTES.STORE.TEMPLATE_BY_ID(id), { method: "DELETE" });
      load();
    } catch {
      // eslint-disable-next-line no-alert
      alert("Failed to delete template.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo<TemplateRow[]>(() => {
    let result = rows;
    if (q) result = result.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
    if (condition) result = result.filter((r) => r.condition === condition);
    if (sort === "name-za") return [...result].sort((a, b) => b.name.localeCompare(a.name));
    return [...result].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, q, sort, condition]);

  return (
    <>
      <Div className="mx-auto max-w-4xl px-4 py-6">
        {renderPageHeader(openCreate)}
        {renderToolbar({ searchInput, setSearchInput, commitSearch, sort, table, condition })}
        {renderTemplateList({ loading, filtered, q, condition, openCreate, openEdit, deletingId, handleDelete })}
        <Text variant="secondary" className="mt-3 text-xs">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
          {(q || condition) && " (filtered)"}
        </Text>
      </Div>
      {renderTemplateDrawer({ drawerOpen, closeDrawer, drawerMode, draft, setDraft, savingError, saving, handleSave })}
    </>
  );
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderPageHeader(openCreate: () => void) {
  return (
    <Row justify="between" align="start" className="mb-6" gap="md">
      <Div>
        <Heading level={1} className="text-2xl font-bold">Product Templates</Heading>
        <Text variant="secondary" className="mt-1 text-sm">Save common field sets as templates to pre-fill new listings faster.</Text>
      </Div>
      <Button variant="primary" size="sm" onClick={openCreate}>+ New Template</Button>
    </Row>
  );
}

function renderToolbar({ searchInput, setSearchInput, commitSearch, sort, table, condition }: {
  searchInput: string;
  setSearchInput: (v: string) => void;
  commitSearch: () => void;
  sort: string;
  table: ReturnType<typeof useUrlTable>;
  condition: string;
}) {
  return (
    <Row gap="sm" className="mb-4" align="center">
      <Div className="flex-1">
        <Input placeholder="Search templates…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commitSearch()} aria-label="Search templates" />
      </Div>
      <Select
        value={sort}
        onValueChange={(v) => table.set("sort", v)}
        options={SORT_OPTIONS}
        aria-label="Sort templates"
        className="rounded-lg border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-2 text-sm text-[var(--appkit-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
      />
      <Select
        value={condition}
        onValueChange={(v) => table.set("condition", v)}
        options={CONDITION_OPTIONS}
        aria-label="Filter by condition"
        className="rounded-lg border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-2 text-sm text-[var(--appkit-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
      />
    </Row>
  );
}

function renderTemplateList({ loading, filtered, q, condition, openCreate, openEdit, deletingId, handleDelete }: {
  loading: boolean;
  filtered: TemplateRow[];
  q: string;
  condition: string;
  openCreate: () => void;
  openEdit: (row: TemplateRow) => void;
  deletingId: string | null;
  handleDelete: (id: string, name: string) => Promise<void>;
}) {
  if (loading) return <Div className="flex items-center justify-center py-16"><Text variant="secondary" className="text-sm">Loading…</Text></Div>;
  if (filtered.length === 0) {
    return (
      <Div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--appkit-color-border)] py-16 text-center">
        <Text className="text-3xl mb-2">📋</Text>
        <Text className="text-sm font-semibold">{q || condition ? "No templates match your filters" : "No templates yet"}</Text>
        <Text variant="secondary" className="mt-1 text-xs">{q || condition ? "Try clearing your search or filters" : "Create a template to pre-fill category, brand, condition and more when listing."}</Text>
        {!q && !condition && <Button variant="primary" size="sm" className="mt-4" onClick={openCreate}>Create Template</Button>}
      </Div>
    );
  }
  return (
    <Div className="divide-y divide-[var(--appkit-color-border-subtle)] rounded-xl border border-[var(--appkit-color-border)] overflow-hidden">
      {filtered.map((t) => (
        <Row key={t.id} align="center" gap="md" className="bg-[var(--appkit-color-surface)] px-4 py-3 hover:bg-[var(--appkit-color-border-subtle)] transition-colors">
          <Div className="flex-1 min-w-0">
            <Text className="text-sm font-medium truncate">{t.name}</Text>
            <Row gap="xs" className="mt-0.5 flex-wrap">
              {t.category && <Text variant="secondary" className="text-xs">{t.category}</Text>}
              {t.brand && <Text variant="secondary" className="text-xs">· {t.brand}</Text>}
              {t.condition && <Text variant="secondary" className="text-xs capitalize">· {t.condition.replace(/_/g, " ")}</Text>}
            </Row>
          </Div>
          <Row gap="xs" className="shrink-0">
            {/* eslint-disable-next-line lir/prefer-action-registry */}
            <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Edit</Button>
            {/* eslint-disable-next-line lir/prefer-action-registry */}
            <Button variant="danger" size="sm" isLoading={deletingId === t.id} onClick={() => handleDelete(t.id, t.name)}>Delete</Button>
          </Row>
        </Row>
      ))}
    </Div>
  );
}

function renderTemplateDrawer({ drawerOpen, closeDrawer, drawerMode, draft, setDraft, savingError, saving, handleSave }: {
  drawerOpen: boolean;
  closeDrawer: () => void;
  drawerMode: "create" | "edit";
  draft: DraftTemplate;
  setDraft: React.Dispatch<React.SetStateAction<DraftTemplate>>;
  savingError: string | null;
  saving: boolean;
  handleSave: () => Promise<void>;
}) {
  return (
    <SideDrawer
      isOpen={drawerOpen}
      onClose={closeDrawer}
      title={drawerMode === "create" ? "New Template" : "Edit Template"}
      mode={drawerMode}
      isDirty={draft.name !== "" || draft.category !== "" || draft.brand !== ""}
      footer={
        <Row gap="sm" justify="end">
          <Button variant="outline" size="sm" onClick={closeDrawer} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="sm" isLoading={saving} onClick={handleSave}>
            {drawerMode === "create" ? "Create Template" : "Save Changes"}
          </Button>
        </Row>
      }
    >
      <Stack gap="md">
        {savingError && (
          <Div className="rounded-lg border border-[var(--appkit-color-error)] bg-[var(--appkit-color-error-surface)] px-3 py-2 text-sm text-[var(--appkit-color-error-text)]">{savingError}</Div>
        )}
        <Input id="tpl-name" label="Template Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Pokémon Card Standard" required autoComplete="off" />
        <Input id="tpl-description" label="Description (optional)" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Short note about when to use this template" autoComplete="off" />
        <Input id="tpl-category" label="Category (optional)" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="e.g. trading-cards" autoComplete="off" />
        <Input id="tpl-brand" label="Brand (optional)" value={draft.brand} onChange={(e) => setDraft((d) => ({ ...d, brand: e.target.value }))} placeholder="e.g. Pokémon Company" autoComplete="off" />
        <Select
          label="Condition (optional)"
          name="tpl-condition"
          value={draft.condition}
          onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value }))}
          options={CONDITION_OPTIONS}
        />
      </Stack>
    </SideDrawer>
  );
}
