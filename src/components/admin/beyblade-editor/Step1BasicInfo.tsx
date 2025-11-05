"use client";

import React, { useRef, useState } from "react";
import { BeybladeStats } from "@/types/beybladeStats";
import WhatsAppStyleImageEditor from "../WhatsAppStyleImageEditor";

interface Step1BasicInfoProps {
  formData: Partial<BeybladeStats>;
  imagePreview: string;
  showImageEditor: boolean;
  imagePosition: { x: number; y: number; scale: number; rotation: number };
  onFormDataChange: (data: Partial<BeybladeStats>) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImagePositionChange: (position: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
  onShowImageEditor: (show: boolean) => void;
  onImageEditorSave: () => void;
  onImageEditorCancel: () => void;
}

export default function Step1BasicInfo({
  formData,
  imagePreview,
  showImageEditor,
  imagePosition,
  onFormDataChange,
  onImageSelect,
  onImagePositionChange,
  onShowImageEditor,
  onImageEditorSave,
  onImageEditorCancel,
}: Step1BasicInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBasicInfoCollapsed, setIsBasicInfoCollapsed] = useState(false);
  const [isPhysicalPropsCollapsed, setIsPhysicalPropsCollapsed] =
    useState(false);
  const [isImageCollapsed, setIsImageCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
          className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <span>📝</span>
            <span>Basic Information</span>
          </h3>
          <svg
            className={`w-5 h-5 text-blue-900 transition-transform ${
              isBasicInfoCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!isBasicInfoCollapsed && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Beyblade Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  onFormDataChange({ ...formData, displayName: e.target.value })
                }
                placeholder="e.g., Storm Pegasus"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      type: e.target.value as BeybladeStats["type"],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="attack">Attack</option>
                  <option value="defense">Defense</option>
                  <option value="stamina">Stamina</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Spin Direction
                </label>
                <select
                  value={formData.spinDirection}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      spinDirection: e.target.value as "left" | "right",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="right">Right (Clockwise)</option>
                  <option value="left">Left (Counter-clockwise)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Physical Properties Section */}
      <div className="border-2 border-green-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsPhysicalPropsCollapsed(!isPhysicalPropsCollapsed)}
          className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-between"
        >
          <h3 className="font-semibold text-green-900 flex items-center gap-2">
            <span>⚖️</span>
            <span>Physical Properties</span>
          </h3>
          <svg
            className={`w-5 h-5 text-green-900 transition-transform ${
              isPhysicalPropsCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!isPhysicalPropsCollapsed && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mass (grams) - Typical: 40-60g
              </label>
              <input
                type="number"
                min="10"
                max="2000"
                value={formData.mass}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    mass: parseFloat(e.target.value) || 50,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Radius (cm) - Typical: 3.5-4.5cm
              </label>
              <input
                type="number"
                min="3"
                max="50"
                step="0.1"
                value={formData.radius}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    radius: parseFloat(e.target.value) || 4,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsImageCollapsed(!isImageCollapsed)}
          className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center justify-between"
        >
          <h3 className="font-semibold text-purple-900 flex items-center gap-2">
            <span>🖼️</span>
            <span>Beyblade Image</span>
          </h3>
          <svg
            className={`w-5 h-5 text-purple-900 transition-transform ${
              isImageCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!isImageCollapsed && (
          <div className="p-4">
            {imagePreview && !showImageEditor ? (
              <div className="space-y-4">
                {/* Image Preview Thumbnail */}
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-red-500">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${imagePosition.scale}) translate(${
                          imagePosition.x * 50
                        }%, ${imagePosition.y * 50}%) rotate(${
                          imagePosition.rotation
                        }deg)`,
                        transformOrigin: "center",
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => onShowImageEditor(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Adjust Position
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    🔄 Change Image
                  </button>
                </div>
              </div>
            ) : imagePreview && showImageEditor ? (
              <WhatsAppStyleImageEditor
                imageUrl={imagePreview}
                onPositionChange={onImagePositionChange}
                initialPosition={imagePosition}
                circleSize={300}
                onSave={onImageEditorSave}
                onCancel={onImageEditorCancel}
              />
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload Image
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG or GIF (MAX. 5MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageSelect}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
