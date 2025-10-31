"use client";

import React, { useEffect, useState } from "react";
import { CinematicMoveState } from "../utils/cinematicSpecialMoves";

interface SpecialMoveBannerProps {
  cinematicMove: CinematicMoveState | null;
}

export default function SpecialMoveBanner({
  cinematicMove,
}: SpecialMoveBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (cinematicMove && cinematicMove.phase === "banner") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [cinematicMove]);

  if (!isVisible || !cinematicMove) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 animate-fadeIn">
      {/* Let It Rip! Text */}
      <h1
        className="text-5xl sm:text-7xl md:text-8xl font-black text-white text-center mb-4 animate-pulse-scale-slide"
        style={{
          textShadow: `
            0 0 20px #3b82f6,
            0 0 40px #3b82f6,
            0 0 60px #3b82f6,
            0 0 80px #3b82f6,
            0 5px 0 rgba(0,0,0,0.5)
          `,
        }}
      >
        LET IT RIP!
      </h1>

      {/* Special Move Name */}
      <div
        className="relative w-4/5 max-w-3xl px-10 py-5 rounded-xl border-4 border-blue-500 shadow-glow animate-slideUp"
        style={{
          background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
          boxShadow: `
            0 0 30px rgba(59, 130, 246, 0.5),
            inset 0 0 20px rgba(59, 130, 246, 0.25)
          `,
        }}
      >
        <h2
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-blue-500 text-center uppercase tracking-widest animate-glow"
          style={{
            textShadow: `
              0 0 10px #3b82f6,
              0 0 20px #3b82f6,
              2px 2px 4px rgba(0,0,0,0.8)
            `,
          }}
        >
          {cinematicMove.moveName}
        </h2>

        {/* Move Type Indicator */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1 bg-purple-600 text-white rounded-full text-sm font-bold uppercase shadow-lg">
          {cinematicMove.moveType.replace(/-/g, " ")}
        </div>
      </div>

      {/* Energy Flash Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[10%] left-[10%] w-[200px] h-[200px] rounded-full animate-energyPulse"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute top-[60%] right-[15%] w-[150px] h-[150px] rounded-full animate-energyPulse"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            animationDelay: "0.5s",
          }}
        />
        <div
          className="absolute bottom-[20%] left-[20%] w-[180px] h-[180px] rounded-full animate-energyPulse"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pulse-scale-slide {
          from {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes glow {
          0%,
          100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }
        @keyframes energyPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-pulse-scale-slide {
          animation: pulse-scale-slide 0.5s ease-out,
            pulse 0.8s ease-in-out infinite;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out 0.3s both;
        }
        .animate-glow {
          animation: glow 1s ease-in-out infinite;
        }
        .animate-energyPulse {
          animation: energyPulse 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
