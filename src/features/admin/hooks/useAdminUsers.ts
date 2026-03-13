"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listAdminUsersAction,
  adminUpdateUserAction,
  adminDeleteUserAction,
} from "@/actions";
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
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      const result = await listAdminUsersAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        users: result.items as unknown as AdminUser[],
        meta: {
          page: result.page,
          limit: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    },
  });

  const updateUserMutation = useMutation<
    unknown,
    Error,
    { uid: string; data: unknown }
  >({
    mutationFn: ({ uid, data }) =>
      adminUpdateUserAction(
        uid,
        data as Parameters<typeof adminUpdateUserAction>[1],
      ),
  });

  const deleteUserMutation = useMutation<unknown, Error, string>({
    mutationFn: (uid) => adminDeleteUserAction(uid),
  });

  return { ...query, updateUserMutation, deleteUserMutation };
}
