"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiGet, apiPost, uploadWithAuth } from "@/lib/api/seller";
import BasicInfoPricingStep from "@/components/seller/products/BasicInfoPricingStep";
import MediaUploadStep from "@/components/seller/products/MediaUploadStep";
import ConditionFeaturesStep from "@/components/seller/products/ConditionFeaturesStep";
import SeoPublishingStep from "@/components/seller/products/SeoPublishingStep";
import ProductPreview from "@/components/seller/products/ProductPreview";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { Stepper } from "@/components/ui/unified/Stepper";
import { PageHeader } from "@/components/ui/admin-seller";
import { SELLER_ROUTES } from "@/constants/routes";

const steps = [
  "Basic Info & Pricing",
  "Media Upload",
  "SEO & Publishing",
  "Condition & Features",
];

interface ProductFormData {
  // Step 1: Product Details
  name: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  tags: string[];

  // Step 2: Pricing & Inventory
  pricing: {
    price: number;
    compareAtPrice?: number;
    cost?: number;
  };
  inventory: {
    sku: string;
    quantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
    isUnique: boolean;
  };
  pickupAddressId?: string;

  // Step 3: Media
  media: {
    images: Array<{
      url: string;
      altText: string;
      order: number;
      file?: File;
      isNew?: boolean;
      path?: string;
      name?: string;
    }>;
    videos: Array<{
      url: string;
      thumbnail: string;
      order: number;
      file?: File;
      thumbnailBlob?: Blob;
      isNew?: boolean;
      path?: string;
      name?: string;
      size?: number;
    }>;
  };

  // Step 4: Condition & Features
  condition: "new" | "used_mint" | "used_good" | "used_fair" | "damaged";
  returnable: boolean;
  returnPeriod?: number;
  shipping: {
    isFree: boolean;
    method: "seller" | "shiprocket" | "pickup";
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  features: string[];
  specifications: Array<{ key: string; value: string }>;

  // Step 5: SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    slug: string;
  };
  startDate: Date;
  expirationDate?: Date;
  status: "draft" | "active";
}

function NewProductContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    shortDescription: "",
    fullDescription: "",
    categoryId: "",
    tags: [],
    pricing: {
      price: 0,
      compareAtPrice: undefined,
      cost: undefined,
    },
    inventory: {
      sku: "",
      quantity: 1,
      lowStockThreshold: 10,
      trackInventory: false,
      isUnique: true,
    },
    pickupAddressId: undefined,
    media: {
      images: [],
      videos: [],
    },
    condition: "new",
    returnable: true,
    returnPeriod: 7,
    shipping: {
      isFree: false,
      method: "seller",
      weight: undefined,
      dimensions: undefined,
    },
    features: [],
    specifications: [],
    seo: {
      title: "",
      description: "",
      keywords: [],
      slug: "",
    },
    startDate: new Date(),
    expirationDate: undefined,
    status: "draft",
  });

  // Fetch leaf categories and addresses on mount
  useEffect(() => {
    if (user && !authLoading) {
      fetchLeafCategories();
      fetchAddresses();
    }
  }, [user, authLoading]);

  const fetchLeafCategories = async () => {
    try {
      const response = await apiGet<any>(
        "/api/seller/products/categories/leaf"
      );
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please refresh the page.");
    }
  };

  const fetchAddresses = async () => {
    try {
      const response: any = await apiGet("/api/seller/shop");
      if (response.success && response.data) {
        setAddresses(response.data.addresses || []);

        const defaultAddr = response.data.addresses?.find(
          (addr: any) => addr.isDefault
        );
        if (defaultAddr && !formData.pickupAddressId) {
          updateFormData({ pickupAddressId: defaultAddr.id });
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
    setError(null);
  };

  const validateBeforeSubmit = (): boolean => {
    if (!formData.name.trim()) {
      setError("Product name is required");
      setActiveStep(0);
      return false;
    }
    if (!formData.categoryId) {
      setError("Please select a category");
      setActiveStep(0);
      return false;
    }
    if (formData.pricing.price <= 0) {
      setError("Price must be greater than 0");
      setActiveStep(0);
      return false;
    }
    if (!formData.seo.slug.trim()) {
      setError("SEO slug is required");
      setActiveStep(2);
      return false;
    }
    if (!formData.seo.slug.startsWith("buy-")) {
      setError("SEO slug must start with 'buy-'");
      setActiveStep(2);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateBeforeSubmit()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadedImages = await uploadPendingImages();
      const uploadedVideos = await uploadPendingVideos();

      // Transform formData to match API expectations
      const apiPayload = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        categoryId: formData.categoryId,
        tags: formData.tags,
        sku: formData.inventory.sku,

        // Pricing fields (flattened)
        pricing: formData.pricing,

        // Inventory fields (flattened)
        inventory: formData.inventory,

        pickupAddressId: formData.pickupAddressId,

        // Media
        media: {
          images: uploadedImages,
          videos: uploadedVideos,
        },

        // Product details
        condition: formData.condition,
        isReturnable: formData.returnable,
        returnPeriodDays: formData.returnPeriod,

        // Shipping
        hasFreeShipping: formData.shipping.isFree,
        shippingMethod: formData.shipping.method,
        dimensions: formData.shipping.dimensions,

        features: formData.features,
        specifications: formData.specifications,
        seo: formData.seo,
        startDate: formData.startDate,
        expirationDate: formData.expirationDate,
        status: formData.status,
      };

      console.log("Creating new product:", apiPayload);

      const response = await apiPost<any>("/api/seller/products", apiPayload);

      if (response.success) {
        // Clean up blob URLs
        formData.media.images.forEach((img: any) => {
          if (img.isNew && img.url.startsWith("blob:")) {
            URL.revokeObjectURL(img.url);
          }
        });
        formData.media.videos.forEach((video: any) => {
          if (video.isNew && video.url.startsWith("blob:")) {
            URL.revokeObjectURL(video.url);
            URL.revokeObjectURL(video.thumbnail);
          }
        });

        router.push("/seller/products");
      } else {
        const errorMessage =
          response.error || response.message || "Failed to create product";
        console.error("Product creation failed:", response);
        setError(errorMessage);

        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      const errorMessage =
        error.message || "An error occurred while creating the product";
      setError(errorMessage);

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const uploadPendingImages = async () => {
    const images = formData.media.images;
    const uploadedImages = [];

    if (images.length === 0) return [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (!img.isNew || !img.file) {
        if (!img.isNew) {
          uploadedImages.push({
            url: img.url,
            altText: img.altText,
            order: i,
            path: img.path,
            name: img.name,
          });
        }
        continue;
      }

      try {
        const formDataUpload = new FormData();
        formDataUpload.append("files", img.file);
        formDataUpload.append("slug", formData.seo.slug);
        formDataUpload.append("type", "image");

        const responseRaw = await uploadWithAuth(
          "/api/seller/products/media",
          formDataUpload
        );

        const response: any = await responseRaw.json();

        if (response.success && response.data && response.data.length > 0) {
          uploadedImages.push({
            url: response.data[0].url,
            altText: img.altText,
            order: i,
            path: response.data[0].path,
            name: response.data[0].name,
          });
          URL.revokeObjectURL(img.url);
        } else {
          const errorMsg =
            response.error || response.details || "Unknown error";
          throw new Error(`Image ${i + 1}: ${errorMsg}`);
        }
      } catch (error: any) {
        throw new Error(
          `Failed to upload image ${i + 1}: ${error.message || "Network error"}`
        );
      }
    }

    return uploadedImages;
  };

  const uploadPendingVideos = async () => {
    const videos = formData.media.videos;
    const uploadedVideos = [];

    if (videos.length === 0) return [];

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];

      if (!video.isNew || !video.file) {
        if (!video.isNew) {
          uploadedVideos.push({
            url: video.url,
            thumbnail: video.thumbnail,
            order: i,
            path: video.path,
            name: video.name,
            size: video.size,
          });
        }
        continue;
      }

      try {
        // Upload video file
        const videoFormData = new FormData();
        videoFormData.append("files", video.file);
        videoFormData.append("slug", formData.seo.slug);
        videoFormData.append("type", "video");

        const videoResponseRaw = await uploadWithAuth(
          "/api/seller/products/media",
          videoFormData
        );

        const videoResponse: any = await videoResponseRaw.json();

        if (
          !videoResponse.success ||
          !videoResponse.data ||
          videoResponse.data.length === 0
        ) {
          throw new Error(
            `Video ${i + 1}: ${videoResponse.error || "Upload failed"}`
          );
        }

        const videoData = videoResponse.data[0];

        // Upload thumbnail
        if (!video.thumbnailBlob) {
          throw new Error(`Video ${i + 1}: Thumbnail not generated`);
        }

        const thumbnailFormData = new FormData();
        thumbnailFormData.append(
          "files",
          video.thumbnailBlob,
          `${videoData.name}-thumb.jpg`
        );
        thumbnailFormData.append("slug", formData.seo.slug);
        thumbnailFormData.append("type", "image");

        const thumbnailResponseRaw = await uploadWithAuth(
          "/api/seller/products/media",
          thumbnailFormData
        );

        const thumbnailResponse: any = await thumbnailResponseRaw.json();

        if (
          !thumbnailResponse.success ||
          !thumbnailResponse.data ||
          thumbnailResponse.data.length === 0
        ) {
          throw new Error(
            `Video ${i + 1} thumbnail: ${
              thumbnailResponse.error || "Upload failed"
            }`
          );
        }

        const thumbnailData = thumbnailResponse.data[0];

        uploadedVideos.push({
          url: videoData.url,
          thumbnail: thumbnailData.url,
          order: i,
          path: videoData.path,
          name: videoData.name,
          size: videoData.size,
        });

        URL.revokeObjectURL(video.url);
        URL.revokeObjectURL(video.thumbnail);
      } catch (error: any) {
        throw new Error(
          `Failed to upload video ${i + 1}: ${error.message || "Network error"}`
        );
      }
    }

    return uploadedVideos;
  };

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoPricingStep
            data={formData}
            categories={categories}
            addresses={addresses}
            onChange={updateFormData}
          />
        );
      case 1:
        return <MediaUploadStep data={formData} onChange={updateFormData} />;
      case 2:
        return <SeoPublishingStep data={formData} onChange={updateFormData} />;
      case 3:
        return (
          <ConditionFeaturesStep data={formData} onChange={updateFormData} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Add New Product"
        description="Create a new product listing for your shop"
        breadcrumbs={[
          { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
          { label: "Products", href: SELLER_ROUTES.PRODUCTS },
          { label: "Add Product" },
        ]}
        actions={
          <UnifiedButton
            variant="outline"
            onClick={() => router.push(SELLER_ROUTES.PRODUCTS)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </UnifiedButton>
        }
      />

      {/* Error Alert */}
      {error && (
        <UnifiedAlert variant="error" onClose={() => setError(null)}>
          {error}
        </UnifiedAlert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stepper */}
          <UnifiedCard className="p-6">
            <Stepper
              steps={steps}
              currentStep={activeStep}
              onStepClick={handleStepClick}
              allowJump={true}
            />
          </UnifiedCard>

          {/* Step Content */}
          <UnifiedCard className="p-6">
            <div className="min-h-[400px]">{getStepContent(activeStep)}</div>
          </UnifiedCard>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <UnifiedButton
              variant="outline"
              onClick={handleBack}
              disabled={activeStep === 0}
              icon={<ArrowLeft />}
            >
              Back
            </UnifiedButton>

            <div className="flex items-center gap-2">
              {/* Always show Finish button */}
              <UnifiedButton
                variant="success"
                onClick={handleSubmit}
                loading={loading}
                icon={
                  loading ? <Loader2 className="animate-spin" /> : <Check />
                }
              >
                {loading ? "Creating..." : "Finish & Create"}
              </UnifiedButton>

              {/* Show Next button if not on last step */}
              {activeStep < steps.length - 1 && (
                <UnifiedButton variant="primary" onClick={handleNext}>
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </UnifiedButton>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel - 1/3 width, sticky on desktop */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <ProductPreview data={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <RoleGuard requiredRole="seller">
      <NewProductContent />
    </RoleGuard>
  );
}
