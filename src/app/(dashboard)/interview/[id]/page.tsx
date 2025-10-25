import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getDB, COLLECTIONS, InterviewDocument } from "@/lib/db/collections";
import { ObjectId } from "mongodb";
import { InterviewSessionWrapper } from "@/components/interview/InterviewSessionWrapper";

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
    if (interview.status === "completed" || interview.status === "ended_early") {
        redirect(`/history/${id}`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
            <InterviewSessionWrapper interview={{ ...interview, _id: id }} />
        </div>
    );
}
