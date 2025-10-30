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
  Stepper,
  Step,
  StepLabel,
  StepButton,
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
  const [activeStep, setActiveStep] = useState(0);

  const steps = ["Basic Information", "Optional Details"];

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
      parentIds: category?.parentIds || [],
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

  // Reset form when category changes (for edit mode)
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parentIds: category.parentIds || [],
        isActive: category.isActive !== false,
        featured: category.featured || false,
        sortOrder: category.sortOrder || 0,
        image: category.image || "",
        icon: category.icon || "",
        seo: {
          metaTitle: category.seo?.metaTitle || "",
          metaDescription: category.seo?.metaDescription || "",
          keywords: category.seo?.keywords || [],
          altText: category.seo?.altText || "",
        },
      });
    }
  }, [category, reset]);

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setSubmitError(null);
      // If creating new, reset to empty form
      if (!category) {
        reset({
          name: "",
          slug: "",
          description: "",
          parentIds: [],
          isActive: true,
          featured: false,
          sortOrder: 0,
          image: "",
          icon: "",
          seo: {
            metaTitle: "",
            metaDescription: "",
            keywords: [],
            altText: "",
          },
        });
      }
    }
  }, [open, category, reset]);

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

      // Check if there's a cropped image waiting to be uploaded
      if ((window as any).__uploadCroppedImage) {
        try {
          await (window as any).__uploadCroppedImage();
          // The image URL will be updated via the ImageUploader's onChange
          // Clean up the global function
          delete (window as any).__uploadCroppedImage;
        } catch (error) {
          console.error("Failed to upload cropped image:", error);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      await onSubmit(data);
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    setActiveStep(0);
    onClose();
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  // Check if step 1 has required fields filled
  const isStep1Valid = () => {
    const nameValue = watch("name");
    const slugValue = watch("slug");
    return (
      nameValue &&
      nameValue.trim().length >= 2 &&
      slugValue &&
      slugValue.trim().length >= 2
    );
  };

  // Filter out current category and its descendants from parent options
  const availableParents = allCategories.filter((cat) => {
    if (category && cat.id === category.id) return false;
    if (category && cat.parentIds?.includes(category.id)) return false;
    return true;
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {category ? "Edit Category" : "Create New Category"}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton onClick={() => handleStepClick(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Stack spacing={3}>
          {/* Step 1: Basic Information (Mandatory) */}
          {activeStep === 0 && (
            <>
              <FormSection
                title="Basic Information"
                subtitle="Required fields to create a category"
              >
                {/* Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category Name *"
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
                      label="Slug *"
                      placeholder="e.g., buy-electronics"
                      fullWidth
                      size="small"
                      error={!!errors.slug}
                      helperText={
                        errors.slug?.message ||
                        'URL-friendly identifier (must start with "buy-")'
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
                      placeholder="Brief category description"
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />

                {/* Parent Categories */}
                <Controller
                  name="parentIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.parentIds}
                    >
                      <InputLabel>Parent Categories (Optional)</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Parent Categories (Optional)"
                        renderValue={(selected) => {
                          const selectedIds = selected as string[];
                          return selectedIds
                            .map((id) => {
                              const cat = availableParents.find(
                                (c) => c.id === id,
                              );
                              return cat?.name;
                            })
                            .filter(Boolean)
                            .join(", ");
                        }}
                      >
                        {availableParents.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {`${"—".repeat(cat.minLevel || 0)} ${cat.name}`}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.parentIds && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors.parentIds.message}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Select one or more parent categories (supports multiple
                        parents)
                      </Typography>
                    </FormControl>
                  )}
                />

                {/* Status */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Active"
                      />
                    )}
                  />

                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Featured"
                      />
                    )}
                  />
                </Box>

                {/* Sort Order */}
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
                        errors.sortOrder?.message ||
                        "Lower numbers appear first"
                      }
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </FormSection>
            </>
          )}

          {/* Step 2: Optional Details */}
          {activeStep === 1 && (
            <>
              <FormSection
                title="Images & Icons"
                subtitle="Optional media for the category"
              >
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

              <FormSection
                title="SEO Information"
                subtitle="Optional SEO metadata"
              >
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
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Box>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <>
              <Button
                variant="outlined"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting || !isStep1Valid()}
              >
                Finish
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStep1Valid()}
              >
                Next
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting || !isStep1Valid()}
            >
              {isSubmitting ? "Saving..." : "Finish"}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
