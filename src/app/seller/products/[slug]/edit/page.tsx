"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import SlugInput from "@/components/common/SlugInput";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import {
  FormInput,
  FormLabel,
  FormTextarea,
  FormSelect,
} from "@/components/forms";
import { Price } from "@/components/common/values";
import { productsService } from "@/services/products.service";
import type { ProductFE } from "@/types/frontend/product.types";
import { ProductStatus, ProductCondition } from "@/types/shared/common.types";

const STEPS = [
  { id: 1, name: "Basic Info", description: "Name, price, and category" },
  { id: 2, name: "Details", description: "Description and specifications" },
  { id: 3, name: "Inventory", description: "Stock and SKU" },
  { id: 4, name: "Save Changes", description: "Review and update" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductFE | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    categoryId: "",
    description: "",
    stockCount: 0,
    sku: "",
    condition: "new" as ProductCondition,
    status: "draft" as ProductStatus,
  });

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsService.getBySlug(slug);
      setProduct(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        price: data.price,
        categoryId: data.categoryId,
        description: data.description || "",
        stockCount: data.stockCount,
        sku: data.sku || "",
        condition: data.condition || "new",
        status: data.status,
      });
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await productsService.update(slug, formData);
      router.push("/seller/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/seller/products"
          className="rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update product information
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <li
                key={step.id}
                className={`relative flex flex-col items-center cursor-pointer ${
                  index !== STEPS.length - 1 ? "flex-1" : ""
                }`}
                onClick={() => setCurrentStep(step.id)}
                onKeyDown={(e) => e.key === "Enter" && setCurrentStep(step.id)}
                role="button"
                tabIndex={0}
                aria-current={currentStep === step.id ? "step" : undefined}
              >
                {index !== STEPS.length - 1 && (
                  <div
                    className={`absolute left-1/2 top-5 h-0.5 w-full ${
                      currentStep > step.id
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep > step.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : currentStep === step.id
                      ? "border-blue-600 bg-white dark:bg-gray-800 text-blue-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.id
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <FormInput
              id="edit-product-name"
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <SlugInput
              value={formData.slug}
              sourceText={formData.name}
              onChange={(slug: string) => setFormData({ ...formData, slug })}
            />

            <FormInput
              id="edit-product-price"
              label="Price (₹)"
              type="number"
              required
              min={0}
              step={0.01}
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value),
                })
              }
            />

            <div>
              <FormLabel required>Category</FormLabel>
              <CategorySelectorWithCreate
                value={formData.categoryId}
                onChange={(categoryId) =>
                  setFormData({ ...formData, categoryId: categoryId || "" })
                }
                placeholder="Select or create a category"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <FormTextarea
              id="edit-product-description"
              label="Description"
              rows={6}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <FormSelect
              id="edit-product-condition"
              label="Condition"
              required
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as ProductCondition,
                })
              }
              options={[
                { value: "new", label: "New" },
                { value: "refurbished", label: "Refurbished" },
                { value: "used", label: "Used" },
              ]}
            />
          </div>
        )}

        {/* Step 3: Inventory */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <FormInput
              id="edit-product-stock"
              label="Stock Count"
              type="number"
              required
              min={0}
              value={formData.stockCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stockCount: parseInt(e.target.value),
                })
              }
            />

            <FormInput
              id="edit-product-sku"
              label="SKU"
              helperText="Optional product identifier"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />

            <FormSelect
              id="edit-product-status"
              label="Status"
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as ProductStatus,
                })
              }
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
        )}

        {/* Step 4: Save Changes */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Ready to Save
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                Click the button below to save your changes.
              </p>
            </div>

            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formData.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Price
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <Price amount={formData.price} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stock
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formData.stockCount}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {formData.status}
                </dd>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
