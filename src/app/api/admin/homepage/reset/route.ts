import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';

const SETTINGS_COLLECTION = 'site_settings';
const HOMEPAGE_SETTINGS_DOC = 'homepage_config';

const DEFAULT_SETTINGS = {
  specialEventBanner: {
    enabled: true,
    title: 'Special Event',
    content: '<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>',
    link: '/special-offers',
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
  },
  heroCarousel: {
    enabled: true,
    autoPlayInterval: 5000,
  },
  sections: {
    valueProposition: {
      enabled: true,
    },
    featuredCategories: {
      enabled: true,
      maxCategories: 5,
      productsPerCategory: 10,
    },
    featuredProducts: {
      enabled: true,
      maxProducts: 10,
    },
    featuredAuctions: {
      enabled: true,
      maxAuctions: 10,
    },
    featuredShops: {
      enabled: true,
      maxShops: 5,
      productsPerShop: 10,
    },
    featuredBlogs: {
      enabled: true,
      maxBlogs: 10,
    },
    featuredReviews: {
      enabled: true,
      maxReviews: 10,
    },
  },
  sectionOrder: [
    'hero-section',
    'value-proposition',
    'featured-categories-icons',
    'featured-categories',
    'featured-products',
    'featured-auctions',
    'shops-nav',
    'featured-shops',
    'featured-blogs',
    'featured-reviews',
    'faq-section',
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// POST /api/admin/homepage/reset - Reset to default settings
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    
    await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .set(DEFAULT_SETTINGS);
    
    return NextResponse.json({
      message: 'Homepage settings reset to defaults',
      settings: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error('Error resetting homepage settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset homepage settings' },
      { status: 500 }
    );
  }
}
