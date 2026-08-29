import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

const AdminBlogSection = makeAdminSectionLayout("admin:blog:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <AdminBlogSection>{children}</AdminBlogSection>;
}
