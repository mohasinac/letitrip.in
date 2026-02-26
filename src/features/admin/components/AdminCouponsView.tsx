/**
 * AdminCouponsView
 *
 * Extracted from src/app/[locale]/admin/coupons/[[...action]]/page.tsx
 * Coupon management with URL-driven drawer CRUD, Sieve-powered search, and
 * pagination.
 */

"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useMessage, useUrlTable } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  ConfirmDeleteModal,
  getCouponTableColumns,
  CouponForm,
  couponToFormState,
  formStateToCouponPayload,
  TablePagination,
  AdminFilterBar,
  FormField,
} from "@/components";
import type { CouponFormState } from "@/components";
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

  const filtersArr: string[] = [];
  if (searchTerm) filtersArr.push(`code@=*${searchTerm}`);

  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] =
    useState<Partial<CouponDocument> | null>(null);
  const [formState, setFormState] = useState<CouponFormState | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<CouponDocument | null>(
    null,
  );

  const initialFormRef = useRef<string>("");

  const { data, isLoading, error, refetch } = useApiQuery<{
    coupons: CouponDocument[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>({
    queryKey: ["admin", "coupons", table.params.toString()],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.ADMIN.COUPONS}${table.buildSieveParams(filtersArr.join(","))}`,
      ),
  });

  const createMutation = useApiMutation<any, any>({
    mutationFn: (payload) =>
      apiClient.post(API_ENDPOINTS.ADMIN.COUPONS, payload),
  });

  const updateMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data: update }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.COUPON_BY_ID(id), update),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) => apiClient.delete(API_ENDPOINTS.ADMIN.COUPON_BY_ID(id)),
  });

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
        await createMutation.mutate(payload);
        showSuccess(SUCCESS_MESSAGES.COUPON.CREATED);
      } else if (drawerMode === "edit" && selectedCoupon?.id) {
        await updateMutation.mutate({ id: selectedCoupon.id, data: payload });
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
      await deleteMutation.mutate(couponToDelete.id);
      showSuccess(SUCCESS_MESSAGES.COUPON.DELETED);
      setCouponToDelete(null);
      refetch();
    } catch {
      showError(ERROR_MESSAGES.COUPON.DELETE_FAILED);
    }
  }, [couponToDelete, deleteMutation, showSuccess, showError, refetch]);

  const isSaving = (drawerMode === "create" ? createMutation : updateMutation)
    .isLoading;

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

      <Card>
        <AdminFilterBar>
          <FormField
            type="text"
            name="search"
            value={searchTerm}
            onChange={(value) => table.set("q", value)}
            placeholder={t("searchPlaceholder")}
          />
        </AdminFilterBar>
        <DataTable
          columns={columns}
          data={coupons}
          loading={isLoading}
          emptyMessage={
            error ? ERROR_MESSAGES.COUPON.FETCH_FAILED : t("noCoupons")
          }
          keyExtractor={(c: CouponDocument) => c.id}
          externalPagination
        />
        <TablePagination
          currentPage={data?.meta?.page ?? 1}
          totalPages={data?.meta?.totalPages ?? 1}
          pageSize={table.getNumber("pageSize", 25)}
          total={data?.meta?.total ?? 0}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </Card>

      {/* Create / Edit drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={drawerTitle}
        side="right"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            {isDrawerOpen && (
              <CouponForm
                initialData={selectedCoupon ?? undefined}
                onChange={setFormState}
                isEdit={drawerMode === "edit"}
              />
            )}
          </div>
          <DrawerFormFooter
            onCancel={handleCloseDrawer}
            onSubmit={handleSave}
            isLoading={isSaving}
            isSubmitDisabled={!isDirty && drawerMode === "edit"}
            submitLabel={
              drawerMode === "create" ? t("create") : tActions("save")
            }
          />
        </div>
      </SideDrawer>

      {/* Delete confirm modal */}
      <ConfirmDeleteModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t("delete")}
        message={`Delete coupon "${couponToDelete?.code}"? This cannot be undone.`}
        isDeleting={deleteMutation.isLoading}
      />
    </div>
  );
}
