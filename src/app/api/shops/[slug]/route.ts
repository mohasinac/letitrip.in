/**
 * Shop Details API Routes
 *
 * Handles fetching and updating individual shop details by slug.
 *
 * @route GET /api/shops/[slug] - Get shop details
 * @route PUT /api/shops/[slug] - Update shop (Seller/Admin only)
 *
 * @example
 * ```tsx
 * // Get shop details
 * const response = await fetch('/api/shops/my-shop');
 *
 * // Update shop
 * const response = await fetch('/api/shops/my-shop', {
 *   method: 'PUT',
 *   body: JSON.stringify({
 *     description: 'Updated description',
 *     ...
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/shops/[slug]
 *
 * Get shop details by slug.
 * Increments view count asynchronously.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    // Query shop by slug
    const shopQuery = query(collection(db, "shops"), where("slug", "==", slug));

    const querySnapshot = await getDocs(shopQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const shopDoc = querySnapshot.docs[0];
    const shopData = {
      id: shopDoc.id,
      ...shopDoc.data(),
    };

    // Increment view count asynchronously (don't wait)
    updateDoc(shopDoc.ref, {
      views: increment(1),
    }).catch((error) => {
      console.error("Error updating view count:", error);
    });

    return NextResponse.json(
      {
        success: true,
        data: shopData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching shop:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop", details: error.message },
      { status: 500 },
    );
  }
}

interface UpdateShopRequest {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  categorySlug?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  status?: "active" | "inactive" | "suspended";
}

/**
 * PUT /api/shops/[slug]
 *
 * Update shop details (Seller/Admin only).
 * Owner or admin can update. Cannot update: ownerId, slug, counters, rating.
 *
 * Request Body:
 * - name: Shop name
 * - description: Shop description
 * - logo: Logo URL
 * - banner: Banner URL
 * - categorySlug: Primary category
 * - address: Shop address
 * - contactEmail: Contact email
 * - contactPhone: Contact phone
 * - socialLinks: Social media links
 * - status: Shop status (admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body: UpdateShopRequest = await request.json();

    // Query shop by slug
    const shopQuery = query(collection(db, "shops"), where("slug", "==", slug));

    const querySnapshot = await getDocs(shopQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const shopDoc = querySnapshot.docs[0];

    // Build update object (only allow specific fields)
    const updates: any = {
      updatedAt: serverTimestamp(),
    };

    // Update allowed fields
    if (body.name) {
      updates.name = body.name;
      updates.nameLower = body.name.toLowerCase();
    }
    if (body.description !== undefined) updates.description = body.description;
    if (body.logo !== undefined) updates.logo = body.logo;
    if (body.banner !== undefined) updates.banner = body.banner;
    if (body.categorySlug !== undefined)
      updates.categorySlug = body.categorySlug;
    if (body.address) updates.address = body.address;
    if (body.contactEmail !== undefined)
      updates.contactEmail = body.contactEmail;
    if (body.contactPhone !== undefined)
      updates.contactPhone = body.contactPhone;
    if (body.socialLinks) updates.socialLinks = body.socialLinks;
    if (body.status) updates.status = body.status;

    // Update shop
    await updateDoc(shopDoc.ref, updates);

    // Get updated data
    const updatedSnapshot = await getDocs(shopQuery);
    const updatedData = {
      id: updatedSnapshot.docs[0].id,
      ...updatedSnapshot.docs[0].data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: updatedData,
        message: "Shop updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating shop:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to update shop" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update shop", details: error.message },
      { status: 500 },
    );
  }
}
