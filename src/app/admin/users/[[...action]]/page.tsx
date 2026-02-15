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
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { THEME_CONSTANTS, UI_LABELS, ROUTES, API_ENDPOINTS } from "@/constants";
import {
  Card,
  Button,
  DataTable,
  AdminPageHeader,
  ConfirmDeleteModal,
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
  const [activeTab, setActiveTab] = useState<UserTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
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

  const queryParams = new URLSearchParams();
  if (activeTab === "active") queryParams.append("disabled", "false");
  if (activeTab === "banned") queryParams.append("disabled", "true");
  if (activeTab === "admins") queryParams.append("role", "admin");
  if (searchTerm) queryParams.append("search", searchTerm);
  if (roleFilter !== "all") queryParams.append("role", roleFilter);

  const { data, isLoading, error, refetch } = useApiQuery<{
    users: AdminUser[];
    total: number;
  }>({
    queryKey: ["admin", "users", activeTab, searchTerm, roleFilter],
    queryFn: () =>
      apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}?${queryParams.toString()}`),
  });

  const updateUserMutation = useApiMutation<any, { uid: string; data: any }>({
    mutationFn: ({ uid, data }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.USER_BY_ID(uid), data),
  });

  const deleteUserMutation = useApiMutation<any, string>({
    mutationFn: (uid) => apiClient.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(uid)),
  });

  const users = data?.users || [];
  const total = data?.total || 0;

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
          onTabChange={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
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
          <DataTable
            data={users}
            columns={columns}
            keyExtractor={(user) => user.uid}
            onRowClick={handleViewUser}
            actions={actions}
          />
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
