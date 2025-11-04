

/**
 * GET /api/admin/users/search
 * Search users by email or name
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    // Verify authentication using session

    const sessionOrError = await requireAuthentication(request);

    

    // If it's a NextResponse, it's an error response

    if (sessionOrError instanceof NextResponse) {

      return sessionOrError;

    }

    

    const session = sessionOrError;

    // Get search query
    const searchQuery = request.nextUrl.searchParams.get('q') || '';

    if (!searchQuery) {
      return NextResponse.json(
        { success: false, error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    // Search users using controller
    const results = await userController.searchUsersAdmin(searchQuery, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users/search:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}
