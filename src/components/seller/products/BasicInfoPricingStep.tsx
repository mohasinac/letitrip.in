"use client";

import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Divider,
  Alert,
} from "@mui/material";
import { Category } from "@mui/icons-material";

interface BasicInfoPricingStepProps {
  data: any;
  categories: any[];
  addresses: any[];
  onChange: (updates: any) => void;
}

export default function BasicInfoPricingStep({
  data,
  categories,
  addresses,
  onChange,
}: BasicInfoPricingStepProps) {
  // Auto-generate SKU when name or category changes
  const generateSKU = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);

    // Extract category name
    const category = categories.find((c) => c.id === data.categoryId);
    const categoryName =
      category?.name?.toUpperCase().substring(0, 8) || "PROD";

    // Extract product code from name (4 chars)
    const productName = data.name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const productCode = productName.substring(0, 4) || "ITEM";

    return `${categoryName}-${productCode}-${timestamp}-${random}`;
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && event.currentTarget) {
      const input = event.currentTarget as HTMLInputElement;
      const value = input.value.trim();
      if (value && !data.tags.includes(value)) {
        onChange({ tags: [...data.tags, value] });
        input.value = "";
      }
      event.preventDefault();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ tags: data.tags.filter((tag: string) => tag !== tagToRemove) });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        Basic Information & Pricing
      </Typography>

      <Alert severity="info">
        Fill in the essential product details and pricing. SKU is optional and
        will be auto-generated if left empty.
      </Alert>

      {/* Product Details */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
        >
          Product Details
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            required
            label="Product Name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., Beyblade Burst Evolution Dragoon"
            helperText="Clear, descriptive name for your product"
          />

          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={data.categoryId}
              onChange={(e) => onChange({ categoryId: e.target.value })}
              startAdornment={
                <InputAdornment position="start">
                  <Category />
                </InputAdornment>
              }
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            required
            label="Short Description"
            value={data.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            placeholder="Brief one-line description"
            helperText="50-100 characters"
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Full Description"
            value={data.fullDescription}
            onChange={(e) => onChange({ fullDescription: e.target.value })}
            placeholder="Detailed product description, features, specifications..."
            helperText="Detailed information about your product"
          />

          <Box>
            <TextField
              fullWidth
              label="Tags (Press Enter to add)"
              onKeyDown={handleAddTag}
              placeholder="e.g., beyblade, evolution, attack-type"
              helperText="Add relevant tags for better discoverability"
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {data.tags.map((tag: string) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Pricing */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
        >
          Pricing
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            sx={{ flex: "1 1 200px" }}
            required
            type="number"
            label="Selling Price"
            value={data.pricing.price || ""}
            onChange={(e) =>
              onChange({
                pricing: {
                  ...data.pricing,
                  price: parseFloat(e.target.value) || 0,
                },
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
              inputProps: { min: 0, step: 0.01 },
            }}
            helperText="Your selling price"
          />

          <TextField
            sx={{ flex: "1 1 200px" }}
            type="number"
            label="Compare at Price (Optional)"
            value={data.pricing.compareAtPrice || ""}
            onChange={(e) =>
              onChange({
                pricing: {
                  ...data.pricing,
                  compareAtPrice: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                },
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
              inputProps: { min: 0, step: 0.01 },
            }}
            helperText="Original/MRP price"
          />

          <TextField
            sx={{ flex: "1 1 200px" }}
            type="number"
            label="Cost per Item (Optional)"
            value={data.pricing.cost || ""}
            onChange={(e) =>
              onChange({
                pricing: {
                  ...data.pricing,
                  cost: e.target.value ? parseFloat(e.target.value) : undefined,
                },
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
              inputProps: { min: 0, step: 0.01 },
            }}
            helperText="Your cost (private)"
          />
        </Box>
      </Box>

      <Divider />

      {/* Inventory */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
        >
          Inventory
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              sx={{ flex: "1 1 300px" }}
              label="SKU (Optional)"
              value={data.inventory.sku}
              onChange={(e) =>
                onChange({
                  inventory: { ...data.inventory, sku: e.target.value },
                })
              }
              placeholder="Auto-generated if empty"
              helperText={
                <span>
                  Stock Keeping Unit.{" "}
                  <span
                    style={{ color: "#1976d2", cursor: "pointer" }}
                    onClick={() => {
                      const sku = generateSKU();
                      onChange({ inventory: { ...data.inventory, sku } });
                    }}
                  >
                    Generate SKU
                  </span>
                </span>
              }
            />

            <TextField
              sx={{ flex: "1 1 150px" }}
              required
              type="number"
              label="Quantity"
              value={data.inventory.quantity || ""}
              onChange={(e) =>
                onChange({
                  inventory: {
                    ...data.inventory,
                    quantity: parseInt(e.target.value) || 0,
                  },
                })
              }
              InputProps={{
                inputProps: { min: 0, step: 1 },
              }}
              helperText="Available stock"
            />

            <TextField
              sx={{ flex: "1 1 150px" }}
              type="number"
              label="Low Stock Alert"
              value={data.inventory.lowStockThreshold || ""}
              onChange={(e) =>
                onChange({
                  inventory: {
                    ...data.inventory,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  },
                })
              }
              InputProps={{
                inputProps: { min: 0, step: 1 },
              }}
              helperText="Alert threshold"
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Pickup Location (Optional)</InputLabel>
            <Select
              value={data.pickupAddressId || ""}
              onChange={(e) => onChange({ pickupAddressId: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {addresses.map((address) => (
                <MenuItem key={address.id} value={address.id}>
                  {address.addressLine1}, {address.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
}
