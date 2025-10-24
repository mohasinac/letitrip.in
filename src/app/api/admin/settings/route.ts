import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { API_RESPONSES, HTTP_STATUS } from "@/lib/api/constants";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        API_RESPONSES.UNAUTHORIZED("Admin access required"), 
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Fetch settings from database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();

    const settingsDoc = await db.collection('settings').doc('site-config').get();
    
    if (!settingsDoc.exists) {
      // Return default settings instead of 404
      const defaultSettings = {
        siteName: "JustForView",
        siteDescription: "Your premier e-commerce platform",
        contactEmail: "admin@justforview.in",
        phoneNumber: "+91 9876543210",
        address: "Mumbai, India",
        isLive: true,
        maintenanceMessage: "",
        currency: "INR",
        taxRate: 18,
        shippingCost: 99,
        homePageSections: [],
        heroImages: [],
        policies: {
          privacy: "",
          terms: "",
          returnPolicy: "",
          shippingPolicy: ""
        },
        paymentSettings: {
          stripeEnabled: false,
          paypalEnabled: false,
          codEnabled: true,
          stripePublicKey: "",
          paypalClientId: ""
        },
        firebaseConfig: {
          projectId: "",
          storageBucket: "",
          messagingSenderId: "",
          appId: ""
        }
      };
      return NextResponse.json(defaultSettings);
    }

    const settings = settingsDoc.data();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      API_RESPONSES.ERROR("Failed to fetch settings"), 
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        API_RESPONSES.UNAUTHORIZED("Admin access required"), 
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
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

    return NextResponse.json(
      API_RESPONSES.SUCCESS(null, "Settings saved successfully")
    );
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      API_RESPONSES.ERROR("Failed to save settings"), 
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
