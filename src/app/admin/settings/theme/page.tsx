"use client";

import { Box, Container, Typography, Breadcrumbs, Link } from "@mui/material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import ThemeSettingsComponent from "@/components/admin/settings/ThemeSettings";
import NextLink from "next/link";

function ThemeSettingsContent() {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={NextLink} href="/admin" color="inherit">
            Admin
          </Link>
          <Link component={NextLink} href="/admin/settings" color="inherit">
            Settings
          </Link>
          <Typography color="text.primary">Theme</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          Theme Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Customize your application's visual appearance with different theme
          palettes. Your selection is saved and will persist across all
          sessions.
        </Typography>

        {/* Theme Settings Component */}
        <ThemeSettingsComponent />
      </Container>
    </Box>
  );
}

export default function ThemeSettings() {
  return (
    <RoleGuard requiredRole="admin">
      <ThemeSettingsContent />
    </RoleGuard>
  );
}
