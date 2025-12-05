/**
 * WhatsApp Opt-Out API
 *
 * @status IMPLEMENTED
 * @task 1.4.4
 */

import { adminDb } from "@/app/api/lib/firebase/config";
import { getCurrentUser } from "@/app/api/lib/session";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone }: { phone: string } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    // Update opt-out in Firestore
    await adminDb.collection(COLLECTIONS.WHATSAPP_OPT_INS).doc(phone).update({
      optedIn: false,
      optedOutAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, { route: "POST /api/whatsapp/opt-out" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
