import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getDB, COLLECTIONS, InterviewDocument, MessageDocument } from "@/lib/db/collections";
import { ObjectId } from "mongodb";
import { InterviewSession } from "@/components/interview/InterviewSession";

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id } = await params;

    const db = await getDB();

    // Fetch interview
    const interview = await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .findOne({
            _id: new ObjectId(id),
            userId: session.email,
        });

    if (!interview) notFound();

    // Redirect if already completed
    if (interview.status === "completed") {
        redirect(`/history/${id}`);
    }

    // Get the first message (question)
    const firstMessage = await db
        .collection<MessageDocument>(COLLECTIONS.MESSAGES)
        .findOne({
            interviewId: id,
            role: "assistant",
        });

    const firstQuestion = firstMessage?.content || "Let's begin the interview!";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <InterviewSession
                interview={{ ...interview, _id: id }}
                firstQuestion={firstQuestion}
            />
        </div>
    );
}
