import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/webm",
    ];
    if (!acceptedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only images and videos allowed." },
        { status: 400 },
      );
    }

    // Validate file size (25MB max)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File size exceeds 25MB limit" },
        { status: 400 },
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.type.split("/")[1];
    const filename = `hero-${timestamp}-${random}.${extension}`;

    // In production, upload to cloud storage (S3, Firebase Storage, etc.)
    // For now, return a mock URL with the filename
    const url = `/uploads/${filename}`;

    // Save to local storage (for development)
    if (process.env.NODE_ENV === "development") {
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const bytes = await file.arrayBuffer();
      await writeFile(join(uploadsDir, filename), Buffer.from(bytes));
    }

    return NextResponse.json({
      url,
      filename,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

// Allow file size up to 25MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};
