import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '../middleware';
import { BadRequestError, handleApiError } from '../lib/errors';

// Example: Get all products with caching and rate limiting
async function getProductsHandler(req: NextRequest) {
  try {
    // Example query parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Validation
    if (limit > 100) {
      throw new BadRequestError('Limit cannot exceed 100');
    }

    // Mock data - replace with actual database query
    const products = Array.from({ length: limit }, (_, i) => ({
      id: `product-${page}-${i + 1}`,
      name: `Product ${i + 1}`,
      category: category || 'general',
      price: Math.floor(Math.random() * 1000) + 100,
      image: `https://via.placeholder.com/300x300?text=Product+${i + 1}`,
      description: 'This is a sample product description.',
    }));

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: 100,
        pages: Math.ceil(100 / limit),
      },
      category,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, getProductsHandler, {
    cache: {
      ttl: 300000, // 5 minutes
    },
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000,
    },
  });
}

// Example: Create product (no caching for POST)
async function createProductHandler(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validation
    if (!body.name || !body.price) {
      throw new BadRequestError('Name and price are required', {
        required: ['name', 'price'],
      });
    }

    // Mock creation - replace with actual database insert
    const product = {
      id: `product-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { message: 'Product created', product },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  return withMiddleware(req, createProductHandler, {
    rateLimit: {
      maxRequests: 20,
      windowMs: 60000,
    },
  });
}
