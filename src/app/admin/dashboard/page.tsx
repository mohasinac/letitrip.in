"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="admin-layout">
      {/* Header */}
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted">
                Welcome back, {user?.name || user?.displayName}! Here's your
                store overview.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="admin-card p-12 text-center">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Dashboard Under Maintenance
            </h2>
            <p className="text-secondary">
              We're updating the dashboard with enhanced features. This page
              will be restored shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
