/**
 * useGameInput Hook
 * Handles keyboard and mouse input for the game
 */

import { useState, useEffect, useCallback } from "react";
import type { GameInput } from "@/lib/game/types";

export interface UseGameInputOptions {
  enabled?: boolean;
  onInput?: (input: GameInput) => void;
}

export interface UseGameInputReturn {
  input: GameInput;
  keys: Set<string>;
  resetInput: () => void;
}

const INITIAL_INPUT: GameInput = {
  direction: { x: 0, y: 0 },
  charging: false,
  dashing: false,
  specialMove: false,
};

export function useGameInput(options: UseGameInputOptions = {}): UseGameInputReturn {
  const { enabled = true, onInput } = options;
  
  const [input, setInput] = useState<GameInput>(INITIAL_INPUT);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  
  const updateInput = useCallback((newInput: GameInput) => {
    setInput(newInput);
    onInput?.(newInput);
  }, [onInput]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      
      // Calculate direction based on WASD
      const direction = { x: 0, y: 0 };
      if (keys.has("w") || keys.has("arrowup")) direction.y = -1;
      if (keys.has("s") || keys.has("arrowdown")) direction.y = 1;
      if (keys.has("a") || keys.has("arrowleft")) direction.x = -1;
      if (keys.has("d") || keys.has("arrowright")) direction.x = 1;
      
      // Normalize diagonal movement
      if (direction.x !== 0 && direction.y !== 0) {
        const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        direction.x /= magnitude;
        direction.y /= magnitude;
      }
      
      // Update input state
      updateInput({
        direction,
        charging: keys.has(" ") || keys.has("space"),
        dashing: keys.has("shift"),
        specialMove: keys.has("e"),
      });
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      
      // Recalculate direction
      const remaining = new Set(keys);
      remaining.delete(key);
      
      const direction = { x: 0, y: 0 };
      if (remaining.has("w") || remaining.has("arrowup")) direction.y = -1;
      if (remaining.has("s") || remaining.has("arrowdown")) direction.y = 1;
      if (remaining.has("a") || remaining.has("arrowleft")) direction.x = -1;
      if (remaining.has("d") || remaining.has("arrowright")) direction.x = 1;
      
      if (direction.x !== 0 && direction.y !== 0) {
        const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        direction.x /= magnitude;
        direction.y /= magnitude;
      }
      
      updateInput({
        direction,
        charging: remaining.has(" ") || remaining.has("space"),
        dashing: remaining.has("shift"),
        specialMove: remaining.has("e"),
      });
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled, keys, updateInput]);
  
  const resetInput = useCallback(() => {
    setInput(INITIAL_INPUT);
    setKeys(new Set());
  }, []);
  
  return {
    input,
    keys,
    resetInput,
  };
}
