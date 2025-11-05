"use client";

import { useRouter } from "next/navigation";
import { ArenaConfig } from "@/types/arenaConfig";
import { Circle, Square, Pentagon, Hexagon, Octagon, Star } from "lucide-react";

interface ArenaPreviewModalProps {
  arena: ArenaConfig | null;
  onClose: () => void;
}

export default function ArenaPreviewModal({
  arena,
  onClose,
}: ArenaPreviewModalProps) {
  const router = useRouter();

  if (!arena) return null;

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case "circle":
        return <Circle className="w-8 h-8" />;
      case "rectangle":
        return <Square className="w-8 h-8" />;
      case "pentagon":
        return <Pentagon className="w-8 h-8" />;
      case "hexagon":
        return <Hexagon className="w-8 h-8" />;
      case "octagon":
        return <Octagon className="w-8 h-8" />;
      case "star":
        return <Star className="w-8 h-8" />;
      default:
        return <Circle className="w-8 h-8" />;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-lg ${getThemeColor(
                arena.theme
              )} flex items-center justify-center text-white`}
            >
              {getShapeIcon(arena.shape)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {arena.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-bold text-white bg-white bg-opacity-20 rounded uppercase">
                  {arena.shape}
                </span>
                <span className="px-2 py-1 text-xs font-bold text-white bg-white bg-opacity-20 rounded uppercase">
                  {arena.theme}
                </span>
                {arena.difficulty && (
                  <span className="px-2 py-1 text-xs font-bold text-white bg-white bg-opacity-20 rounded uppercase">
                    {arena.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          {arena.description && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Description
              </h3>
              <p className="text-white">{arena.description}</p>
            </div>
          )}

          {/* Arena Visual Preview */}
          <div
            className="bg-gray-800 rounded-lg p-8 mb-6 flex items-center justify-center"
            style={{
              minHeight: "300px",
              background: arena.backgroundColor || "#1f2937",
            }}
          >
            <div
              className={`${getThemeColor(
                arena.theme
              )} bg-opacity-20 border-4 ${getThemeColor(
                arena.theme
              )} rounded-full`}
              style={{
                width: `${Math.min(arena.width * 4, 400)}px`,
                height: `${Math.min(arena.height * 4, 400)}px`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-white opacity-30">
                {getShapeIcon(arena.shape)}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Dimensions</p>
              <p className="text-lg font-bold text-white">
                {arena.width} × {arena.height}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Loops</p>
              <p className="text-lg font-bold text-blue-500">
                {arena.loops.length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Obstacles</p>
              <p className="text-lg font-bold text-yellow-500">
                {arena.obstacles.length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Hazards</p>
              <p className="text-lg font-bold text-red-500">
                {arena.laserGuns.length +
                  (arena.rotationBodies?.length || 0) +
                  (arena.waterBody ? 1 : 0) +
                  arena.pits.length}
              </p>
            </div>
          </div>

          {/* Features Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loops */}
            {arena.loops.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  🔄 Speed Loops ({arena.loops.length})
                </h3>
                <div className="space-y-2">
                  {arena.loops.map((loop, idx) => (
                    <div key={idx} className="text-xs text-gray-400">
                      <span className="text-white font-medium">
                        {loop.shape}
                      </span>{" "}
                      • {loop.speedBoost}x speed • {loop.radius}em radius
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Obstacles */}
            {arena.obstacles.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  ⚠️ Obstacles ({arena.obstacles.length})
                </h3>
                <div className="space-y-2">
                  {arena.obstacles.slice(0, 3).map((obstacle, idx) => (
                    <div key={idx} className="text-xs text-gray-400">
                      <span className="text-white font-medium capitalize">
                        {obstacle.type}
                      </span>{" "}
                      • {obstacle.radius}em
                      {obstacle.destructible && " • Destructible"}
                    </div>
                  ))}
                  {arena.obstacles.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{arena.obstacles.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Hazards */}
            {(arena.laserGuns.length > 0 ||
              arena.rotationBodies?.length ||
              arena.waterBody ||
              arena.pits.length > 0) && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  💀 Hazards
                </h3>
                <div className="space-y-2">
                  {arena.laserGuns.length > 0 && (
                    <div className="text-xs text-gray-400">
                      <span className="text-red-400 font-medium">
                        🔫 Laser Guns
                      </span>{" "}
                      • {arena.laserGuns.length} units
                    </div>
                  )}
                  {arena.rotationBodies && arena.rotationBodies.length > 0 && (
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400 font-medium">
                        🌀 Vortex
                      </span>{" "}
                      • {arena.rotationBodies.length} zones
                    </div>
                  )}
                  {arena.waterBody && (
                    <div className="text-xs text-gray-400">
                      <span className="text-cyan-400 font-medium">
                        💧 Water Body
                      </span>{" "}
                      • Friction modifier
                    </div>
                  )}
                  {arena.pits.length > 0 && (
                    <div className="text-xs text-gray-400">
                      <span className="text-orange-400 font-medium">
                        🕳️ Pits
                      </span>{" "}
                      • {arena.pits.length} traps
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wall */}
            {arena.wall.enabled && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  🧱 Wall Properties
                </h3>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">
                    <span className="text-white font-medium">Damage:</span>{" "}
                    {arena.wall.baseDamage}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="text-white font-medium">Recoil:</span>{" "}
                    {arena.wall.recoilDistance}em
                  </div>
                  {arena.wall.hasSpikes && (
                    <div className="text-xs text-red-400">⚔️ Spikes Active</div>
                  )}
                  {arena.wall.hasSprings && (
                    <div className="text-xs text-green-400">
                      🔘 Springs Active
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Goals */}
          {arena.goalObjects.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                🎯 Objectives ({arena.goalObjects.length})
              </h3>
              <p className="text-xs text-gray-400">
                {arena.requireAllGoalsDestroyed
                  ? "All objectives must be destroyed to win"
                  : "Destroy any objective to win"}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
          <button
            onClick={() => {
              router.push(`/admin/game/arenas/edit/${arena.id}`);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Arena
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
