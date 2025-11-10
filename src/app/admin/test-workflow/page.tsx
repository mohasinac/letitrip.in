"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { testDataService } from "@/services/test-data.service";
import {
  Play,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  ShoppingBag,
  Gavel,
  Package,
  Star,
  MessageSquare,
  Store,
  Tag,
  FolderTree,
} from "lucide-react";

interface TestDataCounts {
  products: number;
  auctions: number;
  orders: number;
  reviews: number;
  tickets: number;
  shops: number;
  coupons: number;
  categories: number;
}

export default function TestWorkflowPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TestDataCounts>({
    products: 0,
    auctions: 0,
    orders: 0,
    reviews: 0,
    tickets: 0,
    shops: 0,
    coupons: 0,
    categories: 0,
  });

  // Form states
  const [testUserId, setTestUserId] = useState("");
  const [shopId, setShopId] = useState("");
  const [counts, setCounts] = useState({
    products: 5,
    auctions: 3,
    orders: 2,
    reviews: 4,
    tickets: 2,
    coupons: 3,
  });

  // Status messages
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [workflowStatus, setWorkflowStatus] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await testDataService.getTestDataStatus();
      setStats(data);
    } catch (error: any) {
      console.error("Failed to load status:", error);
    }
  };

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleInitializeShop = async () => {
    if (!testUserId) {
      showMessage("error", "Please enter a test user ID");
      return;
    }

    setLoading(true);
    try {
      const shop = await testDataService.generateTestShop(testUserId);
      setShopId(shop.id || shop.slug);
      showMessage(
        "success",
        `Test shop created successfully! ID: ${shop.id || shop.slug}`
      );
      await loadStatus();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeProducts = async () => {
    if (!testUserId || !shopId) {
      showMessage("error", "Please create a shop first");
      return;
    }

    setLoading(true);
    try {
      await testDataService.generateTestProducts(
        counts.products,
        testUserId,
        shopId
      );
      showMessage(
        "success",
        `${counts.products} test products created successfully!`
      );
      await loadStatus();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to create products");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeAuctions = async () {
    if (!testUserId || !shopId) {
      showMessage("error", "Please create a shop first");
      return;
    }

    setLoading(true);
    try {
      await testDataService.generateTestAuctions(
        counts.auctions,
        testUserId,
        shopId
      );
      showMessage(
        "success",
        `${counts.auctions} test auctions created successfully!`
      );
      await loadStatus();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to create auctions");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeOrders = async () => {
    if (!testUserId) {
      showMessage("error", "Please enter a test user ID");
      return;
    }

    setLoading(true);
    try {
      await testDataService.generateTestOrders(counts.orders, testUserId);
      showMessage(
        "success",
        `${counts.orders} test orders created successfully!`
      );
      await loadStatus();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to create orders");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeTickets = async () {
    if (!testUserId) {
      showMessage("error", "Please enter a test user ID");
      return;
    }

    setLoading(true);
    try {
      await testDataService.generateTestTickets(counts.tickets, testUserId);
      showMessage(
        "success",
        `${counts.tickets} test tickets created successfully!`
      );
      await loadStatus();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to create tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeCategories = async () {
    setLoading(true);
    try {
      await testDataService.generateTestCategories();
      showMessage("success", "Test categories created successfully!");
      await loadStatus();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to create categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL test data? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const deleted = await testDataService.cleanupTestData();
      showMessage(
        "success",
        `Cleanup complete! Deleted: ${Object.values(deleted).reduce((a, b) => a + b, 0)} items`
      );
      setShopId("");
      await loadStatus();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to cleanup test data");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async (workflowType: string) => {
    setWorkflowStatus((prev) => ({ ...prev, [workflowType]: "running" }));
    try {
      await testDataService.executeWorkflow(workflowType, { testUserId });
      setWorkflowStatus((prev) => ({ ...prev, [workflowType]: "success" }));
      showMessage("success", `${workflowType} workflow completed successfully!`);
    } catch (error: any) {
      setWorkflowStatus((prev) => ({ ...prev, [workflowType]: "error" }));
      showMessage("error", error.message || `${workflowType} workflow failed`);
    }
  };

  const workflows = [
    { id: "product-purchase", label: "Product Purchase Flow", icon: ShoppingBag },
    { id: "auction-bidding", label: "Auction Bidding Flow", icon: Gavel },
    { id: "seller-fulfillment", label: "Seller Fulfillment Flow", icon: Package },
    { id: "support-ticket", label: "Support Ticket Flow", icon: MessageSquare },
    { id: "review-moderation", label: "Review Moderation Flow", icon: Star },
  ];

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-600" />
              Test Workflow System
            </h1>
            <p className="text-gray-600 mt-2">
              Generate test data and execute workflows for development and
              testing. All test data is prefixed with TEST_.
            </p>
          </div>

          {/* Message Banner */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : message.type === "error"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Products",
                value: stats.products,
                icon: ShoppingBag,
                color: "blue",
              },
              {
                label: "Auctions",
                value: stats.auctions,
                icon: Gavel,
                color: "purple",
              },
              {
                label: "Orders",
                value: stats.orders,
                icon: Package,
                color: "green",
              },
              {
                label: "Reviews",
                value: stats.reviews,
                icon: Star,
                color: "yellow",
              },
              {
                label: "Tickets",
                value: stats.tickets,
                icon: MessageSquare,
                color: "red",
              },
              { label: "Shops", value: stats.shops, icon: Store, color: "indigo" },
              { label: "Coupons", value: stats.coupons, icon: Tag, color: "pink" },
              {
                label: "Categories",
                value: stats.categories,
                icon: FolderTree,
                color: "teal",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Initialize Data Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Initialize Test Data
              </h2>

              {/* Test User ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test User ID *
                </label>
                <input
                  type="text"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="Enter existing user ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use an existing user ID from your database
                </p>
              </div>

              {/* Shop ID Display */}
              {shopId && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Shop ID:</strong> {shopId}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Create Shop */}
                <button
                  onClick={handleInitializeShop}
                  disabled={loading || !testUserId}
                  className="w-full flex items-center justify-between px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Create Test Shop
                  </span>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                </button>

                {/* Create Categories */}
                <button
                  onClick={handleInitializeCategories}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />
                    Create Test Categories
                  </span>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                </button>

                {/* Products */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={counts.products}
                    onChange={(e) =>
                      setCounts({
                        ...counts,
                        products: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleInitializeProducts}
                    disabled={loading || !shopId}
                    className="flex-1 flex items-center justify-between px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Create Products
                    </span>
                  </button>
                </div>

                {/* Auctions */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={counts.auctions}
                    onChange={(e) =>
                      setCounts({
                        ...counts,
                        auctions: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleInitializeAuctions}
                    disabled={loading || !shopId}
                    className="flex-1 flex items-center justify-between px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      Create Auctions
                    </span>
                  </button>
                </div>

                {/* Orders */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={counts.orders}
                    onChange={(e) =>
                      setCounts({
                        ...counts,
                        orders: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleInitializeOrders}
                    disabled={loading || !testUserId}
                    className="flex-1 flex items-center justify-between px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Create Orders
                    </span>
                  </button>
                </div>

                {/* Tickets */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={counts.tickets}
                    onChange={(e) =>
                      setCounts({
                        ...counts,
                        tickets: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleInitializeTickets}
                    disabled={loading || !testUserId}
                    className="flex-1 flex items-center justify-between px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Create Tickets
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cleanup & Workflows Section */}
            <div className="space-y-6">
              {/* Cleanup Section */}
              <div className="bg-white rounded-lg border border-red-200 p-6">
                <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Cleanup Test Data
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Remove all test data with TEST_ prefix from the database. This
                  action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={loadStatus}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Status
                  </button>
                  <button
                    onClick={handleCleanup}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All
                  </button>
                </div>
              </div>

              {/* Test Workflows Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  Test Workflows
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Execute end-to-end workflows to test system functionality.
                </p>
                <div className="space-y-2">
                  {workflows.map((workflow) => {
                    const status = workflowStatus[workflow.id];
                    const Icon = workflow.icon;
                    return (
                      <button
                        key={workflow.id}
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        disabled={loading || !testUserId || status === "running"}
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-2 text-gray-700">
                          <Icon className="h-4 w-4" />
                          {workflow.label}
                        </span>
                        {status === "running" && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                        {status === "success" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {status === "error" && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
