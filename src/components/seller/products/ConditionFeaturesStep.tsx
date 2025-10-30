"use client";

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

interface ConditionFeaturesStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export default function ConditionFeaturesStep({
  data,
  onChange,
}: ConditionFeaturesStepProps) {
  const addFeature = () => {
    onChange({ features: [...data.features, ""] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...data.features];
    newFeatures[index] = value;
    onChange({ features: newFeatures });
  };

  const removeFeature = (index: number) => {
    onChange({
      features: data.features.filter((_: any, i: number) => i !== index),
    });
  };

  const addSpecification = () => {
    onChange({
      specifications: [...data.specifications, { key: "", value: "" }],
    });
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newSpecs = [...data.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onChange({ specifications: newSpecs });
  };

  const removeSpecification = (index: number) => {
    onChange({
      specifications: data.specifications.filter(
        (_: any, i: number) => i !== index,
      ),
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        Condition & Features
      </Typography>

      {/* Condition */}
      <FormControl>
        <Typography variant="subtitle2" gutterBottom>
          Condition *
        </Typography>
        <RadioGroup
          value={data.condition}
          onChange={(e) => onChange({ condition: e.target.value })}
        >
          <FormControlLabel value="new" control={<Radio />} label="New" />
          <FormControlLabel
            value="used_mint"
            control={<Radio />}
            label="Used - Mint Condition"
          />
          <FormControlLabel
            value="used_good"
            control={<Radio />}
            label="Used - Good Condition"
          />
          <FormControlLabel
            value="used_fair"
            control={<Radio />}
            label="Used - Fair Condition"
          />
          <FormControlLabel
            value="damaged"
            control={<Radio />}
            label="Damaged"
          />
        </RadioGroup>
      </FormControl>

      {/* Returns */}
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={data.returnable}
              onChange={(e) => onChange({ returnable: e.target.checked })}
            />
          }
          label="Returnable"
        />
        {data.returnable && (
          <TextField
            label="Return Period (days)"
            type="number"
            value={data.returnPeriod || 7}
            onChange={(e) =>
              onChange({ returnPeriod: parseInt(e.target.value) || 7 })
            }
            sx={{ ml: 4, width: 200 }}
          />
        )}
      </Box>

      {/* Shipping */}
      <Typography variant="subtitle2">Shipping</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={data.shipping.isFree}
            onChange={(e) =>
              onChange({
                shipping: { ...data.shipping, isFree: e.target.checked },
              })
            }
          />
        }
        label="Free Shipping"
      />

      <FormControl fullWidth>
        <InputLabel>Shipping Method</InputLabel>
        <Select
          value={data.shipping.method}
          onChange={(e) =>
            onChange({ shipping: { ...data.shipping, method: e.target.value } })
          }
        >
          <MenuItem value="seller">Seller Shipped</MenuItem>
          <MenuItem value="shiprocket">Shiprocket</MenuItem>
          <MenuItem value="pickup">Pickup Only</MenuItem>
        </Select>
      </FormControl>

      {/* Weight & Dimensions */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Weight & Dimensions (Optional)
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          Required for accurate shipping calculations
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Weight (grams)"
            type="number"
            value={data.shipping.weight || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  weight: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                },
              })
            }
            placeholder="e.g., 50"
            sx={{ width: 200 }}
            InputProps={{
              inputProps: { min: 0, step: 1 },
            }}
          />
          <TextField
            label="Length (cm)"
            type="number"
            value={data.shipping.dimensions?.length || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  dimensions: {
                    ...data.shipping.dimensions,
                    length: e.target.value ? parseFloat(e.target.value) : 0,
                    width: data.shipping.dimensions?.width || 0,
                    height: data.shipping.dimensions?.height || 0,
                  },
                },
              })
            }
            placeholder="e.g., 10"
            sx={{ width: 150 }}
            InputProps={{
              inputProps: { min: 0, step: 0.1 },
            }}
          />
          <TextField
            label="Width (cm)"
            type="number"
            value={data.shipping.dimensions?.width || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  dimensions: {
                    ...data.shipping.dimensions,
                    length: data.shipping.dimensions?.length || 0,
                    width: e.target.value ? parseFloat(e.target.value) : 0,
                    height: data.shipping.dimensions?.height || 0,
                  },
                },
              })
            }
            placeholder="e.g., 5"
            sx={{ width: 150 }}
            InputProps={{
              inputProps: { min: 0, step: 0.1 },
            }}
          />
          <TextField
            label="Height (cm)"
            type="number"
            value={data.shipping.dimensions?.height || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  dimensions: {
                    ...data.shipping.dimensions,
                    length: data.shipping.dimensions?.length || 0,
                    width: data.shipping.dimensions?.width || 0,
                    height: e.target.value ? parseFloat(e.target.value) : 0,
                  },
                },
              })
            }
            placeholder="e.g., 3"
            sx={{ width: 150 }}
            InputProps={{
              inputProps: { min: 0, step: 0.1 },
            }}
          />
        </Box>
      </Box>

      {/* Product Features */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2">Product Features</Typography>
          <Button size="small" startIcon={<Add />} onClick={addFeature}>
            Add Feature
          </Button>
        </Box>
        {data.features.map((feature: string, index: number) => (
          <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              placeholder="e.g., High-speed rotation"
            />
            <IconButton size="small" onClick={() => removeFeature(index)}>
              <Delete />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* Specifications */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2">Specifications</Typography>
          <Button size="small" startIcon={<Add />} onClick={addSpecification}>
            Add Specification
          </Button>
        </Box>
        {data.specifications.map((spec: any, index: number) => (
          <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              size="small"
              value={spec.key}
              onChange={(e) =>
                updateSpecification(index, "key", e.target.value)
              }
              placeholder="Key (e.g., Weight)"
              sx={{ width: "30%" }}
            />
            <TextField
              fullWidth
              size="small"
              value={spec.value}
              onChange={(e) =>
                updateSpecification(index, "value", e.target.value)
              }
              placeholder="Value (e.g., 50g)"
            />
            <IconButton size="small" onClick={() => removeSpecification(index)}>
              <Delete />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
