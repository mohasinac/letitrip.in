import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
export default makeAdminSectionLayout("admin:notifications:read", { getUser: getServerSessionUser });
