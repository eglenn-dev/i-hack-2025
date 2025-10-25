import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth/session";
import {
    getDB,
    COLLECTIONS,
    InterviewDocument,
    MessageDocument,
} from "@/lib/db/collections";
import { gradeInterview } from "@/lib/gemini";
import { after } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const db = await getDB();

        // Verify interview belongs to user
        const interview = await db
            .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
            .findOne({
                _id: new ObjectId(id),
                userId: session.email,
            });

        if (!interview) {
            return NextResponse.json(
                { error: "Interview not found" },
                { status: 404 }
            );
        }

        after(async () => {
            // Get all messages for grading
            const messages = await db
                .collection<MessageDocument>(COLLECTIONS.MESSAGES)
                .find({ interviewId: id })
                .sort({ timestamp: 1 })
                .toArray();

            const userMessageCount = await db
                .collection<MessageDocument>(COLLECTIONS.MESSAGES)
                .countDocuments({ interviewId: id, role: "user" });

            // Generate grade and feedback using Gemini
            const { grade, feedback } = await gradeInterview(
                messages.map((m) => ({ role: m.role, content: m.content })),
                interview.jobTitle,
                interview.company
            );

            // Determine the final status based on whether they completed all questions
            const status = interview.maxQuestions > userMessageCount ? "ended_early" : "completed";

            // Update interview with completion data
            await db
                .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
                .updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            status,
                            grade,
                            feedback,
                            completedAt: new Date(),
                        },
                    }
                );
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Complete interview error:", error);
        return NextResponse.json(
            { error: "Failed to complete interview" },
            { status: 500 }
        );
    }
}
