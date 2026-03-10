"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
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
  const query = useQuery<{ users: AdminUser[]; meta: UserListMeta }>({
    queryKey: ["admin", "users", sieveParams],
    queryFn: () => adminService.listUsers(sieveParams),
  });

  const updateUserMutation = useMutation<
    unknown,
    Error,
    { uid: string; data: unknown }
  >({
    mutationFn: ({ uid, data }) => adminService.updateUser(uid, data),
  });

  const deleteUserMutation = useMutation<unknown, Error, string>({
    mutationFn: (uid) => adminService.deleteUser(uid),
  });

  return { ...query, updateUserMutation, deleteUserMutation };
}
