import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ImageUploadWithCrop } from "../../src/components/ImageUploadWithCrop";

const meta = {
  title: "Components/Upload/ImageUploadWithCrop",
  component: ImageUploadWithCrop,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Advanced image upload component with crop controls including zoom (0.5x-3x), rotation (90° increments), and pan/offset functionality. Supports touch and mouse controls for mobile and desktop responsiveness.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    maxSize: {
      control: "number",
      description: "Maximum file size in bytes",
      defaultValue: 5242880, // 5MB
    },
    aspectRatio: {
      control: "number",
      description: "Aspect ratio for crop area (optional)",
    },
    autoDelete: {
      control: "boolean",
      description: "Enable auto-delete after 24 hours",
      defaultValue: false,
    },
    onUpload: {
      action: "uploaded",
      description: "Callback when file is uploaded with crop data",
    },
  },
} satisfies Meta<typeof ImageUploadWithCrop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onUpload: async (file, cropData) => {
      console.log("Upload:", file.name, cropData);
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

export const WithAspectRatio: Story = {
  args: {
    onUpload: async (file, cropData) => {
      console.log("Upload:", file.name, cropData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    aspectRatio: 16 / 9,
    maxSize: 5 * 1024 * 1024,
  },
};

export const SquareAspectRatio: Story = {
  args: {
    onUpload: async (file, cropData) => {
      console.log("Upload:", file.name, cropData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    aspectRatio: 1,
    maxSize: 5 * 1024 * 1024,
  },
};

export const WithAutoDelete: Story = {
  args: {
    onUpload: async (file, cropData) => {
      console.log("Upload with auto-delete:", file.name, cropData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    autoDelete: true,
    maxSize: 5 * 1024 * 1024,
  },
};

export const SmallMaxSize: Story = {
  args: {
    onUpload: async (file, cropData) => {
      console.log("Upload:", file.name, cropData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    maxSize: 1 * 1024 * 1024, // 1MB
  },
};

export const ProductImage: Story = {
  args: {
    onUpload: async (file, cropData) => {
      console.log("Product image upload:", file.name, cropData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    aspectRatio: 4 / 3,
    maxSize: 5 * 1024 * 1024,
    autoDelete: false,
  },
};

export const ProfileAvatar: Story = {
  args: {
    onUpload: async (file, cropData) => {
      console.log("Avatar upload:", file.name, cropData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    aspectRatio: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
    autoDelete: false,
  },
};

// Interactive example with state management
export const Interactive = () => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [cropData, setCropData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <ImageUploadWithCrop
        onUpload={async (file, crop) => {
          setError(null);
          try {
            console.log("Uploading:", file.name, crop);
            // Simulate upload
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const url = URL.createObjectURL(file);
            setUploadedUrl(url);
            setCropData(crop);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
          }
        }}
        maxSize={5 * 1024 * 1024}
      />

      {uploadedUrl && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Upload Result:</h3>
          <p className="text-sm text-gray-600">URL: {uploadedUrl}</p>
          {cropData && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Crop Data:</p>
              <pre className="mt-1 p-2 bg-white rounded text-xs">
                {JSON.stringify(cropData, null, 2)}
              </pre>
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
