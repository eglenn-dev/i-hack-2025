import { NextRequest, NextResponse, after } from "next/server";
import { Resend } from "resend";
import { getDB, COLLECTIONS } from "@/lib/db/collections";
import { createSession } from "@/lib/auth/session";
import { UserDocument, OTPDocument } from "@/lib/db/collections";
import WelcomeEmail from "@/react-email/emails/welcome-email";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const updateResult = await db
            .collection<UserDocument>(COLLECTIONS.USERS)
            .updateOne(
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

        // Check if this is a new user
        const isNewUser = updateResult.upsertedCount > 0;

        // Fetch user data to get name
        const user = await db
            .collection<UserDocument>(COLLECTIONS.USERS)
            .findOne({ email });

        // Create JWT session with user data (photo not stored in session to avoid header size issues)
        await createSession(email, user?.name);

        // Send welcome email to new users
        after(async () => {
            if (isNewUser) {
                // Send welcome email
                await resend.emails.send({
                    from: "Olin <welcome@hi.olin.help>",
                    to: email,
                    subject: "Welcome to Olin - Your AI Interview Coach",
                    react: WelcomeEmail({ userName: email.split("@")[0] }),
                    scheduledAt: "2 minutes",
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}
