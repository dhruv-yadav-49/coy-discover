import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEMO_USER_ID } from "@/lib/constants";
import { getFeedProfiles, ValidationError } from "@/lib/swipeService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const profiles = await getFeedProfiles(DEMO_USER_ID);

    return NextResponse.json({
      success: true,
      profiles,
    });
  } catch (error: unknown) {
    console.error("GET /api/feed error:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve discovery feed. Please ensure database is connected.",
      },
      { status: 500 }
    );
  }
}
