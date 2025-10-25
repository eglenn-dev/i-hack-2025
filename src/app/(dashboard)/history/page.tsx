import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDB, COLLECTIONS, InterviewDocument } from "@/lib/db/collections";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HistoryItem } from "@/components/interview/HistoryItem";

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

  // Serialize the data for Client Component
  const serializedInterviews = interviews.map((interview) => ({
    ...interview,
    _id: interview._id?.toString(),
    createdAt: interview.createdAt?.toISOString(),
    completedAt: interview.completedAt?.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-linear-to-br dark:from-gray-900 dark:to-gray-800 p-8">
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
        {serializedInterviews.length === 0 ? (
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
            {serializedInterviews.map((interview) => (
              <HistoryItem
                key={interview._id}
                interview={interview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
