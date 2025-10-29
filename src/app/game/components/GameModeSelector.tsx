"use client";

import React from "react";
import { Box, Button, Typography, Card, CardContent } from "@mui/material";
import { useRouter } from "next/navigation";

interface GameModeSelectorProps {
  onSelectMode: (mode: "1p" | "2p") => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  onSelectMode,
}) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 4,
        p: 3,
      }}
    >
      <Typography
        variant="h3"
        sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
      >
        Choose Game Mode
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Single Player */}
        <Card
          sx={{
            width: 300,
            cursor: "pointer",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: 6,
            },
          }}
          onClick={() => onSelectMode("1p")}
        >
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, fontSize: "3rem" }}>
              🎮
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              Single Player
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Battle against AI opponent
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              Play vs AI
            </Button>
          </CardContent>
        </Card>

        {/* Multiplayer */}
        <Card
          sx={{
            width: 300,
            cursor: "pointer",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: 6,
            },
          }}
          onClick={() => onSelectMode("2p")}
        >
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, fontSize: "3rem" }}>
              🌐
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              Multiplayer
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Battle online with another player
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              color="secondary"
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              Play Online
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default GameModeSelector;
