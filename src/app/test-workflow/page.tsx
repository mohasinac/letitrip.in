"use client";

import { useState, useEffect } from "react";
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
  Users,
  Sparkles,
  Home,
  Image,
} from "lucide-react";

interface TestDataCounts {
  users: number;
  products: number;
  auctions: number;
  orders: number;
  reviews: number;
  tickets: number;
  shops: number;
  coupons: number;
  categories: number;
  heroSlides: number;
  featuredProducts: number;
  featuredAuctions: number;
  featuredShops: number;
  homepageItems: number;
}

interface WorkflowStatus {
  name: string;
  status: "idle" | "running" | "success" | "failed" | "partial";
  progress: number;
  currentStep: string;
  results?: any;
  error?: string;
}

const WORKFLOWS = [
  {
    id: "product-purchase",
    name: "Product Purchase Flow",
    description: "Complete customer purchase journey",
    steps: 11,
    icon: "🛒",
    role: "User",
  },
  {
    id: "auction-bidding",
    name: "Auction Bidding Flow",
    description: "Place bids and win auctions",
    steps: 12,
    icon: "🔨",
    role: "User",
  },
  {
    id: "order-fulfillment",
    name: "Order Fulfillment Flow",
    description: "Seller order processing",
    steps: 11,
    icon: "📦",
    role: "Seller",
  },
  {
    id: "support-tickets",
    name: "Support Ticket Flow",
    description: "Customer service interaction",
    steps: 12,
    icon: "🎫",
    role: "User",
  },
  {
    id: "reviews-ratings",
    name: "Reviews & Ratings Flow",
    description: "Post-purchase review submission",
    steps: 12,
    icon: "⭐",
    role: "User",
  },
  {
    id: "advanced-browsing",
    name: "Advanced Browsing Flow",
    description: "Product discovery with filters",
    steps: 15,
    icon: "🔍",
    role: "User",
  },
];

const DEFAULT_WORKFLOW_CONFIG = {
  USERS: {
    CUSTOMER_ID: "test-customer-001",
    SELLER_ID: "test-seller-001",
    ADMIN_ID: "test-admin-001",
  },
  SHOPS: {
    TEST_SHOP_ID: "test-shop-001",
  },
  WORKFLOW_OPTIONS: {
    PAUSE_BETWEEN_STEPS: 500,
    CONTINUE_ON_ERROR: false,
  },
};

export default function TestWorkflowPage() {
  const [activeTab, setActiveTab] = useState<"data" | "workflows">("data");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [stats, setStats] = useState<TestDataCounts>({
    users: 0,
    products: 0,
    auctions: 0,
    orders: 0,
    reviews: 0,
    tickets: 0,
    shops: 0,
    coupons: 0,
    categories: 0,
    heroSlides: 0,
    featuredProducts: 0,
    featuredAuctions: 0,
    featuredShops: 0,
    homepageItems: 0,
  });

  // Workflows state
  const [workflows, setWorkflows] = useState<Record<string, WorkflowStatus>>(
    {}
  );
  const [workflowConfig, setWorkflowConfig] = useState(DEFAULT_WORKFLOW_CONFIG);
  const [showWorkflowConfig, setShowWorkflowConfig] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Configuration
  const [config, setConfig] = useState({
    users: 5,
    shopsPerUser: 1,
    categoriesPerShop: 3,
    productsPerShop: 10,
    auctionsPerShop: 5,
    reviewsPerProduct: 3,
    ordersPerUser: 2,
    ticketsPerUser: 1,
    couponsPerShop: 3,
    featuredPercentage: 30,
    homepagePercentage: 20,
  });

  // Status messages
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/test-data/status");
      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      console.error("Failed to load status:", error);
    }
  };

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleGenerateComplete = async () => {
    if (
      !confirm(
        `This will generate complete dummy data:\n\n` +
          `- ${config.users} dummy users\n` +
          `- ${config.users * config.shopsPerUser} shops\n` +
          `- Categories, products, auctions, reviews, orders\n` +
          `- Featured and homepage items\n\n` +
          `Continue?`
      )
    ) {
      return;
    }

    setLoading(true);
    setGenerating("complete");
    setLogs([]);

    try {
      addLog("Starting complete data generation...");

      const response = await fetch("/api/test-data/generate-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to generate data");
      }

      const data = await response.json();

      addLog(`✓ Generated ${data.stats.users} users`);
      addLog(`✓ Generated ${data.stats.shops} shops`);
      addLog(`✓ Generated ${data.stats.categories} categories`);
      addLog(`✓ Generated ${data.stats.products} products`);
      addLog(`✓ Generated ${data.stats.auctions} auctions`);
      addLog(`✓ Generated ${data.stats.reviews} reviews`);
      addLog(`✓ Generated ${data.stats.orders} orders`);
      addLog(`✓ Generated ${data.stats.tickets} tickets`);
      addLog(`✓ Set ${data.stats.featuredProducts} featured products`);
      addLog(`✓ Set ${data.stats.featuredAuctions} featured auctions`);
      addLog(`✓ Set ${data.stats.homepageItems} homepage items`);

      showMessage("success", "Complete dummy data generated successfully!");
      await loadStatus();
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`);
      showMessage("error", error.message || "Failed to generate complete data");
    } finally {
      setLoading(false);
      setGenerating(null);
    }
  };

  const handleGenerateUsers = async () => {
    setLoading(true);
    setGenerating("users");

    try {
      addLog(`Generating ${config.users} dummy users...`);

      const response = await fetch("/api/test-data/generate-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: config.users }),
      });

      if (!response.ok) throw new Error("Failed to generate users");

      const data = await response.json();
      addLog(`✓ Generated ${data.count} users`);
      showMessage("success", `Generated ${data.count} users successfully!`);
      await loadStatus();
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`);
      showMessage("error", error.message || "Failed to generate users");
    } finally {
      setLoading(false);
      setGenerating(null);
    }
  };

  const handleGenerateCategories = async () => {
    setLoading(true);
    setGenerating("categories");

    try {
      addLog("Generating categories...");

      const response = await fetch("/api/test-data/generate-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to generate categories");

      const data = await response.json();
      addLog(`✓ Generated ${data.count} categories`);
      showMessage(
        "success",
        `Generated ${data.count} categories successfully!`
      );
      await loadStatus();
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`);
      showMessage("error", error.message || "Failed to generate categories");
    } finally {
      setLoading(false);
      setGenerating(null);
    }
  };

  const handleCleanup = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will DELETE ALL test data!\n\n" +
          "This includes:\n" +
          "- All TEST_ prefixed users\n" +
          "- All shops owned by test users\n" +
          "- All products, auctions, reviews, orders\n" +
          "- All test categories and coupons\n\n" +
          "This action CANNOT be undone!\n\n" +
          "Are you absolutely sure?"
      )
    ) {
      return;
    }

    setLoading(true);
    setLogs([]);

    try {
      addLog("Starting cleanup of all test data...");

      const response = await fetch("/api/test-data/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to cleanup data");

      const data = await response.json();

      addLog(`✓ Deleted ${data.deleted.users} users`);
      addLog(`✓ Deleted ${data.deleted.shops} shops`);
      addLog(`✓ Deleted ${data.deleted.products} products`);
      addLog(`✓ Deleted ${data.deleted.auctions} auctions`);
      addLog(`✓ Deleted ${data.deleted.reviews} reviews`);
      addLog(`✓ Deleted ${data.deleted.orders} orders`);
      addLog(`✓ Deleted ${data.deleted.tickets} tickets`);
      addLog(`✓ Deleted ${data.deleted.categories} categories`);

      const total = Object.values(data.deleted).reduce(
        (a: any, b: any) => a + b,
        0
      );
      showMessage("success", `Cleanup complete! Deleted ${total} items.`);
      await loadStatus();
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`);
      showMessage("error", error.message || "Failed to cleanup data");
    } finally {
      setLoading(false);
    }
  };

  // Workflow execution functions
  const runWorkflow = async (workflowId: string) => {
    setWorkflows((prev) => ({
      ...prev,
      [workflowId]: {
        name: WORKFLOWS.find((w) => w.id === workflowId)?.name || workflowId,
        status: "running",
        progress: 0,
        currentStep: "Initializing...",
      },
    }));

    try {
      const response = await fetch(`/api/test-workflows/${workflowId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: workflowConfig }),
      });

      const result = await response.json();

      setWorkflows((prev) => ({
        ...prev,
        [workflowId]: {
          name: WORKFLOWS.find((w) => w.id === workflowId)?.name || workflowId,
          status: result.finalStatus || "success",
          progress: 100,
          currentStep: "Completed",
          results: result,
        },
      }));
    } catch (error: any) {
      setWorkflows((prev) => ({
        ...prev,
        [workflowId]: {
          name: WORKFLOWS.find((w) => w.id === workflowId)?.name || workflowId,
          status: "failed",
          progress: 0,
          currentStep: "Failed",
          error: error.message,
        },
      }));
    }
  };

  const getStatusColor = (status: WorkflowStatus["status"]) => {
    switch (status) {
      case "running":
        return "bg-blue-500";
      case "success":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "partial":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusIcon = (status: WorkflowStatus["status"]) => {
    switch (status) {
      case "running":
        return "⏳";
      case "success":
        return "✅";
      case "failed":
        return "❌";
      case "partial":
        return "⚠️";
      default:
        return "⭕";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="h-8 w-8 text-purple-600" />
            Test Data & Workflow System
          </h1>
          <p className="text-gray-600 mt-2">
            Generate complete dummy data and execute end-to-end test workflows.
            All test data is prefixed with TEST_ for easy identification.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("data")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "data"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📦 Test Data Generation
            </button>
            <button
              onClick={() => setActiveTab("workflows")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "workflows"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🔄 Workflow Execution
            </button>
          </nav>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {[
            {
              label: "Users",
              value: stats.users,
              icon: Users,
              color: "indigo",
            },
            {
              label: "Shops",
              value: stats.shops,
              icon: Store,
              color: "purple",
            },
            {
              label: "Categories",
              value: stats.categories,
              icon: FolderTree,
              color: "teal",
            },
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
              label: "Reviews",
              value: stats.reviews,
              icon: Star,
              color: "yellow",
            },
            {
              label: "Orders",
              value: stats.orders,
              icon: Package,
              color: "green",
            },
            {
              label: "Tickets",
              value: stats.tickets,
              icon: MessageSquare,
              color: "red",
            },
            {
              label: "Coupons",
              value: stats.coupons,
              icon: Tag,
              color: "pink",
            },
            {
              label: "Hero Slides",
              value: stats.heroSlides,
              icon: Image,
              color: "purple",
            },
            {
              label: "Featured",
              value: stats.featuredProducts + stats.featuredAuctions,
              icon: Sparkles,
              color: "orange",
            },
            {
              label: "Homepage",
              value: stats.homepageItems,
              icon: Home,
              color: "cyan",
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Generation Configuration
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Users
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.users}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      users: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shops per User
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={config.shopsPerUser}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      shopsPerUser: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Products per Shop
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={config.productsPerShop}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      productsPerShop: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auctions per Shop
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={config.auctionsPerShop}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      auctionsPerShop: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reviews per Product
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.reviewsPerProduct}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      reviewsPerProduct: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orders per User
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={config.ordersPerUser}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ordersPerUser: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured % (Products/Auctions)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.featuredPercentage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      featuredPercentage: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Homepage % (Show on Homepage)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.homepagePercentage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      homepagePercentage: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGenerateComplete}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                <Sparkles className="h-6 w-6" />
                {generating === "complete" ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Generating Complete Data...
                  </>
                ) : (
                  "Generate Complete Dummy Data"
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateUsers}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Users className="h-4 w-4" />
                  {generating === "users" ? "Generating..." : "Users Only"}
                </button>

                <button
                  onClick={handleGenerateCategories}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  <FolderTree className="h-4 w-4" />
                  {generating === "categories"
                    ? "Generating..."
                    : "Categories Only"}
                </button>
              </div>
            </div>

            {/* Estimated Counts */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Estimated Generation:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                <div>• {config.users} Users</div>
                <div>• {config.users * config.shopsPerUser} Shops</div>
                <div>
                  •{" "}
                  {config.users * config.shopsPerUser * config.productsPerShop}{" "}
                  Products
                </div>
                <div>
                  •{" "}
                  {config.users * config.shopsPerUser * config.auctionsPerShop}{" "}
                  Auctions
                </div>
                <div>
                  • ~
                  {config.users *
                    config.shopsPerUser *
                    config.productsPerShop *
                    config.reviewsPerProduct}{" "}
                  Reviews
                </div>
                <div>• {config.users * config.ordersPerUser} Orders</div>
              </div>
            </div>
          </div>

          {/* Logs & Cleanup Panel */}
          <div className="space-y-6">
            {/* Logs */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Activity Log
              </h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No activity yet...</div>
                ) : (
                  logs.map((log, i) => <div key={i}>{log}</div>)
                )}
              </div>
            </div>

            {/* Cleanup */}
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Danger Zone
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Remove all test data with TEST_ prefix. This action cannot be
                undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={loadStatus}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </button>
                <button
                  onClick={handleCleanup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  {loading ? "Cleaning..." : "Delete All Test Data"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Generation Tab */}
        {activeTab === "data" && (
          <>
            {/* Features List */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                What Gets Generated:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: Users,
                    title: "Dummy Users",
                    desc: "Complete user accounts with realistic data",
                  },
                  {
                    icon: Store,
                    title: "Shops",
                    desc: "Verified and unverified shops with banners",
                  },
                  {
                    icon: FolderTree,
                    title: "Categories",
                    desc: "Hierarchical category structure",
                  },
                  {
                    icon: ShoppingBag,
                    title: "Products",
                    desc: "Products with Unsplash images, variants",
                  },
                  {
                    icon: Gavel,
                    title: "Auctions",
                    desc: "Live and scheduled auctions with bids",
                  },
                  {
                    icon: Star,
                    title: "Reviews",
                    desc: "Verified purchase reviews with ratings",
                  },
                  {
                    icon: Package,
                    title: "Orders",
                    desc: "Orders in various states",
                  },
                  {
                    icon: MessageSquare,
                    title: "Support Tickets",
                    desc: "Open and resolved tickets",
                  },
                  {
                    icon: Tag,
                    title: "Coupons",
                    desc: "Active discount coupons",
                  },
                  {
                    icon: Sparkles,
                    title: "Featured Items",
                    desc: "Featured products and auctions",
                  },
                  {
                    icon: Home,
                    title: "Homepage Items",
                    desc: "Items marked for homepage display",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <feature.icon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Workflows Tab */}
        {activeTab === "workflows" && (
          <div>
            {/* Configuration Panel */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Workflow Configuration
                </h2>
                <button
                  onClick={() => setShowWorkflowConfig(!showWorkflowConfig)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  {showWorkflowConfig ? "Hide" : "Show"} Configuration
                </button>
              </div>

              {showWorkflowConfig && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer ID
                      </label>
                      <input
                        type="text"
                        value={workflowConfig.USERS.CUSTOMER_ID}
                        onChange={(e) =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            USERS: {
                              ...workflowConfig.USERS,
                              CUSTOMER_ID: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seller ID
                      </label>
                      <input
                        type="text"
                        value={workflowConfig.USERS.SELLER_ID}
                        onChange={(e) =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            USERS: {
                              ...workflowConfig.USERS,
                              SELLER_ID: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Workflow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {WORKFLOWS.map((workflow) => {
                const status = workflows[workflow.id];
                return (
                  <div
                    key={workflow.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-4xl">{workflow.icon}</div>
                        {status && (
                          <span className="text-2xl">
                            {getStatusIcon(status.status)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {workflow.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{workflow.steps} steps</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {workflow.role}
                        </span>
                      </div>

                      {status && status.status === "running" && (
                        <div className="text-sm text-blue-600 animate-pulse mb-4">
                          Running...
                        </div>
                      )}

                      {status && status.progress > 0 && (
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getStatusColor(
                                status.status
                              )}`}
                              style={{ width: `${status.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {status.currentStep}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => runWorkflow(workflow.id)}
                          disabled={status?.status === "running"}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                          {status?.status === "running" ? "Running..." : "Run"}
                        </button>
                        {status && (
                          <button
                            onClick={() => setSelectedWorkflow(workflow.id)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            📊
                          </button>
                        )}
                      </div>
                    </div>

                    {status?.error && (
                      <div className="px-6 py-3 bg-red-50 border-t border-red-200">
                        <p className="text-sm text-red-600">{status.error}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Results Modal */}
            {selectedWorkflow && workflows[selectedWorkflow] && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {workflows[selectedWorkflow].name} - Results
                      </h3>
                      <button
                        onClick={() => setSelectedWorkflow(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(
                        workflows[selectedWorkflow].results,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
