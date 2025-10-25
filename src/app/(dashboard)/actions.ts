"use server";
import { getSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS, type UserDocument } from "@/lib/db/collections";

interface Profile {
    email: string;
    name?: string;
    profilePictureUrl?: string;
}

export async function getProfile(): Promise<Profile | null> {
    const session = await getSession();
    const profilePhoto = await getProfilePhoto();
    if (!session) return null;
    return {
        email: session.email,
        name: session?.name,
        profilePictureUrl: profilePhoto || undefined,
    };
}

export async function getProfilePhoto(): Promise<string | null> {
    const session = await getSession();

    if (!session) return null;

    const db = await getDB();
    const user = await db
        .collection<UserDocument>(COLLECTIONS.USERS)
        .findOne({ email: session.email });

    if (!user || !user.profilePhoto) return null;

    return user.profilePhoto;
}
