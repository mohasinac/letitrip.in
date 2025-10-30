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
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  FlightTakeoff as TransitIcon,
  CheckCircle as DeliveredIcon,
  Error as FailedIcon,
  TrackChanges as TrackChangesIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import Link from "next/link";

interface ShipmentTrackingEvent {
  status: string;
  location?: string;
  description: string;
  timestamp: string;
}

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface Shipment {
  id: string;
  sellerId: string;
  orderId: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  fromAddress: Address;
  toAddress: Address;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  status:
    | "pending"
    | "pickup_scheduled"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  trackingHistory: ShipmentTrackingEvent[];
  shippingLabel?: string;
  invoiceUrl?: string;
  manifestUrl?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

interface ShipmentStats {
  total: number;
  pending: number;
  pickupScheduled: number;
  inTransit: number;
  delivered: number;
  failed: number;
}

export default function ShipmentsPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Shipments", href: "/seller/shipments" },
  ]);
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentStats>({
    total: 0,
    pending: 0,
    pickupScheduled: 0,
    inTransit: 0,
    delivered: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (user) {
      fetchShipments();
    } else {
      setLoading(false);
    }
  }, [user, statusFilter, searchQuery]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet(
        `/api/seller/shipments?status=${statusFilter}&search=${searchQuery}`,
      );
      if (response.success) {
        setShipments(response.data || []);
        setStats(response.stats || stats);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch shipments",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching shipments:", error);
      const errorMessage = error.message || "Failed to load shipments";
      setSnackbar({
        open: true,
        message: errorMessage.includes("not authenticated")
          ? "Please log in to view shipments"
          : errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    shipment: Shipment,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedShipment(shipment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedShipment(null);
  };

  const handleTrackShipment = async () => {
    if (!selectedShipment) return;

    try {
      const response = await apiPost(
        `/api/seller/shipments/${selectedShipment.id}/track`,
        {},
      );
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Tracking updated successfully",
          severity: "success",
        });
        fetchShipments();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to update tracking",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error tracking shipment:", error);
      setSnackbar({
        open: true,
        message: "Failed to update tracking",
        severity: "error",
      });
    }
    handleMenuClose();
  };

  const handlePrintLabel = () => {
    if (selectedShipment?.shippingLabel) {
      window.open(selectedShipment.shippingLabel, "_blank");
    } else {
      setSnackbar({
        open: true,
        message: "Shipping label not available",
        severity: "warning",
      });
    }
    handleMenuClose();
  };

  const handleCancelShipment = async () => {
    if (!selectedShipment) return;

    if (
      confirm(
        `Are you sure you want to cancel shipment for order #${selectedShipment.orderNumber}?`,
      )
    ) {
      try {
        const response = await apiPost(
          `/api/seller/shipments/${selectedShipment.id}/cancel`,
          {},
        );
        if (response.success) {
          setSnackbar({
            open: true,
            message: "Shipment cancelled successfully",
            severity: "success",
          });
          fetchShipments();
        } else {
          setSnackbar({
            open: true,
            message: response.error || "Failed to cancel shipment",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error cancelling shipment:", error);
        setSnackbar({
          open: true,
          message: "Failed to cancel shipment",
          severity: "error",
        });
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "success" | "error" | "warning"
    > = {
      pending: "warning",
      pickup_scheduled: "primary",
      in_transit: "primary",
      out_for_delivery: "primary",
      delivered: "success",
      failed: "error",
      returned: "error",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <ScheduleIcon fontSize="small" />,
      pickup_scheduled: <ShippingIcon fontSize="small" />,
      in_transit: <TransitIcon fontSize="small" />,
      out_for_delivery: <TransitIcon fontSize="small" />,
      delivered: <DeliveredIcon fontSize="small" />,
      failed: <FailedIcon fontSize="small" />,
      returned: <FailedIcon fontSize="small" />,
    };
    return icons[status] || null;
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <RoleGuard requiredRoles={["seller", "admin"]}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          mb={4}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Shipments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage all your shipments
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ShippingIcon />}
              component={Link}
              href="/seller/shipments/bulk-labels"
            >
              Bulk Labels
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrackChangesIcon />}
              component={Link}
              href="/seller/shipments/bulk-track"
            >
              Track Multiple
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pending}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pickup Scheduled
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.pickupScheduled}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  In Transit
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.inTransit}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Delivered
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.delivered}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Failed
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.failed}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={statusFilter}
            onChange={(e, newValue) => setStatusFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Shipments" value="all" />
            <Tab label="Pending" value="pending" />
            <Tab label="Pickup Scheduled" value="pickup_scheduled" />
            <Tab label="In Transit" value="in_transit" />
            <Tab label="Delivered" value="delivered" />
            <Tab label="Failed" value="failed" />
          </Tabs>
        </Card>

        {/* Search & Actions */}
        <Card sx={{ mb: 3 }}>
          <Box p={2} display="flex" gap={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search by tracking number, order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchShipments}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Card>

        {/* Shipments Table */}
        <Card>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : shipments.length === 0 ? (
            <Box textAlign="center" py={8}>
              <ShippingIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No shipments found
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Shipments will appear here once you initiate shipping for orders
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Tracking #</TableCell>
                    <TableCell>Carrier</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id} hover>
                      <TableCell>
                        <Typography
                          component={Link}
                          href={`${SELLER_ROUTES.ORDERS}/${shipment.orderId}`}
                          variant="body2"
                          color="primary"
                          sx={{ textDecoration: "none" }}
                        >
                          #{shipment.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {shipment.trackingNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {shipment.carrier}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {shipment.fromAddress.city},{" "}
                          {shipment.fromAddress.state}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {shipment.toAddress.city}, {shipment.toAddress.state}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(shipment.status)}
                          label={formatStatus(shipment.status)}
                          color={getStatusColor(shipment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(shipment.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, shipment)}
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
              selectedShipment
                ? `${SELLER_ROUTES.SHIPMENTS}/${selectedShipment.id}`
                : "#"
            }
            onClick={handleMenuClose}
          >
            <ViewIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleTrackShipment}>
            <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
            Update Tracking
          </MenuItem>
          <MenuItem onClick={handlePrintLabel}>
            <PrintIcon fontSize="small" sx={{ mr: 1 }} />
            Print Label
          </MenuItem>
          {selectedShipment?.status === "pending" && (
            <MenuItem onClick={handleCancelShipment}>
              <CancelIcon fontSize="small" sx={{ mr: 1 }} />
              Cancel Shipment
            </MenuItem>
          )}
        </Menu>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </RoleGuard>
  );
}
