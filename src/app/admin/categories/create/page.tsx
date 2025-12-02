"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import {
  BasicInfoStep,
  MediaStep,
  SeoStep,
  DisplayStep,
} from "@/components/admin/category-wizard";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  FolderTree,
  Image as ImageIcon,
  Search,
  Settings,
  Loader2,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    name: "Basic Info",
    icon: FolderTree,
    description: "Name, parent & description",
  },
  { id: 2, name: "Media", icon: ImageIcon, description: "Image & icon" },
  { id: 3, name: "SEO", icon: Search, description: "Meta tags & slug" },
  {
    id: 4,
    name: "Display Settings",
    icon: Settings,
    description: "Visibility & order",
  },
];

export default function CreateCategoryWizardPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [slugError, setSlugError] = useState("");
  const [categories, setCategories] = useState<CategoryFE[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    parentCategory: "",
    description: "",
    imageUrl: "",
    icon: "📁",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    displayOrder: "0",
    featured: false,
    isActive: true,
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.list({});
        setCategories(response.data || []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateSlug = (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugError("");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
    } else {
      setSlugError("");
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim() || formData.name.length < 2) {
          setError("CategoryFE name must be at least 2 characters");
          return false;
        }
        break;
      case 3:
        if (!formData.slug.trim()) {
          setError("URL slug is required");
          return false;
        }
        if (slugError) {
          setError("Please fix the URL error");
          return false;
        }
        if (formData.metaTitle && formData.metaTitle.length > 60) {
          setError("Meta title must be 60 characters or less");
          return false;
        }
        if (formData.metaDescription && formData.metaDescription.length > 160) {
          setError("Meta description must be 160 characters or less");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);
      setError("");

      const categoryData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        parent_id: formData.parentCategory || null,
        image: formData.imageUrl || undefined,
        icon: formData.icon,
        sort_order: parseInt(formData.displayOrder) || 0,
        is_featured: formData.featured,
        is_active: formData.isActive,
        meta_title: formData.metaTitle || undefined,
        meta_description: formData.metaDescription || undefined,
      };

      await categoriesService.create(categoryData);
      router.push("/admin/categories?created=true");
    } catch (err: any) {
      console.error("Error creating CategoryFE:", err);
      setError(err.message || "Failed to create CategoryFE");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            You do not have permission to access this page. Admin access
            required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Create New CategoryFE
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep > step.id
                        ? "border-green-500 bg-green-500 text-white"
                        : currentStep === step.id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="mt-2 hidden text-xs font-medium text-gray-700 sm:block">
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-16 transition-colors sm:w-24 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData as any}
              categories={categories}
              onChange={(field, value) => handleChange(field as any, value)}
            />
          )}

          {currentStep === 2 && (
            <MediaStep
              formData={formData as any}
              onChange={(field, value) => handleChange(field as any, value)}
            />
          )}

          {currentStep === 3 && (
            <SeoStep
              formData={formData as any}
              slugError={slugError}
              validateSlug={validateSlug}
              onChange={(field, value) => handleChange(field as any, value)}
            />
          )}

          {currentStep === 4 && (
            <DisplayStep
              formData={formData as any}
              categories={categories}
              onChange={(field, value) => handleChange(field as any, value)}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Category
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
