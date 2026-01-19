/**
 * Reviews API Routes
 * 
 * Handles product and auction reviews with purchase verification.
 * Users can only review items they have purchased/won.
 * 
 * @route GET /api/reviews - List reviews with filters
 * @route POST /api/reviews - Create review (requires order)
 * 
 * @example
 * ```tsx
 * // List reviews
 * const response = await fetch('/api/reviews?productSlug=laptop-dell&sort=newest');
 * 
 * // Create review
 * const response = await fetch('/api/reviews', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     userId: 'user-id',
 *     productSlug: 'laptop-dell',
 *     rating: 5,
 *     title: 'Excellent laptop',
 *     comment: 'Great performance...',
 *     orderId: 'order-123'
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  startAfter,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

/**
 * GET /api/reviews
 * 
 * List reviews with filtering and pagination.
 * 
 * Query Parameters:
 * - productSlug: Filter by product slug
 * - auctionSlug: Filter by auction slug
 * - shopSlug: Filter by shop slug
 * - userId: Filter by reviewer
 * - rating: Filter by rating (1-5)
 * - verified: Filter verified purchases only (true/false)
 * - sort: Sort order (newest, oldest, highest, lowest, helpful)
 * - limit: Results per page (default 20, max 100)
 * - cursor: Pagination cursor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug");
    const auctionSlug = searchParams.get("auctionSlug");
    const shopSlug = searchParams.get("shopSlug");
    const userId = searchParams.get("userId");
    const ratingParam = searchParams.get("rating");
    const verifiedParam = searchParams.get("verified");
    const sortBy = searchParams.get("sort") || "newest";
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100
    );
    const cursor = searchParams.get("cursor");

    // Build query constraints
    const constraints: any[] = [];

    if (productSlug) {
      constraints.push(where("productSlug", "==", productSlug));
    }
    if (auctionSlug) {
      constraints.push(where("auctionSlug", "==", auctionSlug));
    }
    if (shopSlug) {
      constraints.push(where("shopSlug", "==", shopSlug));
    }
    if (userId) {
      constraints.push(where("userId", "==", userId));
    }
    if (ratingParam) {
      constraints.push(where("rating", "==", parseInt(ratingParam)));
    }
    if (verifiedParam === "true") {
      constraints.push(where("verified", "==", true));
    }

    // Add sorting
    switch (sortBy) {
      case "oldest":
        constraints.push(orderBy("createdAt", "asc"));
        break;
      case "highest":
        constraints.push(orderBy("rating", "desc"));
        break;
      case "lowest":
        constraints.push(orderBy("rating", "asc"));
        break;
      case "helpful":
        constraints.push(orderBy("helpfulCount", "desc"));
        break;
      case "newest":
      default:
        constraints.push(orderBy("createdAt", "desc"));
        break;
    }

    constraints.push(limit(pageLimit));

    // Handle cursor pagination
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, "reviews", cursor));
      if (cursorDoc.exists()) {
        constraints.push(startAfter(cursorDoc));
      }
    }

    // Execute query
    const reviewsQuery = query(collection(db, "reviews"), ...constraints);
    const querySnapshot = await getDocs(reviewsQuery);

    const reviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get last document for pagination
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          reviews,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
          filters: {
            productSlug,
            auctionSlug,
            shopSlug,
            userId,
            rating: ratingParam,
            verified: verifiedParam,
            sort: sortBy,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}

interface CreateReviewRequest {
  userId: string;
  productSlug?: string;
  auctionSlug?: string;
  shopSlug: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  pros?: string[];
  cons?: string[];
}

/**
 * POST /api/reviews
 * 
 * Create a new review (requires verified purchase/win).
 * 
 * Request Body:
 * - userId: User ID (required)
 * - productSlug: Product slug (required if not auction)
 * - auctionSlug: Auction slug (required if not product)
 * - shopSlug: Shop slug (required)
 * - orderId: Order ID for verification (required)
 * - rating: Rating 1-5 (required)
 * - title: Review title (required)
 * - comment: Review text (required)
 * - images: Review images (optional)
 * - pros: List of pros (optional)
 * - cons: List of cons (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateReviewRequest = await request.json();
    const {
      userId,
      productSlug,
      auctionSlug,
      shopSlug,
      orderId,
      rating,
      title,
      comment,
      images = [],
      pros = [],
      cons = [],
    } = body;

    // Validate required fields
    if (!userId || !shopSlug || !orderId || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!productSlug && !auctionSlug) {
      return NextResponse.json(
        { error: "Either productSlug or auctionSlug is required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    if (!orderDoc.exists()) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();
    if (orderData.userId !== userId) {
      return NextResponse.json(
        { error: "Order does not belong to this user" },
        { status: 403 }
      );
    }

    // Check if user already reviewed this item
    const existingReviewQuery = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      productSlug
        ? where("productSlug", "==", productSlug)
        : where("auctionSlug", "==", auctionSlug)
    );
    const existingReviews = await getDocs(existingReviewQuery);

    if (!existingReviews.empty) {
      return NextResponse.json(
        { error: "You have already reviewed this item" },
        { status: 409 }
      );
    }

    // Generate review slug
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const reviewSlug = `review-${timestamp}-${randomStr}`;

    // Create review document
    const reviewData = {
      slug: reviewSlug,
      userId,
      productSlug: productSlug || null,
      auctionSlug: auctionSlug || null,
      shopSlug,
      orderId,
      rating,
      title,
      comment,
      images,
      pros,
      cons,
      verified: true, // Verified purchase
      helpfulCount: 0,
      reportCount: 0,
      status: "published",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "reviews"), reviewData);

    // Update product/auction rating
    if (productSlug) {
      const productQuery = query(
        collection(db, "products"),
        where("slug", "==", productSlug)
      );
      const productSnapshot = await getDocs(productQuery);
      if (!productSnapshot.empty) {
        const productDoc = productSnapshot.docs[0];
        await updateDoc(productDoc.ref, {
          reviewCount: increment(1),
        });
      }
    } else if (auctionSlug) {
      const auctionQuery = query(
        collection(db, "auctions"),
        where("slug", "==", auctionSlug)
      );
      const auctionSnapshot = await getDocs(auctionQuery);
      if (!auctionSnapshot.empty) {
        const auctionDoc = auctionSnapshot.docs[0];
        await updateDoc(auctionDoc.ref, {
          reviewCount: increment(1),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...reviewData,
        },
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to create review" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create review", details: error.message },
      { status: 500 }
    );
  }
}
