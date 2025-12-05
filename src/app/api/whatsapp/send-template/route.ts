/**
 * WhatsApp Send Template API
 *
 * @status IMPLEMENTED
 * @task 1.4.4
 */

import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import type {
  SendMessageParams,
  SendMessageResponse,
} from "@/services/whatsapp.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params: SendMessageParams = await request.json();

    // Validate required params
    if (!params.to || !params.templateId || !params.variables) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // TODO: Call Twilio/Gupshup API to send WhatsApp message
    // For now, return mock response
    const response: SendMessageResponse = {
      messageId: `msg_${Date.now()}`,
      status: "sent",
      provider: "TWILIO",
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error as Error, { route: "POST /api/whatsapp/send-template" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
