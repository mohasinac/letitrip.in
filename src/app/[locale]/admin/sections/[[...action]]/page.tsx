/**
 * Admin Sections Page
 *
 * Route: /admin/sections/[[...action]]
 * Thin wrapper — all logic lives in AdminSectionsView.
 */

import { use } from "react";
import { AdminSectionsView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminSectionsPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminSectionsView action={action} />;
}
