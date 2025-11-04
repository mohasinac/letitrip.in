

/**
 * POST /api/admin/users/[userId]/create-document
 * Create or update user Firestore document
 * Useful when Firebase Auth user exists but no Firestore document
 */
export async function POST(
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
    const { email, name, phone, role } = body;

    // Create user document using controller
    const userDoc = await userController.createUserDocumentAdmin(
      userId,
      { email, name, phone, role }, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'User document created/updated successfully',
      data: userDoc,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users/[userId]/create-document:', error);

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
      { success: false, error: error.message || 'Failed to create user document' },
      { status: 500 }
    );
  }
}

