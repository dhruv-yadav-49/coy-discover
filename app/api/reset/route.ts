import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEMO_USER_ID } from "@/lib/constants";
import { Swipe } from "@/models/Swipe";
import { Match } from "@/models/Match";
import { Profile } from "@/models/Profile";
import { mockProfiles } from "@/scripts/mockProfiles";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();

    // Reset swipes and matches for the demo user
    const deletedSwipes = await Swipe.deleteMany({ userId: DEMO_USER_ID });
    const deletedMatches = await Match.deleteMany({ userId: DEMO_USER_ID });

    // Ensure profiles exist in DB
    const profileCount = await Profile.countDocuments();
    let seededCount = 0;
    if (profileCount === 0) {
      for (const p of mockProfiles) {
        await Profile.create(p);
        seededCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Demo user session reset successfully.",
      cleared: {
        swipes: deletedSwipes.deletedCount,
        matches: deletedMatches.deletedCount,
      },
      seededProfiles: seededCount,
    });
  } catch (error) {
    console.error("POST /api/reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset demo state." },
      { status: 500 }
    );
  }
}
