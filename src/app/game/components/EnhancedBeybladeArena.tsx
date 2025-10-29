"use client";

import React from "react";
import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";
import { BEYBLADE_CONFIGS } from "@/constants/beyblades";
import { useGameState } from "../hooks/useGameState";
import GameArena from "./GameArena";
import GameControls from "./GameControls";
import ControlsHelp from "./ControlsHelp";
import DraggableVirtualDPad from "./DraggableVirtualDPad";
import GameInstructions from "./GameInstructions";
import SpecialControlsHelp from "./SpecialControlsHelp";

interface EnhancedBeybladeArenaProps {
  onGameEnd?: (winner: any) => void;
}

const EnhancedBeybladeArena: React.FC<EnhancedBeybladeArenaProps> = ({
  onGameEnd,
}) => {
  const theme = useTheme();
  const {
    gameState,
    selectedBeyblade,
    selectedAIBeyblade,
    setSelectedBeyblade,
    setSelectedAIBeyblade,
    restartGame,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleVirtualDPad,
    handleVirtualAction,
  } = useGameState({ onGameEnd });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 2, md: 4 },
        width: "100%",
        maxWidth: "1400px", // Increased from 1200px for widescreen support
        mx: "auto",
        px: { xs: 0, sm: 2, md: 3 },
      }}
    >
      {/* Game Controls */}
      <GameControls
        isPlaying={gameState.isPlaying}
        playerBeyblade={selectedBeyblade}
        aiBeyblade={selectedAIBeyblade}
        onPlayerBeybladeChange={setSelectedBeyblade}
        onAIBeybladeChange={setSelectedAIBeyblade}
        onRestart={restartGame}
        availableBeyblades={BEYBLADE_CONFIGS}
        className="w-full"
      />

      {/* Game Arena */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <GameArena
          gameState={gameState}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="shadow-2xl"
        />

        {/* Mobile Virtual D-Pad - Draggable and position saved in cookies */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          <DraggableVirtualDPad
            onDirectionChange={handleVirtualDPad}
            onActionButton={handleVirtualAction}
          />
        </Box>
      </Box>

      {/* Game Instructions - Only show during gameplay */}
      <GameInstructions
        isPlaying={gameState.isPlaying}
        className="w-full max-w-4xl"
      />

      {/* Special Controls Help */}
      <SpecialControlsHelp className="w-full max-w-4xl" />

      {/* Controls Help - Always visible */}
      <ControlsHelp className="w-full max-w-4xl" />

      {/* Game Status */}
      {!gameState.isPlaying && gameState.winner && (
        <Card
          sx={{
            textAlign: "center",
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
            maxWidth: 500,
            mx: { xs: 2, md: "auto" },
            width: "100%",
          }}
        >
          <CardContent>
            <Typography
              variant="h3"
              color="primary.main"
              fontWeight={700}
              gutterBottom
              sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}
            >
              🏆 {gameState.winner.config.name} Wins!
            </Typography>
            <Typography
              variant="h5"
              color="text.primary"
              sx={{ mb: 3, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
            >
              {gameState.winner.isPlayer ? "🎉 Victory!" : "💥 Defeat!"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Game Duration: {gameState.gameTime.toFixed(1)} seconds
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Battle Statistics */}
      {gameState.isPlaying && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: { xs: 2, md: 3 },
            width: "100%",
            maxWidth: { xs: "100%", sm: "600px", lg: "800px" }, // Better widescreen support
            px: { xs: 2, md: 0 },
          }}
        >
          {gameState.beyblades.map((beyblade, index) => (
            <Card
              key={beyblade.id}
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                backgroundColor: beyblade.isPlayer
                  ? `${theme.palette.primary.main}20`
                  : `${theme.palette.secondary.main}20`,
                border: `2px solid ${
                  beyblade.isPlayer
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main
                }`,
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 1.5, md: 2 },
                  "&:last-child": { pb: { xs: 1.5, md: 2 } },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  color={beyblade.isPlayer ? "primary.main" : "secondary.main"}
                  sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                >
                  {beyblade.isPlayer ? "🎮 Player" : "🤖 AI"}:{" "}
                  {beyblade.config.name}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 0.5, md: 1 },
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      Spin:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      sx={{
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                        color:
                          beyblade.spin > 1000
                            ? "#22C55E"
                            : beyblade.spin > 400
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {Math.floor(beyblade.spin)}/
                      {beyblade.isPlayer ? "3500" : "2800"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      Acceleration:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      {beyblade.acceleration}/10
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      Status:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                        color: beyblade.isDead
                          ? "#EF4444"
                          : beyblade.isOutOfBounds
                          ? "#F59E0B"
                          : beyblade.isInBlueLoop
                          ? "#3B82F6"
                          : "#22C55E",
                      }}
                    >
                      {beyblade.isDead
                        ? "💀 Eliminated"
                        : beyblade.isOutOfBounds
                        ? "🚫 Out of Bounds"
                        : beyblade.isInBlueLoop
                        ? "🔄 Speed Loop"
                        : "⚡ Active"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EnhancedBeybladeArena;
