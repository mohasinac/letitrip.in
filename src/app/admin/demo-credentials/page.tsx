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
      className="p-2 hover:bg-gray-100 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === field ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4 text-gray-600" />
      )}
    </button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Demo User Credentials
        </h1>
        <p className="text-gray-600">
          Test accounts for development and testing. All passwords are{" "}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            Demo@123
          </code>
        </p>
      </div>

      {/* Password Toggle */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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

      {/* Seller Accounts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Seller Accounts ({sellerAccounts.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sellerAccounts.map((seller, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    {seller.role}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {seller.name}
                  </h3>
                  <div className="text-sm text-blue-600 mt-1">
                    {seller.shop}
                  </div>
                </div>
                <Store className="w-8 h-8 text-blue-600" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm font-mono">
                      {seller.email}
                    </code>
                    <CopyButton text={seller.email} field={`email-${index}`} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm font-mono">
                      {showPasswords ? defaultPassword : "••••••••"}
                    </code>
                    <CopyButton
                      text={defaultPassword}
                      field={`pass-${index}`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
          <ShoppingBag className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Buyer Accounts ({buyerAccounts.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyerAccounts.map((buyer, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {buyer.name}
                </h3>
                <User className="w-6 h-6 text-green-600" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 px-2 py-1.5 rounded text-xs font-mono truncate">
                      {buyer.email}
                    </code>
                    <CopyButton
                      text={buyer.email}
                      field={`buyer-email-${index}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 px-2 py-1.5 rounded text-xs font-mono">
                      {showPasswords ? defaultPassword : "••••••••"}
                    </code>
                    <CopyButton
                      text={defaultPassword}
                      field={`buyer-pass-${index}`}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Customer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Account */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Account</h2>
        </div>
        <div className="border border-gray-200 rounded-lg p-6 bg-white max-w-md">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Platform Admin
              </h3>
              <div className="text-sm text-gray-500 mt-1">
                Full platform access
              </div>
            </div>
            <User className="w-8 h-8 text-purple-600" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm font-mono">
                  admin@justforview.in
                </code>
                <CopyButton text="admin@justforview.in" field="admin-email" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Password
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm font-mono">
                  {showPasswords ? "Admin@123" : "••••••••"}
                </code>
                <CopyButton text="Admin@123" field="admin-pass" />
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
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
            href="/seller/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
          >
            Seller Dashboard
          </a>
          <a
            href="/admin/dashboard"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors"
          >
            Admin Dashboard
          </a>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">⚠️</div>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Testing Only</h4>
            <p className="text-sm text-yellow-800">
              These credentials are for development and testing purposes only.
              Never use these in production. All demo accounts are prefixed with{" "}
              <code className="bg-yellow-100 px-1 py-0.5 rounded">DEMO_</code>{" "}
              and can be deleted anytime from the demo data management page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
