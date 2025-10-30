/**
 * Admin Page: Game Stats Overview
 * View statistics and analytics for Beyblades and Stadiums
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BeybladeStats } from "@/types/beybladeStats";
import { ArenaConfig } from "@/types/arenaConfig";

export default function GameStatsPage() {
  const router = useRouter();
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [arenas, setArenas] = useState<ArenaConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [beybladeRes, arenaRes] = await Promise.all([
        fetch("/api/beyblades"),
        fetch("/api/arenas"),
      ]);

      const beybladeData = await beybladeRes.json();
      const arenaData = await arenaRes.json();

      if (beybladeData.success) setBeyblades(beybladeData.data);
      if (arenaData.success) setArenas(arenaData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attack":
        return "text-red-600 bg-red-50 border-red-200";
      case "defense":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "stamina":
        return "text-green-600 bg-green-50 border-green-200";
      case "balanced":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const calculateAverageStats = () => {
    if (beyblades.length === 0) return null;

    const total = beyblades.reduce(
      (acc, bey) => ({
        attack: acc.attack + bey.typeDistribution.attack,
        defense: acc.defense + bey.typeDistribution.defense,
        stamina: acc.stamina + bey.typeDistribution.stamina,
      }),
      { attack: 0, defense: 0, stamina: 0 }
    );

    return {
      attack: Math.round(total.attack / beyblades.length),
      defense: Math.round(total.defense / beyblades.length),
      stamina: Math.round(total.stamina / beyblades.length),
    };
  };

  const stats = calculateAverageStats();
  const typeCount = beyblades.reduce((acc, bey) => {
    acc[bey.type] = (acc[bey.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const arenaStats = {
    total: arenas.length,
    shapes: [...new Set(arenas.map((a) => a.shape))].length,
    withObstacles: arenas.filter((a) => a.obstacles && a.obstacles.length > 0)
      .length,
    withLoops: arenas.filter((a) => a.loops && a.loops.length > 0).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Stats</h1>
          <p className="text-gray-600">
            Overview of all Beyblade statistics and game analytics
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm mb-1">Total Beyblades</p>
                <p className="text-3xl font-bold text-gray-900">
                  {beyblades.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm mb-1">Avg Attack</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.attack || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm mb-1">Avg Defense</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.defense || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm mb-1">Avg Stamina</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.stamina || 0}
                </p>
              </div>
            </div>

            {/* Type Distribution */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Beyblade Type Distribution
                </h2>
                <button
                  onClick={() => router.push("/admin/game/beyblades")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Manage Beyblades →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(typeCount).map(([type, count]) => (
                  <div
                    key={type}
                    className={`border-2 rounded-lg p-4 ${getTypeColor(type)}`}
                  >
                    <p className="text-sm font-semibold uppercase mb-1">
                      {type}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stadium Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Stadium Statistics
                </h2>
                <button
                  onClick={() => router.push("/admin/game/stadiums")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Manage Stadiums →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Stadiums</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {arenaStats.total}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-indigo-600 mb-1">Unique Shapes</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {arenaStats.shapes}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 mb-1">With Obstacles</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {arenaStats.withObstacles}
                  </p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4">
                  <p className="text-sm text-cyan-600 mb-1">With Loops</p>
                  <p className="text-3xl font-bold text-cyan-600">
                    {arenaStats.withLoops}
                  </p>
                </div>
              </div>
            </div>

            {/* Beyblade List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  All Beyblades
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beyblade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attack
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defense
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stamina
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {beyblades.map((beyblade) => (
                      <tr key={beyblade.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {beyblade.imageUrl ? (
                              <img
                                src={beyblade.imageUrl}
                                alt={beyblade.displayName}
                                className="w-10 h-10 rounded-full object-contain bg-gray-50 mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mr-3">
                                <span className="text-sm font-bold text-gray-500">
                                  {beyblade.displayName[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {beyblade.displayName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {beyblade.spinDirection}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getTypeColor(
                              beyblade.type
                            )}`}
                          >
                            {beyblade.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beyblade.typeDistribution.attack}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beyblade.typeDistribution.defense}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beyblade.typeDistribution.stamina}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beyblade.pointsOfContact.length} points
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
