"use client";

import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import type { GameBeyblade } from "../types/game";

interface MatchResultScreenProps {
  winner: GameBeyblade | null;
  isPlayerWinner: boolean;
  gameTime: number;
  isMultiplayer?: boolean;
  onPlayAgain?: () => void;
  onBackToMenu: () => void;
  onPlayAgainMultiplayer?: () => void; // New: For multiplayer rematch
}

const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  winner,
  isPlayerWinner,
  gameTime,
  isMultiplayer = false,
  onPlayAgain,
  onBackToMenu,
  onPlayAgainMultiplayer,
}) => {
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
      <Card
        sx={{
          textAlign: "center",
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          backgroundColor: "background.paper",
          border: `2px solid`,
          borderColor: isPlayerWinner ? "success.main" : "error.main",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <CardContent>
          {/* Victory/Defeat Icon */}
          <Box sx={{ fontSize: "5rem", mb: 2 }}>
            {isPlayerWinner ? "🏆" : "💔"}
          </Box>

          {/* Result Title */}
          <Typography
            variant="h3"
            color={isPlayerWinner ? "success.main" : "error.main"}
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}
          >
            {isPlayerWinner ? "Victory!" : "Defeat!"}
          </Typography>

          {/* Winner Name */}
          {winner && (
            <Typography
              variant="h5"
              color="text.primary"
              sx={{ mb: 3, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
            >
              {winner.config.name} Wins!
            </Typography>
          )}

          {/* Game Stats */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 3,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Battle Duration: {gameTime.toFixed(1)}s
            </Typography>
            {winner && (
              <>
                <Typography variant="body1" color="text.secondary">
                  Remaining Spin: {Math.floor(winner.spin)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Final Power: {Math.floor(winner.power || 0)}/25
                </Typography>
              </>
            )}
            {isMultiplayer && (
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                Online Multiplayer Match
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Play Again for Single Player */}
            {onPlayAgain && !isMultiplayer && (
              <Button
                variant="contained"
                onClick={onPlayAgain}
                size="large"
                fullWidth
              >
                Play Again
              </Button>
            )}

            {/* Play Again for Multiplayer - Rejoin Matchmaking */}
            {isMultiplayer && onPlayAgainMultiplayer && (
              <Button
                variant="contained"
                onClick={onPlayAgainMultiplayer}
                size="large"
                fullWidth
                color="primary"
              >
                🎮 Find New Opponent
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={onBackToMenu}
              size="large"
              fullWidth
            >
              Back to Menu
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Encouragement Message */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", maxWidth: 400 }}
      >
        {isPlayerWinner
          ? "Great job! Your beyblade skills are improving!"
          : "Don't give up! Try different strategies and special moves!"}
      </Typography>
    </Box>
  );
};

export default MatchResultScreen;
