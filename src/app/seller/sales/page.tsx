"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  TextField,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn,
  ToggleOff,
  Search as SearchIcon,
  LocalOffer as OfferIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import Link from "next/link";
import type { SellerSale } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/api/seller";

function SalesListContent() {
  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Sales",
      href: SELLER_ROUTES.SALES,
      active: true,
    },
  ]);

  const [sales, setSales] = useState<SellerSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSale, setSelectedSale] = useState<SellerSale | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingSale, setDeletingSale] = useState(false);

  // Fetch sales from API
  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await apiGet<{ success: boolean; data: SellerSale[] }>(
        `/api/seller/sales${params.toString() ? `?${params.toString()}` : ""}`,
      );

      if (response.success && response.data) {
        setSales(response.data);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to load sales",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [statusFilter]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    sale: SellerSale,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedSale(sale);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSale(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedSale) return;

    try {
      const response = await apiPost<{
        success: boolean;
        data: { status: string };
        message?: string;
      }>(`/api/seller/sales/${selectedSale.id}/toggle`, {});

      if (response.success) {
        // Update local state
        setSales(
          sales.map((s) =>
            s.id === selectedSale.id
              ? { ...s, status: response.data.status as any }
              : s,
          ),
        );

        setSnackbar({
          open: true,
          message:
            response.message ||
            `Sale ${
              response.data.status === "active" ? "activated" : "deactivated"
            } successfully`,
          severity: "success",
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to toggle sale status",
        severity: "error",
      });
    } finally {
      handleMenuClose();
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSale) return;

    try {
      setDeletingSale(true);
      const response = await apiDelete<{ success: boolean; message?: string }>(
        `/api/seller/sales/${selectedSale.id}`,
      );

      if (response.success) {
        // Remove from local state
        setSales(sales.filter((s) => s.id !== selectedSale.id));

        setSnackbar({
          open: true,
          message: "Sale deleted successfully",
          severity: "success",
        });

        setSelectedSale(null);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete sale",
        severity: "error",
      });
    } finally {
      setDeletingSale(false);
      setDeleteDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "expired":
        return "error";
      case "scheduled":
        return "info";
      default:
        return "default";
    }
  };

  const getApplyToLabel = (applyTo: string) => {
    switch (applyTo) {
      case "all_products":
        return "All Products";
      case "specific_products":
        return "Specific Products";
      case "specific_categories":
        return "Specific Categories";
      default:
        return applyTo;
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: sales.length,
    active: sales.filter((s) => s.status === "active").length,
    totalRevenue: sales.reduce((sum, s) => sum + s.stats.revenue, 0),
    totalOrders: sales.reduce((sum, s) => sum + s.stats.ordersCount, 0),
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
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Sales
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage store-wide sales and promotions
            </Typography>
          </Box>
          <Button
            component={Link}
            href={SELLER_ROUTES.SALES_NEW}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: "none" }}
          >
            Create Sale
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Sales
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.total}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Active Sales
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.active}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {stats.totalOrders}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                ₹{stats.totalRevenue.toLocaleString()}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Sales Table */}
        <Card>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredSales.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <OfferIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No sales found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create sales to offer flat discounts on your products
              </Typography>
              <Button
                component={Link}
                href={SELLER_ROUTES.SALES_NEW}
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ textTransform: "none" }}
              >
                Create Your First Sale
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Apply To</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {sale.name}
                        </Typography>
                        {sale.description && (
                          <Typography variant="caption" color="text.secondary">
                            {sale.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {sale.discountType === "percentage"
                              ? `${sale.discountValue}%`
                              : `₹${sale.discountValue}`}
                          </Typography>
                          {sale.enableFreeShipping && (
                            <Chip
                              label="Free Shipping"
                              size="small"
                              color="info"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getApplyToLabel(sale.applyTo)}
                        </Typography>
                        {sale.applyTo !== "all_products" && (
                          <Typography variant="caption" color="text.secondary">
                            {sale.stats.productsAffected} products
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {sale.stats.ordersCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="success.main"
                        >
                          ₹{sale.stats.revenue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sale.status}
                          color={getStatusColor(sale.status) as any}
                          size="small"
                        />
                        {sale.isPermanent && (
                          <Chip
                            label="Permanent"
                            size="small"
                            sx={{ ml: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, sale)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            component={Link}
            href={
              selectedSale ? SELLER_ROUTES.SALES_EDIT(selectedSale.id) : "#"
            }
            onClick={handleMenuClose}
          >
            <EditIcon sx={{ mr: 1, fontSize: 20 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => selectedSale && handleToggleStatus()}>
            {selectedSale?.status === "active" ? (
              <>
                <ToggleOff sx={{ mr: 1, fontSize: 20 }} />
                Disable
              </>
            ) : (
              <>
                <ToggleOn sx={{ mr: 1, fontSize: 20 }} />
                Enable
              </>
            )}
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Delete Sale?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{selectedSale?.name}"? This
              action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog(false)}
              disabled={deletingSale}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deletingSale}
            >
              {deletingSale ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default function SalesList() {
  return (
    <RoleGuard requiredRole="seller">
      <SalesListContent />
    </RoleGuard>
  );
}
