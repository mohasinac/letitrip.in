import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad Request", errors?: any) {
    super(400, message, errors);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Not Found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message: string = "Too Many Requests", retryAfter?: number) {
    super(429, message, { retryAfter });
    this.name = "TooManyRequestsError";
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = "Internal Server Error") {
    super(500, message);
    this.name = "InternalServerError";
  }
}

export function handleApiError(error: any): NextResponse {
  if (error instanceof ApiError) {
    const response: any = {
      error: error.message,
    };

    if (error.errors) {
      response.details = error.errors;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Unknown error
  console.error("Unhandled error:", error);
  return NextResponse.json(
    {
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message || "Unknown error",
    },
    { status: 500 },
  );
}
