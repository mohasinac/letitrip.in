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
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { useSearchParams } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function BulkInvoicePage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Orders", href: "/seller/orders" },
    { label: "Bulk Invoice", href: "/seller/orders/bulk-invoice" },
  ]);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchOrders();
      // Pre-select orders from URL params
      const ids = searchParams?.get("ids");
      if (ids) {
        setSelectedOrders(ids.split(","));
      }
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet("/api/seller/orders?status=all");
      if (response.success) {
        // Filter orders that can have invoices (approved, processing, shipped, delivered, completed)
        const eligibleOrders = (response.data || []).filter((order: Order) =>
          [
            "approved",
            "processing",
            "shipped",
            "delivered",
            "completed",
          ].includes(order.status),
        );
        setOrders(eligibleOrders);
      } else {
        setError(response.error || "Failed to fetch orders");
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const toggleAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const generateBulkInvoices = async () => {
    if (selectedOrders.length === 0) {
      setError("Please select at least one order");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      // Generate invoices for each selected order
      const invoicePromises = selectedOrders.map((orderId) =>
        apiPost(`/api/seller/orders/${orderId}/invoice`, {}),
      );

      const responses = await Promise.all(invoicePromises);

      // Combine all invoice HTML
      const combinedHtml = responses
        .filter((res: any) => res.success)
        .map((res: any) => res.data.invoiceHtml)
        .join('<div style="page-break-after: always;"></div>');

      if (combinedHtml) {
        setInvoiceHtml(combinedHtml);
        setPreviewOpen(true);
      } else {
        setError("Failed to generate invoices");
      }
    } catch (error: any) {
      console.error("Error generating invoices:", error);
      setError(error.message || "Failed to generate invoices");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([invoiceHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([invoiceHtml], { type: "text/html" });
        const file = new File([blob], `invoices-${Date.now()}.html`, {
          type: "text/html",
        });
        await navigator.share({
          title: "Invoices",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(invoiceHtml);
      alert("Invoice HTML copied to clipboard!");
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
            Bulk Invoice Generator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select multiple orders to generate invoices together
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
                  selectedOrders.length === orders.length ? <CheckIcon /> : null
                }
              >
                {selectedOrders.length === orders.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              <Box sx={{ flex: 1 }} />

              <Chip
                label={`${selectedOrders.length} / ${orders.length} selected`}
                color={selectedOrders.length > 0 ? "primary" : "default"}
              />

              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={generateBulkInvoices}
                disabled={selectedOrders.length === 0 || generating}
              >
                {generating ? "Generating..." : "Generate Invoices"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No orders available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Orders that are approved or completed will appear here
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card
                key={order.id}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedOrders.includes(order.id)
                    ? "action.selected"
                    : "background.paper",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => toggleOrder(order.id)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.customerName} •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Chip
                      label={order.status.toUpperCase()}
                      size="small"
                      color={
                        order.status === "completed"
                          ? "success"
                          : order.status === "delivered"
                            ? "info"
                            : "default"
                      }
                    />

                    <Typography variant="h6" fontWeight="bold">
                      ₹{order.total.toFixed(2)}
                    </Typography>
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
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">Invoice Preview</Typography>
              <IconButton onClick={() => setPreviewOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <iframe
              srcDoc={invoiceHtml}
              style={{
                width: "100%",
                height: "600px",
                border: "none",
              }}
              title="Invoice Preview"
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
