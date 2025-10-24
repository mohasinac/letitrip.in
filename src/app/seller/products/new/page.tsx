"use client";

import { useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { StorageService } from "@/lib/services/storage.service";
import { ProductsService } from "@/lib/services/products.service";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number;
  cost: number;
  sku: string;
  barcode: string;
  quantity: number;
  lowStockThreshold: number;
  weight: number;
  weightUnit: "kg" | "g" | "lb" | "oz";
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  category: string;
  tags: string[];
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export default function AddProduct() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: 0,
    compareAtPrice: 0,
    cost: 0,
    sku: "",
    barcode: "",
    quantity: 0,
    lowStockThreshold: 10,
    weight: 0,
    weightUnit: "kg",
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: "cm",
    },
    category: "",
    tags: [],
    status: "draft",
    isFeatured: false,
    seo: {
      title: "",
      description: "",
      keywords: [],
    },
  });

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: any, nested?: string) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        [nested]: {
          ...(prev[nested as keyof ProductFormData] as any),
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Auto-generate slug from name
    if (field === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }

    // Auto-generate SEO title from name
    if (field === "name") {
      setFormData((prev) => ({
        ...prev,
        seo: { ...prev.seo, title: value },
      }));
    }

    // Auto-generate SKU from category (keep SKU same as child category)
    if (field === "category" && value) {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const categoryCode = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4);
      const autoSku = `${categoryCode}-${timestamp}`;
      setFormData((prev) => ({ ...prev, sku: autoSku }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const validation = StorageService.validateFile(file, "image");
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setImages((prev) => [...prev, file]);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(async (file) => {
      const validation = StorageService.validateFile(file, "video");
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setVideos((prev) => [...prev, file]);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setVideoPreviewUrls((prev) => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const tag = target.value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
      }
      target.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSEOKeywordInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const keyword = target.value.trim();
      if (keyword && !formData.seo.keywords.includes(keyword)) {
        setFormData((prev) => ({
          ...prev,
          seo: {
            ...prev.seo,
            keywords: [...prev.seo.keywords, keyword],
          },
        }));
      }
      target.value = "";
    }
  };

  const removeSEOKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(
          (keyword) => keyword !== keywordToRemove
        ),
      },
    }));
  };

  const saveProduct = async () => {
    try {
      setSaving(true);

      if (!formData.name || !formData.description || !formData.price) {
        alert("Please fill in all required fields");
        return;
      }

      if (images.length === 0) {
        alert("Please add at least one product image");
        return;
      }

      // Generate a temporary product ID for file uploads
      const tempProductId = `temp_${Date.now()}`;

      // Upload images
      const imageUploadResults = await StorageService.uploadProductImages(
        images,
        tempProductId,
        (fileIndex, progress) => {
          console.log(
            `Image ${fileIndex + 1} upload progress:`,
            progress.progress
          );
        }
      );

      // Upload videos if any
      const videoUploadResults =
        videos.length > 0
          ? await StorageService.uploadProductVideos(
              videos,
              tempProductId,
              (fileIndex, progress) => {
                console.log(
                  `Video ${fileIndex + 1} upload progress:`,
                  progress.progress
                );
              }
            )
          : [];

      // Prepare product data
      const productData = {
        ...formData,
        sellerId: user?.id,
        images: imageUploadResults.map((result, index) => ({
          url: result.url,
          alt: formData.name,
          order: index,
        })),
        videos: videoUploadResults.map((result, index) => ({
          url: result.url,
          title: `${formData.name} Video ${index + 1}`,
          order: index,
        })),
      };

      // Create product
      const createdProduct = await ProductsService.create(productData);

      alert("Product created successfully!");
      router.push("/seller/inventory");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new product for your store
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? "Creating..." : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      handleInputChange("barcode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter barcode"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your product"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) =>
                      handleInputChange("shortDescription", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for product listings"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Pricing & Inventory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare at Price
                  </label>
                  <input
                    type="number"
                    value={formData.compareAtPrice || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "compareAtPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost
                  </label>
                  <input
                    type="number"
                    value={formData.cost || ""}
                    onChange={(e) =>
                      handleInputChange("cost", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "lowStockThreshold",
                        parseInt(e.target.value) || 10
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Shipping Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight *
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "weight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0"
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) =>
                        handleInputChange("weightUnit", e.target.value)
                      }
                      className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions Unit
                  </label>
                  <select
                    value={formData.dimensions.unit}
                    onChange={(e) =>
                      handleInputChange("unit", e.target.value, "dimensions")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <input
                    type="number"
                    value={formData.dimensions.length || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "length",
                        parseFloat(e.target.value) || 0,
                        "dimensions"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    value={formData.dimensions.width || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "width",
                        parseFloat(e.target.value) || 0,
                        "dimensions"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    value={formData.dimensions.height || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "height",
                        parseFloat(e.target.value) || 0,
                        "dimensions"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Product Media
              </h3>

              {/* Images */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Product Images * (Drag and drop or click to upload)
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <PhotoIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-sm text-gray-600">
                      Choose images or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 10MB each
                    </span>
                  </label>
                </div>

                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Product Videos (Optional)
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <VideoCameraIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-sm text-gray-600">
                      Choose videos or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      MP4, WEBM up to 100MB each
                    </span>
                  </label>
                </div>

                {videoPreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <video
                          src={url}
                          controls
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeVideo(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Organization */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Organization
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="books">Books</option>
                    <option value="home-garden">Home & Garden</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type and press Enter to add tags"
                  />
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        handleInputChange("isFeatured", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Featured Product
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                SEO Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo.title}
                    onChange={(e) =>
                      handleInputChange("title", e.target.value, "seo")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SEO title (max 60 characters)"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seo.title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value, "seo")
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SEO description (max 160 characters)"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seo.description.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleSEOKeywordInput}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type and press Enter to add keywords"
                  />
                  {formData.seo.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.seo.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {keyword}
                          <button
                            onClick={() => removeSEOKeyword(keyword)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
