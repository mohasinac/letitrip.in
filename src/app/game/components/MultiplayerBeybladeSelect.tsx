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
import BeybladeSelect from "@/components/game/BeybladeSelect";
import { useBeyblades } from "@/hooks/useBeyblades";

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
  const { beyblades, loading } = useBeyblades();

  // Get beyblade name by ID
  const getBeybladeNameById = (id: string | null) => {
    if (!id) return "Not selected";
    const beyblade = beyblades.find((b) => b.id === id);
    return beyblade?.name || "Not selected";
  };

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
    // Reset ready state when changing beyblade
    setIsReady(false);
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
              Beyblade: {getBeybladeNameById(selectedBeyblade)}
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
              Beyblade: {getBeybladeNameById(opponentBeyblade)}
            </Typography>
            <Chip
              label={opponentReady ? "Ready" : "Not Ready"}
              color={opponentReady ? "success" : "default"}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Beyblade Selection Dropdown */}
      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Choose Your Beyblade:
        </Typography>
        <BeybladeSelect
          value={selectedBeyblade || ""}
          onChange={handleSelectBeyblade}
          label="Your Beyblade"
          disabled={isReady || loading}
        />
        {isReady && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Change your selection by clicking "Not Ready" first
          </Alert>
        )}
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
