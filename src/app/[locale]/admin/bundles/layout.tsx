import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

const AdminBundlesSection = makeAdminSectionLayout("admin:categories:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <AdminBundlesSection>{children}</AdminBundlesSection>;
}
