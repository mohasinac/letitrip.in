"use client";

import React from "react";
import Link from "next/link";

export default function ArenaSystemsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🎯 Arena Configuration Systems
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* New System Card */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">✨</span>
              <h2 className="text-2xl font-bold">New Wall System</h2>
            </div>

            <div className="mb-6 space-y-2 text-sm">
              <p className="text-blue-100">
                Complete rebuild with modern architecture
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-200">
                <li>Edge-based wall configuration</li>
                <li>Multiple walls per edge (1-3 segments)</li>
                <li>Brick pattern rendering</li>
                <li>Red exit zones with arrows</li>
                <li>Auto-rotation animation</li>
                <li>7 arena shapes supported</li>
                <li>10 theme options</li>
                <li>Random wall generation</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/admin/game/arena-config-new"
                className="block px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold text-center hover:bg-blue-50 transition"
              >
                Open New Configurator
              </Link>
              <Link
                href="/admin/game/arena-test"
                className="block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-500 transition"
              >
                View Test/Examples
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-500">
              <p className="text-xs text-blue-200">
                <strong>Status:</strong> ✅ Complete & Ready
              </p>
              <p className="text-xs text-blue-200 mt-1">
                <strong>Files:</strong>
              </p>
              <ul className="text-xs text-blue-300 list-disc list-inside ml-2">
                <li>arenaConfigNew.ts</li>
                <li>ArenaPreviewBasic.tsx</li>
                <li>ArenaConfiguratorNew.tsx</li>
              </ul>
            </div>
          </div>

          {/* Old System Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-8 shadow-xl relative">
            <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              LEGACY
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🏛️</span>
              <h2 className="text-2xl font-bold">Old System</h2>
            </div>

            <div className="mb-6 space-y-2 text-sm">
              <p className="text-gray-300">
                Original implementation with all features
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Loops (speed boost paths)</li>
                <li>Obstacles (rocks, pillars)</li>
                <li>Water bodies (moat, ring, center)</li>
                <li>Pits (trap zones)</li>
                <li>Goals & laser guns</li>
                <li>Portals & rotation bodies</li>
                <li>Legacy wall system</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/admin/game/stadiums"
                className="block px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold text-center hover:bg-gray-500 transition"
              >
                Open Old Configurator
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-xs text-gray-400">
                <strong>Status:</strong> ⚠️ Legacy System
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <strong>Files:</strong>
              </p>
              <ul className="text-xs text-gray-500 list-disc list-inside ml-2">
                <li>arenaConfig.ts</li>
                <li>ArenaPreview.tsx</li>
                <li>ArenaConfigurator.tsx</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">System Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Feature</th>
                  <th className="px-4 py-3 text-center">New System</th>
                  <th className="px-4 py-3 text-center">Old System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-4 py-3">Edge-Based Walls</td>
                  <td className="px-4 py-3 text-center">✅</td>
                  <td className="px-4 py-3 text-center">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Multiple Walls Per Edge</td>
                  <td className="px-4 py-3 text-center">✅ (1-3)</td>
                  <td className="px-4 py-3 text-center">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Brick Pattern Walls</td>
                  <td className="px-4 py-3 text-center">✅</td>
                  <td className="px-4 py-3 text-center">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Exit Arrows</td>
                  <td className="px-4 py-3 text-center">✅</td>
                  <td className="px-4 py-3 text-center">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Auto-Rotation</td>
                  <td className="px-4 py-3 text-center">✅</td>
                  <td className="px-4 py-3 text-center">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Random Wall Generation</td>
                  <td className="px-4 py-3 text-center">✅</td>
                  <td className="px-4 py-3 text-center">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Loops (Speed Paths)</td>
                  <td className="px-4 py-3 text-center">❌ (Coming)</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Obstacles</td>
                  <td className="px-4 py-3 text-center">❌ (Coming)</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Water Bodies</td>
                  <td className="px-4 py-3 text-center">❌ (Coming)</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Pits & Goals</td>
                  <td className="px-4 py-3 text-center">❌ (Coming)</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>💡 Recommendation:</strong> Use the{" "}
              <strong>New System</strong> for creating arenas with advanced wall
              configurations. The new system provides better control over wall
              placement and exits. Additional features (loops, obstacles, etc.)
              will be added incrementally following the "basics first" approach.
            </p>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📚 Documentation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">New System</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>
                  <code className="text-xs bg-gray-700 px-2 py-1 rounded">
                    docs/game/ARENA_CONFIG_NEW_SYSTEM.md
                  </code>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-yellow-400">Old System</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>
                  <code className="text-xs bg-gray-700 px-2 py-1 rounded">
                    docs/game/ARENA_WATER_BODIES.md
                  </code>
                </li>
                <li>
                  <code className="text-xs bg-gray-700 px-2 py-1 rounded">
                    Various arena docs in docs/game/
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
