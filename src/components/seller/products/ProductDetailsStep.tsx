"use client";

import React, { useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface ProductDetailsStepProps {
  data: any;
  categories: any[];
  onChange: (updates: any) => void;
}

export default function ProductDetailsStep({
  data,
  categories,
  onChange,
}: ProductDetailsStepProps) {
  // Auto-generate slug from product name
  useEffect(() => {
    if (data.name && !data.seo.slug) {
      const slug = `buy-${data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;
      onChange({
        seo: {
          ...data.seo,
          slug,
          title: data.name,
          description: data.shortDescription || data.name,
        },
      });
    }
  }, [data.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value });
  };

  const handleShortDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ shortDescription: e.target.value });
  };

  const handleFullDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ fullDescription: e.target.value });
  };

  const handleCategoryChange = (event: any, value: any) => {
    onChange({ categoryId: value?.id || "" });
  };

  const handleTagsChange = (event: any, newValue: string[]) => {
    onChange({ tags: newValue });
  };

  const selectedCategory = categories.find((cat) => cat.id === data.categoryId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        Product Details
      </Typography>

      <TextField
        label="Product Name *"
        fullWidth
        value={data.name}
        onChange={handleNameChange}
        placeholder="e.g., Beyblade Metal Fusion Storm Pegasus"
        helperText="Enter a clear, descriptive name for your product"
      />

      <TextField
        label="Short Description"
        fullWidth
        multiline
        rows={2}
        value={data.shortDescription}
        onChange={handleShortDescriptionChange}
        placeholder="Brief description that appears in listings"
        helperText="A concise summary of your product (160 characters or less)"
        inputProps={{ maxLength: 160 }}
      />

      <TextField
        label="Full Description"
        fullWidth
        multiline
        rows={6}
        value={data.fullDescription}
        onChange={handleFullDescriptionChange}
        placeholder="Detailed product description..."
        helperText="Provide comprehensive details about your product"
      />

      <Autocomplete
        options={categories}
        getOptionLabel={(option) => option.pathString || option.name}
        value={selectedCategory || null}
        onChange={handleCategoryChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Category *"
            placeholder="Search for a category..."
            helperText="Select the most specific category for your product"
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box>
              <Typography variant="body2">{option.pathString}</Typography>
              {option.description && (
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              )}
            </Box>
          </li>
        )}
      />

      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={data.tags}
        onChange={handleTagsChange}
        renderTags={(value: string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip label={option} {...getTagProps({ index })} key={index} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Type and press Enter to add tags"
            helperText="Add tags to help customers find your product (e.g., beyblade, metal, attack)"
          />
        )}
      />

      {selectedCategory && (
        <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Selected Category: <strong>{selectedCategory.pathString}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
