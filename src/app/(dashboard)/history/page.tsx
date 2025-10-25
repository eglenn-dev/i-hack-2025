import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDB, COLLECTIONS, InterviewDocument } from "@/lib/db/collections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HistoryPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const db = await getDB();

    // Fetch user's interviews
    const interviews = await db
        .collection<InterviewDocument>(COLLECTIONS.INTERVIEWS)
        .find({ userId: session.email })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

    return (
        <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Interview History
                    </h1>
                    <Link href="/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Interviews List */}
                {interviews.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <p className="text-gray-500 text-center text-lg">
                                No interviews yet. Start your first one!
                            </p>
                            <div className="flex justify-center mt-4">
                                <Link href="/dashboard/setup">
                                    <Button>Start Interview</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {interviews.map((interview) => (
                            <Link
                                key={interview._id?.toString()}
                                href={`/history/${interview._id?.toString()}`}
                            >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">
                                                    {interview.jobTitle}
                                                </CardTitle>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {interview.company} • {interview.location}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                    {new Date(interview.createdAt).toLocaleString()}
                                                    {interview.completedAt &&
                                                        ` - Completed: ${new Date(
                                                            interview.completedAt
                                                        ).toLocaleString()}`}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {interview.status === "completed" && interview.grade && (
                                                    <div
                                                        className={`text-3xl font-bold ${
                                                            interview.grade >= 80
                                                                ? "text-green-600"
                                                                : interview.grade >= 60
                                                                ? "text-yellow-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {interview.grade}
                                                    </div>
                                                )}
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        interview.status === "completed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    }`}
                                                >
                                                    {interview.status === "completed"
                                                        ? "Completed"
                                                        : "In Progress"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {interview.maxQuestions} questions
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
