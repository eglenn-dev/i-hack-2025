"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewDocument } from "@/lib/db/collections";
import Link from "next/link";

interface HistoryItemProps {
  interview: InterviewDocument & { _id: string };
}

export function HistoryItem({ interview }: HistoryItemProps) {

  return (
    <Link href={`/history/${interview._id?.toString()}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{interview.jobTitle}</CardTitle>
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
                    : interview.status === "ended_early"
                      ? "bg-red-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {interview.maxQuestions} questions
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
