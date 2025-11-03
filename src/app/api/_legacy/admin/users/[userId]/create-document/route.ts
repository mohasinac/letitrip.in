import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { email, name, phone, role } = body;

    try {
      const token = authHeader.substring(7);
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(token);

      // Check if user is admin
      const db = getAdminDb();
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (!userData || userData.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 },
        );
      }

      // Create or update user document
      const userDocData = {
        uid: userId,
        email: email || "",
        name: name || "User",
        phone: phone || null,
        role: role || "user",
        isEmailVerified: false,
        isPhoneVerified: false,
        addresses: [],
        profile: {},
        isBanned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await db
        .collection("users")
        .doc(userId)
        .set(userDocData, { merge: true });

      return NextResponse.json({
        success: true,
        message: "User document created/updated successfully",
        data: userDocData,
      });
    } catch (error: any) {
      console.error("Firebase token verification error:", error);
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }
  } catch (error: any) {
    console.error("Create user document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user document" },
      { status: 500 },
    );
  }
}
