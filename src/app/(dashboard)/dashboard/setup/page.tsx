import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { InterviewSetup } from "@/components/interview/InterviewSetup";

export default async function SetupPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
            <InterviewSetup />
        </div>
    );
}
