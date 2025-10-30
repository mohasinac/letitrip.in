/**
 * Script: Initialize Default Arena
 * Creates the first default arena in the database
 */

import { arenaService } from "../src/lib/database/arenaService";
import { ArenaConfig } from "../src/types/arenaConfig";

const DEFAULT_ARENA: Omit<ArenaConfig, "id"> = {
  name: "Classic Stadium",
  description:
    "The standard battle arena - perfect for beginners and competitive play",
  width: 50,
  height: 50,
  shape: "circle",
  theme: "metrocity",
  gameMode: "player-vs-ai",
  aiDifficulty: "medium",

  loops: [
    {
      radius: 15,
      shape: "circle",
      speedBoost: 1.2,
      spinBoost: 2,
      frictionMultiplier: 0.9,
      color: "#3b82f6",
    },
    {
      radius: 20,
      shape: "circle",
      speedBoost: 1.0,
      frictionMultiplier: 1.0,
      color: "#10b981",
    },
  ],

  exits: [],

  wall: {
    enabled: true,
    baseDamage: 5,
    recoilDistance: 2,
    hasSpikes: false,
    spikeDamageMultiplier: 1.0,
    hasSprings: false,
    springRecoilMultiplier: 1.0,
    thickness: 0.5,
  },

  obstacles: [],
  pits: [],
  laserGuns: [],
  goalObjects: [],
  requireAllGoalsDestroyed: false,
  backgroundLayers: [],

  gravity: 0,
  airResistance: 0.01,
  surfaceFriction: 0.02,

  difficulty: "easy", // Mark as default
};

async function initializeDefaultArena() {
  try {
    console.log("Initializing default arena...");

    // Check if arena already exists
    const existing = await arenaService.getArenaById("classic_stadium");

    if (existing) {
      console.log("Default arena already exists. Updating...");
      await arenaService.updateArena("classic_stadium", DEFAULT_ARENA);
      console.log("✅ Default arena updated successfully!");
    } else {
      console.log("Creating new default arena...");
      const arena = await arenaService.createArena(DEFAULT_ARENA);
      console.log("✅ Default arena created successfully!");
      console.log("Arena ID:", arena.id);
    }

    console.log("\nDefault Arena Details:");
    console.log("- Name:", DEFAULT_ARENA.name);
    console.log("- Shape:", DEFAULT_ARENA.shape);
    console.log("- Theme:", DEFAULT_ARENA.theme);
    console.log("- Loops:", DEFAULT_ARENA.loops.length);
    console.log("- Difficulty:", DEFAULT_ARENA.difficulty);
  } catch (error) {
    console.error("❌ Error initializing default arena:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDefaultArena()
    .then(() => {
      console.log("\n🎉 Initialization complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Initialization failed:", error);
      process.exit(1);
    });
}

export { initializeDefaultArena, DEFAULT_ARENA };
