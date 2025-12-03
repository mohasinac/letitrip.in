"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  demoDataService,
  DemoStep,
  GenerationState,
  StepResult,
  CLEANUP_STEPS,
} from "@/services/demo-data.service";
import {
  DemoStepCard,
  DemoStats,
  DemoCredentials,
  DemoScaleControl,
  DemoActionButtons,
  DemoDeletionResult,
  DemoProgressBar,
  ExtendedSummary,
  CredentialsData,
  StepStatus,
  DeletionBreakdown,
  GENERATION_STEPS,
  CLEANUP_STEP_CONFIG,
  getInitialStepStatuses,
  getEmptySummary,
  DEMO_PREFIX,
} from "./components";

export default function AdminDemoPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cleanupPaused, setCleanupPaused] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<ExtendedSummary | null>(null);
  const [credentials, setCredentials] = useState<CredentialsData | null>(null);
  const [deletionResult, setDeletionResult] = useState<{
    total: number;
    breakdown: DeletionBreakdown[];
  } | null>(null);

  // Refs for async loop control
  const cancelledRef = useRef(false);
  const pausedRef = useRef(false);
  const cleanupPausedRef = useRef(false);

  // Scale control for data generation
  const [scale, setScale] = useState<number>(10);

  // Step-by-step generation state
  const [currentStep, setCurrentStep] = useState<DemoStep | null>(null);
  const [stepStatuses, setStepStatuses] = useState<
    Record<DemoStep, StepStatus>
  >(getInitialStepStatuses());
  const [generationState, setGenerationState] = useState<GenerationState>({});

  // Step-by-step cleanup state
  const [currentCleanupStep, setCurrentCleanupStep] = useState<DemoStep | null>(
    null,
  );
  const [cleanupStepStatuses, setCleanupStepStatuses] = useState<
    Record<DemoStep, StepStatus>
  >(getInitialStepStatuses());

  // Refresh stats function
  const refreshStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await demoDataService.getStats();
      setSummary(
        data.exists && data.summary
          ? (data.summary as ExtendedSummary)
          : getEmptySummary(),
      );
    } catch {
      // Keep existing summary on error
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch existing demo data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const data = await demoDataService.getStats();
        setSummary(
          data.exists && data.summary
            ? (data.summary as ExtendedSummary)
            : getEmptySummary(),
        );
      } catch {
        setSummary(getEmptySummary());
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  // Poll stats during generation
  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(() => {
      refreshStats();
    }, 2000);

    return () => clearInterval(interval);
  }, [generating, refreshStats]);

  const updateStepStatus = useCallback((step: DemoStep, status: StepStatus) => {
    setStepStatuses((prev) => ({ ...prev, [step]: status }));
  }, []);

  const runStep = useCallback(
    async (
      step: DemoStep,
      state: GenerationState,
    ): Promise<{ success: boolean; state: GenerationState }> => {
      setCurrentStep(step);
      updateStepStatus(step, { status: "running" });

      try {
        let result: StepResult;

        switch (step) {
          case "categories":
            result = await demoDataService.generateCategories(scale);
            if (result.success && result.data) {
              state.categoryMap = result.data.categoryMap;
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count,
              });
            }
            break;

          case "users":
            result = await demoDataService.generateUsers(scale);
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
            result = await demoDataService.generateShops(state.sellers, scale);
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
              state.categoryMap,
              scale,
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
              state.productsByShop,
              scale,
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
              state.buyers,
              scale,
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
              state.buyers,
              scale,
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
              state.productsByShop,
              scale,
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
              scale,
            });
            if (result.success && result.data) {
              const totalExtras = Object.values(result.data).reduce(
                (a: number, b: unknown) => a + (typeof b === "number" ? b : 0),
                0,
              );
              updateStepStatus(step, {
                status: "completed",
                count: totalExtras,
              });
            }
            break;

          case "settings":
            result = await demoDataService.generateSettings(scale);
            if (result.success && result.data) {
              updateStepStatus(step, {
                status: "completed",
                count: result.data.count || 1,
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
    [scale, updateStepStatus],
  );

  const handleGenerateAll = async () => {
    try {
      setGenerating(true);
      setPaused(false);
      setCancelled(false);
      pausedRef.current = false;
      cancelledRef.current = false;
      setDeletionResult(null);
      setCredentials(null);
      setStepStatuses(getInitialStepStatuses());

      toast.info("Starting demo data generation...");

      let state: GenerationState = {};

      for (const stepConfig of GENERATION_STEPS) {
        if (cancelledRef.current) {
          toast.warning("Generation cancelled.");
          return;
        }

        while (pausedRef.current && !cancelledRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (cancelledRef.current) {
          toast.warning("Generation cancelled.");
          return;
        }

        const { success, state: newState } = await runStep(
          stepConfig.id,
          state,
        );
        state = newState;

        if (!success) {
          toast.error(
            `Failed at step: ${stepConfig.label}. You can retry from this step.`,
          );
          return;
        }
      }

      setGenerationState(state);
      if (state.credentials) {
        setCredentials(state.credentials as CredentialsData);
      }

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
      setCancelled(false);
      toast.info(`Generating ${step}...`);

      const { success, state } = await runStep(step, generationState);

      if (success) {
        setGenerationState(state);
        if (state.credentials) {
          setCredentials(state.credentials as CredentialsData);
        }
        toast.success(`${step} generated successfully!`);

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

  const updateCleanupStepStatus = useCallback(
    (step: DemoStep, status: StepStatus) => {
      setCleanupStepStatuses((prev) => ({ ...prev, [step]: status }));
    },
    [],
  );

  const runCleanupStep = useCallback(
    async (step: DemoStep): Promise<{ success: boolean; count: number }> => {
      setCurrentCleanupStep(step);
      updateCleanupStepStatus(step, { status: "running" });

      try {
        const result = await demoDataService.cleanupStep(step);
        if (result.success && result.data) {
          updateCleanupStepStatus(step, {
            status: "completed",
            count: result.data.count,
          });
          return { success: true, count: result.data.count };
        } else {
          updateCleanupStepStatus(step, {
            status: "error",
            error: result.error || "Unknown error",
          });
          return { success: false, count: 0 };
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        updateCleanupStepStatus(step, { status: "error", error: message });
        return { success: false, count: 0 };
      }
    },
    [updateCleanupStepStatus],
  );

  const handleStepByStepCleanup = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ALL demo data with ${DEMO_PREFIX} prefix? This will delete data step by step.`,
      )
    ) {
      return;
    }

    setCleaning(true);
    setCancelled(false);
    setCleanupPaused(false);
    cancelledRef.current = false;
    cleanupPausedRef.current = false;
    setDeletionResult(null);
    setCleanupStepStatuses(getInitialStepStatuses());

    toast.info("Starting step-by-step cleanup...");

    let totalDeleted = 0;
    const breakdown: DeletionBreakdown[] = [];

    for (const step of CLEANUP_STEPS) {
      if (cancelledRef.current) {
        toast.warning("Cleanup cancelled by user");
        break;
      }

      while (cleanupPausedRef.current && !cancelledRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (cancelledRef.current) {
        toast.warning("Cleanup cancelled by user");
        break;
      }

      const result = await runCleanupStep(step);

      if (result.success && result.count > 0) {
        totalDeleted += result.count;
        breakdown.push({ collection: step, count: result.count });
      }

      await refreshStats();
    }

    setDeletionResult({ total: totalDeleted, breakdown });

    if (!cancelled) {
      setSummary(getEmptySummary());
      setCredentials(null);
      setGenerationState({});
      setStepStatuses(getInitialStepStatuses());
      toast.success(`Cleanup complete! Deleted ${totalDeleted} documents.`);
    }

    setCleaning(false);
    setCurrentCleanupStep(null);
    setCleanupPaused(false);
  };

  const handleCleanupSingleStep = async (step: DemoStep) => {
    try {
      setCleaning(true);
      setCancelled(false);
      toast.info(`Cleaning ${step}...`);

      const result = await runCleanupStep(step);

      if (result.success) {
        toast.success(
          `${step} cleaned successfully! Deleted ${result.count} items.`,
        );
        await refreshStats();
      } else {
        toast.error(`Failed to clean ${step}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed: ${message}`);
    } finally {
      setCleaning(false);
      setCurrentCleanupStep(null);
    }
  };

  const handlePauseToggle = () => {
    if (generating) {
      const newPaused = !paused;
      setPaused(newPaused);
      pausedRef.current = newPaused;
      toast.info(newPaused ? "Generation paused" : "Generation resuming...");
    } else if (cleaning) {
      const newPaused = !cleanupPaused;
      setCleanupPaused(newPaused);
      cleanupPausedRef.current = newPaused;
      toast.info(newPaused ? "Cleanup paused" : "Cleanup resuming...");
    }
  };

  const handleCancel = () => {
    setCancelled(true);
    cancelledRef.current = true;
    setPaused(false);
    pausedRef.current = false;
    setCleanupPaused(false);
    cleanupPausedRef.current = false;
    toast.info("Cancelling operation...");
  };

  // Calculate progress
  const completedSteps = Object.values(stepStatuses).filter(
    (s) => s.status === "completed",
  ).length;
  const completedCleanupSteps = Object.values(cleanupStepStatuses).filter(
    (s) => s.status === "completed",
  ).length;

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

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Warning Alert */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Step-by-Step Generation
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Generate data incrementally. If something breaks, you can
                  rollback and retry from any step. Each step depends on
                  previous ones.
                </p>
              </div>
            </div>
          </div>

          {/* Scale Control */}
          <DemoScaleControl
            scale={scale}
            onScaleChange={setScale}
            disabled={generating || cleaning}
          />

          {/* Progress Bar */}
          {generating && (
            <DemoProgressBar
              completedSteps={completedSteps}
              totalSteps={GENERATION_STEPS.length}
              label="Generation Progress"
            />
          )}

          {/* Action Buttons */}
          <DemoActionButtons
            generating={generating}
            cleaning={cleaning}
            paused={paused}
            cleanupPaused={cleanupPaused}
            onGenerateAll={handleGenerateAll}
            onPauseToggle={handlePauseToggle}
            onCancel={handleCancel}
            onCleanup={handleStepByStepCleanup}
          />

          {/* Generation Steps */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generation Steps
            </h2>
            <div className="space-y-3">
              {GENERATION_STEPS.map((stepConfig, index) => (
                <DemoStepCard
                  key={stepConfig.id}
                  stepConfig={stepConfig}
                  status={stepStatuses[stepConfig.id]}
                  isActive={currentStep === stepConfig.id}
                  canRun={
                    index === 0 ||
                    stepStatuses[GENERATION_STEPS[index - 1].id]?.status ===
                      "completed"
                  }
                  disabled={generating || cleaning}
                  onRun={handleGenerateSingleStep}
                />
              ))}
            </div>
          </div>

          {/* Cleanup Steps */}
          {cleaning && (
            <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🗑️ Cleanup Steps
                </h2>
              </div>

              <DemoProgressBar
                completedSteps={completedCleanupSteps}
                totalSteps={CLEANUP_STEP_CONFIG.length}
                label="Cleanup Progress"
                color="red"
              />

              <div className="space-y-3 mt-4">
                {CLEANUP_STEP_CONFIG.map((stepConfig) => (
                  <DemoStepCard
                    key={stepConfig.id}
                    stepConfig={stepConfig}
                    status={cleanupStepStatuses[stepConfig.id]}
                    isActive={currentCleanupStep === stepConfig.id}
                    canRun={true}
                    isCleanup
                    disabled={
                      generating || (cleaning && currentCleanupStep !== null)
                    }
                    onRun={handleCleanupSingleStep}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Deletion Result */}
          {deletionResult && (
            <DemoDeletionResult
              total={deletionResult.total}
              breakdown={deletionResult.breakdown}
            />
          )}

          {/* Test Credentials */}
          {credentials && <DemoCredentials credentials={credentials} />}

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
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

        {/* Right Column - Stats */}
        <DemoStats
          summary={summary}
          generating={generating}
          refreshing={refreshing}
          onRefresh={refreshStats}
        />
      </div>
    </div>
  );
}
