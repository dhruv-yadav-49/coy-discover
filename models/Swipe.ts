import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ISwipeDocument extends Document {
  userId: string;
  profileId: Types.ObjectId;
  action: "like" | "pass";
  createdAt: Date;
}

const SwipeSchema = new Schema<ISwipeDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Profile ID is required"],
    },
    action: {
      type: String,
      enum: {
        values: ["like", "pass"],
        message: "Action must be either 'like' or 'pass'",
      },
      required: [true, "Action is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Database-level safeguard: Ensure a user can only swipe once on any given profile
SwipeSchema.index({ userId: 1, profileId: 1 }, { unique: true });

export const Swipe: Model<ISwipeDocument> =
  mongoose.models.Swipe || mongoose.model<ISwipeDocument>("Swipe", SwipeSchema);

export default Swipe;
