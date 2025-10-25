import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth/session";
import {
  getDB,
  COLLECTIONS,
  InterviewDocument,
  MessageDocument,
} from "@/lib/db/collections";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid interview ID" },
        { status: 400 }
      );
    }

    const db = await getDB();
    const interviewId = new ObjectId(id);

    // Verify interview belongs to user
    const interview = await db
      .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
      .findOne({
        _id: interviewId,
        userId: session.email,
      });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete all messages related to this interview
    await db
      .collection<MessageDocument>(COLLECTIONS.MESSAGES)
      .deleteMany({ interviewId: id });

    // Delete the interview
    await db
      .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
      .deleteOne({ _id: interviewId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete interview error:", error);
    return NextResponse.json(
      { error: "Failed to delete interview" },
      { status: 500 }
    );
  }
}
