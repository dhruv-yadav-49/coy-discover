import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import { Profile } from "../models/Profile";
import { Swipe } from "../models/Swipe";
import { Match } from "../models/Match";
import { mockProfiles } from "./mockProfiles";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/coy_discover";

async function seed() {
  console.log("🌱 Starting Coy Discover database seeding...");
  console.log(`🔌 Connecting to MongoDB at: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB.");

    // Clean up any test/stale profiles not belonging to mockProfiles
    const validNames = mockProfiles.map((p) => p.name);
    const staleResult = await Profile.deleteMany({ name: { $nin: validNames } });
    if (staleResult.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${staleResult.deletedCount} extraneous profiles.`);
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of mockProfiles) {
      const result = await Profile.findOneAndUpdate(
        { name: item.name },
        {
          $set: {
            name: item.name,
            age: item.age,
            photo: item.photo,
            bio: item.bio,
            city: item.city,
            interests: item.interests,
            likedCurrentUser: item.likedCurrentUser,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.isNew) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }

    const totalProfiles = await Profile.countDocuments();
    const incomingLikesCount = await Profile.countDocuments({ likedCurrentUser: true });

    console.log("--------------------------------------------------");
    console.log(`✨ Seeding Complete!`);
    console.log(`📊 Total profiles in database: ${totalProfiles}`);
    console.log(`❤️  Profiles that liked demo user: ${incomingLikesCount} (strictly backend-only)`);
    console.log(`🚫 Swipes & matches preserved. To clear demo history, run with --reset-demo.`);
    console.log("--------------------------------------------------");

    // Optional demo user reset flag: tsx scripts/seed.ts --reset-demo
    if (process.argv.includes("--reset-demo")) {
      const demoUserId = process.env.DEMO_USER_ID || "demo_user_001";
      const deletedSwipes = await Swipe.deleteMany({ userId: demoUserId });
      const deletedMatches = await Match.deleteMany({ userId: demoUserId });
      console.log(`🧹 Demo user (${demoUserId}) history reset:`);
      console.log(`   - Cleared ${deletedSwipes.deletedCount} swipes`);
      console.log(`   - Cleared ${deletedMatches.deletedCount} matches`);
    }
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

seed();
