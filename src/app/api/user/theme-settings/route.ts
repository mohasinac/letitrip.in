import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get user token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get userId from cookie or auth context
    const userIdCookie = cookieStore.get('user-id')?.value;
    if (!userIdCookie) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Fetch from database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();
    
    const userDoc = await db.collection('users').doc(userIdCookie).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const settings = userData?.themeSettings || {
      mode: 'system',
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
    };

    return NextResponse.json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get userId from cookie
    const userIdCookie = cookieStore.get('user-id')?.value;
    if (!userIdCookie) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const body = await request.json();
    const { mode, fontSize, highContrast, reducedMotion } = body;

    // Validate the settings
    const validModes = ['light', 'dark', 'system'];
    const validFontSizes = ['small', 'medium', 'large', 'xl'];

    if (!validModes.includes(mode)) {
      return NextResponse.json({ error: 'Invalid theme mode' }, { status: 400 });
    }

    if (!validFontSizes.includes(fontSize)) {
      return NextResponse.json({ error: 'Invalid font size' }, { status: 400 });
    }

    if (typeof highContrast !== 'boolean' || typeof reducedMotion !== 'boolean') {
      return NextResponse.json({ error: 'Invalid boolean values' }, { status: 400 });
    }

    const settings = {
      mode,
      fontSize,
      highContrast,
      reducedMotion,
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();
    
    await db.collection('users').doc(userIdCookie).set({
      themeSettings: settings,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      message: 'Theme settings saved successfully',
      settings 
    });
  } catch (error) {
    console.error('Error saving theme settings:', error);
    return NextResponse.json(
      { error: 'Failed to save theme settings' },
      { status: 500 }
    );
  }
}
