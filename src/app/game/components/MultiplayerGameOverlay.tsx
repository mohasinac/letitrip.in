"use client";

import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface MultiplayerGameOverlayProps {
  isMultiplayer: boolean;
  isGameOver: boolean;
  winner: any;
  isPlayerWinner: boolean;
  onQuit: () => void;
  onRematch: () => void;
  opponentWantsRematch: boolean;
  playerWantsRematch: boolean;
}

const MultiplayerGameOverlay: React.FC<MultiplayerGameOverlayProps> = ({
  isMultiplayer,
  isGameOver,
  winner,
  isPlayerWinner,
  onQuit,
  onRematch,
  opponentWantsRematch,
  playerWantsRematch,
}) => {
  // Only show in multiplayer mode when game is over
  if (!isMultiplayer || !isGameOver || !winner) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      {/* Game Over Message */}
      <Typography
        variant="h3"
        sx={{
          color: isPlayerWinner ? '#4CAF50' : '#f44336',
          fontWeight: 700,
          textShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
          mb: 2,
          fontSize: { xs: '2rem', sm: '3rem' },
        }}
      >
        {isPlayerWinner ? '🎉 Victory!' : '💥 Defeat'}
      </Typography>

      {/* Winner Name */}
      <Typography
        variant="h5"
        sx={{
          color: 'white',
          mb: 4,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        }}
      >
        {winner.name} Wins!
      </Typography>

      {/* Rematch Status */}
      {(playerWantsRematch || opponentWantsRematch) && (
        <Typography
          variant="body1"
          sx={{
            color: '#FFD700',
            mb: 3,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 600,
          }}
        >
          {playerWantsRematch && opponentWantsRematch
            ? '⏳ Starting rematch...'
            : playerWantsRematch
            ? '⏳ Waiting for opponent...'
            : '⏳ Opponent wants a rematch!'}
        </Typography>
      )}

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '80%', sm: 'auto' },
        }}
      >
        {/* Play Again Button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onRematch}
          disabled={playerWantsRematch}
          sx={{
            px: 5,
            py: 1.5,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
            transition: 'all 0.2s ease',
            backgroundColor: playerWantsRematch ? '#666' : '#4CAF50',
            '&:hover': {
              backgroundColor: playerWantsRematch ? '#666' : '#45a049',
              transform: playerWantsRematch ? 'none' : 'scale(1.05)',
              boxShadow: playerWantsRematch
                ? 'none'
                : '0 6px 20px rgba(76, 175, 80, 0.6)',
            },
            '&:active': {
              transform: playerWantsRematch ? 'none' : 'scale(0.95)',
            },
          }}
        >
          {playerWantsRematch ? '✓ Ready for Rematch' : '🔄 Play Again'}
        </Button>

        {/* Quit Button */}
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={onQuit}
          sx={{
            px: 5,
            py: 1.5,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#d32f2f',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 20px rgba(244, 67, 54, 0.6)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          🚪 Quit
        </Button>
      </Box>
    </Box>
  );
};

export default MultiplayerGameOverlay;
