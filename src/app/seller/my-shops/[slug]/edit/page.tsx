"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import ShopForm from "@/components/seller/ShopForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { shopsService } from "@/services/shops.service";
import { useAuth } from "@/contexts/AuthContext";
import type { ShopFE } from "@/types/frontend/shop.types";

export default function EditShopPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [shop, setShop] = useState<ShopFE | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (slug) {
      loadShop();
    }
  }, [slug]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const data = await shopsService.getBySlug(slug);
      setShop(data);
    } catch (error) {
      console.error("Failed to load shop:", error);
      alert("Shop not found");
      router.push("/seller/my-shops");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Update the shop
      const updatedShop = await shopsService.update(slug, data);
      setShop(updatedShop);

      alert("Shop updated successfully!");
    } catch (error: any) {
      console.error("Failed to update shop:", error);
      alert(error.message || "Failed to update shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await shopsService.delete(slug);

      alert("Shop deleted successfully");
      router.push("/seller/my-shops");
    } catch (error: any) {
      console.error("Failed to delete shop:", error);
      alert(error.message || "Failed to delete shop. Please try again.");
      setShowDeleteDialog(false);
      setIsDeleting(false);
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/seller/my-shops"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                View Public Shop
              </Link>

              {/* Delete Button (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Shop
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Edit Shop</h1>
              {shop.isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              )}
              {shop.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ⭐ Featured
                </span>
              )}
              {shop.isBanned && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  🚫 Banned
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Update your shop information
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <ShopForm
            shop={shop}
            mode="edit"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Shop Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Products</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {shop.productCount || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Rating</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {shop.rating ? `${shop.rating.toFixed(1)} ⭐` : "No ratings"}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Reviews</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {shop.reviewCount || 0}
            </div>
          </div>
        </div>

        {/* Help Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips for better visibility
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
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
