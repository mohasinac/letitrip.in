"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ShopForm from "@/components/seller/ShopForm";
import type { Shop } from "@/types";

export default function CreateShopPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Partial<Shop>) => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create shop");
      }

      const { shop } = await response.json();

      // Redirect to edit page to handle media uploads
      router.push(`/seller/my-shops/${shop.id}/edit`);
    } catch (err) {
      console.error("Error creating shop:", err);
      setError(err instanceof Error ? err.message : "Failed to create shop");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/seller/my-shops"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Shops
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Shop
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Set up your shop to start selling products
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Quick Start Guide
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Fill in basic shop information (name, slug, description)</li>
            <li>
              • You'll be redirected to the edit page to upload logo and banner
            </li>
            <li>• Complete your shop profile to get verified faster</li>
            <li>
              • Users can create only 1 shop (admins can create unlimited)
            </li>
          </ul>
        </div>

        {/* Shop Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <ShopForm
            onSubmit={handleSubmit}
            isSubmitting={creating}
            mode="create"
          />
        </div>
      </div>
    </div>
  );
}

