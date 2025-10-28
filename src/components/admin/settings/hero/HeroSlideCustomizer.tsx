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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Switch,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import MediaUpload from "./MediaUpload";
import { HeroBannerSlide } from "@/types/heroBanner";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const DEFAULT_THEME = {
  primary: "#4A90E2",
  secondary: "#7BB3F0",
  accent: "#2E5BBA",
  gradient: "linear-gradient(135deg, #4A90E2 0%, #7BB3F0 100%)",
  textPrimary: "#FFFFFF",
  textSecondary: "#E3F2FD",
  overlay: "rgba(74, 144, 226, 0.15)",
  cardBackground: "rgba(255, 255, 255, 0.95)",
  borderColor: "rgba(74, 144, 226, 0.3)",
};

export default function HeroSlideCustomizer() {
  const [slides, setSlides] = useState<HeroBannerSlide[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<HeroBannerSlide>>({
    title: "",
    description: "",
    backgroundImage: "",
    backgroundColor: "#1a1a1a",
    theme: DEFAULT_THEME,
    featuredProductIds: [],
    seoMeta: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      ogImage: "",
      ogTitle: "",
      ogDescription: "",
    },
    isActive: true,
    displayOrder: 1,
  });

  // Load slides and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, productsRes] = await Promise.all([
          fetch("/api/admin/hero-slides"),
          fetch("/api/admin/products"),
        ]);

        const slidesData = await slidesRes.json();
        const productsData = await productsRes.json();

        if (slidesData.success) setSlides(slidesData.data);
        if (productsData.success) setProducts(productsData.data);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (slide?: HeroBannerSlide) => {
    if (slide) {
      setEditingId(slide.id);
      setFormData(slide);
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        backgroundImage: "",
        backgroundColor: "#1a1a1a",
        theme: DEFAULT_THEME,
        featuredProductIds: [],
        seoMeta: {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
          ogImage: "",
          ogTitle: "",
          ogDescription: "",
        },
        isActive: true,
        displayOrder: slides.length + 1,
      });
    }
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.backgroundImage) {
      alert("Title and background image are required");
      return;
    }

    if (
      !formData.featuredProductIds ||
      formData.featuredProductIds.length < 3
    ) {
      alert("Select at least 3 featured products");
      return;
    }

    try {
      const url = "/api/admin/hero-slides";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...formData,
        ...(editingId && { id: editingId }),
        ...(!editingId && {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save");

      const refreshRes = await fetch("/api/admin/hero-slides");
      const refreshData = await refreshRes.json();
      if (refreshData.success) setSlides(refreshData.data);

      setOpenDialog(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save slide");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;

    try {
      await fetch("/api/admin/hero-slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const refreshRes = await fetch("/api/admin/hero-slides");
      const refreshData = await refreshRes.json();
      if (refreshData.success) setSlides(refreshData.data);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete slide");
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const slide = slides.find((s) => s.id === id);
      if (!slide) return;

      const response = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...slide,
          isActive: !slide.isActive,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const refreshRes = await fetch("/api/admin/hero-slides");
      const refreshData = await refreshRes.json();
      if (refreshData.success) setSlides(refreshData.data);
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Hero Banner Slides"
        subheader="Manage carousel slides with products"
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            variant="contained"
          >
            Add Slide
          </Button>
        }
      />
      <CardContent>
        {slides.length === 0 ? (
          <Typography color="text.secondary">
            No slides. Create one to get started.
          </Typography>
        ) : (
          <List>
            {slides.map((slide) => (
              <ListItem
                key={slide.id}
                sx={{
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {slide.title}
                      </Typography>
                      <Chip
                        label={slide.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={slide.isActive ? "success" : "default"}
                      />
                      <Chip
                        label={`${slide.featuredProductIds.length} products`}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={slide.description}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={slide.isActive}
                    onChange={() => toggleActive(slide.id)}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(slide)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingId ? "Edit Slide" : "Create Slide"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Basic" />
            <Tab label="Media" />
            <Tab label="Products" />
            <Tab label="SEO" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Background Color"
                type="color"
                value={formData.backgroundColor || "#1a1a1a"}
                onChange={(e) =>
                  setFormData({ ...formData, backgroundColor: e.target.value })
                }
              />
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <MediaUpload
              onImageSelected={(url) =>
                setFormData({ ...formData, backgroundImage: url })
              }
              onVideoSelected={(url) =>
                setFormData({ ...formData, backgroundVideo: url })
              }
              currentImage={formData.backgroundImage}
              currentVideo={formData.backgroundVideo}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <FormControl fullWidth>
              <InputLabel>Featured Products</InputLabel>
              <Select
                multiple
                value={formData.featuredProductIds || []}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    featuredProductIds: e.target.value as string[],
                  })
                }
                label="Featured Products"
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} - ₹{p.price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Meta Title"
                size="small"
                value={formData.seoMeta?.metaTitle || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seoMeta: {
                      ...formData.seoMeta!,
                      metaTitle: e.target.value,
                    },
                  })
                }
              />
              <TextField
                fullWidth
                label="Meta Description"
                size="small"
                multiline
                rows={2}
                value={formData.seoMeta?.metaDescription || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seoMeta: {
                      ...formData.seoMeta!,
                      metaDescription: e.target.value,
                    },
                  })
                }
              />
            </Stack>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
