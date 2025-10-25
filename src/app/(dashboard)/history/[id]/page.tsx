import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import {
    getDB,
    COLLECTIONS,
    InterviewDocument,
    MessageDocument,
} from "@/lib/db/collections";
import { ObjectId } from "mongodb";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default async function InterviewDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id } = await params;
    const db = await getDB();

    // Fetch interview details
    const interview = await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .findOne({
            _id: new ObjectId(id),
            userId: session.email,
        });

    if (!interview) notFound();

    // Fetch all messages
    const messages = await db
        .collection<MessageDocument>(COLLECTIONS.MESSAGES)
        .find({ interviewId: id })
        .sort({ timestamp: 1 })
        .toArray();

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Interview Details
                    </h1>
                    <div className="flex gap-2">
                        <Link href="/history">
                            <Button variant="outline">Back to History</Button>
                        </Link>
                        <Link href="/dashboard/setup">
                            <Button>New Interview</Button>
                        </Link>
                    </div>
                </div>

                {/* Interview Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{interview.jobTitle}</CardTitle>
                        <CardDescription>
                            {interview.company} • {interview.location}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Date
                                </p>
                                <p className="font-medium">
                                    {new Date(
                                        interview.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Questions
                                </p>
                                <p className="font-medium">
                                    {interview.maxQuestions}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Status
                                </p>
                                <p className="font-medium capitalize">
                                    {interview.status === "completed"
                                        ? "Completed"
                                        : interview.status === "ended_early"
                                          ? "Ended Early"
                                          : "In Progress"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Grade
                                </p>
                                {interview.grade ? (
                                    <p
                                        className={`text-2xl font-bold ${
                                            interview.grade >= 80
                                                ? "text-green-600"
                                                : interview.grade >= 60
                                                  ? "text-yellow-600"
                                                  : "text-red-600"
                                        }`}
                                    >
                                        {interview.grade}/100
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                        Grading in progress...
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {interview.feedback ? (
                            <ReactMarkdown>
                                    {interview.feedback}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                Feedback will be available once grading is
                                complete. Please refresh the page in a moment.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Transcript */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Transcript</CardTitle>
                        <CardDescription>
                            Full conversation history
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
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
                                            {message.role === "assistant"
                                                ? "Interviewer"
                                                : "You"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(
                                                message.timestamp
                                            ).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {message.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
