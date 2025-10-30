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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";

interface CarouselBackground {
  id: string;
  name: string;
  backgroundImage: string;
  displayName: string;
  description: string;
}

export default function HeroCarouselSettings() {
  const [carousels, setCarousels] = useState<CarouselBackground[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    backgroundImage: "",
    displayName: "",
    description: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("hero-carousels");
    if (saved) {
      setCarousels(JSON.parse(saved));
    } else {
      // Initialize with default carousels
      const defaults: CarouselBackground[] = [
        {
          id: "classic",
          name: "classic",
          backgroundImage:
            "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=1920&q=80",
          displayName: "Classic Plastic Generation",
          description:
            "Discover the original Beyblades that started the legend",
        },
        {
          id: "burst",
          name: "burst",
          backgroundImage:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1920&q=80",
          displayName: "Beyblade Burst Series",
          description: "Experience the Burst evolution with enhanced gameplay",
        },
      ];
      setCarousels(defaults);
      localStorage.setItem("hero-carousels", JSON.stringify(defaults));
    }
  }, []);

  const handleOpenDialog = (carousel?: CarouselBackground) => {
    if (carousel) {
      setEditingId(carousel.id);
      setFormData({
        name: carousel.name,
        backgroundImage: carousel.backgroundImage,
        displayName: carousel.displayName,
        description: carousel.description,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        backgroundImage: "",
        displayName: "",
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.backgroundImage) {
      alert("Please fill in all required fields");
      return;
    }

    let updatedCarousels;

    if (editingId) {
      updatedCarousels = carousels.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: formData.name,
              backgroundImage: formData.backgroundImage,
              displayName: formData.displayName,
              description: formData.description,
            }
          : c,
      );
    } else {
      updatedCarousels = [
        ...carousels,
        {
          id: Date.now().toString(),
          name: formData.name,
          backgroundImage: formData.backgroundImage,
          displayName: formData.displayName,
          description: formData.description,
        },
      ];
    }

    setCarousels(updatedCarousels);
    localStorage.setItem("hero-carousels", JSON.stringify(updatedCarousels));
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this carousel?")) {
      const updatedCarousels = carousels.filter((c) => c.id !== id);
      setCarousels(updatedCarousels);
      localStorage.setItem("hero-carousels", JSON.stringify(updatedCarousels));
    }
  };

  return (
    <Card>
      <CardHeader
        title="Carousel Backgrounds"
        subheader="Manage the background images and content for each carousel slide"
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            variant="contained"
          >
            Add Background
          </Button>
        }
      />
      <CardContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Each carousel background is displayed on the homepage hero section.
          Update images and descriptions to customize your hero carousel.
        </Alert>

        {carousels.length === 0 ? (
          <Typography color="text.secondary">
            No carousels configured. Create one to get started.
          </Typography>
        ) : (
          <List>
            {carousels.map((carousel) => (
              <ListItem
                key={carousel.id}
                sx={{
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {carousel.displayName}
                    </Typography>
                    <Chip
                      label={carousel.name}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {carousel.description}
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: 120,
                      backgroundImage: `url(${carousel.backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </Box>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(carousel)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(carousel.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
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
          {editingId
            ? "Edit Carousel Background"
            : "Add New Carousel Background"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Carousel Name (ID)"
              placeholder="e.g., classic, burst, sparking"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              helperText="Unique identifier for this carousel"
            />
            <TextField
              fullWidth
              label="Display Name"
              placeholder="e.g., Classic Plastic Generation"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Description"
              placeholder="Brief description for this carousel"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Background Image URL"
              placeholder="https://example.com/image.jpg"
              value={formData.backgroundImage}
              onChange={(e) =>
                setFormData({ ...formData, backgroundImage: e.target.value })
              }
              helperText="Full URL to the background image"
            />
            {formData.backgroundImage && (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  backgroundImage: `url(${formData.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
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
