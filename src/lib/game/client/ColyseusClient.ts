/**
 * Colyseus Game Client
 * Manages connection to game server and room state synchronization
 */

import * as Colyseus from "colyseus.js";

// Server state types from Colyseus schema
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

export interface TryoutRoomOptions {
  userId: string;
  username: string;
  beybladeId: string;
  arenaId: string;
}

export interface BattleRoomOptions extends TryoutRoomOptions {
  opponentId?: string; // For PvP
  difficulty?: "easy" | "medium" | "hard"; // For AI
}

/**
 * Callbacks for game events
 */
export interface GameClientCallbacks {
  onStateChange?: (state: ServerGameState) => void;
  onBeybladeAdded?: (beyblade: ServerBeyblade, key: string) => void;
  onBeybladeChanged?: (beyblade: ServerBeyblade, key: string) => void;
  onBeybladeRemoved?: (beyblade: ServerBeyblade, key: string) => void;
  onRingOut?: (data: { playerId: string }) => void;
  onSpecialMove?: (data: { playerId: string; moveId?: string }) => void;
  onError?: (error: Error) => void;
  onDisconnect?: () => void;
}

/**
 * Colyseus Game Client
 */
export class ColyseusGameClient {
  private client: Colyseus.Client;
  private room?: Colyseus.Room;
  private callbacks: GameClientCallbacks = {};
  private serverUrl: string;
  
  constructor(serverUrl: string = "ws://localhost:2567") {
    this.serverUrl = serverUrl;
    this.client = new Colyseus.Client(serverUrl);
  }
  
  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: GameClientCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
  
  /**
   * Connect to Tryout Room (solo practice)
   */
  async connectTryout(options: TryoutRoomOptions): Promise<void> {
    try {
      this.room = await this.client.joinOrCreate("tryout_room", options);
      this.setupRoomListeners();
      console.log("✅ Connected to Tryout Room:", this.room.sessionId);
    } catch (error) {
      console.error("❌ Failed to connect to Tryout Room:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Connect to Single Battle Room (vs AI)
   */
  async connectSingleBattle(options: BattleRoomOptions): Promise<void> {
    try {
      this.room = await this.client.joinOrCreate("single_battle_room", options);
      this.setupRoomListeners();
      console.log("✅ Connected to Single Battle Room:", this.room.sessionId);
    } catch (error) {
      console.error("❌ Failed to connect to Single Battle Room:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Connect to PvP Battle Room
   */
  async connectPvPBattle(options: BattleRoomOptions): Promise<void> {
    try {
      this.room = await this.client.joinOrCreate("pvp_battle_room", options);
      this.setupRoomListeners();
      console.log("✅ Connected to PvP Battle Room:", this.room.sessionId);
    } catch (error) {
      console.error("❌ Failed to connect to PvP Battle Room:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Set up room event listeners
   */
  private setupRoomListeners(): void {
    if (!this.room) return;
    
    // State change
    this.room.onStateChange((state: any) => {
      this.callbacks.onStateChange?.(state as ServerGameState);
    });
    
    // Beyblade events
    this.room.state.beyblades.onAdd((beyblade: any, key: string) => {
      console.log("🎮 Beyblade added:", key, beyblade);
      this.callbacks.onBeybladeAdded?.(beyblade as ServerBeyblade, key);
      
      // Listen to individual beyblade changes
      beyblade.onChange(() => {
        this.callbacks.onBeybladeChanged?.(beyblade as ServerBeyblade, key);
      });
    });
    
    this.room.state.beyblades.onRemove((beyblade: any, key: string) => {
      console.log("👋 Beyblade removed:", key);
      this.callbacks.onBeybladeRemoved?.(beyblade as ServerBeyblade, key);
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
   * Send player input (WASD movement)
   */
  sendInput(direction: { x: number; y: number }): void {
    if (!this.room) {
      console.warn("⚠️ Cannot send input: not connected to room");
      return;
    }
    
    this.room.send("input", { direction });
  }
  
  /**
   * Send action command (charge, dash, special)
   */
  sendAction(type: "charge" | "dash" | "special", data?: any): void {
    if (!this.room) {
      console.warn("⚠️ Cannot send action: not connected to room");
      return;
    }
    
    this.room.send("action", { type, ...data });
  }
  
  /**
   * Get current room state
   */
  getState(): ServerGameState | null {
    return this.room?.state as ServerGameState || null;
  }
  
  /**
   * Get my beyblade
   */
  getMyBeyblade(): ServerBeyblade | null {
    if (!this.room) return null;
    return this.room.state.beyblades.get(this.room.sessionId) as ServerBeyblade || null;
  }
  
  /**
   * Get all beyblades
   */
  getAllBeyblades(): ServerBeyblade[] {
    if (!this.room) return [];
    return Array.from(this.room.state.beyblades.values()) as ServerBeyblade[];
  }
  
  /**
   * Get arena state
   */
  getArena(): ServerArena | null {
    return this.room?.state.arena as ServerArena || null;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return !!this.room && this.room.connection.isOpen;
  }
  
  /**
   * Disconnect from room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.leave();
      this.room = undefined;
      console.log("👋 Disconnected from room");
    }
  }
  
  /**
   * Reconnect to room (if connection drops)
   */
  async reconnect(reconnectionToken: string): Promise<void> {
    try {
      this.room = await this.client.reconnect(reconnectionToken);
      this.setupRoomListeners();
      console.log("✅ Reconnected to room");
    } catch (error) {
      console.error("❌ Reconnection failed:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Get available rooms
   */
  async getAvailableRooms(roomName: string): Promise<any[]> {
    try {
      return await (this.client as any).getAvailableRooms(roomName);
    } catch (error) {
      console.error("❌ Failed to get available rooms:", error);
      return [];
    }
  }
}

/**
 * Singleton instance (optional)
 */
let gameClientInstance: ColyseusGameClient | null = null;

export function getGameClient(serverUrl?: string): ColyseusGameClient {
  if (!gameClientInstance) {
    gameClientInstance = new ColyseusGameClient(serverUrl);
  }
  return gameClientInstance;
}

export function resetGameClient(): void {
  gameClientInstance = null;
}
