import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS, InterviewDocument, MessageDocument } from "@/lib/db/collections";
import { generateInterviewQuestion, textToSpeech } from "@/lib/gemini";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { jobTitle, company, location, description, maxQuestions } =
            await request.json();

        if (!jobTitle || !company || !location || !maxQuestions) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create interview document
        const db = await getDB();
        const interview: InterviewDocument = {
            userId: session.email,
            jobTitle,
            company,
            location,
            description,
            maxQuestions,
            status: "in_progress",
            createdAt: new Date(),
        };

        const result = await db
            .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
            .insertOne(interview);

        const interviewId = result.insertedId.toString();

        // Generate first question using Gemini
        const firstQuestion = await generateInterviewQuestion(
            jobTitle,
            company,
            description,
            [],
            1,
            maxQuestions
        );

        // Generate TTS audio for the first question
        const audioBase64 = await textToSpeech(firstQuestion);

        // Save the first question as a message
        const firstMessage: MessageDocument = {
            interviewId,
            role: "assistant",
            content: firstQuestion,
            timestamp: new Date(),
        };

        await db
            .collection<MessageDocument>(COLLECTIONS.MESSAGES)
            .insertOne(firstMessage);

        return NextResponse.json({
            interviewId,
            firstQuestion: {
                text: firstQuestion,
                audioBase64: audioBase64,
            },
        });
    } catch (error) {
        console.error("Create interview error:", error);
        return NextResponse.json(
            { error: "Failed to create interview" },
            { status: 500 }
        );
    }
}
