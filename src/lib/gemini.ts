import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import mime from "mime";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const genAIClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

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

interface WavConversionOptions {
    numChannels: number;
    sampleRate: number;
    bitsPerSample: number;
}

function parseMimeType(mimeType: string): WavConversionOptions {
    const [fileType, ...params] = mimeType.split(";").map((s: string) => s.trim());
    const [, format] = fileType.split("/");

    const options: Partial<WavConversionOptions> = {
        numChannels: 1,
    };

    if (format && format.startsWith("L")) {
        const bits = parseInt(format.slice(1), 10);
        if (!isNaN(bits)) {
            options.bitsPerSample = bits;
        }
    }

    for (const param of params) {
        const [key, value] = param.split("=").map((s: string) => s.trim());
        if (key === "rate") {
            options.sampleRate = parseInt(value, 10);
        }
    }

    return options as WavConversionOptions;
}

function createWavHeader(
    dataLength: number,
    options: WavConversionOptions
): Buffer {
    const { numChannels, sampleRate, bitsPerSample } = options;

    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const buffer = Buffer.alloc(44);

    buffer.write("RIFF", 0); // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
    buffer.write("WAVE", 8); // Format
    buffer.write("fmt ", 12); // Subchunk1ID
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22); // NumChannels
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(byteRate, 28); // ByteRate
    buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
    buffer.write("data", 36); // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

    return buffer;
}

function convertToWav(rawData: string, mimeType: string): Buffer {
    const options = parseMimeType(mimeType);
    const wavHeader = createWavHeader(rawData.length, options);
    const buffer = Buffer.from(rawData, "base64");

    return Buffer.concat([wavHeader, buffer]);
}

export async function textToSpeech(text: string): Promise<string> {
    const config = {
        temperature: 1,
        responseModalities: ["audio"],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: "Umbriel",
                },
            },
        },
    };
    const model = "gemini-2.5-flash-preview-tts";
    const contents = [
        {
            role: "user",
            parts: [
                {
                    text: text,
                },
            ],
        },
    ];

    const response = await genAIClient.models.generateContentStream({
        model,
        config,
        contents,
    });

    let audioBuffer: Buffer | null = null;

    for await (const chunk of response) {
        if (
            !chunk.candidates ||
            !chunk.candidates[0].content ||
            !chunk.candidates[0].content.parts
        ) {
            continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            const inlineData = chunk.candidates[0].content.parts[0].inlineData;
            let fileExtension = mime.getExtension(inlineData.mimeType || "");
            let buffer = Buffer.from(inlineData.data || "", "base64");

            if (!fileExtension) {
                fileExtension = "wav";
                // @ts-expect-error - Buffer type compatibility issue with different ArrayBuffer types
                buffer = convertToWav(
                    inlineData.data || "",
                    inlineData.mimeType || ""
                );
            }

            audioBuffer = buffer;
            break; // We only need the first audio chunk
        }
    }

    if (!audioBuffer) {
        throw new Error("No audio data received from Gemini TTS");
    }

    // Return base64 encoded audio data
    return audioBuffer.toString("base64");
}
