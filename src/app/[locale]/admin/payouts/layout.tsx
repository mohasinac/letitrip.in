import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { requireFeatureFlag } from "@/lib/features";

const AdminPayoutsSection = makeAdminSectionLayout("admin:payouts:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  requireFeatureFlag("PAYOUTS");
  return <AdminPayoutsSection>{children}</AdminPayoutsSection>;
}
