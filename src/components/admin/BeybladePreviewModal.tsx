"use client";

import { useRouter } from "next/navigation";
import { BeybladeStats } from "@/types/beybladeStats";
import BeybladePreview from "./BeybladePreview";

interface BeybladePreviewModalProps {
  beyblade: BeybladeStats | null;
  onClose: () => void;
}

export default function BeybladePreviewModal({
  beyblade,
  onClose,
}: BeybladePreviewModalProps) {
  const router = useRouter();

  if (!beyblade) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attack":
        return "bg-red-600";
      case "defense":
        return "bg-blue-600";
      case "stamina":
        return "bg-green-600";
      case "balance":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {beyblade.displayName}
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-xs font-bold text-white rounded uppercase ${getTypeColor(
                  beyblade.type
                )}`}
              >
                {beyblade.type}
              </span>
              <span className="text-sm text-gray-400">
                Spin: {beyblade.spinDirection}
              </span>
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
          <div className="bg-gray-800 rounded-lg p-6">
            <BeybladePreview
              beyblade={beyblade}
              onCanvasClick={undefined}
              clickMode={false}
            />
          </div>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Attack</p>
              <p className="text-2xl font-bold text-red-500">
                {beyblade.typeDistribution.attack}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Defense</p>
              <p className="text-2xl font-bold text-blue-500">
                {beyblade.typeDistribution.defense}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Stamina</p>
              <p className="text-2xl font-bold text-green-500">
                {beyblade.typeDistribution.stamina}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-yellow-500">
                {beyblade.typeDistribution.total}
              </p>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Mass</p>
              <p className="text-lg font-bold text-white">{beyblade.mass} kg</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Radius</p>
              <p className="text-lg font-bold text-white">
                {beyblade.radius} px
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Contact Points</p>
              <p className="text-lg font-bold text-white">
                {beyblade.pointsOfContact.length}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
          <button
            onClick={() => {
              router.push(`/admin/game/beyblades/edit/${beyblade.id}`);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Beyblade
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
