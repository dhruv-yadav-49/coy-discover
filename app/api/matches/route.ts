import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEMO_USER_ID } from "@/lib/constants";
import { getUserMatches, ValidationError } from "@/lib/swipeService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || DEMO_USER_ID;

    await connectToDatabase();

    const matches = await getUserMatches(userId);

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error: unknown) {
    console.error("GET /api/matches error:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve matches. Please ensure database is connected.",
      },
      { status: 500 }
    );
  }
}
