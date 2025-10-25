"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { InterviewDocument } from "@/lib/db/collections";
import { AudioPlayer } from "./AudioPlayer";
import { AnimatedBlob } from "./animated-blop";
import { useSpeech } from "@/hooks/use-speech";
import { Mic, MicOff } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  audioBase64?: string;
}

interface InterviewSessionProps {
  interview: InterviewDocument & { _id: string };
  firstQuestion: string;
  firstQuestionAudio?: string;
}

export function InterviewSession({
  interview,
  firstQuestion,
  firstQuestionAudio,
}: InterviewSessionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: firstQuestion,
      timestamp: new Date(),
      audioBase64: firstQuestionAudio,
    },
  ]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [blobState, setBlobState] = useState<
    "idle" | "listening" | "speaking" | "thinking"
  >("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const router = useRouter();

  // Debug: Log the interview mode
  console.log("Interview mode:", interview.mode);
  console.log("Mode equals 'speech':", interview.mode === "speech");
  console.log("Mode equals 'text':", interview.mode === "text");
  console.log("Full interview object:", interview);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
  } = useSpeech({
    onTranscript: (transcript) => {
      setCurrentAnswer(transcript);
    },
    onListeningChange: (listening) => {
      setBlobState(listening ? "listening" : "idle");
    },
  });

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setIsLoading(true);
    setBlobState("thinking");

    try {
      // Add user message to the conversation
      const userMessage: Message = {
        role: "user",
        content: currentAnswer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setCurrentAnswer("");

      // Send answer to API and get next question
      const response = await fetch(`/api/interview/${interview._id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: currentAnswer,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.completed) {
          // Interview is complete
          setBlobState("idle");
          toast.success("Interview completed!");
          router.push(`/history/${interview._id}`);
        } else {
          // Add AI's next question
          const aiMessage: Message = {
            role: "assistant",
            content: data.nextQuestion.text,
            timestamp: new Date(),
            audioBase64: data.nextQuestion.audioBase64,
          };
          setMessages((prev) => [...prev, aiMessage]);
          setQuestionCount((prev) => prev + 1);
        }
      } else {
        setBlobState("idle");
        toast.error(data.error || "Failed to submit answer");
      }
    } catch {
      setBlobState("idle");
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndEarly = async () => {
    if (confirm("Are you sure you want to end the interview early?")) {
      try {
        const response = await fetch(
          `/api/interview/${interview._id}/complete`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          toast.success("Interview ended");
          router.push(`/history/${interview._id}`);
        } else {
          toast.error("Failed to end interview");
        }
      } catch {
        toast.error("An error occurred");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{interview.jobTitle}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {interview.company} • {interview.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                Question {questionCount} of {interview.maxQuestions}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndEarly}
                className="text-red-600 hover:text-red-700"
              >
                End Early
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Animated Blob - Only show in speech mode */}
      {interview.mode === "speech" && (
        <div className="flex justify-center py-4">
          <AnimatedBlob state={blobState} audioLevel={audioLevel} />
        </div>
      )}

      {/* Conversation */}
        <Card>
          <CardContent className="pt-6">
            {interview.mode === "text"&& (
            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === "assistant"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold">
                      {message.role === "assistant" ? "Interviewer" : "You"}
                    </p>
                    {message.role === "assistant" && message.audioBase64 && (
                      <AudioPlayer
                        audioBase64={message.audioBase64}
                        autoPlay={index === messages.length - 1}
                        onPlay={() => {
                          setBlobState("speaking");
                          pauseListening();
                        }}
                        onPause={() => {
                          setBlobState("idle");
                          resumeListening();
                        }}
                        onEnded={() => {
                          setBlobState("idle");
                          setAudioLevel(0);
                          resumeListening();
                        }}
                        onAudioLevel={setAudioLevel}
                      />
                    )}
                  </div>
                  <p className="text-gray-900 dark:text-gray-100">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
            )}
          

          {/* Answer Input - Only show in text mode */}
          {interview.mode === "text" && (
            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isLoading}
                className="min-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSubmitAnswer();
                  }
                }}
              />
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">
                    Press Ctrl+Enter to submit
                  </p>
                </div>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !currentAnswer.trim()}
                >
                  {isLoading ? "Submitting..." : "Submit Answer"}
                </Button>
              </div>
            </div>
          )}

          {/* Speech Controls - Only show in speech mode */}
          {interview.mode === "speech" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">
                    Use the microphone to speak
                  </p>
                  {isSupported && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ✓ Voice enabled
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isSupported && (
                    <Button
                      onClick={isListening ? stopListening : startListening}
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      className="gap-2"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Speak
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={isLoading || !currentAnswer.trim()}
                  >
                    {isLoading ? "Submitting..." : "Submit Answer"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
