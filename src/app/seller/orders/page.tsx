
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  ShoppingBag as OrdersIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

function OrdersListContent() {
  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Orders",
      href: SELLER_ROUTES.ORDERS,
      active: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
    order: Order | null;
  }>({
    open: false,
    type: null,
    order: null,
  });

  const tabs = [
    { label: "All", value: "all", count: 0 },
    { label: "Pending Approval", value: "pending_approval", count: 0 },
    { label: "Processing", value: "processing", count: 0 },
    { label: "Shipped", value: "shipped", count: 0 },
    { label: "Delivered", value: "delivered", count: 0 },
    { label: "Cancelled", value: "cancelled", count: 0 },
  ];

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const response = await apiGet("/api/seller/orders", { status: tabs[activeTab].value });

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOrders([]);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to load orders",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    order: Order
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleAction = (type: "approve" | "reject") => {
    if (!selectedOrder) return;
    setActionDialog({
      open: true,
      type,
      order: selectedOrder,
    });
    handleMenuClose();
  };

  const confirmAction = async () => {
    if (!actionDialog.order || !actionDialog.type) return;

    try {
      // TODO: Implement API call
      // const response = await apiPost(`/api/seller/orders/${actionDialog.order.id}/${actionDialog.type}`);

      setSnackbar({
        open: true,
        message: `Order ${actionDialog.type}d successfully`,
        severity: "success",
      });

      fetchOrders();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${actionDialog.type} order`,
        severity: "error",
      });
    } finally {
      setActionDialog({ open: false, type: null, order: null });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "info";
      default:
        return "default";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: orders.length,
    pendingApproval: orders.filter((o) => o.status === "pending_approval")
      .length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  // Update tab counts
  tabs[0].count = stats.total;
  tabs[1].count = stats.pendingApproval;
  tabs[2].count = stats.processing;
  tabs[3].count = stats.shipped;
  tabs[4].count = stats.delivered;
  tabs[5].count = stats.cancelled;

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
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
              Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage customer orders and fulfillment
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.total}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {stats.pendingApproval}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Processing
              </Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {stats.processing}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Delivered
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.delivered}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.value}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.label}
                    {tab.count > 0 && (
                      <Chip label={tab.count} size="small" color="primary" />
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Card>

        {/* Search */}
        <Card sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by order number, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
        </Card>

        {/* Orders Table */}
        <Card>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <OrdersIcon
                sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No orders found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Orders will appear here when customers place them"}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="primary"
                        >
                          {order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            {order.customerName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {order.customerName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {order.customerEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.items}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{order.total.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            label={order.paymentStatus}
                            size="small"
                            color={
                              getPaymentStatusColor(order.paymentStatus) as any
                            }
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption" display="block">
                            {order.paymentMethod}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.replace("_", " ")}
                          color={getStatusColor(order.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, order)}
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
            href={selectedOrder ? `/seller/orders/${selectedOrder.id}` : "#"}
            onClick={handleMenuClose}
          >
            <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
            View Details
          </MenuItem>
          {selectedOrder?.status === "pending_approval" && (
            <>
              <MenuItem onClick={() => handleAction("approve")}>
                <ApproveIcon
                  sx={{ mr: 1, fontSize: 20, color: "success.main" }}
                />
                Approve Order
              </MenuItem>
              <MenuItem onClick={() => handleAction("reject")}>
                <RejectIcon sx={{ mr: 1, fontSize: 20, color: "error.main" }} />
                Reject Order
              </MenuItem>
            </>
          )}
          <MenuItem onClick={handleMenuClose}>
            <PrintIcon sx={{ mr: 1, fontSize: 20 }} />
            Print Invoice
          </MenuItem>
        </Menu>

        {/* Action Confirmation Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() =>
            setActionDialog({ open: false, type: null, order: null })
          }
        >
          <DialogTitle>
            {actionDialog.type === "approve"
              ? "Approve Order?"
              : "Reject Order?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {actionDialog.type === "approve"
                ? `Are you sure you want to approve order ${actionDialog.order?.orderNumber}? This will move it to processing.`
                : `Are you sure you want to reject order ${actionDialog.order?.orderNumber}? The customer will be notified.`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setActionDialog({ open: false, type: null, order: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              color={actionDialog.type === "approve" ? "success" : "error"}
              variant="contained"
            >
              {actionDialog.type === "approve" ? "Approve" : "Reject"}
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

export default function OrdersList() {
  return (
    <RoleGuard requiredRole="seller">
      <OrdersListContent />
    </RoleGuard>
  );
}
