"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categoryFormSchema,
  generateSlugFromName,
} from "@/lib/validations/category";
import type { Category } from "@/types";
import ImageUploader from "./ImageUploader";
import {
  IconPreview,
  getMuiIcon,
} from "@/components/shared/preview/IconPreview";
import { ImagePreview } from "@/components/shared/preview/ImagePreview";
import { FormSection } from "@/components/shared/form/FormSection";
import { FormActions } from "@/components/shared/form/FormActions";
import CategoryService from "@/lib/api/services/category.service";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  category?: Category | null;
  allCategories: Category[];
}

export default function CategoryForm({
  open,
  onClose,
  onSubmit,
  category,
  allCategories,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      parentId: category?.parentId || "",
      isActive: category?.isActive !== false,
      featured: category?.featured || false,
      sortOrder: category?.sortOrder || 0,
      image: category?.image || "",
      icon: category?.icon || "",
      seo: {
        metaTitle: category?.seo?.metaTitle || "",
        metaDescription: category?.seo?.metaDescription || "",
        keywords: category?.seo?.keywords || [],
        altText: category?.seo?.altText || "",
      },
    },
  });

  const nameValue = watch("name");
  const metaTitleValue = watch("seo.metaTitle");
  const metaDescriptionValue = watch("seo.metaDescription");
  const iconValue = watch("icon");
  const imageValue = watch("image");

  // Auto-generate slug from name
  useEffect(() => {
    if (!category && nameValue) {
      const generated = generateSlugFromName(nameValue);
      setValue("slug", generated);
    }
  }, [nameValue, category, setValue]);

  // Auto-generate meta title from name
  useEffect(() => {
    if (!category && !metaTitleValue && nameValue) {
      setValue("seo.metaTitle", nameValue);
    }
  }, [nameValue, metaTitleValue, category, setValue]);

  // Auto-generate meta description from description
  useEffect(() => {
    if (!category && !metaDescriptionValue && nameValue) {
      const description = watch("description");
      if (description) {
        setValue("seo.metaDescription", description.substring(0, 160));
      }
    }
  }, [nameValue, metaDescriptionValue, category, setValue, watch]);

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmit(data);
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  // Filter out current category and its descendants from parent options
  const availableParents = allCategories.filter((cat) => {
    if (category && cat.id === category.id) return false;
    if (category && cat.parentIds?.includes(category.id)) return false;
    return true;
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? "Edit Category" : "Create New Category"}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Basic Information */}
          <FormSection title="Basic Information">
            {/* Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Category Name"
                  placeholder="e.g., Electronics"
                  fullWidth
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            {/* Slug */}
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Slug"
                  placeholder="e.g., electronics"
                  fullWidth
                  size="small"
                  error={!!errors.slug}
                  helperText={
                    errors.slug?.message ||
                    "URL-friendly identifier (auto-generated from name)"
                  }
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  placeholder="Category description"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            {/* Image URL */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      slug={watch("slug")}
                      onError={(error) => {
                        console.error("Image upload error:", error);
                      }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ pt: 1 }}>
                <ImagePreview imageUrl={imageValue} />
              </Box>
            </Box>

            {/* Icon */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Icon"
                      placeholder="Material UI icon name or emoji"
                      fullWidth
                      size="small"
                      error={!!errors.icon}
                      helperText={errors.icon?.message}
                    />
                  )}
                />
              </Box>
              <Box sx={{ pt: 1 }}>
                <IconPreview iconName={iconValue} />
              </Box>
            </Box>
          </FormSection>

          {/* Hierarchy */}
          <FormSection title="Hierarchy">
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.parentId}>
                  <InputLabel>Parent Category (Optional)</InputLabel>
                  <Select {...field} label="Parent Category (Optional)">
                    <MenuItem value="">None (Root Category)</MenuItem>
                    {availableParents.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {`${"—".repeat(cat.level || 0)} ${cat.name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </FormSection>

          {/* Status and Organization */}
          <FormSection title="Status & Organization">
            <Box sx={{ display: "flex", gap: 2 }}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    control={<Checkbox />}
                    label="Active"
                  />
                )}
              />

              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    control={<Checkbox />}
                    label="Featured"
                  />
                )}
              />
            </Box>

            <Controller
              name="sortOrder"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sort Order"
                  type="number"
                  fullWidth
                  size="small"
                  error={!!errors.sortOrder}
                  helperText={
                    errors.sortOrder?.message || "Lower numbers appear first"
                  }
                  inputProps={{ min: 0 }}
                />
              )}
            />
          </FormSection>

          {/* SEO Information */}
          <FormSection title="SEO Information">
            <Controller
              name="seo.metaTitle"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Meta Title"
                  placeholder="Page title for search engines"
                  fullWidth
                  size="small"
                  error={!!errors.seo?.metaTitle}
                  helperText={
                    errors.seo?.metaTitle?.message ||
                    `${(field.value || "").length}/60 characters`
                  }
                  inputProps={{ maxLength: 60 }}
                />
              )}
            />

            <Controller
              name="seo.metaDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Meta Description"
                  placeholder="Page description for search engines"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  error={!!errors.seo?.metaDescription}
                  helperText={
                    errors.seo?.metaDescription?.message ||
                    `${(field.value || "").length}/160 characters`
                  }
                  inputProps={{ maxLength: 160 }}
                />
              )}
            />

            <Controller
              name="seo.altText"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Image Alt Text"
                  placeholder="Alternative text for category image"
                  fullWidth
                  size="small"
                  error={!!errors.seo?.altText}
                  helperText={
                    errors.seo?.altText?.message ||
                    `${(field.value || "").length}/125 characters`
                  }
                  inputProps={{ maxLength: 125 }}
                />
              )}
            />
          </FormSection>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <FormActions
          onCancel={handleClose}
          onSubmit={() => handleSubmit(handleFormSubmit)()}
          submitLabel={category ? "Update" : "Create"}
          cancelLabel="Cancel"
          isLoading={isSubmitting}
        />
      </DialogActions>
    </Dialog>
  );
}
