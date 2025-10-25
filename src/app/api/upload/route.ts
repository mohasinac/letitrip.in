import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminStorage } from "@/lib/database/admin";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const auth = getAdminAuth();
    const storage = getAdminStorage();
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      // Parse form data
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const type = formData.get("type") as string;
      const categoryId = formData.get("categoryId") as string;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Only image files are allowed" },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "File size must be less than 5MB" },
          { status: 400 }
        );
      }

      // Generate file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExtension}`;
      
      let filePath: string;
      if (type === "category") {
        filePath = `categories/${categoryId || 'temp'}/${fileName}`;
      } else if (type === "product") {
        filePath = `products/${fileName}`;
      } else {
        filePath = `uploads/${fileName}`;
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Firebase Storage
      const bucket = storage.bucket();
      const fileRef = bucket.file(filePath);
      
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            uploadedBy: decodedToken.uid,
            uploadedAt: new Date().toISOString(),
            originalName: file.name
          }
        }
      });

      // Make file publicly accessible
      await fileRef.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      return NextResponse.json({
        success: true,
        data: {
          url: publicUrl,
          path: filePath,
          fileName: fileName,
          size: file.size,
          type: file.type
        }
      });

    } catch (authError) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
