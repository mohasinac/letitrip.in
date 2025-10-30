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
  IconButton,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Avatar,
  Badge,
  Checkbox,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  ShoppingBag as OrderIcon,
  Schedule as PendingIcon,
  LocalShipping as ShipmentIcon,
  Inventory as StockIcon,
  CheckCircle as DeliveredIcon,
  Assignment as ReturnIcon,
  Star as ReviewIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api/seller";
import Link from "next/link";

interface SellerAlert {
  id: string;
  sellerId: string;
  type:
    | "new_order"
    | "pending_approval"
    | "pending_shipment"
    | "low_stock"
    | "order_delivered"
    | "return_request"
    | "review"
    | "system";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  orderId?: string;
  productId?: string;
  shipmentId?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface AlertStats {
  total: number;
  unread: number;
  newOrders: number;
  pendingApproval: number;
  lowStock: number;
}

export default function AlertsPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Alerts", href: "/seller/alerts" },
  ]);
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SellerAlert[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    unread: 0,
    newOrders: 0,
    pendingApproval: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAlert, setSelectedAlert] = useState<SellerAlert | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setLoading(false);
    }
  }, [user, typeFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet(
        `/api/seller/alerts?type=${typeFilter}`,
      );
      if (response.success) {
        setAlerts(response.data || []);
        setStats(response.stats || stats);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch alerts",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
      const errorMessage = error.message || "Failed to load alerts";
      setSnackbar({
        open: true,
        message: errorMessage.includes("not authenticated")
          ? "Please log in to view alerts"
          : errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const response = await apiPut(`/api/seller/alerts/${alertId}/read`, {});
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Alert marked as read",
          severity: "success",
        });
        fetchAlerts();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to mark as read",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
      setSnackbar({
        open: true,
        message: "Failed to mark as read",
        severity: "error",
      });
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedAlerts.length === 0) {
      setSnackbar({
        open: true,
        message: "No alerts selected",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await apiPost("/api/seller/alerts/bulk-read", {
        alertIds: selectedAlerts,
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: `${selectedAlerts.length} alerts marked as read`,
          severity: "success",
        });
        setSelectedAlerts([]);
        fetchAlerts();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to mark alerts as read",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error marking alerts as read:", error);
      setSnackbar({
        open: true,
        message: "Failed to mark alerts as read",
        severity: "error",
      });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      const response = await apiDelete(`/api/seller/alerts/${alertId}`);
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Alert deleted",
          severity: "success",
        });
        fetchAlerts();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to delete alert",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete alert",
        severity: "error",
      });
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    alert: SellerAlert,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedAlert(alert);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAlert(null);
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts((prev) =>
      prev.includes(alertId)
        ? prev.filter((id) => id !== alertId)
        : [...prev, alertId],
    );
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(alerts.map((a) => a.id));
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    const iconProps = { fontSize: "medium" as const };
    switch (type) {
      case "new_order":
        return <OrderIcon {...iconProps} />;
      case "pending_approval":
        return <PendingIcon {...iconProps} />;
      case "pending_shipment":
        return <ShipmentIcon {...iconProps} />;
      case "low_stock":
        return <StockIcon {...iconProps} />;
      case "order_delivered":
        return <DeliveredIcon {...iconProps} />;
      case "return_request":
        return <ReturnIcon {...iconProps} />;
      case "review":
        return <ReviewIcon {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "success" | "error" | "warning"
    > = {
      info: "primary",
      success: "success",
      warning: "warning",
      error: "error",
    };
    return colors[severity] || "default";
  };

  const formatType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <RoleGuard requiredRole="seller">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Alerts & Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with your store activities
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Alerts
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Unread
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.unread}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  New Orders
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.newOrders}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box p={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Low Stock
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.lowStock}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={typeFilter}
            onChange={(e, newValue) => setTypeFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Alerts" value="all" />
            <Tab label="New Orders" value="new_order" />
            <Tab label="Pending Approval" value="pending_approval" />
            <Tab label="Pending Shipment" value="pending_shipment" />
            <Tab label="Low Stock" value="low_stock" />
            <Tab label="Delivered" value="order_delivered" />
            <Tab label="Returns" value="return_request" />
            <Tab label="Reviews" value="review" />
            <Tab label="System" value="system" />
          </Tabs>
        </Card>

        {/* Bulk Actions */}
        {selectedAlerts.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <Box p={2} display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">
                {selectedAlerts.length} alert
                {selectedAlerts.length !== 1 ? "s" : ""} selected
              </Typography>
              <Button
                size="small"
                startIcon={<MarkReadIcon />}
                onClick={handleBulkMarkAsRead}
              >
                Mark as Read
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  if (confirm(`Delete ${selectedAlerts.length} alerts?`)) {
                    selectedAlerts.forEach((id) => handleDeleteAlert(id));
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          </Card>
        )}

        {/* Alerts List */}
        <Card>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : alerts.length === 0 ? (
            <Box textAlign="center" py={8}>
              <NotificationsIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No alerts
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Select All */}
              <Box
                p={2}
                display="flex"
                alignItems="center"
                borderBottom="1px solid #e0e0e0"
              >
                <Checkbox
                  checked={
                    selectedAlerts.length === alerts.length && alerts.length > 0
                  }
                  indeterminate={
                    selectedAlerts.length > 0 &&
                    selectedAlerts.length < alerts.length
                  }
                  onChange={handleSelectAll}
                />
                <Typography variant="body2" color="text.secondary">
                  Select All
                </Typography>
              </Box>

              {/* Alert Items */}
              {alerts.map((alert) => (
                <Box
                  key={alert.id}
                  sx={{
                    p: 2,
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: alert.isRead
                      ? "transparent"
                      : "rgba(25, 118, 210, 0.04)",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Checkbox
                      checked={selectedAlerts.includes(alert.id)}
                      onChange={() => handleSelectAlert(alert.id)}
                    />

                    <Avatar
                      sx={{
                        bgcolor: `${getSeverityColor(alert.severity)}.main`,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getAlertIcon(alert.type, alert.severity)}
                    </Avatar>

                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={alert.isRead ? 400 : 600}
                        >
                          {alert.title}
                        </Typography>
                        {!alert.isRead && (
                          <Chip
                            label="NEW"
                            color="primary"
                            size="small"
                            sx={{ height: 20 }}
                          />
                        )}
                        <Chip
                          label={formatType(alert.type)}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {alert.message}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.createdAt).toLocaleString()}
                        </Typography>

                        {alert.actionUrl && alert.actionLabel && (
                          <Button
                            component={Link}
                            href={alert.actionUrl}
                            size="small"
                            variant="text"
                          >
                            {alert.actionLabel}
                          </Button>
                        )}
                      </Box>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, alert)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedAlert && !selectedAlert.isRead && (
            <MenuItem
              onClick={() => {
                handleMarkAsRead(selectedAlert.id);
                handleMenuClose();
              }}
            >
              <MarkReadIcon fontSize="small" sx={{ mr: 1 }} />
              Mark as Read
            </MenuItem>
          )}
          {selectedAlert?.actionUrl && (
            <MenuItem
              component={Link}
              href={selectedAlert.actionUrl}
              onClick={handleMenuClose}
            >
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              {selectedAlert.actionLabel || "View Details"}
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              if (selectedAlert) {
                handleDeleteAlert(selectedAlert.id);
              }
              handleMenuClose();
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
            Delete
          </MenuItem>
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
