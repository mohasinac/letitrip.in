"use client";

import { useState } from "react";

// Test configuration interface (matching test-config.ts structure)
const DEFAULT_CONFIG = {
  USERS: {
    CUSTOMER_ID: "test-customer-001",
    SELLER_ID: "test-seller-001",
    ADMIN_ID: "test-admin-001",
    BIDDER_ID: "test-bidder-001",
  },
  SHOPS: {
    TEST_SHOP_ID: "test-shop-001",
    FEATURED_SHOP_ID: "test-shop-002",
  },
  WORKFLOW_OPTIONS: {
    PAUSE_BETWEEN_STEPS: 500,
    LOG_VERBOSE: true,
    CONTINUE_ON_ERROR: false,
    SKIP_OPTIONAL_STEPS: false,
  },
};

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
    description: "Complete customer purchase journey from browsing to order",
    steps: 11,
    icon: "🛒",
  },
  {
    id: "auction-bidding",
    name: "Auction Bidding Flow",
    description: "Place bids, win auctions, and complete payment",
    steps: 12,
    icon: "🔨",
  },
  {
    id: "order-fulfillment",
    name: "Order Fulfillment Flow",
    description: "Seller order processing from confirmation to delivery",
    steps: 11,
    icon: "📦",
  },
  {
    id: "support-tickets",
    name: "Support Ticket Flow",
    description: "Customer service interaction and resolution",
    steps: 12,
    icon: "🎫",
  },
  {
    id: "reviews-ratings",
    name: "Reviews & Ratings Flow",
    description: "Post-purchase review submission and moderation",
    steps: 12,
    icon: "⭐",
  },
  {
    id: "advanced-browsing",
    name: "Advanced Browsing Flow",
    description: "Product discovery with variants, categories, and filters",
    steps: 15,
    icon: "🔍",
  },
  {
    id: "advanced-auction",
    name: "Advanced Auction Flow",
    description: "Complete auction experience with auto-bidding",
    steps: 14,
    icon: "🏆",
  },
];

export default function TestWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Record<string, WorkflowStatus>>(
    {}
  );
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

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
        body: JSON.stringify({ config }),
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

  const runAllWorkflows = async () => {
    for (const workflow of WORKFLOWS) {
      await runWorkflow(workflow.id);
      // Small delay between workflows
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const updateConfigValue = (path: string, value: any) => {
    const keys = path.split(".");
    const newConfig = { ...config };
    let current: any = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Test Workflows Dashboard
          </h1>
          <p className="text-gray-600">
            Run comprehensive end-to-end test workflows with live monitoring
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Controls</h2>
            <div className="space-x-3">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                {showConfig ? "Hide" : "Show"} Configuration
              </button>
              <button
                onClick={runAllWorkflows}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                ▶️ Run All Workflows
              </button>
            </div>
          </div>

          {/* Configuration Panel */}
          {showConfig && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">
                Test Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* User IDs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={config.USERS.CUSTOMER_ID}
                    onChange={(e) =>
                      updateConfigValue("USERS.CUSTOMER_ID", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="test-customer-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seller ID
                  </label>
                  <input
                    type="text"
                    value={config.USERS.SELLER_ID}
                    onChange={(e) =>
                      updateConfigValue("USERS.SELLER_ID", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="test-seller-001"
                  />
                </div>

                {/* Shop IDs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Shop ID
                  </label>
                  <input
                    type="text"
                    value={config.SHOPS.TEST_SHOP_ID || ""}
                    onChange={(e) =>
                      updateConfigValue("SHOPS.TEST_SHOP_ID", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="test-shop-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bidder ID
                  </label>
                  <input
                    type="text"
                    value={config.USERS.BIDDER_ID}
                    onChange={(e) =>
                      updateConfigValue("USERS.BIDDER_ID", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="test-bidder-001"
                  />
                </div>

                {/* Workflow Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pause Between Steps (ms)
                  </label>
                  <input
                    type="number"
                    value={config.WORKFLOW_OPTIONS.PAUSE_BETWEEN_STEPS}
                    onChange={(e) =>
                      updateConfigValue(
                        "WORKFLOW_OPTIONS.PAUSE_BETWEEN_STEPS",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.WORKFLOW_OPTIONS.CONTINUE_ON_ERROR}
                    onChange={(e) =>
                      updateConfigValue(
                        "WORKFLOW_OPTIONS.CONTINUE_ON_ERROR",
                        e.target.checked
                      )
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Continue on Error
                  </label>
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
                    {status && status.status === "running" && (
                      <span className="animate-pulse text-blue-600">
                        Running...
                      </span>
                    )}
                  </div>

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
                  {JSON.stringify(workflows[selectedWorkflow].results, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
