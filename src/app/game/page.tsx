"use client";

import Link from "next/link";
import { Target, Gamepad2, Users, Trophy } from "lucide-react";

export default function GameModesPage() {
  const modes = [
    {
      id: "tryout",
      title: "Tryout Mode",
      description: "Practice and test your skills in a solo environment",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      href: "/game/tryout/select",
      available: true,
    },
    {
      id: "single-battle",
      title: "Single Battle",
      description: "Battle against AI opponents",
      icon: Gamepad2,
      color: "from-purple-500 to-pink-500",
      href: "/game/single-battle",
      available: false,
    },
    {
      id: "pvp",
      title: "PvP Mode",
      description: "Challenge other players in real-time battles",
      icon: Users,
      color: "from-red-500 to-orange-500",
      href: "/game/pvp",
      available: false,
    },
    {
      id: "tournament",
      title: "Tournament",
      description: "Compete in organized tournaments",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      href: "/game/tournament",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Beyblade Battle Arena
          </h1>
          <p className="text-xl text-gray-400">
            Choose your game mode and enter the battle
          </p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.id}
                href={mode.available ? mode.href : "#"}
                className={`relative group ${
                  mode.available
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                <div
                  className={`relative bg-gradient-to-br ${
                    mode.color
                  } p-1 rounded-2xl transition-transform ${
                    mode.available ? "hover:scale-105" : ""
                  }`}
                >
                  <div className="bg-gray-900 rounded-xl p-8 h-full">
                    <Icon className="w-12 h-12 text-white mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {mode.title}
                    </h2>
                    <p className="text-gray-400 mb-4">{mode.description}</p>

                    {mode.available ? (
                      <div className="flex items-center text-white font-semibold">
                        Play Now
                        <svg
                          className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="text-gray-500 font-semibold">
                        Coming Soon
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to Battle?
            </h3>
            <p className="text-gray-400">
              Select a game mode above to get started. More modes coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
