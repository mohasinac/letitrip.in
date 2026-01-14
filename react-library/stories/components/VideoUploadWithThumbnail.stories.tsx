import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { VideoUploadWithThumbnail } from "../../src/components/VideoUploadWithThumbnail";

const meta = {
  title: "Components/Upload/VideoUploadWithThumbnail",
  component: VideoUploadWithThumbnail,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Video upload component with automatic thumbnail generation from video frames. Features include video preview, manual frame selection via timeline slider, duration and size validation, and upload progress tracking.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    maxSize: {
      control: "number",
      description: "Maximum file size in bytes",
      defaultValue: 52428800, // 50MB
    },
    maxDuration: {
      control: "number",
      description: "Maximum video duration in seconds",
      defaultValue: 300, // 5 minutes
    },
    autoDelete: {
      control: "boolean",
      description: "Enable auto-delete after 24 hours",
      defaultValue: false,
    },
    onUpload: {
      action: "uploaded",
      description: "Callback when video and thumbnail are uploaded",
    },
  },
} satisfies Meta<typeof VideoUploadWithThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onUpload: async (videoFile, thumbnailFile) => {
      console.log("Video upload:", videoFile.name);
      console.log("Thumbnail:", thumbnailFile?.name);
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    maxDuration: 300, // 5 minutes
  },
};

export const ShortVideos: Story = {
  args: {
    onUpload: async (videoFile, thumbnailFile) => {
      console.log("Short video upload:", videoFile.name);
      console.log("Thumbnail:", thumbnailFile?.name);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    maxDuration: 60, // 1 minute
  },
};

export const LargeVideos: Story = {
  args: {
    onUpload: async (videoFile, thumbnailFile) => {
      console.log("Large video upload:", videoFile.name);
      console.log("Thumbnail:", thumbnailFile?.name);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 600, // 10 minutes
  },
};

export const WithAutoDelete: Story = {
  args: {
    onUpload: async (videoFile, thumbnailFile) => {
      console.log("Video upload with auto-delete:", videoFile.name);
      console.log("Thumbnail:", thumbnailFile?.name);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    autoDelete: true,
    maxSize: 50 * 1024 * 1024,
    maxDuration: 300,
  },
};

export const ProductDemo: Story = {
  args: {
    onUpload: async (videoFile, thumbnailFile) => {
      console.log("Product demo video:", videoFile.name);
      console.log("Thumbnail:", thumbnailFile?.name);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    maxSize: 50 * 1024 * 1024,
    maxDuration: 180, // 3 minutes
    autoDelete: false,
  },
};

export const QuickClip: Story = {
  args: {
    onUpload: async (videoFile, thumbnailFile) => {
      console.log("Quick clip upload:", videoFile.name);
      console.log("Thumbnail:", thumbnailFile?.name);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxDuration: 30, // 30 seconds
    autoDelete: true,
  },
};

// Interactive example with state management
export const Interactive = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <VideoUploadWithThumbnail
        onUpload={async (videoFile, thumbnailFile) => {
          setError(null);
          try {
            console.log("Uploading video:", videoFile.name);
            console.log("Thumbnail:", thumbnailFile?.name);

            // Simulate upload
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const vUrl = URL.createObjectURL(videoFile);
            setVideoUrl(vUrl);

            if (thumbnailFile) {
              const tUrl = URL.createObjectURL(thumbnailFile);
              setThumbnailUrl(tUrl);
            }

            // Get video duration
            const video = document.createElement("video");
            video.src = vUrl;
            video.onloadedmetadata = () => {
              setDuration(video.duration);
            };
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
          }
        }}
        maxSize={50 * 1024 * 1024}
        maxDuration={300}
      />

      {videoUrl && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">
          <h3 className="font-semibold">Upload Result:</h3>

          <div>
            <p className="text-sm font-medium mb-2">Video Preview:</p>
            <video
              src={videoUrl}
              controls
              className="w-full max-w-md rounded border"
            />
            {duration && (
              <p className="text-sm text-gray-600 mt-1">
                Duration: {duration.toFixed(2)}s
              </p>
            )}
          </div>

          {thumbnailUrl && (
            <div>
              <p className="text-sm font-medium mb-2">Thumbnail:</p>
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="w-full max-w-md rounded border"
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border border-red-300 rounded-lg bg-red-50">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
