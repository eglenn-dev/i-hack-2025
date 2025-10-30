import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
    const session = request.cookies.get("session")?.value;

    // Public routes that don't need authentication
    const isPublicRoute =
        request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/verify") ||
        request.nextUrl.pathname.startsWith("/audio") ||
        request.nextUrl.pathname.startsWith("/api/auth/send-otp") ||
        request.nextUrl.pathname.startsWith("/api/health") ||
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
