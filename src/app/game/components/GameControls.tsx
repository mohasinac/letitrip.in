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
  playerBeyblade: string;
  aiBeyblade: string;
  onPlayerBeybladeChange: (beyblade: string) => void;
  onAIBeybladeChange: (beyblade: string) => void;
  onRestart: () => void;
  availableBeyblades: Record<string, { name: string }>;
  className?: string;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  playerBeyblade,
  aiBeyblade,
  onPlayerBeybladeChange,
  onAIBeybladeChange,
  onRestart,
  availableBeyblades,
  className = "",
}) => {
  const theme = useTheme();

  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      {/* Player Beyblade Selection */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 200,
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
          minWidth: 200,
        }}
      >
        <Button
          onClick={onRestart}
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            minWidth: 180,
            boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: `0 6px 20px ${theme.palette.primary.main}60`,
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          {isPlaying ? "Restart Battle" : "New Battle"}
        </Button>
      </Box>

      {/* AI Beyblade Selection */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 200,
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
