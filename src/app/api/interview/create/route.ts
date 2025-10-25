import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getDB,
  COLLECTIONS,
  InterviewDocument,
  MessageDocument,
} from "@/lib/db/collections";
import { generateInterviewQuestion, textToSpeech } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobTitle, company, location, description, maxQuestions, mode } =
      await request.json();

    if (!jobTitle || !company || !location || !maxQuestions || !mode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate maxQuestions is between 2 and 5
    if (
      typeof maxQuestions !== "number" ||
      maxQuestions < 2 ||
      maxQuestions > 5
    ) {
      return NextResponse.json(
        { error: "maxQuestions must be between 2 and 5" },
        { status: 400 }
      );
    }

    // Validate mode is either 'speech' or 'text'
    if (mode !== "speech" && mode !== "text") {
      return NextResponse.json(
        { error: "mode must be either 'speech' or 'text'" },
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
      mode,
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

    // Generate TTS audio only for speech mode
    const audioBase64 = mode === "speech" ? await textToSpeech(firstQuestion) : undefined;

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
