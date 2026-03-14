/**
 * AdminStoresView
 *
 * Tier 2 — feature component.
 * Admin store approval management: approve/reject seller stores and grant/revoke listing rights.
 * Uses URL-driven Sieve pagination + DataTable.
 */

"use client";

import { useState, useCallback } from "react";
import {
  AdminPageHeader,
  Badge,
  Button,
  Caption,
  Card,
  ConfirmDeleteModal,
  DataTable,
  StatusBadge,
  TablePagination,
  Text,
  ListingLayout,
  Search,
} from "@/components";
import { THEME_CONSTANTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useMessage, usePendingTable } from "@/hooks";
import { buildSieveFilters } from "@/helpers";
import { StoreFilters } from "./StoreFilters";
import { useAdminStores } from "@/features/admin/hooks";
import type { AdminStoreItem } from "@/features/admin/hooks";
import { formatDate } from "@/utils";
import type { ReactNode } from "react";

interface Column {
  key: string;
  header: string;
  render?: (item: AdminStoreItem) => ReactNode;
  sortable?: boolean;
  width?: string;
}

const { spacing, flex } = THEME_CONSTANTS;

type StoreAction = "approve" | "reject";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
}

export function AdminStoresView() {
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("adminStores");
  const tActions = useTranslations("actions");

  const table = useUrlTable({
    defaults: { pageSize: "25", sorts: "-createdAt" },
  });

  const searchTerm = table.get("q");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["storeStatus"]);

  // Build Sieve filter string
  const activeTab = table.get("storeStatus");
  const sieveParams = table.buildSieveParams(
    buildSieveFilters(
      ["storeStatus==", activeTab],
      ["(displayName|email|storeSlug)@=*", searchTerm],
    ),
  );

  const { data, isLoading, refetch, updateStoreMutation } =
    useAdminStores(sieveParams);

  const stores = data?.items ?? [];
  const total = data?.total ?? 0;

  // ---------- action handler ----------
  const triggerAction = useCallback(
    (store: AdminStoreItem, action: StoreAction) => {
      const labels: Record<StoreAction, { title: string; message: string }> = {
        approve: {
          title: t("approveTitle"),
          message: t("approveMessage", {
            name: store.displayName ?? store.email ?? store.uid,
          }),
        },
        reject: {
          title: t("rejectTitle"),
          message: t("rejectMessage", {
            name: store.displayName ?? store.email ?? store.uid,
          }),
        },
      };

      const successKeys: Record<StoreAction, string> = {
        approve: SUCCESS_MESSAGES.ADMIN.STORE_APPROVED,
        reject: SUCCESS_MESSAGES.ADMIN.STORE_REJECTED,
      };

      setConfirmState({
        open: true,
        title: labels[action].title,
        message: labels[action].message,
        onConfirm: async () => {
          try {
            await updateStoreMutation.mutateAsync({ uid: store.uid, action });
            showSuccess(successKeys[action]);
            refetch();
          } catch {
            showError(ERROR_MESSAGES.GENERIC.TRY_AGAIN);
          }
          setConfirmState((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [t, updateStoreMutation, showSuccess, showError, refetch],
  );

  // ---------- columns ----------
  const columns: Column[] = [
    {
      key: "displayName",
      header: t("colSeller"),
      render: (row) => (
        <div className="space-y-0.5">
          <Text weight="medium" size="sm">
            {row.displayName ?? "—"}
          </Text>
          <Caption>{row.email ?? ""}</Caption>
        </div>
      ),
    },
    {
      key: "storeSlug",
      header: t("colSlug"),
      render: (row) => <Caption>{row.storeSlug ?? "—"}</Caption>,
    },
    {
      key: "storeName",
      header: t("colStoreName"),
      render: (row) => (
        <Text size="sm">{row.publicProfile?.storeName ?? "—"}</Text>
      ),
    },
    {
      key: "storeStatus",
      header: t("colStatus"),
      render: (row) => (
        <Badge
          variant={
            row.storeStatus === "approved"
              ? "approved"
              : row.storeStatus === "rejected"
                ? "rejected"
                : "pending"
          }
        >
          {row.storeStatus ?? "pending"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("colCreated"),
      render: (row) => (
        <Caption>{row.createdAt ? formatDate(row.createdAt) : "—"}</Caption>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex flex-wrap gap-1 justify-end">
          {row.storeStatus !== "approved" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAction(row, "approve")}
            >
              {t("approve")}
            </Button>
          )}
          {row.storeStatus !== "rejected" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => triggerAction(row, "reject")}
            >
              {t("reject")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={t("title")}
        subtitle={`${t("subtitle")} — ${total} ${t("total")}`}
      />

      <ListingLayout
        searchSlot={
          <Search
            value={searchTerm}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
          />
        }
        filterContent={<StoreFilters table={pendingTable} />}
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        toolbarPaginationSlot={
          <TablePagination
            total={total}
            currentPage={data?.page ?? 1}
            pageSize={data?.pageSize ?? 25}
            totalPages={data?.totalPages ?? 1}
            onPageChange={(p) => table.setPage(p)}
            compact
          />
        }
      >
        <DataTable<AdminStoreItem>
          data={stores}
          columns={columns}
          keyExtractor={(s) => s.uid}
          loading={isLoading}
          emptyMessage={t("noStores")}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          externalPagination
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(store) => (
            <Card className="p-4 space-y-2">
              <Text weight="medium" size="sm" className="line-clamp-1">
                {store.publicProfile?.storeName ?? store.displayName}
              </Text>
              <Caption className="truncate">{store.email}</Caption>
              <div className={`${flex.between}`}>
                <Caption>
                  {t("soldCount", { count: store.stats?.itemsSold ?? 0 })}
                </Caption>
                <StatusBadge status={store.storeStatus} />
              </div>
            </Card>
          )}
        />
      </ListingLayout>

      <ConfirmDeleteModal
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        confirmText={tActions("confirm")}
      />
    </div>
  );
}
