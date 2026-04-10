/**
 * AdminCouponsView
 *
 * Extracted from src/app/[locale]/admin/coupons/[[...action]]/page.tsx
 * Coupon management with URL-driven drawer CRUD, Sieve-powered search, and
 * pagination.
 */

"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePendingTable } from "@mohasinac/appkit/react";
import { useMessage, useUrlTable } from "@/hooks";
import { buildSieveFilters } from "@mohasinac/appkit/utils";
import { useAdminCoupons } from "@/features/admin/hooks";
import {
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";

const { flex } = THEME_CONSTANTS;
import { useTranslations } from "next-intl";
import { Caption, Text } from "@mohasinac/appkit/ui";
import {
  Badge,
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  ConfirmDeleteModal,
  ListingLayout,
  Search,
  StatusBadge,
  TablePagination,
} from "@/components";
import { CouponFilters } from "./CouponFilters";
import { formatDate } from "@/utils";
import {
  getCouponTableColumns,
  CouponForm,
  couponToFormState,
  formStateToCouponPayload,
} from ".";
import type { CouponFormState } from ".";
import type { CouponDocument } from "@/db/schema";

interface AdminCouponsViewProps {
  action?: string[];
}

type DrawerMode = "create" | "edit" | null;

export function AdminCouponsView({ action }: AdminCouponsViewProps) {
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("adminCoupons");
  const tActions = useTranslations("actions");
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const searchTerm = table.get("q");

  const typeFilter = table.get("type");
  const statusFilter = table.get("validityIsActive");

  // ── Pending filter state (staged until Apply is clicked) ─────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["type", "validityIsActive"]);

  const filters = buildSieveFilters(
    ["code@=*", searchTerm],
    ["type==", typeFilter],
    [
      "validity.isActive==",
      statusFilter === "true"
        ? "true"
        : statusFilter === "false"
          ? "false"
          : undefined,
    ],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] =
    useState<Partial<CouponDocument> | null>(null);
  const [formState, setFormState] = useState<CouponFormState | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<CouponDocument | null>(
    null,
  );

  const initialFormRef = useRef<string>("");

  const {
    data,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminCoupons(table.buildSieveParams(filters));

  const coupons = data?.coupons || [];

  const isDirty = useMemo(() => {
    if (!formState) return false;
    return JSON.stringify(formState) !== initialFormRef.current;
  }, [formState]);

  const handleCreate = useCallback(() => {
    const empty = couponToFormState();
    setSelectedCoupon({});
    setFormState(empty);
    initialFormRef.current = JSON.stringify(empty);
    setDrawerMode("create");
    setIsDrawerOpen(true);
    if (action?.[0] !== "add") {
      router.push(`${ROUTES.ADMIN.COUPONS}/add`, { scroll: false });
    }
  }, [action, router]);

  const handleEdit = useCallback(
    (coupon: CouponDocument) => {
      const initial = couponToFormState(coupon);
      setSelectedCoupon(coupon);
      setFormState(initial);
      initialFormRef.current = JSON.stringify(initial);
      setDrawerMode("edit");
      setIsDrawerOpen(true);
      if (action?.[0] !== "edit") {
        router.push(`${ROUTES.ADMIN.COUPONS}/edit/${coupon.id}`, {
          scroll: false,
        });
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedCoupon(null);
    setFormState(null);
    setDrawerMode(null);
    router.push(ROUTES.ADMIN.COUPONS, { scroll: false });
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!formState) return;
    const payload = formStateToCouponPayload(formState);

    try {
      if (drawerMode === "create") {
        await createMutation.mutateAsync(payload);
        showSuccess(SUCCESS_MESSAGES.COUPON.CREATED);
      } else if (drawerMode === "edit" && selectedCoupon?.id) {
        await updateMutation.mutateAsync({
          id: selectedCoupon.id,
          data: payload,
        });
        showSuccess(SUCCESS_MESSAGES.COUPON.UPDATED);
      }
      handleCloseDrawer();
      refetch();
    } catch {
      showError(
        drawerMode === "create"
          ? ERROR_MESSAGES.COUPON.CREATE_FAILED
          : ERROR_MESSAGES.COUPON.UPDATE_FAILED,
      );
    }
  }, [
    formState,
    drawerMode,
    selectedCoupon,
    createMutation,
    updateMutation,
    showSuccess,
    showError,
    handleCloseDrawer,
    refetch,
  ]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!couponToDelete) return;
    try {
      await deleteMutation.mutateAsync(couponToDelete.id);
      showSuccess(SUCCESS_MESSAGES.COUPON.DELETED);
      setCouponToDelete(null);
      refetch();
    } catch {
      showError(ERROR_MESSAGES.COUPON.DELETE_FAILED);
    }
  }, [couponToDelete, deleteMutation, showSuccess, showError, refetch]);

  const isSaving = (drawerMode === "create" ? createMutation : updateMutation)
    .isPending;

  const { columns } = getCouponTableColumns(handleEdit, (coupon) =>
    setCouponToDelete(coupon),
  );

  const drawerTitle = drawerMode === "create" ? t("create") : t("edit");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={`${t("subtitle")} — ${data?.meta.total ?? 0} total`}
        actionLabel={t("create")}
        onAction={handleCreate}
      />

      <ListingLayout
        searchSlot={
          <Search
            value={searchTerm}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
          />
        }
        filterContent={<CouponFilters table={pendingTable} />}
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        toolbarPaginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={data?.meta?.total ?? 0}
            onPageChange={table.setPage}
            compact
          />
        }
      >
        <DataTable
          columns={columns}
          data={coupons}
          loading={isLoading}
          emptyMessage={
            error ? ERROR_MESSAGES.COUPON.FETCH_FAILED : t("noCoupons")
          }
          keyExtractor={(c: CouponDocument) => c.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          externalPagination
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(coupon) => (
            <Card className="p-4 space-y-2">
              <Text weight="medium" className="font-mono tracking-wide">
                {coupon.code}
              </Text>
              <Caption className="truncate">{coupon.name}</Caption>
              <div className={`${flex.between}`}>
                <Badge>{coupon.type}</Badge>
                <Caption>
                  {t("usageCount", {
                    count: coupon.usage?.currentUsage ?? 0,
                  })}
                </Caption>
              </div>
              <Caption>
                {t("expiresLabel")}:{" "}
                {coupon.validity?.endDate
                  ? formatDate(coupon.validity.endDate)
                  : "—"}
              </Caption>
            </Card>
          )}
        />
      </ListingLayout>

      {/* Create / Edit drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={drawerTitle}
        side="right"
        footer={
          <DrawerFormFooter
            onCancel={handleCloseDrawer}
            onSubmit={handleSave}
            isLoading={isSaving}
            isSubmitDisabled={!isDirty && drawerMode === "edit"}
            submitLabel={
              drawerMode === "create" ? t("create") : tActions("save")
            }
          />
        }
      >
        {isDrawerOpen && (
          <CouponForm
            initialData={selectedCoupon ?? undefined}
            onChange={setFormState}
            isEdit={drawerMode === "edit"}
          />
        )}
      </SideDrawer>

      {/* Delete confirm modal */}
      <ConfirmDeleteModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t("delete")}
        message={`Delete coupon "${couponToDelete?.code}"? This cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
