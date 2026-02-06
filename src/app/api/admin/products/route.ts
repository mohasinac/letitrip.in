/**
 * Admin Products API Route
 * 
 * GET /api/admin/products - List all products
 * POST /api/admin/products - Create new product

 */

import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants/messages";
import type { ProductCreateInput } from "@/db/schema/products";

/**
 * GET /api/admin/products
 * List all products (admin/moderator only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and role
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sellerId = searchParams.get("sellerId");
    const category = searchParams.get("category");
    const isAuction = searchParams.get("isAuction");
    const isPromoted = searchParams.get("isPromoted");

    // Fetch products based on filters
    let products;
    if (status) {
      products = await productRepository.findByStatus(status as any);
    } else if (sellerId) {
      products = await productRepository.findBySeller(sellerId);
    } else if (category) {
      products = await productRepository.findByCategory(category);
    } else if (isAuction === "true") {
      products = await productRepository.findAuctions();
    } else if (isPromoted === "true") {
      products = await productRepository.findPromoted();
    } else {
      products = await productRepository.findAll();
    }

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/products
 * Create new product (admin/seller only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and role
    const user = await requireAuth();
    await requireRole(["admin", "seller"]);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        },
        { status: 400 },
      );
    }

    // Create product data
    const productData: ProductCreateInput = {
      title: body.title,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      brand: body.brand,
      price: body.price,
      currency: body.currency || "INR",
      stockQuantity: body.stockQuantity || 0,
      images: body.images || [],
      status: body.status || "draft",
      sellerId: user.uid,
      sellerName: user.displayName || user.email || "Unknown",
      sellerEmail: user.email || "",
      featured: false,
      tags: body.tags || [],
      specifications: body.specifications,
      features: body.features,
      shippingInfo: body.shippingInfo,
      returnPolicy: body.returnPolicy,

      // Auction fields
      isAuction: body.isAuction || false,
      auctionEndDate: body.auctionEndDate
        ? new Date(body.auctionEndDate)
        : undefined,
      startingBid: body.startingBid,

      // Promotion fields
      isPromoted: body.isPromoted || false,
      promotionEndDate: body.promotionEndDate
        ? new Date(body.promotionEndDate)
        : undefined,
    };

    // Create product
    const product = await productRepository.create(productData);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
