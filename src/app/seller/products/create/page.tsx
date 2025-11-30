"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import SlugInput from "@/components/common/SlugInput";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import { productsService } from "@/services/products.service";
import { mediaService } from "@/services/media.service";

const STEPS = [
  { id: 1, name: "Basic Info", description: "Name, category, and brand" },
  { id: 2, name: "Pricing & Stock", description: "Price, stock, and weight" },
  { id: 3, name: "Product Details", description: "Condition, features, specs" },
  { id: 4, name: "Media", description: "Images and videos" },
  { id: 5, name: "Shipping & Policies", description: "Shipping and returns" },
  { id: 6, name: "SEO & Publish", description: "Metadata and publish" },
];

export default function CreateProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    featured: false,
    status: "draft" as const,

    // System fields
    shopId: "default-shop-id",
  });

  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

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
      setLoading(true);

      const result = await productsService.create({
        ...formData,
        countryOfOrigin: "India",
        lowStockThreshold: 5,
        isReturnable: true,
        returnWindowDays: 7,
      } as any);

      // Redirect to edit page with the slug
      if (result.slug) {
        router.push(`/seller/products/${result.slug}/edit`);
      } else {
        router.push("/seller/products");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add a new product to your shop
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
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="product-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name *
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter product name"
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 3 characters, maximum 200 characters
              </p>
            </div>

            <div>
              <SlugInput
                value={formData.slug}
                sourceText={formData.name}
                onChange={(slug: string) => setFormData({ ...formData, slug })}
              />
            </div>

            <div id="product-category-wrapper">
              <label
                htmlFor="product-category-wrapper"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category *
              </label>
              <CategorySelectorWithCreate
                value={formData.categoryId}
                onChange={(categoryId) =>
                  setFormData({ ...formData, categoryId: categoryId || "" })
                }
                placeholder="Select or create a category"
                required
              />
            </div>

            <div>
              <label
                htmlFor="product-brand"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Brand
              </label>
              <input
                id="product-brand"
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter brand name"
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="product-sku"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SKU *
              </label>
              <input
                id="product-sku"
                type="text"
                required
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., PROD-12345"
              />
              <p className="mt-1 text-xs text-gray-500">
                Stock Keeping Unit for inventory tracking
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Stock */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="product-price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (₹) *
                </label>
                <input
                  id="product-price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label
                  htmlFor="product-compare-price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Compare at Price (₹)
                </label>
                <input
                  id="product-compare-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compareAtPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Original price before discount
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="product-stock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock Quantity *
                </label>
                <input
                  id="product-stock"
                  type="number"
                  required
                  min="0"
                  value={formData.stockCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label
                  htmlFor="product-low-stock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Low Stock Alert
                </label>
                <input
                  id="product-low-stock"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="10"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock falls below this number
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="product-weight"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Weight (kg)
              </label>
              <input
                id="product-weight"
                type="number"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-gray-500">
                Product weight for shipping calculation
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Product Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="product-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="product-description"
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter detailed product description"
                maxLength={5000}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/5000 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="product-condition"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Condition *
              </label>
              <select
                id="product-condition"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="refurbished">Refurbished</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div id="product-features-wrapper">
              <label
                htmlFor="product-features-wrapper"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Features
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id="product-feature-input"
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
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add a feature and press Enter"
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

            <div id="product-specifications-wrapper">
              <label
                htmlFor="product-specifications-wrapper"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Specifications
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="product-spec-key"
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Spec name (e.g., Color)"
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
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Value (e.g., Black)"
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
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                {key}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600">
                                {value}
                              </td>
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
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Upload Product Images
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Drag and drop images here, or click to select files
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
                onChange={async (e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setUploadingImages(true);

                    try {
                      const uploadPromises = files.map(async (file, index) => {
                        const key = `image-${index}`;
                        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

                        const result = await mediaService.upload({
                          file,
                          context: "product",
                        });

                        setUploadProgress((prev) => ({
                          ...prev,
                          [key]: 100,
                        }));

                        return result.url;
                      });

                      const uploadedUrls = await Promise.all(uploadPromises);
                      setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, ...uploadedUrls],
                      }));
                    } catch (error) {
                      console.error("Image upload failed:", error);
                      toast.error("Failed to upload images. Please try again.");
                    } finally {
                      setUploadingImages(false);
                      setUploadProgress({});
                    }
                  }
                }}
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                {uploadingImages ? "Uploading..." : "Select Images"}
              </label>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>

              {/* Upload Progress */}
              {uploadingImages && (
                <div className="mt-4 space-y-2">
                  {Object.entries(uploadProgress)
                    .filter(([key]) => key.startsWith("image-"))
                    .map(([key, progress]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {progress}%
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Uploaded Images */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Upload Product Videos (Optional)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Add demonstration or review videos
              </p>
              <input
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                id="video-upload"
                disabled={uploadingVideos}
                onChange={async (e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setUploadingVideos(true);

                    try {
                      const uploadPromises = files.map(async (file, index) => {
                        const key = `video-${index}`;
                        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

                        const result = await mediaService.upload({
                          file,
                          context: "product",
                        });

                        setUploadProgress((prev) => ({
                          ...prev,
                          [key]: 100,
                        }));

                        return result.url;
                      });

                      const uploadedUrls = await Promise.all(uploadPromises);
                      setFormData((prev) => ({
                        ...prev,
                        videos: [...prev.videos, ...uploadedUrls],
                      }));
                    } catch (error) {
                      console.error("Video upload failed:", error);
                      toast.error("Failed to upload videos. Please try again.");
                    } finally {
                      setUploadingVideos(false);
                      setUploadProgress({});
                    }
                  }
                }}
              />
              <label
                htmlFor="video-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                {uploadingVideos ? "Uploading..." : "Select Videos"}
              </label>
              <p className="mt-2 text-xs text-gray-500">
                MP4, WebM up to 100MB each
              </p>

              {/* Upload Progress */}
              {uploadingVideos && (
                <div className="mt-4 space-y-2">
                  {Object.entries(uploadProgress)
                    .filter(([key]) => key.startsWith("video-"))
                    .map(([key, progress]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {progress}%
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Uploaded Videos */}
              {formData.videos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.videos.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        Video {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            videos: prev.videos.filter((_, i) => i !== index),
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Add multiple high-quality images from
                different angles. The first image will be used as the main
                product image.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Shipping & Policies */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="product-shipping-class"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Shipping Class
              </label>
              <select
                id="product-shipping-class"
                value={formData.shippingClass}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingClass: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="standard">Standard (5-7 days)</option>
                <option value="express">Express (2-3 days)</option>
                <option value="overnight">Overnight (1 day)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="product-return-policy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Return Policy
              </label>
              <textarea
                id="product-return-policy"
                rows={4}
                value={formData.returnPolicy}
                onChange={(e) =>
                  setFormData({ ...formData, returnPolicy: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe your return policy (e.g., 7-day return, original packaging required)"
              />
            </div>

            <div>
              <label
                htmlFor="product-warranty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Warranty Information
              </label>
              <textarea
                id="product-warranty"
                rows={3}
                value={formData.warrantyInfo}
                onChange={(e) =>
                  setFormData({ ...formData, warrantyInfo: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Warranty details (e.g., 1-year manufacturer warranty)"
              />
            </div>
          </div>
        )}

        {/* Step 6: SEO & Publish */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 mb-4">
              <h3 className="text-sm font-medium text-green-900">
                Final Step: SEO & Publish
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Optimize for search engines and choose publishing options
              </p>
            </div>

            <div>
              <label
                htmlFor="product-meta-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meta Title
              </label>
              <input
                id="product-meta-title"
                type="text"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={
                  formData.name || "Product title for search engines"
                }
                maxLength={60}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.metaTitle.length}/60 characters - Leave empty to use
                product name
              </p>
            </div>

            <div>
              <label
                htmlFor="product-meta-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meta Description
              </label>
              <textarea
                id="product-meta-description"
                rows={3}
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescription: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief description for search results"
                maxLength={160}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-gray-700"
              >
                Feature this product on homepage
              </label>
            </div>

            <div>
              <label
                htmlFor="product-status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Publishing Status *
              </label>
              <select
                id="product-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="draft">Draft (Save for later)</option>
                <option value="published">Published (Go live now)</option>
              </select>
            </div>

            {/* Product Summary */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Product Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {formData.name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {formData.sku || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    ₹{formData.price.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {formData.stockCount} units
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {formData.weight || 0} kg
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Condition:</span>
                  <span className="ml-2 text-gray-900 font-medium capitalize">
                    {formData.condition}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Features:</span>
                  <span className="ml-2 text-gray-900">
                    {formData.features.length} added
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Specifications:</span>
                  <span className="ml-2 text-gray-900">
                    {Object.keys(formData.specifications).length} added
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
