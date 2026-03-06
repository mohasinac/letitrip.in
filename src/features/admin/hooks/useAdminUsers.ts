"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { adminService } from "@/services";
import type { AdminUser } from "../components";

interface UserListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * useAdminUsers
 * Accepts a pre-built sieve params string and fetches the users list.
 * Exposes update-user and delete-user mutations.
 */
export function useAdminUsers(sieveParams: string) {
  const query = useApiQuery<{ users: AdminUser[]; meta: UserListMeta }>({
    queryKey: ["admin", "users", sieveParams],
    queryFn: () => adminService.listUsers(sieveParams),
  });

  const updateUserMutation = useApiMutation<
    unknown,
    { uid: string; data: unknown }
  >({
    mutationFn: ({ uid, data }) => adminService.updateUser(uid, data),
  });

  const deleteUserMutation = useApiMutation<unknown, string>({
    mutationFn: (uid) => adminService.deleteUser(uid),
  });

  return { ...query, updateUserMutation, deleteUserMutation };
}
