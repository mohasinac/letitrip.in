"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface GameSettings {
  beybladeId: string | null;
  arenaId: string | null;
  gameMode: "tryout" | "single-battle" | "pvp" | "tournament" | null;
  difficulty?: "easy" | "medium" | "hard";
  opponentId?: string;
}

interface GameContextType {
  settings: GameSettings;
  setBeyblade: (beybladeId: string) => void;
  setArena: (arenaId: string) => void;
  setGameMode: (mode: GameSettings["gameMode"]) => void;
  setDifficulty: (difficulty: GameSettings["difficulty"]) => void;
  setOpponent: (opponentId: string) => void;
  startGame: (mode: GameSettings["gameMode"]) => void;
  resetGame: () => void;
  isReady: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultSettings: GameSettings = {
  beybladeId: null,
  arenaId: null,
  gameMode: null,
  difficulty: undefined,
  opponentId: undefined,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  const setBeyblade = useCallback((beybladeId: string) => {
    setSettings((prev) => ({ ...prev, beybladeId }));
  }, []);

  const setArena = useCallback((arenaId: string) => {
    setSettings((prev) => ({ ...prev, arenaId }));
  }, []);

  const setGameMode = useCallback((mode: GameSettings["gameMode"]) => {
    setSettings((prev) => ({ ...prev, gameMode: mode }));
  }, []);

  const setDifficulty = useCallback((difficulty: GameSettings["difficulty"]) => {
    setSettings((prev) => ({ ...prev, difficulty }));
  }, []);

  const setOpponent = useCallback((opponentId: string) => {
    setSettings((prev) => ({ ...prev, opponentId }));
  }, []);

  const startGame = useCallback((mode: GameSettings["gameMode"]) => {
    setSettings((prev) => ({ ...prev, gameMode: mode }));
  }, []);

  const resetGame = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const isReady = Boolean(
    settings.beybladeId && 
    settings.arenaId && 
    settings.gameMode
  );

  const value: GameContextType = {
    settings,
    setBeyblade,
    setArena,
    setGameMode,
    setDifficulty,
    setOpponent,
    startGame,
    resetGame,
    isReady,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
