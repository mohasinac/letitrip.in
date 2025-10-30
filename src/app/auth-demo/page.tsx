"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  LogIn,
  UserPlus,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AuthDemoPage() {
  const { user, loading, error, login, register, logout } = useAuth();
  const isAuthenticated = !!user;

  // Demo states
  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "roles">(
    "overview",
  );
  const [demoEmail, setDemoEmail] = useState("demo@example.com");
  const [demoPassword, setDemoPassword] = useState("demo123456");

  const handleDemoLogin = async () => {
    try {
      await login(demoEmail, demoPassword);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDemoRegister = async () => {
    try {
      await register("Demo User", demoEmail, demoPassword, "user");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      toast.error("Failed to logout");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "seller":
        return "bg-blue-100 text-blue-800";
      case "user":
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Authentication System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive Firebase-based authentication with email/password,
            phone/OTP, Google OAuth, role-based access control, and secure
            cookie management.
          </p>
        </div>

        {/* Current User Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isAuthenticated ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                {isAuthenticated ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isAuthenticated
                    ? `Welcome, ${user?.name || user?.email}`
                    : "Not Authenticated"}
                </h2>
                <p className="text-gray-600">
                  {isAuthenticated
                    ? `Role: ${user?.role} | Email: ${
                        user?.email || "Not provided"
                      }`
                    : "Please log in to access protected features"}
                </p>
              </div>
            </div>
            {loading && (
              <div className="flex items-center text-blue-600">
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "actions", label: "Actions", icon: Key },
                { id: "roles", label: "Role Demo", icon: Shield },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Authentication Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Mail className="w-6 h-6 text-blue-600 mr-3" />
                        <h4 className="font-medium text-gray-900">
                          Email/Password
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Traditional email and password authentication with
                        validation
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Phone className="w-6 h-6 text-green-600 mr-3" />
                        <h4 className="font-medium text-gray-900">Phone/OTP</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Phone number authentication with SMS OTP verification
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <svg
                          className="w-6 h-6 text-red-600 mr-3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <h4 className="font-medium text-gray-900">
                          Google OAuth
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        One-click authentication using Google accounts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === "actions" && (
              <div className="space-y-6">
                {!isAuthenticated ? (
                  <>
                    {/* Email/Password Demo */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Email/Password Authentication
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={demoEmail}
                            onChange={(e) => setDemoEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={demoPassword}
                            onChange={(e) => setDemoPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDemoLogin}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </button>
                        <button
                          onClick={handleDemoRegister}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      You are logged in!
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-center space-x-4">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === "roles" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Role-based Access Control Demo
                  </h3>

                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Your Current Role
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                              user?.role || "user",
                            )}`}
                          >
                            {user?.role?.toUpperCase()}
                          </span>
                          <span className="text-blue-700">
                            {user?.role === "admin" && "Full system access"}
                            {user?.role === "seller" &&
                              "Can manage products and view orders"}
                            {user?.role === "user" && "Basic user access"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600 mb-4">
                        Please log in to see role-based access control in
                        action.
                      </p>
                      <Link
                        href="/login"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Go to Login Page
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/login"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login Page
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register Page
            </Link>
            <Link
              href="/profile"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Profile Page
            </Link>
            <Link
              href="/auth-demo"
              className="flex items-center justify-center px-4 py-3 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              Auth Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
