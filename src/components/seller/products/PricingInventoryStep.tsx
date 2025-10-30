"use client";

import React from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Switch,
  FormControlLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Autorenew } from "@mui/icons-material";

interface PricingInventoryStepProps {
  data: any;
  addresses: any[];
  onChange: (updates: any) => void;
}

export default function PricingInventoryStep({
  data,
  addresses,
  onChange,
}: PricingInventoryStepProps) {
  const generateSKU = () => {
    const sku = `SKU-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
    onChange({ inventory: { ...data.inventory, sku } });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        Pricing & Inventory
      </Typography>

      {/* Pricing */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}
      >
        <TextField
          label="Regular Price *"
          type="number"
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
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
        <TextField
          label="Compare At Price"
          type="number"
          value={data.pricing.compareAtPrice || ""}
          onChange={(e) =>
            onChange({
              pricing: {
                ...data.pricing,
                compareAtPrice: parseFloat(e.target.value) || undefined,
              },
            })
          }
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
          helperText="Show savings"
        />
        <TextField
          label="Cost"
          type="number"
          value={data.pricing.cost || ""}
          onChange={(e) =>
            onChange({
              pricing: {
                ...data.pricing,
                cost: parseFloat(e.target.value) || undefined,
              },
            })
          }
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
          helperText="For profit calculation"
        />
      </Box>

      {/* Inventory */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Inventory
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="SKU *"
          fullWidth
          value={data.inventory.sku}
          onChange={(e) =>
            onChange({ inventory: { ...data.inventory, sku: e.target.value } })
          }
          helperText="Stock Keeping Unit"
        />
        <Button
          variant="outlined"
          onClick={generateSKU}
          startIcon={<Autorenew />}
          sx={{ minWidth: 150 }}
        >
          Generate
        </Button>
      </Box>

      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}
      >
        <TextField
          label="Quantity *"
          type="number"
          value={data.inventory.quantity}
          onChange={(e) =>
            onChange({
              inventory: {
                ...data.inventory,
                quantity: parseInt(e.target.value) || 0,
              },
            })
          }
          helperText="Available stock"
        />
        <TextField
          label="Low Stock Threshold"
          type="number"
          value={data.inventory.lowStockThreshold}
          onChange={(e) =>
            onChange({
              inventory: {
                ...data.inventory,
                lowStockThreshold: parseInt(e.target.value) || 10,
              },
            })
          }
          helperText="Alert when stock is low"
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={data.inventory.trackInventory}
            onChange={(e) =>
              onChange({
                inventory: {
                  ...data.inventory,
                  trackInventory: e.target.checked,
                },
              })
            }
          />
        }
        label="Track inventory"
      />

      {addresses.length > 0 && (
        <FormControl fullWidth>
          <InputLabel>Pickup Address</InputLabel>
          <Select
            value={data.pickupAddressId || ""}
            onChange={(e) => onChange({ pickupAddressId: e.target.value })}
          >
            {addresses.map((addr: any) => (
              <MenuItem key={addr.id} value={addr.id}>
                {addr.label} - {addr.address}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
}
