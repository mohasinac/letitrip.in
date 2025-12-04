"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageState } from "@/components/common/PageState";
import ShopForm from "@/components/seller/ShopForm";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { shopsService } from "@/services/shops.service";
import type { ShopFE } from "@/types/frontend/shop.types";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditShopPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [shop, setShop] = useState<ShopFE | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  useEffect(() => {
    if (slug) {
      loadShop();
    }
  }, [slug]);

  const loadShop = useCallback(async () => {
    await execute(async () => {
      const data = await shopsService.getBySlug(slug);
      setShop(data);
    });
  }, [slug, execute]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Update the shop
      const updatedShop = await shopsService.update(slug, data);
      setShop(updatedShop);

      toast.success("Shop updated successfully!");
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerShopEdit.handleSubmit",
        slug,
      });
      toast.error(error.message || "Failed to update shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await shopsService.delete(slug);

      toast.success("Shop deleted successfully");
      router.push("/seller/my-shops");
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerShopEdit.handleDelete",
        slug,
      });
      toast.error(error.message || "Failed to delete shop. Please try again.");
      setShowDeleteDialog(false);
      setIsDeleting(false);
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (error) {
    return <PageState.Error message={error.message} onRetry={loadShop} />;
  }

  if (isLoading) {
    return <PageState.Loading message="Loading shop..." />;
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/seller/my-shops"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Shops
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* View Public Shop Button */}
              <Link
                href={`/shops/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Eye className="h-4 w-4" />
                View Public Shop
              </Link>

              {/* Delete Button (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Shop
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Shop
              </h1>
              {shop.isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  ✓ Verified
                </span>
              )}
              {shop.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  ⭐ Featured
                </span>
              )}
              {shop.isBanned && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                  🚫 Banned
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Update your shop information
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ShopForm
            shop={shop}
            mode="edit"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Shop Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Products
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {shop.productCount || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Rating
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {shop.rating ? `${shop.rating.toFixed(1)} ⭐` : "No ratings"}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Reviews
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {shop.reviewCount || 0}
            </div>
          </div>
        </div>

        {/* Help Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            💡 Tips for better visibility
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Add a clear, professional logo</li>
            <li>• Write a detailed description (min 50 characters)</li>
            <li>• Complete all contact information</li>
            <li>• Upload a banner image to showcase your brand</li>
            <li>• Add GST and PAN for business verification</li>
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Shop"
        description={`Are you sure you want to delete "${shop.name}"? This action cannot be undone. All products and data will be permanently removed.`}
        confirmLabel="Delete Shop"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
