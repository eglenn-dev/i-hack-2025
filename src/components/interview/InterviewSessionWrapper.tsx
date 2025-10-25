"use client";

import { useEffect, useState } from "react";
import { InterviewSession } from "./InterviewSession";
import { InterviewDocument } from "@/lib/db/collections";
import { Loader2 } from "lucide-react";

interface InterviewSessionWrapperProps {
    interview: InterviewDocument & { _id: string };
}

export function InterviewSessionWrapper({ interview }: InterviewSessionWrapperProps) {
    const [firstQuestion, setFirstQuestion] = useState<string>("");
    const [firstQuestionAudio, setFirstQuestionAudio] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Retrieve the first question and audio from sessionStorage
        const storedData = sessionStorage.getItem(`interview_${interview._id}_audio`);

        if (storedData) {
            try {
                const { text, audio } = JSON.parse(storedData);
                setFirstQuestion(text);
                setFirstQuestionAudio(audio);
                // Clean up after retrieving
                sessionStorage.removeItem(`interview_${interview._id}_audio`);
            } catch (error) {
                console.error("Error parsing stored audio data:", error);
            }
        }

        setIsLoading(false);
    }, [interview._id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <InterviewSession
            interview={interview}
            firstQuestion={firstQuestion || "Let's begin the interview!"}
            firstQuestionAudio={firstQuestionAudio}
        />
    );
}
