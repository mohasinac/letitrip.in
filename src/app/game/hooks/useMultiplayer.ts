import { useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';
import type { Vector2D } from '../types/game';

interface UseMultiplayerOptions {
  playerNumber: number;
  roomId: string;
  onOpponentInput?: (input: any) => void;
  onGameStateUpdate?: (gameState: any) => void;
  onMatchResult?: (result: any) => void;
  onOpponentDisconnected?: () => void;
}

export const useMultiplayer = (options: UseMultiplayerOptions) => {
  const {
    playerNumber,
    roomId,
    onOpponentInput,
    onGameStateUpdate,
    onMatchResult,
    onOpponentDisconnected,
  } = options;

  const socket = useRef<Socket | null>(null);
  const isPlayer1 = playerNumber === 1;

  useEffect(() => {
    socket.current = getSocket();

    if (!socket.current) return;

    // Listen for opponent input
    if (onOpponentInput) {
      socket.current.on('opponent-input', onOpponentInput);
    }

    // Listen for game state updates (Player 2 only)
    if (!isPlayer1 && onGameStateUpdate) {
      socket.current.on('game-state-update', onGameStateUpdate);
    }

    // Listen for match results
    if (onMatchResult) {
      socket.current.on('match-result', onMatchResult);
    }

    // Listen for opponent disconnect
    if (onOpponentDisconnected) {
      socket.current.on('opponent-disconnected', onOpponentDisconnected);
    }

    return () => {
      if (socket.current) {
        socket.current.off('opponent-input');
        socket.current.off('game-state-update');
        socket.current.off('match-result');
        socket.current.off('opponent-disconnected');
      }
    };
  }, [isPlayer1, onOpponentInput, onGameStateUpdate, onMatchResult, onOpponentDisconnected]);

  // Send input to opponent
  const sendInput = useCallback((inputData: any) => {
    if (socket.current) {
      socket.current.emit('game-input', inputData);
    }
  }, []);

  // Sync game state (Player 1 only)
  const syncGameState = useCallback((gameState: any) => {
    if (socket.current && isPlayer1) {
      socket.current.emit('sync-game-state', gameState);
    }
  }, [isPlayer1]);

  // Send game over
  const sendGameOver = useCallback((winner: any) => {
    if (socket.current) {
      socket.current.emit('game-over', { winner });
    }
  }, []);

  return {
    sendInput,
    syncGameState,
    sendGameOver,
    isHost: isPlayer1,
  };
};
