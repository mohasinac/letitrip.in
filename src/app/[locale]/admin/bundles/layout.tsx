import { notFound } from "next/navigation";
import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { getFlag } from "@/lib/features";

const AdminBundlesSection = makeAdminSectionLayout("admin:categories:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!getFlag("BUNDLES")) notFound();
  return <AdminBundlesSection>{children}</AdminBundlesSection>;
}
