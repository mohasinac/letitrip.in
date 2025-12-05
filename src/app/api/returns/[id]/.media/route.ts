/**
 * @fileoverview TypeScript Module
 * @module src/app/api/returns/[id]/.media/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getStorageAdmin } from "@/app/api/lib/firebase/admin";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// NOTE: This is a simplified stub. In production, validate file type/size and use signed URLs or direct upload tokens.
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Req */
  req, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The post result
 *
 * @example
 * POST(req, {});
 */
export async function POST(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files");
    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 },
      );
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const retRef = Collections.returns().doc(id);
    const retSnap = await retRef.get();
    if (!retSnap.exists)
      return NextResponse.json(
        { success: false, error: "Return not found" },
        { status: 404 },
      );
    const ret = retSnap.data() as any;

    // Authorization: owner of return, seller owning shop, or admin
    const role = user.role;
    let authorized = false;
    if (role === "admin") authorized = true;
    else if (ret.user_id === user.id) authorized = true;
    else if (role === "seller" && (await userOwnsShop(ret.shop_id, user.id)))
      authorized = true;

    if (!authorized)
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );

    const storage = getStorageAdmin();
    const bucket = storage.bucket();

    const uploaded: string[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = f.name.split(".").pop() || "bin";
      const path = `returns/media/${id}/${randomUUID()}.${ext}`;
      const file = bucket.file(path);
      await file.save(buffer, {
        /** Content Type */
        contentType: f.type,
        /** Resumable */
        resumable: false,
        /** Public */
        public: true,
      });
      // Make public (optional) and get public URL
      try {
        await file.makePublic();
      } catch {}
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
      uploaded.push(publicUrl);
    }

    // Append media URLs to return doc
    await retRef.update({
      /** Media */
      media: [...(ret.media || []), ...uploaded],
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, data: { urls: uploaded } });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.returns.media.uploadDirect",
      /** Metadata */
      metadata: { returnId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to upload media" },
      { status: 500 },
    );
  }
}
