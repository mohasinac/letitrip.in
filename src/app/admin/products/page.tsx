"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function AdminProductsContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Products",
      href: "/admin/products",
      active: true,
    },
  ]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Products
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Product
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Products management interface coming soon. You'll be able to add,
              edit, and delete products from here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function AdminProducts() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminProductsContent />
    </RoleGuard>
  );
}
