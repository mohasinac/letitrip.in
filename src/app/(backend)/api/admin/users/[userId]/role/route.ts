

/**
 * PUT /api/admin/users/[userId]/role
 * Update user role
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
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    // Update role using controller
    const updatedUser = await userController.updateUserRoleAdmin(userId, role, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users/[userId]/role:', error);

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
      { success: false, error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
