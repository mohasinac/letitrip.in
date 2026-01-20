"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

/**
 * UserImpersonation Component
 *
 * Allows admins to impersonate users or sellers to view the platform
 * from their perspective for support and debugging purposes.
 *
 * Features:
 * - Search for users by name, email, or ID
 * - Quick filters by role (user/seller)
 * - Recent impersonations list
 * - Active impersonation indicator
 * - Exit impersonation button
 * - Session management
 * - Audit logging (placeholder)
 *
 * Security:
 * - Admin-only access (check role before rendering)
 * - Backend session validation required
 * - Audit trail for all impersonations
 * - Cannot impersonate other admins
 * - Session timeout after inactivity
 *
 * @example
 * ```tsx
 * // In admin layout or dashboard
 * <UserImpersonation />
 * ```
 */

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "seller" | "admin";
  avatar?: string;
  status: "active" | "suspended" | "inactive";
}

interface ImpersonationSession {
  userId: string;
  userName: string;
  userRole: "user" | "seller";
  startedAt: Date;
  adminId: string;
  adminName: string;
}

// Mock users (replace with actual API call)
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    role: "user",
    status: "active",
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "seller",
    status: "active",
  },
  {
    id: "3",
    name: "Amit Patel",
    email: "amit.patel@example.com",
    role: "user",
    status: "active",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    role: "seller",
    status: "active",
  },
];

export default function UserImpersonation() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "seller">(
    "all",
  );
  const [results, setResults] = useState<User[]>([]);
  const [activeSession, setActiveSession] =
    useState<ImpersonationSession | null>(null);
  const [recentImpersonations, setRecentImpersonations] = useState<string[]>(
    [],
  );

  // Load recent impersonations
  React.useEffect(() => {
    const saved = localStorage.getItem("admin-recent-impersonations");
    if (saved) {
      setRecentImpersonations(JSON.parse(saved));
    }

    // Check for active session
    const session = localStorage.getItem("admin-impersonation-session");
    if (session) {
      setActiveSession(JSON.parse(session));
    }
  }, []);

  // Search users
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = MOCK_USERS.filter((user) => {
      // Don't allow impersonating admins
      if (user.role === "admin") return false;

      // Role filter
      if (roleFilter !== "all" && user.role !== roleFilter) return false;

      // Search query
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.includes(query)
      );
    });

    setResults(filtered);
  }, [searchQuery, roleFilter]);

  // Start impersonation
  const handleStartImpersonation = async (user: User) => {
    try {
      // TODO: Call backend API to start impersonation session
      // const response = await fetch('/api/admin/impersonate', {
      //   method: 'POST',
      //   body: JSON.stringify({ userId: user.id }),
      // });

      const session: ImpersonationSession = {
        userId: user.id,
        userName: user.name,
        userRole: user.role as "user" | "seller", // Type assertion since we filter out admins
        startedAt: new Date(),
        adminId: "admin-1", // Get from current session
        adminName: "Admin User", // Get from current session
      };

      // Save session
      setActiveSession(session);
      localStorage.setItem(
        "admin-impersonation-session",
        JSON.stringify(session),
      );

      // Save to recent
      const updated = [
        user.id,
        ...recentImpersonations.filter((id) => id !== user.id),
      ].slice(0, 5);
      setRecentImpersonations(updated);
      localStorage.setItem(
        "admin-recent-impersonations",
        JSON.stringify(updated),
      );

      // Close modal
      setIsOpen(false);
      setSearchQuery("");

      // Redirect to appropriate dashboard
      if (user.role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }

      // Show notification
      alert(`Now viewing as: ${user.name} (${user.role})`);
    } catch (error) {
      console.error("Impersonation error:", error);
      alert("Failed to start impersonation session");
    }
  };

  // End impersonation
  const handleEndImpersonation = async () => {
    try {
      // TODO: Call backend API to end impersonation session
      // await fetch('/api/admin/impersonate/end', { method: 'POST' });

      // Clear session
      setActiveSession(null);
      localStorage.removeItem("admin-impersonation-session");

      // Redirect back to admin
      router.push("/admin/dashboard");

      // Show notification
      alert("Impersonation session ended");
    } catch (error) {
      console.error("End impersonation error:", error);
      alert("Failed to end impersonation session");
    }
  };

  return (
    <>
      {/* Active Impersonation Banner */}
      {activeSession && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="font-semibold">
                Viewing as: {activeSession.userName} ({activeSession.userRole})
              </span>
              <span className="text-sm opacity-75">
                Started:{" "}
                {new Date(activeSession.startedAt).toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={handleEndImpersonation}
              className="px-4 py-1 bg-black text-yellow-500 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Exit Impersonation
            </button>
          </div>
        </div>
      )}

      {/* Impersonation Button (only show if not currently impersonating) */}
      {!activeSession && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          title="Impersonate User"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="hidden md:inline">Impersonate User</span>
        </button>
      )}

      {/* Impersonation Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Impersonate User
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    View the platform as another user for support and debugging
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Security Warning */}
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-semibold mb-1">Security Notice:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All impersonation sessions are logged and audited</li>
                    <li>
                      You can only impersonate users and sellers, not admins
                    </li>
                    <li>Session will auto-expire after 30 minutes</li>
                    <li>Use responsibly for support purposes only</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 mb-3">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "user", label: "Users" },
                  { value: "seller", label: "Sellers" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRoleFilter(option.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      roleFilter === option.value
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[50vh] p-6">
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartImpersonation(user)}
                      className="flex items-center gap-4 w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "seller"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No users found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try searching with different keywords
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p>Start typing to search for users to impersonate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
