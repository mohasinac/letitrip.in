/**
 * Admin Support API
 * GET /api/admin/support - List all support tickets with filters
 * POST /api/admin/support - Create support ticket on behalf of user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import { AuthorizationError, ValidationError } from '../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * GET /api/admin/support
 * List all support tickets with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getAdminDb();
    
    // Build query
    let query: any = db.collection('support_tickets').orderBy('createdAt', 'desc');

    // Apply status filter
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply priority filter
    if (priority !== 'all') {
      query = query.where('priority', '==', priority);
    }

    // Get tickets with pagination
    const snapshot = await query.limit(limit).offset((page - 1) * limit).get();

    // Map tickets with proper date handling
    const tickets = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ticketNumber: data.ticketNumber,
        subject: data.subject,
        category: data.category,
        status: data.status,
        priority: data.priority,
        userId: data.userId,
        userName: data.userName || 'Unknown User',
        userEmail: data.userEmail || '',
        sellerId: data.sellerId,
        sellerName: data.sellerName || null,
        messages: data.messages?.length || 0,
        lastReply: data.lastReply?.toDate?.()?.toISOString() || data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    // Get total count for pagination
    const totalSnapshot = await db.collection('support_tickets').count().get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/support:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/support
 * Create a new support ticket (admin creating on behalf of user)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    const body = await request.json();
    const { subject, description, category, priority, userId, userEmail, userName } = body;

    // Validate required fields
    if (!subject || !description || !category) {
      throw new ValidationError('Missing required fields: subject, description, category');
    }

    const db = getAdminDb();

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create ticket
    const ticketRef = await db.collection('support_tickets').add({
      ticketNumber,
      subject,
      category,
      priority: priority || 'medium',
      status: 'open',
      userId: userId || null,
      userName: userName || 'Guest',
      userEmail: userEmail || '',
      sellerId: null,
      sellerName: null,
      messages: [
        {
          id: `msg-${Date.now()}`,
          text: description,
          sender: 'user',
          senderName: userName || 'Guest',
          createdAt: new Date(),
        },
      ],
      assignedTo: null,
      lastReply: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: ticketRef.id,
          ticketNumber,
        },
        message: 'Support ticket created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/admin/support:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}
