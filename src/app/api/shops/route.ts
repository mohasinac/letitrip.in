import { NextRequest, NextResponse } from 'next/server';
import { buildQueryFromFilters } from '@/lib/filter-helpers';
import { getCurrentUser } from '../lib/session';

/**
 * Unified Shops API
 * GET: List shops (filtered by role)
 * POST: Create shop (seller/admin only)
 */

// GET /api/shops - List shops
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    const { searchParams } = new URL(request.url);

    // Extract filters from query params
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (value) filters[key] = value;
    });

    // TODO: Implement actual database query
    // For now, return mock data based on user role

    const role = user?.role || 'guest';
    
    // Role-based filtering logic:
    // - Guest/User: Only verified, non-banned shops
    // - Seller: Own shops + verified shops
    // - Admin: All shops with advanced filters

    let shops: any[] = [];
    let canCreateMore = false;

    if (role === 'admin') {
      // Admins see all shops with filters applied
      // TODO: Query database with filters
      shops = []; // Mock data
      canCreateMore = true; // Admins can create unlimited shops
    } else if (role === 'seller') {
      // Sellers see their own shops
      const userId = user?.id;
      // TODO: Query database for shops where ownerId === userId
      shops = []; // Mock data
      
      // Check if user can create more shops (max 1 for sellers)
      canCreateMore = shops.length === 0;
    } else {
      // Guests/users see only verified, non-banned shops
      // TODO: Query database with isVerified=true and isBanned=false
      shops = []; // Mock data
      canCreateMore = false;
    }

    return NextResponse.json({
      success: true,
      shops,
      canCreateMore,
      total: shops.length,
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shops',
      },
      { status: 500 }
    );
  }
}

// POST /api/shops - Create shop
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // Middleware should handle auth, but double-check
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Check role (seller or admin)
    if (user.role !== 'seller' && user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only sellers and admins can create shops',
        },
        { status: 403 }
      );
    }

    const userId = user.id;
    const userRole = user.role;

    // Check shop creation limit (1 for sellers, unlimited for admins)
    if (userRole === 'seller') {
      // TODO: Query database to count existing shops for this user
      const existingShopsCount = 0; // Mock

      if (existingShopsCount >= 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'You can only create 1 shop. Please contact admin for more.',
          },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.slug || !data.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, slug, description',
        },
        { status: 400 }
      );
    }

    // TODO: Check if slug is unique
    // const existingShop = await db.collection('shops').where('slug', '==', data.slug).get();
    // if (!existingShop.empty) {
    //   return NextResponse.json(
    //     { success: false, error: 'Shop slug already exists' },
    //     { status: 400 }
    //   );
    // }

    // Create shop object
    const shop = {
      id: `shop_${Date.now()}`, // TODO: Generate proper ID
      ownerId: userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      location: data.location || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      logo: null, // Will be uploaded in edit page
      banner: null, // Will be uploaded in edit page
      rating: 0,
      reviewCount: 0,
      productCount: 0,
      isVerified: false,
      isFeatured: false,
      showOnHomepage: false,
      isBanned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await db.collection('shops').doc(shop.id).set(shop);

    return NextResponse.json({
      success: true,
      shop,
      message: 'Shop created successfully. You can now upload logo and banner.',
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create shop',
      },
      { status: 500 }
    );
  }
}
