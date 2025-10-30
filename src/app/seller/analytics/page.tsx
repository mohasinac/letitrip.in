"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  People as CustomersIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api/seller";
import Link from "next/link";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCustomers: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    threshold: number;
  }>;
}

export default function AnalyticsPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Analytics", href: "/seller/analytics" },
  ]);
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet(
        `/api/seller/analytics/overview?period=${period}`,
      );
      if (response.success) {
        setData(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch analytics",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      const errorMessage = error.message || "Failed to load analytics";
      setSnackbar({
        open: true,
        message: errorMessage.includes("not authenticated")
          ? "Please log in to view analytics"
          : errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setSnackbar({
      open: true,
      message: "Export feature coming soon!",
      severity: "info",
    });
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

  // Show empty state if no user
  if (!user) {
    return (
      <RoleGuard requiredRole="seller">
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <Typography variant="h6" color="text.secondary">
              Please log in to view analytics
            </Typography>
          </Box>
        </Container>
      </RoleGuard>
    );
  }

  // Show empty state if no data
  if (!data) {
    return (
      <RoleGuard requiredRole="seller">
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your store performance
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
          >
            <Card>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  No data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analytics will appear here once you have orders
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="seller">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your store performance
            </Typography>
          </Box>

          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="1year">Last Year</MenuItem>
                <MenuItem value="alltime">All Time</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      ₹{data?.overview.totalRevenue.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <RevenueIcon sx={{ fontSize: 40, color: "success.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Total Orders
                    </Typography>
                    <Typography variant="h4">
                      {data?.overview.totalOrders.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <OrdersIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Avg Order Value
                    </Typography>
                    <Typography variant="h4">
                      ₹{data?.overview.averageOrderValue.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <TrendingUpIcon
                    sx={{ fontSize: 40, color: "warning.main" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Total Customers
                    </Typography>
                    <Typography variant="h4">
                      {data?.overview.totalCustomers.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <CustomersIcon sx={{ fontSize: 40, color: "info.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Top Selling Products */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Selling Products
                </Typography>
                {data?.topProducts && data.topProducts.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Sales</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell align="right">{product.sales}</TableCell>
                            <TableCell align="right">
                              ₹{product.revenue.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={4}
                  >
                    No data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                {data?.recentOrders && data.recentOrders.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order #</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Typography
                                component={Link}
                                href={`/seller/orders/${order.id}`}
                                variant="body2"
                                color="primary"
                                sx={{ textDecoration: "none" }}
                              >
                                #{order.orderNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell align="right">
                              ₹{order.total.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip label={order.status} size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={4}
                  >
                    No orders yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Low Stock Alerts */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Low Stock Alerts
                </Typography>
                {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Current Stock</TableCell>
                          <TableCell align="right">Threshold</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.lowStockProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell align="right">
                              <Chip
                                label={product.stock}
                                color="error"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {product.threshold}
                            </TableCell>
                            <TableCell>
                              <Button
                                component={Link}
                                href={`/seller/products/${product.id}/edit`}
                                size="small"
                                variant="outlined"
                              >
                                Update Stock
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={4}
                  >
                    All products are well stocked
                  </Typography>
                )}
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
