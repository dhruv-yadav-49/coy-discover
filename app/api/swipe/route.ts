import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEMO_USER_ID } from "@/lib/constants";
import { recordSwipe, ValidationError } from "@/lib/swipeService";
import { SwipeApiRequest } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: SwipeApiRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request body must be a valid JSON object" },
        { status: 400 }
      );
    }

    const { profileId, action } = body;
    const requestId =
      req.headers.get("x-request-id") ||
      body.requestId ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    if (!profileId || !action) {
      return NextResponse.json(
        { success: false, error: "Both 'profileId' and 'action' are required fields", requestId },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") || DEMO_USER_ID;

    console.log(
      `[BACKEND_SWIPE_START] [${requestId}] userId=${userId}, profileId=${profileId}, action=${action}, at=${new Date(startTime).toISOString()}`
    );

    await connectToDatabase();

    const result = await recordSwipe(userId, profileId, action);
    const duration = Date.now() - startTime;

    console.log(
      `[BACKEND_SWIPE_RESULT] [${requestId}] isMatch=${result.isMatch}, matchCreated=${!!result.match}, duration=${duration}ms`
    );

    return NextResponse.json({
      success: true,
      requestId,
      isMatch: result.isMatch,
      ...(result.match ? { match: result.match } : {}),
    });
  } catch (error: unknown) {
    console.error("POST /api/swipe error:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to record swipe action. Please try again.",
      },
      { status: 500 }
    );
  }
}
