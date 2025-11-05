/**
 * React Hook for Colyseus Game Client
 * Provides easy integration with React components
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ColyseusGameClient,
  ServerBeyblade,
  ServerArena,
  ServerGameState,
  TryoutRoomOptions,
  BattleRoomOptions,
} from "../client/ColyseusClient";

export interface UseColyseusGameOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  roomType?: "tryout" | "single_battle" | "pvp_battle";
  roomOptions?: TryoutRoomOptions | BattleRoomOptions;
}

export interface UseColyseusGameResult {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  
  // Game state
  gameState: ServerGameState | null;
  myBeyblade: ServerBeyblade | null;
  beyblades: ServerBeyblade[];
  arena: ServerArena | null;
  
  // Actions
  connect: (options: TryoutRoomOptions | BattleRoomOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  sendInput: (direction: { x: number; y: number }) => void;
  sendAction: (type: "charge" | "dash" | "special", data?: any) => void;
  
  // Client instance (for advanced usage)
  client: ColyseusGameClient | null;
}

/**
 * Hook to connect to Colyseus game server
 */
export function useColyseusGame(options: UseColyseusGameOptions = {}): UseColyseusGameResult {
  const {
    serverUrl = "ws://localhost:2567",
    autoConnect = false,
    roomType = "tryout",
    roomOptions,
  } = options;
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [gameState, setGameState] = useState<ServerGameState | null>(null);
  const [myBeyblade, setMyBeyblade] = useState<ServerBeyblade | null>(null);
  const [beyblades, setBeyblades] = useState<ServerBeyblade[]>([]);
  const [arena, setArena] = useState<ServerArena | null>(null);
  
  // Client ref
  const clientRef = useRef<ColyseusGameClient | null>(null);
  
  // Initialize client
  useEffect(() => {
    clientRef.current = new ColyseusGameClient(serverUrl);
    
    // Set up callbacks
    clientRef.current.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setArena(state.arena);
      },
      
      onBeybladeAdded: (beyblade, key) => {
        console.log("🎮 Beyblade added:", key);
        setBeyblades((prev) => [...prev, beyblade]);
        
        // Update my beyblade if it's mine
        if (clientRef.current && key === clientRef.current.getState()?.beyblades.get(key)?.id) {
          setMyBeyblade(beyblade);
        }
      },
      
      onBeybladeChanged: (beyblade, key) => {
        setBeyblades((prev) =>
          prev.map((b) => (b.id === beyblade.id ? beyblade : b))
        );
        
        // Update my beyblade if it's mine
        if (myBeyblade && beyblade.id === myBeyblade.id) {
          setMyBeyblade(beyblade);
        }
      },
      
      onBeybladeRemoved: (beyblade, key) => {
        console.log("👋 Beyblade removed:", key);
        setBeyblades((prev) => prev.filter((b) => b.id !== beyblade.id));
        
        if (myBeyblade && beyblade.id === myBeyblade.id) {
          setMyBeyblade(null);
        }
      },
      
      onError: (err) => {
        console.error("❌ Game error:", err);
        setError(err);
        setIsConnected(false);
        setIsConnecting(false);
      },
      
      onDisconnect: () => {
        console.log("👋 Disconnected");
        setIsConnected(false);
        setMyBeyblade(null);
        setBeyblades([]);
        setArena(null);
      },
    });
    
    // Auto-connect if enabled
    if (autoConnect && roomOptions) {
      connect(roomOptions);
    }
    
    // Cleanup
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [serverUrl]); // Only re-initialize if serverUrl changes
  
  /**
   * Connect to room
   */
  const connect = useCallback(async (opts: TryoutRoomOptions | BattleRoomOptions) => {
    if (!clientRef.current) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      switch (roomType) {
        case "tryout":
          await clientRef.current.connectTryout(opts as TryoutRoomOptions);
          break;
        case "single_battle":
          await clientRef.current.connectSingleBattle(opts as BattleRoomOptions);
          break;
        case "pvp_battle":
          await clientRef.current.connectPvPBattle(opts as BattleRoomOptions);
          break;
      }
      
      setIsConnected(true);
      setMyBeyblade(clientRef.current.getMyBeyblade());
      setBeyblades(clientRef.current.getAllBeyblades());
      setArena(clientRef.current.getArena());
    } catch (err) {
      setError(err as Error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [roomType]);
  
  /**
   * Disconnect from room
   */
  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      setIsConnected(false);
      setMyBeyblade(null);
      setBeyblades([]);
      setArena(null);
    }
  }, []);
  
  /**
   * Send input
   */
  const sendInput = useCallback((direction: { x: number; y: number }) => {
    if (clientRef.current) {
      clientRef.current.sendInput(direction);
    }
  }, []);
  
  /**
   * Send action
   */
  const sendAction = useCallback((type: "charge" | "dash" | "special", data?: any) => {
    if (clientRef.current) {
      clientRef.current.sendAction(type, data);
    }
  }, []);
  
  return {
    isConnected,
    isConnecting,
    error,
    gameState,
    myBeyblade,
    beyblades,
    arena,
    connect,
    disconnect,
    sendInput,
    sendAction,
    client: clientRef.current,
  };
}

/**
 * Hook for keyboard input handling
 */
export function useGameInput(
  sendInput: (direction: { x: number; y: number }) => void,
  sendAction: (type: "charge" | "dash" | "special", data?: any) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const keysPressed = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key.toLowerCase());
      
      // Calculate direction
      let x = 0;
      let y = 0;
      
      if (keysPressed.has("w") || keysPressed.has("arrowup")) y = -1;
      if (keysPressed.has("s") || keysPressed.has("arrowdown")) y = 1;
      if (keysPressed.has("a") || keysPressed.has("arrowleft")) x = -1;
      if (keysPressed.has("d") || keysPressed.has("arrowright")) x = 1;
      
      // Normalize diagonal movement
      if (x !== 0 && y !== 0) {
        const length = Math.sqrt(x * x + y * y);
        x /= length;
        y /= length;
      }
      
      if (x !== 0 || y !== 0) {
        sendInput({ x, y });
      }
      
      // Actions
      if (e.key === " ") {
        e.preventDefault();
        sendAction("charge");
      } else if (e.key === "Shift") {
        e.preventDefault();
        sendAction("dash");
      } else if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        sendAction("special");
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());
      
      // Recalculate direction
      let x = 0;
      let y = 0;
      
      if (keysPressed.has("w") || keysPressed.has("arrowup")) y = -1;
      if (keysPressed.has("s") || keysPressed.has("arrowdown")) y = 1;
      if (keysPressed.has("a") || keysPressed.has("arrowleft")) x = -1;
      if (keysPressed.has("d") || keysPressed.has("arrowright")) x = 1;
      
      // Normalize
      if (x !== 0 && y !== 0) {
        const length = Math.sqrt(x * x + y * y);
        x /= length;
        y /= length;
      }
      
      sendInput({ x, y });
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sendInput, sendAction, enabled]);
}
