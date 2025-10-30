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
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShipIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { useSearchParams } from "next/navigation";

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
  createdAt: string;
}

export default function BulkShippingLabelPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Shipments", href: "/seller/shipments" },
    { label: "Bulk Labels", href: "/seller/shipments/bulk-labels" },
  ]);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [manifestHtml, setManifestHtml] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
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
        setShipments(response.data || []);
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

  const toggleShipment = (shipmentId: string) => {
    setSelectedShipments((prev) =>
      prev.includes(shipmentId)
        ? prev.filter((id) => id !== shipmentId)
        : [...prev, shipmentId],
    );
  };

  const toggleAll = () => {
    if (selectedShipments.length === shipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(shipments.map((s) => s.id));
    }
  };

  const generateManifest = async () => {
    if (selectedShipments.length === 0) {
      setError("Please select at least one shipment");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response: any = await apiPost(
        "/api/seller/shipments/bulk-manifest",
        {
          shipmentIds: selectedShipments,
        },
      );

      if (response.success) {
        setManifestHtml(response.data.manifestHtml);
        setPreviewOpen(true);
      } else {
        setError(response.error || "Failed to generate manifest");
      }
    } catch (error: any) {
      console.error("Error generating manifest:", error);
      setError(error.message || "Failed to generate manifest");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(manifestHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([manifestHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipping-manifest-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([manifestHtml], { type: "text/html" });
        const file = new File([blob], `shipping-manifest-${Date.now()}.html`, {
          type: "text/html",
        });
        await navigator.share({
          title: "Shipping Manifest",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(manifestHtml);
      alert("Manifest HTML copied to clipboard!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "in_transit":
      case "out_for_delivery":
        return "info";
      case "pending":
      case "pickup_scheduled":
        return "warning";
      case "failed":
      case "returned":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Bulk Shipping Labels & Manifest
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select multiple shipments to generate a combined manifest
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
              <Button
                variant="outlined"
                onClick={toggleAll}
                startIcon={
                  selectedShipments.length === shipments.length ? (
                    <CheckIcon />
                  ) : null
                }
              >
                {selectedShipments.length === shipments.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              <Box sx={{ flex: 1 }} />

              <Chip
                label={`${selectedShipments.length} / ${shipments.length} selected`}
                color={selectedShipments.length > 0 ? "primary" : "default"}
              />

              <Button
                variant="contained"
                startIcon={<ShipIcon />}
                onClick={generateManifest}
                disabled={selectedShipments.length === 0 || generating}
              >
                {generating ? "Generating..." : "Generate Manifest"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Shipments List */}
        {shipments.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No shipments available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shipments will appear here once orders are ready to ship
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {shipments.map((shipment) => (
              <Card
                key={shipment.id}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedShipments.includes(shipment.id)
                    ? "action.selected"
                    : "background.paper",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => toggleShipment(shipment.id)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Checkbox
                      checked={selectedShipments.includes(shipment.id)}
                      onChange={() => toggleShipment(shipment.id)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {shipment.trackingNumber || "No tracking"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Order: {shipment.orderId} • {shipment.carrier}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        To: {shipment.toAddress?.name},{" "}
                        {shipment.toAddress?.city}, {shipment.toAddress?.state}
                      </Typography>
                    </Box>

                    <Chip
                      label={shipment.status.replace(/_/g, " ").toUpperCase()}
                      size="small"
                      color={getStatusColor(shipment.status)}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">Shipping Manifest Preview</Typography>
              <IconButton onClick={() => setPreviewOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <iframe
              srcDoc={manifestHtml}
              style={{
                width: "100%",
                height: "700px",
                border: "none",
              }}
              title="Manifest Preview"
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleShare} startIcon={<ShareIcon />}>
              Share
            </Button>
            <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
              Download HTML
            </Button>
            <Button
              variant="contained"
              onClick={handlePrint}
              startIcon={<PrintIcon />}
            >
              Print
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </RoleGuard>
  );
}
