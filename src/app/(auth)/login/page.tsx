import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/landing-page/header";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
            <LoginForm />
        </div>
        </div>
    );
}
