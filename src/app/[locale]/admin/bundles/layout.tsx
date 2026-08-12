import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { requireFeatureFlag } from "@/lib/features";

const AdminBundlesSection = makeAdminSectionLayout("admin:categories:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  requireFeatureFlag("BUNDLES");
  return <AdminBundlesSection>{children}</AdminBundlesSection>;
}
