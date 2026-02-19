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
            name="sourceUrl"
            type="text"
            placeholder={LABELS.SOURCE_URL_PLACEHOLDER}
            value={formData.sourceUrl || ""}
            onChange={(value) => handleChange("sourceUrl", value)}
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
                name="x"
                type="number"
                value={String(formData.x ?? 0)}
                onChange={(value) => handleChange("x", parseInt(value) || 0)}
              />
              <FormField
                label={LABELS.Y_POSITION}
                name="y"
                type="number"
                value={String(formData.y ?? 0)}
                onChange={(value) => handleChange("y", parseInt(value) || 0)}
              />
              <FormField
                label={LABELS.WIDTH}
                name="width"
                type="number"
                value={String(formData.width ?? 100)}
                onChange={(value) =>
                  handleChange("width", parseInt(value) || 100)
                }
                required
              />
              <FormField
                label={LABELS.HEIGHT}
                name="height"
                type="number"
                value={String(formData.height ?? 100)}
                onChange={(value) =>
                  handleChange("height", parseInt(value) || 100)
                }
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
                name="outputFormat"
                type="select"
                value={formData.outputFormat || "jpeg"}
                onChange={(value) => handleChange("outputFormat", value)}
                options={[
                  { value: "jpeg", label: "JPEG" },
                  { value: "png", label: "PNG" },
                  { value: "webp", label: "WebP" },
                ]}
              />
              <FormField
                label={LABELS.QUALITY}
                name="quality"
                type="select"
                value={String(formData.quality ?? 90)}
                onChange={(value) =>
                  handleChange("quality", parseInt(value) || 90)
                }
                options={[
                  { value: "60", label: "Low (60)" },
                  { value: "75", label: "Medium (75)" },
                  { value: "90", label: "High (90)" },
                ]}
              />
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
          name="sourceUrl"
          type="text"
          placeholder="https://example.com/video.mp4"
          value={formData.sourceUrl || ""}
          onChange={(value) => handleChange("sourceUrl", value)}
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
              name="startTime"
              type="number"
              value={String(formData.startTime ?? 0)}
              onChange={(value) =>
                handleChange("startTime", parseFloat(value) || 0)
              }
              required
            />
            <FormField
              label={LABELS.END_TIME}
              name="endTime"
              type="number"
              value={String(formData.endTime ?? 10)}
              onChange={(value) =>
                handleChange("endTime", parseFloat(value) || 10)
              }
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
              name="outputFormat"
              type="select"
              value={formData.outputFormat || "mp4"}
              onChange={(value) => handleChange("outputFormat", value)}
              options={[
                { value: "mp4", label: "MP4" },
                { value: "webm", label: "WebM" },
              ]}
            />
            <FormField
              label={LABELS.VIDEO_QUALITY}
              name="quality"
              type="select"
              value={formData.quality || "medium"}
              onChange={(value) => handleChange("quality", value)}
              options={[
                { value: "low", label: "Low (500k/64k)" },
                { value: "medium", label: "Medium (1000k/128k)" },
                { value: "high", label: "High (2500k/192k)" },
              ]}
            />
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
