"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import type { Category } from "@/types";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import CategoryTreeView from "@/components/admin/categories/CategoryTreeView";
import CategoryListView from "@/components/admin/categories/CategoryListView";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminCategoriesContent() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [tabValue, setTabValue] = useState(1);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Categories",
      href: "/admin/categories",
      active: true,
    },
  ]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<Category[]>(
        "/admin/categories?format=list"
      );
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch when user is authenticated and auth loading is complete
    if (!authLoading && user) {
      fetchCategories();
    } else if (!authLoading && !user) {
      setError("Not authenticated");
      setLoading(false);
    }
  }, [authLoading, user, fetchCategories]);

  const handleOpenDialog = (category?: Category) => {
    setSelectedCategory(category || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setError(null);
      const method = selectedCategory ? "PATCH" : "POST";
      const url = selectedCategory
        ? `/admin/categories?id=${selectedCategory.id}`
        : `/admin/categories`;

      const data = await (method === "PATCH"
        ? apiClient.patch<Category>(url, formData)
        : apiClient.post<Category>(url, formData));

      setSuccess(
        selectedCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );
      handleCloseDialog();
      fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save category");
      console.error(err);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setError(null);
      await apiClient.delete(`/admin/categories?id=${categoryId}`);

      setSuccess("Category deleted successfully");
      fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete category");
      console.error(err);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Category Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Category
          </Button>
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

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                aria-label="category view"
              >
                <Tab label="Tree View" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="List View" id="tab-1" aria-controls="tabpanel-1" />
              </Tabs>
            </Box>

            {/* Tree View */}
            <TabPanel value={tabValue} index={0}>
              {categories.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">
                    No categories found. Create your first category!
                  </Typography>
                </Box>
              ) : (
                <CategoryTreeView
                  categories={categories}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              )}
            </TabPanel>

            {/* List View */}
            <TabPanel value={tabValue} index={1}>
              {categories.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">
                    No categories found. Create your first category!
                  </Typography>
                </Box>
              ) : (
                <CategoryListView
                  categories={categories}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              )}
            </TabPanel>
          </Card>
        )}
      </Container>

      {/* Category Form Dialog */}
      <CategoryForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        category={selectedCategory}
        allCategories={categories}
      />
    </Box>
  );
}

export default function AdminCategories() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminCategoriesContent />
    </RoleGuard>
  );
}
