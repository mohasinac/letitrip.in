"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categoryFormSchema,
  generateSlugFromName,
} from "@/lib/validations/category";
import type { Category } from "@/types/shared";
import ImageUploader from "./ImageUploader";
import {
  IconPreview,
  getMuiIcon,
} from "@/components/shared/preview/IconPreview";
import { ImagePreview } from "@/components/shared/preview/ImagePreview";
import { FormSection } from "@/components/shared/form/FormSection";
import { FormActions } from "@/components/shared/form/FormActions";
import CategoryService from "@/lib/api/services/category.service";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  category?: Category | null;
  allCategories: Category[];
}

export default function CategoryForm({
  open,
  onClose,
  onSubmit,
  category,
  allCategories,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ["Basic Information", "Optional Details"];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      parentIds: category?.parentIds || [],
      isActive: category?.isActive !== false,
      featured: category?.featured || false,
      sortOrder: category?.sortOrder || 0,
      image: category?.image || "",
      icon: category?.icon || "",
      seo: {
        metaTitle: category?.seo?.metaTitle || "",
        metaDescription: category?.seo?.metaDescription || "",
        keywords: category?.seo?.keywords || [],
        altText: category?.seo?.altText || "",
      },
    },
  });

  const nameValue = watch("name");
  const metaTitleValue = watch("seo.metaTitle");
  const metaDescriptionValue = watch("seo.metaDescription");
  const iconValue = watch("icon");
  const imageValue = watch("image");

  // Reset form when category changes (for edit mode)
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parentIds: category.parentIds || [],
        isActive: category.isActive !== false,
        featured: category.featured || false,
        sortOrder: category.sortOrder || 0,
        image: category.image || "",
        icon: category.icon || "",
        seo: {
          metaTitle: category.seo?.metaTitle || "",
          metaDescription: category.seo?.metaDescription || "",
          keywords: category.seo?.keywords || [],
          altText: category.seo?.altText || "",
        },
      });
    }
  }, [category, reset]);

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setSubmitError(null);
      // If creating new, reset to empty form
      if (!category) {
        reset({
          name: "",
          slug: "",
          description: "",
          parentIds: [],
          isActive: true,
          featured: false,
          sortOrder: 0,
          image: "",
          icon: "",
          seo: {
            metaTitle: "",
            metaDescription: "",
            keywords: [],
            altText: "",
          },
        });
      }
    }
  }, [open, category, reset]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!category && nameValue) {
      const generated = generateSlugFromName(nameValue);
      setValue("slug", generated);
    }
  }, [nameValue, category, setValue]);

  // Auto-generate meta title from name
  useEffect(() => {
    if (!category && !metaTitleValue && nameValue) {
      setValue("seo.metaTitle", nameValue);
    }
  }, [nameValue, metaTitleValue, category, setValue]);

  // Auto-generate meta description from description
  useEffect(() => {
    if (!category && !metaDescriptionValue && nameValue) {
      const description = watch("description");
      if (description) {
        setValue("seo.metaDescription", description.substring(0, 160));
      }
    }
  }, [nameValue, metaDescriptionValue, category, setValue, watch]);

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Check if there's a cropped image waiting to be uploaded
      if ((window as any).__uploadCroppedImage) {
        try {
          await (window as any).__uploadCroppedImage();
          // The image URL will be updated via the ImageUploader's onChange
          // Clean up the global function
          delete (window as any).__uploadCroppedImage;
        } catch (error) {
          console.error("Failed to upload cropped image:", error);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      await onSubmit(data);
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    setActiveStep(0);
    onClose();
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  // Check if step 1 has required fields filled
  const isStep1Valid = () => {
    const nameValue = watch("name");
    const slugValue = watch("slug");
    return (
      nameValue &&
      nameValue.trim().length >= 2 &&
      slugValue &&
      slugValue.trim().length >= 2
    );
  };

  // Filter out current category and its descendants from parent options
  const availableParents = allCategories.filter((cat) => {
    if (category && cat.id === category.id) return false;
    if (category && cat.parentIds?.includes(category.id)) return false;
    return true;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {category ? "Edit Category" : "Create New Category"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {submitError}
              </p>
            </div>
          )}

          {/* Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              {steps.map((label, index) => (
                <React.Fragment key={label}>
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeStep === index
                        ? "bg-blue-500 text-white"
                        : activeStep > index
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <span className="font-medium text-sm">{index + 1}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="h-0.5 w-12 bg-gray-200 dark:bg-gray-700" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Basic Information (Mandatory) */}
            {activeStep === 0 && (
              <>
                <FormSection
                  title="Basic Information"
                  subtitle="Required fields to create a category"
                >
                  {/* Name */}
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category Name *
                        </label>
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., Electronics"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Slug */}
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Slug *
                        </label>
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., buy-electronics"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.slug
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {errors.slug?.message ||
                            'URL-friendly identifier (must start with "buy-")'}
                        </p>
                      </div>
                    )}
                  />

                  {/* Description */}
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Brief category description"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.description
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Parent Categories */}
                  <Controller
                    name="parentIds"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Parent Categories (Optional)
                        </label>
                        <select
                          {...field}
                          multiple
                          value={field.value || []}
                          onChange={(e) => {
                            const selected = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            field.onChange(selected);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.parentIds
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          size={5}
                        >
                          {availableParents.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {"—".repeat(cat.minLevel || 0)} {cat.name}
                            </option>
                          ))}
                        </select>
                        {errors.parentIds && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.parentIds.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Hold Ctrl/Cmd to select multiple parent categories
                        </p>
                      </div>
                    )}
                  />

                  {/* Status */}
                  <div className="flex gap-4 flex-wrap">
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Active
                          </span>
                        </label>
                      )}
                    />

                    <Controller
                      name="featured"
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Featured
                          </span>
                        </label>
                      )}
                    />
                  </div>

                  {/* Sort Order */}
                  <Controller
                    name="sortOrder"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sort Order
                        </label>
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.sortOrder
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {errors.sortOrder?.message ||
                            "Lower numbers appear first"}
                        </p>
                      </div>
                    )}
                  />
                </FormSection>
              </>
            )}

            {/* Step 2: Optional Details */}
            {activeStep === 1 && (
              <>
                <FormSection
                  title="Images & Icons"
                  subtitle="Optional media for the category"
                >
                  {/* Image URL */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Controller
                        name="image"
                        control={control}
                        render={({ field }) => (
                          <ImageUploader
                            value={field.value}
                            onChange={field.onChange}
                            slug={watch("slug")}
                            onError={(error) => {
                              console.error("Image upload error:", error);
                            }}
                          />
                        )}
                      />
                    </div>
                    <div className="pt-2">
                      <ImagePreview imageUrl={imageValue} />
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Controller
                        name="icon"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Icon
                            </label>
                            <input
                              {...field}
                              type="text"
                              placeholder="Material UI icon name or emoji"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                errors.icon
                                  ? "border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            />
                            {errors.icon && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.icon.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="pt-2">
                      <IconPreview iconName={iconValue} />
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="SEO Information"
                  subtitle="Optional SEO metadata"
                >
                  <Controller
                    name="seo.metaTitle"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Meta Title
                        </label>
                        <input
                          {...field}
                          type="text"
                          placeholder="Page title for search engines"
                          maxLength={60}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.seo?.metaTitle
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {errors.seo?.metaTitle?.message ||
                            `${(field.value || "").length}/60 characters`}
                        </p>
                      </div>
                    )}
                  />

                  <Controller
                    name="seo.metaDescription"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Meta Description
                        </label>
                        <textarea
                          {...field}
                          rows={2}
                          placeholder="Page description for search engines"
                          maxLength={160}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.seo?.metaDescription
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {errors.seo?.metaDescription?.message ||
                            `${(field.value || "").length}/160 characters`}
                        </p>
                      </div>
                    )}
                  />

                  <Controller
                    name="seo.altText"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Image Alt Text
                        </label>
                        <input
                          {...field}
                          type="text"
                          placeholder="Alternative text for category image"
                          maxLength={125}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.seo?.altText
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {errors.seo?.altText?.message ||
                            `${(field.value || "").length}/125 characters`}
                        </p>
                      </div>
                    )}
                  />

                  <Controller
                    name="seo.keywords"
                    control={control}
                    render={({ field }) => {
                      const [inputValue, setInputValue] = React.useState("");
                      const keywords = field.value || [];

                      const handleAddKeywords = () => {
                        const input = inputValue.trim();
                        if (!input) return;

                        // Split by commas and process each keyword
                        const newKeywords = input
                          .split(",")
                          .map((kw) => kw.trim())
                          .filter((kw) => kw.length > 0);

                        // Add only unique keywords
                        const uniqueKeywords = [
                          ...new Set([...keywords, ...newKeywords]),
                        ];
                        field.onChange(uniqueKeywords);
                        setInputValue("");
                      };

                      const handleRemoveKeyword = (indexToRemove: number) => {
                        field.onChange(
                          keywords.filter(
                            (_: string, index: number) =>
                              index !== indexToRemove
                          )
                        );
                      };

                      const handleKeyPress = (
                        e: React.KeyboardEvent<HTMLInputElement>
                      ) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeywords();
                        }
                      };

                      return (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            SEO Keywords
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder="Enter keywords separated by commas (e.g., beyblades, metal fusion, toys)"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={handleAddKeywords}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {keywords.map(
                                (keyword: string, index: number) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                  >
                                    {keyword}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveKeyword(index)}
                                      className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Separate multiple keywords with commas for bulk
                            entry. Duplicates will be automatically removed.
                          </p>
                        </div>
                      );
                    }}
                  />
                </FormSection>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {activeStep < steps.length - 1 ? (
              <>
                <button
                  onClick={handleSubmit(handleFormSubmit)}
                  disabled={isSubmitting || !isStep1Valid()}
                  className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Finish
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isStep1Valid()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting || !isStep1Valid()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
