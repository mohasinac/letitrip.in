"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import { getSocket } from "@/lib/socket";
import { BEYBLADE_CONFIGS } from "@/constants/beyblades";

interface MultiplayerBeybladeSelectProps {
  roomData: any;
  onStartGame: (gameData?: any) => void;
  onCancel: () => void;
}

const MultiplayerBeybladeSelect: React.FC<MultiplayerBeybladeSelectProps> = ({
  roomData,
  onStartGame,
  onCancel,
}) => {
  const [selectedBeyblade, setSelectedBeyblade] = useState<string | null>(null);
  const [opponentBeyblade, setOpponentBeyblade] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("opponent-selected", (data: any) => {
      setOpponentBeyblade(data.beyblade);
      setOpponentReady(data.ready || false);
    });

    socket.on("start-game", (data: any) => {
      // Pass the game data including selected beyblades
      onStartGame(data);
    });

    return () => {
      socket.off("opponent-selected");
      socket.off("start-game");
    };
  }, [socket, onStartGame]);

  const handleSelectBeyblade = (beybladeId: string) => {
    setSelectedBeyblade(beybladeId);
    if (socket) {
      socket.emit("select-beyblade", { beyblade: beybladeId, ready: false });
    }
  };

  const handleToggleReady = () => {
    if (!selectedBeyblade) {
      alert("Please select a beyblade first!");
      return;
    }

    const newReadyState = !isReady;
    setIsReady(newReadyState);

    if (socket) {
      socket.emit("select-beyblade", {
        beyblade: selectedBeyblade,
        ready: newReadyState,
      });
    }
  };

  const playerNumber = roomData?.playerNumber || 1;
  const beybladeOptions = Object.entries(BEYBLADE_CONFIGS);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        p: 3,
        minHeight: "60vh",
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          Select Your Beyblade
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You are Player {playerNumber} • Room: {roomData?.roomId?.slice(-8)}
        </Typography>
      </Box>

      {/* Status Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          maxWidth: 800,
          width: "100%",
        }}
      >
        <Card
          sx={{
            border: "2px solid",
            borderColor: "primary.main",
            bgcolor: "background.paper",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              You (Player {playerNumber})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Beyblade:{" "}
              {selectedBeyblade
                ? BEYBLADE_CONFIGS[selectedBeyblade].name
                : "Not selected"}
            </Typography>
            <Chip
              label={isReady ? "Ready" : "Not Ready"}
              color={isReady ? "success" : "default"}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
        <Card
          sx={{
            border: "2px solid",
            borderColor: "secondary.main",
            bgcolor: "background.paper",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Opponent (Player {playerNumber === 1 ? 2 : 1})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Beyblade:{" "}
              {opponentBeyblade
                ? BEYBLADE_CONFIGS[opponentBeyblade].name
                : "Not selected"}
            </Typography>
            <Chip
              label={opponentReady ? "Ready" : "Not Ready"}
              color={opponentReady ? "success" : "default"}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Beyblade Selection */}
      <Box sx={{ maxWidth: 1000, width: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Choose Your Beyblade:
        </Typography>
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
          {beybladeOptions.map(([id, beyblade]) => (
            <Card
              key={id}
              sx={{
                cursor: "pointer",
                border: "2px solid",
                borderColor:
                  selectedBeyblade === id ? "primary.main" : "transparent",
                bgcolor:
                  selectedBeyblade === id ? "primary.dark" : "background.paper",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  borderColor: "primary.main",
                },
              }}
              onClick={() => handleSelectBeyblade(id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {beyblade.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Direction:{" "}
                  {beyblade.direction === "left" ? "⬅️ Left" : "➡️ Right"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Speed: {beyblade.speed}x
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Ready Button */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant={isReady ? "outlined" : "contained"}
          onClick={handleToggleReady}
          size="large"
          disabled={!selectedBeyblade}
          sx={{ px: 4 }}
        >
          {isReady ? "Not Ready" : "I'm Ready!"}
        </Button>
        <Button variant="outlined" onClick={onCancel} size="large">
          Cancel
        </Button>
      </Box>

      {/* Info Alert */}
      {isReady && !opponentReady && (
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          Waiting for opponent to be ready...
        </Alert>
      )}

      {isReady && opponentReady && (
        <Alert severity="success" sx={{ maxWidth: 600 }}>
          Both players ready! Starting game...
        </Alert>
      )}
    </Box>
  );
};

export default MultiplayerBeybladeSelect;
