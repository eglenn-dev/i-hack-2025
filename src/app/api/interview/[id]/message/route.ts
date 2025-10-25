import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth/session";
import { getDB, COLLECTIONS, MessageDocument, InterviewDocument } from "@/lib/db/collections";
import { generateInterviewQuestion, textToSpeech } from "@/lib/gemini";

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
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

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

        // Save user's response
        const userMessage: MessageDocument = {
            interviewId: id,
            role: "user",
            content,
            timestamp: new Date(),
        };

        await db
            .collection<MessageDocument>(COLLECTIONS.MESSAGES)
            .insertOne(userMessage);

        // Get all messages for context
        const messages = await db
            .collection<MessageDocument>(COLLECTIONS.MESSAGES)
            .find({ interviewId: id })
            .sort({ timestamp: 1 })
            .toArray();

        // Check if we've reached max questions
        const questionCount = messages.filter((m) => m.role === "assistant").length;

        if (questionCount >= interview.maxQuestions) {
            // Mark interview as completed
            await db
                .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
                .updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            status: "completed",
                            completedAt: new Date(),
                        },
                    }
                );

            return NextResponse.json({ completed: true });
        }

        // Generate next question
        const nextQuestion = await generateInterviewQuestion(
            interview.jobTitle,
            interview.company,
            interview.description,
            messages.map((m) => ({ role: m.role, content: m.content })),
            questionCount + 1,
            interview.maxQuestions
        );

        // Generate TTS audio for the next question
        const audioBase64 = await textToSpeech(nextQuestion);

        // Save AI's response
        const aiMessage: MessageDocument = {
            interviewId: id,
            role: "assistant",
            content: nextQuestion,
            timestamp: new Date(),
        };

        await db
            .collection<MessageDocument>(COLLECTIONS.MESSAGES)
            .insertOne(aiMessage);

        return NextResponse.json({
            nextQuestion: {
                text: nextQuestion,
                audioBase64: audioBase64,
            },
        });
    } catch (error) {
        console.error("Message error:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}
