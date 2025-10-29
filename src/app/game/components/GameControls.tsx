"use client";

import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  useTheme,
} from "@mui/material";

interface GameControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  playerBeyblade: string;
  aiBeyblade: string;
  onPlayerBeybladeChange: (beyblade: string) => void;
  onAIBeybladeChange: (beyblade: string) => void;
  onRestart: () => void;
  availableBeyblades: Record<string, { name: string }>;
  className?: string;
  isMultiplayer?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  isLoading = false,
  playerBeyblade,
  aiBeyblade,
  onPlayerBeybladeChange,
  onAIBeybladeChange,
  onRestart,
  availableBeyblades,
  className = "",
  isMultiplayer = false,
}) => {
  const theme = useTheme();

  // In multiplayer mode, don't show beyblade selectors
  if (isMultiplayer) {
    return (
      <Box
        className={className}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 0 },
          width: "100%",
        }}
      >
        {/* Restart Button - Disabled in multiplayer */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: { xs: "100%", sm: 200 },
            maxWidth: { xs: "100%", sm: 250 },
          }}
        >
          <Button
            onClick={onRestart}
            disabled={true}
            variant="contained"
            size="large"
            fullWidth
            sx={{
              px: 4,
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              fontWeight: 600,
              opacity: 0.6,
            }}
          >
            Multiplayer Battle
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 0 },
        width: "100%",
      }}
    >
      {/* Player Beyblade Selection */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: { xs: "100%", sm: 200 },
          maxWidth: { xs: "100%", sm: 250 },
        }}
      >
        <FormControl fullWidth disabled={isPlaying}>
          <InputLabel>Your Beyblade</InputLabel>
          <Select
            value={playerBeyblade}
            onChange={(e) => onPlayerBeybladeChange(e.target.value)}
            label="Your Beyblade"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderWidth: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            }}
          >
            {Object.entries(availableBeyblades).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                {config.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Restart Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: { xs: "100%", sm: 200 },
          maxWidth: { xs: "100%", sm: 250 },
        }}
      >
        <Button
          onClick={onRestart}
          disabled={isPlaying || isLoading}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            px: 4,
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: isPlaying || isLoading ? "none" : "scale(1.05)",
              boxShadow:
                isPlaying || isLoading
                  ? undefined
                  : `0 6px 20px ${theme.palette.primary.main}60`,
            },
            "&:active": {
              transform: isPlaying || isLoading ? "none" : "scale(0.95)",
            },
            "&:disabled": {
              opacity: 0.6,
              cursor: "not-allowed",
            },
          }}
        >
          {isLoading
            ? "Loading..."
            : isPlaying
            ? "Battle In Progress"
            : "New Battle"}
        </Button>
      </Box>

      {/* AI Beyblade Selection */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: { xs: "100%", sm: 200 },
          maxWidth: { xs: "100%", sm: 250 },
        }}
      >
        <FormControl fullWidth disabled={isPlaying}>
          <InputLabel>AI Opponent</InputLabel>
          <Select
            value={aiBeyblade}
            onChange={(e) => onAIBeybladeChange(e.target.value)}
            label="AI Opponent"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderWidth: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "secondary.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "secondary.main",
                },
              },
            }}
          >
            {Object.entries(availableBeyblades).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                {config.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default GameControls;
