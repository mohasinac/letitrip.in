/**
 * SellerAuctionsView
 *
 * Feature view for the seller's auction listings.
 * Calls /api/seller/products with filters=isAuction==true so results are
 * automatically scoped to the authenticated seller.
 */

"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ActiveFilterChips,
  Spinner,
  DataTable,
  FilterFacetSection,
  ListingLayout,
  Search,
  SortDropdown,
  TablePagination,
  getFilterLabel,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { Gavel } from "lucide-react";
import { useAuth, useUrlTable, useMessage } from "@/hooks";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useSellerAuctions } from "../hooks/useSellerAuctions";
import { SellerProductCard } from "./SellerProductCard";
import type { AdminProduct } from "@/components";

const { spacing, flex } = THEME_CONSTANTS;

function SellerAuctionsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("sellerAuctions");
  const { showError } = useMessage();

  const table = useUrlTable({
    defaults: { pageSize: "24", sorts: "-createdAt" },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const q = table.get("q");
  const statusFilter = table.get("status");
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 24);
  const sorts = table.get("sorts") || "-createdAt";

  const sortOptions = useMemo(
    () => [
      { value: "-createdAt", label: t("sortNewest") },
      { value: "createdAt", label: t("sortOldest") },
      { value: "auctionEndDate", label: t("sortEndingSoon") },
      { value: "-auctionEndDate", label: t("sortEndingLatest") },
      { value: "price", label: t("sortPriceLow") },
      { value: "-price", label: t("sortPriceHigh") },
    ],
    [t],
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    if (!statusFilter) return [];
    const opts = [
      { value: "draft", label: t("filterStatusDraft") },
      { value: "published", label: t("filterStatusActive") },
      { value: "ended", label: t("filterStatusEnded") },
      { value: "cancelled", label: t("filterStatusCancelled") },
    ];
    const label = getFilterLabel(opts, statusFilter) ?? statusFilter;
    return [{ key: "status", label: t("filterStatusLabel"), value: label }];
  }, [statusFilter, t]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stagedStatus, setStagedStatus] = useState<string[]>(
    statusFilter ? [statusFilter] : [],
  );
  useEffect(() => {
    setStagedStatus(statusFilter ? [statusFilter] : []);
  }, [statusFilter]);

  const filtersArr = ["isAuction==true"];
  if (q) filtersArr.push(`title@=*${q}`);
  if (statusFilter) filtersArr.push(`status==${statusFilter}`);
  const params = new URLSearchParams({
    filters: filtersArr.join(","),
    sorts,
    page: String(page),
    pageSize: String(pageSize),
  }).toString();

  const { items, total, isLoading } = useSellerAuctions(
    params,
    !authLoading && !!user,
  );

  const columns = [
    { key: "title" as const, header: t("colTitle"), sortable: true },
    { key: "status" as const, header: t("colStatus") },
    { key: "auctionEndDate" as const, header: t("colEnds") },
    { key: "price" as const, header: t("colStartingBid"), sortable: true },
  ];

  return (
    <div className={spacing.stack}>
      <ListingLayout
        searchSlot={
          <Search
            value={q}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
          />
        }
        filterContent={
          <FilterFacetSection
            title={t("filterStatusLabel")}
            options={[
              { value: "draft", label: t("filterStatusDraft") },
              { value: "published", label: t("filterStatusActive") },
              { value: "ended", label: t("filterStatusEnded") },
              { value: "cancelled", label: t("filterStatusCancelled") },
            ]}
            selected={stagedStatus}
            onChange={setStagedStatus}
          />
        }
        filterActiveCount={statusFilter ? 1 : 0}
        onFilterApply={() => table.setMany({ status: stagedStatus[0] ?? "" })}
        onFilterClear={() => {
          setStagedStatus([]);
          table.setMany({ status: "", q: "" });
        }}
        sortSlot={
          <SortDropdown
            value={sorts}
            onChange={table.setSort}
            options={sortOptions}
          />
        }
        activeFiltersSlot={
          activeFilters.length > 0 ? (
            <ActiveFilterChips
              filters={activeFilters}
              onRemove={(key) => table.set(key, "")}
              onClearAll={() => {
                setStagedStatus([]);
                table.setMany({ status: "" });
              }}
            />
          ) : undefined
        }
        paginationSlot={
          total > 0 ? (
            <TablePagination
              total={total}
              currentPage={page}
              totalPages={Math.ceil(total / pageSize)}
              pageSize={pageSize}
              onPageChange={(p) => table.setPage(p)}
              onPageSizeChange={(n) => table.set("pageSize", String(n))}
            />
          ) : undefined
        }
      >
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(item) => item.id}
          loading={isLoading || authLoading}
          emptyIcon={<Gavel className="w-16 h-16" />}
          emptyTitle={t("noAuctions")}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showViewToggle
          viewMode={(table.get("view") || "grid") as "table" | "grid" | "list"}
          onViewModeChange={(m) => table.set("view", m)}
          mobileCardRender={(item) => (
            <SellerProductCard
              product={item as any}
              onEdit={(p) =>
                router.push(`${ROUTES.SELLER.PRODUCTS}/${p.id}/edit`)
              }
              onDelete={() => {}}
            />
          )}
        />
      </ListingLayout>
    </div>
  );
}

export function SellerAuctionsView() {
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} py-20`}>
          <Spinner size="lg" />
        </div>
      }
    >
      <SellerAuctionsContent />
    </Suspense>
  );
}
