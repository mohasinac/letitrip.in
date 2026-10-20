import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/*
 * 🛑 The RBAC gate for this whole subtree, and the reason `audit-page-rbac`
 * passes for every page under it. It also makes the subtree per-request, which
 * is what every `/admin/*` route already is — never a `force-dynamic` segment
 * config (Root Cause #89).
 */
export default makeAdminSectionLayout("admin:parts:read", { getUser: getServerSessionUser });
