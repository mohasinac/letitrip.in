"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/lib/contexts/AuthContext";
import { auth } from "@/app/(backend)/api/_lib/database/config";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { apiClient } from "@/lib/api/client";

interface DebugInfo {
  firebaseAuth: boolean;
  currentUser: boolean;
  userEmail: string | null;
  userUID: string | null;
  tokenAvailable: boolean;
  tokenLength: number;
  tokenPreview: string;
  userRole: string;
  customClaims: any;
  apiTests: {
    endpoint: string;
    status: number;
    success: boolean;
    error?: string;
  }[];
}

export default function AdminDebugPage() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const info: DebugInfo = {
      firebaseAuth: !!auth,
      currentUser: !!auth?.currentUser,
      userEmail: auth?.currentUser?.email || null,
      userUID: auth?.currentUser?.uid || null,
      tokenAvailable: false,
      tokenLength: 0,
      tokenPreview: "",
      userRole: "unknown",
      customClaims: {},
      apiTests: [],
    };

    try {
      if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        info.tokenAvailable = !!token;
        info.tokenLength = token?.length || 0;
        info.tokenPreview = token ? `${token.substring(0, 30)}...` : "None";

        const tokenResult = await auth.currentUser.getIdTokenResult();
        info.userRole = (tokenResult.claims.role as string) || "No role set";
        info.customClaims = tokenResult.claims;
      }

      // Test API endpoints
      const endpoints = [
        "/api/admin/orders/stats",
        "/api/admin/products/stats",
        "/api/admin/support/stats",
      ];

      for (const endpoint of endpoints) {
        try {
          await apiClient.get(endpoint);
          info.apiTests.push({
            endpoint,
            status: 200,
            success: true,
          });
        } catch (error: any) {
          info.apiTests.push({
            endpoint,
            status: error.response?.status || 0,
            success: false,
            error: error.response?.data?.error || error.message,
          });
        }
      }
    } catch (error: any) {
      console.error("Error running diagnostics:", error);
    }

    setDebugInfo(info);
    setTesting(false);
  };

  useEffect(() => {
    if (!loading && user) {
      runDiagnostics();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading diagnostics...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <UnifiedCard className="p-6">
          <h1 className="text-2xl font-bold mb-4">⚠️ Not Authenticated</h1>
          <p>You need to be logged in to view this page.</p>
        </UnifiedCard>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          🔍 Admin Authentication Debug
        </h1>
        <p className="text-textSecondary">
          Diagnostic information to help troubleshoot authentication issues
        </p>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={testing}
        className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {testing ? "Running Diagnostics..." : "Re-run Diagnostics"}
      </button>

      {debugInfo && (
        <div className="space-y-6">
          {/* Firebase Auth Status */}
          <UnifiedCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Firebase Authentication</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-textSecondary">
                  Firebase Auth Initialized
                </p>
                <p className="font-semibold">
                  {debugInfo.firebaseAuth ? "✅ Yes" : "❌ No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-textSecondary">Current User</p>
                <p className="font-semibold">
                  {debugInfo.currentUser ? "✅ Logged In" : "❌ Not Logged In"}
                </p>
              </div>
              <div>
                <p className="text-sm text-textSecondary">User Email</p>
                <p className="font-semibold">{debugInfo.userEmail || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-textSecondary">User UID</p>
                <p className="font-mono text-xs">
                  {debugInfo.userUID || "N/A"}
                </p>
              </div>
            </div>
          </UnifiedCard>

          {/* Token Status */}
          <UnifiedCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Token Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-textSecondary">Token Available</p>
                <p className="font-semibold">
                  {debugInfo.tokenAvailable ? "✅ Yes" : "❌ No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-textSecondary">Token Length</p>
                <p className="font-semibold">
                  {debugInfo.tokenLength} characters
                </p>
              </div>
              <div>
                <p className="text-sm text-textSecondary">Token Preview</p>
                <p className="font-mono text-xs bg-surface p-2 rounded">
                  {debugInfo.tokenPreview}
                </p>
              </div>
            </div>
          </UnifiedCard>

          {/* User Role & Claims */}
          <UnifiedCard className="p-6">
            <h2 className="text-xl font-bold mb-4">User Role & Claims</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-textSecondary">User Role</p>
                <UnifiedBadge
                  variant={
                    debugInfo.userRole === "admin" ? "success" : "warning"
                  }
                >
                  {debugInfo.userRole}
                </UnifiedBadge>
              </div>
              <div>
                <p className="text-sm text-textSecondary mb-2">Custom Claims</p>
                <pre className="bg-surface p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.customClaims, null, 2)}
                </pre>
              </div>
            </div>
          </UnifiedCard>

          {/* API Tests */}
          <UnifiedCard className="p-6">
            <h2 className="text-xl font-bold mb-4">API Endpoint Tests</h2>
            <div className="space-y-3">
              {debugInfo.apiTests.map((test, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono">{test.endpoint}</code>
                    <UnifiedBadge variant={test.success ? "success" : "error"}>
                      {test.status}
                    </UnifiedBadge>
                  </div>
                  {!test.success && test.error && (
                    <p className="text-sm text-error mt-2">
                      Error: {test.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </UnifiedCard>

          {/* Context Info */}
          <UnifiedCard className="p-6">
            <h2 className="text-xl font-bold mb-4">AuthContext User</h2>
            <pre className="bg-surface p-4 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </UnifiedCard>
        </div>
      )}
    </div>
  );
}
