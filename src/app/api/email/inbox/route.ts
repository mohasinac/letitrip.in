/**
 * Email Inbox API Route
 *
 * Fetch received emails (simulated or from email provider)
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

interface InboxEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: Date;
  read: boolean;
  labels: string[];
}

// GET - Retrieve inbox emails
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can view inbox
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const read = searchParams.get("read");
    const label = searchParams.get("label");
    const limit = parseInt(searchParams.get("limit") || "50");

    const db = admin.firestore();
    let query: admin.firestore.Query = db.collection("inboxEmails");

    // Apply filters
    if (read !== null && read !== "all") {
      query = query.where("read", "==", read === "true");
    }
    if (label && label !== "all") {
      query = query.where("labels", "array-contains", label);
    }

    query = query.orderBy("receivedAt", "desc").limit(limit);

    const snapshot = await query.get();
    const emails = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      receivedAt: doc.data().receivedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ emails });
  } catch (error) {
    logError(error as Error, {
      component: "EmailInboxAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}

// POST - Create inbox email (for testing/simulation)
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can create inbox emails
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { from, to, subject, body: emailBody, labels } = body;

    // Validation
    if (!from || !to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const emailRef = db.collection("inboxEmails").doc();

    const email: Omit<InboxEmail, "id"> = {
      from,
      to,
      subject,
      body: emailBody,
      receivedAt: admin.firestore.FieldValue.serverTimestamp() as any,
      read: false,
      labels: labels || [],
    };

    await emailRef.set(email);

    return NextResponse.json({
      success: true,
      id: emailRef.id,
      email: {
        id: emailRef.id,
        ...email,
        receivedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "EmailInboxAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to create inbox email" },
      { status: 500 }
    );
  }
}

// PATCH - Mark email as read/unread
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can update inbox
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, read, labels } = body;

    if (!id) {
      return NextResponse.json({ error: "Email ID required" }, { status: 400 });
    }

    const db = admin.firestore();
    const emailRef = db.collection("inboxEmails").doc(id);

    const emailDoc = await emailRef.get();
    if (!emailDoc.exists) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const updateData: Partial<InboxEmail> = {};
    if (read !== undefined) updateData.read = read;
    if (labels !== undefined) updateData.labels = labels;

    await emailRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      component: "EmailInboxAPI.PATCH",
    });
    return NextResponse.json(
      { error: "Failed to update inbox email" },
      { status: 500 }
    );
  }
}

// DELETE - Delete inbox email
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can delete inbox emails
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Email ID required" }, { status: 400 });
    }

    const db = admin.firestore();
    const emailRef = db.collection("inboxEmails").doc(id);

    const emailDoc = await emailRef.get();
    if (!emailDoc.exists) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    await emailRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      component: "EmailInboxAPI.DELETE",
    });
    return NextResponse.json(
      { error: "Failed to delete inbox email" },
      { status: 500 }
    );
  }
}
