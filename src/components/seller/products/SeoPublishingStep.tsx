"use client";

import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
} from "@mui/material";

interface SeoPublishingStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export default function SeoPublishingStep({
  data,
  onChange,
}: SeoPublishingStepProps) {
  // Auto-generate SEO data if not set
  useEffect(() => {
    if (!data.seo.title && data.name) {
      onChange({
        seo: {
          ...data.seo,
          title: data.name,
        },
      });
    }
    if (!data.seo.description && data.shortDescription) {
      onChange({
        seo: {
          ...data.seo,
          description: data.shortDescription,
        },
      });
    }
  }, [data.name, data.shortDescription]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug.startsWith("buy-")) {
      slug = `buy-${slug}`;
    }
    onChange({ seo: { ...data.seo, slug } });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        SEO & Publishing
      </Typography>

      <Alert severity="info">
        SEO settings help your product rank better in search results
      </Alert>

      <TextField
        label="SEO Title *"
        fullWidth
        value={data.seo.title}
        onChange={(e) =>
          onChange({ seo: { ...data.seo, title: e.target.value } })
        }
        helperText="Optimal length: 50-60 characters"
        inputProps={{ maxLength: 60 }}
      />

      <TextField
        label="SEO Description *"
        fullWidth
        multiline
        rows={3}
        value={data.seo.description}
        onChange={(e) =>
          onChange({ seo: { ...data.seo, description: e.target.value } })
        }
        helperText="Optimal length: 150-160 characters"
        inputProps={{ maxLength: 160 }}
      />

      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={data.seo.keywords}
        onChange={(event, newValue) =>
          onChange({ seo: { ...data.seo, keywords: newValue } })
        }
        renderTags={(value: string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip label={option} {...getTagProps({ index })} key={index} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="SEO Keywords"
            placeholder="Type and press Enter"
            helperText="Add keywords that customers might search for"
          />
        )}
      />

      <TextField
        label="Product Slug *"
        fullWidth
        value={data.seo.slug}
        onChange={handleSlugChange}
        helperText="URL-friendly slug (must start with 'buy-')"
        placeholder="buy-product-name"
      />

      {/* Preview */}
      <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Search Preview:
        </Typography>
        <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
          {data.seo.title || "Product Title"}
        </Typography>
        <Typography variant="caption" color="success.main">
          justforview.in/{data.seo.slug || "buy-product"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {data.seo.description || "Product description appears here..."}
        </Typography>
      </Paper>

      {/* Publishing Options */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Publishing Options
      </Typography>

      <TextField
        label="Start Date"
        type="datetime-local"
        fullWidth
        value={
          data.startDate
            ? new Date(data.startDate).toISOString().slice(0, 16)
            : ""
        }
        onChange={(e) => onChange({ startDate: new Date(e.target.value) })}
        helperText="When product goes live"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Expiration Date (Optional)"
        type="datetime-local"
        fullWidth
        value={
          data.expirationDate
            ? new Date(data.expirationDate).toISOString().slice(0, 16)
            : ""
        }
        onChange={(e) =>
          onChange({
            expirationDate: e.target.value
              ? new Date(e.target.value)
              : undefined,
          })
        }
        helperText="Leave empty for permanent listing"
        InputLabelProps={{ shrink: true }}
      />

      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={data.status}
          onChange={(e) => onChange({ status: e.target.value })}
        >
          <MenuItem value="draft">Draft (Hidden)</MenuItem>
          <MenuItem value="active">Active (Visible to customers)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
