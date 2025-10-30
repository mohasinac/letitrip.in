"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from "@mui/material";
import {
  ShoppingCart,
  TrendingUp,
  LocalShipping,
  AttachMoney,
  ArrowForward,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import Link from "next/link";
import { SELLER_ROUTES } from "@/constants/routes";

const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  href,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  change: string;
  href?: string;
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            bgcolor: "primary.main",
            p: 1.5,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.contrastText",
          }}
        >
          <Icon />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {value}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="success.main">
          {change}
        </Typography>
        {href && (
          <Button
            component={Link}
            href={href}
            size="small"
            endIcon={<ArrowForward />}
            sx={{ textTransform: "none" }}
          >
            View
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
);

function SellerDashboardContent() {
  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
      active: true,
    },
  ]);

  const stats = [
    {
      icon: ShoppingCart,
      title: "Total Products",
      value: "0",
      change: "Get started by adding products",
      href: SELLER_ROUTES.PRODUCTS,
    },
    {
      icon: LocalShipping,
      title: "Pending Orders",
      value: "0",
      change: "No pending orders",
      href: SELLER_ROUTES.ORDERS,
    },
    {
      icon: AttachMoney,
      title: "Total Revenue",
      value: "₹0",
      change: "Start selling to earn",
    },
    {
      icon: TrendingUp,
      title: "This Month",
      value: "₹0",
      change: "No sales yet",
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Seller Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome to your seller panel. Manage your store, products, and
            orders from here.
          </Typography>
        </Box>

        {/* Quick Setup Guide */}
        <Card
          sx={{
            mb: 4,
            bgcolor: "primary.50",
            borderLeft: 4,
            borderColor: "primary.main",
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              🚀 Quick Setup Guide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Follow these steps to start selling:
            </Typography>
            <Box component="ol" sx={{ pl: 2, "& li": { mb: 1 } }}>
              <li>
                <Link
                  href={SELLER_ROUTES.SHOP_SETUP}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Setup your shop →
                  </Typography>
                </Link>{" "}
                Configure shop name, pickup addresses, and SEO
              </li>
              <li>
                <Link
                  href={SELLER_ROUTES.PRODUCTS_NEW}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Add your first product →
                  </Typography>
                </Link>{" "}
                Upload products with images and details
              </li>
              <li>
                <Link
                  href={SELLER_ROUTES.SALES}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Create a sale or coupon →
                  </Typography>
                </Link>{" "}
                Attract customers with discounts
              </li>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No orders yet. Your orders will appear here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  Quick Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    component={Link}
                    href={SELLER_ROUTES.PRODUCTS_NEW}
                    variant="contained"
                    fullWidth
                    sx={{ textTransform: "none" }}
                  >
                    Add Product
                  </Button>
                  <Button
                    component={Link}
                    href={SELLER_ROUTES.COUPONS_NEW}
                    variant="outlined"
                    fullWidth
                    sx={{ textTransform: "none" }}
                  >
                    Create Coupon
                  </Button>
                  <Button
                    component={Link}
                    href={SELLER_ROUTES.SALES_NEW}
                    variant="outlined"
                    fullWidth
                    sx={{ textTransform: "none" }}
                  >
                    Create Sale
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function SellerDashboard() {
  return (
    <RoleGuard requiredRole="seller">
      <SellerDashboardContent />
    </RoleGuard>
  );
}
