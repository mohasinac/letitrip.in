import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
export default makeAdminSectionLayout("admin:event-entries:read", { getUser: getServerSessionUser });
