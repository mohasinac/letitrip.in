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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Avatar,
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
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Print as PrintIcon,
  LocalShipping as ShipIcon,
  Assignment as NoteIcon,
  ShoppingBag as OrderIcon,
  Payment as PaymentIcon,
  LocalShipping as DeliveryIcon,
  CheckCircleOutline as CompletedIcon,
  Close as CancelIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
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
  isDefault?: boolean;
}

interface CouponSnapshot {
  code: string;
  name: string;
  type: string;
  value: number;
  discountAmount: number;
}

interface SaleSnapshot {
  name: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

interface Order {
  id: string;
  orderNumber: string;
  sellerId: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  couponDiscount: number;
  saleDiscount: number;
  shippingCharges: number;
  tax: number;
  total: number;
  couponSnapshot?: CouponSnapshot;
  saleSnapshot?: SaleSnapshot;
  notes?: string;
  internalNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

interface TimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "error" | "warning" | "info";
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  useBreadcrumbTracker();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Action dialogs
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Fetch order details
  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
  }, [user, params.id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/seller/orders/${params.id}`);
      if (response.success) {
        setOrder(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch order details",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setSnackbar({
        open: true,
        message: "Failed to load order details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate invoice
  const handleGenerateInvoice = async () => {
    try {
      setLoading(true);
      const response = await apiPost(
        `/api/seller/orders/${params.id}/invoice`,
        {},
      );

      if (response.success) {
        // Open invoice in new window
        const invoiceWindow = window.open("", "_blank");
        if (invoiceWindow) {
          invoiceWindow.document.write(response.data.invoiceHtml);
          invoiceWindow.document.close();
        }

        setSnackbar({
          open: true,
          message: `Invoice ${response.data.invoiceNumber} generated successfully!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to generate invoice",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate invoice",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve order
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = await apiPost(
        `/api/seller/orders/${params.id}/approve`,
        {},
      );
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Order approved successfully",
          severity: "success",
        });
        setApproveDialog(false);
        fetchOrderDetails();
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Failed to approve order",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error approving order:", error);
      setSnackbar({
        open: true,
        message: "Failed to approve order",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for rejection",
        severity: "warning",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiPost(`/api/seller/orders/${params.id}/reject`, {
        reason: rejectionReason,
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Order rejected",
          severity: "success",
        });
        setRejectDialog(false);
        setRejectionReason("");
        fetchOrderDetails();
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Failed to reject order",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      setSnackbar({
        open: true,
        message: "Failed to reject order",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for cancellation",
        severity: "warning",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiPost(`/api/seller/orders/${params.id}/cancel`, {
        reason: cancelReason,
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Order cancelled",
          severity: "success",
        });
        setCancelDialog(false);
        setCancelReason("");
        fetchOrderDetails();
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Failed to cancel order",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setSnackbar({
        open: true,
        message: "Failed to cancel order",
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
      approved: "info",
      processing: "primary",
      shipped: "primary",
      delivered: "success",
      cancelled: "error",
      rejected: "error",
    };
    return colors[status] || "default";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "success" | "error" | "warning"
    > = {
      pending: "warning",
      paid: "success",
      failed: "error",
      refunded: "info",
    };
    return colors[status] || "default";
  };

  const buildTimeline = (): TimelineEvent[] => {
    if (!order) return [];

    const events: TimelineEvent[] = [];

    // Order placed
    events.push({
      title: "Order Placed",
      description: `Order #${order.orderNumber} was created`,
      timestamp: order.createdAt,
      icon: <OrderIcon />,
      color: "primary",
    });

    // Payment
    if (order.paymentStatus === "paid") {
      events.push({
        title: "Payment Received",
        description: `Payment via ${order.paymentMethod}`,
        timestamp: order.createdAt,
        icon: <PaymentIcon />,
        color: "success",
      });
    } else {
      events.push({
        title: "Payment Pending",
        description: `Awaiting ${order.paymentMethod} payment`,
        timestamp: order.createdAt,
        icon: <PaymentIcon />,
        color: "warning",
      });
    }

    // Approved/Rejected
    if (order.approvedAt) {
      events.push({
        title: "Order Approved",
        description: "Order approved by seller",
        timestamp: order.approvedAt,
        icon: <ApproveIcon />,
        color: "success",
      });
    }

    if (order.rejectedAt && order.rejectionReason) {
      events.push({
        title: "Order Rejected",
        description: order.rejectionReason,
        timestamp: order.rejectedAt,
        icon: <RejectIcon />,
        color: "error",
      });
    }

    // Shipped
    if (order.shippedAt) {
      events.push({
        title: "Order Shipped",
        description: "Order is in transit",
        timestamp: order.shippedAt,
        icon: <DeliveryIcon />,
        color: "primary",
      });
    }

    // Delivered
    if (order.deliveredAt) {
      events.push({
        title: "Order Delivered",
        description: "Order successfully delivered",
        timestamp: order.deliveredAt,
        icon: <CompletedIcon />,
        color: "success",
      });
    }

    // Cancelled
    if (order.cancelledAt) {
      events.push({
        title: "Order Cancelled",
        description: order.rejectionReason || "Order was cancelled",
        timestamp: order.cancelledAt,
        icon: <CancelIcon />,
        color: "error",
      });
    }

    return events;
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

  if (!order) {
    return (
      <RoleGuard requiredRoles={["seller", "admin"]}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box textAlign="center" py={8}>
            <Typography variant="h5" color="text.secondary">
              Order not found
            </Typography>
            <Button
              component={Link}
              href={SELLER_ROUTES.ORDERS}
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2 }}
            >
              Back to Orders
            </Button>
          </Box>
        </Container>
      </RoleGuard>
    );
  }

  const timeline = buildTimeline();

  return (
    <RoleGuard requiredRoles={["seller", "admin"]}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Button
              component={Link}
              href={SELLER_ROUTES.ORDERS}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              Back
            </Button>
            <Typography variant="h4">Order #{order.orderNumber}</Typography>
            <Chip
              label={order.status.toUpperCase()}
              color={getStatusColor(order.status)}
              size="small"
            />
            <Chip
              label={`Payment: ${order.paymentStatus.toUpperCase()}`}
              color={getPaymentStatusColor(order.paymentStatus)}
              size="small"
            />
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            {order.status === "pending" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => setApproveDialog(true)}
                >
                  Approve Order
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => setRejectDialog(true)}
                >
                  Reject Order
                </Button>
              </>
            )}

            {order.status === "processing" && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShipIcon />}
                onClick={() => {
                  setSnackbar({
                    open: true,
                    message: "Shipment feature coming soon!",
                    severity: "info",
                  });
                }}
              >
                Initiate Shipment
              </Button>
            )}

            {!["delivered", "cancelled", "rejected"].includes(order.status) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setCancelDialog(true)}
              >
                Cancel Order
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handleGenerateInvoice}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Order Items */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                src={item.image}
                                alt={item.name}
                                variant="rounded"
                                sx={{ width: 50, height: 50 }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {item.slug}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {item.sku}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            ₹{item.price.toLocaleString()}
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={500}>
                              ₹{item.total.toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pricing Breakdown
                </Typography>
                <Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography>Subtotal</Typography>
                    <Typography>₹{order.subtotal.toLocaleString()}</Typography>
                  </Box>

                  {order.couponDiscount > 0 && order.couponSnapshot && (
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      py={1}
                      color="success.main"
                    >
                      <Box>
                        <Typography>Coupon Discount</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.couponSnapshot.code} -{" "}
                          {order.couponSnapshot.name}
                        </Typography>
                      </Box>
                      <Typography>
                        -₹{order.couponDiscount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  {order.saleDiscount > 0 && order.saleSnapshot && (
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      py={1}
                      color="success.main"
                    >
                      <Box>
                        <Typography>Sale Discount</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.saleSnapshot.name}
                        </Typography>
                      </Box>
                      <Typography>
                        -₹{order.saleDiscount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography>Shipping Charges</Typography>
                    <Typography>
                      {order.shippingCharges > 0
                        ? `₹${order.shippingCharges.toLocaleString()}`
                        : "FREE"}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography>Tax</Typography>
                    <Typography>₹{order.tax.toLocaleString()}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{order.total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Timeline
                </Typography>
                <Timeline position="alternate">
                  {timeline.map((event, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent color="text.secondary">
                        <Typography variant="caption">
                          {new Date(event.timestamp).toLocaleString()}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={event.color}>
                          {event.icon}
                        </TimelineDot>
                        {index < timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" fontWeight={500}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.description}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Customer Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {order.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customerEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customerPhone}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {order.shippingAddress.addressLine1}
                </Typography>
                {order.shippingAddress.addressLine2 && (
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingAddress.addressLine2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.country}
                </Typography>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Billing Address
                </Typography>
                <Typography variant="body2">
                  {order.billingAddress.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.billingAddress.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {order.billingAddress.addressLine1}
                </Typography>
                {order.billingAddress.addressLine2 && (
                  <Typography variant="body2" color="text.secondary">
                    {order.billingAddress.addressLine2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {order.billingAddress.city}, {order.billingAddress.state}{" "}
                  {order.billingAddress.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.billingAddress.country}
                </Typography>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Order Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {order.internalNotes && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Internal Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.internalNotes}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Approve Dialog */}
        <Dialog open={approveDialog} onClose={() => setApproveDialog(false)}>
          <DialogTitle>Approve Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to approve order #{order.orderNumber}? This
              will move the order to processing status.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setApproveDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              variant="contained"
              color="success"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Approve"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialog}
          onClose={() => setRejectDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reject Order</DialogTitle>
          <DialogContent>
            <DialogContentText mb={2}>
              Please provide a reason for rejecting order #{order.orderNumber}
            </DialogContentText>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why you're rejecting this order..."
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRejectDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="contained"
              color="error"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Reject Order"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog
          open={cancelDialog}
          onClose={() => setCancelDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogContent>
            <DialogContentText mb={2}>
              Please provide a reason for cancelling order #{order.orderNumber}
            </DialogContentText>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Cancellation Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Explain why you're cancelling this order..."
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setCancelDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancel}
              variant="contained"
              color="error"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Cancel Order"}
            </Button>
          </DialogActions>
        </Dialog>

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
