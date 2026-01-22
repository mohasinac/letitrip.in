/**
 * Seller Auctions API
 *
 * Manage seller's auctions.
 *
 * @route GET /api/seller/auctions - List seller's auctions (requires seller/admin)
 * @route POST /api/seller/auctions - Create auction (requires seller/admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - List seller's auctions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build query
    const constraints: any[] = [where("sellerId", "==", userId)];

    if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageLimit));

    if (cursor) {
      const cursorDoc = await getDocs(
        query(collection(db, "auctions"), where("__name__", "==", cursor)),
      );
      if (!cursorDoc.empty) {
        constraints.push(startAfter(cursorDoc.docs[0]));
      }
    }

    const auctionsQuery = query(collection(db, "auctions"), ...constraints);
    const querySnapshot = await getDocs(auctionsQuery);

    const auctions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          auctions,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching seller auctions:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch auctions",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Create new auction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    const body = await request.json();
    const {
      title,
      description,
      startingBid,
      reservePrice,
      category,
      images,
      startTime,
      endTime,
      condition,
    } = body;

    // Validate required fields
    if (!title || !description || !startingBid || !category || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate times
    const start = startTime ? new Date(startTime) : new Date();
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 },
      );
    }

    // Generate slug
    const timestamp = Date.now();
    const slug = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${timestamp}`;

    // Create auction
    const auctionData = {
      slug,
      title,
      description,
      startingBid: parseFloat(startingBid),
      currentBid: parseFloat(startingBid),
      reservePrice: reservePrice ? parseFloat(reservePrice) : null,
      category,
      images: images || [],
      condition: condition || "used",
      sellerId: userId,
      startTime: start,
      endTime: end,
      status: "pending", // Requires admin approval
      bidCount: 0,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const auctionRef = await addDoc(collection(db, "auctions"), auctionData);

    return NextResponse.json(
      {
        success: true,
        message: "Auction created successfully",
        data: {
          id: auctionRef.id,
          slug,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating auction:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to create auction",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
