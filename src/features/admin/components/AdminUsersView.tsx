/**
 * AdminUsersView
 *
 * Extracted from src/app/[locale]/admin/users/[[...action]]/page.tsx
 * User management with search, role/status filters, DataTable, paginated Sieve
 * query, and URL-driven detail drawer.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUrlTable, usePendingTable } from "@/hooks";
import { useAdminUsers } from "@/features/admin/hooks";
import { THEME_CONSTANTS, ROUTES, SUCCESS_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";

const { flex } = THEME_CONSTANTS;
import {
  AdminPageHeader,
  Button,
  Caption,
  Card,
  ConfirmDeleteModal,
  DataTable,
  ListingLayout,
  RoleBadge,
  Search,
  Span,
  StatusBadge,
  TablePagination,
  Text,
  useToast,
  UserFilters,
} from "@/components";
import { UserDetailDrawer, useUserTableColumns } from ".";
import type { AdminUser, UserTab } from ".";

interface AdminUsersViewProps {
  action?: string[];
}

export function AdminUsersView({ action }: AdminUsersViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("adminUsers");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const activeTab = (table.get("tab") || "all") as UserTab;
  const searchTerm = table.get("q");
  const roleFilter = table.get("role");
  const emailVerifiedFilter = table.get("emailVerified");
  const disabledFilter = table.get("disabled");
  const storeStatusFilter = table.get("storeStatus");
  const createdFrom = table.get("createdFrom");
  const createdTo = table.get("createdTo");

  // ── Pending filter state (staged until Apply is clicked) ──────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, [
      "role",
      "emailVerified",
      "disabled",
      "storeStatus",
      "createdFrom",
      "createdTo",
    ]);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    requireTypedConfirmation?: boolean;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  // Build Sieve filter string
  const filtersArr: string[] = [];
  if (activeTab === "active") filtersArr.push("disabled==false");
  else if (activeTab === "banned") filtersArr.push("disabled==true");
  else if (disabledFilter) filtersArr.push(`disabled==${disabledFilter}`);
  if (activeTab === "admins") filtersArr.push("role==admin");
  else if (roleFilter) filtersArr.push(`role==${roleFilter}`);
  if (searchTerm) filtersArr.push(`(displayName|email)@=*${searchTerm}`);
  if (emailVerifiedFilter)
    filtersArr.push(`emailVerified==${emailVerifiedFilter}`);
  if (storeStatusFilter) filtersArr.push(`storeStatus==${storeStatusFilter}`);
  if (createdFrom) filtersArr.push(`createdAt>=${createdFrom}`);
  if (createdTo) filtersArr.push(`createdAt<=${createdTo}`);
  const filtersParam = filtersArr.join(",");

  const {
    data,
    isLoading,
    error,
    refetch,
    updateUserMutation,
    deleteUserMutation,
  } = useAdminUsers(table.buildSieveParams(filtersParam));

  const users = data?.users || [];
  const total = data?.meta?.total ?? users.length;

  const findUserByUid = useCallback(
    (uid: string): AdminUser | undefined => users.find((u) => u.uid === uid),
    [users],
  );

  const handleViewUser = useCallback(
    (user: AdminUser) => {
      setSelectedUser(user);
      setIsDrawerOpen(true);
      if (user.uid && action?.[0] !== "view") {
        router.push(`${ROUTES.ADMIN.USERS}/view/${user.uid}`);
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.USERS);
    }
  }, [action, router]);

  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;
    const mode = action[0];
    const uid = action[1];
    if (mode === "view" && uid && users.length > 0) {
      const user = findUserByUid(uid);
      if (user) handleViewUser(user);
      else router.replace(ROUTES.ADMIN.USERS);
    }
  }, [action, users, findUserByUid, isDrawerOpen, handleViewUser, router]);

  const handleRoleChange = async (user: AdminUser, newRole: string) => {
    setConfirmModal({
      open: true,
      title: t("confirmRoleChange"),
      message: `${t("confirmRoleChange")} ${newRole}?`,
      onConfirm: async () => {
        try {
          await updateUserMutation.mutate({
            uid: user.uid,
            data: { role: newRole },
          });
          await refetch();
          showToast(SUCCESS_MESSAGES.ADMIN.USER_ROLE_UPDATED, "success");
          if (selectedUser?.uid === user.uid) {
            setSelectedUser({ ...user, role: newRole as AdminUser["role"] });
          }
        } catch {
          showToast(t("roleUpdateFailed"), "error");
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleToggleBan = async (user: AdminUser) => {
    const banAction = user.disabled ? "unban" : "ban";
    setConfirmModal({
      open: true,
      title: `${banAction.charAt(0).toUpperCase() + banAction.slice(1)} User`,
      message: `${banAction.charAt(0).toUpperCase() + banAction.slice(1)} ${user.displayName || user.email}?`,
      onConfirm: async () => {
        try {
          await updateUserMutation.mutate({
            uid: user.uid,
            data: { disabled: !user.disabled },
          });
          await refetch();
          showToast(
            user.disabled
              ? SUCCESS_MESSAGES.ADMIN.USER_UNBANNED
              : SUCCESS_MESSAGES.ADMIN.USER_BANNED,
            "success",
          );
          if (selectedUser?.uid === user.uid) {
            setSelectedUser({ ...user, disabled: !user.disabled });
          }
          handleCloseDrawer();
        } catch {
          showToast(t("banFailed"), "error");
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteUser = async (user: AdminUser) => {
    setConfirmModal({
      open: true,
      title: t("confirmDelete"),
      message: t("typeDeleteConfirm"),
      requireTypedConfirmation: true,
      onConfirm: async () => {
        try {
          await deleteUserMutation.mutate(user.uid);
          await refetch();
          showToast(SUCCESS_MESSAGES.ADMIN.USER_DELETED, "success");
          handleCloseDrawer();
        } catch {
          showToast(t("deleteFailed"), "error");
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const { columns, actions } = useUserTableColumns(
    handleViewUser,
    handleToggleBan,
  );

  return (
    <>
      <div className={THEME_CONSTANTS.spacing.stack}>
        <AdminPageHeader
          title={t("title")}
          subtitle={`${t("subtitle")} (${total} total)`}
        />

        <ListingLayout
          statusTabsSlot={
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "banned", "admins"] as UserTab[]).map(
                (tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => table.set("tab", tab === "all" ? "" : tab)}
                  >
                    {t(`tab_${tab}`)}
                  </Button>
                ),
              )}
            </div>
          }
          searchSlot={
            <Search
              value={searchTerm}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
            />
          }
          filterContent={<UserFilters table={pendingTable} />}
          filterActiveCount={filterActiveCount}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
          paginationSlot={
            <TablePagination
              currentPage={data?.meta?.page ?? 1}
              totalPages={data?.meta?.totalPages ?? 1}
              pageSize={table.getNumber("pageSize", 25)}
              total={data?.meta?.total ?? 0}
              onPageChange={table.setPage}
              onPageSizeChange={table.setPageSize}
            />
          }
        >
          {isLoading ? (
            <Card>
              <div className="text-center py-8">{tLoading("default")}</div>
            </Card>
          ) : error ? (
            <Card>
              <div className="text-center py-8">
                <Text className="text-red-600 mb-4">{error.message}</Text>
                <Button variant="outline" onClick={() => refetch()}>
                  {tActions("retry")}
                </Button>
              </div>
            </Card>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              keyExtractor={(user) => user.uid}
              onRowClick={handleViewUser}
              actions={actions}
              externalPagination
              showViewToggle
              viewMode={
                (table.get("view") || "table") as "table" | "grid" | "list"
              }
              onViewModeChange={(mode) => table.set("view", mode)}
              mobileCardRender={(user) => (
                <Card
                  className="p-4 space-y-3 cursor-pointer"
                  onClick={() => handleViewUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 ${flex.center} flex-shrink-0`}
                    >
                      <Span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {(user.displayName ??
                          user.email ??
                          "U")[0].toUpperCase()}
                      </Span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Text weight="medium" size="sm" className="truncate">
                        {user.displayName ?? "—"}
                      </Text>
                      <Caption className="truncate">
                        {user.email ?? "—"}
                      </Caption>
                    </div>
                  </div>
                  <div className={`${flex.between}`}>
                    <RoleBadge role={user.role} />
                    <StatusBadge
                      status={user.disabled ? "inactive" : "active"}
                    />
                  </div>
                </Card>
              )}
            />
          )}
        </ListingLayout>
      </div>

      <UserDetailDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onRoleChange={handleRoleChange}
        onToggleBan={handleToggleBan}
        onDelete={handleDeleteUser}
      />

      <ConfirmDeleteModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </>
  );
}
