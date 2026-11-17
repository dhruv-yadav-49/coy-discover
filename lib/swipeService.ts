import mongoose from "mongoose";
import { Profile, IProfileDocument } from "../models/Profile";
import { Swipe } from "../models/Swipe";
import { Match } from "../models/Match";
import { PublicProfile, SwipeAction, IMatch } from "../types";

export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
  }
}

/**
 * Strips sensitive/internal fields from a profile document.
 * Strictly guarantees privacy by omitting `likedCurrentUser`.
 */
export function sanitizeProfile(profile: IProfileDocument | Record<string, unknown>): PublicProfile {
  const doc = "toObject" in profile && typeof profile.toObject === "function" ? profile.toObject() : profile;

  const id = doc._id ? doc._id.toString() : (doc.id as string);

  return {
    id,
    name: doc.name as string,
    age: doc.age as number,
    photo: doc.photo as string,
    bio: doc.bio as string,
    city: doc.city as string,
    interests: Array.isArray(doc.interests) ? (doc.interests as string[]) : [],
  };
}

/**
 * Fetch available profiles that the current user has not swiped on yet.
 * Excludes already swiped (liked or passed) profiles.
 * Never exposes `likedCurrentUser` or internal metadata.
 */
export async function getFeedProfiles(userId: string): Promise<PublicProfile[]> {
  if (!userId || typeof userId !== "string") {
    throw new ValidationError("Valid user ID is required", 400);
  }

  // Get all profile IDs the user has already swiped on
  const swipedRecords = await Swipe.find({ userId }).select("profileId").lean();
  const swipedProfileIds = swipedRecords.map((s) => s.profileId);

  // Fetch profiles excluding swiped ones
  // Explicitly exclude likedCurrentUser and __v from projection for defense-in-depth privacy
  const profiles = await Profile.find({
    _id: { $nin: swipedProfileIds },
  })
    .select("-likedCurrentUser -__v")
    .sort({ createdAt: -1 })
    .lean();

  return profiles.map((p) => sanitizeProfile(p));
}

export interface RecordSwipeResult {
  isMatch: boolean;
  match?: {
    id: string;
    profile: {
      id: string;
      name: string;
      age: number;
      photo: string;
      city: string;
      bio: string;
    };
  };
}

/**
 * Record a swipe action (like or pass) and evaluate mutual matching logic.
 *
 * MATCHING CONDITION:
 * action === 'like' && profile.likedCurrentUser === true
 *
 * Privacy Guarantees:
 * - If action === 'pass', no match is created and incoming like is never revealed.
 * - If action === 'like' but profile hasn't liked user, no match is created and no status is revealed.
 * - Frontend NEVER determines match status; only the backend source of truth does.
 */
export async function recordSwipe(
  userId: string,
  profileId: string,
  action: SwipeAction
): Promise<RecordSwipeResult> {
  // 1. Validate inputs
  if (!userId || typeof userId !== "string") {
    throw new ValidationError("Valid user ID is required", 400);
  }

  if (!profileId || typeof profileId !== "string" || !mongoose.Types.ObjectId.isValid(profileId)) {
    throw new ValidationError("Invalid or missing profile ID", 400);
  }

  if (action !== "like" && action !== "pass") {
    throw new ValidationError("Action must be either 'like' or 'pass'", 400);
  }

  if (userId === profileId) {
    throw new ValidationError("Users cannot swipe on their own profile", 400);
  }

  // 2. Fetch the target profile (including backend-only likedCurrentUser for evaluation)
  const profile = await Profile.findById(profileId);
  if (!profile) {
    throw new ValidationError("Profile not found", 404);
  }

  // 3. Check for existing swipe to prevent duplicate submissions
  const existingSwipe = await Swipe.findOne({
    userId,
    profileId: profile._id,
  });

  if (existingSwipe) {
    throw new ValidationError("This profile has already been swiped on", 409);
  }

  // 4. Save the swipe record in database
  try {
    await Swipe.create({
      userId,
      profileId: profile._id,
      action,
    });
  } catch (err: unknown) {
    // Handle potential concurrent race condition duplicate key error (E11000)
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000) {
      throw new ValidationError("Duplicate swipe detected", 409);
    }
    throw err;
  }

  // 5. Evaluate matching condition:
  // Both parties must like each other (action === "like" AND profile.likedCurrentUser === true)
  const isMutualMatch = action === "like" && profile.likedCurrentUser === true;

  if (isMutualMatch) {
    // 6. Record match in database with upsert to prevent duplicates
    const matchRecord = await Match.findOneAndUpdate(
      { userId, profileId: profile._id },
      { $setOnInsert: { userId, profileId: profile._id, createdAt: new Date() } },
      { upsert: true, new: true }
    );

    return {
      isMatch: true,
      match: {
        id: matchRecord._id.toString(),
        profile: {
          id: profile._id.toString(),
          name: profile.name,
          age: profile.age,
          photo: profile.photo,
          city: profile.city,
          bio: profile.bio,
        },
      },
    };
  }

  // 7. For pass or one-sided like, return isMatch: false without revealing any incoming-like data
  return {
    isMatch: false,
  };
}

/**
 * Fetch all mutual matches for the user.
 * Only returns verified mutual matches stored in the Match collection.
 */
export async function getUserMatches(userId: string): Promise<IMatch[]> {
  if (!userId || typeof userId !== "string") {
    throw new ValidationError("Valid user ID is required", 400);
  }

  const matches = await Match.find({ userId })
    .populate({
      path: "profileId",
      select: "-likedCurrentUser -__v",
    })
    .sort({ createdAt: -1 })
    .lean();

  return matches
    .filter((m) => m.profileId !== null)
    .map((m) => {
      const pDoc = m.profileId as unknown as IProfileDocument;
      return {
        id: m._id.toString(),
        userId: m.userId,
        profileId: pDoc._id ? pDoc._id.toString() : "",
        createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        profile: sanitizeProfile(pDoc),
      };
    });
}
