"use client";

import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import RoleGuard from "@/components/features/auth/RoleGuard";

function AdminSettingsContent() {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Settings
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Admin settings page coming soon. You'll be able to configure your
              store, manage integrations, and control admin permissions from
              here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function AdminSettings() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminSettingsContent />
    </RoleGuard>
  );
}
