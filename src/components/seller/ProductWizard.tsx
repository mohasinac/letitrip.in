/**
 * ProductWizard Component
 * 
 * Multi-step wizard for creating and editing products.
 * 
 * Features:
 * - 4-step non-linear navigation with step indicators
 * - Step 1: Required fields (name, description, price, category)
 * - Step 2: Media (1+ images required)
 * - Step 3: SEO (meta title, description, keywords - inherits from category)
 * - Step 4: Specifications & features
 * - Inline validation with error badges
 * - Always-visible Save/Finish button
 * - Draft save functionality
 * - Mobile responsive
 * 
 * @component ProductWizard
 * @example
 * ```tsx
 * <ProductWizard productId="prod-123" onComplete={() => router.push('/seller/products')} />
 * ```
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ProductFormData {
  // Step 1: Basic Info
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  stock: number;
  sku?: string;
  status: "active" | "inactive";

  // Step 2: Media
  images: string[];
  videos?: string[];

  // Step 3: SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Step 4: Specifications
  specifications?: Record<string, string>;
  features?: string[];
}

interface ProductWizardProps {
  productId?: string;
  onComplete: () => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { id: "electronics", name: "Electronics" },
  { id: "fashion", name: "Fashion" },
  { id: "home", name: "Home & Garden" },
  { id: "books", name: "Books" },
  { id: "sports", name: "Sports" },
];

export default function ProductWizard({
  productId,
  onComplete,
  onCancel,
}: ProductWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    categoryId: "",
    stock: 0,
    status: "active",
    images: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load existing product if editing
  useEffect(() => {
    if (productId) {
      // TODO: Load product data from API
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [productId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!productId && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, productId]);

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Product details",
      isComplete: !!(
        formData.name &&
        formData.description &&
        formData.price &&
        formData.categoryId &&
        formData.stock
      ),
    },
    {
      number: 2,
      title: "Media",
      description: "Images & videos",
      isComplete: formData.images.length > 0,
    },
    {
      number: 3,
      title: "SEO",
      description: "Meta information",
      isComplete: true, // Optional step
    },
    {
      number: 4,
      title: "Specifications",
      description: "Features & specs",
      isComplete: true, // Optional step
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = "Product name is required";
      if (!formData.description)
        newErrors.description = "Description is required";
      if (!formData.price || formData.price <= 0)
        newErrors.price = "Valid price is required";
      if (!formData.categoryId) newErrors.categoryId = "Category is required";
      if (!formData.stock || formData.stock < 0)
        newErrors.stock = "Stock quantity is required";
    }

    if (step === 2) {
      if (formData.images.length === 0)
        newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep || steps[step - 1].isComplete) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateStep(1)) return;
    if (!isDraft && !validateStep(2)) return;

    setIsLoading(true);

    try {
      // TODO: Submit to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onComplete();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = () => {
    // TODO: Open image upload dialog
    const imageUrl = `/products/placeholder-${formData.images.length + 1}.jpg`;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpecification = () => {
    const key = prompt("Enter specification name:");
    if (!key) return;
    const value = prompt("Enter specification value:");
    if (!value) return;

    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const handleRemoveSpecification = (key: string) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.specifications || {};
      return { ...prev, specifications: rest };
    });
  };

  const handleAddFeature = () => {
    const feature = prompt("Enter feature:");
    if (!feature) return;

    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), feature],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {productId ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete all required steps to publish your product
          </p>
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.number)}
                  disabled={
                    step.number > currentStep && !steps[index].isComplete
                  }
                  className={`flex items-center gap-3 ${
                    step.number > currentStep && !steps[index].isComplete
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:opacity-80"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step.number === currentStep
                        ? "bg-blue-600 text-white"
                        : step.isComplete
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step.isComplete && step.number !== currentStep ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      steps[index + 1].isComplete || currentStep > step.number
                        ? "bg-green-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    letitrip.in/buy-product-
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  placeholder="Enter product description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-2 border ${errors.price ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                    placeholder="0"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="compareAtPrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Compare at Price (₹)
                  </label>
                  <input
                    type="number"
                    id="compareAtPrice"
                    value={formData.compareAtPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compareAtPrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${errors.categoryId ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-2 border ${errors.stock ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  id="sku"
                  value={formData.sku || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder="e.g., PROD-001"
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Media */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Media
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Upload at least one image. First image will be the main
                  product image.
                </p>

                {errors.images && (
                  <p className="mb-4 text-sm text-red-500">{errors.images}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Product ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition"
                  >
                    <svg
                      className="w-8 h-8 text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Add Image
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: SEO */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                SEO & Meta Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                These fields are optional. If not provided, they will be
                auto-generated from the product name and category.
              </p>

              <div>
                <label
                  htmlFor="metaTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  value={formData.metaTitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder={`${formData.name || "Product Name"} | Buy Online`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="metaDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  rows={3}
                  value={formData.metaDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder={`Buy ${formData.name || "this product"} online at the best price...`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: 150-160 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="metaKeywords"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Meta Keywords
                </label>
                <input
                  type="text"
                  id="metaKeywords"
                  value={formData.metaKeywords || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separate keywords with commas
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Specifications */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Specifications & Features
              </h2>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specifications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add Specification
                  </button>
                </div>

                {formData.specifications &&
                  Object.keys(formData.specifications).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(formData.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {key}:
                              </span>{" "}
                              <span className="text-gray-600 dark:text-gray-400">
                                {value}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecification(key)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Features
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add Feature
                  </button>
                </div>

                {formData.features && formData.features.length > 0 && (
                  <ul className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {feature}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Finish & Publish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
