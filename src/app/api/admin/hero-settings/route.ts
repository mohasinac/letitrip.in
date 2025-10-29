"use server";

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/firebase-api-auth';
import { getAdminDb } from '@/lib/database/admin';
import { DATABASE_CONSTANTS } from '@/constants/app';

const SETTINGS_COLLECTION = DATABASE_CONSTANTS.COLLECTIONS.SETTINGS;

/**
 * GET /api/admin/hero-settings
 * Get hero product and carousel settings
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const doc = await db.collection(SETTINGS_COLLECTION)
      .doc('hero-settings')
      .get();

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          carousels: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    console.error('Error fetching hero settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings',
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/hero-settings
 * Create or update hero product settings
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const body = await request.json();
    const { type, data } = body; // type: 'products' or 'carousels'

    if (!type || !data) {
      return NextResponse.json({
        success: false,
        error: 'Type and data are required',
      }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    };

    if (type === 'products') {
      updateData.products = data;
    } else if (type === 'carousels') {
      updateData.carousels = data;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid type',
      }, { status: 400 });
    }

    await db.collection(SETTINGS_COLLECTION)
      .doc('hero-settings')
      .set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      data: updateData,
    });
  } catch (error) {
    console.error('Error saving hero settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save settings',
    }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/hero-settings
 * Update specific hero setting
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const body = await request.json();
    const { type, item, itemId, action } = body; // action: 'add', 'update', 'delete'

    if (!type || !action) {
      return NextResponse.json({
        success: false,
        error: 'Type and action are required',
      }, { status: 400 });
    }

    const doc = await db.collection(SETTINGS_COLLECTION)
      .doc('hero-settings')
      .get();

    const savedData = doc.exists ? doc.data() : null;
    const currentData = savedData || { products: [], carousels: [] };
    const items = currentData[type as keyof typeof currentData] || [];

    let updatedItems;

    if (action === 'add') {
      updatedItems = [...items, { ...item, id: item.id || `${type}_${Date.now()}` }];
    } else if (action === 'update' && itemId) {
      updatedItems = items.map((i: any) => i.id === itemId ? { ...i, ...item } : i);
    } else if (action === 'delete' && itemId) {
      updatedItems = items.filter((i: any) => i.id !== itemId);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action',
      }, { status: 400 });
    }

    const updateData: any = {
      [type]: updatedItems,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    };

    await db.collection(SETTINGS_COLLECTION)
      .doc('hero-settings')
      .set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      data: updatedItems,
    });
  } catch (error) {
    console.error('Error updating hero settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings',
    }, { status: 500 });
  }
}
