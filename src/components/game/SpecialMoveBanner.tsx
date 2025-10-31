/**
 * Special Move Banner Component
 * Displays "LET IT RIP!" style cinematic banner when special moves activate
 */

import React, { useEffect, useState } from "react";

interface SpecialMoveBannerProps {
  moveName: string;
  userName: string;
  show: boolean;
  onComplete?: () => void;
  color?: string;
  duration?: number;
}

export default function SpecialMoveBanner({
  moveName,
  userName,
  show,
  onComplete,
  color = "#ff4444",
  duration = 2000,
}: SpecialMoveBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none flex flex-col items-center justify-end pb-16 transition-opacity duration-300 ${
        visible ? "opacity-100 animate-slide-in-bottom" : "opacity-0"
      }`}
    >
      {/* Background Overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
        }}
      />

      {/* Main Banner Container */}
      <div className="relative w-[90%] max-w-[800px] text-center">
        {/* User Name Label */}
        <h6
          className="text-white font-bold uppercase tracking-[0.25em] mb-2 animate-pulse"
          style={{
            textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          }}
        >
          {userName}
        </h6>

        {/* Special Move Name */}
        <div
          className="relative rounded-3xl p-6 backdrop-blur-lg animate-glow"
          style={{
            background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
            border: `4px solid ${color}`,
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          }}
        >
          {/* Decorative Corner Elements */}
          {[
            { top: "-8px", left: "-8px" },
            { top: "-8px", right: "-8px" },
            { bottom: "-8px", left: "-8px" },
            { bottom: "-8px", right: "-8px" },
          ].map((pos, idx) => (
            <div
              key={idx}
              className="absolute w-5 h-5 rounded-sm bg-black/80"
              style={{
                ...pos,
                border: `3px solid ${color}`,
              }}
            />
          ))}

          {/* Move Name Text */}
          <h2
            className="text-white font-black uppercase tracking-[0.5em] text-4xl sm:text-5xl md:text-6xl relative z-10"
            style={{
              textShadow: `
                0 0 10px ${color},
                0 0 20px ${color},
                0 0 30px ${color},
                4px 4px 8px rgba(0,0,0,0.8)
              `,
              WebkitTextStroke: `2px ${color}`,
              paintOrder: "stroke fill",
              background: `linear-gradient(180deg, white 0%, ${color} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {moveName}
          </h2>

          {/* Subtitle */}
          <h6
            className="font-bold uppercase tracking-[0.2em] mt-2"
            style={{
              color: color,
              textShadow: `0 0 10px ${color}`,
            }}
          >
            SPECIAL MOVE ACTIVATED!
          </h6>
        </div>

        {/* Energy Bars Animation */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-between -mx-4 pointer-events-none">
          {[...Array(2)].map((_, idx) => (
            <div
              key={idx}
              className="w-2/5 h-1 animate-pulse"
              style={{
                background: `linear-gradient(${
                  idx === 0 ? "to right" : "to left"
                }, transparent 0%, ${color} 50%, transparent 100%)`,
                animationDelay: `${idx * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Particle Effects Container */}
      <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
        {/* Animated Particles */}
        {[...Array(20)].map((_, idx) => (
          <div
            key={idx}
            className="absolute w-1 h-1 rounded-full opacity-60 animate-pulse"
            style={{
              bottom: `${Math.random() * 30}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: color,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.5 + Math.random() * 1}s`,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in-bottom {
          0% {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateY(0) scale(1.1);
            opacity: 1;
          }
          70% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px ${color}, 0 0 40px ${color};
          }
          50% {
            box-shadow: 0 0 40px ${color}, 0 0 80px ${color};
          }
        }
        .animate-glow {
          animation: glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Compact Banner Variant (for rapid-fire special moves)
 */
export function CompactSpecialMoveBanner({
  moveName,
  show,
  onComplete,
  color = "#ff4444",
  duration = 1000,
}: Omit<SpecialMoveBannerProps, "userName">) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-300 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-75"
      }`}
    >
      <div
        className="backdrop-blur-lg rounded-2xl px-8 py-3"
        style={{
          background: `linear-gradient(135deg, ${color}44 0%, ${color}88 100%)`,
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}`,
        }}
      >
        <h5
          className="text-white font-bold uppercase tracking-[0.15em]"
          style={{
            textShadow: `0 0 10px ${color}`,
          }}
        >
          {moveName}
        </h5>
      </div>
    </div>
  );
}
