"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack, ArrowForward, Check } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost, uploadWithAuth } from "@/lib/api/seller";
import BasicInfoPricingStep from "@/components/seller/products/BasicInfoPricingStep";
import MediaUploadStep from "@/components/seller/products/MediaUploadStep";
import ConditionFeaturesStep from "@/components/seller/products/ConditionFeaturesStep";
import SeoPublishingStep from "@/components/seller/products/SeoPublishingStep";
import ProductPreview from "@/components/seller/products/ProductPreview";

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
  };
  pickupAddressId?: string;

  // Step 3: Media
  media: {
    images: Array<{
      url: string;
      altText: string;
      order: number;
      file?: File; // Optional file for new uploads
      isNew?: boolean; // Flag to indicate needs upload
      path?: string;
      name?: string;
    }>;
    videos: Array<{
      url: string;
      thumbnail: string;
      order: number;
      file?: File; // Optional file for new uploads
      thumbnailBlob?: Blob; // Thumbnail blob for upload
      isNew?: boolean; // Flag to indicate needs upload
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

export default function NewProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      quantity: 0,
      lowStockThreshold: 10,
      trackInventory: true,
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

  // Fetch leaf categories and addresses on mount (after auth is ready)
  useEffect(() => {
    // Only fetch data when user is authenticated and not loading
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

        // Auto-select default address if exists
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
    // Allow free navigation - no validation required
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const handleStepClick = (step: number) => {
    // Allow direct navigation to any step
    setActiveStep(step);
    setError(null);
  };

  const validateBeforeSubmit = (): boolean => {
    // Only validate when submitting the form
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
    // SKU and images are now optional
    if (!formData.seo.slug.trim()) {
      setError("SEO slug is required");
      setActiveStep(2); // SEO is now step 2
      return false;
    }
    if (!formData.seo.slug.startsWith("buy-")) {
      setError("SEO slug must start with 'buy-'");
      setActiveStep(2); // SEO is now step 2
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Validate entire form before submission
    if (!validateBeforeSubmit()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload new images to Firebase Storage
      const uploadedImages = await uploadPendingImages();

      // Upload new videos to Firebase Storage
      const uploadedVideos = await uploadPendingVideos();

      // Prepare form data with uploaded image and video URLs
      const finalFormData = {
        ...formData,
        media: {
          ...formData.media,
          images: uploadedImages,
          videos: uploadedVideos,
        },
      };

      const response = await apiPost<any>(
        "/api/seller/products",
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

        router.push("/seller/products");
      } else {
        setError(response.error || "Failed to create product");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

  const uploadPendingImages = async () => {
    const images = formData.media.images;
    const uploadedImages = [];

    // If no images, return empty array
    if (images.length === 0) {
      return [];
    }

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      // Skip already uploaded images
      if (!img.isNew || !img.file) {
        // Keep existing uploaded images
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
        // Create FormData for upload
        const formDataUpload = new FormData();
        formDataUpload.append("files", img.file);
        formDataUpload.append("slug", formData.seo.slug);
        formDataUpload.append("type", "image");

        console.log(`Uploading image ${i + 1}:`, {
          fileName: img.file.name,
          fileSize: img.file.size,
          slug: formData.seo.slug,
        });

        // Upload to API
        const responseRaw = await uploadWithAuth(
          "/api/seller/products/media",
          formDataUpload
        );

        // Parse JSON response
        const response: any = await responseRaw.json();

        console.log(`Upload response for image ${i + 1}:`, response);

        if (response.success && response.data && response.data.length > 0) {
          // Use the uploaded URL
          uploadedImages.push({
            url: response.data[0].url,
            altText: img.altText,
            order: i,
            path: response.data[0].path,
            name: response.data[0].name,
          });

          // Clean up blob URL
          URL.revokeObjectURL(img.url);
        } else {
          const errorMsg =
            response.error || response.details || "Unknown error";
          console.error(`Upload failed for image ${i + 1}:`, errorMsg);
          throw new Error(`Image ${i + 1}: ${errorMsg}`);
        }
      } catch (error: any) {
        console.error(`Failed to upload image ${i + 1}:`, error);
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

    // If no videos, return empty array
    if (videos.length === 0) {
      return [];
    }

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];

      // Skip already uploaded videos
      if (!video.isNew || !video.file) {
        // Keep existing uploaded videos
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
        console.log(`Uploading video ${i + 1}:`, {
          fileName: video.file.name,
          fileSize: video.file.size,
          slug: formData.seo.slug,
        });

        // Upload video file
        const videoFormData = new FormData();
        videoFormData.append("files", video.file);
        videoFormData.append("slug", formData.seo.slug);
        videoFormData.append("type", "video");

        const videoResponseRaw = await uploadWithAuth(
          "/api/seller/products/media",
          videoFormData
        );

        // Parse JSON response
        const videoResponse: any = await videoResponseRaw.json();

        console.log(`Video upload response ${i + 1}:`, videoResponse);

        if (
          !videoResponse.success ||
          !videoResponse.data ||
          videoResponse.data.length === 0
        ) {
          const errorMsg =
            videoResponse.error || videoResponse.details || "Unknown error";
          console.error(`Video upload failed for video ${i + 1}:`, errorMsg);
          throw new Error(`Video ${i + 1}: ${errorMsg}`);
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

        // Parse JSON response
        const thumbnailResponse: any = await thumbnailResponseRaw.json();

        console.log(`Thumbnail upload response ${i + 1}:`, thumbnailResponse);

        if (
          !thumbnailResponse.success ||
          !thumbnailResponse.data ||
          thumbnailResponse.data.length === 0
        ) {
          const errorMsg =
            thumbnailResponse.error ||
            thumbnailResponse.details ||
            "Unknown error";
          console.error(
            `Thumbnail upload failed for video ${i + 1}:`,
            errorMsg
          );
          throw new Error(`Video ${i + 1} thumbnail: ${errorMsg}`);
        }

        const thumbnailData = thumbnailResponse.data[0];

        // Use the uploaded URLs
        uploadedVideos.push({
          url: videoData.url,
          thumbnail: thumbnailData.url,
          order: i,
          path: videoData.path,
          name: videoData.name,
          size: videoData.size,
        });

        // Clean up blob URLs
        URL.revokeObjectURL(video.url);
        URL.revokeObjectURL(video.thumbnail);
      } catch (error: any) {
        console.error(`Failed to upload video ${i + 1}:`, error);
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
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Main Form Area - 70% */}
        <Box sx={{ flex: "0 0 70%" }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Add New Product
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create a new product listing for your shop
            </Typography>

            <Stepper activeStep={activeStep} sx={{ my: 4 }}>
              {steps.map((label, index) => (
                <Step
                  key={label}
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: "pointer" }}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ minHeight: 400 }}>{getStepContent(activeStep)}</Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 4,
                gap: 2,
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>

              <Box sx={{ flex: "1 1 auto" }} />

              {/* Always show Finish button */}
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Check />}
              >
                {loading ? "Creating..." : "Finish & Create Product"}
              </Button>

              {/* Show Next button if not on last step */}
              {activeStep < steps.length - 1 && (
                <Button
                  variant="outlined"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Preview Panel - 30% */}
        <Box
          sx={{
            flex: "0 0 30%",
            position: "sticky",
            top: 80,
            height: "fit-content",
          }}
        >
          <ProductPreview data={formData} />
        </Box>
      </Box>
    </Container>
  );
}
