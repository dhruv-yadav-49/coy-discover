export type SwipeAction = "like" | "pass";

export interface IProfile {
  _id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
  likedCurrentUser: boolean; // BACKEND ONLY - NEVER EXPOSED TO CLIENT
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Public profile data safe to send to the client.
 * Strictly guarantees privacy: `likedCurrentUser` is completely stripped.
 */
export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
}

export interface ISwipe {
  _id?: string;
  userId: string;
  profileId: string;
  action: SwipeAction;
  createdAt?: Date;
}

export interface IMatch {
  id: string;
  userId: string;
  profileId: string;
  createdAt: string;
  profile: PublicProfile;
}

export interface FeedApiResponse {
  success: boolean;
  profiles: PublicProfile[];
  error?: string;
}

export interface SwipeApiRequest {
  profileId: string;
  action: SwipeAction;
  requestId?: string;
}

export interface SwipeApiResponse {
  success: boolean;
  isMatch: boolean;
  match?: {
    id: string;
    profile: {
      id?: string;
      name: string;
      age: number;
      photo: string;
      city?: string;
      bio?: string;
    };
  };
  error?: string;
}

export interface MatchesApiResponse {
  success: boolean;
  matches: IMatch[];
  error?: string;
}
