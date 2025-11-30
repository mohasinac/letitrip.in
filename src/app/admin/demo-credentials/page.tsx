"use client";

import { useState } from "react";
import {
  Copy,
  CheckCircle,
  User,
  Store,
  ShoppingBag,
  Eye,
  EyeOff,
  Shield,
  Headphones,
  UserCog,
} from "lucide-react";

export default function DemoCredentialsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const defaultPassword = "Demo@123";

  const adminAccounts = [
    {
      name: "Platform Admin",
      email: "admin@justforview.in",
      password: "Admin@123",
      role: "Super Admin",
    },
    {
      name: "DEMO_Admin User",
      email: "demo.admin@justforview.in",
      password: defaultPassword,
      role: "Admin",
    },
  ];

  const moderatorAccounts = [
    {
      name: "DEMO_Moderator 1",
      email: "demo.mod1@justforview.in",
      role: "Moderator",
    },
    {
      name: "DEMO_Moderator 2",
      email: "demo.mod2@justforview.in",
      role: "Moderator",
    },
  ];

  const supportAccounts = [
    {
      name: "DEMO_Support Agent 1",
      email: "demo.support1@justforview.in",
      role: "Support",
    },
    {
      name: "DEMO_Support Agent 2",
      email: "demo.support2@justforview.in",
      role: "Support",
    },
  ];

  const sellerAccounts = [
    {
      name: "DEMO_Alex Chen",
      email: "alex.chen@demo.justforview.in",
      shop: "DEMO_CollectorsHub - TCG & Collectibles",
      role: "Seller 1",
    },
    {
      name: "DEMO_Raj Patel",
      email: "raj.patel@demo.justforview.in",
      shop: "DEMO_Anime Legends - Figure Paradise",
      role: "Seller 2",
    },
    {
      name: "DEMO_Storm Blader",
      email: "storm.blader@demo.justforview.in",
      shop: "DEMO_Beyblade Arena Mumbai",
      role: "Seller 3",
    },
    {
      name: "DEMO_Galaxy Master",
      email: "galaxy.master@demo.justforview.in",
      shop: "DEMO_Metal Fight Stadium Delhi",
      role: "Seller 4",
    },
  ];

  const buyerAccounts = [
    { name: "DEMO_Priya Sharma", email: "priya.sharma@demo.justforview.in" },
    { name: "DEMO_John Smith", email: "john.smith@demo.justforview.in" },
    { name: "DEMO_Maria Garcia", email: "maria.garcia@demo.justforview.in" },
    { name: "DEMO_Kenji Tanaka", email: "kenji.tanaka@demo.justforview.in" },
    { name: "DEMO_Sarah Johnson", email: "sarah.j@demo.justforview.in" },
  ];

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === field ? (
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Demo User Credentials
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test accounts for development and QA testing. All demo passwords are{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
            Demo@123
          </code>
        </p>
      </div>

      {/* Password Toggle */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white"
        >
          {showPasswords ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Passwords
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Passwords
            </>
          )}
        </button>
      </div>

      {/* Admin & Staff Accounts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin & Staff Accounts
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Admin Cards */}
          {adminAccounts.map((admin, index) => (
            <div
              key={`admin-${index}`}
              className="border border-red-200 dark:border-red-800 rounded-lg p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {admin.role}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {admin.name}
                  </h3>
                </div>
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200 truncate">
                      {admin.email}
                    </code>
                    <CopyButton
                      text={admin.email}
                      field={`admin-email-${index}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                      {showPasswords ? admin.password : "••••••••"}
                    </code>
                    <CopyButton
                      text={admin.password}
                      field={`admin-pass-${index}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Moderator Cards */}
          {moderatorAccounts.map((mod, index) => (
            <div
              key={`mod-${index}`}
              className="border border-orange-200 dark:border-orange-800 rounded-lg p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    {mod.role}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mod.name}
                  </h3>
                </div>
                <UserCog className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200 truncate">
                      {mod.email}
                    </code>
                    <CopyButton text={mod.email} field={`mod-email-${index}`} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                      {showPasswords ? defaultPassword : "••••••••"}
                    </code>
                    <CopyButton
                      text={defaultPassword}
                      field={`mod-pass-${index}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Support Cards */}
          {supportAccounts.map((support, index) => (
            <div
              key={`support-${index}`}
              className="border border-blue-200 dark:border-blue-800 rounded-lg p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {support.role}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {support.name}
                  </h3>
                </div>
                <Headphones className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200 truncate">
                      {support.email}
                    </code>
                    <CopyButton
                      text={support.email}
                      field={`support-email-${index}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                      {showPasswords ? defaultPassword : "••••••••"}
                    </code>
                    <CopyButton
                      text={defaultPassword}
                      field={`support-pass-${index}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Accounts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Seller Accounts ({sellerAccounts.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sellerAccounts.map((seller, index) => (
            <div
              key={index}
              className="border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {seller.role}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {seller.name}
                  </h3>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {seller.shop}
                  </div>
                </div>
                <Store className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                      {seller.email}
                    </code>
                    <CopyButton
                      text={seller.email}
                      field={`seller-email-${index}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                      {showPasswords ? defaultPassword : "••••••••"}
                    </code>
                    <CopyButton
                      text={defaultPassword}
                      field={`seller-pass-${index}`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Seller Role
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer Accounts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Buyer Accounts ({buyerAccounts.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyerAccounts.map((buyer, index) => (
            <div
              key={index}
              className="border border-purple-200 dark:border-purple-800 rounded-lg p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {buyer.name}
                </h3>
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono truncate text-gray-800 dark:text-gray-200">
                      {buyer.email}
                    </code>
                    <CopyButton
                      text={buyer.email}
                      field={`buyer-email-${index}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                      {showPasswords ? defaultPassword : "••••••••"}
                    </code>
                    <CopyButton
                      text={defaultPassword}
                      field={`buyer-pass-${index}`}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Customer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
          >
            Go to Login
          </a>
          <a
            href="/admin/demo"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-center transition-colors"
          >
            Generate Demo Data
          </a>
          <a
            href="/seller"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center transition-colors"
          >
            Seller Dashboard
          </a>
          <a
            href="/admin"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors"
          >
            Admin Dashboard
          </a>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">⚠️</div>
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              Testing Only
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              These credentials are for development and testing purposes only.
              Never use these in production. All demo accounts are prefixed with{" "}
              <code className="bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded text-yellow-900 dark:text-yellow-100">
                DEMO_
              </code>{" "}
              and can be deleted anytime from the demo data management page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
