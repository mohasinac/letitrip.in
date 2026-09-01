"use client";

import { Link } from "@/i18n/navigation";
import {
  sortBy,
  Badge,
  Button,
  Div,
  Row,
  Text,
  ACTIONS,
  ROUTES,
  DataListingView,
  Stack,
} from "@mohasinac/appkit/client";
import type { ListingViewConfig } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { getSublistingCategories, deleteSublistingCategory } from "@/lib/api/store-client";
import { normalizeError } from "@mohasinac/appkit/client";
import {useState, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";



const __O = {
  hidden: "overflow-hidden",
} as const;

interface CategoryRow {
  id: string;
  name: string;
  itemCode?: string;
  description?: string;
  productCount?: number;
}

interface CategoriesResponse {
  items?: unknown[];
  total?: number;
}

const SORT_OPTIONS = [
  { value: sortBy("name", "ASC"), label: "Name A–Z" },
  { value: sortBy("name", "DESC"), label: "Name Z–A" },
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"), label: "Oldest" },
];

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

function PageInner() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (id: string, name: string) => {
    // eslint-disable-next-line no-alert
    if (!confirm(`Delete "${name}"? All linked listings will be unlinked. This cannot be undone.`))
      return;
    setDeletingId(id);
    try {
      await deleteSublistingCategory(API_ROUTES.STORE.SUBLISTING_CATEGORY_BY_ID(id));
      queryClient.invalidateQueries({ queryKey: ["store", "sublisting-categories", "listing"] });
    } catch (_err) {
      void normalizeError(_err);
      // eslint-disable-next-line no-alert
      alert("Failed to delete. You may only delete categories you created.");
    } finally {
      setDeletingId(null);
    }
  };

  const config: ListingViewConfig<CategoriesResponse, CategoryRow> = {
    portal: "seller",
    title: "Sub-listing Categories",
    subtitle: "Group your listings of the same collectible across conditions, grades, or prices. Buyers browsing one listing will see all others in the group.",
    searchPlaceholder: "Search by name or item code…",
    emptyLabel: "No sub-listing categories yet",
    filterKeys: [],
    defaultSort: sortBy("name", "ASC"),
    queryKey: ["store", "sublisting-categories", "listing"],
    endpoint: API_ROUTES.STORE.SUBLISTING_CATEGORIES,
    sortOptions: SORT_OPTIONS,
    hideTableView: true,
    primaryAction: { label: "New Category", onClick: () => { window.location.href = String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW); } },
    mapRows: (response) =>
      (response.items ?? []).map((raw) => {
        const item = raw as Record<string, unknown>;
        return {
          id: String(item.id ?? ""),
          name: String(item.name ?? ""),
          itemCode: item.itemCode ? String(item.itemCode) : undefined,
          description: item.description ? String(item.description) : undefined,
          productCount: typeof item.productCount === "number" ? item.productCount : 0,
        };
      }),
    getTotal: (response, rows) => (typeof response.total === "number" ? response.total : rows.length),
    buildFilters: () => undefined,
    renderCards: (rows, _view, _selection, isLoading) => {
      if (isLoading) {
        return (
          <Stack gap="md" padding="y-xl">
            {[0, 1, 2].map((i) => <Div key={i} className="h-16 animate-pulse border border-[var(--appkit-color-border)]" rounded="xl" />)}
          </Stack>
        );
      }
      if (rows.length === 0) {
        return (
          <Stack justify="center" className="border border-dashed border-[var(--appkit-color-border)] text-center" padding="y-4xl" align="center" rounded="2xl">
            <Text className="mb-2" size="3xl">🏷️</Text>
            <Text size="sm" weight="semibold">No sub-listing categories yet</Text>
            <Text variant="secondary" className="mt-1" size="xs">
              Create your first category to group listings of the same item.
            </Text>
            <Button variant="primary" size="sm" className="mt-4" asChild>
              <Link href={String(ROUTES.STORE.SUBLISTING_CATEGORIES_NEW)}>Create Category</Link>
            </Button>
          </Stack>
        );
      }
      return (
        <Div className={`divide-y divide-[var(--appkit-color-border)] border border-[var(--appkit-color-border)] ${__O.hidden}`} rounded="xl">
          {rows.map((cat) => renderCategoryRow(cat, deletingId, handleDelete))}
        </Div>
      );
    },
  };

  return <DataListingView config={config} />;
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
