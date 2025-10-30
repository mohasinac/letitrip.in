"use client";

import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  SelectChangeEvent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Casino as RandomIcon } from "@mui/icons-material";
import { useArenas } from "@/hooks/useArenas";
import { ArenaConfig } from "@/types/arenaConfig";

interface ArenaSelectProps {
  value: string;
  onChange: (arenaId: string) => void;
  label: string;
  disabled?: boolean;
  showRandomButton?: boolean;
}

export default function ArenaSelect({
  value,
  onChange,
  label,
  disabled = false,
  showRandomButton = false,
}: ArenaSelectProps) {
  const { arenas, loading, error } = useArenas();

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const handleRandomSelect = () => {
    if (arenas.length === 0) return;
    const randomIndex = Math.floor(Math.random() * arenas.length);
    const randomArena = arenas[randomIndex];
    if (randomArena?.id) {
      onChange(randomArena.id);
    }
  };

  const selectedArena = arenas.find((a) => a.id === value);

  const getShapeColor = (shape: string) => {
    const colors: Record<string, string> = {
      circle: "#3b82f6",
      rectangle: "#8b5cf6",
      pentagon: "#ec4899",
      hexagon: "#f59e0b",
      octagon: "#10b981",
      star: "#f97316",
      oval: "#06b6d4",
      loop: "#6366f1",
      racetrack: "#84cc16",
    };
    return colors[shape] || "#6b7280";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading Arenas...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}>
        <Typography color="error.dark" fontWeight="bold">
          ⚠️ Error Loading Arenas
        </Typography>
        <Typography variant="body2" color="error.dark" sx={{ mt: 1 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  if (arenas.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: "warning.light",
          borderRadius: 2,
          border: "2px solid",
          borderColor: "warning.main",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          color="warning.dark"
          fontWeight="bold"
          sx={{ mb: 1 }}
        >
          🏟️ No Arenas Available
        </Typography>
        <Typography variant="body2" color="warning.dark" sx={{ mb: 2 }}>
          No arenas found in the database. Please ask the admin to add arenas
          before starting a battle.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontStyle: "italic" }}
        >
          Admin: Go to Admin → Game → Stadiums to create arenas
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: "flex", alignItems: "flex-start", gap: 1, width: "100%" }}
    >
      <FormControl fullWidth disabled={disabled}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={handleChange}
          renderValue={(selected) => {
            const arena = arenas.find((a) => a.id === selected);
            if (!arena) return selected;

            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: arena.shape === "circle" ? "50%" : "4px",
                    bgcolor: getShapeColor(arena.shape),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  🏟️
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography fontWeight="bold">{arena.name}</Typography>
                  <Chip
                    label={arena.shape.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getShapeColor(arena.shape),
                      color: "white",
                      fontSize: "0.65rem",
                      height: 20,
                      fontWeight: "bold",
                    }}
                  />
                </Box>
              </Box>
            );
          }}
        >
          {arenas.map((arena) => (
            <MenuItem key={arena.id} value={arena.id}>
              <ArenaMenuItem arena={arena} />
            </MenuItem>
          ))}
        </Select>

        {/* Preview of Selected Arena */}
        {selectedArena && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius:
                    selectedArena.shape === "circle" ? "50%" : "8px",
                  bgcolor: getShapeColor(selectedArena.shape),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "2rem",
                }}
              >
                🏟️
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedArena.name}
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}
                >
                  <Chip
                    label={selectedArena.shape.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getShapeColor(selectedArena.shape),
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                    }}
                  />
                  {selectedArena.theme && (
                    <Chip
                      label={selectedArena.theme.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Quick Stats */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
                mb: 1,
              }}
            >
              <StatItem
                label="Loops"
                value={selectedArena.loops?.length || 0}
                icon="�"
              />
              <StatItem
                label="Exits"
                value={
                  selectedArena.exits?.filter((e) => e.enabled).length || 0
                }
                icon="�"
              />
              <StatItem
                label="Obstacles"
                value={selectedArena.obstacles?.length || 0}
                icon="�"
              />
              <StatItem
                label="Portals"
                value={selectedArena.portals?.length || 0}
                icon="🌀"
              />
            </Box>

            {/* Description */}
            {selectedArena.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                {selectedArena.description}
              </Typography>
            )}
          </Box>
        )}
      </FormControl>

      {showRandomButton && (
        <Tooltip title="Random Arena">
          <span>
            <IconButton
              onClick={handleRandomSelect}
              disabled={disabled || loading || arenas.length === 0}
              color="primary"
              sx={{ mt: 1 }}
            >
              <RandomIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

// Menu Item Component for Dropdown
function ArenaMenuItem({ arena }: { arena: ArenaConfig }) {
  const getShapeColor = (shape: string) => {
    const colors: Record<string, string> = {
      circle: "#3b82f6",
      rectangle: "#8b5cf6",
      pentagon: "#ec4899",
      hexagon: "#f59e0b",
      octagon: "#10b981",
      star: "#f97316",
      oval: "#06b6d4",
      loop: "#6366f1",
      racetrack: "#84cc16",
    };
    return colors[shape] || "#6b7280";
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        py: 0.5,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: arena.shape === "circle" ? "50%" : "4px",
          bgcolor: getShapeColor(arena.shape),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1.25rem",
        }}
      >
        🏟️
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          {arena.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Chip
            label={arena.shape.toUpperCase()}
            size="small"
            sx={{
              bgcolor: getShapeColor(arena.shape),
              color: "white",
              fontSize: "0.65rem",
              height: 18,
              fontWeight: "bold",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {arena.loops?.length || 0} loops •{" "}
            {arena.exits?.filter((e) => e.enabled).length || 0} exits
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Stat Item Component
function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {icon} {label}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  );
}
