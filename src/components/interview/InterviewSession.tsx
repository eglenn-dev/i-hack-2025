"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { InterviewDocument } from "@/lib/db/collections";

interface Message {
    role: "assistant" | "user";
    content: string;
    timestamp: Date;
}

interface InterviewSessionProps {
    interview: InterviewDocument & { _id: string };
    firstQuestion: string;
}

export function InterviewSession({ interview, firstQuestion }: InterviewSessionProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: firstQuestion,
            timestamp: new Date(),
        },
    ]);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    const router = useRouter();

    const handleSubmitAnswer = async () => {
        if (!currentAnswer.trim()) {
            toast.error("Please provide an answer");
            return;
        }

        setIsLoading(true);

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
                    toast.success("Interview completed!");
                    router.push(`/history/${interview._id}`);
                } else {
                    // Add AI's next question
                    const aiMessage: Message = {
                        role: "assistant",
                        content: data.nextQuestion.text,
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, aiMessage]);
                    setQuestionCount((prev) => prev + 1);
                }
            } else {
                toast.error(data.error || "Failed to submit answer");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndEarly = async () => {
        if (confirm("Are you sure you want to end the interview early?")) {
            try {
                const response = await fetch(`/api/interview/${interview._id}/complete`, {
                    method: "POST",
                });

                if (response.ok) {
                    toast.success("Interview ended");
                    router.push(`/history/${interview._id}`);
                } else {
                    toast.error("Failed to end interview");
                }
            } catch (error) {
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

            {/* Conversation */}
            <Card>
                <CardContent className="pt-6">
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
                                <p className="text-sm font-semibold mb-1">
                                    {message.role === "assistant" ? "Interviewer" : "You"}
                                </p>
                                <p className="text-gray-900 dark:text-gray-100">{message.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Answer Input */}
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
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">Press Ctrl+Enter to submit</p>
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
        </div>
    );
}
