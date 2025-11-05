/**
 * Colyseus Connection Manager
 * Handles WebSocket connection to game server
 */

import * as Colyseus from "colyseus.js";
import type { ServerGameState, ServerBeyblade } from "./types";

export interface ConnectionCallbacks {
  onStateChange?: (state: ServerGameState) => void;
  onBeybladeAdded?: (beyblade: ServerBeyblade, key: string) => void;
  onBeybladeChanged?: (beyblade: ServerBeyblade, key: string) => void;
  onBeybladeRemoved?: (beyblade: ServerBeyblade, key: string) => void;
  onRingOut?: (data: { playerId: string }) => void;
  onSpecialMove?: (data: { playerId: string; moveId?: string }) => void;
  onError?: (error: Error) => void;
  onDisconnect?: () => void;
}

export interface RoomOptions {
  userId: string;
  username: string;
  beybladeId: string;
  arenaId: string;
  difficulty?: "easy" | "medium" | "hard";
  opponentId?: string;
}

export class GameConnection {
  private client: Colyseus.Client;
  private room?: Colyseus.Room;
  private callbacks: ConnectionCallbacks = {};
  
  constructor(serverUrl: string) {
    this.client = new Colyseus.Client(serverUrl);
  }
  
  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: ConnectionCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
  
  /**
   * Connect to a room
   */
  async connect(roomName: string, options: RoomOptions): Promise<void> {
    try {
      this.room = await this.client.joinOrCreate(roomName, options);
      this.setupListeners();
      console.log(`✅ Connected to ${roomName}:`, this.room.sessionId);
    } catch (error) {
      console.error(`❌ Failed to connect to ${roomName}:`, error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Setup room event listeners
   */
  private setupListeners(): void {
    if (!this.room) return;
    
    // Wait for initial state
    this.room.onStateChange.once((state: any) => {
      console.log("🎮 Initial state received");
      this.callbacks.onStateChange?.(state as ServerGameState);
      
      // Setup beyblade listeners after state is ready
      if (state.beyblades) {
        state.beyblades.onAdd((beyblade: any, key: string) => {
          console.log("🎮 Beyblade added:", key);
          this.callbacks.onBeybladeAdded?.(beyblade as ServerBeyblade, key);
          
          beyblade.onChange(() => {
            this.callbacks.onBeybladeChanged?.(beyblade as ServerBeyblade, key);
          });
        });
        
        state.beyblades.onRemove((beyblade: any, key: string) => {
          console.log("👋 Beyblade removed:", key);
          this.callbacks.onBeybladeRemoved?.(beyblade as ServerBeyblade, key);
        });
      }
    });
    
    // Continue listening to state changes
    this.room.onStateChange((state: any) => {
      this.callbacks.onStateChange?.(state as ServerGameState);
    });
    
    // Game events
    this.room.onMessage("ring-out", (data) => {
      console.log("💥 Ring out:", data);
      this.callbacks.onRingOut?.(data);
    });
    
    this.room.onMessage("special-move", (data) => {
      console.log("✨ Special move:", data);
      this.callbacks.onSpecialMove?.(data);
    });
    
    // Error handling
    this.room.onError((code, message) => {
      console.error("❌ Room error:", code, message);
      this.callbacks.onError?.(new Error(`${code}: ${message}`));
    });
    
    // Disconnect
    this.room.onLeave((code) => {
      console.log("👋 Left room with code:", code);
      this.callbacks.onDisconnect?.();
    });
  }
  
  /**
   * Send player input
   */
  sendInput(direction: { x: number; y: number }): void {
    if (!this.room) {
      console.warn("⚠️ Cannot send input: not connected");
      return;
    }
    this.room.send("input", { direction });
  }
  
  /**
   * Send action command
   */
  sendAction(type: "charge" | "dash" | "special", data?: any): void {
    if (!this.room) {
      console.warn("⚠️ Cannot send action: not connected");
      return;
    }
    this.room.send("action", { type, ...data });
  }
  
  /**
   * Get current state
   */
  getState(): ServerGameState | null {
    return this.room?.state as ServerGameState || null;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return !!this.room && this.room.connection.isOpen;
  }
  
  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.leave();
      this.room = undefined;
      console.log("👋 Disconnected from room");
    }
  }
  
  /**
   * Reconnect
   */
  async reconnect(reconnectionToken: string): Promise<void> {
    try {
      this.room = await this.client.reconnect(reconnectionToken);
      this.setupListeners();
      console.log("✅ Reconnected to room");
    } catch (error) {
      console.error("❌ Reconnection failed:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }
}
