"use client";

import { useMutation } from "@tanstack/react-query";
import {
  listAdminUsersAction,
  adminUpdateUserAction,
  adminDeleteUserAction,
} from "@/actions";
import { createAdminListQuery, extractBasicMeta } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { AdminUser } from "../components";

export function useAdminUsers(sieveParams: string) {
  const query = createAdminListQuery<
    unknown,
    { users: AdminUser[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "users"],
    sieveParams,
    action: listAdminUsersAction,
    transform: (result) => ({
      users: result.items as unknown as AdminUser[],
      meta: extractBasicMeta(result),
    }),
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
