import { SignJWT, jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { cookies } from "next/headers";
import { type UserSession } from "@/lib/types";

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
        return payload as unknown as UserSession;
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

export async function createSession(email: string, name?: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const sessionData: UserSession = {
        userId: email, // Using email as userId for simplicity
        email: email,
        name: name || email.split("@")[0], // Use provided name or extract from email
        profilePictureUrl: "", // Not stored in session to avoid header size issues
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
