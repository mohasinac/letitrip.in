"use server";
import { ActionResult, requireRoleUser, wrapAction } from "@mohasinac/appkit/server";
import { updateActionConfigDomain, updateNavConfigDomain } from "@mohasinac/appkit/server";

export async function updateActionConfigAction(actionId: string, enabled: boolean): Promise<void> {
  await requireRoleUser("admin");
  await updateActionConfigDomain(actionId, enabled);
}

export async function updateNavConfigAction(
  navId: string,
  enabled: boolean,
  allNavItems: Array<{ id: string; href: string }>,
): Promise<void> {
  await requireRoleUser("admin");
  await updateNavConfigDomain(navId, enabled, allNavItems);
}
