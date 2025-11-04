

/**
 * PUT /api/admin/users/[userId]/ban
 * Ban or unban a user
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
    const { isBanned } = body;

    if (typeof isBanned !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isBanned must be a boolean value' },
        { status: 400 }
      );
    }

    // Update ban status using controller
    const updatedUser = await userController.banUserAdmin(userId, isBanned, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    });

    return NextResponse.json({
      success: true,
      message: isBanned ? 'User has been banned' : 'User has been unbanned',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users/[userId]/ban:', error);

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
      { success: false, error: error.message || 'Failed to update user ban status' },
      { status: 500 }
    );
  }
}

