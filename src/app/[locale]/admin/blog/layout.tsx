import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { requireFeatureFlag } from "@/lib/features";

const AdminBlogSection = makeAdminSectionLayout("admin:blog:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  requireFeatureFlag("BLOG");
  return <AdminBlogSection>{children}</AdminBlogSection>;
}
