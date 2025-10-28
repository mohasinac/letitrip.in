"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";

type BadgeType = "Popular" | "New" | "Sale";
type BadgeColorType = "warning" | "success" | "error";

interface HeroProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: BadgeType;
  badgeColor?: BadgeColorType;
}

export default function HeroProductSettings() {
  const [products, setProducts] = useState<HeroProduct[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    badge: "" as "Popular" | "New" | "Sale" | "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("hero-products");
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      // Initialize with default products
      const defaults: HeroProduct[] = [
        {
          id: "dragoon-gt",
          name: "Dragoon GT",
          price: 2499,
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
          badge: "Popular",
          badgeColor: "warning",
        },
        {
          id: "valkyrie-x",
          name: "Valkyrie X",
          price: 1899,
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
          badge: "New",
          badgeColor: "success",
        },
        {
          id: "spriggan-burst",
          name: "Spriggan Burst",
          price: 1699,
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
          badge: "Sale",
          badgeColor: "error",
        },
      ];
      setProducts(defaults);
      localStorage.setItem("hero-products", JSON.stringify(defaults));
    }
  }, []);

  const handleOpenDialog = (product?: HeroProduct) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        badge: product.badge || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        image: "",
        badge: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.image) {
      alert("Please fill in all required fields");
      return;
    }

    let updatedProducts;

    if (editingId) {
      updatedProducts = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formData.name,
              price: parseInt(formData.price),
              image: formData.image,
              badge: formData.badge ? (formData.badge as BadgeType) : undefined,
              badgeColor:
                formData.badge === "Sale"
                  ? ("error" as BadgeColorType)
                  : formData.badge === "New"
                  ? ("success" as BadgeColorType)
                  : formData.badge === "Popular"
                  ? ("warning" as BadgeColorType)
                  : undefined,
            }
          : p
      );
    } else {
      updatedProducts = [
        ...products,
        {
          id: Date.now().toString(),
          name: formData.name,
          price: parseInt(formData.price),
          image: formData.image,
          badge: formData.badge ? (formData.badge as BadgeType) : undefined,
          badgeColor:
            formData.badge === "Sale"
              ? ("error" as BadgeColorType)
              : formData.badge === "New"
              ? ("success" as BadgeColorType)
              : formData.badge === "Popular"
              ? ("warning" as BadgeColorType)
              : undefined,
        },
      ];
    }

    setProducts(updatedProducts);
    localStorage.setItem("hero-products", JSON.stringify(updatedProducts));
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem("hero-products", JSON.stringify(updatedProducts));
    }
  };

  const getBadgeColor = (badge: string | undefined) => {
    switch (badge) {
      case "Sale":
        return "error";
      case "New":
        return "success";
      case "Popular":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader
        title="Featured Products"
        subheader="Manage the products displayed in the hero carousel"
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            variant="contained"
          >
            Add Product
          </Button>
        }
      />
      <CardContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Select up to 6 featured products to display on your homepage hero
          carousel. These products will be shown dynamically.
        </Alert>

        {products.length === 0 ? (
          <Typography color="text.secondary">
            No products configured. Add featured products to get started.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    paddingTop: "100%",
                    overflow: "hidden",
                    backgroundColor: "background.paper",
                  }}
                >
                  <Box
                    component="img"
                    src={product.image}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {product.badge && (
                    <Chip
                      label={product.badge}
                      size="small"
                      color={
                        getBadgeColor(product.badge) as
                          | "default"
                          | "primary"
                          | "secondary"
                          | "error"
                          | "warning"
                          | "info"
                          | "success"
                      }
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary"
                    fontWeight={700}
                    sx={{ mb: 2 }}
                  >
                    ₹{product.price}
                  </Typography>
                </CardContent>
                <Box sx={{ display: "flex", gap: 1, p: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(product)}
                    variant="outlined"
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(product.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>

      {/* Dialog for Add/Edit */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Product Name"
              placeholder="e.g., Dragoon GT"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Price"
              placeholder="e.g., 2499"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              helperText="Price in rupees"
            />
            <TextField
              fullWidth
              label="Product Image URL"
              placeholder="https://example.com/product.jpg"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              helperText="Full URL to the product image"
            />
            <FormControl fullWidth>
              <InputLabel>Badge (Optional)</InputLabel>
              <Select
                value={formData.badge}
                label="Badge (Optional)"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    badge: (e.target.value as BadgeType | "") || "",
                  })
                }
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Popular">Popular</MenuItem>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Sale">Sale</MenuItem>
              </Select>
            </FormControl>
            {formData.image && (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  backgroundImage: `url(${formData.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
                onError={() => {
                  // Handle image load errors
                }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
