"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@/constants/routes";

export default function AdminSettings() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to general settings by default
    router.replace(ADMIN_ROUTES.SETTINGS_GENERAL);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
