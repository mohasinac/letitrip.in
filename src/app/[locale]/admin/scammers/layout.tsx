import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { requireFeatureFlag } from "@/lib/features";

const AdminScammersSection = makeAdminSectionLayout("admin:scammers:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  requireFeatureFlag("SCAM_REGISTRY");
  return <AdminScammersSection>{children}</AdminScammersSection>;
}
