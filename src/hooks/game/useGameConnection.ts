/**
 * useGameConnection Hook
 * Manages Colyseus connection lifecycle
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { GameConnection, type RoomOptions } from "@/lib/game/connection";
import type { ConnectionState, ServerGameState, ServerBeyblade } from "@/lib/game/types";

export interface UseGameConnectionOptions {
  serverUrl: string;
  autoConnect?: boolean;
  roomName?: string;
  roomOptions?: RoomOptions;
}

export interface UseGameConnectionReturn {
  connectionState: ConnectionState;
  gameState: ServerGameState | null;
  beyblades: Map<string, ServerBeyblade>;
  error: string | null;
  connect: (roomName: string, options: RoomOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  sendInput: (direction: { x: number; y: number }) => void;
  sendAction: (type: "charge" | "dash" | "special", data?: any) => void;
  isConnected: boolean;
}

export function useGameConnection(options: UseGameConnectionOptions): UseGameConnectionReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [gameState, setGameState] = useState<ServerGameState | null>(null);
  const [beyblades, setBeyblades] = useState<Map<string, ServerBeyblade>>(new Map());
  const [error, setError] = useState<string | null>(null);
  
  const connectionRef = useRef<GameConnection | null>(null);
  
  // Initialize connection
  useEffect(() => {
    connectionRef.current = new GameConnection(options.serverUrl);
    
    connectionRef.current.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setBeyblades(new Map(state.beyblades));
      },
      onBeybladeAdded: (beyblade, key) => {
        setBeyblades((prev) => {
          const next = new Map(prev);
          next.set(key, beyblade);
          return next;
        });
      },
      onBeybladeChanged: (beyblade, key) => {
        setBeyblades((prev) => {
          const next = new Map(prev);
          next.set(key, beyblade);
          return next;
        });
      },
      onBeybladeRemoved: (beyblade, key) => {
        setBeyblades((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      },
      onError: (err) => {
        setError(err.message);
        setConnectionState("error");
      },
      onDisconnect: () => {
        setConnectionState("disconnected");
      },
    });
    
    return () => {
      connectionRef.current?.disconnect();
    };
  }, [options.serverUrl]);
  
  // Auto-connect if configured
  useEffect(() => {
    if (options.autoConnect && options.roomName && options.roomOptions) {
      connect(options.roomName, options.roomOptions);
    }
  }, [options.autoConnect, options.roomName, options.roomOptions]);
  
  const connect = useCallback(async (roomName: string, roomOptions: RoomOptions) => {
    setConnectionState("connecting");
    setError(null);
    
    try {
      await connectionRef.current?.connect(roomName, roomOptions);
      setConnectionState("connected");
    } catch (err) {
      setConnectionState("error");
      setError(err instanceof Error ? err.message : "Connection failed");
      throw err;
    }
  }, []);
  
  const disconnect = useCallback(async () => {
    await connectionRef.current?.disconnect();
    setConnectionState("disconnected");
    setGameState(null);
    setBeyblades(new Map());
  }, []);
  
  const sendInput = useCallback((direction: { x: number; y: number }) => {
    connectionRef.current?.sendInput(direction);
  }, []);
  
  const sendAction = useCallback((type: "charge" | "dash" | "special", data?: any) => {
    connectionRef.current?.sendAction(type, data);
  }, []);
  
  return {
    connectionState,
    gameState,
    beyblades,
    error,
    connect,
    disconnect,
    sendInput,
    sendAction,
    isConnected: connectionState === "connected",
  };
}
