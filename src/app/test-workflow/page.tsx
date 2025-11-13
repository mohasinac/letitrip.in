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
  {
    id: "seller-coupons",
    name: "Seller Coupon Management",
    description: "Create and manage discount coupons",
    steps: 13,
    icon: "🎫",
    role: "Seller",
  },
  {
    id: "user-profile",
    name: "User Profile Management",
    description: "Update profile and manage addresses",
    steps: 12,
    icon: "👤",
    role: "User",
  },
  {
    id: "wishlist-favorites",
    name: "Wishlist & Favorites",
    description: "Add and manage favorite products",
    steps: 10,
    icon: "❤️",
    role: "User",
  },
  {
    id: "bidding-history",
    name: "Bidding History & Watchlist",
    description: "Track bids and manage auction watchlist",
    steps: 12,
    icon: "📜",
    role: "User",
  },
  {
    id: "seller-dashboard",
    name: "Seller Dashboard & Analytics",
    description: "View metrics and export reports",
    steps: 12,
    icon: "📊",
    role: "Seller",
  },
  {
    id: "seller-returns",
    name: "Seller Returns Management",
    description: "Process returns and refunds",
    steps: 11,
    icon: "↩️",
    role: "Seller",
  },
  {
    id: "admin-blog",
    name: "Admin Blog Management",
    description: "Create and manage blog posts",
    steps: 14,
    icon: "📝",
    role: "Admin",
  },
  {
    id: "admin-hero-slides",
    name: "Admin Hero Slides Management",
    description: "Manage homepage carousel slides",
    steps: 12,
    icon: "🎠",
    role: "Admin",
  },
  {
    id: "admin-returns",
    name: "Admin Returns & Refunds",
    description: "Manage returns and process refunds",
    steps: 13,
    icon: "🔄",
    role: "Admin",
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
  const [testingPublicAPIs, setTestingPublicAPIs] = useState(false);
  const [publicAPIResults, setPublicAPIResults] = useState<any>(null);

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
    heroSlidesCount: 5,
  });

  // Status messages
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const [debugData, setDebugData] = useState<any>(null);
  const [testDataContext, setTestDataContext] = useState<any>(null);
  const [workflowResults, setWorkflowResults] = useState<any[]>([]);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/test-data/status");
      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403 ||
        data.error === "Unauthorized"
      ) {
        setAuthError(true);
        return;
      }

      if (data.success && data.stats) {
        setStats(data.stats);
        setAuthError(false);
      }
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

  const handleDebug = async () => {
    setLoading(true);
    try {
      addLog("Fetching debug data...");
      const response = await fetch("/api/test-data/debug");
      const data = await response.json();

      if (data.success) {
        setDebugData(data.debug);
        addLog("✓ Debug data loaded");
        console.log("Debug Data:", data.debug);
        showMessage("success", "Debug data loaded - check console and logs");
      } else {
        addLog(`✗ Debug failed: ${data.error}`);
        showMessage("error", data.error);
      }
    } catch (error: any) {
      addLog(`✗ Debug error: ${error.message}`);
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateComplete = async () => {
    if (
      !confirm(
        `This will generate complete dummy data:\n\n` +
          `- ${config.users} dummy users\n` +
          `- ${config.users * config.shopsPerUser} shops\n` +
          `- Categories, products, auctions, reviews, orders\n` +
          `- Featured and homepage items\n` +
          `- Test data context for workflows\n\n` +
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

      // Store the context from generation
      if (data.context) {
        setTestDataContext(data.context);
        addLog(
          `✓ Context created: ${data.context.metadata.totalItems} items organized`
        );
        addLog(
          `  - ${data.context.users.all.length} users (${data.context.users.admin.length} admin, ${data.context.users.sellers.length} sellers, ${data.context.users.customers.length} customers)`
        );
        addLog(
          `  - ${data.context.shops.all.length} shops (${data.context.shops.verified.length} verified, ${data.context.shops.featured.length} featured)`
        );
        addLog(
          `  - ${data.context.products.published.length} published products (${data.context.products.inStock.length} in stock)`
        );
        addLog(`  - ${data.context.auctions.live.length} live auctions`);
      } else {
        // Load context separately if not returned
        addLog("Loading test data context...");
        const contextRes = await fetch("/api/test-data/context");
        const contextData = await contextRes.json();

        if (contextData.success) {
          setTestDataContext(contextData.context);
          addLog(
            `✓ Context loaded: ${contextData.context.metadata.totalItems} items organized`
          );
          addLog(`  - ${contextData.context.users.all.length} users`);
          addLog(`  - ${contextData.context.shops.all.length} shops`);
          addLog(
            `  - ${contextData.context.products.published.length} published products`
          );
          addLog(
            `  - ${contextData.context.auctions.live.length} live auctions`
          );
        }
      }

      showMessage(
        "success",
        "Complete dummy data generated successfully! Ready for workflows."
      );
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
  const testPublicAPIs = async () => {
    setTestingPublicAPIs(true);
    setPublicAPIResults(null);

    try {
      addLog("Testing public API access...");

      const response = await fetch("/api/test-workflows/public-access");
      const data = await response.json();

      setPublicAPIResults(data);

      if (data.success) {
        addLog(
          `✓ Public API Test Complete: ${data.summary.passed}/${data.summary.total} passed`
        );
        showMessage("success", data.message);
      } else {
        addLog(`✗ Public API Test Failed: ${data.error}`);
        showMessage("error", data.error);
      }
    } catch (error: any) {
      addLog(`✗ Error testing public APIs: ${error.message}`);
      showMessage("error", error.message || "Failed to test public APIs");
    } finally {
      setTestingPublicAPIs(false);
    }
  };

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

    addLog(`Starting workflow: ${workflowId}`);

    try {
      // Use stored context if available, otherwise fetch from API
      let context = testDataContext;

      if (!context) {
        addLog("Loading test data context...");
        const contextRes = await fetch("/api/test-data/context");
        const contextData = await contextRes.json();

        if (
          !contextData.success ||
          contextData.context.metadata.totalItems === 0
        ) {
          throw new Error(
            "No test data available. Please generate test data first."
          );
        }

        context = contextData.context;
        setTestDataContext(context);
        addLog(`✓ Context loaded: ${context.metadata.totalItems} items`);
      } else {
        addLog(`✓ Using stored context: ${context.metadata.totalItems} items`);
      }

      // Execute workflow with shared context
      const response = await fetch(`/api/test-workflows/${workflowId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: workflowConfig,
          context: context,
        }),
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

      // Add to workflow results for combined display
      setWorkflowResults((prev) => [
        {
          id: workflowId,
          name: WORKFLOWS.find((w) => w.id === workflowId)?.name || workflowId,
          status: result.finalStatus || "success",
          timestamp: new Date().toISOString(),
          result: result,
        },
        ...prev,
      ]);

      addLog(`✓ Workflow ${workflowId} completed: ${result.finalStatus}`);
      showMessage("success", `Workflow ${workflowId} completed successfully!`);
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

      // Add failed workflow to results
      setWorkflowResults((prev) => [
        {
          id: workflowId,
          name: WORKFLOWS.find((w) => w.id === workflowId)?.name || workflowId,
          status: "failed",
          timestamp: new Date().toISOString(),
          result: {
            error: error.message,
            message: error.message.includes("Unauthorized")
              ? "Authentication required. Please ensure you're logged in as an admin."
              : error.message,
          },
        },
        ...prev,
      ]);

      addLog(`✗ Workflow ${workflowId} failed: ${error.message}`);
      showMessage("error", error.message);
    }
  };

  const runAllWorkflows = async () => {
    if (!confirm("This will run all workflows sequentially. Continue?")) return;

    setLoading(true);
    setWorkflowResults([]); // Clear previous results
    addLog("Starting batch workflow execution...");

    for (const workflow of WORKFLOWS) {
      await runWorkflow(workflow.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setLoading(false);
    addLog("✓ All workflows completed");
    showMessage("success", "All workflows execution completed!");
  };

  const generateAndRunWorkflow = async (workflowId: string) => {
    if (
      !confirm(
        "This will:\n1. Generate fresh test data\n2. Run the workflow\n3. Optionally cleanup after\n\nContinue?"
      )
    ) {
      return;
    }

    setLoading(true);
    setLogs([]);
    addLog("Starting managed workflow execution...");

    try {
      const response = await fetch("/api/test-workflows/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAndRun",
          workflowIds: [workflowId],
          config,
          cleanupBefore: true,
          cleanupAfter: false,
        }),
      });

      const result = await response.json();

      result.results.steps.forEach((step: any) => {
        addLog(`${step.success ? "✓" : "✗"} ${step.step}`);
      });

      if (result.success) {
        showMessage("success", "Workflow completed successfully!");
        await loadStatus();
      } else {
        showMessage("error", "Workflow failed. Check logs for details.");
      }
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`);
      showMessage("error", error.message);
    } finally {
      setLoading(false);
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

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-6 p-6 bg-red-50 border-2 border-red-300 rounded-xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  🔒 Authentication Required
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  This page requires admin authentication. You're seeing an
                  "Unauthorized" error because you're not logged in as an admin
                  user.
                </p>
                <div className="bg-white p-4 rounded-lg border border-red-200 mb-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    To access this page:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-red-800">
                    <li>
                      Navigate to{" "}
                      <code className="px-2 py-1 bg-red-100 rounded">
                        /login
                      </code>
                    </li>
                    <li>Login with an admin account</li>
                    <li>Return to this page</li>
                  </ol>
                </div>
                <div className="flex gap-3">
                  <a
                    href="/login"
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 shadow-md"
                  >
                    Go to Login
                  </a>
                  <button
                    onClick={loadStatus}
                    className="px-6 py-3 bg-white border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Context Status & Quick Actions Panel */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-300 rounded-xl shadow-lg overflow-hidden">
          {testDataContext ? (
            <>
              {/* Context Active - Show Details & Quick Actions */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        🎯 Test Data Context Ready
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Context loaded with{" "}
                        {testDataContext.metadata.totalItems} organized items •
                        Ready for workflow execution
                      </p>

                      {/* Context Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-2xl font-bold text-indigo-600">
                            {testDataContext.users.all.length}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Users
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {testDataContext.users.admin.length} admin •{" "}
                            {testDataContext.users.sellers.length} sellers •{" "}
                            {testDataContext.users.customers.length} customers
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">
                            {testDataContext.shops.all.length}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Shops
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {testDataContext.shops.verified.length} verified •{" "}
                            {testDataContext.shops.featured.length} featured
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {testDataContext.products.published.length}
                          </div>
                          <div className="text-xs text-gray-600">
                            Published Products
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {testDataContext.products.inStock.length} in stock •{" "}
                            {testDataContext.products.featured.length} featured
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {testDataContext.auctions.live.length}
                          </div>
                          <div className="text-xs text-gray-600">
                            Live Auctions
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {testDataContext.auctions.scheduled.length}{" "}
                            scheduled •{" "}
                            {testDataContext.auctions.featured.length} featured
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTestDataContext(null);
                      showMessage(
                        "info",
                        "Context cleared. Will reload from database on next workflow run."
                      );
                    }}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear Context
                  </button>
                </div>

                {/* Workflow Results Display */}
                {workflowResults.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Recent Workflow Executions ({workflowResults.length})
                      </h4>
                      <button
                        onClick={() => setWorkflowResults([])}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear Results
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {workflowResults.slice(0, 5).map((wr, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            wr.status === "success"
                              ? "bg-green-50 border-green-200"
                              : wr.status === "partial"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {wr.status === "success"
                                  ? "✅"
                                  : wr.status === "partial"
                                  ? "⚠️"
                                  : "❌"}
                              </span>
                              <div>
                                <div className="font-medium text-sm text-gray-900">
                                  {wr.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(wr.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                wr.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : wr.status === "partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {wr.status}
                            </span>
                          </div>

                          {wr.result.summary && (
                            <div className="text-xs text-gray-700 mt-2 pl-7">
                              <div className="flex items-center gap-4">
                                <span>✓ {wr.result.summary.passed} passed</span>
                                <span>✗ {wr.result.summary.failed} failed</span>
                                <span>
                                  ⊘ {wr.result.summary.skipped} skipped
                                </span>
                                <span className="text-gray-500">
                                  {wr.result.summary.duration}ms
                                </span>
                              </div>
                            </div>
                          )}

                          {wr.result.message && (
                            <div className="text-xs text-gray-600 mt-1 pl-7">
                              {wr.result.message}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {workflowResults.length > 5 && (
                      <div className="mt-2 text-center text-xs text-gray-500">
                        Showing 5 of {workflowResults.length} results
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-purple-200">
                  <button
                    onClick={runAllWorkflows}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Running All Workflows...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Run All {WORKFLOWS.length} Workflows
                      </>
                    )}
                  </button>

                  <button
                    onClick={testPublicAPIs}
                    disabled={testingPublicAPIs}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-md"
                  >
                    {testingPublicAPIs ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Testing APIs...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Test Public APIs
                      </>
                    )}
                  </button>

                  <button
                    onClick={async () => {
                      addLog("Reloading test data context...");
                      const contextRes = await fetch("/api/test-data/context");
                      const contextData = await contextRes.json();
                      if (contextData.success) {
                        setTestDataContext(contextData.context);
                        showMessage(
                          "success",
                          `Context reloaded: ${contextData.context.metadata.totalItems} items`
                        );
                      }
                    }}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Reload Context
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* No Context - Show Generate Prompt */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      No Test Data Context Available
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate test data first to create an organized context
                      for workflows, or load existing test data.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleGenerateComplete}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-md"
                      >
                        <Sparkles className="h-5 w-5" />
                        {loading ? "Generating..." : "Generate Test Data"}
                      </button>

                      <button
                        onClick={async () => {
                          addLog("Loading existing test data context...");
                          const contextRes = await fetch(
                            "/api/test-data/context"
                          );
                          const contextData = await contextRes.json();
                          if (
                            contextData.success &&
                            contextData.context.metadata.totalItems > 0
                          ) {
                            setTestDataContext(contextData.context);
                            showMessage(
                              "success",
                              `Context loaded: ${contextData.context.metadata.totalItems} items`
                            );
                          } else {
                            showMessage(
                              "error",
                              "No test data found. Please generate test data first."
                            );
                          }
                        }}
                        className="px-6 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 font-medium flex items-center gap-2"
                      >
                        <Database className="h-5 w-5" />
                        Load Existing Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

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
                {stat.value ?? 0}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Slides Count
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={config.heroSlidesCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      heroSlidesCount: parseInt(e.target.value) || 5,
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
                  onClick={handleDebug}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  <AlertCircle className="h-4 w-4" />
                  Debug Data Check
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

            {/* Debug Data Display */}
            {debugData && (
              <div className="bg-white rounded-lg border border-blue-200 p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-4">
                  Debug Results
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Prefix:</span>{" "}
                    {debugData.prefix}
                  </div>
                  <div>
                    <span className="font-semibold">Counts:</span>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(debugData.counts, null, 2)}
                    </pre>
                  </div>
                  {debugData.errors.length > 0 && (
                    <div>
                      <span className="font-semibold text-red-600">
                        Errors:
                      </span>
                      <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto">
                        {JSON.stringify(debugData.errors, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Sample Data:</span>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(debugData.samples, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
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
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Execution Section */}
        <div>
          {/* Public API Test Panel */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  🌐 Public API Access Test
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Verify that public pages work without authentication
                </p>
              </div>
              <button
                onClick={testPublicAPIs}
                disabled={testingPublicAPIs}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {testingPublicAPIs ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Test Public APIs
                  </>
                )}
              </button>
            </div>

            {publicAPIResults && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Test Results:</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      publicAPIResults.summary.passed ===
                      publicAPIResults.summary.total
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {publicAPIResults.summary.passRate} Pass Rate
                  </span>
                </div>

                <div className="space-y-2">
                  {publicAPIResults.results.map((result: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded ${
                        result.success
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium text-sm">
                          {result.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span
                          className={
                            result.success ? "text-green-700" : "text-red-700"
                          }
                        >
                          Status: {result.status}
                        </span>
                        <span className="text-gray-500">
                          {result.duration}ms
                        </span>
                        {result.dataCount > 0 && (
                          <span className="text-gray-500">
                            {result.dataCount} items
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  {publicAPIResults.message}
                </p>
              </div>
            )}
          </div>

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

          {/* Batch Execution Panel */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  🚀 Batch Workflow Execution
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Run all workflows sequentially with managed test data
                </p>
              </div>
              <button
                onClick={runAllWorkflows}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run All Workflows
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-gray-800 mb-3">
                Execution Flow:
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Load existing test data context
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Execute each workflow with shared context
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  Generate comprehensive report
                </li>
              </ol>
              <p className="mt-3 text-xs text-gray-500">
                💡 Tip: Generate test data first, then run workflows to use that
                data
              </p>
            </div>
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
                      <button
                        onClick={() => generateAndRunWorkflow(workflow.id)}
                        disabled={status?.status === "running" || loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        title="Generate data and run"
                      >
                        🔄
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
      </div>
    </div>
  );
}
