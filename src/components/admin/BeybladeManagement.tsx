"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Button,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { BeybladeStats } from "@/types/beybladeStats";
import BeybladeImageUploader from "./BeybladeImageUploader";

export default function BeybladeManagement() {
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [selectedBeyblade, setSelectedBeyblade] =
    useState<BeybladeStats | null>(null);

  useEffect(() => {
    fetchBeyblades();
  }, []);

  const fetchBeyblades = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/beyblades");
      if (!response.ok) throw new Error("Failed to fetch Beyblades");
      const data = await response.json();
      setBeyblades(data.beyblades || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Beyblades");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (beyblade: BeybladeStats) => {
    setSelectedBeyblade(beyblade);
    setImageUploadOpen(true);
  };

  const handleImageUploaded = (imageUrl: string) => {
    // Update the beyblade in the list
    setBeyblades((prevBeyblades) =>
      prevBeyblades.map((b) =>
        b.id === selectedBeyblade?.id ? { ...b, imageUrl } : b,
      ),
    );
    setImageUploadOpen(false);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      attack: "#ff4757",
      defense: "#5352ed",
      stamina: "#ffa502",
      balanced: "#2ed573",
    };
    return colors[type] || "#666";
  };

  const getTypeGradient = (type: string) => {
    const gradients: Record<string, string> = {
      attack: "linear-gradient(135deg, #ff4757 0%, #ff6348 100%)",
      defense: "linear-gradient(135deg, #5352ed 0%, #3742fa 100%)",
      stamina: "linear-gradient(135deg, #ffa502 0%, #ff6348 100%)",
      balanced: "linear-gradient(135deg, #2ed573 0%, #7bed9f 100%)",
    };
    return gradients[type] || "linear-gradient(135deg, #666 0%, #999 100%)";
  };

  const filteredBeyblades = beyblades.filter((bey) => {
    const matchesType = filterType === "all" || bey.type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      bey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bey.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" gutterBottom>
          Loading Beyblades...
        </Typography>
        <LinearProgress sx={{ maxWidth: 400, mx: "auto", mt: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 600, mx: "auto" }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters and Actions */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label="Search Beyblades"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 250 }}
        />

        <TextField
          select
          label="Filter by Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="attack">Attack</MenuItem>
          <MenuItem value="defense">Defense</MenuItem>
          <MenuItem value="stamina">Stamina</MenuItem>
          <MenuItem value="balanced">Balanced</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBeyblades}
          size="small"
        >
          Refresh
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2" color="text.secondary">
          {filteredBeyblades.length} Beyblade
          {filteredBeyblades.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Beyblade Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        {filteredBeyblades.map((beyblade) => (
          <Card
            key={beyblade.id}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            {/* Type Banner */}
            <Box
              sx={{
                height: 8,
                background: getTypeGradient(beyblade.type),
              }}
            />

            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
              {/* Header with Image */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 2,
                }}
              >
                {/* Beyblade Image or Circle */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: beyblade.imageUrl
                      ? `url(${beyblade.imageUrl}) center/cover`
                      : getTypeGradient(beyblade.type),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    flexShrink: 0,
                    border: "3px solid",
                    borderColor: "background.paper",
                    boxShadow: 2,
                    position: "relative",
                  }}
                >
                  {!beyblade.imageUrl && beyblade.name.charAt(0)}

                  {/* Upload Icon Overlay */}
                  <IconButton
                    size="small"
                    onClick={() => handleImageUpload(beyblade)}
                    sx={{
                      position: "absolute",
                      bottom: -5,
                      right: -5,
                      bgcolor: "primary.main",
                      color: "white",
                      width: 28,
                      height: 28,
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                  >
                    <CameraIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Name and Type */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {beyblade.name}
                  </Typography>
                  <Chip
                    label={beyblade.type.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getTypeColor(beyblade.type),
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
              </Box>

              {/* Stats */}
              <Box sx={{ mb: 2 }}>
                <StatBar
                  label="Attack"
                  value={beyblade.typeDistribution.attack}
                  max={150}
                  color="#ff4757"
                />
                <StatBar
                  label="Defense"
                  value={beyblade.typeDistribution.defense}
                  max={150}
                  color="#5352ed"
                />
                <StatBar
                  label="Stamina"
                  value={beyblade.typeDistribution.stamina}
                  max={150}
                  color="#ffa502"
                />
              </Box>

              {/* Physical Stats */}
              <Box
                sx={{ display: "flex", gap: 2, mb: 2, fontSize: "0.875rem" }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Mass
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {beyblade.mass}g
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Radius
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {beyblade.radius}px
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Spin Steal
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {beyblade.spinStealFactor}x
                  </Typography>
                </Box>
              </Box>

              {/* Special Move */}
              {beyblade.specialMove && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Special Move
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    {beyblade.specialMove.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cost: {beyblade.specialMove.powerCost} ⚡ | Duration:{" "}
                    {beyblade.specialMove.flags.duration}s
                  </Typography>
                </Box>
              )}

              {/* Contact Points Count */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {beyblade.pointsOfContact.length} Contact Points
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* No Results */}
      {filteredBeyblades.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No Beyblades found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or search query
          </Typography>
        </Box>
      )}

      {/* Image Upload Dialog */}
      <Dialog
        open={imageUploadOpen}
        onClose={() => setImageUploadOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Image for {selectedBeyblade?.name}</DialogTitle>
        <DialogContent>
          {selectedBeyblade && (
            <BeybladeImageUploader
              beybladeId={selectedBeyblade.id}
              currentImageUrl={selectedBeyblade.imageUrl}
              onImageUploaded={handleImageUploaded}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageUploadOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Stat Bar Component
function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" fontWeight="bold">
          {value}/{max}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: "action.hover",
          "& .MuiLinearProgress-bar": {
            bgcolor: color,
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
}
