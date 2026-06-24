"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
  Badge,
  Button,
  Div,
  Heading,
  Input,
  Row,
  Select,
  Text,
  ACTIONS,
} from "@mohasinac/appkit/client";

const __O = {
  hidden: "overflow-hidden",
} as const;
import { ROUTES } from "@mohasinac/appkit/client";
import { useUrlTable } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

import { Stack } from "@mohasinac/appkit";
interface CategoryRow {
  id: string;
  name: string;
  itemCode?: string;
  description?: string;
  productCount?: number;
}

const PAGE_SIZE = 25;

const SORT_OPTIONS = [
  { value: sortBy("name", "ASC"), label: "Name A–Z" },
  { value: sortBy("name", "DESC"), label: "Name Z–A" },
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"), label: "Oldest" },
];

export default function Page() {
  const table = useUrlTable({ defaults: { sort: "name", pageSize: String(PAGE_SIZE) } });

  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sort = table.get("sort") || "name";
  const page = table.getNumber("page", 1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      sorts: sort,
    });
    fetch(`${API_ROUTES.STORE.SUBLISTING_CATEGORIES}?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        const data = (res as any)?.data;
        const items: unknown[] = data?.items ?? [];
        setTotal(typeof data?.total === "number" ? data.total : items.length);
        setRows(
          items.map((item: any) => ({
            id: String(item.id ?? ""),
            name: String(item.name ?? ""),
            itemCode: item.itemCode ? String(item.itemCode) : undefined,
            description: item.description ? String(item.description) : undefined,
            productCount: typeof item.productCount === "number" ? item.productCount : 0,
          })),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, sort]);

  useEffect(load, [load]);

  const handleDelete = async (id: string, name: string) => {
    // eslint-disable-next-line no-alert
    if (!confirm(`Delete "${name}"? All linked listings will be unlinked. This cannot be undone.`))
      return;
    setDeletingId(id);
    try {
      await fetch(API_ROUTES.STORE.SUBLISTING_CATEGORY_BY_ID(id), { method: "DELETE" });
      load();
    } catch {
      // eslint-disable-next-line no-alert
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return renderPage({ filtered, loading, search, setSearch, sort, total, totalPages, page, table, deletingId, handleDelete });
}

function renderCategoryRow(
  cat: CategoryRow,
  deletingId: string | null,
  handleDelete: (id: string, name: string) => void,
) {
  return (
    <Row
      key={cat.id}
      align="center"
      gap="md"
      className="bg-[var(--appkit-color-surface)] hover:bg-[var(--appkit-color-surface-raised)] transition-colors" padding="inline"
    >
      <Div className="flex-1 min-w-0">
        <Row gap="xs" align="center" wrap>
          <Text className="truncate" size="sm" weight="medium">{cat.name}</Text>
          {cat.itemCode && <Badge variant="secondary" className="text-[10px]">{cat.itemCode}</Badge>}
          {typeof cat.productCount === "number" && (
            <Badge variant="primary" className="text-[10px]">{cat.productCount} listing{cat.productCount !== 1 ? "s" : ""}</Badge>
          )}
        </Row>
        {cat.description && <Text variant="secondary" className="mt-0.5 truncate" size="xs">{cat.description}</Text>}
      </Div>
      <Row gap="xs" align="center" className="shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link href={String(ROUTES.PUBLIC.SUBLISTING_CATEGORY(cat.id))} target="_blank" rel="noopener noreferrer">View</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_EDIT(cat.id))}>Edit</Link>
        </Button>
        <Button size="sm" isLoading={deletingId === cat.id} onClick={() => handleDelete(cat.id, cat.name)} action={ACTIONS.STORE["delete-sublisting-category"]} />
      </Row>
    </Row>
  );
}

function renderPage({
  filtered, loading, search, setSearch, sort, total, totalPages, page, table, deletingId, handleDelete,
}: {
  filtered: CategoryRow[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  sort: string;
  total: number;
  totalPages: number;
  page: number;
  table: ReturnType<typeof useUrlTable>;
  deletingId: string | null;
  handleDelete: (id: string, name: string) => void;
}) {
  return (
    <Div className="mx-auto max-w-4xl">
      <Row justify="between" align="start" className="mb-6" gap="md">
        <Div>
          <Heading level={1} weight="bold" size="2xl">Sub-listing Categories</Heading>
          <Text variant="secondary" className="mt-1" size="sm">
            Group your listings of the same collectible across conditions, grades, or prices. Buyers browsing one listing will see all others in the group.
          </Text>
        </Div>
        <Button variant="primary" size="sm" asChild>
          <Link href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW)}>+ New Category</Link>
        </Button>
      </Row>

      <Row gap="sm" className="mb-4" align="center">
        <Div className="flex-1">
          <Input placeholder="Search by name or item code…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search sub-listing categories" />
        </Div>
        <Select value={sort} onChange={(e) => table.set("sort", e.target.value)} aria-label="Sort categories" options={SORT_OPTIONS} />
      </Row>

      {loading ? (
        <Row align="center" justify="center" padding="y-4xl">
          <Text variant="secondary" size="sm">
            Loading…
          </Text>
        </Row>
      ) : filtered.length === 0 ? (
        <Stack justify="center" className="border border-dashed border-[var(--appkit-color-border)] text-center" padding="y-4xl" align="center" rounded="2xl">
          <Text className="mb-2" size="3xl">🏷️</Text>
          <Text size="sm" weight="semibold">
            {search ? "No categories match your search" : "No sub-listing categories yet"}
          </Text>
          <Text variant="secondary" className="mt-1" size="xs">
            {search
              ? "Try a different keyword"
              : "Create your first category to group listings of the same item."}
          </Text>
          {!search && (
            <Button variant="primary" size="sm" className="mt-4" asChild>
              <Link href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW)}>Create Category</Link>
            </Button>
          )}
        </Stack>
      ) : (
        <Div className={`divide-y divide-[var(--appkit-color-border)] border border-[var(--appkit-color-border)] ${__O.hidden}`} rounded="xl">
          {filtered.map((cat) => renderCategoryRow(cat, deletingId, handleDelete))}
        </Div>
      )}

      <Row justify="between" align="center" className="mt-3">
        <Text variant="secondary" size="xs">
          {total} categor{total !== 1 ? "ies" : "y"} total
          {search && ` · ${filtered.length} matching "${search}"`}
          {" · "}You can edit or delete categories you created.
        </Text>

        {totalPages > 1 && (
          <Row gap="xs" align="center" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Text variant="secondary" className="px-1" size="xs">
              {page} / {totalPages}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </Row>
        )}
      </Row>
    </Div>
  );
}