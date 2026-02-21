/**
 * Admin Users Page
 * Path: /admin/users
 *
 * User management with search, filters, DataTable,
 * and side drawer detail view. Orchestrates extracted sub-components.
 */

"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useUrlTable } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { THEME_CONSTANTS, UI_LABELS, ROUTES, API_ENDPOINTS } from "@/constants";
import {
  Card,
  Button,
  DataTable,
  AdminPageHeader,
  ConfirmDeleteModal,
  TablePagination,
} from "@/components";
import { useToast } from "@/components";
import {
  UserFilters,
  getUserTableColumns,
  UserDetailDrawer,
} from "@/components/admin/users";
import type { AdminUser, UserTab } from "@/components/admin/users";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminUsersPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const USERS = UI_LABELS.ADMIN.USERS;
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const activeTab = (table.get("tab") || "all") as UserTab;
  const searchTerm = table.get("q");
  const roleFilter = table.get("role") || "all";
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Confirmation modal state
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
  if (activeTab === "banned") filtersArr.push("disabled==true");
  if (activeTab === "admins") filtersArr.push("role==admin");
  else if (roleFilter !== "all") filtersArr.push(`role==${roleFilter}`);
  if (searchTerm) filtersArr.push(`(displayName|email)@=*${searchTerm}`);
  const filtersParam = filtersArr.join(",");

  const { data, isLoading, error, refetch } = useApiQuery<{
    users: AdminUser[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ["admin", "users", table.params.toString()],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.ADMIN.USERS}${table.buildSieveParams(filtersParam)}`,
      ),
  });

  const updateUserMutation = useApiMutation<any, { uid: string; data: any }>({
    mutationFn: ({ uid, data }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.USER_BY_ID(uid), data),
  });

  const deleteUserMutation = useApiMutation<any, string>({
    mutationFn: (uid) => apiClient.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(uid)),
  });

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
      title: USERS.CONFIRM_ROLE_CHANGE,
      message: `${USERS.CONFIRM_ROLE_CHANGE} ${newRole}?`,
      onConfirm: async () => {
        try {
          await updateUserMutation.mutate({
            uid: user.uid,
            data: { role: newRole },
          });
          await refetch();
          if (selectedUser?.uid === user.uid) {
            setSelectedUser({ ...user, role: newRole as AdminUser["role"] });
          }
        } catch {
          showToast(USERS.ROLE_UPDATE_FAILED, "error");
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
          if (selectedUser?.uid === user.uid) {
            setSelectedUser({ ...user, disabled: !user.disabled });
          }
          handleCloseDrawer();
        } catch {
          showToast(USERS.BAN_FAILED, "error");
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteUser = async (user: AdminUser) => {
    setConfirmModal({
      open: true,
      title: USERS.CONFIRM_DELETE,
      message: USERS.TYPE_DELETE_CONFIRM,
      requireTypedConfirmation: true,
      onConfirm: async () => {
        try {
          await deleteUserMutation.mutate(user.uid);
          await refetch();
          handleCloseDrawer();
        } catch {
          showToast(USERS.DELETE_FAILED, "error");
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const { columns, actions } = getUserTableColumns(
    handleViewUser,
    handleToggleBan,
  );

  return (
    <>
      <div className={THEME_CONSTANTS.spacing.stack}>
        <AdminPageHeader
          title={UI_LABELS.ADMIN.USERS.TITLE}
          subtitle={`${UI_LABELS.ADMIN.USERS.SUBTITLE} (${total} total)`}
        />

        <UserFilters
          activeTab={activeTab}
          onTabChange={(t) => table.set("tab", t)}
          searchTerm={searchTerm}
          onSearchChange={(v) => table.set("q", v)}
          roleFilter={roleFilter}
          onRoleFilterChange={(r) => table.set("role", r)}
          isAdminsTab={activeTab === "admins"}
        />

        {isLoading ? (
          <Card>
            <div className="text-center py-8">{UI_LABELS.LOADING.DEFAULT}</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>
                {UI_LABELS.ACTIONS.RETRY}
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <DataTable
              data={users}
              columns={columns}
              keyExtractor={(user) => user.uid}
              onRowClick={handleViewUser}
              actions={actions}
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
          </>
        )}
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
