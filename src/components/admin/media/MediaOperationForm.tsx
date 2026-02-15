"use client";

import { useState } from "react";
import { FormField, Button, Card, Text } from "@/components";
import { UI_LABELS } from "@/constants";

interface CropData {
  sourceUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  outputFormat?: "jpeg" | "png" | "webp";
  quality?: number;
}

interface TrimData {
  sourceUrl: string;
  startTime: number;
  endTime: number;
  outputFormat?: "mp4" | "webm";
  quality?: "low" | "medium" | "high";
}

interface MediaOperationFormProps {
  operationType: "crop" | "trim";
  onSubmit: (data: CropData | TrimData) => void;
  isLoading?: boolean;
}

const LABELS = UI_LABELS.ADMIN.MEDIA;

export function MediaOperationForm({
  operationType,
  onSubmit,
  isLoading = false,
}: MediaOperationFormProps) {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (operationType === "crop") {
    return (
      <Card className="p-6">
        <Text className="text-lg font-semibold mb-4">{LABELS.CROP_IMAGE}</Text>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source URL */}
          <FormField
            label={LABELS.SOURCE_URL}
            type="url"
            placeholder={LABELS.SOURCE_URL_PLACEHOLDER}
            value={formData.sourceUrl || ""}
            onChange={(e) => handleChange("sourceUrl", e.target.value)}
            required
          />

          {/* Crop Parameters */}
          <div className="border-t pt-4">
            <Text className="font-semibold text-sm mb-3">
              {LABELS.CROP_PARAMETERS}
            </Text>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={LABELS.X_POSITION}
                type="number"
                value={formData.x || 0}
                onChange={(e) =>
                  handleChange("x", parseInt(e.target.value) || 0)
                }
                min="0"
              />
              <FormField
                label={LABELS.Y_POSITION}
                type="number"
                value={formData.y || 0}
                onChange={(e) =>
                  handleChange("y", parseInt(e.target.value) || 0)
                }
                min="0"
              />
              <FormField
                label={LABELS.WIDTH}
                type="number"
                value={formData.width || 100}
                onChange={(e) =>
                  handleChange("width", parseInt(e.target.value) || 100)
                }
                min="1"
                required
              />
              <FormField
                label={LABELS.HEIGHT}
                type="number"
                value={formData.height || 100}
                onChange={(e) =>
                  handleChange("height", parseInt(e.target.value) || 100)
                }
                min="1"
                required
              />
            </div>
          </div>

          {/* Output Settings */}
          <div className="border-t pt-4">
            <Text className="font-semibold text-sm mb-3">Output Settings</Text>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={LABELS.OUTPUT_FORMAT}
                type="select"
                value={formData.outputFormat || "jpeg"}
                onChange={(e) => handleChange("outputFormat", e.target.value)}
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </FormField>
              <FormField
                label={LABELS.QUALITY}
                type="select"
                value={formData.quality || 90}
                onChange={(e) =>
                  handleChange("quality", parseInt(e.target.value) || 90)
                }
              >
                <option value="60">Low (60)</option>
                <option value="75">Medium (75)</option>
                <option value="90">High (90)</option>
              </FormField>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Crop Image"}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Text className="text-lg font-semibold mb-4">{LABELS.TRIM_VIDEO}</Text>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source URL */}
        <FormField
          label={LABELS.SOURCE_URL}
          type="url"
          placeholder="https://example.com/video.mp4"
          value={formData.sourceUrl || ""}
          onChange={(e) => handleChange("sourceUrl", e.target.value)}
          required
        />

        {/* Trim Parameters */}
        <div className="border-t pt-4">
          <Text className="font-semibold text-sm mb-3">
            {LABELS.TRIM_PARAMETERS}
          </Text>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={LABELS.START_TIME}
              type="number"
              value={formData.startTime || 0}
              onChange={(e) =>
                handleChange("startTime", parseFloat(e.target.value) || 0)
              }
              min="0"
              step="0.1"
              required
            />
            <FormField
              label={LABELS.END_TIME}
              type="number"
              value={formData.endTime || 10}
              onChange={(e) =>
                handleChange("endTime", parseFloat(e.target.value) || 10)
              }
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        {/* Output Settings */}
        <div className="border-t pt-4">
          <Text className="font-semibold text-sm mb-3">Output Settings</Text>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={LABELS.OUTPUT_FORMAT}
              type="select"
              value={formData.outputFormat || "mp4"}
              onChange={(e) => handleChange("outputFormat", e.target.value)}
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
            </FormField>
            <FormField
              label={LABELS.VIDEO_QUALITY}
              type="select"
              value={formData.quality || "medium"}
              onChange={(e) => handleChange("quality", e.target.value)}
            >
              <option value="low">Low (500k/64k)</option>
              <option value="medium">Medium (1000k/128k)</option>
              <option value="high">High (2500k/192k)</option>
            </FormField>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Trim Video"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
