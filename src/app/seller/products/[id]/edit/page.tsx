"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import SlugInput from "@/components/common/SlugInput";
import { productsService } from "@/services/products.service";

const STEPS = [
  { id: 1, name: "Basic Info", description: "Name, category, and brand" },
  { id: 2, name: "Pricing & Stock", description: "Price, stock, and weight" },
  { id: 3, name: "Product Details", description: "Condition, features, specs" },
  { id: 4, name: "Media", description: "Images and videos" },
  { id: 5, name: "Shipping & Policies", description: "Shipping and returns" },
  { id: 6, name: "SEO & Publish", description: "Metadata and publish" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    slug: "",
    categoryId: "",
    brand: "",
    sku: "",

    // Step 2: Pricing & Stock
    price: 0,
    compareAtPrice: 0,
    stockCount: 0,
    lowStockThreshold: 10,
    weight: 0,

    // Step 3: Product Details
    description: "",
    condition: "new" as const,
    features: [] as string[],
    specifications: {} as Record<string, string>,

    // Step 4: Media
    images: [] as string[],
    videos: [] as string[],

    // Step 5: Shipping & Policies
    shippingClass: "standard" as const,
    returnPolicy: "",
    warrantyInfo: "",

    // Step 6: SEO & Publish
    metaTitle: "",
    metaDescription: "",
    isFeatured: false,
    status: "draft" as const,

    // System fields
    shopId: "",
  });

  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Load existing product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const product = await productsService.getById(productId);

        // Pre-fill form data
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          categoryId: product.categoryId || "",
          brand: product.brand || "",
          sku: product.sku || "",
          price: product.price || 0,
          compareAtPrice:
            (product as any).compareAtPrice ||
            (product as any).comparePrice ||
            0,
          stockCount: product.stockCount || 0,
          lowStockThreshold: product.lowStockThreshold || 10,
          weight: (product as any).weight || 0,
          description: product.description || "",
          condition: (product.condition as any) || "new",
          features: (product as any).features || [],
          specifications: (product as any).specifications || {},
          images: product.images || [],
          videos: (product as any).videos || [],
          shippingClass: (product as any).shippingClass || "standard",
          returnPolicy: (product as any).returnPolicy || "",
          warrantyInfo: (product as any).warrantyInfo || product.warranty || "",
          metaTitle: (product as any).metaTitle || "",
          metaDescription: (product as any).metaDescription || "",
          isFeatured: product.isFeatured || false,
          status: (product.status as any) || "draft",
          shopId: product.shopId || "",
        });
      } catch (error: any) {
        console.error("Failed to load product:", error);
        setError(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

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
      setSubmitting(true);

      await productsService.update(productId, {
        ...formData,
        countryOfOrigin: "India",
        isReturnable: true,
        returnWindowDays: 7,
      } as any);

      router.push("/seller/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Link
              href="/seller/products"
              className="text-sm font-medium text-red-800 hover:text-red-900"
            >
              ← Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/seller/products"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update product details and settings
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <li
                key={step.id}
                className={`relative flex flex-col items-center ${
                  index !== STEPS.length - 1 ? "flex-1" : ""
                }`}
              >
                {index !== STEPS.length - 1 && (
                  <div
                    className={`absolute left-1/2 top-5 h-0.5 w-full ${
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep > step.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : currentStep === step.id
                      ? "border-blue-600 bg-white text-blue-600"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-900">
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Form Steps - Copy all 6 steps from create wizard */}
        <div className="mt-8 space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <SlugInput
                value={formData.slug}
                onChange={(slug: string) => setFormData({ ...formData, slug })}
                sourceText={formData.name}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Stock */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Pricing & Stock
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Compare at Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compareAtPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Count *
                  </label>
                  <input
                    type="number"
                    value={formData.stockCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStockThreshold: parseInt(e.target.value) || 10,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Product Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Product Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  maxLength={5000}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/5000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition: e.target.value as any,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="new">New</option>
                  <option value="refurbished">Refurbished</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Features
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newFeature.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            features: [...formData.features, newFeature.trim()],
                          });
                          setNewFeature("");
                        }
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Add a feature"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newFeature.trim()) {
                          setFormData({
                            ...formData,
                            features: [...formData.features, newFeature.trim()],
                          });
                          setNewFeature("");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.features.length > 0 && (
                    <ul className="space-y-1">
                      {formData.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                        >
                          <span className="text-sm">{feature}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                features: formData.features.filter(
                                  (_, i) => i !== index
                                ),
                              });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specifications
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Spec name"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            newSpecKey.trim() &&
                            newSpecValue.trim()
                          ) {
                            e.preventDefault();
                            setFormData({
                              ...formData,
                              specifications: {
                                ...formData.specifications,
                                [newSpecKey.trim()]: newSpecValue.trim(),
                              },
                            });
                            setNewSpecKey("");
                            setNewSpecValue("");
                          }
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSpecKey.trim() && newSpecValue.trim()) {
                            setFormData({
                              ...formData,
                              specifications: {
                                ...formData.specifications,
                                [newSpecKey.trim()]: newSpecValue.trim(),
                              },
                            });
                            setNewSpecKey("");
                            setNewSpecValue("");
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  {Object.keys(formData.specifications).length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(formData.specifications).map(
                            ([key, value]) => (
                              <tr key={key} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm font-medium">
                                  {key}
                                </td>
                                <td className="px-3 py-2 text-sm">{value}</td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSpecs = {
                                        ...formData.specifications,
                                      };
                                      delete newSpecs[key];
                                      setFormData({
                                        ...formData,
                                        specifications: newSpecs,
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Media */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Media</h3>

              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <div className="text-sm text-gray-600">
                  Current images: {formData.images.length}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Image upload feature coming soon
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Shipping & Policies */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Shipping & Policies
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Class
                </label>
                <select
                  value={formData.shippingClass}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingClass: e.target.value as any,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="standard">Standard (5-7 days)</option>
                  <option value="express">Express (2-3 days)</option>
                  <option value="overnight">Overnight (1 day)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Return Policy
                </label>
                <textarea
                  rows={4}
                  value={formData.returnPolicy}
                  onChange={(e) =>
                    setFormData({ ...formData, returnPolicy: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Warranty Information
                </label>
                <textarea
                  rows={3}
                  value={formData.warrantyInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyInfo: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Step 6: SEO & Publish */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                SEO & Publish
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium">
                  Feature this product on homepage
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Publishing Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <span className="ml-2 font-medium">{formData.sku}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-2 font-medium">
                      ₹{formData.price.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock:</span>
                    <span className="ml-2 font-medium">
                      {formData.stockCount} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Product"}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
