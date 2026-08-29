import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

const AdminScammersSection = makeAdminSectionLayout("admin:scammers:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <AdminScammersSection>{children}</AdminScammersSection>;
}
