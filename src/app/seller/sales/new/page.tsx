"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Radio,
  RadioGroup,
  FormLabel,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Link from "next/link";

function SaleFormContent() {
  const router = useRouter();

  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Sales",
      href: SELLER_ROUTES.SALES,
    },
    {
      label: "Create Sale",
      href: SELLER_ROUTES.SALES_NEW,
      active: true,
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    applyTo: "all_products" as
      | "all_products"
      | "specific_products"
      | "specific_categories",
    productIds: [] as string[],
    categoryIds: [] as string[],
    enableFreeShipping: false,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isPermanent: false,
    status: "active" as "active" | "inactive" | "scheduled",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data
  const mockProducts = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "Product 2" },
    { id: "3", name: "Product 3" },
  ];

  const mockCategories = [
    { id: "cat1", name: "Category 1" },
    { id: "cat2", name: "Category 2" },
    { id: "cat3", name: "Category 3" },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Sale name is required";
    }
    if (formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }
    if (
      formData.discountType === "percentage" &&
      formData.discountValue > 100
    ) {
      newErrors.discountValue = "Percentage cannot exceed 100";
    }
    if (!formData.isPermanent && !formData.endDate) {
      newErrors.endDate = "End date is required for non-permanent sales";
    }
    if (
      formData.applyTo === "specific_products" &&
      formData.productIds.length === 0
    ) {
      newErrors.productIds = "Please select at least one product";
    }
    if (
      formData.applyTo === "specific_categories" &&
      formData.categoryIds.length === 0
    ) {
      newErrors.categoryIds = "Please select at least one category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    // TODO: Implement API call
    console.log("Saving sale:", formData);
    router.push(SELLER_ROUTES.SALES);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href={SELLER_ROUTES.SALES}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2, textTransform: "none" }}
          >
            Back to Sales
          </Button>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Create Sale
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a store-wide sale to boost your sales
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Info Alert */}
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon />}>
                  Sales apply flat discounts to products. They're great for
                  store-wide promotions and can be combined with coupons for
                  maximum savings!
                </Alert>
              </Grid>

              {/* Basic Info */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sale Name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  error={!!errors.name}
                  helperText={
                    errors.name || "e.g., Weekend Sale, Summer Clearance"
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  multiline
                  rows={2}
                  helperText="Describe this sale for your customers"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Discount Settings */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight={600}
                  sx={{ mt: 2 }}
                >
                  Discount Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.discountType}
                    label="Discount Type"
                    onChange={(e) =>
                      handleChange("discountType", e.target.value)
                    }
                  >
                    <MenuItem value="percentage">Percentage Off</MenuItem>
                    <MenuItem value="fixed">Fixed Amount Off</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount Value"
                  value={formData.discountValue}
                  onChange={(e) =>
                    handleChange(
                      "discountValue",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  error={!!errors.discountValue}
                  helperText={
                    errors.discountValue ||
                    (formData.discountType === "percentage"
                      ? "0-100"
                      : "Amount in ₹")
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {formData.discountType === "percentage" ? "%" : "₹"}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableFreeShipping}
                      onChange={(e) =>
                        handleChange("enableFreeShipping", e.target.checked)
                      }
                    />
                  }
                  label="Enable Free Shipping for this sale"
                />
              </Grid>

              {/* Apply To */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight={600}
                  sx={{ mt: 2 }}
                >
                  Apply Sale To
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={formData.applyTo}
                    onChange={(e) => handleChange("applyTo", e.target.value)}
                  >
                    <FormControlLabel
                      value="all_products"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">All Products</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Apply discount to all products in your store
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="specific_products"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">
                            Specific Products
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Choose which products to include
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="specific_categories"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">
                            Specific Categories
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Apply to entire categories
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Product Selection */}
              {formData.applyTo === "specific_products" && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={mockProducts}
                    getOptionLabel={(option) => option.name}
                    value={mockProducts.filter((p) =>
                      formData.productIds.includes(p.id)
                    )}
                    onChange={(e, value) =>
                      handleChange(
                        "productIds",
                        value.map((v) => v.id)
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Products"
                        error={!!errors.productIds}
                        helperText={errors.productIds}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Category Selection */}
              {formData.applyTo === "specific_categories" && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={mockCategories}
                    getOptionLabel={(option) => option.name}
                    value={mockCategories.filter((c) =>
                      formData.categoryIds.includes(c.id)
                    )}
                    onChange={(e, value) =>
                      handleChange(
                        "categoryIds",
                        value.map((v) => v.id)
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Categories"
                        error={!!errors.categoryIds}
                        helperText={errors.categoryIds}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Validity Period */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight={600}
                  sx={{ mt: 2 }}
                >
                  Validity Period
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  disabled={formData.isPermanent}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPermanent}
                      onChange={(e) =>
                        handleChange("isPermanent", e.target.checked)
                      }
                    />
                  }
                  label="This sale never expires (permanent)"
                />
              </Grid>

              {/* Preview */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "primary.50",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "primary.main",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Sale Preview:
                  </Typography>
                  <Typography variant="body2">
                    <strong>{formData.name || "Sale Name"}</strong> -{" "}
                    {formData.discountType === "percentage"
                      ? `${formData.discountValue}% off`
                      : `₹${formData.discountValue} off`}{" "}
                    on{" "}
                    {formData.applyTo === "all_products"
                      ? "all products"
                      : formData.applyTo === "specific_products"
                      ? `${formData.productIds.length} products`
                      : `${formData.categoryIds.length} categories`}
                    {formData.enableFreeShipping && " + Free Shipping"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>

          <Divider />

          {/* Action Buttons */}
          <CardContent>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Button
                component={Link}
                href={SELLER_ROUTES.SALES}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Create Sale
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function SaleForm() {
  return (
    <RoleGuard requiredRole="seller">
      <SaleFormContent />
    </RoleGuard>
  );
}
