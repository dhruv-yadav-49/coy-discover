import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Profile } from "../models/Profile";
import { Swipe } from "../models/Swipe";
import { Match } from "../models/Match";
import {
  getFeedProfiles,
  recordSwipe,
  getUserMatches,
  ValidationError,
} from "../lib/swipeService";

let mongod: MongoMemoryServer;
const DEMO_USER_ID = "demo_test_user_001";

beforeAll(async () => {
  // Use existing system mongod binary if available
  process.env.MONGOMS_SYSTEM_BINARY = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  await Profile.deleteMany({});
  await Swipe.deleteMany({});
  await Match.deleteMany({});
});

describe("Coy Discover Business Logic & Privacy Protection", () => {
  // SCENARIO 1
  it("Scenario 1: Current user likes a profile that has not liked them -> swipe saved, no match, excluded from next feed", async () => {
    const profile = await Profile.create({
      name: "Rohan Verma",
      age: 25,
      photo: "https://example.com/rohan.jpg",
      bio: "Amateur chef and designer.",
      city: "Mumbai",
      interests: ["Cooking", "Design"],
      likedCurrentUser: false,
    });

    const swipeResult = await recordSwipe(DEMO_USER_ID, profile._id.toString(), "like");

    // Expected:
    expect(swipeResult.isMatch).toBe(false);
    expect(swipeResult.match).toBeUndefined();

    // Verify swipe is saved in DB
    const savedSwipe = await Swipe.findOne({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(savedSwipe).not.toBeNull();
    expect(savedSwipe?.action).toBe("like");

    // Verify no match was created
    const matchCount = await Match.countDocuments();
    expect(matchCount).toBe(0);

    // Profile must disappear from subsequent feed
    const remainingFeed = await getFeedProfiles(DEMO_USER_ID);
    expect(remainingFeed.find((p) => p.id === profile._id.toString())).toBeUndefined();
  });

  // SCENARIO 2
  it("Scenario 2: Current user likes a profile that has already liked them -> swipe saved, match created, match returned", async () => {
    const profile = await Profile.create({
      name: "Priya Nair",
      age: 22,
      photo: "https://example.com/priya.jpg",
      bio: "Architecture student and coffee lover.",
      city: "Ahmedabad",
      interests: ["Design", "Coffee"],
      likedCurrentUser: true, // Incoming like!
    });

    const swipeResult = await recordSwipe(DEMO_USER_ID, profile._id.toString(), "like");

    // Expected:
    expect(swipeResult.isMatch).toBe(true);
    expect(swipeResult.match).toBeDefined();
    expect(swipeResult.match?.profile.name).toBe("Priya Nair");
    expect(swipeResult.match?.profile.age).toBe(22);

    // Verify swipe saved
    const savedSwipe = await Swipe.findOne({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(savedSwipe?.action).toBe("like");

    // Verify match saved in DB
    const savedMatch = await Match.findOne({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(savedMatch).not.toBeNull();

    // Profile must appear in Matches list
    const userMatches = await getUserMatches(DEMO_USER_ID);
    expect(userMatches.length).toBe(1);
    expect(userMatches[0].profile.name).toBe("Priya Nair");
  });

  // SCENARIO 3
  it("Scenario 3: Current user passes a profile that has liked them -> pass saved, no match, incoming like remains hidden", async () => {
    const profile = await Profile.create({
      name: "Ananya Iyer",
      age: 24,
      photo: "https://example.com/ananya.jpg",
      bio: "Fintech analyst & dancer.",
      city: "Chennai",
      interests: ["Dance", "Finance"],
      likedCurrentUser: true, // Profile liked current user
    });

    const swipeResult = await recordSwipe(DEMO_USER_ID, profile._id.toString(), "pass");

    // Expected:
    expect(swipeResult.isMatch).toBe(false);
    expect(swipeResult.match).toBeUndefined();

    // Verify swipe saved as "pass"
    const savedSwipe = await Swipe.findOne({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(savedSwipe?.action).toBe("pass");

    // Verify NO match was created in DB
    const matchCount = await Match.countDocuments();
    expect(matchCount).toBe(0);

    // Matches list remains empty
    const userMatches = await getUserMatches(DEMO_USER_ID);
    expect(userMatches.length).toBe(0);
  });

  // SCENARIO 4
  it("Scenario 4: User refreshes / queries feed -> previously swiped profiles never return, matches persist", async () => {
    const p1 = await Profile.create({
      name: "Profile 1",
      age: 21,
      photo: "https://example.com/1.jpg",
      bio: "Bio 1",
      city: "Delhi",
      interests: ["Art"],
      likedCurrentUser: true,
    });
    const p2 = await Profile.create({
      name: "Profile 2",
      age: 22,
      photo: "https://example.com/2.jpg",
      bio: "Bio 2",
      city: "Pune",
      interests: ["Music"],
      likedCurrentUser: false,
    });
    const p3 = await Profile.create({
      name: "Profile 3",
      age: 23,
      photo: "https://example.com/3.jpg",
      bio: "Bio 3",
      city: "Jaipur",
      interests: ["Tech"],
      likedCurrentUser: false,
    });

    // Swipe on p1 (like -> match) and p2 (pass)
    await recordSwipe(DEMO_USER_ID, p1._id.toString(), "like");
    await recordSwipe(DEMO_USER_ID, p2._id.toString(), "pass");

    // Simulate page refresh: query feed again from DB
    const refreshedFeed = await getFeedProfiles(DEMO_USER_ID);

    expect(refreshedFeed.length).toBe(1);
    expect(refreshedFeed[0].name).toBe("Profile 3");

    // Check matches persist across refresh
    const refreshedMatches = await getUserMatches(DEMO_USER_ID);
    expect(refreshedMatches.length).toBe(1);
    expect(refhedMatches_profileName(refreshedMatches)).toBe("Profile 1");

    function refhedMatches_profileName(matches: typeof refreshedMatches) {
      return matches[0].profile.name;
    }
  });

  // SCENARIO 5
  it("Scenario 5: User swipes the same profile twice -> duplicate swipe rejected, no duplicate match", async () => {
    const profile = await Profile.create({
      name: "Sneha Mukherjee",
      age: 25,
      photo: "https://example.com/sneha.jpg",
      bio: "UX researcher.",
      city: "Gurugram",
      interests: ["Design"],
      likedCurrentUser: true,
    });

    // First swipe
    const firstSwipe = await recordSwipe(DEMO_USER_ID, profile._id.toString(), "like");
    expect(firstSwipe.isMatch).toBe(true);

    // Second duplicate swipe must throw 409 Conflict
    await expect(
      recordSwipe(DEMO_USER_ID, profile._id.toString(), "like")
    ).rejects.toThrowError(ValidationError);

    // Verify only ONE swipe and ONE match exist in DB
    const swipeCount = await Swipe.countDocuments({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(swipeCount).toBe(1);

    const matchCount = await Match.countDocuments({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(matchCount).toBe(1);
  });

  // SCENARIO 6
  it("Scenario 6: All profiles have been swiped -> feed returns empty array", async () => {
    const p1 = await Profile.create({
      name: "User Alpha",
      age: 20,
      photo: "https://example.com/a.jpg",
      bio: "Bio",
      city: "Goa",
      interests: ["Sun"],
      likedCurrentUser: false,
    });

    await recordSwipe(DEMO_USER_ID, p1._id.toString(), "pass");

    const feed = await getFeedProfiles(DEMO_USER_ID);
    expect(feed).toEqual([]);
    expect(feed.length).toBe(0);
  });

  // SCENARIO 7
  it("Scenario 7: Privacy check: GET feed never reveals likedCurrentUser or internal DB properties", async () => {
    await Profile.create({
      name: "Secret Admirer",
      age: 24,
      photo: "https://example.com/secret.jpg",
      bio: "Someone who liked you first.",
      city: "Kolkata",
      interests: ["Books"],
      likedCurrentUser: true, // SECRET!
    });

    const feed = await getFeedProfiles(DEMO_USER_ID);

    expect(feed.length).toBe(1);
    const item = feed[0];

    // Must NOT contain likedCurrentUser
    expect((item as Record<string, unknown>).likedCurrentUser).toBeUndefined();
    // Must NOT contain internal mongo fields
    expect((item as Record<string, unknown>).__v).toBeUndefined();
    // Must contain safe public fields
    expect(item.name).toBe("Secret Admirer");
    expect(item.id).toBeDefined();
    expect(item.photo).toBe("https://example.com/secret.jpg");
  });

  // SCENARIO 8: Input Validations
  it("Scenario 8: Input validations reject malformed actions, invalid ObjectIds, or self-swiping", async () => {
    // Invalid action
    await expect(
      recordSwipe(DEMO_USER_ID, new mongoose.Types.ObjectId().toString(), "superlike" as any)
    ).rejects.toThrow("Action must be either 'like' or 'pass'");

    // Invalid ObjectId
    await expect(
      recordSwipe(DEMO_USER_ID, "not-a-valid-id", "like")
    ).rejects.toThrow("Invalid or missing profile ID");

    // Non-existent profile
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await expect(
      recordSwipe(DEMO_USER_ID, nonExistentId, "like")
    ).rejects.toThrow("Profile not found");

    // Self-swiping
    await expect(
      recordSwipe(DEMO_USER_ID, DEMO_USER_ID, "like")
    ).rejects.toThrow("Invalid or missing profile ID");
  });
});
