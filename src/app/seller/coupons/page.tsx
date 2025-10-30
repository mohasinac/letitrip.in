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
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ToggleOn,
  ToggleOff,
  Search as SearchIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import Link from "next/link";
import type { SellerCoupon } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/api/seller";

function CouponsListContent() {
  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Coupons",
      href: SELLER_ROUTES.COUPONS,
      active: true,
    },
  ]);

  const [coupons, setCoupons] = useState<SellerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<SellerCoupon | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch coupons from API
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await apiGet<{ coupons: SellerCoupon[]; total: number }>(
        `/api/seller/coupons?${params.toString()}`
      );
      setCoupons(response.coupons);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to load coupons",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    coupon: SellerCoupon
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCoupon(coupon);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCoupon(null);
  };

  const handleToggleStatus = async (couponId: string) => {
    try {
      await apiPost(`/api/seller/coupons/${couponId}/toggle`, {});

      // Update local state
      setCoupons(
        coupons.map((c) =>
          c.id === couponId
            ? {
                ...c,
                status: c.status === "active" ? "inactive" : ("active" as any),
              }
            : c
        )
      );

      setSnackbar({
        open: true,
        message: "Coupon status updated successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error toggling coupon status:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update coupon status",
        severity: "error",
      });
    }
    handleMenuClose();
  };

  const handleDuplicate = (couponId: string) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate coupon:", couponId);
    handleMenuClose();
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      await apiDelete(`/api/seller/coupons/${couponId}`);

      // Update local state
      setCoupons(coupons.filter((c) => c.id !== couponId));

      setSnackbar({
        open: true,
        message: "Coupon deleted successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete coupon",
        severity: "error",
      });
    }
    handleMenuClose();
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "Percentage";
      case "fixed":
        return "Fixed Amount";
      case "free_shipping":
        return "Free Shipping";
      case "bogo":
        return "BOGO";
      case "cart_discount":
        return "Cart Discount";
      default:
        return type;
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.status === "active").length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
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
              Coupons
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage discount coupons and promotional codes
            </Typography>
          </Box>
          <Button
            component={Link}
            href={SELLER_ROUTES.COUPONS_NEW}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: "none" }}
          >
            Create Coupon
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Coupons
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.total}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Active Coupons
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.active}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Usage
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {stats.totalUsage}
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
                placeholder="Search coupons..."
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

        {/* Coupons Table */}
        <Card>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredCoupons.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No coupons found
              </Typography>
              <Button
                component={Link}
                href={SELLER_ROUTES.COUPONS_NEW}
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mt: 2, textTransform: "none" }}
              >
                Create Your First Coupon
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          fontFamily="monospace"
                        >
                          {coupon.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {coupon.name}
                        </Typography>
                        {coupon.description && (
                          <Typography variant="caption" color="text.secondary">
                            {coupon.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={getTypeLabel(coupon.type)} size="small" />
                      </TableCell>
                      <TableCell>
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : coupon.type === "fixed"
                          ? `₹${coupon.value}`
                          : "Free Shipping"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {coupon.usedCount}
                          {coupon.maxUses && ` / ${coupon.maxUses}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={coupon.status}
                          color={getStatusColor(coupon.status) as any}
                          size="small"
                        />
                        {coupon.isPermanent && (
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
                          onClick={(e) => handleMenuOpen(e, coupon)}
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
              selectedCoupon
                ? SELLER_ROUTES.COUPONS_EDIT(selectedCoupon.id)
                : "#"
            }
            onClick={handleMenuClose}
          >
            <EditIcon sx={{ mr: 1, fontSize: 20 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() =>
              selectedCoupon && handleToggleStatus(selectedCoupon.id)
            }
          >
            {selectedCoupon?.status === "active" ? (
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
          <MenuItem
            onClick={() => selectedCoupon && handleDuplicate(selectedCoupon.id)}
          >
            <CopyIcon sx={{ mr: 1, fontSize: 20 }} />
            Duplicate
          </MenuItem>
          <MenuItem
            onClick={() => selectedCoupon && handleDelete(selectedCoupon.id)}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default function CouponsList() {
  return (
    <RoleGuard requiredRole="seller">
      <CouponsListContent />
    </RoleGuard>
  );
}
