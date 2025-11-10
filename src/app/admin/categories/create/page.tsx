"use client";

import { useAuth } from "@/contexts/AuthContext";
import CategoryForm from "@/components/admin/CategoryForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateCategoryPage() {
  const { user, isAdmin, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Admin access check
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Category</h1>
          <p className="mt-2 text-gray-600">
            Add a new category to organize products
          </p>
        </div>

        {/* Form */}
        <CategoryForm mode="create" />
      </div>
    </div>
  );
}
