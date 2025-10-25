import { OTPVerification } from "@/components/auth/OTPVerification";
import { redirect } from "next/navigation";

export default async function VerifyPage({
    searchParams,
}: {
    searchParams: Promise<{ email?: string }>;
}) {
    const params = await searchParams;
    const email = params.email;

    if (!email) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
            <OTPVerification email={email} />
        </div>
    );
}
