# Coy Discover – Full Stack Profile Discovery Web Application

A modern, mobile-first swipe-based profile discovery web application inspired by Tinder and Bumble, built as an SDE Intern technical assignment. Designed with an unwavering focus on **privacy protection**, clean full-stack architecture, persistent MongoDB storage, smooth Framer Motion drag gestures, and robust business logic.

---

## 🌟 Live Demo & Architecture Highlights

- **Privacy-First Matching:** Incoming likes are strictly confidential and stored backend-only. An individual who likes the current user is **never** revealed unless both users mutually like each other.
- **Persistent Swipes & Matches:** Complete database persistence via MongoDB. A profile that has been liked or passed will never reappear in the user's feed across page reloads or new sessions.
- **Mobile-First Gestures:** Framer Motion-powered touch & drag swipe gestures (swipe right to Like, swipe left to Pass) with dynamic stamp overlays and deck animations.
- **"It's a Match!" Screen:** Celebratory match modal with confetti, dual avatar displays, and congratulatory messaging triggered only upon verified mutual likes.
- **Mutual Matches View:** Dedicated section within Discover rendering confirmed matches fetched from the backend.
- **Caught-Up Empty State:** Beautiful zero-state with a one-click demo reset feature to facilitate repeated evaluation without terminal commands.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | **Next.js 14** (App Router) | Server-side rendering, Route Handlers, optimized asset bundling |
| **Language** | **TypeScript** | Strict type safety across client, server, and database schemas |
| **Styling** | **Tailwind CSS** | Modern color palette: deep violet, slate neutrals, emerald & rose accents |
| **Animations** | **Framer Motion** & **Canvas Confetti** | Physics-based drag-and-drop swipe gestures and match celebrations |
| **Icons** | **Lucide React** | Feather-light SVG icons |
| **ODM / DB** | **Mongoose 8** / **MongoDB** | Schemas, compound unique indexing, and relations |
| **Testing** | **Vitest** + **MongoDB Memory Server** | 13 automated tests covering all 8 business scenarios & API endpoints |

---

## 📐 Architecture Overview

```
coy-discover/
├── app/
│   ├── layout.tsx              # Root HTML shell, fonts, metadata
│   ├── page.tsx                # Home tab (spec-compliant simple blank placeholder)
│   ├── globals.css             # Tailwind directives and touch utilities
│   │
│   ├── discover/
│   │   └── page.tsx            # Main Discover view (swipe deck, tabs, match modal)
│   │
│   └── api/
│       ├── feed/
│       │   └── route.ts        # GET /api/feed (excludes swiped, strips likedCurrentUser)
│       ├── swipe/
│       │   └── route.ts        # POST /api/swipe (records action, evaluates mutual match)
│       ├── matches/
│       │   └── route.ts        # GET /api/matches (returns mutual matches with profiles)
│       └── reset/
│           └── route.ts        # POST /api/reset (clears demo swipes/matches for testing)
│
├── components/
│   ├── Navbar.tsx              # Responsive navigation header with active tab and match count
│   ├── ProfileCard.tsx         # Framer Motion drag card, photo, bio, interest chips, stamps
│   ├── SwipeButtons.tsx        # Desktop & mobile Pass (X) and Like (Heart) action buttons
│   ├── MatchModal.tsx          # "IT'S A MATCH!" modal with dual avatars & confetti
│   ├── MatchesList.tsx         # Responsive grid of mutual matches
│   ├── EmptyState.tsx          # "You're all caught up!" empty state with Reset button
│   └── LoadingState.tsx        # Skeleton pulse loader
│
├── lib/
│   ├── mongodb.ts              # Cached Mongoose connection helper for Next.js hot-reloads
│   ├── constants.ts            # Fixed demo user constants & branding configuration
│   └── swipeService.ts         # Pure business logic: feed retrieval, swipe validation, matching
│
├── models/
│   ├── Profile.ts              # Profile schema with backend-only likedCurrentUser
│   ├── Swipe.ts                # Swipe schema with compound unique index (userId + profileId)
│   └── Match.ts                # Match schema with compound unique index (userId + profileId)
│
├── scripts/
│   ├── mockProfiles.ts         # 32 diverse, realistic mock profiles with photos and interests
│   └── seed.ts                 # Idempotent database seeder with upsert logic
│
├── tests/
│   ├── swipeService.test.ts    # 8 critical business logic & privacy scenario tests
│   └── apiRoutes.test.ts       # 5 API route integration tests
│
├── .env.example                # Template for environment variables
├── .env.local                  # Local development environment configuration
├── tsconfig.json               # TypeScript compiler configuration
├── tailwind.config.ts          # Tailwind theme tokens and extensions
└── package.json
```

---

## 🗄️ Database Design

### 1. `Profile` Collection
Stores discovery candidate profiles.
- `name`: `String` (Required, trimmed)
- `age`: `Number` (Required, 18–100)
- `photo`: `String` (Required, high-resolution portrait URL)
- `bio`: `String` (Required, max 500 chars)
- `city`: `String` (Required, college or city)
- `interests`: `[String]` (Badges)
- `likedCurrentUser`: `Boolean` (**BACKEND ONLY** — strictly excluded from all public projections)
- `createdAt` / `updatedAt`: `Timestamps`

### 2. `Swipe` Collection
Records user swipe interactions.
- `userId`: `String` (Demo user identifier)
- `profileId`: `ObjectId` (Ref to `Profile`)
- `action`: `String` (`"like"` or `"pass"`)
- `createdAt`: `Date`
- **Unique Compound Index:** `{ userId: 1, profileId: 1 }` prevents duplicate swipes at the database engine level.

### 3. `Match` Collection
Stores confirmed mutual matches.
- `userId`: `String`
- `profileId`: `ObjectId` (Ref to `Profile`)
- `createdAt`: `Date`
- **Unique Compound Index:** `{ userId: 1, profileId: 1 }` guarantees idempotent match recording.

---

## 🔒 Privacy & Business Logic Implementation

### Core Matching Rule
A mutual match is generated if and only if:
$$\text{action} == \text{"like"} \quad \land \quad \text{profile.likedCurrentUser} == \text{true}$$

### Privacy Safeguards
1. **Frontend Ignorance:** The frontend has zero knowledge of `likedCurrentUser`. It cannot inspect network payloads, Redux/state variables, or DOM attributes to uncover who likes the user.
2. **API Projection Stripping:** In `GET /api/feed`, `likedCurrentUser` and internal fields (`__v`) are explicitly stripped using Mongoose query exclusion (`.select("-likedCurrentUser -__v")`) and sanitization functions (`sanitizeProfile`).
3. **One-Sided Pass Preservation:** When the demo user passes on a profile that has liked them, the pass is recorded in the database, `isMatch: false` is returned, and the profile is silently removed without exposing their admiration.
4. **Duplicate Safeguards:** Concurrent or repeated swipe requests on the same profile return `HTTP 409 Conflict` and are rejected by MongoDB unique compound indexes.

---

## 🌐 API Reference

### 1. `GET /api/feed`
Retrieves profiles that the current user has not yet swiped on.
- **Privacy:** `likedCurrentUser` is completely stripped.
- **Response `200 OK`:**
```json
{
  "success": true,
  "profiles": [
    {
      "id": "6afc989594a8684690b030ce",
      "name": "Priya Nair",
      "age": 22,
      "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "bio": "Architecture student at CEPT. Coffee enthusiast, watercolor painter, and lover of heritage walks.",
      "city": "Ahmedabad",
      "interests": ["Design", "Coffee", "Art", "Architecture"]
    }
  ]
}
```

### 2. `POST /api/swipe`
Records a `like` or `pass` action and computes mutual match status.
- **Request:**
```json
{
  "profileId": "6afc989594a8684690b030ce",
  "action": "like"
}
```
- **Response (Mutual Match) `200 OK`:**
```json
{
  "success": true,
  "isMatch": true,
  "match": {
    "id": "6afc999694a8684690b030ed",
    "profile": {
      "id": "6afc989594a8684690b030ce",
      "name": "Priya Nair",
      "age": 22,
      "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?...",
      "city": "Ahmedabad",
      "bio": "Architecture student at CEPT."
    }
  }
}
```
- **Response (No Match / Pass) `200 OK`:**
```json
{
  "success": true,
  "isMatch": false
}
```
- **Response (Duplicate Swipe) `409 Conflict`:**
```json
{
  "success": false,
  "error": "This profile has already been swiped on"
}
```

### 3. `GET /api/matches`
Retrieves all mutual matches belonging to the current demo user.
- **Response `200 OK`:**
```json
{
  "success": true,
  "matches": [
    {
      "id": "6afc999694a8684690b030ed",
      "userId": "demo_user_001",
      "profileId": "6afc989594a8684690b030ce",
      "createdAt": "2026-11-17T18:14:46.338Z",
      "profile": {
        "id": "6afc989594a8684690b030ce",
        "name": "Priya Nair",
        "age": 22,
        "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?...",
        "city": "Ahmedabad",
        "bio": "Architecture student at CEPT.",
        "interests": ["Design", "Coffee", "Art", "Architecture"]
      }
    }
  ]
}
```

### 4. `POST /api/reset`
Utility endpoint to reset the demo user's swipes and matches without terminal access, making evaluation seamless.

---

## 🚀 Setup & Local Execution

### Prerequisites
- **Node.js**: v18.18+ or v20+ (tested on v22.18.0)
- **MongoDB**: Local MongoDB instance (`mongod`) or MongoDB Atlas connection string

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/coy-discover.git
cd coy-discover
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Ensure `MONGODB_URI` points to your running MongoDB instance:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/coy_discover
DEMO_USER_ID=demo_user_001
```

### Step 4: Seed Database
Seeds 32 unique, high-quality profiles across major cities and colleges with diverse interests:
```bash
npm run seed
```
*(To reset demo swipes while seeding, add `--reset-demo`: `npm run seed -- --reset-demo`)*

### Step 5: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Home Tab (`/`)**: Spec-mandated minimal placeholder.
- **Discover Tab (`/discover`)**: Interactive discovery card stack with touch & button swiping.
- **Matches Tab (`/discover#matches`)**: Mutual matches view.

---

## 🧪 Automated Testing

Run the Vitest test suite covering all critical business rules and integration scenarios:
```bash
npm test
```

### Test Coverage Summary:
- **Scenario 1:** Like profile without incoming like $\rightarrow$ swipe saved, no match, excluded from feed.
- **Scenario 2:** Like profile with incoming like $\rightarrow$ swipe saved, match created in DB, returned in matches.
- **Scenario 3:** Pass profile with incoming like $\rightarrow$ pass saved, no match, incoming like remains secret.
- **Scenario 4:** Persistence across refresh $\rightarrow$ swiped profiles never return, matches remain intact.
- **Scenario 5:** Duplicate swipe rejection $\rightarrow$ returns 409, duplicate DB writes blocked.
- **Scenario 6:** Feed exhaustion $\rightarrow$ returns clean empty array.
- **Scenario 7:** Privacy audit $\rightarrow$ verifies `likedCurrentUser` and `__v` never leak in GET `/api/feed`.
- **Scenario 8:** Input validation $\rightarrow$ validates ObjectId format, enum actions (`like`/`pass`), and self-swipes.
- **Scenario 9–13:** API Route Handlers integration tests (`GET /api/feed`, `POST /api/swipe`, `GET /api/matches`, `POST /api/reset`).

---

## 📱 Navigation & UI/UX

1. **Home Tab (`/`)**: Intentionally kept as a clean, minimal placeholder as specified in the assignment prompt.
2. **Discover Tab (`/discover`)**:
   - Touch drag gestures: Drag right to LIKE (emerald stamp), drag left to PASS (rose stamp).
   - Desktop action buttons: Pass (X) and Like (Heart) with subtle hover and active scaling.
   - 3D Card Stack: Peeking card underneath that smoothly scales into view upon card exit.
3. **"It's a Match!" Celebration**:
   - Appears exclusively upon backend-confirmed mutual like.
   - Plays colorful celebratory confetti via `canvas-confetti`.
   - Side-by-side circular avatars with animated heart connector badge.
   - Quick navigation into the Matches list or continue swiping.
4. **Matches Section**:
   - Grid layout with match timestamps, profile photos, age, city, bio, and interest tags.
   - Proper empty state: *"No matches yet. Keep discovering and you might find someone special."*
5. **Empty State**:
   - When all profiles are swiped: *"You're all caught up!"*
   - Includes a **"Reset Demo Feed"** button so evaluators can re-test immediately without running scripts.

---

## ☁️ Deployment Instructions (Vercel + MongoDB Atlas)

1. **Database:**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - In Network Access, whitelist `0.0.0.0/0` (Allow Access from Anywhere).
   - Copy your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/coy_discover?retryWrites=true&w=majority`.
2. **Seed Remote Database:**
   ```bash
   MONGODB_URI="your-atlas-uri" npm run seed
   ```
3. **Deploy to Vercel:**
   - Push repository to GitHub.
   - Import the repository on [Vercel](https://vercel.com).
   - Under **Environment Variables**, set:
     - `MONGODB_URI`: `your-atlas-uri`
     - `DEMO_USER_ID`: `demo_user_001`
   - Click **Deploy**.

---

## 📌 Known Limitations & Assumptions

- **Demo Identity:** As explicitly mandated by the assignment guidelines, authentication is assumed with a fixed demo user identity (`demo_user_001`), bypassing third-party OAuth/JWT overhead.
- **Chat & Messaging:** Explicitly out of scope per assignment prompt; matches view provides profile details without instant messaging.
