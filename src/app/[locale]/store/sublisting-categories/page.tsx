"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Div,
  Heading,
  Input,
  Row,
  Select,
  Text,
} from "@mohasinac/appkit/client";
import { ROUTES } from "@mohasinac/appkit/client";
import { useUrlTable } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants/api";

interface CategoryRow {
  id: string;
  name: string;
  itemCode?: string;
  description?: string;
  productCount?: number;
}

const PAGE_SIZE = 25;

const SORT_OPTIONS = [
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt", label: "Oldest" },
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, sort]);

  useEffect(load, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(`Delete "${name}"? All linked listings will be unlinked. This cannot be undone.`)
    )
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Div className="mx-auto max-w-4xl px-4 py-6">
      <Row justify="between" align="start" className="mb-6" gap="md">
        <Div>
          <Heading level={1} className="text-2xl font-bold">
            Sub-listing Categories
          </Heading>
          <Text variant="secondary" className="mt-1 text-sm">
            Group your listings of the same collectible across conditions, grades, or prices.
            Buyers browsing one listing will see all others in the group.
          </Text>
        </Div>
        <Button variant="primary" size="sm" asChild>
          <Link href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW)}>+ New Category</Link>
        </Button>
      </Row>

      <Row gap="sm" className="mb-4" align="center">
        <Div className="flex-1">
          <Input
            placeholder="Search by name or item code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sub-listing categories"
          />
        </Div>
        <Select
          value={sort}
          onChange={(e) => table.set("sort", e.target.value)}
          aria-label="Sort categories"
          options={SORT_OPTIONS}
        />
      </Row>

      {loading ? (
        <Div className="flex items-center justify-center py-16">
          <Text variant="secondary" className="text-sm">
            Loading…
          </Text>
        </Div>
      ) : filtered.length === 0 ? (
        <Div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--appkit-color-border)] py-16 text-center">
          <Text className="text-3xl mb-2">🏷️</Text>
          <Text className="text-sm font-semibold">
            {search ? "No categories match your search" : "No sub-listing categories yet"}
          </Text>
          <Text variant="secondary" className="mt-1 text-xs">
            {search
              ? "Try a different keyword"
              : "Create your first category to group listings of the same item."}
          </Text>
          {!search && (
            <Button variant="primary" size="sm" className="mt-4" asChild>
              <Link href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW)}>Create Category</Link>
            </Button>
          )}
        </Div>
      ) : (
        <Div className="divide-y divide-[var(--appkit-color-border)] rounded-xl border border-[var(--appkit-color-border)] overflow-hidden">
          {filtered.map((cat) => (
            <Row
              key={cat.id}
              align="center"
              gap="md"
              className="bg-[var(--appkit-color-surface)] px-4 py-3 hover:bg-[var(--appkit-color-surface-raised)] transition-colors"
            >
              <Div className="flex-1 min-w-0">
                <Row gap="xs" align="center" className="flex-wrap">
                  <Text className="text-sm font-medium truncate">{cat.name}</Text>
                  {cat.itemCode && (
                    <Badge variant="secondary" className="text-[10px]">
                      {cat.itemCode}
                    </Badge>
                  )}
                  {typeof cat.productCount === "number" && (
                    <Badge variant="primary" className="text-[10px]">
                      {cat.productCount} listing{cat.productCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </Row>
                {cat.description && (
                  <Text variant="secondary" className="mt-0.5 text-xs truncate">
                    {cat.description}
                  </Text>
                )}
              </Div>

              <Row gap="xs" align="center" className="shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={String(ROUTES.PUBLIC.SUBLISTING_CATEGORY(cat.id))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_EDIT(cat.id))}>
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deletingId === cat.id}
                  onClick={() => handleDelete(cat.id, cat.name)}
                >
                  Delete
                </Button>
              </Row>
            </Row>
          ))}
        </Div>
      )}

      <Row justify="between" align="center" className="mt-3">
        <Text variant="secondary" className="text-xs">
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
            <Text variant="secondary" className="text-xs px-1">
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