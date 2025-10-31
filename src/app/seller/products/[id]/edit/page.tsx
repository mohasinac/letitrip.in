"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Trash2, Archive } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPut, apiDelete, uploadWithAuth } from "@/lib/api/seller";
import BasicInfoPricingStep from "@/components/seller/products/BasicInfoPricingStep";
import MediaUploadStep from "@/components/seller/products/MediaUploadStep";
import ConditionFeaturesStep from "@/components/seller/products/ConditionFeaturesStep";
import SeoPublishingStep from "@/components/seller/products/SeoPublishingStep";
import ProductPreview from "@/components/seller/products/ProductPreview";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { UnifiedModal } from "@/components/ui/unified/Modal";
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
  name: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  tags: string[];
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

function EditProductContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  // Fetch product data and dependencies
  useEffect(() => {
    if (user && !authLoading) {
      fetchProductData();
      fetchLeafCategories();
      fetchAddresses();
    }
  }, [user, authLoading, params.id]);

  const fetchProductData = async () => {
    try {
      setFetchingData(true);
      const response = await apiGet<any>(`/api/seller/products/${params.id}`);
      
      if (response.success && response.data) {
        const product = response.data;
        
        // Transform API data to form data structure
        setFormData({
          name: product.name || "",
          shortDescription: product.shortDescription || "",
          fullDescription: product.fullDescription || "",
          categoryId: product.categoryId || "",
          tags: product.tags || [],
          pricing: {
            price: product.price || 0,
            compareAtPrice: product.compareAtPrice,
            cost: product.cost,
          },
          inventory: {
            sku: product.sku || "",
            quantity: product.quantity || 1,
            lowStockThreshold: product.lowStockThreshold || 10,
            trackInventory: product.trackInventory ?? true,
            isUnique: product.isUnique ?? true,
          },
          pickupAddressId: product.pickupAddressId,
          media: {
            images: product.images || [],
            videos: product.videos || [],
          },
          condition: product.condition || "new",
          returnable: product.returnable ?? true,
          returnPeriod: product.returnPeriod || 7,
          shipping: {
            isFree: product.shipping?.isFree ?? false,
            method: product.shipping?.method || "seller",
            weight: product.shipping?.weight,
            dimensions: product.shipping?.dimensions,
          },
          features: product.features || [],
          specifications: product.specifications || [],
          seo: {
            title: product.seo?.title || "",
            description: product.seo?.description || "",
            keywords: product.seo?.keywords || [],
            slug: product.slug || "",
          },
          startDate: product.startDate ? new Date(product.startDate) : new Date(),
          expirationDate: product.expirationDate ? new Date(product.expirationDate) : undefined,
          status: product.status || "draft",
        });
      } else {
        setError("Product not found");
        setTimeout(() => router.push(SELLER_ROUTES.PRODUCTS), 2000);
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      setError(error.message || "Failed to load product data");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchLeafCategories = async () => {
    try {
      const response = await apiGet<any>("/api/seller/products/categories/leaf");
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response: any = await apiGet("/api/seller/shop");
      if (response.success && response.data) {
        setAddresses(response.data.addresses || []);
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
    if (!formData) return false;
    
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
    if (!formData || !validateBeforeSubmit()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadedImages = await uploadPendingImages();
      const uploadedVideos = await uploadPendingVideos();

      const finalFormData = {
        ...formData,
        media: {
          ...formData.media,
          images: uploadedImages,
          videos: uploadedVideos,
        },
      };

      const response = await apiPut<any>(
        `/api/seller/products/${params.id}`,
        finalFormData
      );

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

        router.push(SELLER_ROUTES.PRODUCTS);
      } else {
        setError(response.error || "Failed to update product");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while updating the product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiDelete<any>(`/api/seller/products/${params.id}`);
      
      if (response.success) {
        router.push(SELLER_ROUTES.PRODUCTS);
      } else {
        setError(response.error || "Failed to delete product");
        setDeleteDialogOpen(false);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting the product");
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!formData) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiPut<any>(`/api/seller/products/${params.id}`, {
        ...formData,
        status: "archived",
      });
      
      if (response.success) {
        router.push(SELLER_ROUTES.PRODUCTS);
      } else {
        setError(response.error || "Failed to archive product");
        setArchiveDialogOpen(false);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while archiving the product");
      setArchiveDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const uploadPendingImages = async () => {
    if (!formData) return [];
    
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
          const errorMsg = response.error || response.details || "Unknown error";
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
    if (!formData) return [];
    
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
            `Video ${i + 1} thumbnail: ${thumbnailResponse.error || "Upload failed"}`
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
    setFormData((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const getStepContent = (step: number) => {
    if (!formData) return null;
    
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

  // Loading state
  if (fetchingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="Edit Product"
          description="Loading product data..."
          breadcrumbs={[
            { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
            { label: "Products", href: SELLER_ROUTES.PRODUCTS },
            { label: "Edit" },
          ]}
        />
        <UnifiedCard className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-textSecondary">Loading product data...</p>
          </div>
        </UnifiedCard>
      </div>
    );
  }

  // Error state
  if (!formData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="Edit Product"
          description="Product not found"
          breadcrumbs={[
            { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
            { label: "Products", href: SELLER_ROUTES.PRODUCTS },
            { label: "Edit" },
          ]}
        />
        <UnifiedAlert variant="error">
          {error || "Product not found. Redirecting..."}
        </UnifiedAlert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header with Actions */}
      <PageHeader
        title="Edit Product"
        description="Update your product listing"
        breadcrumbs={[
          { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
          { label: "Products", href: SELLER_ROUTES.PRODUCTS },
          { label: "Edit" },
        ]}
        actions={
          <div className="flex gap-2">
            <UnifiedButton
              variant="outline"
              icon={<Archive />}
              onClick={() => setArchiveDialogOpen(true)}
            >
              Archive
            </UnifiedButton>
            <UnifiedButton
              variant="destructive"
              icon={<Trash2 />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </UnifiedButton>
          </div>
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
              {/* Always show Update button */}
              <UnifiedButton
                variant="success"
                onClick={handleSubmit}
                loading={loading}
                icon={loading ? <Loader2 className="animate-spin" /> : <Check />}
              >
                {loading ? "Updating..." : "Update Product"}
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

      {/* Delete Confirmation Modal */}
      <UnifiedModal
        open={deleteDialogOpen}
        onClose={() => !loading && setDeleteDialogOpen(false)}
        title="Delete Product?"
        footer={
          <div className="flex gap-2 justify-end">
            <UnifiedButton
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </UnifiedButton>
            <UnifiedButton
              variant="destructive"
              onClick={handleDelete}
              loading={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </UnifiedButton>
          </div>
        }
      >
        <p className="text-textSecondary">
          Are you sure you want to delete this product? This action cannot be undone. 
          All product data and media will be permanently removed.
        </p>
      </UnifiedModal>

      {/* Archive Confirmation Modal */}
      <UnifiedModal
        open={archiveDialogOpen}
        onClose={() => !loading && setArchiveDialogOpen(false)}
        title="Archive Product?"
        footer={
          <div className="flex gap-2 justify-end">
            <UnifiedButton
              variant="outline"
              onClick={() => setArchiveDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </UnifiedButton>
            <UnifiedButton
              variant="warning"
              onClick={handleArchive}
              loading={loading}
            >
              {loading ? "Archiving..." : "Archive"}
            </UnifiedButton>
          </div>
        }
      >
        <p className="text-textSecondary">
          Are you sure you want to archive this product? Archived products will not be 
          visible to customers but can be restored later.
        </p>
      </UnifiedModal>
    </div>
  );
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard requiredRole="seller">
      <EditProductContent params={params} />
    </RoleGuard>
  );
}
