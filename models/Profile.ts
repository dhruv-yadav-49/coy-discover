import mongoose, { Schema, Model, Document } from "mongoose";

export interface IProfileDocument extends Document {
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
  likedCurrentUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfileDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [100, "Age must be less than 100"],
    },
    photo: {
      type: String,
      required: [true, "Photo URL is required"],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    likedCurrentUser: {
      type: Boolean,
      default: false,
      // BACKEND-ONLY & PRIVACY SAFEGUARD:
      // Setting select: false guarantees this field is excluded by default in all Mongoose queries
      // unless explicitly requested with .select("+likedCurrentUser") in backend matching logic.
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile: Model<IProfileDocument> =
  mongoose.models.Profile || mongoose.model<IProfileDocument>("Profile", ProfileSchema);

export default Profile;
