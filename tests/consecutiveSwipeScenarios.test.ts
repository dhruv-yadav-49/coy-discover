import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Profile } from "../models/Profile";
import { Swipe } from "../models/Swipe";
import { Match } from "../models/Match";
import { recordSwipe, getUserMatches, getFeedProfiles } from "../lib/swipeService";

let mongoServer: MongoMemoryServer;
const DEMO_USER_ID = "demo_test_user";

describe("Coy Discover Like/Match Thorough Verification Test Suite", () => {
  beforeAll(async () => {
    process.env.MONGOMS_SYSTEM_BINARY = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Profile.deleteMany({});
    await Swipe.deleteMany({});
    await Match.deleteMany({});
  });

  // Scenario 1: Consecutive Likes on profiles that have NOT liked the user -> NO matches created
  it("Scenario 1: Consecutive Likes on non-mutual profiles -> NO matches created, feed excludes them", async () => {
    const nonMutualProfiles = await Profile.create([
      { name: "NonMutual 1", age: 24, photo: "https://example.com/1.jpg", bio: "Bio 1", city: "Mumbai", likedCurrentUser: false },
      { name: "NonMutual 2", age: 25, photo: "https://example.com/2.jpg", bio: "Bio 2", city: "Delhi", likedCurrentUser: false },
      { name: "NonMutual 3", age: 26, photo: "https://example.com/3.jpg", bio: "Bio 3", city: "Bengaluru", likedCurrentUser: false },
    ]);

    for (const p of nonMutualProfiles) {
      const result = await recordSwipe(DEMO_USER_ID, p._id.toString(), "like");
      expect(result.isMatch).toBe(false);
      expect(result.match).toBeUndefined();
    }

    const matches = await getUserMatches(DEMO_USER_ID);
    expect(matches).toHaveLength(0);

    const remainingFeed = await getFeedProfiles(DEMO_USER_ID);
    expect(remainingFeed).toHaveLength(0);
  });

  // Scenario 2: Consecutive Likes on profiles that have ALREADY liked the user -> EVERY swipe creates a match
  it("Scenario 2: Consecutive Likes on profiles that already liked user -> EVERY swipe creates a match", async () => {
    const mutualProfiles = await Profile.create([
      { name: "Mutual 1", age: 22, photo: "https://example.com/m1.jpg", bio: "Bio m1", city: "Mumbai", likedCurrentUser: true },
      { name: "Mutual 2", age: 23, photo: "https://example.com/m2.jpg", bio: "Bio m2", city: "Pune", likedCurrentUser: true },
      { name: "Mutual 3", age: 24, photo: "https://example.com/m3.jpg", bio: "Bio m3", city: "Goa", likedCurrentUser: true },
    ]);

    for (const p of mutualProfiles) {
      const result = await recordSwipe(DEMO_USER_ID, p._id.toString(), "like");
      expect(result.isMatch).toBe(true);
      expect(result.match).toBeDefined();
      expect(result.match?.profile.name).toBe(p.name);
    }

    const matches = await getUserMatches(DEMO_USER_ID);
    expect(matches).toHaveLength(3);
    const matchNames = matches.map((m) => m.profile.name);
    expect(matchNames).toContain("Mutual 1");
    expect(matchNames).toContain("Mutual 2");
    expect(matchNames).toContain("Mutual 3");
  });

  // Scenario 3: Alternating non-mutual and mutual profiles -> each swipe gets the correct independent result
  it("Scenario 3: Alternating profiles -> each swipe gets the correct independent result regardless of previous action", async () => {
    const profiles = await Profile.create([
      { name: "Alt False 1", age: 20, photo: "https://example.com/af1.jpg", bio: "Bio", city: "Delhi", likedCurrentUser: false },
      { name: "Alt True 1", age: 21, photo: "https://example.com/at1.jpg", bio: "Bio", city: "Jaipur", likedCurrentUser: true },
      { name: "Alt False 2", age: 22, photo: "https://example.com/af2.jpg", bio: "Bio", city: "Kolkata", likedCurrentUser: false },
      { name: "Alt True 2", age: 23, photo: "https://example.com/at2.jpg", bio: "Bio", city: "Chennai", likedCurrentUser: true },
    ]);

    // Swipe 1: False -> isMatch false
    const r1 = await recordSwipe(DEMO_USER_ID, profiles[0]._id.toString(), "like");
    expect(r1.isMatch).toBe(false);

    // Swipe 2: True -> isMatch true
    const r2 = await recordSwipe(DEMO_USER_ID, profiles[1]._id.toString(), "like");
    expect(r2.isMatch).toBe(true);

    // Swipe 3: False -> isMatch false
    const r3 = await recordSwipe(DEMO_USER_ID, profiles[2]._id.toString(), "like");
    expect(r3.isMatch).toBe(false);

    // Swipe 4: True -> isMatch true
    const r4 = await recordSwipe(DEMO_USER_ID, profiles[3]._id.toString(), "like");
    expect(r4.isMatch).toBe(true);

    const matches = await getUserMatches(DEMO_USER_ID);
    expect(matches).toHaveLength(2);
    expect(matches.map((m) => m.profile.name)).toEqual(["Alt True 2", "Alt True 1"]);
  });

  // Scenario 4: Rapid simultaneous requests on the same profile -> only one succeeds, duplicate rejected with 409
  it("Scenario 4: Rapid simultaneous requests on same profile -> duplicate rejected, no duplicate swipe or match", async () => {
    const profile = await Profile.create({
      name: "Rapid Profile",
      age: 25,
      photo: "https://example.com/r.jpg",
      bio: "Rapid bio",
      city: "Hyderabad",
      likedCurrentUser: true,
    });

    const results = await Promise.allSettled([
      recordSwipe(DEMO_USER_ID, profile._id.toString(), "like"),
      recordSwipe(DEMO_USER_ID, profile._id.toString(), "like"),
      recordSwipe(DEMO_USER_ID, profile._id.toString(), "like"),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly one request must succeed and record the swipe
    expect(fulfilled).toHaveLength(1);
    // The other two concurrent attempts must be rejected
    expect(rejected).toHaveLength(2);

    // Exactly one match in database
    const matches = await Match.find({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(matches).toHaveLength(1);

    // Exactly one swipe record in database
    const swipes = await Swipe.find({ userId: DEMO_USER_ID, profileId: profile._id });
    expect(swipes).toHaveLength(1);
  });

  // Scenario 5: Like followed by Pass on different profiles
  it("Scenario 5: Like followed by Pass -> both process correct target profile independently", async () => {
    const p1 = await Profile.create({
      name: "Liked Profile",
      age: 23,
      photo: "https://example.com/p1.jpg",
      bio: "Bio",
      city: "Ahmedabad",
      likedCurrentUser: true,
    });
    const p2 = await Profile.create({
      name: "Passed Profile",
      age: 24,
      photo: "https://example.com/p2.jpg",
      bio: "Bio",
      city: "Surat",
      likedCurrentUser: true, // Has liked user, but user passes!
    });

    const r1 = await recordSwipe(DEMO_USER_ID, p1._id.toString(), "like");
    expect(r1.isMatch).toBe(true);

    const r2 = await recordSwipe(DEMO_USER_ID, p2._id.toString(), "pass");
    expect(r2.isMatch).toBe(false); // User passed, so NO match even though profile liked user!

    const matches = await getUserMatches(DEMO_USER_ID);
    expect(matches).toHaveLength(1);
    expect(matches[0].profile.name).toBe("Liked Profile");
  });

  // Scenario 6: Refresh preserves all swipes and matches
  it("Scenario 6: Refresh preserves all swipes and matches", async () => {
    const p1 = await Profile.create({ name: "User 1", age: 22, photo: "https://example.com/1.jpg", bio: "Bio", city: "Indore", likedCurrentUser: true });
    const p2 = await Profile.create({ name: "User 2", age: 23, photo: "https://example.com/2.jpg", bio: "Bio", city: "Bhopal", likedCurrentUser: false });
    const p3 = await Profile.create({ name: "User 3", age: 24, photo: "https://example.com/3.jpg", bio: "Bio", city: "Nagpur", likedCurrentUser: true });

    await recordSwipe(DEMO_USER_ID, p1._id.toString(), "like");
    await recordSwipe(DEMO_USER_ID, p2._id.toString(), "pass");

    // Simulating page refresh by re-fetching feed and matches
    const feedAfterRefresh = await getFeedProfiles(DEMO_USER_ID);
    expect(feedAfterRefresh).toHaveLength(1);
    expect(feedAfterRefresh[0].name).toBe("User 3"); // p1 and p2 never return

    const matchesAfterRefresh = await getUserMatches(DEMO_USER_ID);
    expect(matchesAfterRefresh).toHaveLength(1);
    expect(matchesAfterRefresh[0].profile.name).toBe("User 1");
  });
});
