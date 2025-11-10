"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ShopForm from "@/components/seller/ShopForm";
import { shopsService } from "@/services/shops.service";
import type { Shop } from "@/types";

export default function CreateShopPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<Shop>) => {
    try {
      setIsSubmitting(true);

      // Create the shop
      const newShop = await shopsService.create(data as any);

      // Redirect to edit page after successful creation
      router.push(`/seller/my-shops/${newShop.slug}/edit`);
    } catch (error: any) {
      console.error("Failed to create shop:", error);
      alert(error.message || "Failed to create shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/seller/my-shops"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Shops
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Shop
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Set up your online shop and start selling
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <ShopForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            📝 What happens after creation?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your shop will be created in draft mode</li>
            <li>• You can upload logo and banner images</li>
            <li>• Add products to your shop</li>
            <li>• Submit for verification to go live</li>
          </ul>
        </div>

        {/* Shop Limit Info */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-1">
            ℹ️ Shop Creation Limit
          </h3>
          <p className="text-sm text-yellow-800">
            Regular users can create 1 shop. Need more shops? Contact support to
            upgrade your account.
          </p>
        </div>
      </div>
    </div>
  );
}
