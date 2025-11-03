/**
 * API Route: Get all Beyblade stats
 * GET /api/beyblades
 * REFACTORED: Uses standardized API utilities
 */

import { createApiHandler, successResponse } from "@/lib/api";
import { beybladeStatsService } from "@/lib/database/beybladeStatsService";
import { BeybladeStats } from "@/types/beybladeStats";

export const GET = createApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  let beyblades;

  if (search) {
    beyblades = await beybladeStatsService.searchBeybladesByName(search);
  } else if (
    type &&
    ["attack", "defense", "stamina", "balanced"].includes(type)
  ) {
    beyblades = await beybladeStatsService.getBeybladesByType(type as any);
  } else {
    beyblades = await beybladeStatsService.getAllBeybladeStats();
  }

  return successResponse(beyblades);
});

export const POST = createApiHandler(async (request) => {
  const body = await request.text();

  // Check if body is empty
  if (!body || body.trim() === "") {
    throw new Error("Request body is empty");
  }

  let beybladeData: Partial<BeybladeStats>;

  try {
    beybladeData = JSON.parse(body);
  } catch (error) {
    throw new Error("Invalid JSON in request body");
  }

  // Validate required fields
  if (!beybladeData.displayName || !beybladeData.type) {
    throw new Error(
      "Missing required fields: displayName and type are required",
    );
  }

  // Generate ID from display name
  const id = beybladeData.displayName.toLowerCase().replace(/\s+/g, "_");

  // Generate fileName for backward compatibility
  const fileName = `${id}.svg`;

  // Create complete beyblade object with defaults
  const newBeyblade: BeybladeStats = {
    id,
    displayName: beybladeData.displayName,
    fileName,
    type: beybladeData.type,
    spinDirection: beybladeData.spinDirection || "right",
    mass: beybladeData.mass || 50, // grams
    radius: beybladeData.radius || 4, // cm
    actualSize: (beybladeData.radius || 4) * 10, // pixels = radius * 10
    typeDistribution: beybladeData.typeDistribution || {
      attack: 120,
      defense: 120,
      stamina: 120,
      total: 360,
    },
    pointsOfContact: beybladeData.pointsOfContact || [
      { angle: 0, damageMultiplier: 1.2, width: 45 },
      { angle: 90, damageMultiplier: 1.0, width: 45 },
      { angle: 180, damageMultiplier: 1.2, width: 45 },
      { angle: 270, damageMultiplier: 1.0, width: 45 },
    ],
    imageUrl: beybladeData.imageUrl,
    imagePosition: beybladeData.imagePosition || {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    },
  };

  // Save to database (userId can be 'admin' for now)
  await beybladeStatsService.saveBeybladeStats(newBeyblade, "admin");

  return successResponse(newBeyblade);
});
