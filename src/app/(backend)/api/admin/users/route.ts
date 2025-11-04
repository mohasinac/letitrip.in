

/**
 * GET /api/admin/users
 * List all users with optional role filter
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      role: (searchParams.get('role') as any) || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    // Get users using controller
    const result = await userController.getAllUsersAdmin(filters, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    });

    return NextResponse.json(result.users);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);
return NextResponse.json(
      { success: false, error: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}
