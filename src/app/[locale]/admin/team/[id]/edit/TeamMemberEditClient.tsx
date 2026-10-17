"use client";

import { AdminEmployeeEditorView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

/**
 * The drawer, with the member's REAL current permissions handed in.
 *
 * Split out of `page.tsx` so that page can be a Server Component and do the
 * existence check — see its header for why that mattered more than the 404.
 */
export function TeamMemberEditClient({
  userId,
  displayName,
  currentPermissionGroup,
  currentPermissions,
}: {
  userId: string;
  displayName?: string;
  currentPermissionGroup?: string;
  currentPermissions: string[];
}) {
  const router = useRouter();
  return (
    <AdminEmployeeEditorView
      open
      mode="edit"
      userId={userId}
      displayName={displayName}
      currentPermissionGroup={currentPermissionGroup}
      currentPermissions={currentPermissions}
      onClose={() => router.push(String(ROUTES.ADMIN.TEAM))}
    />
  );
}
