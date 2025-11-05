/**
 * Game Library Index
 * Central export point for all game-related modules
 * 
 * NOTE: Physics is now handled server-side by Colyseus + Matter.js
 * This library only exports client-side rendering, UI, and hooks
 */

// Client (Colyseus)
export * from "./client";

// Hooks
export * from "./hooks";

// Rendering
export * from "./rendering";

// Moves (visual effects only)
export * from "./moves";

// UI
export * from "./ui";

// Types
export * from "./types";
