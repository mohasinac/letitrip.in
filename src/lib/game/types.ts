/**
 * Shared Game Types
 * Type definitions used across the game system
 */

// Server State Types (from Colyseus)
export interface ServerBeyblade {
  id: string;
  userId: string;
  username: string;
  beybladeId: string;
  isAI: boolean;
  
  // Position and movement
  x: number;
  y: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  angularVelocity: number;
  
  // Stats
  mass: number;
  radius: number;
  health: number;
  stamina: number;
  
  // State flags
  isActive: boolean;
  isRingOut: boolean;
}

export interface ServerArena {
  id: string;
  name: string;
  width: number;
  height: number;
  shape: string;
  gravity: number;
  airResistance: number;
  surfaceFriction: number;
}

export interface ServerGameState {
  mode: string;
  status: string;
  startTime: number;
  beyblades: Map<string, ServerBeyblade>;
  arena: ServerArena;
}

// Game Connection Types
export type ConnectionState = 
  | "disconnected" 
  | "connecting" 
  | "connected" 
  | "reconnecting" 
  | "error";

export interface GameConnectionInfo {
  state: ConnectionState;
  roomId?: string;
  sessionId?: string;
  error?: string;
}

// Input Types
export interface GameInput {
  direction: { x: number; y: number };
  charging: boolean;
  dashing: boolean;
  specialMove: boolean;
}

export type GameAction = 
  | { type: "charge" }
  | { type: "dash" }
  | { type: "special"; moveId?: string };

// Firestore Data Types
export interface BeybladeData {
  id: string;
  name: string;
  type: "Attack" | "Defense" | "Stamina" | "Balance";
  attack: number;
  defense: number;
  stamina: number;
  image?: string;
  description?: string;
}

export interface ArenaData {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  size: "Small" | "Medium" | "Large";
  description?: string;
  features?: string;
}

// UI State Types
export interface UIState {
  showControls: boolean;
  showDebug: boolean;
  showStats: boolean;
  isPaused: boolean;
}
