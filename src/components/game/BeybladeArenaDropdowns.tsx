/**
 * Beyblade and Arena Dropdown Components
 * Reusable dropdowns for selecting beyblades and arenas in game setup
 */

import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import type { BeybladeStats } from "@/types/beybladeStats";
import type { ArenaConfig } from "@/types/arenaConfig";

// ============================================
// Beyblade Dropdown
// ============================================

interface BeybladeDropdownProps {
  beyblades: BeybladeStats[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function BeybladeDropdown({
  beyblades,
  selectedId,
  onSelect,
  className = "",
}: BeybladeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedBeyblade = beyblades.find((b) => b.id === selectedId);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 rounded-xl border-2 border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-all flex items-center justify-between"
      >
        <div className="flex-1">
          {selectedBeyblade ? (
            <>
              <h3 className="text-lg font-bold text-white mb-1">
                {selectedBeyblade.displayName}
              </h3>
              <p className="text-sm text-gray-400">
                Type: {selectedBeyblade.type} | {selectedBeyblade.spinDirection}{" "}
                spin
              </p>
            </>
          ) : (
            <p className="text-gray-400">Select a Beyblade...</p>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-gray-800 border-2 border-gray-700 rounded-xl max-h-96 overflow-y-auto shadow-xl">
          {beyblades.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No Beyblades available
            </div>
          ) : (
            beyblades.map((beyblade) => (
              <button
                key={beyblade.id}
                onClick={() => {
                  onSelect(beyblade.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-all ${
                  selectedId === beyblade.id ? "bg-blue-500/10" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {beyblade.displayName}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {beyblade.type} | {beyblade.spinDirection} spin | Mass:{" "}
                      {beyblade.mass}g
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">
                        Attack:{" "}
                        <span className="text-white font-semibold">
                          {beyblade.typeDistribution.attack}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        Defense:{" "}
                        <span className="text-white font-semibold">
                          {beyblade.typeDistribution.defense}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        Stamina:{" "}
                        <span className="text-white font-semibold">
                          {beyblade.typeDistribution.stamina}
                        </span>
                      </span>
                    </div>
                  </div>
                  {selectedId === beyblade.id && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Arena Dropdown
// ============================================

interface ArenaDropdownProps {
  arenas: ArenaConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ArenaDropdown({
  arenas,
  selectedId,
  onSelect,
  className = "",
}: ArenaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedArena = arenas.find((a) => a.id === selectedId);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 rounded-xl border-2 border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-all flex items-center justify-between"
      >
        <div className="flex-1">
          {selectedArena ? (
            <>
              <h3 className="text-lg font-bold text-white mb-1">
                {selectedArena.name}
              </h3>
              <p className="text-sm text-gray-400">
                {selectedArena.shape} | {selectedArena.theme} theme
              </p>
            </>
          ) : (
            <p className="text-gray-400">Select an Arena...</p>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-gray-800 border-2 border-gray-700 rounded-xl max-h-96 overflow-y-auto shadow-xl">
          {arenas.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No Arenas available
            </div>
          ) : (
            arenas.map((arena) => (
              <button
                key={arena.id}
                onClick={() => {
                  if (arena.id) onSelect(arena.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-all ${
                  selectedId === arena.id ? "bg-purple-500/10" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {arena.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {arena.description || "Battle arena"}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">
                        Shape:{" "}
                        <span className="text-white font-semibold capitalize">
                          {arena.shape}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        Theme:{" "}
                        <span className="text-white font-semibold capitalize">
                          {arena.theme}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        Loops:{" "}
                        <span className="text-white font-semibold">
                          {arena.loops?.length || 0}
                        </span>
                      </span>
                    </div>
                  </div>
                  {selectedId === arena.id && (
                    <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Details Preview Components
// ============================================

interface BeybladeDetailsProps {
  beyblade: BeybladeStats;
}

export function BeybladeDetails({ beyblade }: BeybladeDetailsProps) {
  return (
    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
      <h4 className="text-sm font-bold text-blue-400 mb-2">Stats Preview</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-400">Radius:</span>{" "}
          <span className="text-white">{beyblade.radius}cm</span>
        </div>
        <div>
          <span className="text-gray-400">Mass:</span>{" "}
          <span className="text-white">{beyblade.mass}g</span>
        </div>
        <div>
          <span className="text-gray-400">Type:</span>{" "}
          <span className="text-white capitalize">{beyblade.type}</span>
        </div>
        <div>
          <span className="text-gray-400">Spin:</span>{" "}
          <span className="text-white capitalize">
            {beyblade.spinDirection}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ArenaDetailsProps {
  arena: ArenaConfig;
}

export function ArenaDetails({ arena }: ArenaDetailsProps) {
  return (
    <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
      <h4 className="text-sm font-bold text-purple-400 mb-2">Arena Features</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-400">Size:</span>{" "}
          <span className="text-white">
            {arena.width}x{arena.height}em
          </span>
        </div>
        <div>
          <span className="text-gray-400">Difficulty:</span>{" "}
          <span className="text-white capitalize">
            {arena.difficulty || "medium"}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Obstacles:</span>{" "}
          <span className="text-white">{arena.obstacles?.length || 0}</span>
        </div>
        <div>
          <span className="text-gray-400">Hazards:</span>{" "}
          <span className="text-white">
            {(arena.pits?.length || 0) + (arena.laserGuns?.length || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
