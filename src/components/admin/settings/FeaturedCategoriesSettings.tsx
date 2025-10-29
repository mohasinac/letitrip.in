"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import type { Category } from "@/types";

interface CategoryWithMeta extends Category {
  productCount?: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

export default function FeaturedCategoriesSettings() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<CategoryWithMeta[]>(
        "/admin/categories?format=list"
      );

      // Sort by sortOrder and featured status
      const sortedData = data.sort((a, b) => {
        // Featured categories first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by sortOrder
        return a.sortOrder - b.sortOrder;
      });

      setCategories(sortedData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCategories();
    }
  }, [authLoading, user, fetchCategories]);

  const handleToggleFeatured = (categoryId: string) => {
    setCategories((prev) => {
      const currentFeaturedCount = prev.filter((cat) => cat.featured).length;
      const category = prev.find((cat) => cat.id === categoryId);

      // Check if trying to add a 7th featured category
      if (category && !category.featured && currentFeaturedCount >= 6) {
        setError(
          "Maximum 6 categories can be featured. Please unfeature another category first."
        );
        setTimeout(() => setError(null), 5000);
        return prev;
      }

      const updated = prev.map((cat) =>
        cat.id === categoryId ? { ...cat, featured: !cat.featured } : cat
      );
      return updated;
    });
    setHasChanges(true);
  };

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
    setHasChanges(true);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index - 1]] = [
      newCategories[index - 1],
      newCategories[index],
    ];
    // Update sortOrder
    newCategories.forEach((cat, idx) => {
      cat.sortOrder = idx;
    });
    setCategories(newCategories);
    setHasChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [
      newCategories[index + 1],
      newCategories[index],
    ];
    // Update sortOrder
    newCategories.forEach((cat, idx) => {
      cat.sortOrder = idx;
    });
    setCategories(newCategories);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate: Check if more than 6 categories are featured
      const featuredCount = categories.filter((cat) => cat.featured).length;
      if (featuredCount > 6) {
        setError(
          "Cannot save: Maximum 6 categories can be featured. Please unfeature some categories."
        );
        setSaving(false);
        return;
      }

      // Prepare updates
      const updates = categories.map((cat) => ({
        id: cat.id,
        featured: cat.featured || false,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
      }));

      // Send batch update
      await apiClient.post("/admin/categories/batch-update", { updates });

      setSuccess("Featured categories updated successfully");
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save changes");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchCategories();
    setHasChanges(false);
    setSearchTerm("");
  };

  const featuredCategories = categories.filter((cat) => cat.featured);
  const nonFeaturedCategories = categories.filter((cat) => !cat.featured);

  // Filter categories based on search term
  const filteredNonFeaturedCategories = nonFeaturedCategories.filter((cat) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(search) ||
      cat.slug.toLowerCase().includes(search) ||
      cat.description?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <TrendingIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Featured Categories ({featuredCategories.length}/6)
              </Typography>
            </Box>
            {featuredCategories.length > 6 && (
              <Chip
                label={`Exceeds limit - ${featuredCategories.length - 6} too many`}
                color="error"
                size="small"
              />
            )}
          </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={!hasChanges || loading}
            sx={{ textTransform: "none" }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || saving || loading}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Save Changes
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          💡 Tips:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
          <li>
            <strong>Maximum 6 categories</strong> can be featured on the
            homepage
          </li>
          <li>
            Use the arrows to reorder categories (top to bottom = left to right)
          </li>
          <li>Featured categories must be active to appear on the homepage</li>
          <li>Categories with no in-stock products will appear grey</li>
          <li>Attempting to add a 7th category will show an error</li>
        </Typography>
      </Alert>

      {/* Warning for exceeding limit */}
      {featuredCategories.length > 6 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            ⚠️ Too many featured categories!
          </Typography>
          <Typography variant="body2">
            You have selected {featuredCategories.length} categories, but only 6
            can be featured. Please unfeature {featuredCategories.length - 6}{" "}
            {featuredCategories.length - 6 === 1 ? "category" : "categories"}{" "}
            before saving.
          </Typography>
        </Alert>
      )}

      {/* Featured Categories Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Featured Categories ({featuredCategories.length}/6)
              </Typography>
            </Box>
            {featuredCategories.length > 6 && (
              <Chip
                label="Exceeds limit - only first 6 will show"
                color="warning"
                size="small"
              />
            )}
          </Box>

          {featuredCategories.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <Typography>
                No featured categories selected. Toggle the "Featured" switch
                below to add categories.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {featuredCategories.map((category, index) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  index={categories.findIndex((c) => c.id === category.id)}
                  totalCount={categories.length}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleActive={handleToggleActive}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFeatured={true}
                  showWarning={index >= 6}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Available Categories Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Available Categories ({nonFeaturedCategories.length})
            </Typography>
          </Box>

          {nonFeaturedCategories.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <Typography>All categories are featured!</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {nonFeaturedCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  index={categories.findIndex((c) => c.id === category.id)}
                  totalCount={categories.length}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleActive={handleToggleActive}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFeatured={false}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

interface CategoryItemProps {
  category: CategoryWithMeta;
  index: number;
  totalCount: number;
  onToggleFeatured: (id: string) => void;
  onToggleActive: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFeatured: boolean;
  showWarning?: boolean;
}

function CategoryItem({
  category,
  index,
  totalCount,
  onToggleFeatured,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  isFeatured,
  showWarning,
}: CategoryItemProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: showWarning ? "warning.main" : "divider",
        backgroundColor: showWarning
          ? (theme) => theme.palette.warning.light + "10"
          : "background.paper",
        display: "flex",
        alignItems: "center",
        gap: 2,
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      {/* Drag Handle & Order Controls */}
      {isFeatured && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Tooltip title="Move up">
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                sx={{ p: 0.5 }}
              >
                <DragIcon
                  sx={{
                    transform: "rotate(-90deg)",
                    fontSize: 20,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down">
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveDown(index)}
                disabled={index === totalCount - 1}
                sx={{ p: 0.5 }}
              >
                <DragIcon
                  sx={{
                    transform: "rotate(90deg)",
                    fontSize: 20,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      {/* Category Image */}
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {category.image ? (
          <Box
            component="img"
            src={category.image}
            alt={category.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <ImageIcon sx={{ fontSize: 30, color: "text.secondary" }} />
        )}
      </Box>

      {/* Category Info */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {category.name}
          </Typography>
          {showWarning && (
            <Chip
              label="Won't show"
              size="small"
              color="warning"
              sx={{ height: 20 }}
            />
          )}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 0.5,
            fontFamily: "monospace",
          }}
        >
          {category.slug}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label={`${category.productCount || 0} products`}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
          {category.inStockCount !== undefined && (
            <Chip
              label={`${category.inStockCount} in stock`}
              size="small"
              color={category.inStockCount > 0 ? "success" : "default"}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          )}
        </Stack>
      </Box>

      {/* Controls */}
      <Stack direction="row" spacing={1} alignItems="center">
        <FormControlLabel
          control={
            <Switch
              checked={category.isActive}
              onChange={() => onToggleActive(category.id)}
              size="small"
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {category.isActive ? (
                <VisibilityIcon sx={{ fontSize: 18 }} />
              ) : (
                <VisibilityOffIcon sx={{ fontSize: 18 }} />
              )}
              <Typography variant="caption">Active</Typography>
            </Box>
          }
          labelPlacement="start"
          sx={{ m: 0 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={category.featured}
              onChange={() => onToggleFeatured(category.id)}
              size="small"
              color="primary"
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TrendingIcon sx={{ fontSize: 18 }} />
              <Typography variant="caption">Featured</Typography>
            </Box>
          }
          labelPlacement="start"
          sx={{ m: 0 }}
        />
      </Stack>
    </Paper>
  );
}
