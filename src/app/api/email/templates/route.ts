/**
 * Email Templates API Route
 *
 * Manage email templates
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GET - List all email templates
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can view templates
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const enabled = searchParams.get("enabled");

    const db = admin.firestore();
    let query: admin.firestore.Query = db.collection("emailTemplates");

    // Apply filters
    if (type && type !== "all") {
      query = query.where("type", "==", type);
    }
    if (enabled !== null && enabled !== "all") {
      query = query.where("enabled", "==", enabled === "true");
    }

    query = query.orderBy("name", "asc");

    const snapshot = await query.get();
    const templates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    logError(error as Error, {
      component: "EmailTemplatesAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create new email template
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can create templates
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, subject, content, variables, enabled } = body;

    // Validation
    if (!name || !type || !subject || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const templateRef = db.collection("emailTemplates").doc();

    const template: Omit<EmailTemplate, "id"> = {
      name,
      type,
      subject,
      content,
      variables: variables || [],
      enabled: enabled !== undefined ? enabled : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    await templateRef.set(template);

    return NextResponse.json({
      success: true,
      id: templateRef.id,
      template: {
        id: templateRef.id,
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "EmailTemplatesAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PUT - Update email template
export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can update templates
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, type, subject, content, variables, enabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID required" },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const templateRef = db.collection("emailTemplates").doc(id);

    const templateDoc = await templateRef.get();
    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const updateData: Partial<EmailTemplate> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (subject !== undefined) updateData.subject = subject;
    if (content !== undefined) updateData.content = content;
    if (variables !== undefined) updateData.variables = variables;
    if (enabled !== undefined) updateData.enabled = enabled;

    await templateRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      component: "EmailTemplatesAPI.PUT",
    });
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete email template
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can delete templates
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID required" },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const templateRef = db.collection("emailTemplates").doc(id);

    const templateDoc = await templateRef.get();
    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    await templateRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      component: "EmailTemplatesAPI.DELETE",
    });
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
