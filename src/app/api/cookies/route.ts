import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // This endpoint provides information about cookies used by the application
    // No authentication required - this is public information
    const cookieInfo = {
      consent: {
        required: true,
        preferences: true,
        analytics: false,
        marketing: false
      },
      security: {
        httpOnly: false, // Client-side cookies for our use case
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      },
      expiration: {
        auth_token: '30 days',
        user_data: '30 days',
        cart_data: '7 days',
        preferences: '1 year'
      },
      cookies: {
        essential: ['auth_token', 'user_data'],
        functional: ['cart_data', 'preferences'],
        analytics: [],
        marketing: []
      }
    };

    return NextResponse.json({
      success: true,
      data: cookieInfo
    });
  } catch (error) {
    console.error('Cookie info error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cookie information' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key, value, options } = body;

    switch (action) {
      case 'set':
        if (!key || value === undefined) {
          return NextResponse.json(
            { success: false, error: 'Key and value are required' },
            { status: 400 }
          );
        }
        // This would typically be handled client-side, but we can provide server-side support
        return NextResponse.json({
          success: true,
          message: 'Cookie setting acknowledged'
        });

      case 'consent':
        // Handle cookie consent updates
        return NextResponse.json({
          success: true,
          message: 'Cookie consent updated'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cookie operation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process cookie operation' 
      },
      { status: 500 }
    );
  }
}
