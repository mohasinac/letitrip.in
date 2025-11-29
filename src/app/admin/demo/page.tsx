"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { demoDataService, DemoDataSummary } from "@/services/demo-data.service";

const DEMO_PREFIX = "DEMO_";

export default function AdminDemoPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [summary, setSummary] = useState<DemoDataSummary | null>(null);

  // Fetch existing demo data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const data = await demoDataService.getStats();
        if (data.exists && data.summary) {
          setSummary(data.summary);
        }
      } catch (error: any) {
        // Silently fail - just don't show summary if fetch fails
        console.log("No existing demo data found or fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      toast.info("Starting demo data generation...");

      const data = await demoDataService.generateDemoData();
      setSummary(data.summary);
      toast.success(
        `Demo data generated successfully with ${DEMO_PREFIX} prefix!`,
      );
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCleanupAll = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ALL demo data with ${DEMO_PREFIX} prefix? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setCleaning(true);
      toast.info("Cleaning up demo data...");

      const data = await demoDataService.cleanupAll();
      setSummary(null);
      toast.success(`Cleanup complete! Deleted ${data.deleted} documents.`);
    } catch (error: any) {
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setCleaning(false);
    }
  };

  // Show loading state while fetching existing data
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading demo data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Demo Data Generator
        </h1>
        <p className="text-gray-600">
          Generate comprehensive demo data for testing (all resources prefixed
          with{" "}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {DEMO_PREFIX}
          </code>
          )
        </p>
      </div>

      {/* Warning Alert */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Important Notice
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              All demo data is created with the <strong>{DEMO_PREFIX}</strong>{" "}
              prefix. You can easily clean up all demo resources at any time
              using the "Delete All Demo Data" button below.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleGenerate}
          disabled={generating || cleaning}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
        >
          <Play className={`w-5 h-5 ${generating ? "animate-pulse" : ""}`} />
          {generating ? "Generating..." : "Generate Demo Data"}
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

      {/* Summary Cards */}
      {summary && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Generation Summary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.categories}
                </span>
              </div>
              <p className="text-sm text-gray-600">Categories</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.users}
                </span>
              </div>
              <p className="text-sm text-gray-600">Users</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Store className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.shops}
                </span>
              </div>
              <p className="text-sm text-gray-600">Shops</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.products}
                </span>
              </div>
              <p className="text-sm text-gray-600">Products</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Gavel className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.auctions}
                </span>
              </div>
              <p className="text-sm text-gray-600">Auctions</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.orders}
                </span>
              </div>
              <p className="text-sm text-gray-600">Orders</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.bids}
                </span>
              </div>
              <p className="text-sm text-gray-600">Bids</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.payments}
                </span>
              </div>
              <p className="text-sm text-gray-600">Payments</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-teal-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.shipments}
                </span>
              </div>
              <p className="text-sm text-gray-600">Shipments</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-pink-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {summary.reviews || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Generated At
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(summary.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          What gets generated?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            • 75+ categories with multi-parent structure (15 featured, 12 on
            homepage)
          </li>
          <li>• 10 users (2 sellers, 8 buyers) with addresses</li>
          <li>• 2 shops ({DEMO_PREFIX}CollectorsHub & AnimeLegends)</li>
          <li>• 300 products with real Unsplash images (60% have videos)</li>
          <li>• 60 featured products for homepage display</li>
          <li>• 10 auctions with real images (60% have videos)</li>
          <li>• 324+ bids on auctions</li>
          <li>• 24 orders with full shipping addresses</li>
          <li>• Payment and shipment records</li>
          <li>• Reviews for 60 featured products (2-5 reviews each)</li>
        </ul>
      </div>
    </div>
  );
}
