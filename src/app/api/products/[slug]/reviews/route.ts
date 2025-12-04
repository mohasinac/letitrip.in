import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { strictRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from "@/constants/validation-messages";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products/[slug]/reviews
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  let slug: string | undefined;
  try {
    const awaitedParams = await params;
    slug = awaitedParams.slug;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const rating = searchParams.get("rating"); // optional filter

    const prodSnap = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (prodSnap.empty)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    const productId = prodSnap.docs[0].id;

    let query: any = Collections.reviews()
      .where("product_id", "==", productId)
      .orderBy("created_at", "desc");
    if (rating) query = query.where("rating", "==", Number(rating));

    const snap = await query.limit(limit).get();
    const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.products.slug.reviews.GET",
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load reviews" },
      { status: 500 },
    );
  }
}

// POST /api/products/[slug]/reviews
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  let slug: string | undefined;
  let userId: string | undefined;
  // Rate limiting
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!strictRateLimiter.check(identifier)) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many review submissions. Please try again later.",
      },
      { status: 429 },
    );
  }

  try {
    const user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    userId = user.id;

    const awaitedParams = await context.params;
    slug = awaitedParams.slug;
    const body = await req.json();
    const rating = Number(body?.rating);
    const title: string | undefined = body?.title?.toString();
    const comment: string = (body?.comment || "").toString();
    const media: string[] = Array.isArray(body?.media)
      ? body.media.slice(0, 5)
      : [];

    if (
      !Number.isFinite(rating) ||
      rating < VALIDATION_RULES.REVIEW.RATING.MIN ||
      rating > VALIDATION_RULES.REVIEW.RATING.MAX
    ) {
      return NextResponse.json(
        { success: false, error: VALIDATION_MESSAGES.REVIEW.RATING_INVALID },
        { status: 400 },
      );
    }
    if (
      !comment ||
      comment.length < VALIDATION_RULES.REVIEW.CONTENT.MIN_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          error: VALIDATION_MESSAGES.REVIEW.CONTENT_TOO_SHORT,
        },
        { status: 400 },
      );
    }

    // Resolve product
    const prodSnap = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (prodSnap.empty)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    const prodDoc = prodSnap.docs[0];
    const product = prodDoc.data() as any;

    // Optional: verify purchase (placeholder - implement orders check later)
    const verified_purchase = false;

    // Create review
    const docRef = await Collections.reviews().add({
      product_id: prodDoc.id,
      shop_id: product.shop_id || null,
      user_id: user.id,
      user_name: user.name || "",
      rating,
      title: title || null,
      comment,
      media,
      status: "pending", // moderation pipeline
      verified_purchase,
      helpful_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    logError(error as Error, {
      component: "API.products.slug.reviews.POST",
      metadata: { slug, userId },
    });
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    );
  }
}
