import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getUserInterviews, getUserStats } from "@/lib/db/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const interviews = await getUserInterviews(session.email, 5);
    const stats = await getUserStats(session.email);

    return (
        <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {session.name}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Ready to practice your interview skills?
                        </p>
                    </div>
                    <form action="/api/auth/logout" method="POST">
                        <Button type="submit" variant="outline">
                            Logout
                        </Button>
                    </form>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Interviews</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalInterviews}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Average Grade</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.averageGrade > 0 ? Math.round(stats.averageGrade) : "-"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Highest Grade</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.highestGrade > 0 ? stats.highestGrade : "-"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Lowest Grade</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.lowestGrade > 0 ? stats.lowestGrade : "-"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Start New Interview */}
                <Card className="bg-gradient-to-r from-blue-500 to--600 border-none text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Start a New Interview</CardTitle>
                        <CardDescription className="text-blue-100">
                            Practice with AI-powered mock interviews
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/setup">
                            <Button size="lg" variant="secondary">
                                Start Interview
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Recent Interviews */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Interviews</CardTitle>
                            <Link href="/history">
                                <Button variant="ghost">View All</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {interviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No interviews yet. Start your first one!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {interviews.map((interview) => (
                                    <Link
                                        key={interview._id?.toString()}
                                        href={`/history/${interview._id?.toString()}`}
                                    >
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {interview.jobTitle}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {interview.company} • {interview.location}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {new Date(interview.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {interview.status === "completed" && interview.grade && (
                                                    <div
                                                        className={`text-2xl font-bold ${
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
                                                            : interview.status === "ended_early"
                                                            ? "bg-red-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    }`}
                                                >
                                                    {interview.status === "completed"
                                                        ? "Completed"
                                                        : interview.status === "ended_early"
                                                        ? "Ended Early"
                                                        : "In Progress"}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
