"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BeybladeStats } from "@/types/beybladeStats";
import BeybladeImageUploader from "./BeybladeImageUploader";
import {
  getBeybladeDisplayRadius,
  getBeybladeDisplayDiameter,
} from "@/constants/beybladeConstants";

interface BeybladeCardProps {
  beyblade: BeybladeStats;
  onImageUploaded: (beybladeId: string, imageUrl: string) => void;
  onPointsOfContactUpdated: (
    beybladeId: string,
    points: BeybladeStats["pointsOfContact"]
  ) => void;
  onPreview: (beyblade: BeybladeStats) => void;
  onDelete: (beyblade: BeybladeStats) => void;
}

export default function BeybladeCard({
  beyblade,
  onImageUploaded,
  onPointsOfContactUpdated,
  onPreview,
  onDelete,
}: BeybladeCardProps) {
  const router = useRouter();
  const [editingImage, setEditingImage] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attack":
        return "text-red-600 bg-red-50";
      case "defense":
        return "text-blue-600 bg-blue-50";
      case "stamina":
        return "text-green-600 bg-green-50";
      case "balance":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
        {/* Header with Image */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4 mb-4">
            {/* Beyblade Image */}
            <div className="relative">
              {beyblade.imageUrl ? (
                <img
                  src={beyblade.imageUrl}
                  alt={beyblade.displayName}
                  className="w-20 h-20 rounded-full object-contain bg-gray-50 border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-2xl font-bold text-gray-500">
                    {beyblade.displayName[0]}
                  </span>
                </div>
              )}
              <button
                onClick={() => setEditingImage(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-700 transition-colors"
                title="Upload Image"
              >
                📷
              </button>
            </div>

            {/* Name and Type */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {beyblade.displayName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getTypeColor(
                    beyblade.type
                  )}`}
                >
                  {beyblade.type}
                </span>
                <span className="text-sm text-gray-500">
                  Spin: {beyblade.spinDirection}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() =>
                router.push(`/admin/game/beyblades/edit/${beyblade.id}`)
              }
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onPreview(beyblade)}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              title="Preview Beyblade"
            >
              👁️ Preview
            </button>
            <button
              onClick={() => onDelete(beyblade)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          {/* Physical Properties */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Physical
            </h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Mass</p>
                <p className="font-semibold">{beyblade.mass}g</p>
              </div>
              <div>
                <p className="text-gray-500">Radius</p>
                <p className="font-semibold">{beyblade.radius} cm</p>
              </div>
              <div>
                <p className="text-gray-500">Display</p>
                <p className="font-semibold">
                  {getBeybladeDisplayDiameter(beyblade.radius).toFixed(0)}px
                </p>
              </div>
            </div>
          </div>

          {/* Type Distribution */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Type Distribution (320)
            </h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-600">Attack</span>
                  <span className="font-semibold">
                    {beyblade.typeDistribution.attack}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (beyblade.typeDistribution.attack / 150) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-600">Defense</span>
                  <span className="font-semibold">
                    {beyblade.typeDistribution.defense}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (beyblade.typeDistribution.defense / 150) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-green-600">Stamina</span>
                  <span className="font-semibold">
                    {beyblade.typeDistribution.stamina}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (beyblade.typeDistribution.stamina / 150) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Spin Properties */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Spin Properties
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Decay Rate</p>
                <p className="font-semibold">{beyblade.spinDecayRate}/s</p>
              </div>
              <div>
                <p className="text-gray-500">Spin Steal Factor</p>
                <p className="font-semibold">
                  {((beyblade.spinStealFactor || 0) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Contact Points & Spin Steal Points */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Combat Properties
            </h4>
            <div className="space-y-2">
              {/* Contact Points */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: "linear-gradient(to right, #ef4444, #eab308)",
                    }}
                  ></div>
                  <span className="text-xs text-gray-600">Contact Points:</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  {beyblade.pointsOfContact.length} (Max:{" "}
                  {Math.max(
                    ...beyblade.pointsOfContact.map((p) => p.damageMultiplier)
                  ).toFixed(1)}
                  x)
                </span>
              </div>

              {/* Spin Steal Points */}
              {beyblade.spinStealPoints &&
                beyblade.spinStealPoints.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background:
                            "linear-gradient(to right, #06b6d4, #3b82f6)",
                        }}
                      ></div>
                      <span className="text-xs text-gray-600">
                        Spin Steal Points:
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      {beyblade.spinStealPoints.length} (Max:{" "}
                      {Math.max(
                        ...beyblade.spinStealPoints.map(
                          (p) => p.spinStealMultiplier
                        )
                      ).toFixed(1)}
                      x)
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Upload Image for {beyblade.displayName}
              </h3>
              <button
                onClick={() => setEditingImage(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <BeybladeImageUploader
              currentImageUrl={beyblade.imageUrl}
              beybladeId={beyblade.id}
              onImageUploaded={(url) => {
                onImageUploaded(beyblade.id, url);
                setEditingImage(false);
              }}
              onPointsOfContactUpdated={(points) =>
                onPointsOfContactUpdated(beyblade.id, points)
              }
              initialPointsOfContact={beyblade.pointsOfContact}
              beybladeData={{
                displayName: beyblade.displayName,
                type: beyblade.type,
                spinDirection: beyblade.spinDirection,
                radius: beyblade.radius,
                mass: beyblade.mass,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
