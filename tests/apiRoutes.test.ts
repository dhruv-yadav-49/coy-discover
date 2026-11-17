import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { NextRequest } from "next/server";
import { Profile } from "../models/Profile";
import { Swipe } from "../models/Swipe";
import { Match } from "../models/Match";
import { connectToDatabase } from "../lib/mongodb";
import { GET as getFeedHandler } from "../app/api/feed/route";
import { POST as postSwipeHandler } from "../app/api/swipe/route";
import { GET as getMatchesHandler } from "../app/api/matches/route";
import { POST as postResetHandler } from "../app/api/reset/route";
import { DEMO_USER_ID } from "../lib/constants";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  process.env.MONGOMS_SYSTEM_BINARY = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  await connectToDatabase();
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

describe("API Route Handlers Integration Tests", () => {
  it("GET /api/feed returns sanitized feed without likedCurrentUser", async () => {
    await Profile.create({
      name: "Tanya Sen",
      age: 23,
      photo: "https://example.com/tanya.jpg",
      bio: "Writer and coffee lover",
      city: "Kolkata",
      interests: ["Writing", "Books"],
      likedCurrentUser: true, // Should NEVER be exposed
    });

    const response = await getFeedHandler();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.profiles.length).toBe(1);

    const profile = data.profiles[0];
    expect(profile.name).toBe("Tanya Sen");
    expect(profile.likedCurrentUser).toBeUndefined();
    expect(profile.__v).toBeUndefined();
  });

  it("POST /api/swipe records swipe and handles mutual match", async () => {
    const profile = await Profile.create({
      name: "Aarav Sharma",
      age: 23,
      photo: "https://example.com/aarav.jpg",
      bio: "Developer and traveler",
      city: "Bengaluru",
      interests: ["Coding"],
      likedCurrentUser: true,
    });

    const req = new NextRequest("http://localhost:3000/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile._id.toString(),
        action: "like",
      }),
    });

    const response = await postSwipeHandler(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.isMatch).toBe(true);
    expect(data.match.profile.name).toBe("Aarav Sharma");
  });

  it("POST /api/swipe rejects duplicate swipes with status 409", async () => {
    const profile = await Profile.create({
      name: "Aarav Sharma",
      age: 23,
      photo: "https://example.com/aarav.jpg",
      bio: "Developer",
      city: "Bengaluru",
      interests: ["Coding"],
      likedCurrentUser: false,
    });

    const makeRequest = () =>
      new NextRequest("http://localhost:3000/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile._id.toString(),
          action: "pass",
        }),
      });

    const firstRes = await postSwipeHandler(makeRequest());
    expect(firstRes.status).toBe(200);

    // Duplicate request
    const secondRes = await postSwipeHandler(makeRequest());
    expect(secondRes.status).toBe(409);

    const data = await secondRes.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("already been swiped on");
  });

  it("GET /api/matches returns only confirmed mutual matches", async () => {
    const p1 = await Profile.create({
      name: "Matched User",
      age: 24,
      photo: "https://example.com/matched.jpg",
      bio: "Matched bio",
      city: "Delhi",
      interests: ["Music"],
      likedCurrentUser: true,
    });

    await Match.create({
      userId: DEMO_USER_ID,
      profileId: p1._id,
    });

    const response = await getMatchesHandler();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.matches.length).toBe(1);
    expect(data.matches[0].profile.name).toBe("Matched User");
    expect(data.matches[0].profile.likedCurrentUser).toBeUndefined();
  });

  it("POST /api/reset resets demo swipes and matches", async () => {
    const p1 = await Profile.create({
      name: "User 1",
      age: 24,
      photo: "https://example.com/1.jpg",
      bio: "Bio",
      city: "Delhi",
      interests: ["Music"],
      likedCurrentUser: true,
    });

    await Swipe.create({ userId: DEMO_USER_ID, profileId: p1._id, action: "like" });
    await Match.create({ userId: DEMO_USER_ID, profileId: p1._id });

    expect(await Swipe.countDocuments({ userId: DEMO_USER_ID })).toBe(1);
    expect(await Match.countDocuments({ userId: DEMO_USER_ID })).toBe(1);

    const response = await postResetHandler();
    expect(response.status).toBe(200);

    expect(await Swipe.countDocuments({ userId: DEMO_USER_ID })).toBe(0);
    expect(await Match.countDocuments({ userId: DEMO_USER_ID })).toBe(0);
  });
});
