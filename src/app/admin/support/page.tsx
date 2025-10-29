"use client";

import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function AdminSupportContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Support",
      href: "/admin/support",
      active: true,
    },
  ]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Support
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Support management interface coming soon. You'll be able to handle
              customer inquiries and support tickets from here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function AdminSupport() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminSupportContent />
    </RoleGuard>
  );
}
