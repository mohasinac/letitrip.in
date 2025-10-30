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
import { apiGet, apiPost } from "@/lib/api/seller";
import ProductDetailsStep from "@/components/seller/products/ProductDetailsStep";
import PricingInventoryStep from "@/components/seller/products/PricingInventoryStep";
import MediaUploadStep from "@/components/seller/products/MediaUploadStep";
import ConditionFeaturesStep from "@/components/seller/products/ConditionFeaturesStep";
import SeoPublishingStep from "@/components/seller/products/SeoPublishingStep";
import ProductPreview from "@/components/seller/products/ProductPreview";

const steps = [
  "Product Details",
  "Pricing & Inventory",
  "Media Upload",
  "Condition & Features",
  "SEO & Publishing",
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
    images: Array<{ url: string; altText: string; order: number }>;
    videos: Array<{ url: string; thumbnail: string; order: number }>;
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

  // Fetch leaf categories and addresses on mount
  useEffect(() => {
    fetchLeafCategories();
    fetchAddresses();
  }, []);

  const fetchLeafCategories = async () => {
    try {
      const response = await apiGet("/api/seller/products/categories/leaf");
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
    // Validate current step before proceeding
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Product Details
        if (!formData.name.trim()) {
          setError("Product name is required");
          return false;
        }
        if (!formData.categoryId) {
          setError("Please select a category");
          return false;
        }
        return true;

      case 1: // Pricing & Inventory
        if (formData.pricing.price <= 0) {
          setError("Price must be greater than 0");
          return false;
        }
        if (!formData.inventory.sku.trim()) {
          setError("SKU is required");
          return false;
        }
        if (formData.inventory.quantity < 0) {
          setError("Quantity cannot be negative");
          return false;
        }
        return true;

      case 2: // Media Upload
        if (formData.media.images.length === 0) {
          setError("Please upload at least one product image");
          return false;
        }
        return true;

      case 3: // Condition & Features
        return true; // All optional

      case 4: // SEO
        if (!formData.seo.slug.trim()) {
          setError("SEO slug is required");
          return false;
        }
        if (!formData.seo.slug.startsWith("buy-")) {
          setError("SEO slug must start with 'buy-'");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiPost("/api/seller/products", formData);

      if (response.success) {
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

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ProductDetailsStep
            data={formData}
            categories={categories}
            onChange={updateFormData}
          />
        );
      case 1:
        return (
          <PricingInventoryStep
            data={formData}
            addresses={addresses}
            onChange={updateFormData}
          />
        );
      case 2:
        return <MediaUploadStep data={formData} onChange={updateFormData} />;
      case 3:
        return (
          <ConditionFeaturesStep data={formData} onChange={updateFormData} />
        );
      case 4:
        return <SeoPublishingStep data={formData} onChange={updateFormData} />;
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
              {steps.map((label) => (
                <Step key={label}>
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
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>

              <Box sx={{ flex: "1 1 auto" }} />

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Check />
                  }
                >
                  {loading ? "Creating..." : "Create Product"}
                </Button>
              ) : (
                <Button
                  variant="contained"
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
