"use client";

import React from "react";
import EnhancedBeybladeArena from "../components/EnhancedBeybladeArena";

export default function BeybladeGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Beyblade Battle Arena
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time Beyblade battles! Control your Beyblade with your mouse
            while the AI pursues you. Both start with 100% spin - collisions
            reduce spin until one Beyblade remains!
          </p>
        </div>

        <div className="flex justify-center">
          <EnhancedBeybladeArena />
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Game Features
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li>
                  • <strong>Real-time Control:</strong> Mouse movement controls
                  your Beyblade instantly
                </li>
                <li>
                  • <strong>Spin Mechanics:</strong> Both start at 100% spin,
                  decay over time
                </li>
                <li>
                  • <strong>Collision Physics:</strong> Every hit reduces spin
                  for both Beyblades
                </li>
                <li>
                  • <strong>Stadium Boundaries:</strong> Ring-out victories
                  possible
                </li>
                <li>
                  • <strong>AI Opponent:</strong> Intelligent enemy that hunts
                  you down
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Strategy Tips
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li>
                  • <strong>Stay Mobile:</strong> Keep moving to avoid AI
                  attacks
                </li>
                <li>
                  • <strong>Strategic Collisions:</strong> Time your hits when
                  enemy has low spin
                </li>
                <li>
                  • <strong>Positioning:</strong> Use stadium edges to your
                  advantage
                </li>
                <li>
                  • <strong>Spin Management:</strong> Avoid unnecessary
                  collisions early on
                </li>
                <li>
                  • <strong>Endgame:</strong> Low spin makes you vulnerable to
                  ring-outs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
