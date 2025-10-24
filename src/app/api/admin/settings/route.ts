import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch settings from database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();

    const settingsDoc = await db.collection('settings').doc('site-config').get();
    
    if (!settingsDoc.exists) {
      return NextResponse.json({ 
        error: "Settings not configured",
        siteName: "JustForView",
        currency: "INR",
        homePageSections: []
      }, { status: 404 });
    }

    const settings = settingsDoc.data();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await request.json();
    
    // Save settings to database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();

    await db.collection('settings').doc('site-config').set({
      ...settings,
      updatedAt: new Date(),
      updatedBy: user.userId
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
