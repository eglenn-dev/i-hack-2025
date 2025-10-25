# AI Interview Practice MVP - Technical Specification

## Project Overview

Build a voice-based AI interview practice application where users can conduct mock interviews with an AI interviewer. The system will provide real-time voice interaction, save conversation history, and grade interview performance.

## Technology Stack

-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **Database**: MongoDB (with native driver and connection pooling)
-   **Authentication**: JWT-based session management with email OTP
-   **Email Service**: Resend
-   **AI Services**: Google Gemini API (text generation and text-to-speech)
-   **Audio**: Web Audio API for recording, MediaRecorder API
-   **Deployment**: Vercel (recommended)

## Project Structure

```
/app
  /(auth)
    /login
      page.tsx
    /verify
      page.tsx
  /(dashboard)
    /dashboard
      page.tsx
    /interview
      /[id]
        page.tsx
    /history
      page.tsx
      /[id]
        page.tsx
  /api
    /auth
      /send-otp
        route.ts
      /verify-otp
        route.ts
      /logout
        route.ts
    /interview
      /create
        route.ts
      /[id]
        /message
          route.ts
        /complete
          route.ts
    /gemini
      /generate-question
        route.ts
      /text-to-speech
        route.ts
  /layout.tsx
  /page.tsx

/components
  /ui (shadcn components)
  /auth
    LoginForm.tsx
    OTPVerification.tsx
  /interview
    InterviewSetup.tsx
    InterviewSession.tsx
    AudioRecorder.tsx
    AudioPlayer.tsx
  /dashboard
    InterviewHistory.tsx
    PerformanceCard.tsx

/lib
  /db
    client.ts (MongoDB connection pooling)
    collections.ts (Collection type definitions)
  /auth
    session.ts (JWT session management)
  /types.ts
  /gemini.ts
  /resend.ts
  /audio-utils.ts

/middleware.ts (Session refresh middleware)
```

## Database Configuration

### MongoDB Connection Setup

```typescript
// /lib/db/client.ts
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_CONNECTION_STRING;
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 60,
    minPoolSize: 1,
};

if (!uri) {
    throw new Error(
        "Please add your Mongo URI to .env.local or environment variables"
    );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
```

### MongoDB Collections Schema

```typescript
// /lib/db/collections.ts
import { ObjectId } from "mongodb";

export interface UserDocument {
    _id?: ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OTPDocument {
    _id?: ObjectId;
    email: string;
    code: string;
    expiresAt: Date;
    createdAt: Date;
    verified: boolean;
}

export interface InterviewDocument {
    _id?: ObjectId;
    userId: string; // User email or _id string
    jobTitle: string;
    company: string;
    location: string;
    description?: string;
    maxQuestions: number;
    status: "in_progress" | "completed";
    grade?: number;
    feedback?: string;
    createdAt: Date;
    completedAt?: Date;
}

export interface MessageDocument {
    _id?: ObjectId;
    interviewId: string; // Interview _id string
    role: "assistant" | "user";
    content: string;
    audioUrl?: string;
    timestamp: Date;
}

// Collection names
export const COLLECTIONS = {
    USERS: "users",
    OTPS: "otps",
    INTERVIEWS: "interviews",
    MESSAGES: "messages",
} as const;

// Database helper functions
export async function getDB() {
    const client = await clientPromise;
    return client.db("ai_interview_practice");
}

// Index creation (run once on app initialization)
export async function createIndexes() {
    const db = await getDB();

    // User indexes
    await db
        .collection(COLLECTIONS.USERS)
        .createIndex({ email: 1 }, { unique: true });

    // OTP indexes
    await db.collection(COLLECTIONS.OTPS).createIndex({ email: 1 });
    await db
        .collection(COLLECTIONS.OTPS)
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Interview indexes
    await db.collection(COLLECTIONS.INTERVIEWS).createIndex({ userId: 1 });
    await db.collection(COLLECTIONS.INTERVIEWS).createIndex({ createdAt: -1 });

    // Message indexes
    await db.collection(COLLECTIONS.MESSAGES).createIndex({ interviewId: 1 });
    await db.collection(COLLECTIONS.MESSAGES).createIndex({ timestamp: 1 });
}
```

## Core Features & Implementation

### 1. Authentication System

#### JWT Session Management

```typescript
// /lib/types.ts
export interface UserSession {
    userId: string;
    email: string;
    name: string;
    profilePictureUrl: string;
    role: string;
    expires: Date;
}

// /lib/auth/session.ts
import { SignJWT, jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { UserSession } from "@/lib/types";

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: UserSession) {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(payload.expires)
        .sign(key);
}

export async function decrypt(input: string): Promise<UserSession | null> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload as UserSession;
    } catch (error) {
        if (error instanceof JWTExpired) {
            console.error("Error: Token has expired");
            return null;
        } else {
            console.error("Error: Token verification failed");
            return null;
        }
    }
}

export async function getSession() {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function createSession(email: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const sessionData: UserSession = {
        userId: email, // Using email as userId for simplicity
        email: email,
        name: email.split("@")[0], // Extract name from email for MVP
        profilePictureUrl: "", // Empty for MVP
        role: "user",
        expires: expires,
    };

    const sessionToken = await encrypt(sessionData);

    (await cookies()).set({
        name: "session",
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expires,
    });
}

export async function deleteSession() {
    (await cookies()).delete("session");
}
```

#### Middleware for Session Refresh

```typescript
// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt, UserSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;

    // Public routes that don't need authentication
    const isPublicRoute =
        request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/verify") ||
        request.nextUrl.pathname.startsWith("/api/auth/send-otp") ||
        request.nextUrl.pathname.startsWith("/api/auth/verify-otp");

    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session) {
        const parsed = await decrypt(session);

        if (!parsed && !isPublicRoute) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (parsed) {
            // Refresh session if it expires in less than 2 days
            const twoDaysFromNow = new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000
            );
            if (new Date(parsed.expires) < twoDaysFromNow) {
                parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                const res = NextResponse.next();
                res.cookies.set({
                    name: "session",
                    value: await encrypt(parsed),
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    expires: parsed.expires,
                });
                return res;
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

#### Email OTP Flow Implementation

```typescript
// /app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDB, COLLECTIONS } from "@/lib/db/collections";
import { OTPDocument } from "@/lib/db/collections";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in MongoDB with 10-minute expiration
        const db = await getDB();
        const otpDoc: OTPDocument = {
            email,
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            createdAt: new Date(),
            verified: false,
        };

        await db.collection<OTPDocument>(COLLECTIONS.OTPS).insertOne(otpDoc);

        // Send OTP via email
        await resend.emails.send({
            from: "AI Interview Practice <noreply@yourdomain.com>",
            to: email,
            subject: "Your Login Code",
            html: `
                <h2>Your verification code</h2>
                <p>Your code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json(
            { error: "Failed to send OTP" },
            { status: 500 }
        );
    }
}

// /app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDB, COLLECTIONS } from "@/lib/db/collections";
import { createSession } from "@/lib/auth/session";
import { UserDocument, OTPDocument } from "@/lib/db/collections";

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const db = await getDB();

        // Find and validate OTP
        const otpDoc = await db
            .collection<OTPDocument>(COLLECTIONS.OTPS)
            .findOne({
                email,
                code: otp,
                verified: false,
                expiresAt: { $gt: new Date() },
            });

        if (!otpDoc) {
            return NextResponse.json(
                { error: "Invalid or expired OTP" },
                { status: 400 }
            );
        }

        // Mark OTP as verified
        await db
            .collection<OTPDocument>(COLLECTIONS.OTPS)
            .updateOne({ _id: otpDoc._id }, { $set: { verified: true } });

        // Create or update user
        await db.collection<UserDocument>(COLLECTIONS.USERS).updateOne(
            { email },
            {
                $set: {
                    email,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );

        // Create JWT session
        await createSession(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}

// /app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export async function POST() {
    await deleteSession();
    return NextResponse.json({ success: true });
}
```

### 2. Interview Setup Form

#### Form Fields

-   **Job Title** (required, text input)
-   **Company** (required, text input)
-   **Location** (required, text input)
-   **Job Description** (optional, textarea)
-   **Max Questions** (required, number input, range: 3-15, default: 5)

#### Implementation

```typescript
// /components/interview/InterviewSetup.tsx
// Use react-hook-form for form handling
// Validation with zod
// On submit: Create interview record, redirect to interview page
```

### 3. Live Interview Session

#### Audio Recording & Playback

```typescript
// /components/interview/AudioRecorder.tsx
interface AudioRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    isRecording: boolean;
    onToggleRecording: () => void;
}

// Key features:
// - Use MediaRecorder API
// - Visual feedback during recording (waveform or simple indicator)
// - Auto-stop on silence detection (3 seconds)
// - Convert audio to base64 for transmission
```

#### Interview Flow Logic

```typescript
// /components/interview/InterviewSession.tsx
// State management:
// - currentQuestion: string
// - nextQuestionAudio: ArrayBuffer | null (preloaded)
// - isUserSpeaking: boolean
// - questionCount: number
// - messages: Message[]

// Flow:
// 1. AI asks first question (play audio)
// 2. User responds (record audio)
// 3. While user speaks, preload next question audio
// 4. Send user response to API
// 5. Play next question immediately after user stops
// 6. Repeat until maxQuestions reached
// 7. Navigate to completion/review page
```

#### Voice Activity Detection

```typescript
// /lib/audio-utils.ts
// Implement simple VAD using Web Audio API
// Analyze audio levels to detect speech start/end
// 3-second silence threshold for auto-stop
```

### 4. API Endpoints

#### Gemini Integration

```typescript
// /app/api/gemini/generate-question/route.ts
interface GenerateQuestionRequest {
    interviewId: string;
    jobTitle: string;
    company: string;
    description?: string;
    previousMessages: Message[];
    questionNumber: number;
    maxQuestions: number;
}

// Prompt engineering:
const systemPrompt = `
You are an experienced technical interviewer conducting a mock interview.
Job: {jobTitle} at {company}
Description: {description}
Current question: {questionNumber} of {maxQuestions}

Guidelines:
- Ask relevant behavioral and technical questions
- Vary question difficulty
- Follow up on previous answers when appropriate
- Keep questions concise (1-2 sentences)
- End with "Thank you for the interview" on last question
`;

// /app/api/gemini/text-to-speech/route.ts
// Use Gemini's text-to-speech API
// Return audio as base64 or URL
// Cache frequently used phrases
```

#### Interview Management

```typescript
// /app/api/interview/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS, InterviewDocument } from "@/lib/db/collections";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { jobTitle, company, location, description, maxQuestions } =
            await request.json();

        // Create interview document
        const db = await getDB();
        const interview: InterviewDocument = {
            userId: session.email,
            jobTitle,
            company,
            location,
            description,
            maxQuestions,
            status: "in_progress",
            createdAt: new Date(),
        };

        const result = await db
            .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
            .insertOne(interview);

        // Generate first question using Gemini
        // Return interview ID and first question audio

        return NextResponse.json({
            interviewId: result.insertedId.toString(),
            // firstQuestion: { text, audioUrl }
        });
    } catch (error) {
        console.error("Create interview error:", error);
        return NextResponse.json(
            { error: "Failed to create interview" },
            { status: 500 }
        );
    }
}

// /app/api/interview/[id]/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS, MessageDocument } from "@/lib/db/collections";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { content, audioUrl } = await request.json();
        const db = await getDB();

        // Save user's response
        const userMessage: MessageDocument = {
            interviewId: params.id,
            role: "user",
            content,
            audioUrl,
            timestamp: new Date(),
        };

        await db
            .collection<MessageDocument>(COLLECTIONS.MESSAGES)
            .insertOne(userMessage);

        // Get interview details and previous messages
        const interview = await db
            .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
            .findOne({ _id: new ObjectId(params.id) });

        const messages = await db
            .collection<MessageDocument>(COLLECTIONS.MESSAGES)
            .find({ interviewId: params.id })
            .sort({ timestamp: 1 })
            .toArray();

        // Generate next question using Gemini
        // Save AI's response
        // Return next question or completion status

        return NextResponse.json({
            // nextQuestion: { text, audioUrl } or
            // completed: true
        });
    } catch (error) {
        console.error("Message error:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}

// /app/api/interview/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth/session";
import {
    getDB,
    COLLECTIONS,
    InterviewDocument,
    MessageDocument,
} from "@/lib/db/collections";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const db = await getDB();

        // Get all messages for grading
        const messages = await db
            .collection<MessageDocument>(COLLECTIONS.MESSAGES)
            .find({ interviewId: params.id })
            .sort({ timestamp: 1 })
            .toArray();

        // Generate grade and feedback using Gemini
        const grade = 85; // Example - implement actual grading
        const feedback = "..."; // Detailed feedback

        // Update interview with completion data
        await db
            .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
            .updateOne(
                { _id: new ObjectId(params.id) },
                {
                    $set: {
                        status: "completed",
                        grade,
                        feedback,
                        completedAt: new Date(),
                    },
                }
            );

        return NextResponse.json({ grade, feedback });
    } catch (error) {
        console.error("Complete interview error:", error);
        return NextResponse.json(
            { error: "Failed to complete interview" },
            { status: 500 }
        );
    }
}
```

### 5. Grading System

```typescript
// Grading Criteria (weighted):
interface GradingCriteria {
    clarity: number; // 25% - How clear and articulate
    relevance: number; // 25% - How well answers match questions
    depth: number; // 20% - Level of detail provided
    examples: number; // 15% - Use of specific examples
    confidence: number; // 15% - Tone and delivery
}

// Implementation in /app/api/interview/[id]/complete/route.ts
// Analyze all messages with Gemini
// Generate score for each criterion
// Calculate weighted average
// Provide specific feedback for improvement
```

### 6. Interview History & Review

```typescript
// /app/(dashboard)/history/page.tsx
import { getSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS, InterviewDocument } from "@/lib/db/collections";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const db = await getDB();

    // Fetch user's interviews
    const interviews = await db.collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .find({ userId: session.email })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

    return (
        // Display list of past interviews
        // Show: Date, Job Title, Company, Grade, Status
        // Click to view detailed transcript
    );
}

// /app/(dashboard)/history/[id]/page.tsx
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS, InterviewDocument, MessageDocument } from "@/lib/db/collections";
import { redirect, notFound } from "next/navigation";

export default async function InterviewDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const db = await getDB();

    // Fetch interview details
    const interview = await db.collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .findOne({
            _id: new ObjectId(params.id),
            userId: session.email // Ensure user owns this interview
        });

    if (!interview) notFound();

    // Fetch all messages
    const messages = await db.collection<MessageDocument>(COLLECTIONS.MESSAGES)
        .find({ interviewId: params.id })
        .sort({ timestamp: 1 })
        .toArray();

    return (
        // Show full conversation transcript
        // Display grade and detailed feedback
        // Audio playback for each message (optional)
        // Share or export functionality
    );
}
```

## Database Utility Functions

```typescript
// /lib/db/utils.ts
import {
    getDB,
    COLLECTIONS,
    InterviewDocument,
    MessageDocument,
} from "@/lib/db/collections";

export async function getUserInterviews(email: string, limit: number = 10) {
    const db = await getDB();
    return await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .find({ userId: email })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

export async function getInterviewWithMessages(
    interviewId: string,
    userEmail: string
) {
    const db = await getDB();
    const { ObjectId } = await import("mongodb");

    const interview = await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .findOne({
            _id: new ObjectId(interviewId),
            userId: userEmail,
        });

    if (!interview) return null;

    const messages = await db
        .collection<MessageDocument>(COLLECTIONS.MESSAGES)
        .find({ interviewId })
        .sort({ timestamp: 1 })
        .toArray();

    return { interview, messages };
}

export async function getUserStats(email: string) {
    const db = await getDB();

    const stats = await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .aggregate([
            { $match: { userId: email, status: "completed" } },
            {
                $group: {
                    _id: null,
                    totalInterviews: { $sum: 1 },
                    averageGrade: { $avg: "$grade" },
                    highestGrade: { $max: "$grade" },
                    lowestGrade: { $min: "$grade" },
                },
            },
        ])
        .toArray();

    return (
        stats[0] || {
            totalInterviews: 0,
            averageGrade: 0,
            highestGrade: 0,
            lowestGrade: 0,
        }
    );
}
```

## Environment Variables

```env
# .env.local
MONGO_CONNECTION_STRING="mongodb+srv://..."
RESEND_API_KEY="re_..."
GEMINI_API_KEY="..."

# Session
SECRET_KEY="..." # Random 32+ character string for JWT signing

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## UI/UX Requirements

### Design System

-   Use shadcn/ui default theme
-   Responsive design (mobile-first)
-   Dark mode support (optional for MVP)

### Key Pages

#### Login Page

-   Clean, centered form
-   Email input field
-   "Send OTP" button
-   Link to privacy policy (placeholder)

#### OTP Verification

-   6 input boxes for OTP digits
-   Auto-advance on input
-   Resend OTP option (with cooldown)
-   Countdown timer showing expiration

#### Dashboard

-   Welcome message with user email
-   "Start New Interview" prominent CTA
-   Recent interviews list (last 5)
-   Quick stats (total interviews, average grade)

#### Interview Setup

-   Clean form layout
-   Help text for each field
-   Examples for job descriptions
-   Clear "Start Interview" CTA

#### Interview Session

-   Minimal UI during interview
-   Large, clear recording indicator
-   Question counter (e.g., "Question 3 of 5")
-   "End Interview Early" option
-   NO transcript shown during interview

#### Interview Review

-   Performance score prominently displayed
-   Color-coded grade (red/yellow/green)
-   Detailed feedback section
-   Full transcript with timestamps
-   "Try Another Interview" CTA

## Error Handling

### Client-Side

-   Toast notifications for errors
-   Retry logic for failed API calls
-   Graceful degradation for unsupported browsers
-   Clear error messages for user actions

### Server-Side

-   Comprehensive try-catch blocks
-   Proper HTTP status codes
-   Detailed error logging
-   Rate limiting on API routes
-   Input validation on all endpoints

## Performance Optimizations

1. **Audio Preloading**: Load next question while user speaks
2. **Caching**: Cache common interview questions
3. **Database Indexes**: Add indexes on userId, interviewId
4. **API Route Optimization**: Use streaming for audio responses
5. **Client Bundles**: Lazy load heavy components

## Testing Requirements

### Unit Tests (Optional for MVP)

-   Authentication flow
-   Audio recording utilities
-   Grading algorithm

### Manual Testing Checklist

-   [ ] Complete authentication flow
-   [ ] Create interview with all field combinations
-   [ ] Complete full interview (max questions)
-   [ ] Early interview termination
-   [ ] Audio recording on different devices
-   [ ] Review past interviews
-   [ ] Error scenarios (network issues, etc.)

## Deployment Instructions

1. Set up MongoDB Atlas cluster (or self-hosted MongoDB)
2. Configure environment variables:
    - `MONGO_CONNECTION_STRING`
    - `SECRET_KEY` (generate secure random string)
    - `RESEND_API_KEY`
    - `GEMINI_API_KEY`
3. Initialize database indexes on first deployment:
    ```typescript
    // Run once in deployment script or app initialization
    import { createIndexes } from "@/lib/db/collections";
    await createIndexes();
    ```
4. Build application: `npm run build`
5. Deploy to Vercel or similar platform
6. Configure custom domain (optional)
7. Set up monitoring (optional)
8. Verify MongoDB connection from deployment environment

## MVP Limitations & Future Enhancements

### Current Limitations (Acceptable for MVP)

-   No video recording
-   No real-time transcript during interview
-   No interview scheduling
-   No practice question bank
-   No social features
-   Single language (English only)

### Potential Future Features

-   Video recording and analysis
-   Real-time transcription display
-   Interview scheduling/calendar integration
-   Industry-specific question banks
-   Peer review system
-   Analytics dashboard
-   Multiple language support
-   Resume parsing for tailored questions
-   Integration with job boards

## Success Criteria

The MVP is considered complete when:

1. Users can successfully authenticate via email OTP
2. Users can set up and complete voice interviews
3. Audio recording and playback work reliably
4. AI generates relevant interview questions
5. Conversations are saved and retrievable
6. Grading system provides meaningful scores
7. Application is deployed and accessible online

## Protected Route Examples

```typescript
// Example of a protected API route
// /app/api/protected-route/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Route logic here
    return NextResponse.json({
        user: session.email,
        // ... other data
    });
}

// Example of a protected page component
// /app/(dashboard)/protected-page/page.tsx
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <div>
            <h1>Welcome, {session.email}</h1>
            {/* Page content */}
        </div>
    );
}
```

## Additional Notes for AI Implementation

-   Focus on core functionality first
-   Use shadcn/ui components wherever possible
-   Keep the UI simple and clean
-   Ensure mobile responsiveness
-   Add proper loading states for all async operations
-   Include helpful error messages
-   Comment complex logic for future maintenance
-   Use TypeScript strictly (no 'any' types)
-   Follow Next.js best practices (App Router patterns)

### MongoDB Best Practices

-   Always use connection pooling (already configured in client.ts)
-   Create proper indexes for frequently queried fields
-   Use MongoDB transactions for operations that need atomicity
-   Implement proper error handling for database operations
-   Use projection to limit returned fields when possible
-   Consider TTL indexes for temporary data (like OTPs)
-   Validate data before inserting into collections
-   Use aggregation pipelines for complex queries

### Security Considerations

-   JWT tokens are stateless - ensure SECRET_KEY is secure
-   Implement rate limiting on authentication endpoints
-   Validate and sanitize all user inputs
-   Use HTTPS in production
-   Set secure cookie flags in production
-   Implement CSRF protection if needed
-   Monitor for suspicious authentication patterns
