"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface OTPVerificationProps {
    email: string;
}

export function OTPVerification({ email }: OTPVerificationProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(600); // 10 minutes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
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
                body: JSON.stringify({ email, otp: otpCode }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Login successful!");
                router.push("/dashboard");
            } else {
                toast.error(data.error || "Invalid OTP");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
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
                setOtp(["", "", "", "", "", ""]);
            } else {
                toast.error("Failed to resend OTP");
            }
        } catch (error) {
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
                    <div className="flex gap-2 justify-center">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading}
                                className="w-12 h-12 text-center text-lg"
                            />
                        ))}
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        {countdown > 0 ? (
                            <p>
                                Code expires in {minutes}:{seconds.toString().padStart(2, "0")}
                            </p>
                        ) : (
                            <p className="text-destructive">Code expired</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading || countdown === 0}>
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
