/**
 * @fileoverview React Component
 * @module src/app/admin/categories/[slug]/edit/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import CategoryForm from "@/components/admin/CategoryForm";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { notFound } from "@/lib/error-redirects";
import { logError } from "@/lib/firebase-error-logger";
import { categoriesService } from "@/services/categories.service";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Category interface
 * 
 * @interface
 * @description Defines the structure and contract for Category
 */
interface Category {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description?: string;
  /** Parent_id */
  parent_id?: string | null;
  /** Image */
  image?: string;
  /** Is_featured */
  is_featured?: boolean;
  /** Show_on_homepage */
  show_on_homepage?: boolean;
  /** Is_active */
  is_active?: boolean;
  /** Sort_order */
  sort_order?: number;
  /** Meta_title */
  meta_title?: string;
  /** Meta_description */
  meta_description?: string;
}

export default /**
 * Performs edit category page operation
 *
 * @returns {any} The editcategorypage result
 *
 */
function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const {
    /** Is Loading */
    isLoading: loading,
    error,
    /** Data */
    data: category,
    execute,
  } = useLoadingState<Category>({
    /** On Load Error */
    onLoadError: (error) => {
      logError(error, { component: "EditCategoryPage.loadCategory", slug });
      router.push(notFound.category(slug, error));
    },
  });

  /**
 * Performs slug operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The slug result
 *
 */
const slug = params?.slug as string;

  // Load category data
  useEffect(() => {
    if (user && isAdmin && slug) {
      execute(async () => {
        return (await categoriesService.getBySlug(slug)) as any;
      });
    }
  }, [slug, user, isAdmin]);

  // Loading state
  if (authLoading || loading) {
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : String(error)}
            </p>
            <button
              onClick={() => router.push("/admin/categories")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Category not found</p>
          <Link
            href="/admin/categories"
            className="text-blue-600 hover:underline"
          >
            Back to Categories
          </Link>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
          <p className="mt-2 text-gray-600">
            Update category information and settings
          </p>
        </div>

        {/* Form */}
        <CategoryForm mode="edit" initialData={category} />
      </div>
    </div>
  );
}
