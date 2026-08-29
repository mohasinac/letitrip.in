import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

const AdminPayoutsSection = makeAdminSectionLayout("admin:payouts:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <AdminPayoutsSection>{children}</AdminPayoutsSection>;
}
