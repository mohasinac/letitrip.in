"use client";

import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function AdminAnalyticsContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      active: true,
    },
  ]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Analytics
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Analytics dashboard coming soon. You'll see detailed reports and
              insights about your store's performance here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function AdminAnalytics() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminAnalyticsContent />
    </RoleGuard>
  );
}
