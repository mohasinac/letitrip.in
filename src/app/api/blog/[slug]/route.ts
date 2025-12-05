/**
 * @fileoverview TypeScript Module
 * @module src/app/api/blog/[slug]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * COLLECTION constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for collection
 */
const COLLECTION = "blog_posts";

// GET /api/blog/[slug] - Get single blog post by slug
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_req, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_req, {});
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { slug } = await params;

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await db.collection(COLLECTION).doc(slug).get();

    if (!doc.exists) {
      const snapshot = await db
        .collection(COLLECTION)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 },
        );
      }
      doc = snapshot.docs[0];
    }

    const post = {
      /** Id */
      id: doc.id,
      ...doc.data(),
    };

    // Increment view count
    await doc.ref.update({
      /** Views */
      views: ((doc.data() as any)?.views || 0) + 1,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}

// PATCH /api/blog/[slug] - Update blog post (admin only)
/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(req, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Req */
  req, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The patch result
 *
 * @example
 * PATCH(req, {});
 */
export async function PATCH(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { slug } = await params;
    const body = await req.json();

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await db.collection(COLLECTION).doc(slug).get();

    if (!doc.exists) {
      const snapshot = await db
        .collection(COLLECTION)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 },
        );
      }
      doc = snapshot.docs[0];
    }

    const updates: any = {
      /** Updated At */
      updatedAt: new Date().toISOString(),
    };

    // Allow updating specific fields
    /**
 * Performs allowed fields operation
 *
 * @param {any} (field - The (field
 *
 * @returns {any} The allowedfields result
 *
 */
const allowedFields = [
      "title",
      "excerpt",
      "content",
      "featuredImage",
      "category",
      "tags",
      "status",
      "featured",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Update publishedAt if changing to published
    const docData = doc.data() as any;
    if (body.status === "published" && docData?.status !== "published") {
      updates.publishedAt = new Date().toISOString();
    }

    await doc.ref.update(updates);

    return NextResponse.json({
      /** Id */
      id: doc.id,
      ...docData,
      ...updates,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 },
    );
  }
}

// DELETE /api/blog/[slug] - Delete blog post (admin only)
/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(_req, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(_req, {});
 */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { slug } = await params;

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await db.collection(COLLECTION).doc(slug).get();

    if (!doc.exists) {
      const snapshot = await db
        .collection(COLLECTION)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 },
        );
      }
      doc = snapshot.docs[0];
    }

    await doc.ref.delete();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 },
    );
  }
}
