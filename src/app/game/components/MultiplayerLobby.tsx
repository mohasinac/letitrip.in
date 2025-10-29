"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { initSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

interface MultiplayerLobbyProps {
  onGameStart: (roomData: any) => void;
  onCancel: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onGameStart,
  onCancel,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<
    "name-entry" | "connecting" | "waiting" | "ready"
  >("name-entry");
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [waitTimeout, setWaitTimeout] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const socketInstance = initSocket();
    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.off("room-joined");
        socketInstance.off("opponent-joined");
        socketInstance.off("waiting-timeout");
        socketInstance.off("wait-extended");
        socketInstance.off("final-timeout");
        socketInstance.off("opponent-disconnected");
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("room-joined", (data) => {
      console.log("Room joined:", data);
      setRoomData(data);
      if (data.waitingForOpponent) {
        setStatus("waiting");
        startCountdown();
      } else {
        setStatus("ready");
      }
    });

    socket.on("opponent-joined", (data) => {
      console.log("Opponent joined:", data);
      setStatus("ready");
      setRoomData(data);
      onGameStart(data);
    });

    socket.on("waiting-timeout", () => {
      setWaitTimeout(true);
    });

    socket.on("wait-extended", () => {
      setWaitTimeout(false);
      setCountdown(30);
      startCountdown();
    });

    socket.on("final-timeout", () => {
      setError("No opponent found. Disconnecting in 10 seconds...");
      setTimeout(() => {
        handleCancel();
      }, 10000);
    });

    socket.on("opponent-disconnected", () => {
      setError("Opponent disconnected!");
      setTimeout(() => {
        handleCancel();
      }, 3000);
    });

    socket.on("server-full", (data) => {
      setError(
        `Server is full! ${data.currentPlayers}/${data.maxPlayers} players online. Please try again in a few minutes.`
      );
      setStatus("name-entry");
    });

    return () => {
      socket.off("room-joined");
      socket.off("opponent-joined");
      socket.off("waiting-timeout");
      socket.off("wait-extended");
      socket.off("final-timeout");
      socket.off("opponent-disconnected");
      socket.off("server-full");
    };
  }, [socket, onGameStart]);

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!socket) {
      setError("Connection error. Please refresh the page.");
      return;
    }

    setStatus("connecting");
    setError(null);

    socket.connect();
    socket.emit("join-room", { playerName: playerName.trim() });
  };

  const handleExtendWait = () => {
    if (socket) {
      socket.emit("extend-wait");
      setWaitTimeout(false);
    }
  };

  const handleCancel = () => {
    if (socket) {
      socket.disconnect();
    }
    onCancel();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 3,
        p: 3,
      }}
    >
      {status === "name-entry" && (
        <>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
            Enter Your Name
          </Typography>
          <TextField
            label="Player Name"
            variant="outlined"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleJoinRoom();
            }}
            sx={{ width: 300 }}
            autoFocus
            error={!!error}
            helperText={error}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleJoinRoom}
              size="large"
              sx={{ px: 4 }}
            >
              Join Room
            </Button>
            <Button variant="outlined" onClick={handleCancel} size="large">
              Back
            </Button>
          </Box>
        </>
      )}

      {status === "connecting" && (
        <>
          <CircularProgress size={60} />
          <Typography variant="h5">Connecting...</Typography>
        </>
      )}

      {status === "waiting" && (
        <>
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Waiting for opponent...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Time remaining: {countdown}s
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Room ID: {roomData?.roomId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You are Player {roomData?.playerNumber}
          </Typography>
          <Button variant="outlined" onClick={handleCancel} sx={{ mt: 2 }}>
            Cancel
          </Button>
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, width: "100%", maxWidth: 400 }}>
          {error}
        </Alert>
      )}

      {/* Wait timeout dialog */}
      <Dialog open={waitTimeout} onClose={() => {}}>
        <DialogTitle>No Opponent Found</DialogTitle>
        <DialogContent>
          <Typography>
            No opponent has joined yet. Would you like to wait for another 30
            seconds?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="error">
            No, Exit
          </Button>
          <Button onClick={handleExtendWait} variant="contained" autoFocus>
            Yes, Wait 30s More
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiplayerLobby;
