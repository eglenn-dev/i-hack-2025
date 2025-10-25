import {
    getDB,
    COLLECTIONS,
    InterviewDocument,
    MessageDocument,
} from "./collections";
import { ObjectId } from "mongodb";

export async function getUserInterviews(email: string, limit: number = 10) {
    const db = await getDB();
    return await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .find({ userId: email })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

export async function getInterviewWithMessages(
    interviewId: string,
    userEmail: string
) {
    const db = await getDB();

    const interview = await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .findOne({
            _id: new ObjectId(interviewId),
            userId: userEmail,
        });

    if (!interview) return null;

    const messages = await db
        .collection<MessageDocument>(COLLECTIONS.MESSAGES)
        .find({ interviewId })
        .sort({ timestamp: 1 })
        .toArray();

    return { interview, messages };
}

export async function getUserStats(email: string) {
    const db = await getDB();

    const stats = await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .aggregate([
            { $match: { userId: email, status: "completed" } },
            {
                $group: {
                    _id: null,
                    totalInterviews: { $sum: 1 },
                    averageGrade: { $avg: "$grade" },
                    highestGrade: { $max: "$grade" },
                    lowestGrade: { $min: "$grade" },
                },
            },
        ])
        .toArray();

    return (
        stats[0] || {
            totalInterviews: 0,
            averageGrade: 0,
            highestGrade: 0,
            lowestGrade: 0,
        }
    );
}
