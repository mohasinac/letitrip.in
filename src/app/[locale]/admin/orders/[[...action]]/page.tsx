"use client";

import { use } from "react";
import { AdminOrdersView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminOrdersPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminOrdersView action={action} />;
}
