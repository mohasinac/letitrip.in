"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FormInput, FormSelect, FormTextarea } from "@/components/forms";
import OptimizedImage from "@/components/common/OptimizedImage";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { shopsService } from "@/services/shops.service";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import MediaUploader from "@/components/media/MediaUploader";
import SlugInput from "@/components/common/SlugInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { ProductFE } from "@/types/frontend/product.types";
import type { CategoryFE } from "@/types/frontend/category.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import {
  ProductStatus,
  ProductCondition,
  ShippingClass,
} from "@/types/shared/common.types";

// Helper type for specifications array in form
type ProductSpecification = { name: string; value: string };

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductFE | null>(null);
  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [shops, setShops] = useState<ShopCardFE[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    shopId: "",
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: 0,
    originalPrice: 0,
    costPrice: 0,
    stockCount: 0,
    lowStockThreshold: 10,
    sku: "",
    condition: "new" as ProductCondition,
    brand: "",
    manufacturer: "",
    countryOfOrigin: "India",
    tags: [] as string[],
    isReturnable: true,
    returnWindowDays: 7,
    warranty: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft" as ProductStatus,
    featured: false,
    shippingClass: ShippingClass.STANDARD,
  });

  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    []
  );
  const [newSpec, setNewSpec] = useState({ name: "", value: "" });
  const [tagInput, setTagInput] = useState("");

  // Media upload
  const {
    uploadMedia,
    isUploading,
    clearTracking,
    confirmNavigation,
    hasUploadedMedia,
  } = useMediaUploadWithCleanup({
    onUploadSuccess: (url) => {
      setFormData((prev) => ({
        ...prev,
        images: [...(product?.images || []), url],
      }));
    },
  });

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productData, categoriesData, shopsData] = await Promise.all([
        productsService.getById(productId),
        categoriesService.list({}),
        shopsService.list({}),
      ]);

      setProduct(productData);
      setCategories(categoriesData.data || []);
      setShops(shopsData.data || []);

      // Populate form
      setFormData({
        shopId: productData.shopId,
        categoryId: productData.categoryId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description || "",
        shortDescription: productData.shortDescription || "",
        price: productData.price,
        originalPrice: productData.originalPrice || 0,
        costPrice: productData.costPrice || 0,
        stockCount: productData.stockCount,
        lowStockThreshold: productData.lowStockThreshold || 10,
        sku: productData.sku || "",
        condition: productData.condition,
        brand: productData.brand || "",
        manufacturer: productData.manufacturer || "",
        countryOfOrigin: productData.countryOfOrigin || "India",
        tags: productData.tags || [],
        isReturnable: productData.isReturnable ?? true,
        returnWindowDays: productData.returnWindowDays || 7,
        warranty: productData.warranty || "",
        metaTitle: productData.metaTitle || "",
        metaDescription: productData.metaDescription || "",
        status: productData.status,
        featured: productData.featured || false,
        shippingClass: (productData.shippingClass ||
          "standard") as ShippingClass,
      });

      // Convert specifications from Record to array
      const specsArray = productData.specifications
        ? Object.entries(productData.specifications).map(([name, value]) => ({
            name,
            value,
          }))
        : [];
      setSpecifications(specsArray);
    } catch (error) {
      console.error("Failed to load product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecification = () => {
    if (newSpec.name && newSpec.value) {
      setSpecifications([...specifications, { ...newSpec }]);
      setNewSpec({ name: "", value: "" });
    }
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleRemoveImage = (url: string) => {
    if (!product) return;
    setProduct({
      ...product,
      images: product.images.filter((img) => img !== url),
    });
  };

  const handleImageUpload = async (files: any[]) => {
    if (files.length > 0) {
      await uploadMedia(files[0].file, "product", productId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Convert specifications array to Record for API
      const specsRecord = specifications.reduce((acc, spec) => {
        acc[spec.name] = spec.value;
        return acc;
      }, {} as Record<string, string>);

      const updateData = {
        ...formData,
        specifications: specsRecord,
        images: product?.images || [],
        videos: product?.videos || [],
      };

      await productsService.update(product!.slug, updateData);

      clearTracking();
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await productsService.delete(product!.slug);
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = async () => {
    if (hasUploadedMedia) {
      await confirmNavigation(() => router.back());
    } else {
      router.back();
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update product information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            type="submit"
            disabled={saving || isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <FormInput
                id="product-name"
                label="Product Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <div>
                <SlugInput
                  value={formData.slug}
                  sourceText={formData.name}
                  onChange={(slug) => setFormData({ ...formData, slug })}
                />
              </div>

              <FormTextarea
                id="short-description"
                label="Short Description"
                rows={2}
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shortDescription: e.target.value,
                  })
                }
                placeholder="Brief product summary..."
              />

              <FormTextarea
                id="description"
                label="Description"
                rows={6}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed product description..."
              />
            </div>
          </div>

          {/* Media Gallery */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Media Gallery
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="product-images"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Images
                </label>
                {product.images && product.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {product.images.map((url, index) => (
                      <div key={index} className="relative group h-32">
                        <OptimizedImage
                          src={url}
                          alt={`Product ${index + 1}`}
                          fill
                          className="object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url)}
                          className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <MediaUploader
                  onFilesAdded={handleImageUpload}
                  accept="image"
                  maxFiles={10}
                  files={[]}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                id="selling-price"
                label="Selling Price (₹)"
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
              <FormInput
                id="original-price"
                label="Original Price (₹)"
                type="number"
                min={0}
                step={0.01}
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <FormInput
                id="cost-price"
                label="Cost Price (₹)"
                type="number"
                min={0}
                step={0.01}
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Inventory
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                id="stock-count"
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
                id="low-stock-threshold"
                label="Low Stock Threshold"
                type="number"
                min={0}
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: parseInt(e.target.value),
                  })
                }
              />
              <FormInput
                id="sku"
                label="SKU"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
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
              <FormSelect
                label="Shipping Class"
                value={formData.shippingClass}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingClass: e.target.value as any,
                  })
                }
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "express", label: "Express" },
                  { value: "heavy", label: "Heavy" },
                  { value: "fragile", label: "Fragile" },
                ]}
              />
              <FormInput
                label="Brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
              <FormInput
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
              />
              <FormInput
                label="Country of Origin"
                value={formData.countryOfOrigin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    countryOfOrigin: e.target.value,
                  })
                }
              />
              <FormInput
                label="Warranty"
                value={formData.warranty}
                onChange={(e) =>
                  setFormData({ ...formData, warranty: e.target.value })
                }
                placeholder="e.g., 1 Year"
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Specifications
            </h2>
            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={spec.name}
                      disabled
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      disabled
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(index)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name (e.g., Color)"
                    value={newSpec.name}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, name: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Blue)"
                    value={newSpec.value}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, value: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSpecification}
                  className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              SEO Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="Product name - Shop name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  placeholder="Brief description for search engines..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-purple-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Publishing
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop *
                </label>
                <select
                  required
                  value={formData.shopId}
                  onChange={(e) =>
                    setFormData({ ...formData, shopId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select Shop</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ProductStatus,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Features
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Featured Product (shown in featured sections and homepage)
                </span>
              </label>
            </div>
          </div>

          {/* Return Policy */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Return Policy
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isReturnable}
                  onChange={(e) =>
                    setFormData({ ...formData, isReturnable: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Returnable</span>
              </label>
              {formData.isReturnable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Window (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.returnWindowDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        returnWindowDays: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rating:</span>
                <span className="font-medium">
                  ⭐ {(product.rating || product.averageRating || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reviews:</span>
                <span className="font-medium">{product.reviewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sales:</span>
                <span className="font-medium">{product.salesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Views:</span>
                <span className="font-medium">{product.viewCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will remove all associated data including reviews and orders."
        onConfirm={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
        variant="danger"
        confirmLabel="Delete Product"
        isLoading={deleting}
      />
    </form>
  );
}
