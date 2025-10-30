"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Stack,
  Divider,
  TextField,
  InputAdornment,
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
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShipIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api/seller";
import { useSearchParams } from "next/navigation";

interface TrackingEvent {
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  toAddress: {
    name: string;
    city: string;
    state: string;
  };
  trackingHistory: TrackingEvent[];
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export default function BulkTrackingPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Shipments", href: "/seller/shipments" },
    { label: "Track Multiple", href: "/seller/shipments/bulk-track" },
  ]);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchShipments();
      // Pre-select shipments from URL params
      const ids = searchParams?.get("ids");
      if (ids) {
        setSelectedShipments(ids.split(","));
      }
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet("/api/seller/shipments?status=all");
      if (response.success) {
        // Filter shipments that are trackable (not pending or cancelled)
        const trackableShipments = (response.data || []).filter(
          (s: Shipment) =>
            !["pending", "cancelled"].includes(s.status) && s.trackingNumber,
        );
        setShipments(trackableShipments);
      } else {
        setError(response.error || "Failed to fetch shipments");
      }
    } catch (error: any) {
      console.error("Error fetching shipments:", error);
      setError(error.message || "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    if (selectedShipments.length === 0) {
      setError("Please select at least one shipment to track");
      return;
    }

    try {
      setRefreshing(true);
      setError("");

      // Refresh tracking for selected shipments
      const refreshPromises = selectedShipments.map((shipmentId) =>
        apiGet(`/api/seller/shipments/${shipmentId}`),
      );

      const responses = await Promise.all(refreshPromises);

      // Update shipments with fresh data
      const updatedShipments = shipments.map((shipment) => {
        const response: any = responses.find(
          (r: any) => r.success && r.data?.id === shipment.id,
        );
        return response ? response.data : shipment;
      });

      setShipments(updatedShipments);
    } catch (error: any) {
      console.error("Error refreshing tracking:", error);
      setError(error.message || "Failed to refresh tracking");
    } finally {
      setRefreshing(false);
    }
  };

  const toggleShipment = (shipmentId: string) => {
    setSelectedShipments((prev) =>
      prev.includes(shipmentId)
        ? prev.filter((id) => id !== shipmentId)
        : [...prev, shipmentId],
    );
  };

  const toggleAll = () => {
    if (selectedShipments.length === filteredShipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(filteredShipments.map((s) => s.id));
    }
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.trackingNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shipment.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.toAddress?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "in_transit":
      case "out_for_delivery":
        return "info";
      case "pickup_scheduled":
        return "warning";
      case "failed":
      case "returned":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckIcon />;
      case "in_transit":
      case "out_for_delivery":
        return <ShipIcon />;
      case "pickup_scheduled":
        return <LocationIcon />;
      default:
        return <ShipIcon />;
    }
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
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

  return (
    <RoleGuard requiredRole="seller">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Track Multiple Shipments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and refresh tracking status for multiple shipments at once
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Actions */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                placeholder="Search tracking number, order ID, or customer..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 300 }}
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
                onClick={toggleAll}
                startIcon={
                  selectedShipments.length === filteredShipments.length ? (
                    <CheckIcon />
                  ) : null
                }
              >
                {selectedShipments.length === filteredShipments.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              <Box sx={{ flex: 1 }} />

              <Chip
                label={`${selectedShipments.length} / ${filteredShipments.length} selected`}
                color={selectedShipments.length > 0 ? "primary" : "default"}
              />

              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={refreshTracking}
                disabled={selectedShipments.length === 0 || refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh Tracking"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Shipments List */}
        {filteredShipments.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery
                  ? "No matching shipments found"
                  : "No trackable shipments"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? "Try a different search term"
                  : "Shipments with tracking numbers will appear here"}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={3}>
            {filteredShipments
              .filter(
                (s) =>
                  selectedShipments.includes(s.id) ||
                  selectedShipments.length === 0,
              )
              .map((shipment) => (
                <Card
                  key={shipment.id}
                  sx={{
                    bgcolor: selectedShipments.includes(shipment.id)
                      ? "action.selected"
                      : "background.paper",
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      spacing={2}
                      mb={2}
                    >
                      <Checkbox
                        checked={selectedShipments.includes(shipment.id)}
                        onChange={() => toggleShipment(shipment.id)}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          flexWrap="wrap"
                          mb={1}
                        >
                          <Typography variant="h6">
                            {shipment.trackingNumber}
                          </Typography>
                          <Chip
                            label={shipment.status
                              .replace(/_/g, " ")
                              .toUpperCase()}
                            size="small"
                            color={getStatusColor(shipment.status)}
                            icon={getStatusIcon(shipment.status)}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Order: {shipment.orderId} • {shipment.carrier}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          To: {shipment.toAddress?.name},{" "}
                          {shipment.toAddress?.city},{" "}
                          {shipment.toAddress?.state}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Tracking Timeline */}
                    {shipment.trackingHistory &&
                    shipment.trackingHistory.length > 0 ? (
                      <Timeline position="right">
                        {shipment.trackingHistory
                          .slice()
                          .reverse()
                          .map((event, index) => (
                            <TimelineItem key={index}>
                              <TimelineOppositeContent
                                color="text.secondary"
                                sx={{ flex: 0.3 }}
                              >
                                <Typography variant="caption">
                                  {new Date(
                                    event.timestamp,
                                  ).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {new Date(
                                    event.timestamp,
                                  ).toLocaleTimeString()}
                                </Typography>
                              </TimelineOppositeContent>

                              <TimelineSeparator>
                                <TimelineDot
                                  color={index === 0 ? "primary" : "grey"}
                                  variant={index === 0 ? "filled" : "outlined"}
                                />
                                {index <
                                  shipment.trackingHistory.length - 1 && (
                                  <TimelineConnector />
                                )}
                              </TimelineSeparator>

                              <TimelineContent>
                                <Typography
                                  variant="body2"
                                  fontWeight={index === 0 ? "bold" : "normal"}
                                >
                                  {event.status
                                    .replace(/_/g, " ")
                                    .toUpperCase()}
                                </Typography>
                                {event.location && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    📍 {event.location}
                                  </Typography>
                                )}
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  {event.description}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                      </Timeline>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        py={2}
                      >
                        No tracking history available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
          </Stack>
        )}
      </Container>
    </RoleGuard>
  );
}
