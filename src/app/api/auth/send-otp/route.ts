import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDB, COLLECTIONS } from "@/lib/db/collections";
import { OTPDocument } from "@/lib/db/collections";
import OtpEmail from "@/react-email/emails/otp-email";

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
            from: "OTP from Olin <otp@hi.olin.help>",
            to: email,
            subject: "Your One-Time Password",
            react: OtpEmail({ otpCode: otp }),
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
