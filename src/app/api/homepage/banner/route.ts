import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

const HOMEPAGE_SETTINGS_DOC = "homepage_config";
const SETTINGS_COLLECTION = "site_settings";

// GET /api/homepage/banner - Public endpoint for special event banner
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();

    const doc = await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .get();

    if (!doc.exists) {
      // Return default banner settings
      return NextResponse.json({
        enabled: true,
        content:
          "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
        link: "/special-offers",
        backgroundColor: "#2563eb",
        textColor: "#ffffff",
      });
    }

    const data = doc.data();
    const banner = data?.specialEventBanner || {
      enabled: true,
      content:
        "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
      link: "/special-offers",
      backgroundColor: "#2563eb",
      textColor: "#ffffff",
    };

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching banner settings:", error);
    // Return default on error
    return NextResponse.json({
      enabled: true,
      content:
        "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
      link: "/special-offers",
      backgroundColor: "#2563eb",
      textColor: "#ffffff",
    });
  }
}
