"use client";

import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function AdminOrdersContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Orders",
      href: "/admin/orders",
      active: true,
    },
  ]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Orders
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Orders management interface coming soon. You'll be able to view,
              track, and manage customer orders from here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function AdminOrders() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminOrdersContent />
    </RoleGuard>
  );
}
