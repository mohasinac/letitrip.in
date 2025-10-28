"use client";

import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import RoleGuard from "@/components/features/auth/RoleGuard";

function AdminUsersContent() {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Users
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Users management interface coming soon. You'll be able to view,
              edit, and manage user accounts from here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function AdminUsers() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminUsersContent />
    </RoleGuard>
  );
}
