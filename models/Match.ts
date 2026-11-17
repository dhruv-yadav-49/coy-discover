import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IMatchDocument extends Document {
  userId: string;
  profileId: Types.ObjectId;
  createdAt: Date;
}

const MatchSchema = new Schema<IMatchDocument>(
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Database-level safeguard: Ensure a mutual match is never recorded more than once
MatchSchema.index({ userId: 1, profileId: 1 }, { unique: true });

export const Match: Model<IMatchDocument> =
  mongoose.models.Match || mongoose.model<IMatchDocument>("Match", MatchSchema);

export default Match;
