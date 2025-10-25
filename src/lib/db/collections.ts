import { ObjectId } from "mongodb";
import clientPromise from "./client";

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
    status: "in_progress" | "completed" | "ended_early";
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
