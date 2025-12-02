"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import SlugInput from "@/components/common/SlugInput";
import { FormInput, FormSelect, FormTextarea } from "@/components/forms";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";

// Step definitions
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

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    parentCategory: "",
    description: "",

    // Step 2: Media
    imageUrl: "",
    icon: "📁",

    // Step 3: SEO
    slug: "",
    metaTitle: "",
    metaDescription: "",

    // Step 4: Display Settings
    displayOrder: "0",
    featured: false,
    isActive: true,
  });

  // Load categories for parent selection
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

  // Validate slug format
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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            You do not have permission to access this page. Admin access
            required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
        {/* Progress Bar */}
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

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Enter the basic details about this CategoryFE
                </p>
              </div>

              {/* CategoryFE Name */}
              <FormInput
                label="CategoryFE Name"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Electronics, Fashion, Home & Garden"
                helperText="Choose a clear, descriptive name for the CategoryFE"
              />

              {/* Parent CategoryFE */}
              <FormSelect
                label="Parent CategoryFE"
                value={formData.parentCategory}
                onChange={(e) => handleChange("parentCategory", e.target.value)}
                placeholder="None (Top Level CategoryFE)"
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                helperText="Select a parent to create a subcategory, or leave empty for a top-level CategoryFE"
              />

              {/* Description */}
              <FormTextarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                placeholder="Brief description of this CategoryFE and what products it includes..."
                helperText={`${formData.description.length}/500 characters`}
              />
            </div>
          )}

          {/* Step 2: Media */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Media & Icon
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add visual elements to make the CategoryFE recognizable
                </p>
              </div>

              {/* CategoryFE Image */}
              <FormInput
                label="CategoryFE Image URL"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                placeholder="https://example.com/CategoryFE-image.jpg"
                helperText="Square image recommended (400x400px or larger)"
              />

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </p>
                  <div className="relative w-full max-w-sm h-48">
                    <OptimizedImage
                      src={formData.imageUrl}
                      alt="CategoryFE preview"
                      fill
                      className="object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Icon */}
              <FormInput
                label="CategoryFE Icon"
                value={formData.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="📁 or icon name"
                maxLength={50}
                helperText="Use emoji or Lucide icon name (e.g., 📱 for Electronics)"
              />

              {/* Icon Preview */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Icon Preview
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{formData.icon}</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">
                      {formData.name || "CategoryFE Name"}
                    </p>
                    <p className="text-blue-600">
                      This is how your icon will appear
                    </p>
                  </div>
                </div>
              </div>

              {/* Icon Suggestions */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Popular Icons
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {[
                    "📱",
                    "👕",
                    "🏠",
                    "⚽",
                    "🎨",
                    "🚗",
                    "📚",
                    "🎮",
                    "🍔",
                    "✈️",
                    "💄",
                    "🔧",
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleChange("icon", emoji)}
                      className="text-2xl p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: SEO */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  SEO Optimization
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Optimize for search engines to improve discoverability
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <SlugInput
                  sourceText={formData.name}
                  value={formData.slug}
                  onChange={(slug: string) => {
                    handleChange("slug", slug);
                    validateSlug(slug);
                  }}
                  prefix="categories/"
                  error={slugError}
                />
              </div>

              {/* Meta Title */}
              <FormInput
                label="Meta Title"
                value={formData.metaTitle}
                onChange={(e) => handleChange("metaTitle", e.target.value)}
                maxLength={60}
                placeholder={`${
                  formData.name || "CategoryFE"
                } - Shop on JustForView`}
                helperText={`${formData.metaTitle.length}/60 characters • Leave empty to use CategoryFE name`}
              />

              {/* Meta Description */}
              <FormTextarea
                label="Meta Description"
                value={formData.metaDescription}
                onChange={(e) =>
                  handleChange("metaDescription", e.target.value)
                }
                maxLength={160}
                rows={3}
                placeholder="Browse our collection of quality products in this CategoryFE..."
                helperText={`${formData.metaDescription.length}/160 characters • Appears in search results`}
              />

              {/* SEO Preview */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Search Engine Preview
                </p>
                <div className="text-sm">
                  <p className="text-blue-600 font-medium truncate">
                    {formData.metaTitle || formData.name || "CategoryFE Name"} -
                    JustForView
                  </p>
                  <p className="text-green-700 text-xs truncate">
                    justforview.in/categories/
                    {formData.slug || "CategoryFE-slug"}
                  </p>
                  <p className="text-gray-600 mt-1 line-clamp-2">
                    {formData.metaDescription ||
                      formData.description ||
                      "CategoryFE description will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Display Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Display Settings
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Control how and where this CategoryFE appears
                </p>
              </div>

              {/* CategoryFE Summary */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-3">
                <h3 className="font-medium text-gray-900">
                  CategoryFE Summary
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">URL:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      /categories/{formData.slug || "slug"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Parent:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.parentCategory
                        ? categories.find(
                            (c) => c.id === formData.parentCategory
                          )?.name
                        : "Top Level"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Icon:</span>
                    <p className="font-medium text-gray-900 mt-1 text-2xl">
                      {formData.icon}
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Order */}
              <FormInput
                label="Display Order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => handleChange("displayOrder", e.target.value)}
                min={0}
                helperText="Lower numbers appear first (0 = highest priority)"
              />

              {/* Visibility Options */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    <span className="font-medium text-gray-900">Active</span>
                    <p className="text-gray-600">
                      Make this CategoryFE visible to customers
                    </p>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleChange("featured", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="featured" className="text-sm">
                    <span className="font-medium text-gray-900">
                      Featured CategoryFE
                    </span>
                    <p className="text-gray-600">
                      Highlight in featured sections and promotions
                    </p>
                  </label>
                </div>
              </div>

              {/* Status Info */}
              {!formData.isActive && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This CategoryFE will be created as inactive. You can
                    activate it later from CategoryFE settings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating CategoryFE..." : "Create CategoryFE"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
