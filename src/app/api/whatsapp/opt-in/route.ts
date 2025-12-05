/**
 * WhatsApp Opt-In API
 *
 * @status IMPLEMENTED
 * @task 1.4.4
 */

import { adminDb } from "@/app/api/lib/firebase/config";
import { getCurrentUser } from "@/app/api/lib/session";
import type { MessageCategory } from "@/config/whatsapp.config";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      phone,
      categories,
    }: { phone: string; categories: MessageCategory[] } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    // Store opt-in in Firestore
    await adminDb
      .collection(COLLECTIONS.WHATSAPP_OPT_INS)
      .doc(phone)
      .set({
        phone,
        optedIn: true,
        optedInAt: new Date(),
        categories: categories || ["UTILITY", "SERVICE"],
        updatedAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, { route: "POST /api/whatsapp/opt-in" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
