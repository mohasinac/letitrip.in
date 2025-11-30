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
} from "lucide-react";
import { toast } from "sonner";
import { demoDataService, DemoDataSummary } from "@/services/demo-data.service";

const DEMO_PREFIX = "DEMO_";

interface DeletionBreakdown {
  collection: string;
  count: number;
}

interface ExtendedSummary extends DemoDataSummary {
  // Additional fields from generation
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
}

export default function AdminDemoPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [summary, setSummary] = useState<ExtendedSummary | null>(null);
  const [deletionResult, setDeletionResult] = useState<{
    total: number;
    breakdown: DeletionBreakdown[];
  } | null>(null);

  // Fetch existing demo data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const data = await demoDataService.getStats();
        if (data.exists && data.summary) {
          setSummary(data.summary as ExtendedSummary);
        }
      } catch (error: unknown) {
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
      setDeletionResult(null);
      toast.info("Starting demo data generation...");

      const data = await demoDataService.generateDemoData();
      setSummary(data.summary as ExtendedSummary);
      toast.success(
        `Demo data generated successfully with ${DEMO_PREFIX} prefix!`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Generation failed: ${message}`);
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

      const response = await fetch("/api/admin/demo/cleanup-all", {
        method: "DELETE",
      });
      const data = await response.json();
      
      if (data.success) {
        setSummary(null);
        setDeletionResult({
          total: data.deleted,
          breakdown: data.breakdown || [],
        });
        toast.success(`Cleanup complete! Deleted ${data.deleted} documents.`);
      } else {
        throw new Error(data.error || "Cleanup failed");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Cleanup failed: ${message}`);
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
            <p className="text-gray-600 dark:text-gray-400">Loading demo data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Collection icon and color mapping
  const collectionConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
    categories: { icon: Tag, color: "text-purple-600", label: "Categories" },
    users: { icon: Users, color: "text-green-600", label: "Users" },
    shops: { icon: Store, color: "text-blue-600", label: "Shops" },
    products: { icon: Package, color: "text-orange-600", label: "Products" },
    auctions: { icon: Gavel, color: "text-red-600", label: "Auctions" },
    bids: { icon: DollarSign, color: "text-yellow-600", label: "Bids" },
    orders: { icon: ShoppingCart, color: "text-indigo-600", label: "Orders" },
    order_items: { icon: Package, color: "text-indigo-400", label: "Order Items" },
    payments: { icon: CreditCard, color: "text-emerald-600", label: "Payments" },
    shipments: { icon: Truck, color: "text-cyan-600", label: "Shipments" },
    reviews: { icon: Star, color: "text-amber-600", label: "Reviews" },
    coupons: { icon: Tag, color: "text-pink-600", label: "Coupons" },
    returns: { icon: RotateCcw, color: "text-rose-600", label: "Returns" },
    tickets: { icon: Ticket, color: "text-violet-600", label: "Tickets" },
    payouts: { icon: Wallet, color: "text-lime-600", label: "Payouts" },
    addresses: { icon: MapPin, color: "text-teal-600", label: "Addresses" },
    hero_slides: { icon: Image, color: "text-sky-600", label: "Hero Slides" },
    media: { icon: Image, color: "text-fuchsia-600", label: "Media" },
    blog_posts: { icon: FileText, color: "text-slate-600", label: "Blog Posts" },
    blog_categories: { icon: Tag, color: "text-slate-500", label: "Blog Categories" },
    blog_tags: { icon: Tag, color: "text-slate-400", label: "Blog Tags" },
    favorites: { icon: Heart, color: "text-red-500", label: "Favorites" },
    carts: { icon: ShoppingCart, color: "text-orange-500", label: "Carts" },
    cart_items: { icon: Package, color: "text-orange-400", label: "Cart Items" },
    conversations: { icon: MessageSquare, color: "text-blue-500", label: "Conversations" },
    messages: { icon: MessageSquare, color: "text-blue-400", label: "Messages" },
    settings: { icon: Settings, color: "text-gray-600", label: "Settings" },
    feature_flags: { icon: Settings, color: "text-gray-500", label: "Feature Flags" },
    notifications: { icon: Bell, color: "text-yellow-500", label: "Notifications" },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Demo Data Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate comprehensive demo data for testing (all resources prefixed
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
              Important Notice
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
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
                const Icon = config.icon;
                return (
                  <div
                    key={item.collection}
                    className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center gap-2"
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{item.count}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{config.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Current Demo Data
          </h2>

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <StatCard icon={Tag} color="text-purple-600" label="Categories" value={summary.categories} />
            <StatCard icon={Users} color="text-green-600" label="Users" value={summary.users} />
            <StatCard icon={Store} color="text-blue-600" label="Shops" value={summary.shops} />
            <StatCard icon={Package} color="text-orange-600" label="Products" value={summary.products} />
            <StatCard icon={Gavel} color="text-red-600" label="Auctions" value={summary.auctions} />
            <StatCard icon={DollarSign} color="text-yellow-600" label="Bids" value={summary.bids} />
            <StatCard icon={ShoppingCart} color="text-indigo-600" label="Orders" value={summary.orders} />
            <StatCard icon={CreditCard} color="text-emerald-600" label="Payments" value={summary.payments} />
            <StatCard icon={Truck} color="text-cyan-600" label="Shipments" value={summary.shipments} />
            <StatCard icon={Star} color="text-amber-600" label="Reviews" value={summary.reviews || 0} />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {summary.carts && <MiniStatCard icon={ShoppingCart} label="Carts" value={summary.carts} />}
            {summary.favorites && <MiniStatCard icon={Heart} label="Favorites" value={summary.favorites} />}
            {summary.conversations && <MiniStatCard icon={MessageSquare} label="Conversations" value={summary.conversations} />}
            {summary.messages && <MiniStatCard icon={MessageSquare} label="Messages" value={summary.messages} />}
            {summary.heroSlides && <MiniStatCard icon={Image} label="Hero Slides" value={summary.heroSlides} />}
            {summary.blogPosts && <MiniStatCard icon={FileText} label="Blog Posts" value={summary.blogPosts} />}
            {summary.returns && <MiniStatCard icon={RotateCcw} label="Returns" value={summary.returns} />}
            {summary.tickets && <MiniStatCard icon={Ticket} label="Tickets" value={summary.tickets} />}
            {summary.payouts && <MiniStatCard icon={Wallet} label="Payouts" value={summary.payouts} />}
            {summary.addresses && <MiniStatCard icon={MapPin} label="Addresses" value={summary.addresses} />}
            {summary.notifications && <MiniStatCard icon={Bell} label="Notifications" value={summary.notifications} />}
            {summary.media && <MiniStatCard icon={Image} label="Media" value={summary.media} />}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Generated At
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(summary.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Info Section - Always visible */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
          What gets generated?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
          <div>
            <h4 className="font-medium mb-2">Core Data:</h4>
            <ul className="space-y-1">
              <li>• 75+ categories with multi-parent structure</li>
              <li>• 10 users (2 sellers, 8 buyers) with addresses</li>
              <li>• 2 shops ({DEMO_PREFIX}CollectorsHub & AnimeLegends)</li>
              <li>• 100 products with real Unsplash images</li>
              <li>• 10 auctions with real images (60% have videos)</li>
              <li>• 324+ bids on auctions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Extended Data:</h4>
            <ul className="space-y-1">
              <li>• 24 orders with full shipping addresses</li>
              <li>• Payment and shipment records</li>
              <li>• Reviews for all products (2-7 each)</li>
              <li>• Carts, favorites, and wishlists</li>
              <li>• Conversations and messages</li>
              <li>• Returns, tickets, payouts</li>
              <li>• Hero slides, blog posts, media</li>
              <li>• Notifications and addresses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  color, 
  label, 
  value 
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
          {value}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

// Mini Stat Card Component
function MiniStatCard({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: typeof Package; 
  label: string; 
  value: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
