"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import CategoryForm from "@/components/admin/CategoryForm";
import { categoriesService } from "@/services/categories.service";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "@/lib/error-redirects";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  image?: string;
  is_featured?: boolean;
  show_on_homepage?: boolean;
  is_active?: boolean;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const slug = params?.slug as string;

  // Load category data
  useEffect(() => {
    const loadCategory = async () => {
      if (!slug) return;

      try {
        const categoryData = await categoriesService.getBySlug(slug);
        setCategory(categoryData as any);
      } catch (err: any) {
        console.error("Failed to load category:", err);
        router.push(notFound.category(slug, err));
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) {
      loadCategory();
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
            <p className="text-red-700 mb-4">{error}</p>
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
