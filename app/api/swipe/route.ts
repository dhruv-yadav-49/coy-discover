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

    const { profileId, action } = body;

    if (!profileId || !action) {
      return NextResponse.json(
        { success: false, error: "Both 'profileId' and 'action' are required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await recordSwipe(DEMO_USER_ID, profileId, action);

    return NextResponse.json({
      success: true,
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
