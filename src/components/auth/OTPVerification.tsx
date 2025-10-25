"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

interface OTPVerificationProps {
    email: string;
}

export function OTPVerification({ email }: OTPVerificationProps) {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(600); // 10 minutes
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error("Please enter the complete OTP");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Login successful!");
                router.push("/dashboard");
            } else {
                toast.error(data.error || "Invalid OTP");
                setOtp("");
            }
        } catch (error) {
            console.log(error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                toast.success("New OTP sent!");
                setCountdown(600);
                setOtp("");
            } else {
                toast.error("Failed to resend OTP");
            }
        } catch (error) {
            console.log(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Verify Your Email</CardTitle>
                <CardDescription>
                    Enter the 6-digit code sent to {email}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={(value) => setOtp(value)}
                            disabled={isLoading}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        {countdown > 0 ? (
                            <p>
                                Code expires in {minutes}:
                                {seconds.toString().padStart(2, "0")}
                            </p>
                        ) : (
                            <p className="text-destructive">Code expired</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || countdown === 0}
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleResend}
                        disabled={isLoading || countdown > 540} // Can resend after 1 minute
                    >
                        Resend OTP
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
