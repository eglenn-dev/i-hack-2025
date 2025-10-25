import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateInterviewQuestion(
    jobTitle: string,
    company: string,
    description: string | undefined,
    previousMessages: { role: string; content: string }[],
    questionNumber: number,
    maxQuestions: number
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const conversationHistory = previousMessages
        .map(
            (msg) =>
                `${msg.role === "assistant" ? "AI" : "User"}: ${msg.content}`
        )
        .join("\n");

    const isLastQuestion = questionNumber === maxQuestions;

    const prompt = `You are an experienced technical interviewer conducting a mock interview.

Job Title: ${jobTitle}
Company: ${company}
${description ? `Job Description: ${description}` : ""}

Current Question: ${questionNumber} of ${maxQuestions}

Previous Conversation:
${conversationHistory || "This is the first question."}

Guidelines:
- Ask relevant behavioral and technical questions appropriate for the ${jobTitle} role
- Vary question difficulty progressively
- Follow up on previous answers when appropriate
- Keep questions concise (1-2 sentences)
${
    isLastQuestion
        ? "- This is the LAST question, so end with 'Thank you for the interview'"
        : ""
}
- Do not repeat questions that have already been asked
- Make the question natural and conversational

Generate the next interview question now:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text.trim();
}

export async function gradeInterview(
    messages: { role: string; content: string }[],
    jobTitle: string,
    company: string
): Promise<{ grade: number; feedback: string }> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const conversation = messages
        .map(
            (msg) =>
                `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${
                    msg.content
                }`
        )
        .join("\n\n");

    const prompt = `You are an expert interview evaluator. Analyze this interview transcript and provide a grade and detailed feedback.

Job Title: ${jobTitle}
Company: ${company}

Interview Transcript:
${conversation}

Evaluate the candidate based on these criteria (total 100 points):
1. Clarity (25 points) - How clear and articulate were the responses?
2. Relevance (25 points) - How well did answers match the questions?
3. Depth (20 points) - Level of detail and insight provided
4. Examples (15 points) - Use of specific examples and experiences
5. Confidence (15 points) - Tone and delivery quality

Provide your response in this exact format:
GRADE: [number between 0-100]
FEEDBACK:
[Detailed paragraph analyzing the interview performance, highlighting strengths and areas for improvement. Be specific and constructive.]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the response
    const gradeMatch = text.match(/GRADE:\s*(\d+)/);
    const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]+)/);

    const grade = gradeMatch ? parseInt(gradeMatch[1]) : 70;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : text;

    return {
        grade: Math.min(100, Math.max(0, grade)),
        feedback,
    };
}

export async function textToSpeech(text: string): Promise<string> {
    // For MVP, we'll return a placeholder
    // In production, you would use Gemini's text-to-speech API or another service
    // This is a simplified implementation that returns base64 audio data

    // Note: Gemini API doesn't directly provide TTS in the same way as some other services
    // You might want to use Google Cloud Text-to-Speech API separately
    // For now, we'll return a placeholder that the frontend can handle

    return ""; // Return empty string for now - frontend will handle audio differently
}
