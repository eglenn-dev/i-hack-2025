"use client";

import { useState, useRef, useEffect } from "react";
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
import { EndConversationModal } from "./end-conversation-modal";

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
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const router = useRouter();

  // Use ref to avoid stale closure in onListeningChange
  const currentAnswerRef = useRef("");
  // Ref for auto-scrolling to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false); // Prevent duplicate submissions

  // Keep ref in sync with state for both speech and text modes
  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
  } = useSpeech({
    onTranscript: (transcript) => {
      currentAnswerRef.current = transcript;
      setCurrentAnswer(transcript);
    },
    onListeningChange: (listening) => {
      setBlobState(listening ? "listening" : "idle");
      // Auto-submit when user stops listening in speech mode
      if (
        !listening &&
        currentAnswerRef.current.trim() &&
        interview.mode === "speech" &&
        !isSubmittingRef.current
      ) {
        console.log("Auto-submitting:", currentAnswerRef.current);
        isSubmittingRef.current = true; // Prevent duplicate submissions
        handleSubmitAnswer();
      }
    },
  });

  const playAudio = async (fileName: string) => {
    setTimeout(() => {
      const audio = new Audio(fileName);
      audio.play();
    }, 2000);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswerRef.current.trim()) {
      toast.error("Please provide an answer");
      isSubmittingRef.current = false;
      return;
    }

    setIsLoading(true);
    setBlobState("thinking");
    if (questionCount < interview.maxQuestions && interview.mode === "speech") {
      playAudio("/audio/fillers/filler.mp4");
    }

    try {
      // Use the ref value which is always current
      const answerContent = currentAnswerRef.current;

      // Add user message to the conversation
      const userMessage: Message = {
        role: "user",
        content: answerContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setCurrentAnswer("");
      currentAnswerRef.current = "";

      // Send answer to API and get next question
      const response = await fetch(`/api/interview/${interview._id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: answerContent,
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
      isSubmittingRef.current = false; // Reset flag after submission completes
    }
  };

  const handleEndEarly = async () => {
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
              <Button className='px-1.5'variant="outline" size="sm" onClick={() => setInterviewModalOpen(true)}>
                End Interview
              </Button>
              <EndConversationModal
                open={interviewModalOpen}
                onOpenChange={setInterviewModalOpen}
                onConfirm={handleEndEarly}
                conversationType="interview"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Animated Blob - Only show in speech mode */}
      {interview.mode === "speech" && (
        <div className="flex flex-col items-center gap-6 py-8">
          <AnimatedBlob state={blobState} audioLevel={audioLevel} />
          {isSupported && (
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className={`rounded-full w-20 h-20 p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow ${
                isListening ? "animate-pulse" : ""
              }`}
              title={isListening ? "Stop Listening" : "Start Speaking"}
            >
              {isListening ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Conversation - Show messages in text mode only, audio in speech mode */}
      {interview.mode === "text" && (
        <Card>
          <CardContent className="pt-6">
            {/* Messages display for text mode */}
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
                  </div>
                  <p className="text-gray-900 dark:text-gray-100">
                    {message.content}
                  </p>
                </div>
              ))}
              {isLoading && (
                <p className="text-gray-500 italic animate-pulse">
                  Thinking...
                </p>
              )}
              {/* Scroll target */}
              <div ref={messagesEndRef} />
            </div>

            {/* Answer Input - Only show in text mode */}
            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isLoading}
                className="min-h-[120px]"
                onKeyDown={(e) => {
                  if (e.shiftKey) return;
                  if (e.key === "Enter") {
                    handleSubmitAnswer();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !currentAnswer.trim()}
                >
                  {isLoading ? "Submitting..." : "Submit Answer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speech Mode - Audio only */}
      {interview.mode === "speech" && (
        <div className="flex justify-center py-8">
          {messages.length > 0 &&
            messages[messages.length - 1].role === "assistant" &&
            messages[messages.length - 1].audioBase64 && (
              <AudioPlayer
                audioBase64={messages[messages.length - 1].audioBase64!}
                autoPlay={true}
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
      )}
    </div>
  );
}
