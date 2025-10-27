"use client";

import React from "react";
import Link from "next/link";

// Simple icon components
const GameControllerIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.5 6.5C7.5 8.981 5.481 11 3 11s-4.5-2.019-4.5-4.5S.519 2 3 2s4.5 2.019 4.5 4.5zM20.5 6.5C20.5 8.981 18.481 11 16 11s-4.5-2.019-4.5-4.5S13.519 2 16 2s4.5 2.019 4.5 4.5zM12 12.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM19 12.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C15 7.65 14.35 8 14 8H10C9.65 8 9 7.65 9 7L3 7V9C3 10.1 3.9 11 5 11V12L7 12V13H17V12L19 12V11C20.1 11 21 10.1 21 9Z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM13 5.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5.22.5.5.5.5-.22.5-.5zM12 1C8.69 1 6 3.69 6 7h12c0-3.31-2.69-6-6-6z" />
  </svg>
);

export default function GamesPage() {
  const games = [
    {
      id: "beyblade-battle",
      title: "Beyblade Battle Arena",
      description:
        "Experience the thrill of Beyblade battles with realistic physics, strategic spin management, and intense arena combat.",
      href: "/game/beyblade-battle",
      image: "/assets/svg/beyblades/stadium.svg",
      features: [
        "Physics-based Combat",
        "Power Attacks",
        "Multiple Beyblades",
        "AI Opponent",
      ],
      difficulty: "Medium",
      players: "1 Player",
      status: "Available",
    },
    {
      id: "beyblade-spinner",
      title: "Beyblade Spinner Demo",
      description:
        "Interactive demo showcasing spinning Beyblade components with different animation types and visual effects.",
      href: "/beyblade-spinner",
      image: "/assets/svg/beyblades/dragoon-gt.svg",
      features: [
        "Animation Demo",
        "Visual Effects",
        "Component Showcase",
        "Customizable",
      ],
      difficulty: "Easy",
      players: "Demo",
      status: "Available",
    },
  ];

  const upcomingGames = [
    {
      title: "Beyblade Tournament",
      description: "Multiplayer tournament mode with brackets and rankings.",
      status: "Coming Soon",
    },
    {
      title: "Beyblade Customization",
      description: "Create and customize your own Beyblade with unique stats.",
      status: "In Development",
    },
    {
      title: "Beyblade Story Mode",
      description: "Single-player campaign with challenging AI opponents.",
      status: "Planned",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <GameControllerIcon />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">JustForView Games</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Dive into the exciting world of Beyblade games! Experience
              realistic physics, strategic gameplay, and stunning visual
              effects.
            </p>
          </div>
        </div>
      </div>

      {/* Available Games Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Available Games
          </h2>
          <p className="text-lg text-gray-600">Ready to play now!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <Link key={game.id} href={game.href} className="group">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-24 h-24 object-contain"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                      {game.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <UsersIcon />
                      <span className="ml-1">{game.players}</span>
                    </div>
                    <div className="flex items-center">
                      <TrophyIcon />
                      <span className="ml-1">{game.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold group-hover:text-blue-800">
                      Play Now →
                    </span>
                    <ZapIcon />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Games Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Coming Soon
            </h2>
            <p className="text-lg text-gray-600">
              Exciting new games in development!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {upcomingGames.map((game, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {game.title}
                </h3>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                  {game.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Battle?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Jump into the arena and test your skills! Master the art of Beyblade
            combat and become the ultimate champion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/game/beyblade-battle"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Battle Arena
            </Link>
            <Link
              href="/beyblade-spinner"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
