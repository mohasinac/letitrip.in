"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Trash2,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Store,
  Gavel,
  Loader2,
  MessageSquare,
  Star,
  Heart,
  FileText,
  Image,
  CreditCard,
  Truck,
  Tag,
  Ticket,
  Wallet,
  MapPin,
  Settings,
  Bell,
  RotateCcw,
  CheckCircle,
  Key,
  Copy,
  Shield,
  UserCog,
  Headphones,
  XCircle,
  ChevronRight,
  Pause,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  demoDataService,
  DemoDataSummary,
  DemoStep,
  GenerationState,
  StepResult,
} from "@/services/demo-data.service";

const DEMO_PREFIX = "DEMO_";

// Step configuration
const GENERATION_STEPS: {
  id: DemoStep;
  label: string;
  icon: typeof Package;
  description: string;
}[] = [
  {
    id: "categories",
    label: "Categories",
    icon: Tag,
    description: "Create category tree",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Create 100 users with roles",
  },
  { id: "shops", label: "Shops", icon: Store, description: "Create 50 shops" },
  {
    id: "products",
    label: "Products",
    icon: Package,
    description: "Create 1,000 products",
  },
  {
    id: "auctions",
    label: "Auctions",
    icon: Gavel,
    description: "Create 250 auctions",
  },
  {
    id: "bids",
    label: "Bids",
    icon: DollarSign,
    description: "Create 2,500+ bids",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    description: "Create 1,500+ reviews",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    description: "Create orders & payments",
  },
  {
    id: "extras",
    label: "Extras",
    icon: Settings,
    description: "Hero slides, carts, etc.",
  },
];

interface DeletionBreakdown {
  collection: string;
  count: number;
}

interface UserCredential {
  email: string;
  password: string;
  name: string;
}

interface CredentialsData {
  admins: UserCredential[];
  moderators: UserCredential[];
  support: UserCredential[];
  sellers: UserCredential[];
  buyers: UserCredential[];
}

interface StepStatus {
  status: "pending" | "running" | "completed" | "error";
  count?: number;
  error?: string;
}

interface ExtendedSummary extends DemoDataSummary {
  carts?: number;
  cartItems?: number;
  favorites?: number;
  conversations?: number;
  messages?: number;
  media?: number;
  blogPosts?: number;
  blogCategories?: number;
  blogTags?: number;
  heroSlides?: number;
  returns?: number;
  tickets?: number;
  payouts?: number;
  addresses?: number;
  settings?: number;
  featureFlags?: number;
  notifications?: number;
  featuredCategories?: number;
  productsPerShop?: number;
  auctionsPerShop?: number;
  featuredAuctions?: number;
  usersByRole?: {
    admins: number;
    moderators: number;
    support: number;
    sellers: number;
    buyers: number;
  };
}

export default function AdminDemoPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [summary, setSummary] = useState<ExtendedSummary | null>(null);
  const [credentials, setCredentials] = useState<CredentialsData | null>(null);
  const [deletionResult, setDeletionResult] = useState<{
    total: number;
    breakdown: DeletionBreakdown[];
  } | null>(null);

  // Step-by-step generation state
  const [currentStep, setCurrentStep] = useState<DemoStep | null>(null);
  const [stepStatuses, setStepStatuses] = useState<
    Record<DemoStep, StepStatus>
  >({
    categories: { status: "pending" },
    users: { status: "pending" },
    shops: { status: "pending" },
    products: { status: "pending" },
    auctions: { status: "pending" },
    bids: { status: "pending" },
    reviews: { status: "pending" },
    orders: { status: "pending" },
    extras: { status: "pending" },
  });
  const [generationState, setGenerationState] = useState<GenerationState>({});

  // Fetch existing demo data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const data = await demoDataService.getStats();
        // Always set summary - even if no data exists, show 0 values
        setSummary(
          data.exists && data.summary
            ? (data.summary as ExtendedSummary)
            : {
                categories: 0,
                users: 0,
                shops: 0,
                products: 0,
                auctions: 0,
                bids: 0,
                orders: 0,
                payments: 0,
                shipments: 0,
                reviews: 0,
                prefix: "DEMO_",
                createdAt: new Date().toISOString(),
              }
        );
      } catch {
        // On error, show 0 values
        setSummary({
          categories: 0,
          users: 0,
          shops: 0,
          products: 0,
          auctions: 0,
          bids: 0,
          orders: 0,
          payments: 0,
          shipments: 0,
          reviews: 0,
          prefix: "DEMO_",
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const updateStepStatus = useCallback((step: DemoStep, status: StepStatus) => {
    setStepStatuses((prev) => ({ ...prev, [step]: status }));
  }, []);

  const runStep = useCallback(
    async (
      step: DemoStep,
      state: GenerationState
    ): Promise<{ success: boolean; state: GenerationState }> => {
      setCurrentStep(step);
      updateStepStatus(step, { status: "running" });

      try {
        let result: StepResult;

        switch (step) {
          case "categories":
            result = await demoDataService.generateCategories();
            if (result.success && result.data) {
              state.categoryMap = result.data.categoryMap;
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "users":
            result = await demoDataService.generateUsers();
            if (result.success && result.data) {
              state.sellers = result.data.sellers;
              state.buyers = result.data.buyers;
              state.users = [...result.data.sellers, ...result.data.buyers];
              state.credentials = result.data.credentials;
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "shops":
            if (!state.sellers)
              throw new Error("Users must be generated first");
            result = await demoDataService.generateShops(state.sellers);
            if (result.success && result.data) {
              state.shops = result.data.shops;
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "products":
            if (!state.shops || !state.categoryMap)
              throw new Error("Shops and categories required");
            result = await demoDataService.generateProducts(
              state.shops,
              state.categoryMap
            );
            if (result.success && result.data) {
              state.products = result.data.products;
              state.productsByShop = result.data.productsByShop;
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "auctions":
            if (!state.shops || !state.productsByShop)
              throw new Error("Shops and products required");
            result = await demoDataService.generateAuctions(
              state.shops,
              state.productsByShop
            );
            if (result.success && result.data) {
              state.auctions = result.data.auctions;
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "bids":
            if (!state.auctions || !state.buyers)
              throw new Error("Auctions and buyers required");
            result = await demoDataService.generateBids(
              state.auctions,
              state.buyers
            );
            if (result.success && result.data) {
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "reviews":
            if (!state.products || !state.buyers)
              throw new Error("Products and buyers required");
            result = await demoDataService.generateReviews(
              state.products,
              state.buyers
            );
            if (result.success && result.data) {
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "orders":
            if (!state.shops || !state.buyers || !state.productsByShop)
              throw new Error("Shops, buyers and products required");
            result = await demoDataService.generateOrders(
              state.shops,
              state.buyers,
              state.productsByShop
            );
            if (result.success && result.data) {
              updateStepStatus(step, {
                status: "completed",
                count:
                  result.data.orders +
                  result.data.payments +
                  result.data.shipments,
              });
            }
            break;

          case "extras":
            result = await demoDataService.generateExtras({
              shops: state.shops,
              buyers: state.buyers,
              users: state.users,
              products: state.products,
            });
            if (result.success && result.data) {
              const totalExtras = Object.values(result.data).reduce(
                (a: number, b: unknown) => a + (typeof b === "number" ? b : 0),
                0
              );
              updateStepStatus(step, {
                status: "completed",
                count: totalExtras,
              });
            }
            break;

          default:
            throw new Error(`Unknown step: ${step}`);
        }

        if (!result!.success) {
          throw new Error(result!.error || `Failed to generate ${step}`);
        }

        return { success: true, state };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        updateStepStatus(step, { status: "error", error: message });
        return { success: false, state };
      }
    },
    [updateStepStatus]
  );

  const handleGenerateAll = async () => {
    try {
      setGenerating(true);
      setPaused(false);
      setDeletionResult(null);
      setCredentials(null);

      // Reset all steps to pending
      setStepStatuses({
        categories: { status: "pending" },
        users: { status: "pending" },
        shops: { status: "pending" },
        products: { status: "pending" },
        auctions: { status: "pending" },
        bids: { status: "pending" },
        reviews: { status: "pending" },
        orders: { status: "pending" },
        extras: { status: "pending" },
      });

      toast.info("Starting demo data generation...");

      let state: GenerationState = {};

      for (const stepConfig of GENERATION_STEPS) {
        // Check if paused
        if (paused) {
          toast.info("Generation paused. Resume to continue.");
          return;
        }

        const { success, state: newState } = await runStep(
          stepConfig.id,
          state
        );
        state = newState;

        if (!success) {
          toast.error(
            `Failed at step: ${stepConfig.label}. You can retry from this step.`
          );
          return;
        }
      }

      setGenerationState(state);
      if (state.credentials) {
        setCredentials(state.credentials as CredentialsData);
      }

      // Refresh stats
      const data = await demoDataService.getStats();
      if (data.exists && data.summary) {
        setSummary(data.summary as ExtendedSummary);
      }

      setCurrentStep(null);
      toast.success("Demo data generated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Generation failed: ${message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSingleStep = async (step: DemoStep) => {
    try {
      setGenerating(true);
      toast.info(`Generating ${step}...`);

      const { success, state } = await runStep(step, generationState);

      if (success) {
        setGenerationState(state);
        if (state.credentials) {
          setCredentials(state.credentials as CredentialsData);
        }
        toast.success(`${step} generated successfully!`);

        // Refresh stats
        const data = await demoDataService.getStats();
        if (data.exists && data.summary) {
          setSummary(data.summary as ExtendedSummary);
        }
      } else {
        toast.error(`Failed to generate ${step}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed: ${message}`);
    } finally {
      setGenerating(false);
      setCurrentStep(null);
    }
  };

  const handleCleanupAll = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ALL demo data with ${DEMO_PREFIX} prefix? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setCleaning(true);
      toast.info("Cleaning up demo data...");

      const response = await fetch("/api/admin/demo/cleanup-all", {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Reset summary to 0 values instead of null
        setSummary({
          categories: 0,
          users: 0,
          shops: 0,
          products: 0,
          auctions: 0,
          bids: 0,
          orders: 0,
          payments: 0,
          shipments: 0,
          reviews: 0,
          prefix: "DEMO_",
          createdAt: new Date().toISOString(),
        });
        setCredentials(null);
        setGenerationState({});
        setStepStatuses({
          categories: { status: "pending" },
          users: { status: "pending" },
          shops: { status: "pending" },
          products: { status: "pending" },
          auctions: { status: "pending" },
          bids: { status: "pending" },
          reviews: { status: "pending" },
          orders: { status: "pending" },
          extras: { status: "pending" },
        });
        setDeletionResult({
          total: data.deleted,
          breakdown: data.breakdown || [],
        });
        toast.success(`Cleanup complete! Deleted ${data.deleted} documents.`);
      } else {
        throw new Error(data.error || "Cleanup failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Cleanup failed: ${message}`);
    } finally {
      setCleaning(false);
    }
  };

  // Calculate progress
  const completedSteps = Object.values(stepStatuses).filter(
    (s) => s.status === "completed"
  ).length;
  const totalSteps = GENERATION_STEPS.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  // Show loading state while fetching existing data
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading demo data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Collection icon and color mapping
  const collectionConfig: Record<
    string,
    { icon: typeof Package; color: string; label: string }
  > = {
    categories: { icon: Tag, color: "text-purple-600", label: "Categories" },
    users: { icon: Users, color: "text-green-600", label: "Users" },
    shops: { icon: Store, color: "text-blue-600", label: "Shops" },
    products: { icon: Package, color: "text-orange-600", label: "Products" },
    auctions: { icon: Gavel, color: "text-red-600", label: "Auctions" },
    bids: { icon: DollarSign, color: "text-yellow-600", label: "Bids" },
    orders: { icon: ShoppingCart, color: "text-indigo-600", label: "Orders" },
    order_items: {
      icon: Package,
      color: "text-indigo-400",
      label: "Order Items",
    },
    payments: {
      icon: CreditCard,
      color: "text-emerald-600",
      label: "Payments",
    },
    shipments: { icon: Truck, color: "text-cyan-600", label: "Shipments" },
    reviews: { icon: Star, color: "text-amber-600", label: "Reviews" },
    coupons: { icon: Tag, color: "text-pink-600", label: "Coupons" },
    returns: { icon: RotateCcw, color: "text-rose-600", label: "Returns" },
    tickets: { icon: Ticket, color: "text-violet-600", label: "Tickets" },
    payouts: { icon: Wallet, color: "text-lime-600", label: "Payouts" },
    addresses: { icon: MapPin, color: "text-teal-600", label: "Addresses" },
    hero_slides: { icon: Image, color: "text-sky-600", label: "Hero Slides" },
    media: { icon: Image, color: "text-fuchsia-600", label: "Media" },
    blog_posts: {
      icon: FileText,
      color: "text-slate-600",
      label: "Blog Posts",
    },
    favorites: { icon: Heart, color: "text-red-500", label: "Favorites" },
    carts: { icon: ShoppingCart, color: "text-orange-500", label: "Carts" },
    conversations: {
      icon: MessageSquare,
      color: "text-blue-500",
      label: "Conversations",
    },
    messages: {
      icon: MessageSquare,
      color: "text-blue-400",
      label: "Messages",
    },
    settings: { icon: Settings, color: "text-gray-600", label: "Settings" },
    feature_flags: {
      icon: Settings,
      color: "text-gray-500",
      label: "Feature Flags",
    },
    notifications: {
      icon: Bell,
      color: "text-yellow-500",
      label: "Notifications",
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Demo Data Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate comprehensive demo data step-by-step (all resources prefixed
          with{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
            {DEMO_PREFIX}
          </code>
          )
        </p>
      </div>

      {/* Warning Alert */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Step-by-Step Generation
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Generate data incrementally. If something breaks, you can rollback
              and retry from any step. Each step depends on previous ones.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {generating && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generation Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedSteps} / {totalSteps} steps ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={handleGenerateAll}
          disabled={generating || cleaning}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
        >
          <Play className={`w-5 h-5 ${generating ? "animate-pulse" : ""}`} />
          {generating ? "Generating..." : "Generate All"}
        </button>

        <button
          onClick={() => setPaused(!paused)}
          disabled={!generating || cleaning}
          className="flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
        >
          {paused ? (
            <Play className="w-5 h-5" />
          ) : (
            <Pause className="w-5 h-5" />
          )}
          {paused ? "Resume" : "Pause"}
        </button>

        <button
          onClick={handleCleanupAll}
          disabled={generating || cleaning}
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
        >
          <Trash2 className={`w-5 h-5 ${cleaning ? "animate-pulse" : ""}`} />
          {cleaning ? "Cleaning..." : "Delete All Demo Data"}
        </button>
      </div>

      {/* Step-by-Step Progress */}
      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generation Steps
        </h2>
        <div className="space-y-3">
          {GENERATION_STEPS.map((stepConfig, index) => {
            const status = stepStatuses[stepConfig.id];
            const Icon = stepConfig.icon;
            const isActive = currentStep === stepConfig.id;
            const canRun =
              index === 0 ||
              stepStatuses[GENERATION_STEPS[index - 1].id].status ===
                "completed";

            return (
              <div
                key={stepConfig.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : status.status === "completed"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : status.status === "error"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      status.status === "completed"
                        ? "bg-green-500"
                        : status.status === "error"
                        ? "bg-red-500"
                        : status.status === "running"
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {status.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : status.status === "error" ? (
                      <XCircle className="w-5 h-5 text-white" />
                    ) : status.status === "running" ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stepConfig.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {status.status === "error"
                        ? status.error
                        : status.status === "completed" && status.count
                        ? `Created ${status.count.toLocaleString()} items`
                        : stepConfig.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {status.status !== "completed" &&
                    status.status !== "running" && (
                      <button
                        onClick={() => handleGenerateSingleStep(stepConfig.id)}
                        disabled={generating || cleaning || !canRun}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status.status === "error" ? (
                          <RefreshCw className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {status.status === "error" ? "Retry" : "Run"}
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deletion Result */}
      {deletionResult && (
        <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
              Deletion Complete - {deletionResult.total} Documents Deleted
            </h2>
          </div>

          {deletionResult.breakdown.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {deletionResult.breakdown.map((item) => {
                const config = collectionConfig[item.collection] || {
                  icon: Package,
                  color: "text-gray-600",
                  label: item.collection,
                };
                const CollIcon = config.icon;
                return (
                  <div
                    key={item.collection}
                    className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center gap-2"
                  >
                    <CollIcon className={`w-4 h-4 ${config.color}`} />
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.count}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {config.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary Cards - Always visible */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Current Demo Data
        </h2>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Tag}
            color="text-purple-600"
            label="Categories"
            value={summary?.categories || 0}
          />
          <StatCard
            icon={Users}
            color="text-green-600"
            label="Users"
            value={summary?.users || 0}
          />
          <StatCard
            icon={Store}
            color="text-blue-600"
            label="Shops"
            value={summary?.shops || 0}
          />
          <StatCard
            icon={Package}
            color="text-orange-600"
            label="Products"
            value={summary?.products || 0}
          />
          <StatCard
            icon={Gavel}
            color="text-red-600"
            label="Auctions"
            value={summary?.auctions || 0}
          />
          <StatCard
            icon={DollarSign}
            color="text-yellow-600"
            label="Bids"
            value={summary?.bids || 0}
          />
          <StatCard
            icon={ShoppingCart}
            color="text-indigo-600"
            label="Orders"
            value={summary?.orders || 0}
          />
          <StatCard
            icon={CreditCard}
            color="text-emerald-600"
            label="Payments"
            value={summary?.payments || 0}
          />
          <StatCard
            icon={Truck}
            color="text-cyan-600"
            label="Shipments"
            value={summary?.shipments || 0}
          />
          <StatCard
            icon={Star}
            color="text-amber-600"
            label="Reviews"
            value={summary?.reviews || 0}
          />
        </div>

        {summary && summary.categories > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Generated At
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(summary.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Test Credentials Section */}
      {credentials && (
        <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
              Test User Credentials
            </h3>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
            All demo users use the password:{" "}
            <code className="bg-purple-100 dark:bg-purple-800 px-2 py-0.5 rounded font-mono">
              Demo@123
            </code>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CredentialCard
              title="Admin Accounts"
              icon={Shield}
              iconColor="text-red-500"
              users={credentials.admins}
            />
            <CredentialCard
              title="Moderators"
              icon={UserCog}
              iconColor="text-orange-500"
              users={credentials.moderators}
            />
            <CredentialCard
              title="Support Staff"
              icon={Headphones}
              iconColor="text-blue-500"
              users={credentials.support}
            />
            <CredentialCard
              title="Sellers (sample)"
              icon={Store}
              iconColor="text-green-500"
              users={credentials.sellers.slice(0, 5)}
            />
            <CredentialCard
              title="Buyers (sample)"
              icon={Users}
              iconColor="text-purple-500"
              users={credentials.buyers.slice(0, 5)}
            />
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
          What gets generated? (Stress Test Scale)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-300">
          <div>
            <h4 className="font-medium mb-2">Users & Shops:</h4>
            <ul className="space-y-1">
              <li>• 100 users with diverse roles</li>
              <li>• 2 admins, 3 moderators, 5 support</li>
              <li>• 50 sellers, 40 buyers</li>
              <li>• 50 shops (1 per seller)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Products & Auctions:</h4>
            <ul className="space-y-1">
              <li>• 1,000 products (20 per shop)</li>
              <li>• 250 auctions (5 per shop)</li>
              <li>• 2,500+ bids across auctions</li>
              <li>• 1,500+ product reviews</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Extended Data:</h4>
            <ul className="space-y-1">
              <li>• 200+ orders with payments</li>
              <li>• 10 hero slides</li>
              <li>• 30+ support tickets</li>
              <li>• Carts, favorites, notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Credential Card Component
function CredentialCard({
  title,
  icon: Icon,
  iconColor,
  users,
}: {
  title: string;
  icon: typeof Shield;
  iconColor: string;
  users: UserCredential[];
}) {
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success(`Copied: ${email}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      </div>
      <div className="space-y-2">
        {users.map((user, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded p-2"
          >
            <div className="truncate flex-1">
              <span className="text-gray-600 dark:text-gray-400">
                {user.name}
              </span>
              <br />
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {user.email}
              </span>
            </div>
            <button
              onClick={() => copyEmail(user.email)}
              className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Copy email"
            >
              <Copy className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: typeof Package;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}
