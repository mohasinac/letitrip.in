/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/templates/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * EmailTemplate interface
 * 
 * @interface
 * @description Defines the structure and contract for EmailTemplate
 */
interface EmailTemplate {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Subject */
  subject: string;
  /** Content */
  content: string;
  /** Variables */
  variables: string[];
  /** Enabled */
  enabled: boolean;
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;
}

// GET - List all email templates
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

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
      /** Id */
      id: doc.id,
      ...doc.data(),
      /** Created At */
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      /** Updated At */
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailTemplatesAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create new email template
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

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
      /** Variables */
      variables: variables || [],
      /** Enabled */
      enabled: enabled !== undefined ? enabled : true,
      /** Created At */
      createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
      /** Updated At */
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    await templateRef.set(template);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Id */
      id: templateRef.id,
      /** Template */
      template: {
        /** Id */
        id: templateRef.id,
        ...template,
        /** Created At */
        createdAt: new Date().toISOString(),
        /** Updated At */
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailTemplatesAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PUT - Update email template
/**
 * Function: P U T
 */
/**
 * Performs p u t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(req);
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(req);
 */

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
      /** Updated At */
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
      /** Component */
      component: "EmailTemplatesAPI.PUT",
    });
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete email template
/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

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
      /** Component */
      component: "EmailTemplatesAPI.DELETE",
    });
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
