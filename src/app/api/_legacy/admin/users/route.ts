import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

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

      // Fetch all users
      const usersSnapshot = await db.collection("users").limit(100).get();
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json(users);
    } catch (error: any) {
      console.error("Firebase token verification error:", error);
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
