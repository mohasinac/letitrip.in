

/**
 * GET /api/admin/users/[userId]
 * Get specific user by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin authentication
    // Verify authentication using session

    const sessionOrError = await requireAuthentication(request);

    

    // If it's a NextResponse, it's an error response

    if (sessionOrError instanceof NextResponse) {

      return sessionOrError;

    }

    

    const session = sessionOrError;

    // Get user ID from params
    const { userId } = await context.params;

    // Get user using controller
    const targetUser = await userController.getUserByIdAdmin(userId, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    });

    return NextResponse.json(targetUser);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users/[userId]:', error);
if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[userId]
 * Update user details (role, ban status, etc.)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin authentication
    // Verify authentication using session

    const sessionOrError = await requireAuthentication(request);

    

    // If it's a NextResponse, it's an error response

    if (sessionOrError instanceof NextResponse) {

      return sessionOrError;

    }

    

    const session = sessionOrError;

    // Get user ID from params
    const { userId } = await context.params;

    // Parse request body
    const body = await request.json();

    // Update user using controller
    const updatedUser = await userController.updateUserAdmin(userId, body, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users/[userId]:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
