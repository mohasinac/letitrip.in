"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  Assignment as InvoiceIcon,
  Description as ManifestIcon,
  Room as LocationIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { useRouter } from "next/navigation";
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

export default function ShipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  useBreadcrumbTracker();
  const router = useRouter();
  const { user } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (user) {
      fetchShipmentDetails();
    }
  }, [user, params.id]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/seller/shipments/${params.id}`);
      if (response.success) {
        setShipment(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch shipment details",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);
      setSnackbar({
        open: true,
        message: "Failed to load shipment details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    try {
      setActionLoading(true);
      const response = await apiPost(
        `/api/seller/shipments/${params.id}/track`,
        {},
      );
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Tracking updated successfully",
          severity: "success",
        });
        fetchShipmentDetails();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to update tracking",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating tracking:", error);
      setSnackbar({
        open: true,
        message: "Failed to update tracking",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!confirm(`Are you sure you want to cancel this shipment?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiPost(
        `/api/seller/shipments/${params.id}/cancel`,
        {},
      );
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Shipment cancelled successfully",
          severity: "success",
        });
        fetchShipmentDetails();
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
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "success" | "error" | "warning"
    > = {
      pending: "warning",
      pickup_scheduled: "info",
      in_transit: "primary",
      out_for_delivery: "primary",
      delivered: "success",
      failed: "error",
      returned: "error",
    };
    return colors[status] || "default";
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <RoleGuard requiredRoles={["seller", "admin"]}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress />
          </Box>
        </Container>
      </RoleGuard>
    );
  }

  if (!shipment) {
    return (
      <RoleGuard requiredRoles={["seller", "admin"]}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box textAlign="center" py={8}>
            <Typography variant="h5" color="text.secondary">
              Shipment not found
            </Typography>
            <Button
              component={Link}
              href={SELLER_ROUTES.SHIPMENTS}
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2 }}
            >
              Back to Shipments
            </Button>
          </Box>
        </Container>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRoles={["seller", "admin"]}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Button
              component={Link}
              href={SELLER_ROUTES.SHIPMENTS}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              Back
            </Button>
            <Typography variant="h4">Shipment Details</Typography>
            <Chip
              label={formatStatus(shipment.status)}
              color={getStatusColor(shipment.status)}
              size="small"
            />
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleUpdateTracking}
              disabled={actionLoading}
            >
              Update Tracking
            </Button>

            {shipment.shippingLabel && (
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.open(shipment.shippingLabel, "_blank")}
              >
                Print Label
              </Button>
            )}

            {shipment.invoiceUrl && (
              <Button
                variant="outlined"
                startIcon={<InvoiceIcon />}
                onClick={() => window.open(shipment.invoiceUrl, "_blank")}
              >
                View Invoice
              </Button>
            )}

            {shipment.manifestUrl && (
              <Button
                variant="outlined"
                startIcon={<ManifestIcon />}
                onClick={() => window.open(shipment.manifestUrl, "_blank")}
              >
                View Manifest
              </Button>
            )}

            {shipment.status === "pending" && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancelShipment}
                disabled={actionLoading}
              >
                Cancel Shipment
              </Button>
            )}
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Shipment Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shipment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Number
                    </Typography>
                    <Typography
                      variant="body1"
                      component={Link}
                      href={`${SELLER_ROUTES.ORDERS}/${shipment.orderId}`}
                      color="primary"
                      sx={{ textDecoration: "none" }}
                    >
                      #{shipment.orderNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tracking Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {shipment.trackingNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Carrier
                    </Typography>
                    <Typography variant="body1">{shipment.carrier}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Weight
                    </Typography>
                    <Typography variant="body1">
                      {shipment.weight} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Dimensions
                    </Typography>
                    <Typography variant="body1">
                      {shipment.dimensions.length} × {shipment.dimensions.width}{" "}
                      × {shipment.dimensions.height} {shipment.dimensions.unit}
                    </Typography>
                  </Grid>
                  {shipment.shiprocketOrderId && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Shiprocket Order ID
                      </Typography>
                      <Typography variant="body1">
                        {shipment.shiprocketOrderId}
                      </Typography>
                    </Grid>
                  )}
                  {shipment.shiprocketShipmentId && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Shiprocket Shipment ID
                      </Typography>
                      <Typography variant="body1">
                        {shipment.shiprocketShipmentId}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Tracking History */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tracking History
                </Typography>
                {shipment.trackingHistory.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <LocationIcon
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No tracking updates yet
                    </Typography>
                  </Box>
                ) : (
                  <Timeline>
                    {shipment.trackingHistory.map((event, index) => (
                      <TimelineItem key={index}>
                        <TimelineOppositeContent color="text.secondary">
                          <Typography variant="caption">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                          {event.location && (
                            <Typography variant="caption" display="block">
                              <LocationIcon fontSize="inherit" />{" "}
                              {event.location}
                            </Typography>
                          )}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot
                            color={index === 0 ? "primary" : "grey"}
                          />
                          {index < shipment.trackingHistory.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" fontWeight={500}>
                            {event.status}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* From Address */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  From Address
                </Typography>
                <Typography variant="body2">
                  {shipment.fromAddress.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shipment.fromAddress.phone}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {shipment.fromAddress.addressLine1}
                </Typography>
                {shipment.fromAddress.addressLine2 && (
                  <Typography variant="body2" color="text.secondary">
                    {shipment.fromAddress.addressLine2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {shipment.fromAddress.city}, {shipment.fromAddress.state}{" "}
                  {shipment.fromAddress.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shipment.fromAddress.country}
                </Typography>
              </CardContent>
            </Card>

            {/* To Address */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  To Address
                </Typography>
                <Typography variant="body2">
                  {shipment.toAddress.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shipment.toAddress.phone}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {shipment.toAddress.addressLine1}
                </Typography>
                {shipment.toAddress.addressLine2 && (
                  <Typography variant="body2" color="text.secondary">
                    {shipment.toAddress.addressLine2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {shipment.toAddress.city}, {shipment.toAddress.state}{" "}
                  {shipment.toAddress.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shipment.toAddress.country}
                </Typography>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>
                <Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(shipment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {shipment.shippedAt && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Shipped
                      </Typography>
                      <Typography variant="body2">
                        {new Date(shipment.shippedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  {shipment.deliveredAt && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Delivered
                      </Typography>
                      <Typography variant="body2">
                        {new Date(shipment.deliveredAt).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(shipment.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
