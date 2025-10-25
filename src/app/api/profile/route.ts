import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS } from "@/lib/db/collections";

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await getDB();
    const user = await db
      .collection(COLLECTIONS.USERS)
      .findOne({ email: session.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: user.email,
      name: user.name || "",
      profilePhoto: user.profilePhoto || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, profilePhoto } = body;

    // Validate inputs
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { error: "Name must be a string" },
        { status: 400 }
      );
    }

    if (profilePhoto !== undefined && typeof profilePhoto !== "string") {
      return NextResponse.json(
        { error: "Profile photo must be a base64 string" },
        { status: 400 }
      );
    }

    // Validate base64 image if provided
    if (profilePhoto && profilePhoto.length > 0) {
      // Check if it's a valid data URL
      if (!profilePhoto.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Profile photo must be a valid base64 image data URL" },
          { status: 400 }
        );
      }

      // Check size (limit to 5MB base64 string)
      if (profilePhoto.length > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Profile photo is too large (max 5MB)" },
          { status: 400 }
        );
      }
    }

    const db = await getDB();
    const updateData: { name?: string; profilePhoto?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name;
    }

    if (profilePhoto !== undefined) {
      updateData.profilePhoto = profilePhoto;
    }

    const result = await db
      .collection(COLLECTIONS.USERS)
      .updateOne(
        { email: session.email },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch updated user data
    const updatedUser = await db
      .collection(COLLECTIONS.USERS)
      .findOne({ email: session.email });

    // Update session with new name (photo not stored in session to avoid header size issues)
    await createSession(
      session.email,
      updatedUser?.name || session.email.split("@")[0]
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        email: updatedUser?.email,
        name: updatedUser?.name || "",
        profilePhoto: updatedUser?.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
