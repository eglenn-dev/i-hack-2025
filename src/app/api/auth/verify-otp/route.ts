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
