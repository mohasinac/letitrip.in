"use client";

import React from "react";
import { ArrowLeftRight, Zap, Bolt } from "lucide-react";

interface SpecialControlsHelpProps {
  className?: string;
}

const SpecialControlsHelp: React.FC<SpecialControlsHelpProps> = ({
  className,
}) => {
  return (
    <div
      className={`rounded-3xl bg-black/70 backdrop-blur-lg border-2 border-white/10 ${className}`}
    >
      <div className="p-4 md:p-6">
        <h6 className="text-base md:text-xl font-bold text-blue-500 mb-4">
          🎮 Special Abilities
        </h6>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dodge Right */}
          <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeftRight className="text-green-500" size={20} />
              <span className="text-sm font-semibold text-green-500">
                Dodge Right
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-semibold">
                1
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[0.7rem]">
                Right Click
              </span>
            </div>
            <p className="text-xs text-white/70">
              Quick dash right • Cost: 20 spin
            </p>
          </div>

          {/* Dodge Left */}
          <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeftRight
                className="text-green-500 scale-x-[-1]"
                size={20}
              />
              <span className="text-sm font-semibold text-green-500">
                Dodge Left
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-semibold">
                3
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[0.7rem]">
                Middle Click
              </span>
            </div>
            <p className="text-xs text-white/70">
              Quick dash left • Cost: 20 spin
            </p>
          </div>

          {/* Heavy Attack */}
          <div className="p-3 rounded-2xl bg-orange-400/10 border border-orange-400/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-orange-400" size={20} />
              <span className="text-sm font-semibold text-orange-400">
                Heavy Attack
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-400 text-xs font-semibold">
                2
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-400 text-[0.7rem]">
                Left Click
              </span>
            </div>
            <p className="text-xs text-white/70">
              1.25× damage for 0.3s • Free
            </p>
          </div>

          {/* Ultimate Attack */}
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Bolt className="text-red-500" size={20} />
              <span className="text-sm font-semibold text-red-500">
                Ultimate Attack
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-xs font-semibold">
                4
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[0.7rem]">
                Double Click
              </span>
            </div>
            <p className="text-xs text-white/70">
              2× damage for 0.5s • Cost: 100 spin
            </p>
          </div>
        </div>

        {/* Charge Point Selection */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
          <h6 className="text-sm font-semibold text-blue-500 mb-2">
            🔵 Blue Loop Charge Points
          </h6>
          <p className="text-xs text-white/70 mb-2">
            When in blue loop, press 1, 2, or 3 within 1 second to select your
            charge point:
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[0.7rem]">
              1 = Point 1 (30°)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[0.7rem]">
              2 = Point 2 (150°)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[0.7rem]">
              3 = Point 3 (270°)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-400/20 text-gray-400 text-[0.7rem]">
              Random if not selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialControlsHelp;
