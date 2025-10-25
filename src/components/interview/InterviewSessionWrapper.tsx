"use client";

import { useState } from "react";
import { InterviewSession } from "./InterviewSession";
import { InterviewDocument } from "@/lib/db/collections";

interface InterviewSessionWrapperProps {
  interview: InterviewDocument & { _id: string };
}

interface QuestionData {
  text: string;
  audio: string;
}

function getStoredQuestionData(interviewId: string): QuestionData | null {
  try {
    const storedData = sessionStorage.getItem(`interview_${interviewId}_audio`);
    if (storedData) {
      const data = JSON.parse(storedData);
      // Clean up after retrieving
      sessionStorage.removeItem(`interview_${interviewId}_audio`);
      return data;
    }
  } catch (error) {
    console.error("Error parsing stored audio data:", error);
  }
  return null;
}

export function InterviewSessionWrapper({
  interview,
}: InterviewSessionWrapperProps) {
  const [questionData] = useState<QuestionData | null>(() =>
    getStoredQuestionData(interview._id)
  );

  return (
    <InterviewSession
      interview={interview}
      firstQuestion={questionData?.text || "Let's begin the interview!"}
      firstQuestionAudio={questionData?.audio}
    />
  );
}
