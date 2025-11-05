"use client";

import { useRouter } from "next/navigation";
import { ArenaConfig } from "@/types/arenaConfig";
import { Circle, Square, Pentagon, Hexagon, Octagon, Star } from "lucide-react";

interface ArenaCardProps {
  arena: ArenaConfig;
  onPreview: (arena: ArenaConfig) => void;
  onDelete: (arena: ArenaConfig) => void;
}

export default function ArenaCard({
  arena,
  onPreview,
  onDelete,
}: ArenaCardProps) {
  const router = useRouter();

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case "circle":
        return <Circle className="w-5 h-5" />;
      case "rectangle":
        return <Square className="w-5 h-5" />;
      case "pentagon":
        return <Pentagon className="w-5 h-5" />;
      case "hexagon":
        return <Hexagon className="w-5 h-5" />;
      case "octagon":
        return <Octagon className="w-5 h-5" />;
      case "star":
        return <Star className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "forest":
        return "bg-green-600";
      case "mountains":
        return "bg-gray-600";
      case "grasslands":
        return "bg-green-500";
      case "metrocity":
        return "bg-blue-600";
      case "safari":
        return "bg-yellow-600";
      case "prehistoric":
        return "bg-amber-700";
      case "futuristic":
        return "bg-purple-600";
      case "desert":
        return "bg-orange-500";
      case "sea":
        return "bg-cyan-600";
      case "riverbank":
        return "bg-teal-600";
      default:
        return "bg-gray-600";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-orange-600 bg-orange-50";
      case "extreme":
        return "text-red-600 bg-red-50";
      case "custom":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* Theme Banner */}
      <div className={`h-2 ${getThemeColor(arena.theme)}`} />

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start gap-4 mb-4">
          {/* Arena Shape Icon */}
          <div
            className={`w-16 h-16 rounded-lg ${getThemeColor(
              arena.theme
            )} flex items-center justify-center text-white`}
          >
            {getShapeIcon(arena.shape)}
          </div>

          {/* Name and Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {arena.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2 py-1 text-xs font-semibold uppercase bg-gray-100 text-gray-700 rounded">
                {arena.shape}
              </span>
              <span className="px-2 py-1 text-xs font-semibold uppercase bg-gray-100 text-gray-700 rounded">
                {arena.theme}
              </span>
              {arena.difficulty && (
                <span
                  className={`px-2 py-1 text-xs font-semibold uppercase rounded ${getDifficultyColor(
                    arena.difficulty
                  )}`}
                >
                  {arena.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {arena.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {arena.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/game/arenas/edit/${arena.id}`)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onPreview(arena)}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            title="Preview Arena"
          >
            👁️ Preview
          </button>
          <button
            onClick={() => onDelete(arena)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Arena Stats */}
      <div className="p-6 space-y-4">
        {/* Dimensions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Dimensions
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Width</p>
              <p className="font-semibold">{arena.width} em</p>
            </div>
            <div>
              <p className="text-gray-500">Height</p>
              <p className="font-semibold">{arena.height} em</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Loops</p>
              <p className="font-semibold">{arena.loops.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Exits</p>
              <p className="font-semibold">
                {arena.exits.filter((e) => e.enabled).length}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Obstacles</p>
              <p className="font-semibold">{arena.obstacles.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Pits</p>
              <p className="font-semibold">{arena.pits.length}</p>
            </div>
          </div>
        </div>

        {/* Hazards */}
        {(arena.laserGuns.length > 0 ||
          arena.rotationBodies?.length ||
          arena.waterBody) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Hazards
            </h4>
            <div className="flex flex-wrap gap-2">
              {arena.laserGuns.length > 0 && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  🔫 {arena.laserGuns.length} Lasers
                </span>
              )}
              {arena.rotationBodies && arena.rotationBodies.length > 0 && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  🌀 {arena.rotationBodies.length} Vortex
                </span>
              )}
              {arena.waterBody && (
                <span className="px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded">
                  💧 Water
                </span>
              )}
              {arena.portals && arena.portals.length > 0 && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                  🌀 {arena.portals.length} Portals
                </span>
              )}
            </div>
          </div>
        )}

        {/* Goals */}
        {arena.goalObjects.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Objectives
            </h4>
            <p className="text-xs text-gray-600">
              {arena.goalObjects.length} Goal Object
              {arena.goalObjects.length !== 1 ? "s" : ""}
              {arena.requireAllGoalsDestroyed && " (All required)"}
            </p>
          </div>
        )}

        {/* Wall Properties */}
        {arena.wall.enabled && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Wall</h4>
            <div className="flex flex-wrap gap-2">
              {arena.wall.hasSpikes && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  ⚔️ Spikes
                </span>
              )}
              {arena.wall.hasSprings && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                  🔘 Springs
                </span>
              )}
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                💥 {arena.wall.baseDamage} Damage
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
