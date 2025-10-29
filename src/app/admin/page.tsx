"use client";

import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import { ShoppingCart, People, TrendingUp, Warning } from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  change: string;
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
      <Typography variant="caption" color="success.main">
        {change}
      </Typography>
    </CardContent>
  </Card>
);

function AdminDashboardContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
      active: true,
    },
  ]);

  const stats = [
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: "1,234",
      change: "+12% from last month",
    },
    {
      icon: People,
      title: "Total Users",
      value: "892",
      change: "+8% from last month",
    },
    {
      icon: TrendingUp,
      title: "Revenue",
      value: "$45,231",
      change: "+22% from last month",
    },
    {
      icon: Warning,
      title: "Pending Orders",
      value: "23",
      change: "3 needs attention",
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your admin dashboard is ready. Navigate using the sidebar to
              manage products, orders, users, and more.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboardContent />
    </RoleGuard>
  );
}
